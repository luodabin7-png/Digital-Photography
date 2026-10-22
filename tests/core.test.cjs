'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const path = require('node:path');
const M = require('../math.js');
const context = vm.createContext({});
vm.runInContext(fs.readFileSync(path.join(__dirname, '../data.js'), 'utf8'), context);
const D = JSON.parse(JSON.stringify(context.PhotoData));
const reference = {aperture:8, seconds:1/125, iso:100};
test('Exposure time, aperture area and ISO combine in stops', () => {
  assert.equal(M.relativeStops(reference, reference), 0);
  assert.equal(M.relativeStops({...reference, seconds:1/250}, reference), -1);
  assert.equal(M.relativeStops({...reference, aperture:4}, reference), 2);
  assert.equal(M.relativeStops({...reference, iso:200}, reference), 1);
  assert.equal(M.relativeStops({aperture:4, seconds:1/1000, iso:200}, reference), 0);
});
test('Every exposed slider combination returns a finite exposure', () => {
  for (let a=0; a<M.apertures.length; a++) for(let s=0; s<M.shutterDenominators.length; s++) for(let i=0; i<M.isos.length; i++) {
    const stops = M.relativeStops(M.values({aperture:a, shutter:s, iso:i}), reference);
    assert.ok(Number.isFinite(stops));
  }
  assert.throws(() => M.relativeStops({...reference, seconds:0}, reference), RangeError);
});
test('Each scene resets to its own baseline and usable parameter indices', () => {
  for (const scene of Object.values(M.scenes)) {
    const value = M.values(scene);
    assert.equal(M.relativeStops(value, value), 0);
    assert.ok(value.aperture && value.seconds && value.iso);
  }
});
test('Search combines chapter filtering, Chinese text, case and whitespace', () => {
  assert.equal(M.filterLessons(D.lessons, 0, '').length, 21);
  assert.equal(M.filterLessons(D.lessons, 3, '').length, 3);
  assert.ok(M.filterLessons(D.lessons, 0, '  rAw  ').some(l=>l.id==='files'));
  assert.ok(M.filterLessons(D.lessons, 3, '景深').every(l=>l.chapter===3));
  assert.equal(M.filterLessons(D.lessons, 0, '完全不存在的关键词').length, 0);
});
test('Six-question rounds have no duplicates and retain the question bank', () => {
  const ids = D.quiz.map(q=>q.id);
  for (let i=0;i<100;i++) {
    const round = M.shuffle(D.quiz).slice(0,6);
    assert.equal(new Set(round.map(q=>q.id)).size, 6);
  }
  assert.deepEqual(D.quiz.map(q=>q.id), ids);
  for (const q of D.quiz) {
    assert.ok(Number.isInteger(q.answer) && q.answer>=0 && q.answer<q.options.length);
    assert.equal(new Set(q.options).size, q.options.length);
    assert.ok(q.explanation);
  }
});
test('Seven chapters have complete, unique lesson cards', () => {
  assert.equal(D.chapters.length, 7);
  assert.equal(new Set(D.lessons.map(l=>l.id)).size, 21);
  for (let i=1;i<=7;i++) assert.equal(D.lessons.filter(l=>l.chapter===i).length, 3);
  for (const l of D.lessons) assert.ok(l.title && l.summary && l.points.length>=3 && l.practice && l.pitfall);
  assert.equal(new Set(D.checklist.map(c=>c.id)).size, 6);
});
