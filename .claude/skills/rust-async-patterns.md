---
name: rust-async-patterns
description: Rust async patterns with Tokio, Axum 0.8+, and Solana client integration. Use when building async Rust backend services, APIs, indexers, or off-chain processing for Solana dApps.
---

# Rust Async Patterns for Solana Services

Production-ready async patterns using Axum 0.8+, Tokio, and Solana clients for building backend services.

## Modern Stack (2026)

- **Axum 0.8+**: Web framework (no more `#[async_trait]` needed!)
- **Tokio 1.40+**: Async runtime
- **Tower**: Middleware (compression, tracing, timeouts)
- **sqlx**: Async database with compile-time checked queries
- **solana-client**: Async Solana RPC client

## Axum 0.8 Server Setup

### Basic Server Pattern
```rust
use axum::{
    Router,
    routing::{get, post},
    extract::{State, Path},
    response::IntoResponse,
    http::StatusCode,
    Json,
};
use tokio::net::TcpListener;
use tower_http::{
    trace::TraceLayer,
    compression::CompressionLayer,
};

#[derive(Clone)]
struct AppState {
    db: sqlx::PgPool,
    solana_client: Arc<RpcClient>,
}

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    // Tracing setup
    tracing_subscriber::fmt::init();

    // Database pool
    let db = sqlx::postgres::PgPoolOptions::new()
        .max_connections(50)
        .connect(&env::var("DATABASE_URL")?)
        .await?;

    // Solana client
    let solana_client = Arc::new(RpcClient::new_with_commitment(
        env::var("SOLANA_RPC_URL")?,
        CommitmentConfig::confirmed(),
    ));

    let state = AppState { db, solana_client };

    // Axum 0.8: New path syntax with {}
    let app = Router::new()
        .route("/health", get(health_check))
        .route("/api/accounts/{pubkey}", get(get_account))
        .route("/api/transactions", post(submit_transaction))
        .layer(TraceLayer::new_for_http())
        .layer(CompressionLayer::new())
        .with_state(state);

    let listener = TcpListener::bind("0.0.0.0:3000").await?;
    tracing::info!("Server listening on {}", listener.local_addr()?);

    axum::serve(listener, app).await?;
    Ok(())
}
```

## Handler Patterns (No #[async_trait] Needed!)

### Modern Handler (Rust 1.75+)
```rust
use axum::extract::{State, Path, Json};
use serde::{Deserialize, Serialize};

// ✅ MODERN - No #[async_trait] macro needed!
async fn get_user(
    State(state): State<AppState>,
    Path(user_id): Path<i64>,
) -> Result<Json<User>, AppError> {
    let user = sqlx::query_as!(
        User,
        "SELECT * FROM users WHERE id = $1",
        user_id
    )
    .fetch_one(&state.db)
    .await?;

    Ok(Json(user))
}

async fn create_user(
    State(state): State<AppState>,
    Json(payload): Json<CreateUserRequest>,
) -> Result<(StatusCode, Json<User>), AppError> {
    let user = sqlx::query_as!(
        User,
        r#"
        INSERT INTO users (name, wallet_address)
        VALUES ($1, $2)
        RETURNING *
        "#,
        payload.name,
        payload.wallet_address,
    )
    .fetch_one(&state.db)
    .await?;

    Ok((StatusCode::CREATED, Json(user)))
}
```

## Error Handling Pattern

### Custom Error Type with IntoResponse
```rust
use axum::{
    response::{IntoResponse, Response},
    http::StatusCode,
    Json,
};
use serde_json::json;

#[derive(Debug)]
pub enum AppError {
    Database(sqlx::Error),
    Solana(solana_client::client_error::ClientError),
    NotFound(String),
    InvalidInput(String),
    Internal(String),
}

// Implement IntoResponse for clean API errors
impl IntoResponse for AppError {
    fn into_response(self) -> Response {
        let (status, message) = match self {
            AppError::Database(e) => {
                tracing::error!("Database error: {:?}", e);
                (StatusCode::INTERNAL_SERVER_ERROR, "Database error".to_string())
            }
            AppError::Solana(e) => {
                tracing::error!("Solana RPC error: {:?}", e);
                (StatusCode::BAD_GATEWAY, "Solana RPC error".to_string())
            }
            AppError::NotFound(msg) => (StatusCode::NOT_FOUND, msg),
            AppError::InvalidInput(msg) => (StatusCode::BAD_REQUEST, msg),
            AppError::Internal(msg) => {
                tracing::error!("Internal error: {}", msg);
                (StatusCode::INTERNAL_SERVER_ERROR, "Internal error".to_string())
            }
        };

        (status, Json(json!({ "error": message }))).into_response()
    }
}

// Automatic error conversions
impl From<sqlx::Error> for AppError {
    fn from(e: sqlx::Error) -> Self {
        AppError::Database(e)
    }
}

impl From<solana_client::client_error::ClientError> for AppError {
    fn from(e: solana_client::client_error::ClientError) -> Self {
        AppError::Solana(e)
    }
}

pub type Result<T> = std::result::Result<T, AppError>;
```

## Solana Client Integration

### Async Solana RPC Calls
```rust
use solana_client::rpc_client::RpcClient;
use solana_sdk::{
    pubkey::Pubkey,
    commitment_config::CommitmentConfig,
};

async fn get_account_data(
    State(state): State<AppState>,
    Path(pubkey): Path<String>,
) -> Result<Json<AccountData>> {
    // Parse pubkey
    let pubkey = pubkey.parse::<Pubkey>()
        .map_err(|_| AppError::InvalidInput("Invalid Solana address".into()))?;

    // Fetch account (blocks async runtime, use spawn_blocking!)
    let solana_client = state.solana_client.clone();
    let account = tokio::task::spawn_blocking(move || {
        solana_client.get_account(&pubkey)
    })
    .await
    .map_err(|e| AppError::Internal(format!("Task join error: {}", e)))?
    .map_err(AppError::Solana)?;

    Ok(Json(AccountData {
        pubkey: pubkey.to_string(),
        lamports: account.lamports,
        owner: account.owner.to_string(),
    }))
}
```

### Anchor Program Client Integration
```rust
use anchor_client::{
    Client,
    Cluster,
    Program,
};
use solana_sdk::signature::Keypair;

async fn call_program_instruction(
    state: &AppState,
    authority: &Keypair,
) -> Result<String> {
    // Setup client (blocking operation!)
    let client = tokio::task::spawn_blocking({
        let authority = authority.insecure_clone();
        move || {
            Client::new_with_options(
                Cluster::Mainnet,
                Rc::new(authority),
                CommitmentConfig::confirmed(),
            )
        }
    }).await.map_err(|e| AppError::Internal(e.to_string()))?;

    let program = client.program(program_id)
        .map_err(|e| AppError::Solana(e))?;

    // Call instruction
    let signature = tokio::task::spawn_blocking(move || {
        program
            .request()
            .accounts(/* ... */)
            .args(/* ... */)
            .send()
    })
    .await
    .map_err(|e| AppError::Internal(e.to_string()))?
    .map_err(AppError::Solana)?;

    Ok(signature.to_string())
}
```

## Avoiding Blocking Operations

### CRITICAL: Don't block the async runtime!

```rust
// ❌ BAD - blocks async runtime
async fn bad_handler() -> Result<String> {
    let content = std::fs::read_to_string("file.txt")?;  // BLOCKING!
    Ok(content)
}

// ✅ GOOD - async file I/O
async fn good_async() -> Result<String> {
    let content = tokio::fs::read_to_string("file.txt").await?;
    Ok(content)
}

// ✅ GOOD - spawn_blocking for CPU-intensive work
async fn good_blocking() -> Result<u64> {
    let result = tokio::task::spawn_blocking(|| {
        expensive_computation()  // CPU-intensive
    }).await?;
    Ok(result)
}
```

### Latency Guidelines
- **<10μs**: Fine in async
- **10-100μs**: Consider async alternatives
- **>100μs**: MUST use `spawn_blocking`

## Database Patterns

### Compile-Time Checked Queries
```rust
use sqlx::{PgPool, FromRow};

#[derive(FromRow, Serialize)]
struct Transaction {
    id: i64,
    signature: String,
    amount: i64,
    created_at: chrono::DateTime<chrono::Utc>,
}

async fn get_recent_transactions(
    State(state): State<AppState>,
    Path(limit): Path<i64>,
) -> Result<Json<Vec<Transaction>>> {
    // sqlx checks this query at compile time!
    let txs = sqlx::query_as!(
        Transaction,
        r#"
        SELECT id, signature, amount, created_at
        FROM transactions
        ORDER BY created_at DESC
        LIMIT $1
        "#,
        limit
    )
    .fetch_all(&state.db)
    .await?;

    Ok(Json(txs))
}
```

### Transaction Pattern
```rust
use sqlx::{Postgres, Transaction as SqlxTransaction};

async fn complex_operation(
    db: &PgPool,
    user_id: i64,
    amount: i64,
) -> Result<()> {
    // Start transaction
    let mut tx: SqlxTransaction<Postgres> = db.begin().await?;

    // Multiple operations atomically
    sqlx::query!(
        "UPDATE accounts SET balance = balance - $1 WHERE user_id = $2",
        amount,
        user_id,
    )
    .execute(&mut *tx)
    .await?;

    sqlx::query!(
        "INSERT INTO transactions (user_id, amount, type) VALUES ($1, $2, $3)",
        user_id,
        amount,
        "withdrawal",
    )
    .execute(&mut *tx)
    .await?;

    // Commit (or automatic rollback on error)
    tx.commit().await?;

    Ok(())
}
```

## WebSocket Pattern

### Real-Time Updates
```rust
use axum::extract::ws::{WebSocket, WebSocketUpgrade};
use futures::{sink::SinkExt, stream::StreamExt};

async fn ws_handler(
    ws: WebSocketUpgrade,
    State(state): State<AppState>,
) -> impl IntoResponse {
    ws.on_upgrade(|socket| handle_socket(socket, state))
}

async fn handle_socket(mut socket: WebSocket, state: AppState) {
    // Subscribe to Solana account updates
    let pubkey = /* ... */;

    loop {
        tokio::select! {
            // Receive from client
            Some(msg) = socket.recv() => {
                match msg {
                    Ok(msg) => {
                        // Handle client message
                    }
                    Err(_) => break,
                }
            }

            // Send Solana updates to client
            Some(update) = get_solana_update(&state, &pubkey) => {
                if let Err(_) = socket.send(update).await {
                    break;
                }
            }
        }
    }
}
```

## Caching Pattern

### Redis Integration
```rust
use redis::AsyncCommands;

async fn get_cached_account(
    redis: &redis::Client,
    pubkey: &Pubkey,
    solana_client: &Arc<RpcClient>,
) -> Result<Account> {
    let key = format!("account:{}", pubkey);

    // Try cache first
    let mut conn = redis.get_async_connection().await
        .map_err(|e| AppError::Internal(format!("Redis: {}", e)))?;

    if let Some(cached): Option<Vec<u8>> = conn.get(&key).await.ok().flatten() {
        return Ok(bincode::deserialize(&cached)?);
    }

    // Fetch from Solana (blocking!)
    let solana_client = solana_client.clone();
    let account = tokio::task::spawn_blocking(move || {
        solana_client.get_account(&pubkey)
    })
    .await??
    .map_err(AppError::Solana)?;

    // Cache for 60 seconds
    let serialized = bincode::serialize(&account)?;
    conn.set_ex(&key, serialized, 60).await.ok();

    Ok(account)
}
```

## Tower Middleware

### Custom Middleware with Tower::Service
```rust
use tower::ServiceBuilder;
use tower_http::{
    trace::TraceLayer,
    compression::CompressionLayer,
    timeout::TimeoutLayer,
};
use std::time::Duration;

let app = Router::new()
    .route("/api/data", get(handler))
    .layer(
        ServiceBuilder::new()
            .layer(TimeoutLayer::new(Duration::from_secs(30)))
            .layer(CompressionLayer::new())
            .layer(TraceLayer::new_for_http())
    )
    .with_state(state);
```

## Testing Patterns

### Integration Tests
```rust
#[cfg(test)]
mod tests {
    use super::*;
    use axum::{
        body::Body,
        http::{Request, StatusCode},
    };
    use tower::ServiceExt;

    #[tokio::test]
    async fn test_get_user() {
        let app = create_test_app().await;

        let response = app
            .oneshot(
                Request::builder()
                    .uri("/api/users/1")
                    .method("GET")
                    .body(Body::empty())
                    .unwrap()
            )
            .await
            .unwrap();

        assert_eq!(response.status(), StatusCode::OK);

        let body = hyper::body::to_bytes(response.into_body())
            .await
            .unwrap();
        let user: User = serde_json::from_slice(&body).unwrap();

        assert_eq!(user.id, 1);
    }
}
```

## Common Patterns

### Transaction Indexer
```rust
async fn index_transactions(
    db: PgPool,
    solana_client: Arc<RpcClient>,
    program_id: Pubkey,
) -> Result<()> {
    let mut last_signature = None;

    loop {
        // Fetch signatures (blocking!)
        let client = solana_client.clone();
        let signatures = tokio::task::spawn_blocking(move || {
            client.get_signatures_for_address_with_config(
                &program_id,
                GetConfirmedSignaturesForAddress2Config {
                    before: last_signature,
                    limit: Some(100),
                    ..Default::default()
                },
            )
        })
        .await??
        .map_err(AppError::Solana)?;

        if signatures.is_empty() {
            tokio::time::sleep(Duration::from_secs(5)).await;
            continue;
        }

        // Process each transaction
        for sig_info in signatures {
            let tx = fetch_and_parse_transaction(&solana_client, &sig_info).await?;
            store_transaction(&db, &tx).await?;
            last_signature = Some(sig_info.signature.parse().unwrap());
        }
    }
}
```

## Best Practices

1. **Never block the runtime**: Use `spawn_blocking` for blocking ops
2. **Use compile-time checked queries**: sqlx query macros
3. **Implement IntoResponse**: Clean error handling
4. **Use Tower middleware**: Compression, tracing, timeouts
5. **Connection pooling**: Database and HTTP clients
6. **Instrument with tracing**: All important operations
7. **Handle cooperative yielding**: Avoid long-running sync code

---

**Sources:**
- [Axum 0.8.0 Release](https://tokio.rs/blog/2025-01-01-announcing-axum-0-8-0)
- [Axum Best Practices 2025](https://www.shuttle.dev/blog/2023/12/06/using-axum-rust)
- [Async Rust Tokio Guide](https://medium.com/@OlegKubrakov/practical-guide-to-async-rust-and-tokio-99e818c11965)
