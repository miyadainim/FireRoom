// Packaging-only adaptation for Vega file:// module/subresource restrictions.
import {build} from '../../../node_modules/esbuild/lib/main.js';
import {mkdirSync,writeFileSync} from 'node:fs';
const result=await build({entryPoints:[process.argv[2]==='arcade'?'src/arcade.ts':'src/main.ts'],bundle:true,write:false,format:'iife',target:'es2020',outfile:'display.js',minify:true,loader:{'.png':'dataurl'}});
const js=result.outputFiles.find(f=>f.path.endsWith('.js')).text;
const css=result.outputFiles.find(f=>f.path.endsWith('.css'))?.text||'';
mkdirSync('platform/vega/assets/fireroom',{recursive:true});
writeFileSync('platform/vega/assets/fireroom/standalone.html',`<!doctype html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>FireRoom</title><style>${css}</style></head><body><div id="app"></div><script>${js.replace(/<\/script/gi,'<\\/script')}</script></body></html>`);
