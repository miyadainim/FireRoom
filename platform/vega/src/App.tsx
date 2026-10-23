import {WebView} from '@amazon-devices/webview';
import * as React from 'react';
import {useRef, useEffect, useState} from 'react';
import {probeScript} from './probe';
import {displayMode, sceneMonitor, sceneActions} from './target';
import {hostedOrigin, hostedMonitor, hostedSetup} from './hosted-target';
import {View, Text, Pressable, StyleSheet} from 'react-native';
import {
  useHideSplashScreenCallback,
  usePreventHideSplashScreen,
} from '@amazon-devices/react-native-kepler';
import {
  WebViewMethods,
  SslErrorData,
  WebViewErrorEvent,
  WebViewHttpErrorEvent,
  WebViewNavigationEvent,
} from '@amazon-devices/webview/dist/types/WebViewTypes';

// Simulator-only origins; 10.0.2.2 is the verified host gateway.
const localDevelopment = /^http:\/\/(?:127\.0\.0\.1|10\.0\.2\.2):5173(?:\/|$)/.test(hostedOrigin);

// Native-only test telemetry via VDA reverse to a host loopback receiver.
// This endpoint never receives camera, pose, or production relay traffic.
const diagnostic = (event: unknown) => {
  fetch('http://127.0.0.1:9137', {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(event)}).catch(() => {});
};

export const App = () => {
  const webRef = useRef<WebViewMethods>(null);
  const [loading,setLoading]=useState(true);
  const [loadError,setLoadError]=useState('');
  const [attempt,setAttempt]=useState(0);
  const retry=()=>{setLoadError('');setLoading(true);setAttempt(n=>n+1);};
  useEffect(()=>{if(!localDevelopment||!loadError)return;const timer=setTimeout(retry,3000);return()=>clearTimeout(timer);},[loadError,attempt]);
  const [controllerHeader,setControllerHeader]=useState('');
  useEffect(()=>{
    if(!hostedOrigin||localDevelopment)return;
    let active=true;
    setControllerHeader('');
    fetch('http://127.0.0.1:9137/controller').then(r=>{
      if(!r.ok)throw Error('Runtime provisioning unavailable');
      return r.json();
    }).then(data=>{
      if(typeof data.token!=='string'||!data.token)throw Error('Runtime provisioning unavailable');
      if(active)setControllerHeader(data.token);
    }).catch(()=>{
      if(active){setLoading(false);setLoadError('Local runtime provisioning unavailable');}
    });
    return()=>{active=false;};
  },[attempt]);
  // By default splash screen is shown in app launch, as the splash
  // screen images are bundled in this app (assets/raw/ folder)
  // Declare that application wants to extend splash screen lifecycle
  usePreventHideSplashScreen();
  const hideSplashScreenCallback = useHideSplashScreenCallback();
  useEffect(()=>{hideSplashScreenCallback();},[hideSplashScreenCallback]);
  useEffect(()=>{if(!loading)return;const timer=setTimeout(()=>{setLoading(false);setLoadError('The app did not finish loading');},15000);return()=>clearTimeout(timer);},[loading,attempt]);
  return (
    <View style={styles.container}>
      {(!hostedOrigin || localDevelopment || controllerHeader) && <WebView
        onShouldStartLoadWithRequest={(request) => {try{return hostedOrigin ? (request.url===hostedOrigin.split("/").slice(0,3).join("/") || request.url.startsWith(hostedOrigin.split("/").slice(0,3).join("/")+"/")) : displayMode ? request.url.startsWith("file:///pkg/assets/") : (request.url==="https://example.com" || request.url.startsWith("https://example.com/"));}catch{return false;}}}
        testID="fireroom-webview"
        key={attempt}
        ref={webRef}
        style={styles.webview}
        allowSystemKeyEvents
        allowsDefaultMediaControl
        domStorageEnabled
        hasTVPreferredFocus
        allowFileAccess={displayMode && !hostedOrigin}
        injectedJavaScriptBeforeContentLoaded={hostedOrigin ? hostedMonitor : displayMode ? sceneMonitor : undefined}
        javaScriptEnabled
        mediaPlaybackRequiresUserAction={false}
        mixedContentMode="never"
        // thirdPartyCookiesEnabled
        // userAgent={''}
        source={{
          // headers: {},
          headers: hostedOrigin && !localDevelopment ? {"X-FireRoom-Controller": controllerHeader} : undefined,
          uri: hostedOrigin || (displayMode ? "file:///pkg/assets/fireroom/standalone.html" : "https://example.com"),
        }}
        onMessage={(event) => { console.info("FIREROOM_WEB", event.nativeEvent.data); diagnostic({message: event.nativeEvent.data}); }}
        onLoad={(_event: WebViewNavigationEvent) => {
          setLoading(false);setLoadError('');console.info('Page loading completed...');
          diagnostic({load: _event.nativeEvent.url});
          webRef.current?.injectJavaScript(hostedOrigin ? hostedSetup : displayMode ? sceneActions : probeScript);
          // Hide the splash screen
          hideSplashScreenCallback();
        }}
        onLoadStart={(_event: WebViewNavigationEvent) => {
          setLoading(true);console.info('Page loading started...');
          diagnostic({loadStart: _event.nativeEvent.url});
        }}
        onError={({
          nativeEvent: {code, url, description},
        }: WebViewErrorEvent) => {
          hideSplashScreenCallback();
          setLoading(false);setLoadError(description);diagnostic({error: description, url, code});
          console.error(`[onError]: (${code}: ${url}) ${description}`);
        }}
        onHttpError={({
          nativeEvent: {url, statusCode: code, description, isMainFrame},
        }: WebViewHttpErrorEvent) => {
          hideSplashScreenCallback();
          if(isMainFrame){setLoading(false);setLoadError(`Server returned ${code}`);}diagnostic({error: description, url, code});
          console.error(`[onHttpError]: (${code}: ${url}) ${description}`);
          console.error(`[onHttpError]: isMainFrame: ${isMainFrame}`);
        }}
        onSslError={({code, url, description}: SslErrorData) => {
          hideSplashScreenCallback();
          setLoading(false);setLoadError(description);diagnostic({error: description, url, code});
          console.error(`[onSslError]: (${code}: ${url}) ${description}`);
        }}
      />}
      {(loading||loadError!==''||(!!hostedOrigin&&!localDevelopment&&!controllerHeader))&&<View style={styles.startup}>
        <Text style={styles.title}>FIRE ROOM</Text>
        <Text style={styles.message}>{loadError?'Waiting for FireRoom on your computer…':'Opening your boxing gym…'}</Text>
        {loadError!==''&&<><Text style={styles.detail}>{localDevelopment?'Keep the FireRoom services running on your computer. Retrying automatically.':'Keep the FireRoom services and runtime provisioning running on your computer, then select Retry now.'}</Text><Pressable accessibilityRole="button" onPress={retry} style={styles.retry}><Text style={styles.message}>Retry now</Text></Pressable></>}
      </View>}
    </View>
  );
};

// Styles for layout, which are necessary for proper focus behavior
const styles = StyleSheet.create({
  container: {flex: 1},
  webview: {flex:1,backgroundColor: '#172530'},
  startup:{position:'absolute',top:0,bottom:0,left:0,right:0,backgroundColor:'#172530',justifyContent:'center',alignItems:'center',padding:48},
  title:{color:'#f3dfb9',fontSize:40,fontWeight:'bold',marginBottom:24},
  message:{color:'#f3dfb9',fontSize:26,textAlign:'center'},
  detail:{color:'#e0cfb0',fontSize:22,textAlign:'center',marginTop:20},
  retry:{padding:18,marginTop:28,backgroundColor:'#38576a'},
});
