// ═══════════════════════════════════════════════════════
//  APICADEMY – v2 · Rollen · Quiz · Gamification
// ═══════════════════════════════════════════════════════

const CHF = new Intl.NumberFormat('de-CH',{style:'currency',currency:'CHF'});

// ── STATE ──────────────────────────────────────────────
const state = {
  xp: 6800, xpMax: 10000, level: 42, streak: 12,
  activeCourseId: null,
  completedCourses: new Set(),
  courseProgress: {0:99, 1:99, 2:99, 3:99, 4:99, 5:99},
  role: 'student',            // 'student' | 'dozent' | 'admin'
  quizPending: null,          // course id waiting for quiz to complete
};

// ── DATA ───────────────────────────────────────────────
const courses = [
  {id:0, title:'Fortgeschrittene Algorithmen', desc:'Meistern Sie komplexe Datenstrukturen und effiziente Lösungswege.', price:99, level:'FORTGESCHRITTEN', xp:500},
  {id:1, title:'Einführung in KI‑Ethik',        desc:'Verstehen Sie die moralischen Grundlagen und gesellschaftlichen Folgen.', price:20, level:'GRUNDLAGEN', xp:200},
  {id:2, title:'Cyber Security Architect',      desc:'Entwickeln Sie sichere Infrastrukturen gegen digitale Angriffe.', price:72, level:'FORTGESCHRITTEN', xp:480},
  {id:3, title:'Modernes Fullstack React',      desc:'Von Zero bis Deploy: leistungsstarke Web‑Apps erstellen.', price:42, level:'MITTELSTUFE', xp:350},
  {id:4, title:'Deep Learning Foundations',     desc:'Neuronale Netze, Training und Evaluation von Grund auf.', price:68, level:'MASTERCLASS', xp:600},
  {id:5, title:'Quantum Security Protocols',    desc:'Sicherheit für die nächste Computing‑Generation.', price:42, level:'ADVANCED', xp:520},
];

const students = [
  {name:'Marc‑André Weber',  course:'Advanced Python for AI',  progress:82,  activity:'Aktiv',          grade:'1.3', weaknesses:['Rekursion','Async/Await','Datenstrukturen']},
  {name:'Sarah Al‑Farsi',    course:'UX Research Mastery',     progress:45,  activity:'Gestern, 18:42', grade:'2.1', weaknesses:['Prototyping','Nutzerinterviews']},
  {name:'Lukas Berger',      course:'Cybersecurity Basics',    progress:100, activity:'Aktiv',          grade:'1.0', weaknesses:[]},
  {name:'Elena Petrova',     course:'Advanced Python for AI',  progress:12,  activity:'Vor 12 Tagen',   grade:'3.7', weaknesses:['OOP','Algorithmen','Testing','Zeitmanagement']},
];

const resources = [
  ['Grundlagen der KI – Modul 1','Ordner','12. Okt 2023','AI101','Alle Studenten'],
  ['Vorlesungsskript_Woche_04.pdf','PDF‑Dokument','Gestern, 14:30','AI101','Nur Dozenten'],
  ['Neural_Networks_Intro.mp4','Video (4K)','08. Okt 2023','DS400','Alle Studenten'],
  ['Python_Uebung_Set_2.zip','Archiv','05. Okt 2023','AI202','Kursteilnehmer'],
];

const weaknessesSelf = ['Gradient Descent (visuell)','Backpropagation','Regularisierung','Attention Mechanisms','Batch Normalization'];

// ── QUIZ DATA ──────────────────────────────────────────
const quizBank = {
  0: [
    {q:'Was ist die Zeitkomplexität von Quicksort im Durchschnittsfall?',
     opts:['O(n²)','O(n log n)','O(log n)','O(n)'],
     correct:1, tip:'Quicksort teilt das Array rekursiv und erreicht O(n log n) im Durchschnitt.'},
    {q:'Welche Datenstruktur verwendet LIFO-Prinzip?',
     opts:['Queue','Heap','Stack','Linked List'],
     correct:2, tip:'Stack = Last In, First Out – wie ein Bücherstapel.'},
  ],
  1: [
    {q:'Was beschreibt der Begriff "algorithmische Fairness"?',
     opts:['Rechengeschwindigkeit eines Algorithmus','Gleichbehandlung aller Gruppen durch ein KI-System','Energie-Effizienz von KI-Modellen','Anzahl von Trainingsschritten'],
     correct:1, tip:'Algorithmische Fairness zielt auf die faire Behandlung verschiedener demographischer Gruppen ab.'},
  ],
  2: [
    {q:'Was ist ein SQL-Injection-Angriff?',
     opts:['Denial-of-Service via Datenbank','Einschleusen von SQL-Code über Eingabefelder','Verschlüsselung von Datenbankdaten','Unbefugter Zugriff auf Netzwerke'],
     correct:1, tip:'SQL-Injection manipuliert Datenbankabfragen durch ungesäuberte Nutzereingaben.'},
  ],
  3: [
    {q:'Was ist der Unterschied zwischen useState und useRef in React?',
     opts:['Es gibt keinen','useState löst Re-renders aus, useRef nicht','useRef ist neuer','useState ist nur für Strings'],
     correct:1, tip:'useState triggert Re-renders bei Änderungen, useRef speichert Werte ohne Re-render.'},
  ],
  4: [
    {q:'Was macht Backpropagation in einem neuronalen Netz?',
     opts:['Vorwärtsdurchlauf durch das Netz','Berechnung von Gradienten rückwärts durch das Netz','Initialisierung der Gewichte','Normalisierung der Eingabedaten'],
     correct:1, tip:'Backprop berechnet den Gradienten des Verlusts für alle Gewichte mittels Kettenregel.'},
  ],
  5: [
    {q:'Was ist der Hauptvorteil von Quantenkryptographie?',
     opts:['Schnellere Verschlüsselung','Theoretisch unknackbar durch Quantenmechanik','Günstigere Hardware','Einfachere Implementierung'],
     correct:1, tip:'Quantenkryptographie nutzt physikalische Gesetze der Quantenmechanik für absolute Sicherheit.'},
  ],
};

// ── XP / GAMIFICATION ──────────────────────────────────
function awardXP(amount, label='') {
  state.xp = Math.min(state.xp + amount, state.xpMax);
  updateXPBar();
  showXPToast(`+${amount} XP ${label}`);
  if (state.xp >= state.xpMax) {
    setTimeout(()=>{ state.level++; state.xp = 0; updateXPBar(); showLevelModal(); }, 1200);
  }
}

function updateXPBar() {
  const pct = (state.xp / state.xpMax) * 100;
  const fill = document.getElementById('sidebarXpFill');
  const val  = document.getElementById('sidebarXpVal');
  if (fill) fill.style.width = pct + '%';
  if (val)  val.textContent = state.xp.toLocaleString('de-CH');
}

function showXPToast(msg) {
  const el = document.getElementById('xpToast');
  if (!el) return;
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(el._t);
  el._t = setTimeout(()=>el.classList.remove('show'), 2800);
}

function showLevelModal() {
  const lvl = document.getElementById('modalLevel');
  if (lvl) lvl.textContent = 'Level ' + state.level;
  const m = document.getElementById('levelModal');
  if (m) m.classList.remove('hidden');
}

function closeModal() {
  document.getElementById('levelModal').classList.add('hidden');
}

// ── CONFETTI ────────────────────────────────────────────
function launchConfetti() {
  const canvas = document.getElementById('confettiCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const colors = ['#00f5e4','#9d6cff','#ffcf3f','#2bde7e','#ff8c42','#ff5561','#40fff5'];
  const particles = Array.from({length:140}, ()=>({
    x: Math.random() * canvas.width,
    y: -10 - Math.random() * 100,
    r: 4 + Math.random() * 6,
    color: colors[Math.floor(Math.random() * colors.length)],
    vx: (Math.random() - .5) * 4,
    vy: 2.5 + Math.random() * 3.5,
    rot: Math.random() * Math.PI * 2,
    rotV: (Math.random() - .5) * .15,
    shape: Math.random() > .5 ? 'rect' : 'circle',
    life: 1,
  }));

  let frame;
  function draw() {
    ctx.clearRect(0,0,canvas.width, canvas.height);
    let alive = false;
    for (const p of particles) {
      p.x += p.vx; p.y += p.vy; p.rot += p.rotV; p.vy += .05;
      if (p.y < canvas.height + 20) alive = true;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.globalAlpha = Math.min(1, (canvas.height - p.y) / 150);
      ctx.fillStyle = p.color;
      if (p.shape === 'rect') {
        ctx.fillRect(-p.r, -p.r/2, p.r*2, p.r);
      } else {
        ctx.beginPath(); ctx.arc(0,0,p.r,0,Math.PI*2); ctx.fill();
      }
      ctx.restore();
    }
    if (alive) frame = requestAnimationFrame(draw);
    else ctx.clearRect(0,0,canvas.width,canvas.height);
  }
  cancelAnimationFrame(frame);
  draw();

  // ring burst
  const overlay = document.createElement('div');
  overlay.className = 'celebrate-overlay';
  overlay.innerHTML = '<div class="celebrate-ring"></div>';
  document.body.appendChild(overlay);
  setTimeout(()=>overlay.remove(), 1200);
}

// ── QUIZ MODAL ──────────────────────────────────────────
let quizState = {courseId:null, questions:[], idx:0, answered:false};

function openQuiz(courseId) {
  quizState = {
    courseId,
    questions: quizBank[courseId] || [{
      q:'Bist du bereit, diesen Kurs zu starten?',
      opts:['Ja, los geht\'s!','Noch kurz durchatmen...','Ich bin top vorbereitet!','Challenge accepted!'],
      correct:0, tip:'Super Einstellung! Viel Erfolg beim Kurs! 🚀'
    }],
    idx:0, answered:false
  };
  renderQuiz();
  document.getElementById('quizModal').classList.remove('hidden');
}

function renderQuiz() {
  const {questions, idx, answered} = quizState;
  const q = questions[idx];
  const total = questions.length;

  const dots = questions.map((_,i)=>`
    <div class="quiz-dot ${i < idx ? 'done' : i === idx ? 'active' : ''}"></div>
  `).join('');

  document.getElementById('quizContent').innerHTML = `
    <div class="quiz-dots">${dots}</div>
    <div class="quiz-context">
      📚 Kurs: <strong>${courses[quizState.courseId].title}</strong>
      <span class="muted" style="margin-left:12px;font-size:11px">Frage ${idx+1} von ${total}</span>
    </div>
    <div class="quiz-question">${q.q}</div>
    <div class="quiz-options">
      ${q.opts.map((o,i)=>`
        <button class="quiz-opt" onclick="answerQuiz(${i})" ${answered?'disabled':''}>
          <span style="color:var(--muted);font-family:var(--mono);margin-right:10px;font-size:11px">${String.fromCharCode(65+i)}</span>
          ${o}
        </button>`).join('')}
    </div>
    <div class="quiz-feedback" id="quizFeedback"></div>
    <div style="display:flex;justify-content:space-between;align-items:center">
      <button class="ghost" onclick="closeQuiz()">Abbrechen</button>
      <button class="primary" id="quizNextBtn" onclick="quizNext()" style="display:none">
        ${idx + 1 < total ? 'Nächste Frage →' : 'Kurs starten! 🚀'}
      </button>
    </div>
  `;
}

function answerQuiz(chosen) {
  if (quizState.answered) return;
  quizState.answered = true;
  const q = quizState.questions[quizState.idx];
  const opts = document.querySelectorAll('.quiz-opt');
  const fb = document.getElementById('quizFeedback');
  const nextBtn = document.getElementById('quizNextBtn');

  opts.forEach((el,i) => {
    el.disabled = true;
    if (i === q.correct) el.classList.add('correct');
    else if (i === chosen && chosen !== q.correct) el.classList.add('wrong');
  });

  if (chosen === q.correct) {
    fb.className = 'quiz-feedback correct';
    fb.textContent = '✓ Richtig! ' + q.tip;
    awardXP(25, '– Quizfrage korrekt');
  } else {
    fb.className = 'quiz-feedback wrong';
    fb.textContent = '✗ Nicht ganz. ' + q.tip;
  }
  if (nextBtn) nextBtn.style.display = 'inline-flex';
}

function quizNext() {
  const {questions, idx} = quizState;
  if (idx + 1 < questions.length) {
    quizState.idx++;
    quizState.answered = false;
    renderQuiz();
  } else {
    // All questions done – actually start course
    closeQuiz();
    startCourse(quizState.courseId);
  }
}

function closeQuiz() {
  document.getElementById('quizModal').classList.add('hidden');
}

// ── COURSE START (Simple Question) ─────────────────────
let _pendingCourseStartId = null;

function openCourseStartModal(courseId) {
  _pendingCourseStartId = courseId;

  const title = document.querySelector('#courseStartModal h2');
  const question = document.getElementById('courseQuestion');
  const submitBtn = document.querySelector('#courseStartModal .primary');

  if (title) title.textContent = 'Kurs abschliessen';
  if (question) question.innerHTML = `Der Kurs <strong>${courses[courseId].title}</strong> steht bei 99%.<br>Kurze Abschlussfrage: Wie viel ist <strong>2 + 2</strong>?`;
  if (submitBtn) submitBtn.textContent = 'Antwort prüfen';

  const modal = document.getElementById('courseStartModal');
  if (modal) {
    modal.classList.remove('hidden');
    setTimeout(() => {
      const input = document.getElementById('courseAnswer');
      if (input) input.focus();
    }, 100);
  }
}

function submitCourseStart() {
  const input = document.getElementById('courseAnswer');
  if (!input || !input.value.trim()) {
    showXPToast('⚠ Bitte beantworte die Frage!');
    return;
  }

  const answer = input.value.trim().toLowerCase().replace(/\s+/g, '');
  const isCorrect = ['4', 'vier'].includes(answer);

  if (!isCorrect) {
    showXPToast('✗ Falsch. Versuch es nochmals.');
    input.select();
    return;
  }

  const courseId = _pendingCourseStartId;
  closeCourseStartModal();

  if (courseId === null) return;

  // Kurs bleibt zuerst sichtbar bei 99%, dann kommen Effekte, danach wird auf 100% gesetzt.
  state.courseProgress[courseId] = 99;
  showXPToast('✓ Richtig! Kurs wird abgeschlossen...');
  render(currentPage);

  setTimeout(() => {
    launchConfetti();
    awardXP(courses[courseId].xp, '– Kurs abgeschlossen! 🎉');

    setTimeout(() => {
      state.completedCourses.add(courseId);
      state.activeCourseId = null;
      state.courseProgress[courseId] = 100;
      render(currentPage);
      _pendingCourseStartId = null;
    }, 1200);
  }, 250);
}

function closeCourseStartModal() {
  const modal = document.getElementById('courseStartModal');
  if (modal) modal.classList.add('hidden');
  const input = document.getElementById('courseAnswer');
  if (input) input.value = '';
}

// ── COURSE END MODAL ────────────────────────────────────
let _pendingEndId = null;

function confirmEndCourseModal(id) {
  _pendingEndId = id;
  const nameEl = document.getElementById('courseEndName');
  if (nameEl) nameEl.textContent = `„${courses[id].title}" wirklich abschliessen und +${courses[id].xp} XP erhalten?`;
  document.getElementById('courseEndModal').classList.remove('hidden');
}

function confirmCourseEnd() {
  document.getElementById('courseEndModal').classList.add('hidden');
  if (_pendingEndId !== null) {
    completeCourse(_pendingEndId);
    _pendingEndId = null;
  }
}

function closeCourseEndModal() {
  document.getElementById('courseEndModal').classList.add('hidden');
  _pendingEndId = null;
}

// ── WEAKNESS MODAL (UC-03) ──────────────────────────────
function openWeaknessModal() {
  const list = document.getElementById('weaknessModalList');
  if (list) list.innerHTML = weaknessesSelf.map(w => `<div class="weakness-tag">${w}</div>`).join('');
  const bars = document.getElementById('weaknessSkillBars');
  if (bars) bars.innerHTML = [
    ['Abstrakte Logik', 90, 'green'],
    ['Syntax', 75, 'cyan'],
    ['Kreativität', 60, 'yellow'],
    ['Präzision', 42, 'red']
  ].map(([l, v, c]) => `
    <div style="margin-bottom:10px">
      <div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:4px">
        <span>${l}</span><span class="${c} mono">${v}%</span>
      </div>
      <div class="progress" style="height:4px"><span style="width:${v}%;background:var(--${c});box-shadow:none"></span></div>
    </div>`).join('');
  document.getElementById('weaknessModal').classList.remove('hidden');
}

function closeWeaknessModal() {
  document.getElementById('weaknessModal').classList.add('hidden');
}


function getCourseButtonState(id) {
  if (state.completedCourses.has(id)) return 'done';
  return 'start';
}

function handleCourseAction(id) {
  const btnState = getCourseButtonState(id);
  if (btnState === 'start') {
    openCourseStartModal(id);
  } else {
    render('kiTutor');
  }
}

function startCourse(id) {
  // Nicht mehr separat starten: Kurse stehen bei 99% und werden über die Abschlussfrage beendet.
  openCourseStartModal(id);
}

function completeCourse(id) {
  state.completedCourses.add(id);
  state.activeCourseId = null;
  state.courseProgress[id] = 100;
  // Fire celebration
  setTimeout(()=>{
    launchConfetti();
    awardXP(courses[id].xp, '– Kurs abgeschlossen! 🎉');
  }, 200);
  render(currentPage);
}

// ── STUDENT DETAIL MODAL ────────────────────────────────
function openStudentModal(idx) {
  const s = students[idx];
  document.getElementById('studentModalName').textContent  = s.name;
  document.getElementById('studentModalCourse').textContent = s.course;
  document.getElementById('sdProgress').textContent        = s.progress + '%';
  document.getElementById('sdProgressBar').style.width     = s.progress + '%';
  document.getElementById('sdGrade').textContent           = s.grade;
  document.getElementById('sdActivity').textContent        = s.activity;
  const status = s.progress===100 ? '✓ Abgeschlossen' : s.activity==='Aktiv' ? '● Aktiv' : '○ Inaktiv';
  const statusEl = document.getElementById('sdStatus');
  statusEl.textContent = status;
  statusEl.className = 'stat-value ' + (s.progress===100?'cyan':s.activity==='Aktiv'?'green':'red');
  const wl = document.getElementById('sdWeakness');
  if (s.weaknesses.length === 0) {
    wl.innerHTML = '<span style="color:var(--green);font-size:13px">✓ Keine Schwachpunkte erkannt</span>';
  } else {
    wl.innerHTML = s.weaknesses.map(w=>`<div class="weakness-tag">${w}</div>`).join('');
  }
  document.getElementById('studentModal').classList.remove('hidden');
}

function closeStudentModal() {
  document.getElementById('studentModal').classList.add('hidden');
}

// ── ROLE SWITCHER ───────────────────────────────────────
function setRole(role) {
  state.role = role;
  // Update sidebar class for colour theming
  document.querySelector('.sidebar').className = `sidebar role-${role}`;
  // Update role buttons
  document.querySelectorAll('.role-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.role === role);
  });
  // Update user-mini label
  const labels = {student:'Level 42 Explorer', dozent:'Dozenten-Ansicht', admin:'Administrator'};
  const small = document.querySelector('.user-mini small');
  if (small) small.textContent = labels[role];
  // Show/hide admin nav items
  updateNavForRole();
  render(currentPage);
}

function updateNavForRole() {
  const adminOnly = [];  // Nothing fully admin-only in nav
  const studentHidden = ['benutzer'];
  document.querySelectorAll('nav button').forEach(btn => {
    const page = btn.dataset.page;
    if (state.role === 'student') {
      btn.style.display = studentHidden.includes(page) ? 'none' : '';
    } else {
      btn.style.display = '';
    }
  });
}

function switchAnalyseTab(btn, period) {
  btn.parentElement.querySelectorAll('button').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  // Visual feedback only – data toggle could be extended
  showXPToast(period === 'month' ? '📊 Monatsansicht' : '📊 Wochenansicht');
}

// ── COMPONENT BUILDERS ─────────────────────────────────
function courseCard(c) {
  const prog = state.courseProgress[c.id] || 0;
  const btnState = getCourseButtonState(c.id);
  const btnLabel = {start:'Kurs abschliessen', running:'Kurs beenden', done:'Wiederholen'}[btnState];
  const btnClass = {start:'btn-start', running:'btn-running', done:'btn-done'}[btnState];
  const ringOffset = 188 - (188 * prog / 100);

  return `<div class="card course">
    <div class="course-img"></div>
    <span class="badge ${c.level==='GRUNDLAGEN'?'green':c.level==='MITTELSTUFE'?'':c.level==='MASTERCLASS'?'yellow':'purple'}">${c.level}</span>
    <h3 style="margin-top:8px">${c.title}</h3>
    <p>${c.desc}</p>
    <div class="progress-ring-wrap">
      <svg class="progress-ring" width="56" height="56" viewBox="0 0 60 60">
        <circle class="ring-bg" cx="30" cy="30" r="24"/>
        <circle class="ring-fill" cx="30" cy="30" r="24" style="stroke-dashoffset:${ringOffset}"/>
      </svg>
      <div>
        <div style="font-family:var(--syne);font-size:11px;color:var(--muted);text-transform:uppercase;letter-spacing:.08em">Fortschritt</div>
        <div class="cyan" style="font-family:var(--syne);font-weight:900;font-size:18px">${prog}%</div>
      </div>
    </div>
    <div class="course-meta">
      <span class="muted mono" style="font-size:11px">+${c.xp} XP</span>
      ${btnState==='running'?'<span class="orange mono" style="font-size:11px">● Laufend</span>':''}
    </div>
    <button class="primary ${btnClass}" onclick="handleCourseAction(${c.id})">${btnLabel}</button>
  </div>`;
}

function stat(label, value, sub, color='cyan') {
  return `<div class="card">
    <span class="muted" style="font-size:11px;text-transform:uppercase;letter-spacing:.1em">${label}</span>
    <div class="stat-value" style="margin-top:5px">${value}</div>
    <small class="${color}" style="font-size:11px">${sub}</small>
  </div>`;
}

function rank(n, name, xp, meta, first=false) {
  const medals = {1:'🥇',2:'🥈',3:'🥉'};
  return `<div class="card ${first?'rank-first':''}">
    <div class="rank-medal">${medals[n]||n}</div>
    <div class="rank-avatar">${name[0]}</div>
    <h3>${name}</h3>
    <div class="rank-xp cyan">${xp}</div>
    <p style="font-size:12px;margin-top:5px">${meta}</p>
  </div>`;
}

function table(rows, heads) {
  return `<table class="table">
    <thead><tr>${heads.map(h=>`<th>${h}</th>`).join('')}</tr></thead>
    <tbody>${rows.map(r=>`<tr>${r.map(c=>`<td>${c}</td>`).join('')}</tr>`).join('')}</tbody>
  </table>`;
}

function lineSvg() {
  return `<svg viewBox="0 0 600 220" preserveAspectRatio="none">
    <defs>
      <linearGradient id="lg" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="var(--cyan)" stop-opacity=".22"/>
        <stop offset="100%" stop-color="var(--cyan)" stop-opacity="0"/>
      </linearGradient>
    </defs>
    <path d="M0,170 C70,95 130,190 190,150 S300,70 360,120 S470,210 520,145 S570,110 600,70"
          fill="none" stroke="var(--cyan)" stroke-width="2.5"/>
    <path d="M0,170 C70,95 130,190 190,150 S300,70 360,120 S470,210 520,145 S570,110 600,70 L600,220 L0,220 Z"
          fill="url(#lg)"/>
    ${[[0,170],[190,150],[360,120],[520,145],[600,70]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="4" fill="var(--cyan)" opacity=".8"/>`).join('')}
  </svg>`;
}

// ── ROLE-SPECIFIC BANNER ────────────────────────────────
function roleBanner() {
  if (state.role === 'dozent') return `
    <div class="role-banner dozent-banner">
      <span class="rb-icon">🎓</span>
      <div>
        <h2 style="color:var(--purple)">Dozenten-Ansicht</h2>
        <p>Du siehst erweiterte Statistiken, Studentenfortschritte und Kursverwaltung.</p>
      </div>
    </div>`;
  if (state.role === 'admin') return `
    <div class="role-banner admin-banner">
      <span class="rb-icon">⚙</span>
      <div>
        <h2 style="color:var(--yellow)">Administrator-Ansicht</h2>
        <p>Vollzugriff auf alle Systemfunktionen, Nutzer, Kurse und Konfigurationen.</p>
      </div>
    </div>`;
  return '';
}

// ── PAGES ──────────────────────────────────────────────
const pages = {
  dashboard() {
    const running = state.activeCourseId !== null;
    return `<div class="page-enter">
    ${roleBanner()}
    <div class="hero">
      <h1>Willkommen zurück, Alexander</h1>
      <p>Du hast heute 3 Lektionen abgeschlossen. Fokus: <b class="cyan">Deep Learning Architekturen</b>.</p>
      <div class="hero-stats">
        <div class="hero-stat"><div class="hs-val cyan">Lv.${state.level}</div><div class="hs-lbl">Level</div></div>
        <div class="hero-stat"><div class="hs-val yellow">${state.streak}</div><div class="hs-lbl">Streak</div></div>
        <div class="hero-stat" style="cursor:pointer" onclick="render('analysen')" title="Analysen anzeigen"><div class="hs-val">${(state.xp/1000).toFixed(1)}k</div><div class="hs-lbl" style="color:var(--cyan)">XP ↗</div></div>
        <div class="hero-stat" style="cursor:pointer" onclick="render('rangliste')" title="Rangliste anzeigen"><div class="hs-val green">${state.completedCourses.size}</div><div class="hs-lbl" style="color:var(--green)">Abgeschlossen ↗</div></div>
      </div>
    </div>

    ${running?`<div class="card highlight" style="margin-bottom:18px;display:flex;align-items:center;gap:16px;flex-wrap:wrap">
      <span style="font-size:22px">▶</span>
      <div>
        <div class="muted" style="font-size:11px;text-transform:uppercase">Aktiver Kurs</div>
        <b>${courses[state.activeCourseId].title}</b>
      </div>
      <button class="primary btn-running" style="margin-left:auto" onclick="handleCourseAction(${state.activeCourseId})">Kurs beenden</button>
    </div>`:''}

    <div class="grid cols-2">
      <section>
        <h2>Deine aktiven Kurse</h2>
        <div class="grid cols-equal-2">${courses.slice(2,4).map(courseCard).join('')}</div>
        <h2 style="margin-top:28px">Lernstatistik</h2>
        <div class="card">
          <div class="chart">
            ${[38,62,86,100,28,16,52].map((h,i)=>`<div class="bar" style="left:${i*14}%;height:${h}%"></div>`).join('')}
          </div>
          <div class="grid cols-equal-2" style="margin-top:12px">
            <div><span class="muted" style="font-size:11px">Wöchentl. Durchschnitt</span><div class="stat-value" style="font-size:20px">4.2 Std.</div></div>
            <div><span class="muted" style="font-size:11px">Lernserie</span><div class="stat-value cyan" style="font-size:20px">🔥 ${state.streak} Tage</div></div>
          </div>
        </div>
      </section>
      <aside class="grid" style="align-content:start">
        <div class="card">
          <h3>KI‑Tutor Empfehlungen</h3>
          <p style="margin:8px 0;font-size:13px"><b>Gradient Descent visuell</b> · 8 Min</p>
          <p style="font-size:13px"><b>CNN Architekturen Review</b> · 5 Fragen</p>
          <button class="outline" style="margin-top:12px;width:100%" data-go="kiTutor">Mit Tutor sprechen</button>
        </div>
        <div class="card">
          <h3>⚠ Meine Schwachpunkte <span class="badge" style="font-size:9px">${weaknessesSelf.length}</span></h3>
          <div class="weakness-list">${weaknessesSelf.slice(0,3).map(w=>`<div class="weakness-tag">${w}</div>`).join('')}</div>
          <div style="display:flex;gap:8px;margin-top:12px">
            <button class="outline" style="flex:1" onclick="openWeaknessModal()">Details ansehen</button>
            <button class="outline" style="flex:1" data-go="analysen">Analysen</button>
          </div>
        </div>
        ${state.role !== 'student' ? `<div class="card purple-glow">
          <h3 style="color:var(--purple)">📊 Dozentenübersicht</h3>
          <p style="font-size:12px">${students.filter(s=>s.activity==='Aktiv').length} Studenten aktiv · ${students.filter(s=>s.weaknesses.length>2).length} brauchen Unterstützung</p>
          <button class="outline" style="border-color:var(--purple);color:var(--purple);margin-top:10px;width:100%" data-go="benutzer">Studenten ansehen</button>
        </div>` : ''}
        <div class="card">
          <h3>Nächste Termine</h3>
          <p style="font-size:13px"><b>14. Okt</b> – Projekt‑Abgabe<br><span class="muted">Python Scripting Framework</span></p>
          <p style="margin-top:8px;font-size:13px"><b>17. Okt</b> – Live Session<br><span class="muted">Design Systems Deep Dive</span></p>
        </div>
      </aside>
    </div>
    </div>`;
  },

  kurse() {
    return `<div class="page-enter">
    ${roleBanner()}
    <h1>Meine Kurse</h1>
    <p>Setze deine Lernreise fort – oder starte einen neuen Kurs.</p>
    <div class="tabs">
      <button class="active">Alle (${courses.length})</button>
      <button>Aktiv (${state.activeCourseId!==null?1:0})</button>
      <button>Abgeschlossen (${state.completedCourses.size})</button>
    </div>
    ${state.role !== 'student' ? `<div class="card" style="margin-bottom:16px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px">
      <div><h3 style="margin:0">Kursverwaltung</h3><p style="font-size:12px;margin:0">${state.role==='admin'?'Kurse erstellen, bearbeiten & archivieren':'Kurse bearbeiten & Materialien hochladen'}</p></div>
      <div style="display:flex;gap:8px;flex-wrap:wrap">
        <button class="outline" style="font-size:11px;padding:7px 12px">+ Neuer Kurs</button>
        ${state.role==='admin'?'<button class="outline" style="font-size:11px;padding:7px 12px;border-color:var(--yellow);color:var(--yellow)">⚙ Konfiguration</button>':''}
      </div>
    </div>` : ''}
    <div class="grid cols-equal-2" style="gap:18px">${courses.map(courseCard).join('')}</div>
    </div>`;
  },

  kiTutor() {
    return `<div class="page-enter"><div class="grid cols-2">
      <section class="card">
        <h2>KI‑Tutor <span class="badge">Aktive Lernsitzung</span></h2>
        <div class="chat" id="chat">
          <div class="msg">Hallo! Ich bin bereit, mit dir in die <b class="cyan">Analysis</b> einzutauchen. Konzentrieren wir uns auf Ableitungen, Integrale oder Grenzwerte?</div>
          <div class="msg user">Lass uns mit der Kettenregel beginnen.</div>
          <div class="msg">Stell dir die Kettenregel wie das Schälen einer Zwiebel vor: zuerst die äussere Schicht, dann die innere Funktion.</div>
        </div>
        <div class="chatbox">
          <input id="chatInput" placeholder="Stelle eine Frage..." />
          <button class="primary" id="sendChat">Senden</button>
        </div>
      </section>
      <aside class="grid" style="align-content:start">
        <div class="card">
          <h3>Intelligente Zusammenfassung</h3>
          <p style="font-size:13px"><b>Grundlagen der Kettenregel</b><br>Die Ableitung einer zusammengesetzten Funktion ist die Ableitung der äusseren Funktion multipliziert mit der Ableitung der inneren.</p>
        </div>
        <div class="card">
          <h3>Formel</h3>
          <pre class="mono" style="color:var(--cyan);padding:10px;background:#041210;border-radius:8px;overflow:auto;font-size:13px">f′(g(x)) · g′(x)</pre>
        </div>
        <div class="card">
          <h3>⚠ Deine Schwachpunkte</h3>
          <div class="weakness-list">${weaknessesSelf.slice(0,3).map(w=>`<div class="weakness-tag">${w}</div>`).join('')}</div>
        </div>
        <div class="card">
          <h3>Gespeicherte Ressourcen</h3>
          <p style="font-size:13px">📄 Kettenregel Spickzettel – 1.2 MB</p>
          <p style="font-size:13px">🎬 Ableitungen visualisieren – 8:45</p>
        </div>
      </aside>
    </div></div>`;
  },

  analysen() {
    const isDozent = state.role !== 'student';
    const weekData = [38,62,86,100,28,16,52];
    const weekMax = Math.max(...weekData);
    return `<div class="page-enter">
    ${roleBanner()}
    <h1>Analysen <span class="cyan">Intelligence</span></h1>
    <p>${isDozent ? 'Detaillierte Einblicke in Kurs- und Studentenleistungen.' : 'Detaillierte Einblicke in deine Lernreise.'}</p>
    <div class="grid cols-4" style="margin-top:20px">
      ${isDozent
        ? stat('Aktive Studenten','148','+8 diese Woche','green')
          + stat('Ø Kursabschluss','67%','Ziel: 75%','muted')
          + stat('Offene Abgaben','12','Fällig diese Woche','red')
          + stat('Ø Notenschnitt','2.1','Stabil','cyan')
        : stat('Lernstunden','18.5 h','+12% ggü. Vorwoche')
          + stat('Abg. Lektionen','42','Ziel: 60 / Monat','muted')
          + stat('Streak','🔥 '+state.streak+' Tage','Rekord: 15 Tage','yellow')
          + stat('Kosten',CHF.format(9.99),'Premium aktiv','green')
      }
    </div>
    <div class="grid cols-2" style="margin-top:22px">
      <div class="card linechart">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px">
          <h2 style="margin:0">Wöchentliche Aktivität</h2>
          <div class="tabs" style="margin:0">
            <button class="active" onclick="switchAnalyseTab(this,'week')">Woche</button>
            <button onclick="switchAnalyseTab(this,'month')">Monat</button>
          </div>
        </div>
        ${lineSvg()}
        <div style="display:flex;justify-content:space-between;font-size:11px;color:var(--muted);margin-top:5px">
          ${['Mo','Di','Mi','Do','Fr','Sa','So'].map((d,i)=>`<span title="${weekData[i]} Min gelernt">${d}<br><span class="cyan">${weekData[i]}m</span></span>`).join('')}
        </div>
      </div>
      <div class="card">
        <h2>⚠ KI‑Schwachpunkt-Analyse</h2>
        <div class="weakness-list">${weaknessesSelf.map(w=>`<div class="weakness-tag" onclick="render('kiTutor')" style="cursor:pointer" title="Im Tutor üben">${w} ↗</div>`).join('')}</div>
        <div style="margin-top:16px">
          <div class="muted" style="font-size:11px;text-transform:uppercase;letter-spacing:.1em;margin-bottom:8px">Kompetenzprofil</div>
          ${[['Abstrakte Logik',90,'green'],['Syntax',75,'cyan'],['Kreativität',60,'yellow'],['Präzision',42,'red']].map(([l,v,c])=>`
          <div style="margin-bottom:10px">
            <div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:4px">
              <span>${l}</span><span class="${c} mono">${v}%</span>
            </div>
            <div class="progress" style="height:4px"><span style="width:${v}%;background:var(--${c});box-shadow:none"></span></div>
          </div>`).join('')}
        </div>
        <button class="outline" style="width:100%;margin-top:10px" onclick="openWeaknessModal()">Schwachpunkte-Details (UC-03) →</button>
      </div>
    </div>
    <div class="card" style="margin-top:20px">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
        <h2 style="margin:0">Kursfortschritt Übersicht</h2>
        <button class="outline" style="font-size:11px" data-go="kurse">Alle Kurse →</button>
      </div>
      ${courses.map(c => {
        const prog = state.courseProgress[c.id] || 0;
        const bstate = getCourseButtonState(c.id);
        const color = bstate==='done'?'var(--green)':bstate==='running'?'var(--orange)':'var(--cyan)';
        return `<div style="margin-bottom:12px">
          <div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:5px;align-items:center">
            <span>${c.title}</span>
            <span style="color:${color};font-family:var(--mono);font-size:11px">${prog}%${bstate==='done'?' ✓':bstate==='running'?' ▶':''}</span>
          </div>
          <div class="progress" style="height:5px"><span style="width:${prog}%;background:${color};box-shadow:none"></span></div>
        </div>`;
      }).join('')}
    </div>
    <div class="card" style="margin-top:20px">
      <h2>Lernzeitpunkt Heatmap</h2>
      <div style="display:flex;justify-content:space-between;font-size:11px;color:var(--muted);margin-bottom:7px">
        ${['Mo','Di','Mi','Do','Fr','Sa','So'].map(d=>`<span>${d}</span>`).join('')}
      </div>
      <div class="heatmap">${Array.from({length:126},(_,i)=>`<span class="cell ${i%5===0?'on':i%3===0?'mid':''}" title="Lernsitzung"></span>`).join('')}</div>
    </div>
    </div>`;
  },

  ressourcen() {
    return `<div class="page-enter">
    ${roleBanner()}
    <h1>Datei‑Zentrum</h1>
    <p>Verwalte Kursmaterialien, Medien und Übungssätze.</p>
    <div class="grid cols-3" style="margin-top:20px">
      ${stat('Gesamtspeicher','42.8 GB','von 100 GB genutzt','muted')}
      ${stat('Dateitypen‑Mix','1.2k','PDF, Video, Archiv','muted')}
      <div class="card">
        <h3>KI‑Optimierung</h3>
        <p style="font-size:13px">Das KI-Modell hat <b class="cyan">45 neue Ressourcen</b> automatisch verschlagwortet.</p>
        <button class="outline" style="margin-top:10px">Review starten</button>
      </div>
    </div>
    <div class="card" style="margin-top:22px">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;flex-wrap:wrap;gap:8px">
        <h2 style="margin:0">124 Dateien</h2>
        ${state.role !== 'student' ? '<button class="primary" style="font-size:11px;padding:8px 14px">+ Datei hochladen</button>' : ''}
      </div>
      ${table(resources,['Name','Typ','Hochgeladen am','Kurszuordnung','Berechtigung'])}
    </div>
    </div>`;
  },

  rangliste() {
    const totalProgress = Math.round(Object.values(state.courseProgress).reduce((a,b)=>a+b,0) / Object.keys(state.courseProgress).length);
    return `<div class="page-enter">
    <h1>Lumina Rangliste</h1>
    <p class="cyan">Messe dich mit der Community</p>

    <!-- UC-02: Eigener Fortschritt -->
    <div class="card highlight" style="margin:18px 0;display:flex;align-items:center;gap:20px;flex-wrap:wrap">
      <div style="font-size:36px">📊</div>
      <div style="flex:1">
        <div class="muted" style="font-size:11px;text-transform:uppercase;letter-spacing:.1em">Dein Lernfortschritt</div>
        <div style="display:flex;align-items:baseline;gap:8px;margin:4px 0">
          <span class="cyan" style="font-family:var(--syne);font-size:28px;font-weight:900">${totalProgress}%</span>
          <span class="muted" style="font-size:12px">aller Kurse abgeschlossen</span>
        </div>
        <div class="progress" style="margin-top:8px;height:8px"><span style="width:${totalProgress}%"></span></div>
        <div style="display:flex;gap:16px;margin-top:8px;font-size:12px">
          <span class="green">✓ ${state.completedCourses.size} Abgeschlossen</span>
          <span class="orange">${state.activeCourseId!==null?'▶ 1 Aktiv':'Kein aktiver Kurs'}</span>
          <span class="muted">${courses.length - state.completedCourses.size - (state.activeCourseId!==null?1:0)} Ausstehend</span>
        </div>
      </div>
      <div style="text-align:center">
        <div class="cyan" style="font-family:var(--syne);font-size:28px;font-weight:900">#7</div>
        <div class="muted" style="font-size:11px">von 12.842</div>
      </div>
    </div>

    <div class="grid cols-3" style="margin-top:20px">
      ${rank(2,'Elena Vance','18.240 XP','142 Module · 98% Genauigkeit')}
      ${rank(1,'Kaelen Thorne','24.890 XP','215 Module · 12 Badges',true)}
      ${rank(3,'Marcus Zhou','15.900 XP','128 Module · 92% Genauigkeit')}
    </div>
    <div class="card" style="margin-top:22px">
      <h2>Deine Position: <span class="yellow">#7</span> von 12.842</h2>
      <div class="progress" style="margin-bottom:16px"><span style="width:68%"></span></div>
      ${table([
        ['04','Sarah Jenkins','112 Module','14.250 XP',''],
        ['05','Leo Moretti','105 Module','13.890 XP',''],
        ['06','Juno Park','98 Module','12.100 XP',''],
        ['07','<b class="cyan">Alex Chen (Du)</b>','87 Module','<b class="cyan">'+state.xp.toLocaleString('de-CH')+' XP</b>','← Du'],
        ['08','Nina Kovac','81 Module','9.800 XP',''],
      ],['Rang','Student','Module','Punkte',''])}
    </div>
    <div class="card" style="margin-top:20px">
      <h2>Deine Errungenschaften</h2>
      <div class="achievements">
        ${[['🔥','Streak Master','unlocked'],['⚡','Speed Learner','unlocked'],['🎯','First Blood','unlocked'],['🧠','Deep Thinker',state.completedCourses.size>0?'unlocked':''],['💎','Diamond Rank',''],['🏆','Course Legend','']].map(([icon,name,cls])=>`
        <div class="achievement ${cls}">
          <span class="ach-icon">${icon}</span>
          <span>${name}</span>
        </div>`).join('')}
      </div>
    </div>
    </div>`;
  },

  benutzer() {
    return `<div class="page-enter">
    ${roleBanner()}
    <h1>Benutzerverwaltung</h1>
    <p>Verwalte Plattformteilnehmer, Rollen und Zugangsdaten.</p>
    <div class="grid cols-4" style="margin-top:20px">
      ${stat('Gesamtbenutzer','12.842','+12% diesen Monat')}
      ${stat('Jetzt aktiv','1.402','Live auf der Plattform','green')}
      ${stat('Dozenten‑Verhältnis','1:45','Optimal','muted')}
      ${stat('Systemstatus','99.9%','<span class="status-dot"></span> Stabil','green')}
    </div>
    ${state.role === 'admin' ? `
    <div class="grid cols-3" style="margin-top:18px">
      <div class="card" style="border-color:#1a3525">
        <h3 style="color:var(--green)">🛡 Sicherheits-Logs</h3>
        <p style="font-size:12px">0 kritische Ereignisse heute · Letzter Scan: vor 4 Min</p>
        <button class="outline" style="margin-top:10px;font-size:11px">Logs anzeigen</button>
      </div>
      <div class="card" style="border-color:#3d2a00">
        <h3 style="color:var(--yellow)">⚡ System-Performance</h3>
        <p style="font-size:12px">CPU 34% · RAM 61% · Uptime 99.9%</p>
        <button class="outline" style="margin-top:10px;font-size:11px;border-color:var(--yellow);color:var(--yellow)">Details</button>
      </div>
      <div class="card" style="border-color:#1e2e38">
        <h3>📧 Benachrichtigungen</h3>
        <p style="font-size:12px">Massen-E-Mail an alle Studenten senden</p>
        <button class="outline" style="margin-top:10px;font-size:11px">Erstellen</button>
      </div>
    </div>` : ''}
    <div class="card" style="margin-top:20px">
      <div class="tabs">
        <button class="active">Alle Benutzer</button>
        <button>Dozenten</button>
        <button>Studenten</button>
      </div>
      <p style="font-size:12px;color:var(--muted);margin-bottom:12px">Klicke auf einen Studenten für die Detailansicht</p>
      <table class="table">
        <thead><tr><th>Student</th><th>Kurs</th><th>Fortschritt</th><th>Letzte Aktivität</th><th>Note</th><th>Aktion</th></tr></thead>
        <tbody>
          ${students.map((s,i)=>`<tr>
            <td><b>${s.name}</b></td>
            <td style="font-size:12px">${s.course}</td>
            <td>
              <span class="${s.progress===100?'green':s.progress<20?'red':'cyan'}">${s.progress}%</span>
              <div class="progress" style="margin-top:4px;width:90px"><span style="width:${s.progress}%;${s.progress===100?'background:var(--green)':s.progress<20?'background:var(--red)':''}"></span></div>
            </td>
            <td class="muted" style="font-size:12px">${s.activity}</td>
            <td class="${parseFloat(s.grade)<=1.5?'green':parseFloat(s.grade)>=3?'red':''}">${s.grade}</td>
            <td><button class="outline" style="padding:6px 11px;font-size:11px" onclick="openStudentModal(${i})">Details →</button></td>
          </tr>`).join('')}
        </tbody>
      </table>
      <button class="primary" style="margin-top:16px">+ Neuen Benutzer hinzufügen</button>
    </div>
    ${state.role === 'admin' ? `<div class="card" style="margin-top:18px;border-color:#4a1a1f">
      <h3 style="color:var(--red)">⚠ KI-Governance-Vorschlag</h3>
      <p style="font-size:13px">14 Benutzer waren seit über 90 Tagen inaktiv. Eine Massenarchivierung kann die Systemleistung verbessern.</p>
      <div style="display:flex;gap:8px;margin-top:12px">
        <button class="outline" style="border-color:var(--red);color:var(--red);font-size:11px">Benutzer archivieren</button>
        <button class="outline" style="font-size:11px">Prüfen</button>
      </div>
    </div>` : ''}
    </div>`;
  },

  einstellungen() {
    return `<div class="page-enter">
    ${roleBanner()}
    <h1>Einstellungen</h1>
    <div class="grid cols-2" style="margin-top:20px">
      <section class="card">
        <h2>Öffentliches Profil</h2>
        <label><b>Vollständiger Name</b><input class="field" value="Alex Vance"></label>
        <label><b>E‑Mail‑Adresse</b><input class="field" value="alex.vance@apicademy.io"></label>
        <label><b>Berufliche Bio</b>
          <textarea>Senior Product Designer & Creative Developer, beheimatet in der digitalen Lehre.</textarea>
        </label>
        <button class="primary">Änderungen speichern</button>
      </section>
      <section class="card">
        <h2>Abonnement & Preise</h2>
        <div class="grid cols-3">
          <div class="price-card">
            <div class="price-name">Basis</div>
            <div class="price-val">Gratis</div>
            <div class="price-sub">Essenzielle Werkzeuge</div>
            <button class="outline">Wählen</button>
          </div>
          <div class="price-card active">
            <div class="price-name">Premium</div>
            <div class="price-val">${CHF.format(9.99)}</div>
            <div class="price-sub cyan">Aktuell aktiv ✓</div>
            <button class="outline">Aktuell</button>
          </div>
          <div class="price-card">
            <div class="price-name">Business</div>
            <div class="price-val">Individ.</div>
            <div class="price-sub">Für Unternehmen</div>
            <button class="outline">Kontakt</button>
          </div>
        </div>
        <h2 style="margin-top:20px">Präferenzen</h2>
        <p style="font-size:13px"><label><input type="checkbox" checked> E‑Mail‑Benachrichtigungen</label></p>
        <p style="font-size:13px;margin-top:8px"><label><input type="checkbox"> Lernerinnerungen</label></p>
        <p style="font-size:13px;margin-top:8px"><label><input type="checkbox" checked> Datenanonymisierung</label></p>
        <div style="display:flex;gap:8px;margin-top:16px">
          <button class="primary">Speichern</button>
          <button class="danger">Konto deaktivieren</button>
        </div>
      </section>
    </div>
    </div>`;
  }
};

// ── RENDER ENGINE ──────────────────────────────────────
let currentPage = 'dashboard';

function render(page = 'dashboard') {
  currentPage = page;
  document.querySelectorAll('nav button').forEach(b => b.classList.toggle('active', b.dataset.page === page));
  const view = document.getElementById('view');
  view.innerHTML = pages[page] ? pages[page]() : pages.dashboard();
  view.querySelectorAll('[data-go]').forEach(b => b.onclick = () => render(b.dataset.go));
  view.querySelectorAll('.tabs button').forEach(b => b.onclick = function(){
    this.parentElement.querySelectorAll('button').forEach(x=>x.classList.remove('active'));
    this.classList.add('active');
  });

  const sendBtn = document.getElementById('sendChat');
  if (sendBtn) {
    const doSend = () => {
      const input = document.getElementById('chatInput');
      if (!input.value.trim()) return;
      const chat = document.getElementById('chat');
      chat.insertAdjacentHTML('beforeend',
        `<div class="msg user">${input.value}</div>
         <div class="msg">Gute Frage! Ich zerlege das Thema in kleine Schritte und gebe dir eine passende Übung dazu.</div>`);
      input.value = '';
      chat.scrollTop = chat.scrollHeight;
      awardXP(10, '– Tutorfrage gestellt');
    };
    sendBtn.onclick = doSend;
    const inp = document.getElementById('chatInput');
    if (inp) inp.onkeydown = e => { if (e.key==='Enter') doSend(); };
  }
}

// ── HAMBURGER MENU ─────────────────────────────────────
function setupHamburger() {
  const hamBtn = document.getElementById('hamBtn');
  const sidebar = document.querySelector('.sidebar');
  const overlay = document.getElementById('sidebarOverlay');
  if (!hamBtn) return;
  hamBtn.onclick = () => {
    sidebar.classList.toggle('open');
    overlay.classList.toggle('open');
  };
  overlay.onclick = () => {
    sidebar.classList.remove('open');
    overlay.classList.remove('open');
  };
}

function closeSidebar() {
  document.querySelector('.sidebar').classList.remove('open');
  document.getElementById('sidebarOverlay').classList.remove('open');
}

// ── CHANGE ROLE (called by topbar select) ───────────────
function changeRole(role) {
  setRole(role);
}

// ── INIT ──────────────────────────────────────────────
document.querySelectorAll('nav button').forEach(b => b.onclick = () => {
  render(b.dataset.page);
  closeSidebar();
});
document.querySelectorAll('[data-go]').forEach(b => b.onclick = () => render(b.dataset.go));

document.getElementById('search').addEventListener('input', e => {
  document.title = e.target.value.length > 2 ? 'Suche: ' + e.target.value : 'Apicademy – Lernplattform';
});

document.getElementById('streakCount').textContent = state.streak;

setupHamburger();
updateNavForRole();
render();