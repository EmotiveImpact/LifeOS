import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
const here=path.dirname(fileURLToPath(import.meta.url));
const root=path.resolve(here,'..');
const sourceFile=path.join(root,'design-board/life-design-board-v17.html');
const original=fs.readFileSync(sourceFile,'utf8');
const sourceHash=crypto.createHash('sha256').update(original).digest('hex');
let html=original;
html=html.replace('Complete app · v17','Complete app · v18 · merged direction').replace('v17 · One orb family, Fenny’s pictures, body numbers, health and food counters','v18 · Original depth, a clearer feed, full navigation').replace('Every feature. One calm app that grows with you.','All of life. Better organised.');
html=html.replace(/<p class="p-lead">This is the whole of life,[\s\S]*?<\/p>/,'<p class="p-lead">The complete original screen library, enhanced—not reduced. All <span id="countScreens">221</span> screens remain, with the merged Today feed, full-width navigation, and a grouped Body / Money / Learning snapshot. Level, Aim, editorial briefing, body numbers, life knows you, life is asking and due dates stay. This is a design board with illustrative data, not a live account.</p>');
html=html.replace('<title>life Complete App v17</title>','<title>life · Complete merged design v18</title>\n<meta name="viewport" content="width=device-width,initial-scale=1">\n<meta name="life:source-v17-sha256" content="'+sourceHash+'">');
html=html.replace(/<link[^>]*(?:fonts\.googleapis\.com|fonts\.gstatic\.com)[^>]*>\n?/g,'');
let fonts='';
for(const weight of [400,500,600,700]){
 const suffix={400:'Regular',500:'Medium',600:'SemiBold',700:'Bold'}[weight];
 const file=path.join(root,`apps/mobile/node_modules/@expo-google-fonts/inter/${weight}${suffix}/Inter_${weight}${suffix}.ttf`);
 fonts+=`@font-face{font-family:Inter;font-weight:${weight};src:url(data:font/ttf;base64,${fs.readFileSync(file).toString('base64')})}\n`;
}
for(const [weight,suffix] of [[400,'Regular'],[500,'Medium']]){
 const file=path.join(root,`apps/mobile/node_modules/@expo-google-fonts/jetbrains-mono/${weight}${suffix}/JetBrainsMono_${weight}${suffix}.ttf`);
 if(fs.existsSync(file))fonts+=`@font-face{font-family:'JetBrains Mono';font-weight:${weight};src:url(data:font/ttf;base64,${fs.readFileSync(file).toString('base64')})}\n`;
}
const css=fs.readFileSync(path.join(here,'visual-board-v18.css'),'utf8');
html=html.replace('</style>','</style>\n<style>'+fonts+css+'</style>');
html=html.replace('Complete app · v17','Complete merged app · v18');
html=html.replace('v17 · One orb family, Fenny’s pictures, body numbers, health and food counters','v18 · Original depth, clearer grouping, the same identity');
html=html.replace('Every feature. One calm app that grows with you.','The whole of life. Better organised, not reduced.');
html=html.replace(/<p class="p-lead">This is the whole of life,[\s\S]*?<\/p>/,'<p class="p-lead">Your original complete board, enhanced with the newer sizing, spacing and full navigation. The Aim, level, editorial briefing, body numbers, knowledge, questions and deadlines stay. <span id="countScreens">221</span> screen keys and every original chapter remain—nothing has been replaced by a stripped-down task app.</p>');
const hook='/* ======================= RENDER ======================= */';
if(!html.includes(hook))throw new Error('Original render hook missing');
html=html.replace(hook,'\n'+fs.readFileSync(path.join(here,'visual-board-v18.js'),'utf8')+'\n'+hook);
const ending='\nrenderMoodCards();\nsyncTheme();';
if(!html.includes(ending))throw new Error('Original final render hook missing');
html=html.replace(ending,'\nwindow.__finishV18Board();\nrenderMoodCards();\nsyncTheme();');
for(const [i,match] of [...html.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g)].entries())new vm.Script(match[1],{filename:'v18-script-'+i});
const output=path.join(here,'life-complete-board-v18.html');
let notices='';
for(const family of ['inter','jetbrains-mono']){const dir=path.join(root,'apps/mobile/node_modules/@expo-google-fonts',family);for(const name of fs.readdirSync(dir).filter(n=>/^(license|ofl)/i.test(n)&&fs.statSync(path.join(dir,n)).isFile()))notices+='\n'+family+' / '+name+'\n'+fs.readFileSync(path.join(dir,name),'utf8');}
if(notices)html+='\n<!-- Embedded font licences:\n'+notices.replaceAll('-->','-- >')+'\n-->\n';
fs.writeFileSync(output,html);
if(crypto.createHash('sha256').update(fs.readFileSync(sourceFile)).digest('hex')!==sourceHash)throw new Error('Original board changed');
console.log(JSON.stringify({output,bytes:fs.statSync(output).size,sourceV17Hash:sourceHash,originalUnchanged:true,inlineScriptsSyntax:'passed'},null,2));
