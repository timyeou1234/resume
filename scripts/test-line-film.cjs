const assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs'),path=require('node:path');
const app=fs.readFileSync(path.join(__dirname,'../site/app.js'),'utf8');
const controller=app.slice(app.indexOf('  (function setupLineFilm()'),app.indexOf('  var year ='));
function element(attrs={}) {return {attrs,events:{},hidden:true,setAttribute(k,v){this.attrs[k]=v},getAttribute(k){return this.attrs[k]},removeAttribute(k){delete this.attrs[k]},addEventListener(k,f){this.events[k]=f}}}
function fixture({reduce=false,saveData=false,mobile=false,language='en',observer=true,rejectPlay=false}={}){
 const video=element(Object.fromEntries(['en','zh'].flatMap(lang=>['src','mobile-src','poster','mobile-poster'].map(key=>[`data-${key}-${lang}`,`${key}-${lang}`]))));
 Object.assign(video,{paused:true,ended:false,currentTime:0,readyState:0,plays:0,loads:0,play(){this.plays++;if(rejectPlay)return Promise.reject(new Error('autoplay blocked'));this.paused=false;this.events.play();return Promise.resolve()},pause(){this.paused=true;this.events.pause()},load(){this.loads++}});
 const toggle=element(),label=element(),controls=element(),chapters=[0,7,14,20,28].map(n=>element({'data-line-chapter':String(n)}));
 const figure={querySelector:s=>({'video':video,'[data-line-toggle]':toggle,'[data-line-play-label]':label,'.line-film-controls':controls})[s],querySelectorAll:()=>chapters};
 const doc={hidden:false,events:{},querySelector:()=>figure,addEventListener(k,f){this.events[k]=f}};
 const reducedMotion={matches:reduce,addEventListener(k,f){this.change=f}},connection={saveData,addEventListener(k,f){this.change=f}};let observe;
 const window={matchMedia:()=>({matches:mobile})};if(observer)window.IntersectionObserver=true;
 vm.runInNewContext(controller,{doc,reducedMotion,navigator:{connection},currentLanguage:language,window,IntersectionObserver:function(f){observe=f;this.observe=()=>{}}});
 return {video,toggle,label,chapters,doc,controls,reducedMotion,connection,visible(value){observe([{isIntersecting:value}])}};
}
(async()=>{
 let f=fixture();assert.equal(f.video.src,undefined,'offscreen video must not load');assert.equal(f.controls.hidden,false);
 f.visible(true);assert.equal(f.video.src,'src-en');assert.equal(f.video.paused,false);
 f.video.currentTime=11;f.visible(false);assert.equal(f.video.paused,true);f.visible(true);assert.equal(f.video.paused,false);assert.equal(f.video.currentTime,11);
 f.doc.hidden=true;f.doc.events.visibilitychange();assert.equal(f.video.paused,true);f.doc.hidden=false;f.doc.events.visibilitychange();assert.equal(f.video.paused,false);
 f.toggle.events.click();assert.equal(f.video.paused,true);f.visible(false);f.visible(true);assert.equal(f.video.paused,true,'manual pause persists across viewport changes');
 f.chapters[3].events.click();assert.equal(f.video.loads,1);f.video.events.loadedmetadata();assert.equal(f.video.currentTime,23.2);assert.equal(f.video.paused,true);assert.equal(f.chapters[3].attrs['aria-current'],'step');
 f.toggle.events.click();f.reducedMotion.matches=true;f.reducedMotion.change();assert.equal(f.video.paused,true);
 for(const option of [{reduce:true},{saveData:true}]) {f=fixture({...option,mobile:true,language:'zh'});f.visible(true);assert.equal(f.video.plays,0);assert.equal(f.video.poster,'mobile-poster-zh');assert.equal(f.video.src,'mobile-src-zh');f.toggle.events.click();assert.equal(f.video.paused,false);assert.equal(f.label.textContent,'暫停');f.video.pause();f.visible(false);f.visible(true);assert.equal(f.video.paused,true,'native pause is retained');}
 f=fixture({observer:false});assert.equal(f.video.src,'src-en');assert.equal(f.video.plays,0);f.toggle.events.click();assert.equal(f.video.paused,false);
 f=fixture({rejectPlay:true});f.visible(true);await Promise.resolve();assert.equal(f.label.textContent,'Play demo');assert.equal(f.video.paused,true);
 f=fixture();f.visible(true);f.video.ended=true;f.video.pause();f.video.events.ended();f.toggle.events.click();assert.equal(f.video.currentTime,0);assert.equal(f.video.paused,false);
 console.log('LINE film: lazy loading, portrait/locale selection, chapters, replay, manual/native pause, viewport/visibility, preferences and rejected autoplay passed');
})();
