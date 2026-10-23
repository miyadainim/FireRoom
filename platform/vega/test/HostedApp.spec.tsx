import * as React from 'react';
import {render,fireEvent,act} from '@testing-library/react-native';
import {App} from '../src/App';

jest.mock('../src/hosted-target',()=>({hostedOrigin:'https://fireroom.example/',hostedMonitor:'',hostedSetup:''}));
jest.mock('@amazon-devices/webview',()=>({WebView:'WebView'}));
jest.mock('@amazon-devices/react-native-kepler',()=>({
  usePreventHideSplashScreen:jest.fn(),
  useHideSplashScreenCallback:jest.fn(()=>jest.fn()),
  StyleSheet:{create:(styles:unknown)=>styles,flatten:(style:unknown)=>style??{}},
  View:'View',Text:'Text',Pressable:'View',
}));

it('reacquires hosted authorization on explicit Retry and replaces stale authorization',async()=>{
  jest.useFakeTimers();
  const previousFetch=globalThis.fetch;
  let provisions=0;
  const fetchMock=jest.fn((url:string)=>{
    if(url!=='http://127.0.0.1:9137/controller')return Promise.resolve({});
    provisions++;
    if(provisions===1)return Promise.reject(new Error('Provisioning offline'));
    return Promise.resolve({ok:true,json:async()=>({token:provisions===2?'first-test-authorization':'replacement-test-authorization'})});
  });
  globalThis.fetch=fetchMock as unknown as typeof fetch;
  const ui=render(<App />);
  try{
    await act(async()=>{});
    expect(ui.queryByTestId('fireroom-webview')).toBeNull();
    expect(ui.getByText('Keep the FireRoom services and runtime provisioning running on your computer, then select Retry now.')).toBeTruthy();
    act(()=>{jest.advanceTimersByTime(30000);});
    expect(fetchMock).toHaveBeenCalledTimes(1);
    await act(async()=>{fireEvent.press(ui.getByText('Retry now'));});
    expect(ui.getByTestId('fireroom-webview').props.source.headers['X-FireRoom-Controller']).toBe('first-test-authorization');
    fireEvent(ui.getByTestId('fireroom-webview'),'httpError',{nativeEvent:{url:'https://fireroom.example/',statusCode:403,description:'Expired authorization',isMainFrame:true}});
    await act(async()=>{fireEvent.press(ui.getByText('Retry now'));});
    expect(ui.getByTestId('fireroom-webview').props.source.headers['X-FireRoom-Controller']).toBe('replacement-test-authorization');
    expect(fetchMock.mock.calls.filter(([url])=>url==='http://127.0.0.1:9137/controller')).toHaveLength(3);
  }finally{
    ui.unmount();globalThis.fetch=previousFetch;jest.useRealTimers();
  }
});
