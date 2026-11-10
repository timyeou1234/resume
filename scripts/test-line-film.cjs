const assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs'),path=require('node:path');
const app=fs.readFileSync(path.join(__dirname,'../site/app.js'),'utf8');
const controller=app.slice(app.indexOf('  (function setupLineFilm()'),app.indexOf('  var year ='));
const flush=()=>new Promise(setImmediate);
function element(attrs={}) {return {attrs,events:{},hidden:true,setAttribute(k,v){this.attrs[k]=v},getAttribute(k){return this.attrs[k]},removeAttribute(k){delete this.attrs[k]},addEventListener(k,f){this.events[k]=f}}}
function fixture({reduce=false,saveData=false,mobile=false,language='en',observer=true,rejectPlay=false,delayed=false,failFirst=false}={}){
 const video=element(Object.fromEntries(['en','zh'].flatMap(lang=>['src','mobile-src','poster','mobile-poster'].map(key=>[`data-${key}-${lang}`,`${key}-${lang}`]))));
 Object.assign(video,{paused:true,ended:false,currentTime:0,readyState:0,plays:0,loads:0,play(){this.plays++;if(rejectPlay)return Promise.reject(new Error('autoplay blocked'));this.readyState=4;this.paused=false;this.events.play();return Promise.resolve()},pause(){this.paused=true;this.events.pause()},load(){this.loads++;this.readyState=4;this.events.loadedmetadata?.()}});
 const toggle=element(),label=element(),controls=element(),chapters=[0,7,14,20,28].map(n=>element({'data-line-chapter':String(n)}));
 const figure={querySelector:s=>({'video':video,'[data-line-toggle]':toggle,'[data-line-play-label]':label,'.line-film-controls':controls})[s],querySelectorAll:()=>chapters};
 const doc={hidden:false,events:{},querySelector:()=>figure,addEventListener(k,f){this.events[k]=f}};
 const reducedMotion={matches:reduce,addEventListener(k,f){this.change=f}},connection={saveData,addEventListener(k,f){this.change=f}};let observe,release;
 const window={matchMedia:()=>({matches:mobile})};if(observer)window.IntersectionObserver=true;
 const fetches=[];
 const fetch=source=>{fetches.push(source);const response={ok:!(failFirst&&fetches.length===1),blob:async()=>({source})};return delayed?new Promise(resolve=>{release=()=>resolve(response)}):Promise.resolve(response)};
 vm.runInNewContext(controller,{doc,reducedMotion,navigator:{connection},currentLanguage:language,window,fetch,URL:{createObjectURL:blob=>'blob:'+blob.source},IntersectionObserver:function(f){observe=f;this.observe=()=>{}}});
 return {video,toggle,label,chapters,doc,controls,reducedMotion,connection,fetches,release:()=>release(),visible(value){observe([{isIntersecting:value}])}};
}
(async()=>{
 let f=fixture();assert.equal(f.video.src,undefined);assert.equal(f.fetches.length,0,'offscreen video must not fetch');assert.equal(f.controls.hidden,false);
 f.visible(true);await flush();assert.equal(f.video.src,'blob:src-en');assert.equal(f.video.paused,false);assert.equal(f.video.controls,true);
 f.video.currentTime=11;f.visible(false);assert.equal(f.video.paused,true);f.visible(true);await flush();assert.equal(f.video.paused,false);assert.equal(f.video.currentTime,11);assert.equal(f.fetches.length,1,'one bounded buffer per document');
 f.doc.hidden=true;f.doc.events.visibilitychange();assert.equal(f.video.paused,true);f.doc.hidden=false;f.doc.events.visibilitychange();await flush();assert.equal(f.video.paused,false);
 f.toggle.events.click();assert.equal(f.video.paused,true);f.visible(false);f.visible(true);await flush();assert.equal(f.video.paused,true,'manual pause persists');
 f.chapters[3].events.click();await flush();assert.equal(f.video.currentTime,23.2);assert.equal(f.video.paused,true);assert.equal(f.chapters[3].attrs['aria-current'],'step');
 f.toggle.events.click();await flush();f.reducedMotion.matches=true;f.reducedMotion.change();assert.equal(f.video.paused,true);
 for(const option of [{reduce:true},{saveData:true}]) {f=fixture({...option,mobile:true,language:'zh'});f.visible(true);await flush();assert.equal(f.video.plays,0);assert.equal(f.fetches.length,0,'manual preference must not fetch until interaction');assert.equal(f.video.poster,'mobile-poster-zh');f.toggle.events.click();await flush();assert.equal(f.video.src,'blob:mobile-src-zh');assert.equal(f.video.paused,false);assert.equal(f.label.textContent,'暫停');f.video.pause();f.visible(false);f.visible(true);await flush();assert.equal(f.video.paused,true,'native pause is retained');}
 f=fixture({observer:false});assert.equal(f.fetches.length,0);f.toggle.events.click();await flush();assert.equal(f.video.paused,false);
 f=fixture({rejectPlay:true});f.visible(true);await flush();assert.equal(f.label.textContent,'Play demo');assert.equal(f.video.paused,true);
 f=fixture({delayed:true});f.visible(true);assert.equal(f.label.textContent,'Loading…');assert.equal(f.toggle.disabled,true);f.visible(false);f.release();await flush();assert.equal(f.video.plays,0,'late buffer must not start offscreen playback');
 f=fixture({reduce:true,delayed:true});f.visible(true);f.chapters[0].events.click();f.chapters[4].events.click();f.release();await flush();assert.equal(f.video.currentTime,31.2,'latest chapter wins while loading');assert.equal(f.video.paused,true);
 f=fixture({failFirst:true});f.visible(true);await flush();assert.equal(f.label.textContent,'Retry video');assert.equal(f.toggle.disabled,false);f.toggle.events.click();await flush();assert.equal(f.video.paused,false,'failed fetch can retry');
 f=fixture();f.visible(true);await flush();f.video.ended=true;f.video.pause();f.video.events.ended();f.toggle.events.click();await flush();assert.equal(f.video.currentTime,0);assert.equal(f.video.paused,false);
 console.log('LINE film: bounded lazy buffer, full-response host seeking, locale/portrait, chapters and loading races, retry, replay, manual/native pause, viewport/visibility, preferences, and rejected autoplay passed');
})().catch(error=>{console.error(error);process.exitCode=1});
