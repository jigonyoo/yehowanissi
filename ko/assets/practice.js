/* ============================================================
   여호와 닛시 — 인터랙티브 연습 엔진 (플래시카드 · 퀴즈 · 오디오 · 진도)
   각 레슨 페이지가 <script id="lesson-cards" type="application/json"> 로 데이터를 공급.
   외부 라이브러리 없음 · 오프라인 동작 · 진도는 localStorage.
   ============================================================ */
(function () {
  'use strict';

  /* ---------- 오디오 (Vox Graeca 녹음 슬롯) ---------- */
  var current = null;
  function toast(el, msg) {
    var t = document.createElement('div');
    t.className = 'toast';
    t.textContent = msg;
    var r = el.getBoundingClientRect();
    t.style.left = (r.left + r.width / 2 + window.scrollX) + 'px';
    t.style.top = (r.top + window.scrollY) + 'px';
    document.body.appendChild(t);
    requestAnimationFrame(function () { t.classList.add('show'); });
    setTimeout(function () { t.classList.remove('show'); setTimeout(function () { t.remove(); }, 250); }, 1400);
  }
  function play(src, btn) {
    if (!src) { toast(btn, '음성 준비 중'); return; }
    try {
      if (current) { current.pause(); }
      var a = new Audio(src);
      current = a;
      btn.classList.add('is-playing');
      a.addEventListener('ended', function () { btn.classList.remove('is-playing'); });
      a.play().catch(function () { btn.classList.remove('is-playing'); toast(btn, '음성 준비 중'); });
    } catch (e) { toast(btn, '음성 준비 중'); }
  }
  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-audio]');
    if (b) { e.preventDefault(); play(b.getAttribute('data-audio'), b); }
  });

  /* ---------- 데이터 ---------- */
  var el = document.getElementById('lesson-cards');
  var cards = [];
  if (el) { try { cards = JSON.parse(el.textContent) || []; } catch (e) { cards = []; } }

  /* ---------- 플래시카드 ---------- */
  var fc = document.getElementById('flashcards');
  if (fc && cards.length) {
    var order = cards.map(function (_, i) { return i; });
    var pos = 0, flipped = false;

    function render() {
      var c = cards[order[pos]];
      var audio = c.audio ? '<button class="audio-btn" data-audio="' + c.audio + '" aria-label="발음 듣기">▶</button>' : '';
      fc.innerHTML =
        '<p class="flash__count">' + (pos + 1) + ' / ' + order.length + '</p>' +
        '<div class="flash__card" id="fcard">' +
          '<div class="flash__letter grk">' + c.letter + '</div>' +
          '<div class="flash__hint">눌러서 확인하기</div>' +
          '<div class="flash__back">' +
            '<div class="flash__name">' + c.name + ' ' + audio + '</div>' +
            '<div class="flash__ipa grk">' + (c.ipa || '') + '</div>' +
            '<div class="flash__kr">' + c.kr + '</div>' +
            (c.note ? '<div class="flash__note">' + c.note + '</div>' : '') +
          '</div>' +
        '</div>' +
        '<div class="flash__controls">' +
          '<button class="mini-btn" data-fc="flip">' + (flipped ? '감추기' : '확인하기') + '</button>' +
          '<button class="mini-btn" data-fc="prev">← 이전</button>' +
          '<button class="mini-btn" data-fc="next">다음 →</button>' +
          '<button class="mini-btn" data-fc="shuffle">섞기</button>' +
        '</div>';
      fc.classList.toggle('is-flipped', flipped);
    }
    // wrap fc content in a .flash shell once
    fc.classList.add('flash');

    function setFlipBtn(){ var b=fc.querySelector('[data-fc="flip"]'); if(b) b.textContent = flipped ? '감추기' : '확인하기'; }
    function go(n) { pos = (n + order.length) % order.length; flipped = false; render(); }
    fc.addEventListener('click', function (e) {
      var card = e.target.closest('#fcard');
      var btn = e.target.closest('[data-fc]');
      if (e.target.closest('[data-audio]')) return;
      if (btn) {
        var a = btn.getAttribute('data-fc');
        if (a === 'flip') { flipped = !flipped; fc.classList.toggle('is-flipped', flipped); setFlipBtn(); }
        else if (a === 'next') go(pos + 1);
        else if (a === 'prev') go(pos - 1);
        else if (a === 'shuffle') { for (var i = order.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = order[i]; order[i] = order[j]; order[j] = t; } go(0); }
      } else if (card) { flipped = !flipped; fc.classList.toggle('is-flipped', flipped); setFlipBtn(); }
    });
    render();
  }

  /* ---------- 퀴즈 (글자 → 소리 고르기) ---------- */
  var qz = document.getElementById('quiz');
  if (qz && cards.length >= 4) {
    var N = Math.min(8, cards.length), qi = 0, score = 0, quizOrder = [];
    function shuffleArr(arr) { for (var i = arr.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = arr[i]; arr[i] = arr[j]; arr[j] = t; } return arr; }
    function startQuiz() {
      qi = 0; score = 0;
      quizOrder = shuffleArr(cards.map(function (_, i) { return i; })).slice(0, N);
      renderQ();
    }
    function renderQ() {
      if (qi >= quizOrder.length) { return finishQuiz(); }
      var c = cards[quizOrder[qi]];
      var opts = [c.kr];
      var pool = shuffleArr(cards.filter(function (x) { return x.kr !== c.kr; }).map(function (x) { return x.kr; }));
      for (var k = 0; k < pool.length && opts.length < 4; k++) { if (opts.indexOf(pool[k]) === -1) opts.push(pool[k]); }
      opts = shuffleArr(opts);
      qz.innerHTML =
        '<div class="quiz__head"><span class="quiz__q">문제 ' + (qi + 1) + ' / ' + quizOrder.length + '</span><span class="quiz__score">' + score + '점</span></div>' +
        '<div class="quiz__prompt"><span class="glyph grk">' + c.letter + '</span><span class="ask">이 글자의 소리는?</span></div>' +
        '<div class="quiz__opts">' + opts.map(function (o) { return '<button class="quiz__opt" data-kr="' + o + '">' + o + '</button>'; }).join('') + '</div>';
    }
    function finishQuiz() {
      var msg = score === quizOrder.length ? '완벽합니다! 생김새를 다 익히셨네요.' : (score >= quizOrder.length - 2 ? '거의 다 왔어요. 조금만 더!' : '천천히 다시 한 번 익혀 볼까요?');
      qz.innerHTML = '<div class="quiz__done"><p><b>' + score + ' / ' + quizOrder.length + '</b></p><p style="color:var(--ink-soft);font-size:.95rem">' + msg + '</p><button class="mini-btn mini-btn--wide" data-quiz="retry">다시 풀기</button></div>';
    }
    qz.addEventListener('click', function (e) {
      var opt = e.target.closest('.quiz__opt');
      var re = e.target.closest('[data-quiz="retry"]');
      if (re) { return startQuiz(); }
      if (opt && !opt.disabled) {
        var c = cards[quizOrder[qi]];
        var chosen = opt.getAttribute('data-kr');
        Array.prototype.forEach.call(qz.querySelectorAll('.quiz__opt'), function (b) {
          b.disabled = true;
          if (b.getAttribute('data-kr') === c.kr) b.classList.add('correct');
          else if (b === opt) b.classList.add('wrong');
        });
        if (chosen === c.kr) score++;
        setTimeout(function () { qi++; renderQ(); }, 850);
      }
    });
    startQuiz();
  }

  /* ---------- 진도 (완료 표시) ---------- */
  var body = document.body;
  var lesson = body.getAttribute('data-lesson');
  var doneBtn = document.getElementById('mark-done');
  if (lesson) {
    var KEY = 'yn.progress.' + lesson;
    function refresh() {
      var done = localStorage.getItem(KEY) === 'done';
      body.classList.toggle('is-complete', done);
      if (doneBtn) doneBtn.textContent = done ? '완료 취소' : '이 과 완료로 표시';
    }
    if (doneBtn) {
      doneBtn.addEventListener('click', function () {
        if (localStorage.getItem(KEY) === 'done') localStorage.removeItem(KEY);
        else localStorage.setItem(KEY, 'done');
        refresh();
      });
    }
    try { refresh(); } catch (e) {}
  }
})();
