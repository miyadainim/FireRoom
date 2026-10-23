package com.fireroom.tv;

import android.app.Activity;
import android.os.Bundle;
import android.net.Uri;
import android.view.KeyEvent;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.webkit.WebResourceRequest;
import android.widget.TextView;

/** TV display only. Camera capture stays in the independently paired phone companion. */
public final class MainActivity extends Activity {
 private WebView web;
 private Uri origin;
 private boolean allowed(Uri target) {
  return "https".equals(target.getScheme()) && origin.getHost().equals(target.getHost()) && target.getPort()==origin.getPort() && target.getUserInfo()==null;
 }
 @Override public void onCreate(Bundle state) {
  super.onCreate(state);
  String url=getString(R.string.app_url);origin=Uri.parse(url);
  if(!"https".equals(origin.getScheme())||origin.getHost()==null||origin.getUserInfo()!=null){TextView error=new TextView(this);error.setText("FireRoom requires a configured HTTPS application URL.");setContentView(error);return;}
  web=new WebView(this);setContentView(web);
  web.getSettings().setJavaScriptEnabled(true);
  web.getSettings().setDomStorageEnabled(true);
  web.getSettings().setAllowFileAccess(false);
  web.getSettings().setAllowContentAccess(false);
  web.getSettings().setMediaPlaybackRequiresUserGesture(true);
  web.setWebViewClient(new WebViewClient(){
   @Override public boolean shouldOverrideUrlLoading(WebView view,WebResourceRequest request){return !allowed(request.getUrl());}
   @Override public boolean shouldOverrideUrlLoading(WebView view,String target){return !allowed(Uri.parse(target));}
  });
  web.setFocusable(true);web.setFocusableInTouchMode(true);web.requestFocus();web.loadUrl(url);
 }
 @Override public boolean onKeyDown(int code,KeyEvent event) {
  if(web==null)return super.onKeyDown(code,event);
  if(code==KeyEvent.KEYCODE_DPAD_CENTER||code==KeyEvent.KEYCODE_ENTER){web.evaluateJavascript("(()=>{const a=document.activeElement;if(a&&a!==document.body)a.click()})()",null);return true;}
  if(code>=KeyEvent.KEYCODE_DPAD_UP&&code<=KeyEvent.KEYCODE_DPAD_RIGHT){
   String direction=code==KeyEvent.KEYCODE_DPAD_UP?"up":code==KeyEvent.KEYCODE_DPAD_DOWN?"down":code==KeyEvent.KEYCODE_DPAD_LEFT?"left":"right";
   web.evaluateJavascript("(()=>{const dir='"+direction+"';const all=[...document.querySelectorAll('button,a[href],input,select,textarea,[tabindex]')].filter(e=>!e.disabled&&e.tabIndex>=0&&e.getClientRects().length);if(!all.length)return;const a=document.activeElement;if(!all.includes(a)){all[0].focus();return}const r=a.getBoundingClientRect(),x=r.x+r.width/2,y=r.y+r.height/2;let best=null,score=Infinity;for(const e of all){if(e===a)continue;const q=e.getBoundingClientRect(),dx=q.x+q.width/2-x,dy=q.y+q.height/2-y;const forward=dir==='up'?-dy:dir==='down'?dy:dir==='left'?-dx:dx,cross=dir==='up'||dir==='down'?dx:dy;const s=forward+Math.abs(cross)*3;if(forward>1&&s<score){score=s;best=e}}if(best)best.focus()})()",null);return true;
  }
  return super.onKeyDown(code,event);
 }
 @Override protected void onPause(){if(web!=null)web.onPause();super.onPause();}
 @Override protected void onResume(){super.onResume();if(web!=null)web.onResume();}
 @Override protected void onDestroy(){if(web!=null){web.stopLoading();web.destroy();}super.onDestroy();}
}
