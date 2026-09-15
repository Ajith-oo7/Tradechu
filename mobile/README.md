# Tradechu Mobile (Expo)

Native iOS + Android app for Tradechu.

## Run

```bash
cd mobile
npm install
npx expo start
```

Scan the QR code with **Expo Go** (Android) or the Camera app (iOS).

## Auth (local demo)

Login collects **first name**, **last name**, and **phone number**. Sessions are stored on-device (AsyncStorage).

- Tap **Continue in demo mode**, or
- Send code and enter **123456**

## EAS builds

```bash
npm install -g eas-cli
eas login
eas build --platform all --profile preview
```

## RSVP

**RSVP** = **Répondez s’il vous plaît** (“Please respond”) — in-app: **RSVP — I am attending**.
