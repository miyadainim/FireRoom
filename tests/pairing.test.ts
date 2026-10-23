import {describe,it,expect} from 'vitest';
import {toDataURL} from 'qrcode';
import {phonePairingUrl} from '../src/platform/pairing';

describe('phone QR pairing',()=>{
 it('preserves the session token and removes viewer state',()=>{
  const token='abc+/?=& token';
  const url=new URL(phonePairingUrl('https://192.168.1.28:5175/viewer?old=session#guide',token));
  expect(url.origin).toBe('https://192.168.1.28:5175');
  expect(url.pathname).toBe('/');expect(url.hash).toBe('');
  expect([...url.searchParams.entries()]).toEqual([['phone',token]]);
 });
 it('requires HTTPS for phone capture',()=>{
  expect(()=>phonePairingUrl('http://192.168.1.28:5174','token')).toThrow('HTTPS');
 });
 it('rejects loopback addresses unusable from another device',()=>{
  for(const origin of ['https://localhost:5175','https://127.0.0.1:5175','https://[::1]:5175']){
   expect(()=>phonePairingUrl(origin,'token')).toThrow('LAN address');
  }
 });
 it('rejects embedded credentials',()=>{
  expect(()=>phonePairingUrl('https://user:secret@example.test','token')).toThrow('credentials');
 });
 it('encodes the pairing link as a local PNG data URL',async()=>{
  const url=phonePairingUrl('https://192.168.1.28:5175','cce67527ba281179bc898d1fcb073e4d');
  const png=await toDataURL(url,{width:280,margin:4,errorCorrectionLevel:'M'});
  expect(png.startsWith('data:image/png;base64,iVBORw0KGgo')).toBe(true);
 });
});
