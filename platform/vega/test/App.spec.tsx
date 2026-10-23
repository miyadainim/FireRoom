import * as React from 'react';
import {render,fireEvent,act} from '@testing-library/react-native';
import {App} from '../src/App';

jest.mock('../src/hosted-target',()=>({hostedOrigin:'http://10.0.2.2:5173/',hostedMonitor:'',hostedSetup:''}));

jest.mock('@amazon-devices/webview', () => ({
  WebView: 'WebView',
}));

jest.mock('@amazon-devices/react-native-kepler', () => ({
  usePreventHideSplashScreen: jest.fn(),
  useHideSplashScreenCallback: jest.fn(() => jest.fn()),
  StyleSheet: {create: (styles: unknown) => styles, flatten: (style: unknown) => style??{}},
  View: 'View',
  Text: 'Text',
  Pressable: 'View',
}));

describe('App', () => {
  it('shows connection recovery and retries when the computer is unavailable',()=>{
    jest.useFakeTimers();
    const previousFetch=globalThis.fetch;globalThis.fetch=jest.fn(()=>Promise.resolve({})) as unknown as typeof fetch;
    try{
      const ui=render(<App />);
      expect(ui.getByText('Opening your boxing gym…')).toBeTruthy();
      fireEvent(ui.getByTestId('fireroom-webview'),'error',{nativeEvent:{code:-1,url:'http://10.0.2.2:5173/arcade.html',description:'Host unavailable'}});
      expect(ui.getByText('Waiting for FireRoom on your computer…')).toBeTruthy();
      act(()=>{jest.advanceTimersByTime(3000);});
      expect(ui.getByText('Opening your boxing gym…')).toBeTruthy();
      fireEvent(ui.getByTestId('fireroom-webview'),'load',{nativeEvent:{url:'http://10.0.2.2:5173/arcade.html'}});
      expect(ui.queryByText('Opening your boxing gym…')).toBeNull();ui.unmount();
    }finally{globalThis.fetch=previousFetch;jest.useRealTimers();}
  });
  it('renders without crashing', () => {
    const {toJSON} = render(<App />);
    expect(toJSON()).toBeTruthy();
  });
});
