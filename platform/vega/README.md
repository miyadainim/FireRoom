# FireRoom Vega wrapper

The native React Native Kepler app loads the web game in Amazon WebView. Package ID: `com.fireroom.vegaprobe`; component ID: `com.fireroom.vegaprobe.main`. These historical identifiers are intentional.

Use the [root activation guide](../../README.md#recommended-activate-coach-mode-in-vega-through-cloudflare) for the complete Cloudflare/backend/phone workflow. The previous probe README is retained as [historical evidence](../../docs/validation/VEGA_PROBE_HISTORY.md); it is not the current setup sequence.

From the repository root:

```sh
npm ci
npm run vega:prepare
cd platform/vega
vega exec npm ci
cd ../..
# Select one real target:
node platform/vega/probe/configure-hosted.mjs https://YOUR-TUNNEL.trycloudflare.com
# Or: node platform/vega/probe/configure-local.mjs https://LAN-IP:5175 coach
cd platform/vega
./node_modules/.bin/tsc --noEmit
vega exec npm run build:debug
cd ../..
```

After starting the backend/tunnel/provisioning as documented:

```sh
vega virtual-device start --gui --timeout 45
vega exec vda devices
# Hosted mode only; provisioning must be listening locally on9137:
vega exec vda reverse tcp:9137 tcp:9137
vega run-app platform/vega/build/aarch64-debug/fireroomvegaprobe_aarch64.vpkg com.fireroom.vegaprobe.main -d VirtualDevice
```

`src/hosted-target.ts`, `src/probe.ts` and `src/target.ts` are generated and ignored. `vega:prepare` creates compile defaults only when absent; target generators write real launch configuration. Never commit runtime controller authorization. Hosted navigation is restricted to the configured origin, and TLS checks remain enabled. Local simulator cleartext is allowlisted only for10.0.2.2.

The SDK Jest tests are separate:

```sh
cd platform/vega
vega exec npm test -- --runInBand
```

The wrapper recovery test assumes a simulator-local target; generate that target before running it. Appium/probe helpers are optional historical diagnostics, require separately installed tooling, and are not needed for normal activation. They may refer to ignored local `artifacts/` dependencies. Native build/install alone does not prove rendering, remote behavior, physical recognition or phone synchronization.
