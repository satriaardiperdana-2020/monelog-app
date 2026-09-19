# Mobile packaging

## API URLs

- Browser development uses `VITE_API_BASE_URL=/api/v1` and the Vite proxy.
- USB Android development uses the uncommitted `.env.android.local` value `VITE_API_BASE_URL=http://127.0.0.1:8080/api/v1`, together with `adb reverse tcp:8080 tcp:8080`.
- Release builds require `VITE_API_BASE_URL` to be an HTTPS URL. Copy `.env.production.example` to an uncommitted `.env.production`, or provide the value in CI.

The Capacitor webview origin is `https://localhost`. The API backend must include this exact origin in its credentialed CORS allowlist, return `Access-Control-Allow-Credentials: true`, and allow the headers used by the application. Do not use a wildcard origin with credentials.

## Exports

Browser exports use a Blob download. Native exports reuse the same Excel/PDF generators, then write into the app cache with Capacitor Filesystem and open the system share sheet with Capacitor Share. Files are not written to a public, broad storage directory.

## Build commands

```bash
npm run build:android
npx cap sync android
cd android && ./gradlew test assembleDebug
```

`INTERNET` is declared in `android/app/src/main/AndroidManifest.xml`. Debug-only network security permits cleartext only to `127.0.0.1`; release builds retain normal HTTPS security.

Never commit `.env*.local`, `.env.production`, signing keys, APKs, AABs, or credentials.
