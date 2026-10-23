#!/usr/bin/env bash
set -euo pipefail
# Direct, offline APK build. Outputs (including local debug signing key) stay in ignored artifacts/.
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SDK="${ANDROID_SDK_ROOT:-${HOME}/Library/Android/sdk}"
BT="$SDK/build-tools/35.0.0"
JAVA_HOME="${JAVA_HOME:-$(/usr/libexec/java_home -v 22)}"
export JAVA_HOME
export PATH="$JAVA_HOME/bin:$PATH"
APP_URL="${1:-https://fireroom.invalid/}"
OUT="$ROOT/artifacts/android"
mkdir -p "$OUT/res/values" "$OUT/classes" "$OUT/dex"
python3 - "$APP_URL" "$OUT/res/values/config.xml" <<'PY'
import sys,urllib.parse,xml.etree.ElementTree as E
url=sys.argv[1];p=urllib.parse.urlsplit(url)
if p.scheme!='https' or not p.hostname or p.username or p.password:
 raise SystemExit('Application URL must use HTTPS without embedded credentials')
r=E.Element('resources');E.SubElement(r,'string',name='app_url',translatable='false').text=url
E.ElementTree(r).write(sys.argv[2],encoding='utf-8',xml_declaration=True)
PY
"$BT/aapt2" compile --dir "$ROOT/platform/android/res" -o "$OUT/base-res.zip"
"$BT/aapt2" compile --dir "$OUT/res" -o "$OUT/config-res.zip"
"$BT/aapt2" link -o "$OUT/unsigned.apk" --manifest "$ROOT/platform/android/AndroidManifest.xml" -I "$SDK/platforms/android-35/android.jar" --java "$OUT/generated" "$OUT/base-res.zip" "$OUT/config-res.zip"
javac -source 8 -target 8 -bootclasspath "$SDK/platforms/android-35/android.jar" -d "$OUT/classes" "$ROOT/platform/android/src/com/fireroom/tv/MainActivity.java" "$OUT/generated/com/fireroom/tv/R.java"
CLASS_FILES=()
while IFS= read -r -d '' class_file; do CLASS_FILES+=("$class_file"); done < <(find "$OUT/classes" -name '*.class' -print0)
"$BT/d8" --lib "$SDK/platforms/android-35/android.jar" --min-api 25 --output "$OUT/dex" "${CLASS_FILES[@]}"
(cd "$OUT/dex" && zip -q -j "$OUT/unsigned.apk" classes.dex)
"$BT/zipalign" -f 4 "$OUT/unsigned.apk" "$OUT/aligned.apk"
if [ ! -f "$OUT/debug.keystore" ]; then
 keytool -genkeypair -keystore "$OUT/debug.keystore" -storepass android -keypass android -alias androiddebugkey -dname 'CN=FireRoom Local Debug,O=FireRoom,C=US' -keyalg RSA -keysize 2048 -validity 3650 >/dev/null 2>&1
fi
"$BT/apksigner" sign --ks "$OUT/debug.keystore" --ks-pass pass:android --key-pass pass:android --out "$OUT/fireroom-debug.apk" "$OUT/aligned.apk"
"$BT/apksigner" verify "$OUT/fireroom-debug.apk"
printf 'Built %s\nConfigured application URL: %s\n' "$OUT/fireroom-debug.apk" "$APP_URL"
