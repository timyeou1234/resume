#!/usr/bin/env node
// Exercise the production controller with a controlled viewport and animation clock.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const app = fs.readFileSync(path.join(__dirname, '../site/app.js'), 'utf8');
const controller = app.slice(app.indexOf('  (function setupProductShowcases()'), app.indexOf('  var year ='));
assert(controller.includes('setupProductShowcases'));
function element() {
  return {
    hidden: false, loading: 'lazy', dataset: {}, attrs: {}, events: {}, properties: {},
    classList: { toggle() {} },
    style: { setProperty(key, value) { this.owner.properties[key] = value; } },
    setAttribute(key, value) { this.attrs[key] = value; },
    removeAttribute(key) { delete this.attrs[key]; },
    addEventListener(key, fn) { this.events[key] = fn; }
  };
}
function fixture({ reduce = false, saveData = false } = {}) {
  const players = Array.from({length: 4}, (_, index) => {
    const e = element(); e.style.owner = e;
    e.scenes = Array.from({length: index === 1 ? 2 : 3}, element);
    e.steps = e.scenes.map(element);
    e.images = e.scenes.map(element);
    e.toggle = element(); e.label = element(); e.stage = element(); e.controls = element();
    e.toggle.querySelector = () => e.label;
    e.querySelector = selector => ({'[data-showcase-toggle]':e.toggle,'.showcase-controls':e.controls,'.showcase-stage':e.stage})[selector];
    e.querySelectorAll = selector => ({'[data-scene]':e.scenes,'[data-showcase-step]':e.steps,'img':e.images})[selector];
    return e;
  });
  const doc = { hidden: false, events: {}, querySelectorAll: () => players,
    addEventListener(name, callback) { this.events[name] = callback; } };
  const reducedMotion = { matches: reduce, addEventListener(name, callback) { this.change = callback; } };
  let callback, pending, nextID = 0;
  const window = { IntersectionObserver: true,
    requestAnimationFrame(fn) { pending = fn; return ++nextID; },
    cancelAnimationFrame() { pending = undefined; } };
  const context = {doc, window, reducedMotion, navigator: {connection:{saveData}}, currentLanguage:'en',updateShowcaseLanguage() {},
    IntersectionObserver: function(fn) { callback = fn; this.observe = () => {}; }};
  vm.runInNewContext(controller, context);
  return { players, doc, reducedMotion, context,
    visible(index, ratio = 1) { callback([{target:players[index],isIntersecting:ratio>0,intersectionRatio:ratio}]); },
    frame(time) { const fn=pending; pending=undefined; if(fn) fn(time); },
    scheduled: () => !!pending };
}
let f=fixture(), p=f.players[0];
assert.equal(f.scheduled(),false,'offscreen players do not run a timer');
f.visible(0); f.frame(1000); f.frame(7000);
assert.equal(p.dataset.activeScene,'1','a throttled frame still advances after six seconds');
assert.equal(p.scenes.filter(s=>!s.hidden).length,1);
assert.equal(p.steps[1].attrs['aria-current'],'step');
f.visible(0,0);
const offscreen = p.properties['--scene-progress'];
f.frame(90000);
assert.equal(p.properties['--scene-progress'],offscreen,'offscreen time does not count');
f.visible(0); f.frame(100000); f.frame(100100);
assert.equal(p.dataset.activeScene,'1','returning onscreen does not skip scenes');
f.doc.hidden=true; f.doc.events.visibilitychange();
assert.equal(p.dataset.playback,'paused'); assert.equal(f.scheduled(),false);
f.frame(200000);
f.doc.hidden=false; f.doc.events.visibilitychange(); f.frame(210000);
assert.equal(p.dataset.activeScene,'1','hidden-document time does not count');
p.toggle.events.click(); const paused=p.properties['--scene-progress']; f.frame(220000);
assert.equal(p.properties['--scene-progress'],paused,'user pause freezes progression');
p.steps[2].events.click(); assert.equal(p.dataset.activeScene,'2'); assert.equal(p.dataset.playback,'paused');
assert.equal(p.label.textContent,'Play');
f.context.currentLanguage='zh';f.context.updateShowcaseLanguage();assert.equal(p.label.textContent,'播放');
p.toggle.events.click(); f.frame(230000); f.frame(235600);
assert.equal(p.dataset.activeScene,'0','the last scene wraps to the first');
p.stage.events.focusin();assert.equal(p.dataset.playback,'paused','focused source links remain stable');
for (const option of [{reduce:true},{saveData:true}]) {
  const manual=fixture(option);manual.visible(0);manual.frame(1);manual.frame(6000);
  assert.equal(manual.players[0].dataset.playback,'paused','accessibility/data preference defaults to manual');
  manual.players[0].steps[1].events.click();assert.equal(manual.players[0].dataset.activeScene,'1');
  manual.players[0].toggle.events.click();manual.frame(7000);manual.frame(13000);
  assert.equal(manual.players[0].dataset.activeScene,'2','explicit play works in manual mode');
}
f=fixture();f.visible(0);f.reducedMotion.matches=true;f.reducedMotion.change();
assert.equal(f.players[0].dataset.playback,'paused','a changed motion preference stops playback');
console.log('Walkthrough lifecycle passed: throttled timing, wrap, pause, step selection, focus, offscreen, hidden document, language, reduced motion, save-data.');
