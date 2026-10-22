/* Shared by the browser and the Node.js checks. No network dependencies. */
(function (root) {
  'use strict';
  const apertures = [1.4, 2, 2.8, 4, 5.6, 8, 11, 16];
  const shutterDenominators = [2, 4, 8, 15, 30, 60, 125, 250, 500, 1000, 2000];
  const isos = [100, 200, 400, 800, 1600, 3200, 6400];
  const scenes = {
    landscape: { name: '日间风光', aperture: 5, shutter: 6, iso: 0 },
    portrait: { name: '环境人像', aperture: 2, shutter: 7, iso: 0 },
    motion: { name: '运动抓拍', aperture: 3, shutter: 9, iso: 2 }
  };
  function values(indices) {
    return { aperture: apertures[indices.aperture], seconds: 1 / shutterDenominators[indices.shutter], iso: isos[indices.iso] };
  }
  function relativeStops(current, reference) {
    for (const set of [current, reference]) {
      if (![set.aperture, set.seconds, set.iso].every(v => Number.isFinite(v) && v > 0)) throw new RangeError('Exposure values must be positive finite numbers.');
    }
    return Math.log2(current.seconds / reference.seconds) + 2 * Math.log2(reference.aperture / current.aperture) + Math.log2(current.iso / reference.iso);
  }
  function shuffle(items, random = Math.random) {
    const copy = [...items];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }
  function filterLessons(lessons, chapter, query) {
    const needle = query.trim().toLocaleLowerCase();
    return lessons.filter(l => (!chapter || l.chapter === chapter) && (!needle || [l.title, l.summary, ...(l.tags || []), ...l.points].join(' ').toLocaleLowerCase().includes(needle)));
  }
  const api = Object.freeze({ apertures, shutterDenominators, isos, scenes, values, relativeStops, shuffle, filterLessons });
  root.PhotoMath = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(globalThis);
