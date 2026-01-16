# PlaySolana-Unity.SDK Documentation

Complete documentation for the PlaySolana Unity SDK - Software development kit designed to bring seamless compatibility between the PSG1 console and Unity.

Mirrored from [docs](https://developers.playsolana.com/).
---

## Table of Contents

### Getting Started
- [Introduction](#introduction)
- [Features](#features)

### Installation Guide
- [Installation](#installation)
- [Sample Scene](#sample-scene)

### PSG1 Unity Input System
- [Input System](#input-system)
- [PSG1 Keys](#psg1-keys)

### PSG1 Simulator
- [Simulator](#simulator)

### Additional Resources
- [Contributing](#contributing)
- [Support](#support)
- [Links](#links)

---

## Introduction

### Welcome to PlaySolana-Unity.SDK

**Adapt your games to the first-ever gaming console on Solana.**

PlaySolana-Unity.SDK is a software development kit designed to bring seamless compatibility between the [PSG1 console](https://www.playsolana.com/products) and Unity. Whether you're creating new games or porting existing ones, this SDK provides the essential tools to integrate your project with the console's custom input system and device simulator.

### About the PSG1 Console

The **PSG1** is a retro-futuristic handheld console built on the Solana blockchain, featuring:

- **Hardware Specifications**:
  - RK3588S2 SoC (Octa-core ARM CPU)
  - 3.92-inch OLED display (1240×1080 resolution)
  - 8GB RAM
  - 128GB storage
  - Wi-Fi 6 and Bluetooth 5.4

- **Integrated Wallet**:
  - Built-in hardware wallet
  - Fingerprint sensor for secure authentication
  - SvalGuard for hardware-level encryption

- **Operating System**:
  - EchOS (gaming-tuned Android)
  - Unified gaming, wallet, and DeFi experience

- **Pricing**: $329 (USD)

### The PlaySolana SuperHUB Ecosystem

The PSG1 is the physical gateway to the PlaySolana SuperHUB, a vertically integrated ecosystem that unites:

- **Hardware**: PSG1 handheld console
- **Games**: Gaming Library & Launcher with Play Solana: Origins
- **Platforms**: Play<Dex> (missions, rewards, leaderboards) and Play<ID> (identity)
- **Publishing**: Play<Gate> (on-chain game submission and distribution)
- **DeFi**: Integrated staking, swaps, and validator rewards
- **Economy**: $PLAY token for payments, rewards, and governance

---

## Features

The PlaySolana-Unity.SDK includes the following core features:

### 1. Input System

**Custom input device fully compatible with Unity's New Input System**, allowing developers to map and handle inputs from the PSG1 console with ease.

#### Key Features:
- Full integration with Unity's New Input System
- Pre-configured input mappings for PSG1 buttons
- Support for all PSG1 physical controls
- Easy-to-use input action assets
- Seamless input handling for both development and deployment

#### Benefits:
- No need to manually configure complex input mappings
- Consistent input behavior across development and PSG1 hardware
- Simple API for accessing PSG1-specific controls
- Compatible with Unity's Input Action workflow

[Learn more about the Input System →](#input-system)

### 2. PSG1 Simulator

**Develop and test your game efficiently** with a built-in simulator that replicates the console's screen dimensions and input behavior, streamlining the development process.

#### Key Features:
- Accurate screen dimension replication (3.92-inch vertical layout)
- Simulated PSG1 input behavior
- Real-time testing without hardware
- Frame-perfect PSG1 screen visualization
- Development-optimized workflow

#### Benefits:
- Test your game without needing physical PSG1 hardware
- Faster iteration during development
- Visualize exactly how your game will appear on PSG1
- Debug input and display issues before deployment

[Learn more about the PSG1 Simulator →](#simulator)

---

## Installation

Get started with the PlaySolana-Unity.SDK by setting up your development environment and importing the SDK into your Unity project.

### Prerequisites

- **Unity**: Version 2019.4 or later recommended
- **Unity Input System**: Version 1.0.0 or later
- **.NET Runtime**: .NET 4 runtime (not compatible with .NET 3.5)

### Installation Methods

#### Method 1: Unity Asset Store (Recommended)

1. Open the **Package Manager** window:
   - Navigate to `Window > Package Manager`

2. Switch to the **My Assets** tab

3. Locate **PlaySolana-Unity.SDK** in your asset list

4. Click **Download**, then follow the on-screen steps to import the package into your project

5. Once imported, the SDK will be available in your project's `Assets` folder

#### Method 2: Unity Package Manager (Git URL)

*Note: This method may be available in future releases*

1. Open the **Package Manager** window:
   - Navigate to `Window > Package Manager`

2. Click the **+** button in the top-left corner

3. Select **Add package from git URL**

4. Enter the repository URL:
   ```
   https://github.com/playsolana/PlaySolana.Unity-SDK.git
   ```

5. Click **Add**

#### Method 3: Manual Installation

1. Download or clone the repository:
   ```bash
   git clone https://github.com/playsolana/PlaySolana.Unity-SDK.git
   ```

2. Copy the SDK folder into your Unity project's `Assets` directory

3. Unity will automatically import and compile the SDK

### Post-Installation Setup

After installation, you should:

1. **Import Sample Scenes** (if available):
   - In Package Manager, select PlaySolana-Unity.SDK
   - Navigate to the **Samples** tab
   - Click **Import** next to the sample you want

2. **Configure Unity Input System**:
   - Go to `Edit > Project Settings > Player > Other Settings`
   - Under **Active Input Handling**, select:
     - **Input System Package (New)** - Recommended for PSG1 development
     - OR **Both** - If you need to maintain compatibility with old input

3. **Verify Installation**:
   - Check for the PlaySolana SDK namespace in your scripts
   - Look for PSG1 Input Device in Unity's Input System devices

### Troubleshooting

**Issue**: Package doesn't appear after installation
- **Solution**: Restart Unity Editor
- Check that .NET 4 runtime is enabled in Project Settings

**Issue**: Input System conflicts
- **Solution**: Ensure Unity Input System package is installed
- Switch Active Input Handling to "Input System Package (New)" or "Both"

**Issue**: Compilation errors
- **Solution**: Make sure you're using Unity 2019.4 or later
- Verify that all dependencies are installed

---

## Sample Scene

After importing the SDK, explore the included sample scene to understand how to integrate PSG1 features into your games.

### Sample Scene Contents

The PlaySolana Unity SDK sample scene demonstrates:

- PSG1 input handling and button mapping
- PSG1 Simulator integration
- Screen aspect ratio and resolution handling
- Best practices for PSG1 game development

### Accessing the Sample Scene

1. **Import the Sample**:
   - Open Package Manager (`Window > Package Manager`)
   - Select PlaySolana-Unity.SDK
   - Click the **Samples** tab
   - Click **Import** next to "PSG1 Sample Scene"

2. **Open the Scene**:
   - Navigate to: `Assets/Samples/PlaySolana Unity SDK/[version]/PSG1 Sample Scene`
   - Open the scene file in Unity

3. **Test the Scene**:
   - Click **Play** in Unity Editor
   - The PSG1 Simulator window should appear
   - Test input using your keyboard (mapped to PSG1 buttons)

### Sample Scene Features

#### Input Testing
- Press mapped keyboard keys to test PSG1 button inputs
- Observe button press feedback in the UI
- Test directional pad and action buttons

#### Screen Layout
- View the proper PSG1 screen dimensions
- See how UI elements should be positioned
- Understand safe areas for game content

#### Simulator Integration
- See how the PSG1 Simulator frames your game
- Test vertical orientation gameplay
- Visualize actual PSG1 display behavior

### Learning from the Sample

Key concepts demonstrated:

1. **Input Mapping**: How to map Unity Input Actions to PSG1 controls
2. **Screen Setup**: Proper resolution and aspect ratio configuration
3. **UI Layout**: Best practices for PSG1 screen real estate
4. **Simulator Usage**: How to use the built-in testing simulator

### Next Steps

After exploring the sample scene:

- Modify the sample to understand SDK behavior
- Create your own scenes using the PSG1 Input System
- Integrate the PSG1 Simulator into your existing projects
- Review the [Input System documentation](#input-system)

---

## Input System

The PSG1 Input System provides seamless integration with Unity's New Input System, allowing you to easily map and handle inputs from the PSG1 console's physical controls.

### Overview

The PSG1 Input System is built on Unity's New Input System framework, providing:

- Pre-configured input device definitions for PSG1 hardware
- Input action assets for common game controls
- Automatic input binding to PSG1 physical buttons
- Support for both development (keyboard simulation) and deployment (actual PSG1 hardware)

### Unity Input System Requirement

**Important**: The PlaySolana SDK requires Unity's **New Input System** package.

#### Installing Unity Input System

If you haven't already installed it:

1. Open Package Manager (`Window > Package Manager`)
2. Search for "Input System"
3. Click **Install**
4. When prompted, choose to enable the new Input System backends

#### Configuring Input System

Set the active input handling mode:

1. Navigate to `Edit > Project Settings > Player > Other Settings`
2. Find **Active Input Handling**
3. Select:
   - **Input System Package (New)** - Recommended
   - **Both** - If you need old input compatibility

### PSG1 Input Device

The SDK registers a custom PSG1 Input Device with Unity's Input System. This device represents the PSG1 console's physical controls.

#### Accessing the PSG1 Device

```csharp
using PlaySolana.InputSystem;

// Get the PSG1 device
var psg1Device = PSG1Device.current;

if (psg1Device != null)
{
    // Device is available
    Debug.Log("PSG1 device connected");
}
```

### Input Actions

The SDK provides pre-configured Input Actions for PSG1 controls. You can use these directly or create custom mappings.

#### Using Pre-configured Input Actions

```csharp
using UnityEngine;
using UnityEngine.InputSystem;

public class PlayerController : MonoBehaviour
{
    public InputActionAsset inputActions;
    private InputAction moveAction;
    private InputAction jumpAction;

    void Awake()
    {
        // Get action map
        var gameplayMap = inputActions.FindActionMap("Gameplay");
        
        // Get specific actions
        moveAction = gameplayMap.FindAction("Move");
        jumpAction = gameplayMap.FindAction("Jump");
    }

    void OnEnable()
    {
        moveAction.Enable();
        jumpAction.Enable();
        
        // Subscribe to events
        jumpAction.performed += OnJump;
    }

    void OnDisable()
    {
        moveAction.Disable();
        jumpAction.Disable();
        
        jumpAction.performed -= OnJump;
    }

    void Update()
    {
        // Read move input
        Vector2 moveInput = moveAction.ReadValue<Vector2>();
        
        // Apply movement
        transform.Translate(new Vector3(moveInput.x, 0, moveInput.y) * Time.deltaTime);
    }

    void OnJump(InputAction.CallbackContext context)
    {
        Debug.Log("Jump button pressed!");
        // Implement jump logic
    }
}
```

#### Creating Custom Input Actions

1. Create a new Input Actions asset:
   - Right-click in Project window
   - Select `Create > Input Actions`

2. Configure action maps and bindings

3. Assign PSG1 controls to your actions

### Input Binding

The SDK automatically binds keyboard keys to PSG1 buttons during development:

| PSG1 Button | Keyboard Key | Description |
|-------------|--------------|-------------|
| D-Pad Up | Arrow Up / W | Directional pad up |
| D-Pad Down | Arrow Down / S | Directional pad down |
| D-Pad Left | Arrow Left / A | Directional pad left |
| D-Pad Right | Arrow Right / D | Directional pad right |
| A Button | Z / Space | Primary action button |
| B Button | X / Escape | Secondary action button |
| X Button | A | Tertiary action button |
| Y Button | S | Quaternary action button |
| L Button | Q | Left shoulder button |
| R Button | E | Right shoulder button |
| Start Button | Enter / Return | Start/pause button |
| Select Button | Tab | Select/back button |

*Note: Actual button layout may vary. Refer to PSG1 physical controls for final mappings.*

### Development vs. Deployment

#### Development Mode
- Use keyboard for input simulation
- Test in Unity Editor with PSG1 Simulator
- Rapid iteration without hardware

#### Deployment Mode
- Input automatically switches to PSG1 hardware buttons
- No code changes needed
- Seamless transition from development to device

### Best Practices

1. **Use Input Actions**: Always use Unity's Input Action system for flexibility

2. **Test with Simulator**: Use the PSG1 Simulator to verify input behavior before deploying

3. **Handle Input Gracefully**: Always check if input devices are available

4. **Avoid Hardcoding**: Don't hardcode keyboard keys; use rebindable Input Actions

5. **Provide Visual Feedback**: Show button prompts using PSG1 button icons

### Example: Complete Input Setup

```csharp
using UnityEngine;
using UnityEngine.InputSystem;
using PlaySolana.InputSystem;

public class PSG1GameController : MonoBehaviour
{
    [Header("Input")]
    public InputActionAsset inputActions;
    
    private InputAction moveAction;
    private InputAction jumpAction;
    private InputAction attackAction;
    private InputAction pauseAction;

    void Awake()
    {
        // Verify PSG1 device
        if (PSG1Device.current == null)
        {
            Debug.LogWarning("PSG1 device not detected. Using fallback input.");
        }

        // Setup input actions
        var gameplay = inputActions.FindActionMap("Gameplay");
        moveAction = gameplay.FindAction("Move");
        jumpAction = gameplay.FindAction("Jump");
        attackAction = gameplay.FindAction("Attack");
        
        var ui = inputActions.FindActionMap("UI");
        pauseAction = ui.FindAction("Pause");
    }

    void OnEnable()
    {
        // Enable all actions
        inputActions.Enable();
        
        // Subscribe to button events
        jumpAction.performed += HandleJump;
        attackAction.performed += HandleAttack;
        pauseAction.performed += HandlePause;
    }

    void OnDisable()
    {
        // Cleanup
        inputActions.Disable();
        jumpAction.performed -= HandleJump;
        attackAction.performed -= HandleAttack;
        pauseAction.performed -= HandlePause;
    }

    void Update()
    {
        // Continuous input reading
        Vector2 movement = moveAction.ReadValue<Vector2>();
        ProcessMovement(movement);
    }

    void HandleJump(InputAction.CallbackContext context)
    {
        if (context.performed)
        {
            // Jump logic
            Debug.Log("Player jumped!");
        }
    }

    void HandleAttack(InputAction.CallbackContext context)
    {
        if (context.performed)
        {
            // Attack logic
            Debug.Log("Player attacked!");
        }
    }

    void HandlePause(InputAction.CallbackContext context)
    {
        if (context.performed)
        {
            // Pause game
            Debug.Log("Game paused!");
            Time.timeScale = Time.timeScale == 0 ? 1 : 0;
        }
    }

    void ProcessMovement(Vector2 input)
    {
        if (input.magnitude > 0.1f)
        {
            // Movement logic
            transform.Translate(new Vector3(input.x, 0, input.y) * Time.deltaTime * 5f);
        }
    }
}
```

### Troubleshooting

**Issue**: Input not working
- Verify Unity Input System package is installed
- Check that Input Actions are enabled
- Ensure PSG1 device is registered

**Issue**: Keyboard input not simulating PSG1
- Verify you're in development mode
- Check input bindings in Input Action asset
- Restart Unity Editor

**Issue**: Input delayed or unresponsive
- Check for conflicting input systems
- Verify update loop is calling input correctly
- Test with PSG1 Simulator enabled

---

## PSG1 Keys

The PSG1 console features a set of physical buttons designed for intuitive gameplay in a vertical handheld format.

### Physical Layout

The PSG1 control layout is inspired by classic handheld gaming consoles, optimized for one-handed or two-handed play in a vertical orientation.

#### Button Configuration

**Face Buttons** (Right side):
- **A Button**: Primary action (confirm, jump, interact)
- **B Button**: Secondary action (cancel, back, crouch)
- **X Button**: Tertiary action (special move, reload)
- **Y Button**: Quaternary action (alternative action, menu)

**D-Pad** (Left side):
- **Up**: Navigate up, move forward
- **Down**: Navigate down, move backward
- **Left**: Navigate left, move left
- **Right**: Navigate right, move right

**Shoulder Buttons** (Top):
- **L Button**: Left shoulder (camera left, weapon switch)
- **R Button**: Right shoulder (camera right, aim)

**System Buttons**:
- **Start**: Pause, menu access, confirm
- **Select**: Options, back, special functions

### Button Functions by Genre

#### Action/Platformer Games
- **A**: Jump
- **B**: Attack/Shoot
- **X**: Special ability
- **Y**: Dodge/Roll
- **L/R**: Weapon switch
- **D-Pad**: Movement
- **Start**: Pause

#### RPG Games
- **A**: Confirm/Interact
- **B**: Cancel/Back
- **X**: Open menu
- **Y**: Quick item use
- **L/R**: Cycle targets/party members
- **D-Pad**: Movement/Navigation
- **Start**: Main menu

#### Puzzle Games
- **A**: Select/Confirm
- **B**: Cancel/Undo
- **X**: Hint
- **Y**: Reset
- **L/R**: Rotate/Cycle options
- **D-Pad**: Navigate
- **Start**: Pause/Menu

### Input Mapping Reference

When developing for PSG1, use this reference for consistent button mapping:

```csharp
// PSG1 Button enum (conceptual)
public enum PSG1Button
{
    DPadUp,
    DPadDown,
    DPadLeft,
    DPadRight,
    ButtonA,
    ButtonB,
    ButtonX,
    ButtonY,
    ButtonL,
    ButtonR,
    ButtonStart,
    ButtonSelect
}
```

### Keyboard Development Bindings

During development in Unity Editor, these keyboard keys simulate PSG1 buttons:

```
Movement:
- Arrow Keys OR WASD: D-Pad
  - Up Arrow / W: D-Pad Up
  - Down Arrow / S: D-Pad Down
  - Left Arrow / A: D-Pad Left
  - Right Arrow / D: D-Pad Right

Face Buttons:
- Z or Space: A Button
- X or Escape: B Button
- A: X Button
- S: Y Button

Shoulder Buttons:
- Q: L Button
- E: R Button

System:
- Enter/Return: Start Button
- Tab: Select Button
```

### Design Guidelines

When designing games for PSG1:

1. **Button Accessibility**: Ensure frequently used actions are on easily accessible buttons (A and B)

2. **Consistent Mapping**: Follow platform conventions:
   - A = Confirm (across menus and gameplay)
   - B = Cancel/Back
   - Start = Pause

3. **Visual Prompts**: Always show button prompts using PSG1 button icons

4. **Alternative Controls**: Consider alternate control schemes for accessibility

5. **Test Ergonomics**: Test button combinations for comfortable gameplay

### Button Icons

The SDK includes button icon assets for UI display:

```csharp
// Example: Display button prompt
using PlaySolana.UI;

// Show jump prompt
buttonPromptUI.ShowPrompt(PSG1Button.ButtonA, "Jump");

// Show attack prompt
buttonPromptUI.ShowPrompt(PSG1Button.ButtonB, "Attack");
```

### Multi-Button Combinations

PSG1 supports simultaneous button presses:

```csharp
// Example: Check for button combination
if (Input.GetButton("L") && Input.GetButtonDown("A"))
{
    // Trigger special move
    ExecuteSpecialMove();
}
```

### Best Practices

1. **Minimize Complex Combos**: Avoid requiring complex multi-button combinations

2. **Provide Remapping**: Allow players to customize controls if possible

3. **Test on Hardware**: Always test final button layout on actual PSG1 device

4. **Consider Accessibility**: Provide options for players with different abilities

5. **Document Controls**: Include a controls reference in your game's menu

---

## Simulator

The PSG1 Simulator allows you to develop and test your games directly in Unity Editor without needing physical PSG1 hardware.

### Overview

The PSG1 Simulator provides:

- **Accurate screen emulation**: 3.92-inch OLED display simulation
- **Input simulation**: Keyboard-to-PSG1 button mapping
- **Resolution handling**: Correct aspect ratio (1240×1080)
- **Visual framing**: See your game exactly as it will appear on PSG1
- **Performance testing**: Approximate PSG1 device performance

### Enabling the Simulator

#### Automatic Setup

The simulator is automatically enabled when you have the PlaySolana Unity SDK installed in your project.

#### Manual Setup

1. **Add Simulator Component** to your scene:
   ```
   GameObject > Create Empty
   Add Component > PSG1 Simulator
   ```

2. **Configure Simulator Settings**:
   - Open the PSG1 Simulator component in Inspector
   - Adjust display scale if needed
   - Enable/disable frame visualization

### Simulator Window

When you enter Play Mode in Unity Editor with the simulator enabled:

1. A **PSG1 Simulator window** appears
2. Your game view is framed within a PSG1 device mockup
3. The display area matches PSG1's actual screen dimensions
4. Input is automatically mapped from keyboard to PSG1 buttons

### Simulator Features

#### Visual Frame

The simulator displays a visual frame around your game that represents:
- PSG1 physical device outline
- Screen bezel
- Button layout reference
- Correct proportions and scale

#### Resolution Simulation

The simulator enforces PSG1's native resolution:
- **Display**: 3.92 inches diagonal
- **Resolution**: 1240×1080 pixels
- **Aspect Ratio**: Vertical orientation (~1.15:1)
- **Pixel Density**: Simulated OLED quality

#### Input Simulation

Keyboard input is automatically mapped to PSG1 controls. See [PSG1 Keys](#psg1-keys) for the complete mapping.

### Using the Simulator

#### Basic Usage

1. **Open your scene** in Unity

2. **Enter Play Mode** (press Play button or F5)

3. **PSG1 Simulator window opens** automatically

4. **Use keyboard** to simulate PSG1 button input:
   - WASD or Arrow Keys: D-Pad
   - Z/Space: A Button
   - X/Escape: B Button
   - Q/E: L/R Buttons
   - Enter: Start
   - Tab: Select

5. **Test your game** as it would appear on PSG1

#### Testing Scenarios

**Screen Layout Testing**:
- Verify UI elements are within safe area
- Check text readability at PSG1 resolution
- Test menu navigation

**Input Testing**:
- Verify all button inputs work correctly
- Test button combinations
- Check input responsiveness

**Performance Testing**:
- Monitor frame rate
- Check for rendering issues
- Test loading times

### Simulator Configuration

```csharp
using PlaySolana.Simulator;

public class SimulatorConfig : MonoBehaviour
{
    void Start()
    {
        // Get simulator settings
        var simulator = PSG1Simulator.Instance;
        
        // Configure display scale
        simulator.SetDisplayScale(1.0f);
        
        // Enable/disable frame
        simulator.ShowDeviceFrame(true);
        
        // Set performance mode
        simulator.SetPerformanceMode(PerformanceMode.Accurate);
    }
}
```

### Simulator Settings

**Display Settings**:
- **Scale**: Adjust simulator window size (default: 1.0x)
- **Frame**: Show/hide PSG1 device frame
- **Resolution**: Lock to PSG1 native resolution

**Input Settings**:
- **Keyboard Mapping**: Enable/disable keyboard simulation
- **Custom Bindings**: Configure custom key mappings
- **Deadzone**: Adjust input deadzone settings

**Performance Settings**:
- **Target Frame Rate**: Limit to PSG1's typical frame rate
- **Performance Mode**: 
  - **Accurate**: Simulate PSG1 performance limitations
  - **Unlimited**: No performance restrictions

### Design Considerations

When using the simulator for development:

1. **Safe Area**: Keep important UI elements away from screen edges
   - Top: 40 pixels
   - Bottom: 60 pixels
   - Sides: 30 pixels each

2. **Text Size**: Ensure text is readable at 3.92" display size
   - Minimum font size: 24-28 pts
   - Prefer bold or semi-bold fonts

3. **Button Prompts**: Use large, clear button icons

4. **Colors**: Test for OLED display characteristics
   - High contrast for readability
   - Avoid pure white for extended periods (OLED burn-in)

### Limitations

The simulator has some limitations compared to real hardware:

- **Performance**: May not perfectly match PSG1's actual performance
- **Touch Input**: Does not simulate touchscreen (if PSG1 has touch capabilities)
- **Hardware Features**: Cannot simulate hardware wallet, fingerprint sensor
- **Network**: Network conditions may differ from PSG1's actual connectivity

### Testing Workflow

**Recommended Development Workflow**:

1. **Initial Development**: Use simulator for rapid iteration
2. **Regular Testing**: Test on simulator frequently during development
3. **Pre-Deployment Testing**: Test on actual PSG1 hardware before release
4. **Final Verification**: Always verify on real hardware before shipping

### Troubleshooting

**Issue**: Simulator window doesn't appear
- **Solution**: Check that PSG1Simulator component is in scene
- Restart Unity Editor

**Issue**: Incorrect resolution
- **Solution**: Verify Game window is not overriding resolution
- Check simulator display settings

**Issue**: Input not working
- **Solution**: Ensure Input System is enabled
- Verify keyboard bindings in Input Actions

**Issue**: Performance is too fast/slow
- **Solution**: Adjust performance mode in simulator settings
- Check target frame rate configuration

---

## Contributing

We welcome contributions from the entire Solana community!

### How to Contribute

The PlaySolana Unity SDK is an open-source project. We encourage contributions including:

- Bug fixes
- Feature enhancements
- Documentation improvements
- Sample scenes and examples
- Testing and feedback

### Getting Started

1. **Fork the repository** on GitHub:
   - Visit: [https://github.com/playsolana/PlaySolana.Unity-SDK](https://github.com/playsolana/PlaySolana.Unity-SDK)
   - Click "Fork"

2. **Clone your fork**:
   ```bash
   git clone https://github.com/YOUR_USERNAME/PlaySolana.Unity-SDK.git
   ```

3. **Create a branch** for your changes:
   ```bash
   git checkout -b feature/your-feature-name
   ```

4. **Make your changes** and commit:
   ```bash
   git add .
   git commit -m "Description of your changes"
   ```

5. **Push to your fork**:
   ```bash
   git push origin feature/your-feature-name
   ```

6. **Create a Pull Request** on GitHub

### Contribution Guidelines

- Follow Unity C# coding conventions
- Include clear commit messages
- Test your changes thoroughly
- Update documentation when adding features
- Be respectful and constructive in discussions

### SDKs for Other Engines

We're interested in expanding PlaySolana SDK support to other game engines!

If you're interested in developing PlaySolana SDKs for:
- **Unreal Engine**
- **Godot**
- **GameMaker**
- **Other engines**

Please contact us! We'd love to collaborate with community developers.

### Reporting Issues

Found a bug or have a feature request?

1. Check existing issues on [GitHub Issues](https://github.com/playsolana/PlaySolana.Unity-SDK/issues)
2. Create a new issue with:
   - Clear description
   - Steps to reproduce (for bugs)
   - Expected vs actual behavior
   - Unity version and SDK version

---

## Support

### Documentation

- **Official Docs**: [https://developers.playsolana.com](https://developers.playsolana.com)
- **GitHub Repository**: [https://github.com/playsolana/PlaySolana.Unity-SDK](https://github.com/playsolana/PlaySolana.Unity-SDK)

### Community

- **Discord**: [Join PlaySolana Discord](https://discord.com/invite/playsolanaofficial)
- **Telegram**: [Join PlaySolana Telegram](https://t.me/playsolanaofficial)
- **X (Twitter)**: [@playsolana](https://www.x.com/playsolana)
- **Instagram**: [@play.solana](https://www.instagram.com/play.solana/)

### Getting Help

1. **Check the documentation** first
2. **Search existing issues** on GitHub
3. **Ask in Discord** for community support
4. **Create a GitHub issue** for bugs or feature requests

### Developer Resources

- **Play<Gate>**: Submit your game for PSG1 distribution
  - [https://playgate.playsolana.com](https://playgate.playsolana.com)

- **Play<Dex>**: Explore quests, missions, and rewards
  - [https://playsolana.com/playdex](https://playsolana.com/playdex)

- **PSG1 Console**: Pre-order the PSG1 device
  - [https://www.playsolana.com/products](https://www.playsolana.com/products)

---

## Links

### Official Links

- **Main Website**: [https://www.playsolana.com](https://www.playsolana.com)
- **Developer Portal**: [https://developers.playsolana.com](https://developers.playsolana.com)
- **GitHub**: [https://github.com/playsolana](https://github.com/playsolana)
- **Litepaper**: [https://www.playsolana.com/litepaper](https://www.playsolana.com/litepaper)

### PlaySolana Ecosystem

- **Play<Gate>** (Game Publishing): [https://playgate.playsolana.com](https://playgate.playsolana.com)
- **Play<Dex>** (Quests & Rewards): [https://playsolana.com/playdex](https://playsolana.com/playdex)
- **$PLAY Token**: [Genesis Page](https://genesis.playsolana.com/)
- **PSG1 Console**: [Product Page](https://www.playsolana.com/products)

### Social Media

- **X (Twitter)**: [@playsolana](https://www.x.com/playsolana)
- **Discord**: [PlaySolana Official](https://discord.com/invite/playsolanaofficial)
- **Telegram**: [PlaySolana Official](https://t.me/playsolanaofficial)
- **Instagram**: [@play.solana](https://www.instagram.com/play.solana/)

### Resources

- **Unity Asset Store**: PlaySolana-Unity.SDK (Available)
- **Unity Input System Docs**: [Unity Documentation](https://docs.unity3d.com/Packages/com.unity.inputsystem@latest)
- **Solana Documentation**: [https://docs.solana.com](https://docs.solana.com)

---

## About PlaySolana

PlaySolana is building the **SuperHUB** - the first vertically integrated gaming ecosystem on Solana. The platform unites:

- **Hardware**: PSG1 handheld console
- **Games**: Gaming library with Play Solana: Origins
- **Identity**: Play<ID> on-chain identity
- **DeFi**: Integrated staking and swaps via SvalGuard
- **Economy**: $PLAY token ecosystem
- **Distribution**: Play<Gate> publishing platform

### Mission

To create the gateway for mainstream gamers to enter Web3 through fun, accessible gameplay combined with true digital ownership.

### Vision

**If Solana is the chain for consumer apps, Play Solana is the gateway for gamers.**

---

## License

The PlaySolana Unity SDK is released under the **MIT License**.

See [LICENSE.md](https://github.com/playsolana/PlaySolana.Unity-SDK/blob/main/LICENSE.md) for full license text.

---

## Additional Notes

### Current SDK Status

The PlaySolana Unity SDK is actively developed. Current version includes:

- ✅ PSG1 Input System integration
- ✅ PSG1 Simulator
- ✅ Unity Package Manager support
- 🚧 Advanced wallet integration (coming soon)
- 🚧 Play<ID> integration (coming soon)
- 🚧 Play<Dex> quest hooks (coming soon)

### Roadmap

Future features planned:

- Full SvalGuard wallet integration
- Play<ID> identity system hooks
- Play<Dex> quest and reward integration
- Expanded sample scenes and templates
- Additional platform support (iOS, WebGL)
- Performance optimization tools
- Advanced debugging utilities

### Version History

See [CHANGELOG.md](https://github.com/playsolana/PlaySolana.Unity-SDK/blob/main/CHANGELOG.md) for version history and updates.

---

**Last Updated**: January 2025

**SDK Version**: 1.0.0 (Estimated)

**Minimum Unity Version**: 2019.4+

**Supported Platforms**: Android (PSG1), Windows/macOS (Development)

---

*This documentation is maintained by the PlaySolana team and community. For the most up-to-date information, visit [developers.playsolana.com](https://developers.playsolana.com).*

© 2025 Play Solana. All rights reserved.