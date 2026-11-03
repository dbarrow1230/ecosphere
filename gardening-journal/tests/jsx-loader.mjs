// Test-only JSX loading. No bundle, production build, or output files.
import {registerHooks} from 'node:module';
import {readFileSync} from 'node:fs';
import {transformSync} from 'esbuild';
registerHooks({load(url,context,next){
 if(url.endsWith('.css'))return {format:'module',source:'export default {};',shortCircuit:true};
 if(url.endsWith('.jsx'))return {format:'module',source:transformSync(readFileSync(new URL(url),'utf8'),{loader:'jsx',format:'esm',jsx:'automatic'}).code,shortCircuit:true};
 return next(url,context);
}});
