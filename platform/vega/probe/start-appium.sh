#!/bin/sh
# Run from repository root. Uses the approved isolated installation.
set -eu
export APPIUM_HOME="$PWD/artifacts/vega-test-tools/appium-home"
VEGA_VDA_BIN=$(vega exec which vda)
export PATH="$PWD/artifacts/vega-test-tools/node_modules/node/bin:$(dirname "$VEGA_VDA_BIN"):$PATH"
exec artifacts/vega-test-tools/node_modules/node/bin/node artifacts/vega-test-tools/node_modules/appium/index.js --address 127.0.0.1 --port 4723
