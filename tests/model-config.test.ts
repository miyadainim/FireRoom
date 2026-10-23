import {describe,it,expect} from 'vitest';
import {poseModelVariant,poseModelAsset} from '../src/vision/model-config';
import {phonePairingUrl} from '../src/platform/pairing';
describe('explicit companion model configuration',()=>{
 it('retains Lite default and only enables Full explicitly',()=>{expect(poseModelVariant(null)).toBe('lite');expect(poseModelVariant('heavy')).toBe('lite');expect(poseModelVariant('full')).toBe('full');});
 it('selects the official Full task and carries the choice in the QR link',()=>{expect(poseModelAsset('full')).toBe('https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_full/float16/1/pose_landmarker_full.task');const u=new URL(phonePairingUrl('https://example.test','session','full'));expect(u.searchParams.get('poseModel')).toBe('full');expect(u.searchParams.get('phone')).toBe('session');});
});
