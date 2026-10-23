# Fire TV display wrapper

Build offline with the installed Android SDK 35 tools and Java 22:

```sh
./scripts/build-android.sh 'https://your-trusted-app-host.example/'
```

This produces `artifacts/android/fireroom-debug.apk`. The local debug signing key also stays in ignored `artifacts/android/`. The default URL is `https://fireroom.invalid/`, intentionally unusable until a hosted application URL is supplied. This APK displays the hosted application; it does not bundle web assets or the relay. Host the web app and its secure relay before running a paired phone/TV session.

The manifest declares a landscape Leanback launcher, no touchscreen requirement, Internet access, and no camera/microphone permissions. Navigation is restricted to the configured HTTPS origin; certificates must be trusted by the device. There is no native JavaScript bridge, file access, cleartext exception, or TLS error bypass. Camera capture remains on the separately paired phone. The TV remote moves focus between visible controls; center selects them.

With a connected authorized Fire TV device, install using `adb install -r artifacts/android/fireroom-debug.apk`. Actual installation, the installed WebView's WebGL support, remote navigation, trusted HTTPS/WSS connectivity, rendering performance, and phone pairing require device verification. An APK build alone does not establish Fire TV compatibility or hackathon eligibility.

Evidence: direct Java compile, dex conversion, resource packaging, APK alignment, signing and signature verification passed locally. Java 22 emitted source/target 8 obsolescence warnings and Android reported use of compatibility APIs. No device deployment has been performed.
