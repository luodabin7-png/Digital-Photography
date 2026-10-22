(function () {
  'use strict';
  const D = globalThis.PhotoData;
  const M = globalThis.PhotoMath;
  const $ = id => document.getElementById(id);
  const escape = value => String(value).replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  let chapter = 0;
  let lastLessonButton;
  const filterArea = $('chapter-filters');
  ['全部章节', ...D.chapters].forEach((name, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = index ? `${String(index).padStart(2, '0')} ${name}` : name;
    button.setAttribute('aria-pressed', String(index === 0));
    button.addEventListener('click', () => {
      chapter = index;
      [...filterArea.children].forEach((b, i) => b.setAttribute('aria-pressed', String(i === chapter)));
      renderLessons();
    });
    filterArea.append(button);
  });
  function renderLessons() {
    const lessons = M.filterLessons(D.lessons, chapter, $('lesson-search').value);
    $('result-count').textContent = `显示 ${String(lessons.length).padStart(2, '0')} / ${D.lessons.length} 个知识卡片`;
    $('empty-state').hidden = lessons.length > 0;
    $('lesson-grid').replaceChildren();
    lessons.forEach(lesson => {
      const card = document.createElement('button');
      card.type = 'button';
      card.className = 'lesson-card';
      card.setAttribute('aria-haspopup', 'dialog');
      card.innerHTML = `<span class="card-top"><span><i class="card-dot" aria-hidden="true"></i> ${escape(D.chapters[lesson.chapter - 1])}</span><span>CH.0${lesson.chapter}</span></span><h3>${escape(lesson.title)}</h3><p>${escape(lesson.summary)}</p><span class="card-bottom"><span>知识要点 / 动手练习</span><span class="card-arrow" aria-hidden="true">↗</span></span>`;
      card.addEventListener('click', () => openLesson(lesson, card));
      $('lesson-grid').append(card);
    });
  }
  function openLesson(lesson, button) {
    lastLessonButton = button;
    $('lesson-detail').innerHTML = `<p class="dialog-chapter">CH.0${lesson.chapter} / ${escape(D.chapters[lesson.chapter - 1])}</p><h2 id="dialog-title">${escape(lesson.title)}</h2><p class="dialog-summary">${escape(lesson.summary)}</p><h3>理解这几个要点</h3><ul>${lesson.points.map(p => `<li>${escape(p)}</li>`).join('')}</ul><div class="dialog-practice"><strong>TRY IT / 动手练习</strong>${escape(lesson.practice)}</div><p class="dialog-pitfall"><b>容易混淆：</b>${escape(lesson.pitfall)}</p>`;
    $('lesson-dialog').showModal();
    $('lesson-dialog').scrollTop = 0;
  }
  $('lesson-search').addEventListener('input', renderLessons);
  $('dialog-close').addEventListener('click', () => $('lesson-dialog').close());
  $('lesson-dialog').addEventListener('click', e => {
    if (e.target !== $('lesson-dialog')) return;
    const rect = e.target.getBoundingClientRect();
    if (e.clientX < rect.left || e.clientX > rect.right || e.clientY < rect.top || e.clientY > rect.bottom) e.target.close();
  });
  $('lesson-dialog').addEventListener('close', () => lastLessonButton?.focus());
  renderLessons();

  let scene = 'landscape';
  function setScene(name) {
    scene = name;
    const preset = M.scenes[scene];
    for (const key of ['aperture', 'shutter', 'iso']) $(key).value = preset[key];
    document.querySelectorAll('[data-scene]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.scene === name)));
    $('scene-name').textContent = preset.name;
    renderExposure();
  }
  function renderExposure() {
    const indices = Object.fromEntries(['aperture', 'shutter', 'iso'].map(key => [key, Number($(key).value)]));
    const current = M.values(indices);
    const stops = M.relativeStops(current, M.values(M.scenes[scene]));
    const rounded = Math.abs(stops) < .05 ? 0 : stops;
    $('aperture-value').textContent = `f/${current.aperture}`;
    $('shutter-value').textContent = `1/${M.shutterDenominators[indices.shutter]} s`;
    $('iso-value').textContent = String(current.iso);
    $('aperture').setAttribute('aria-valuetext', `f/${current.aperture}`);
    $('shutter').setAttribute('aria-valuetext', `1/${M.shutterDenominators[indices.shutter]} 秒`);
    $('iso').setAttribute('aria-valuetext', `ISO ${current.iso}`);
    $('aperture-hint').textContent = current.aperture <= 2.8 ? '大光圈：相同焦距和距离下，景深通常较浅。' : current.aperture <= 8 ? '中等光圈：在景深、进光量和镜头表现间做平衡。' : '小光圈：景深通常更大，过小光圈需留意衍射。';
    $('shutter-hint').textContent = current.seconds <= 1 / 500 ? '较快快门：有助于冻结动作，具体取决于运动速度。' : current.seconds >= 1 / 30 ? '较慢快门：容易记录运动轨迹，注意相机抖动。' : '中等快门：兼顾光量与稳定，仍需观察主体运动。';
    $('iso-hint').textContent = current.iso <= 200 ? '低 ISO：适合光量足够时使用，注意快门是否够快。' : current.iso >= 1600 ? '高 ISO：便于在弱光下维持快门，注意噪声和细节。' : '中等 ISO：结合现场光线，平衡成像亮度与细节。';
    $('ev-value').textContent = `${rounded > 0 ? '+' : ''}${rounded.toFixed(1)} 档`;
    $('exposure-status').textContent = Math.abs(stops) < .15 ? '接近场景基准' : stops > 0 ? '比场景基准更亮' : '比场景基准更暗';
    $('exposure-explanation').textContent = Math.abs(stops) < .15 ? '当前组合接近这个场景的教学基准。你也可以用不同参数组合得到相近亮度。' : `${stops > 0 ? '增加了' : '减少了'}约 ${Math.abs(stops).toFixed(1)} 档成像亮度。场景预设只用于比较，实际拍摄请测光并检查回放。`;
    $('exposure-image').style.filter = `brightness(${Math.pow(2, Math.max(-4, Math.min(3, stops))).toFixed(4)})`;
    $('meter-needle').style.left = `${50 + Math.max(-3, Math.min(3, stops)) / 3 * 50}%`;
  }
  for (const key of ['aperture', 'shutter', 'iso']) $(key).addEventListener('input', renderExposure);
  document.querySelectorAll('[data-scene]').forEach(b => b.addEventListener('click', () => setScene(b.dataset.scene)));
  $('reset-exposure').addEventListener('click', () => setScene(scene));
  setScene('landscape');

  function selectComposition(name) {
    const shapes = {
      thirds: '<line x1="200" y1="0" x2="200" y2="400"/><line x1="400" y1="0" x2="400" y2="400"/><line x1="0" y1="133.33" x2="600" y2="133.33"/><line x1="0" y1="266.67" x2="600" y2="266.67"/><circle cx="400" cy="133.33" r="5"/><circle cx="400" cy="266.67" r="5"/>',
      center: '<line x1="300" y1="0" x2="300" y2="400"/><line x1="0" y1="200" x2="600" y2="200"/><circle cx="300" cy="200" r="6"/>',
      diagonal: '<line x1="0" y1="400" x2="600" y2="0"/><line x1="0" y1="0" x2="600" y2="400"/>',
      none: ''
    };
    $('composition-overlay').innerHTML = shapes[name];
    $('composition-name').textContent = D.compositions[name].name;
    $('composition-text').textContent = D.compositions[name].text;
    document.querySelectorAll('[data-composition]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.composition === name)));
  }
  document.querySelectorAll('[data-composition]').forEach(b => b.addEventListener('click', () => selectComposition(b.dataset.composition)));
  selectComposition('thirds');
  function selectLight(name) {
    const light = D.lights[name];
    $('lighting-name').textContent = light.name;
    $('lighting-text').textContent = light.text;
    $('light-source').setAttribute('transform', `translate(${light.position[0] - 115} ${light.position[1] - 100})`);
    $('light-ray').setAttribute('d', light.ray);
    $('face-stop-a').setAttribute('stop-color', light.a);
    $('face-stop-b').setAttribute('stop-color', light.b);
    document.querySelectorAll('[data-light]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.light === name)));
  }
  document.querySelectorAll('[data-light]').forEach(b => b.addEventListener('click', () => selectLight(b.dataset.light)));
  selectLight('rembrandt');

  let questions = [], questionIndex = 0, score = 0, answered = false, mistakes = [];
  function startQuiz() {
    questions = M.shuffle(D.quiz).slice(0, 6);
    questionIndex = 0; score = 0; answered = false; mistakes = [];
    $('quiz-restart').hidden = true;
    renderQuestion();
  }
  function renderQuestion() {
    answered = false;
    $('quiz-next').hidden = true;
    $('quiz-feedback').hidden = true;
    $('quiz-feedback').replaceChildren();
    $('quiz-progress').textContent = `问题 ${String(questionIndex + 1).padStart(2, '0')} / 06`;
    $('quiz-score').textContent = `答对 ${score} 题`;
    $('quiz-progress-bar').style.width = `${questionIndex / 6 * 100}%`;
    $('quiz-question').textContent = questions[questionIndex].q;
    $('quiz-options').replaceChildren();
    questions[questionIndex].options.forEach((option, index) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'quiz-option';
      button.innerHTML = `<span aria-hidden="true">${String.fromCharCode(65 + index)}</span>${escape(option)}`;
      button.addEventListener('click', () => answerQuestion(index));
      $('quiz-options').append(button);
    });
  }
  function answerQuestion(index) {
    if (answered) return;
    answered = true;
    const question = questions[questionIndex];
    const correct = index === question.answer;
    if (correct) score++; else mistakes.push(question);
    [...$('quiz-options').children].forEach((b, i) => {
      b.disabled = true;
      if (i === question.answer) b.classList.add('correct');
      if (i === index && !correct) b.classList.add('wrong');
    });
    $('quiz-score').textContent = `答对 ${score} 题`;
    $('quiz-feedback').textContent = `${correct ? '回答正确。' : `正确答案是 ${String.fromCharCode(65 + question.answer)}。`}${question.explanation}`;
    $('quiz-feedback').hidden = false;
    $('quiz-next').textContent = questionIndex === 5 ? '查看本轮结果 →' : '下一题 →';
    $('quiz-next').hidden = false;
  }
  $('quiz-next').addEventListener('click', () => {
    if (!answered) return;
    questionIndex++;
    if (questionIndex < 6) {
      renderQuestion();
      $('quiz-options').querySelector('button').focus();
      return;
    }
    $('quiz-question').textContent = `本轮完成，答对 ${score} / 6 题`;
    $('quiz-progress').textContent = '本轮已完成';
    $('quiz-progress-bar').style.width = '100%';
    $('quiz-options').replaceChildren();
    const note = document.createElement('p');
    note.className = 'quiz-result-note';
    note.textContent = score === 6 ? '全部答对。可以把这些判断带到下一次实际拍摄中。' : '回看下面的知识点，再到实验区尝试改变一次参数。';
    $('quiz-options').append(note);
    if (mistakes.length) {
      const list = document.createElement('ul');
      list.className = 'quiz-review';
      list.innerHTML = mistakes.map(q => `<li><strong>${escape(q.q)}</strong>${escape(q.explanation)}</li>`).join('');
      $('quiz-options').append(list);
    }
    $('quiz-feedback').hidden = true;
    $('quiz-next').hidden = true;
    $('quiz-restart').hidden = false;
    $('quiz-restart').focus();
  });
  $('quiz-restart').addEventListener('click', () => {startQuiz(); $('quiz-options').querySelector('button').focus();});
  startQuiz();

  const storageKey = 'photography-lab-checklist-v1';
  let checked = new Set();
  let storageAvailable = true;
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey) || '[]');
    if (Array.isArray(saved)) checked = new Set(saved.filter(id => D.checklist.some(c => c.id === id)));
  } catch (_) {
    storageAvailable = false;
  }
  function updateChecklist(persist) {
    $('checklist-count').textContent = `${checked.size} / ${D.checklist.length}`;
    if (persist) {
      try {
        if (checked.size) localStorage.setItem(storageKey, JSON.stringify([...checked]));
        else localStorage.removeItem(storageKey);
        storageAvailable = true;
      } catch (_) { storageAvailable = false; }
    }
    $('storage-status').textContent = storageAvailable ? '' : '浏览器未开放本地存储，清单将在本次页面停留期间保留。';
  }
  D.checklist.forEach(item => {
    const label = document.createElement('label');
    label.className = 'checklist-item';
    const input = document.createElement('input');
    input.type = 'checkbox';
    input.checked = checked.has(item.id);
    input.dataset.check = item.id;
    const span = document.createElement('span');
    span.textContent = item.text;
    input.addEventListener('change', () => {
      if (input.checked) checked.add(item.id); else checked.delete(item.id);
      updateChecklist(true);
    });
    label.append(input, span);
    $('field-checklist').append(label);
  });
  $('clear-checklist').addEventListener('click', () => {
    checked.clear();
    document.querySelectorAll('[data-check]').forEach(input => {input.checked = false;});
    updateChecklist(true);
    if (storageAvailable) $('storage-status').textContent = '本地拍摄清单已清空。';
  });
  updateChecklist(false);
})();
