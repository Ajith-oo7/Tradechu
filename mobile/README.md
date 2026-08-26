# Tradechu Mobile (Expo)

Native iOS + Android app for Tradechu.

## Run

```bash
cd mobile
npm install
npx expo start
```

Scan the QR code with **Expo Go** (Android) or the Camera app (iOS).

## Auth (OTP)

Login collects **first name**, **last name**, and **phone number**, then SMS OTP via Supabase Phone Auth (Twilio).

Without Supabase configured:
- Tap **Continue in demo mode**, or
- Send code and enter **123456**

## Env

Copy `.env.example` → `.env` and set:

- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`

Enable **Phone** provider in Supabase Auth and connect Twilio.

## SQL

Run root `supabase/schema.sql`, then `supabase/profiles_phone.sql` for first/last/phone columns.

## EAS builds

```bash
npm install -g eas-cli
eas login
eas build --platform all --profile preview
```

## RSVP

**RSVP** = **Répondez s’il vous plaît** (“Please respond”) — in-app: **RSVP — I am attending**.
