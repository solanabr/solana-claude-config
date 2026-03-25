---
name: build-react-native
description: Build React Native/Expo project for iOS and Android
---

# Build React Native

Build Expo/React Native project for development or production.

## Usage

```
/build-react-native [platform] [options]
```

### Platforms
- `ios` - Build for iOS
- `android` - Build for Android
- `all` - Build for both platforms

### Options
- `--dev` - Development build (default)
- `--preview` - Preview/internal build
- `--production` - Production build for app stores
- `--local` - Build locally instead of EAS

## Workflow

### 1. Pre-build Checks

```bash
# Check for TypeScript errors
npx tsc --noEmit

# Check for lint errors
npm run lint

# Run tests
npm test
```

### 2. Development Build

```bash
# Start development server
npx expo start

# Run on iOS simulator
npx expo run:ios

# Run on Android emulator
npx expo run:android
```

### 3. EAS Build (Cloud)

```bash
# Configure EAS (first time only)
npx eas build:configure

# Development build
npx eas build --platform ios --profile development
npx eas build --platform android --profile development

# Preview build (internal testing)
npx eas build --platform all --profile preview

# Production build
npx eas build --platform all --profile production
```

### 4. Local Build

```bash
# iOS (requires Xcode)
npx expo run:ios --configuration Release

# Android
npx expo run:android --variant release
```

## eas.json Configuration

```json
{
  "cli": {
    "version": ">= 5.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "ios": {
        "simulator": true
      }
    },
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "android": {
        "buildType": "app-bundle"
      }
    }
  },
  "submit": {
    "production": {}
  }
}
```

## Common Issues

### iOS Build Fails

1. **CocoaPods issue**:
   ```bash
   cd ios && pod install --repo-update && cd ..
   ```

2. **Certificate issue**: Run `eas credentials` to manage iOS certificates

3. **Xcode version**: Ensure Xcode is up to date

### Android Build Fails

1. **Gradle issue**:
   ```bash
   cd android && ./gradlew clean && cd ..
   ```

2. **Keystore issue**: Run `eas credentials` to manage Android keystore

3. **Java version**: Ensure Java 17 is installed

### General Issues

1. **Clear caches**:
   ```bash
   npx expo start --clear
   rm -rf node_modules && npm install
   ```

2. **Metro bundler**: Restart with `npx expo start --clear`

3. **Prebuild sync**: `npx expo prebuild --clean`

## Build Output

- **iOS**: `.ipa` file or `.app` bundle
- **Android**: `.apk` (preview) or `.aab` (production)

## Post-Build

1. **Test on device**: Install build via EAS dashboard or local install
2. **Check wallet connection**: Test Mobile Wallet Adapter flow
3. **Verify deep links**: Test deep link handling
4. **Check offline mode**: Test offline functionality

## Submitting to Stores

```bash
# Submit to App Store
npx eas submit --platform ios

# Submit to Play Store
npx eas submit --platform android
```
