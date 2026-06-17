// ═══════════════════════════════════════════════════════
//  MANTHIO – Lernplattform  |  Powered by Apigenio GmbH
//  Rollen · Lernpfad · Quiz · Gamification · Dark/Light
// ═══════════════════════════════════════════════════════

const CHF = new Intl.NumberFormat('de-CH', { style: 'currency', currency: 'CHF' });
const THEME_KEY = 'manthio-theme';

// ── STATE ──────────────────────────────────────────────
const state = {
  xp: 6800, xpMax: 10000, level: 42, streak: 12,
  activeCourseId: null,
  completedCourses: new Set(),
  courseProgress: { 0: 26, 1: 60, 2: 45, 3: 30, 4: 75, 5: 15 },
  role: 'student',
  quizPending: null,
};

// ── COURSE DATA (Apigenio GmbH) ───────────────────────
const courses = [
  {
    id: 0,
    title: 'Python Bootcamp',
    desc: 'Von Null zum Python-Profi: Grundlagen, OOP, APIs und ein abschliessendes Mini-Projekt.',
    price: 490, level: 'GRUNDLAGEN', xp: 600, img: 'python',
    tag: 'BESTSELLER',
  },
  {
    id: 1,
    title: 'KI Grundlagen für Unternehmen',
    desc: 'KI-Konzepte, Machine Learning und praktische Anwendungsfälle für Entscheider und Teams.',
    price: 290, level: 'GRUNDLAGEN', xp: 350, img: 'ki',
  },
  {
    id: 2,
    title: 'Webentwicklung mit React',
    desc: 'Moderne Web-Apps von Grund auf mit React, Hooks, State Management und Deployment.',
    price: 390, level: 'MITTELSTUFE', xp: 450, img: 'react',
  },
  {
    id: 3,
    title: 'IT Security Basics',
    desc: 'Sicherheitsgrundlagen, Angriffsvektoren, Schutzmassnahmen und Compliance-Anforderungen.',
    price: 290, level: 'GRUNDLAGEN', xp: 300, img: 'security',
  },
  {
    id: 4,
    title: 'Datenanalyse mit Python',
    desc: 'Pandas, NumPy, Matplotlib und statistische Datenanalyse für den Berufsalltag.',
    price: 390, level: 'MITTELSTUFE', xp: 500, img: 'data',
  },
  {
    id: 5,
    title: 'Cloud & API Integration',
    desc: 'REST APIs, Cloud-Dienste (AWS/Azure) und moderne Integrationsarchitekturen in der Praxis.',
    price: 490, level: 'FORTGESCHRITTEN', xp: 550, img: 'cloud',
  },
];

// ── STUDENT DATA ───────────────────────────────────────
const students = [
  { name: 'Marc-André Weber',  course: 'Python Bootcamp',              progress: 82,  activity: 'Aktiv',          grade: '1.3', weaknesses: ['Rekursion', 'OOP', 'Datenstrukturen'] },
  { name: 'Sarah Al-Farsi',    course: 'KI Grundlagen für Unternehmen',progress: 45,  activity: 'Gestern, 18:42', grade: '2.1', weaknesses: ['Machine Learning', 'Prompt Engineering'] },
  { name: 'Lukas Berger',      course: 'IT Security Basics',           progress: 100, activity: 'Aktiv',          grade: '1.0', weaknesses: [] },
  { name: 'Elena Petrova',     course: 'Python Bootcamp',              progress: 12,  activity: 'Vor 12 Tagen',   grade: '3.7', weaknesses: ['Syntax', 'Kontrollstrukturen', 'OOP', 'Zeitmanagement'] },
];

// ── RESOURCES (mutable – uploads are appended here) ────
let resources = [
  { name: 'Python Bootcamp – Modul 1 Unterlagen', type: 'PDF-Dokument',  date: '15. Jan 2026', course: 'Python Bootcamp',    access: 'Alle Teilnehmer' },
  { name: 'Vorlesungsskript KI Woche 03.pdf',     type: 'PDF-Dokument',  date: 'Gestern, 14:30', course: 'KI Grundlagen',   access: 'Nur Dozenten' },
  { name: 'React Hooks Crashcourse.mp4',          type: 'Video (HD)',    date: '10. Jan 2026', course: 'React',              access: 'Alle Teilnehmer' },
  { name: 'Python_Übungen_Set_2.zip',             type: 'Archiv',        date: '08. Jan 2026', course: 'Python Bootcamp',    access: 'Kursteilnehmer' },
  { name: 'IT Security Cheatsheet.pdf',           type: 'PDF-Dokument',  date: '05. Jan 2026', course: 'IT Security Basics', access: 'Alle Teilnehmer' },
];

// ── WEAKNESSES (Python context) ────────────────────────
const weaknessesSelf = ['OOP Konzepte', 'Rekursion', 'List Comprehensions', 'Lambda-Funktionen', 'Fehlerbehandlung'];

// ── PYTHON BOOTCAMP LEARNING PATH ─────────────────────
const pythonModules = [
  {
    id: 0, title: 'Python Setup & Entwicklungsumgebung',
    desc: 'Python installieren, VS Code konfigurieren und erste Skripte erfolgreich ausführen.',
    status: 'completed', progress: 100, duration: '2h 30min',
    materials: ['Python Installationsguide (PDF)', 'VS Code Konfiguration (Guide)', 'Hello World Projekt (ZIP)'],
    quiz: {
      q: 'Welcher Befehl prüft die installierte Python-Version im Terminal?',
      opts: ['python --check', 'python --version', 'py --info', 'python -v show'],
      correct: 1,
      tip: 'Mit `python --version` oder `python3 --version` prüfst du die installierte Python-Version.'
    }
  },
  {
    id: 1, title: 'Grundlagen der Syntax',
    desc: 'Einrückung, Kommentare, print()-Ausgaben und die Grundstruktur eines Python-Programms.',
    status: 'completed', progress: 100, duration: '3h',
    materials: ['Syntax Cheatsheet (PDF)', 'Interaktive Übungen (Online)', 'Code-Beispiele (ZIP)'],
    quiz: {
      q: 'Wie werden Codeblöcke in Python strukturiert?',
      opts: ['Mit geschweiften Klammern {}', 'Mit Semikolons ;', 'Durch Einrückung (Indentation)', 'Mit BEGIN/END'],
      correct: 2,
      tip: 'Python verwendet Einrückung (Whitespace) – kein BEGIN/END oder {} nötig.'
    }
  },
  {
    id: 2, title: 'Variablen, Datentypen & Operatoren',
    desc: 'int, float, str, bool – Datentypen verstehen und mit arithmetischen und logischen Operatoren arbeiten.',
    status: 'in-progress', progress: 60, duration: '4h',
    materials: ['Datentypen Übersicht (PDF)', 'Operator Cheatsheet (PDF)', 'Übungsaufgaben Set 1 (ZIP)'],
    quiz: {
      q: 'Was ist der Typ von `x = 3.14` in Python?',
      opts: ['int', 'float', 'str', 'decimal'],
      correct: 1,
      tip: 'Kommazahlen ohne expliziten Cast sind automatisch vom Typ `float`.'
    }
  },
  {
    id: 3, title: 'Kontrollstrukturen',
    desc: 'if/elif/else-Verzweigungen, for- und while-Schleifen – den Programmfluss sicher steuern.',
    status: 'open', progress: 0, duration: '3h 30min',
    materials: ['Kontrollstrukturen Guide (PDF)', 'Loop Visualizer (Link)', 'Aufgaben Set 2 (ZIP)'],
    quiz: {
      q: 'Welches Schlüsselwort bricht eine Python-Schleife vorzeitig ab?',
      opts: ['stop', 'exit', 'break', 'return'],
      correct: 2,
      tip: '`break` beendet die aktuelle Schleife sofort und springt zur nächsten Zeile danach.'
    }
  },
  {
    id: 4, title: 'Funktionen & Modularisierung',
    desc: 'Eigene Funktionen definieren, Parameter und Rückgabewerte verwenden, Module importieren.',
    status: 'locked', progress: 0, duration: '4h',
    materials: ['Funktionen Guide (PDF)', 'Module & Packages (Video)', 'Übungen Set 3 (ZIP)'],
    quiz: {
      q: 'Welches Schlüsselwort definiert eine Funktion in Python?',
      opts: ['function', 'def', 'fn', 'func'],
      correct: 1,
      tip: 'In Python wird eine Funktion mit `def funktionsname():` definiert.'
    }
  },
  {
    id: 5, title: 'Datenstrukturen',
    desc: 'Listen, Tuples, Sets und Dictionaries – Daten effizient speichern, abfragen und verändern.',
    status: 'locked', progress: 0, duration: '4h 30min',
    materials: ['Datenstrukturen Übersicht (PDF)', 'Vergleichstabelle (PDF)', 'Praxisaufgaben (ZIP)'],
    quiz: {
      q: 'Welche Python-Datenstruktur ist unveränderlich (immutable)?',
      opts: ['list', 'dict', 'tuple', 'set'],
      correct: 2,
      tip: '`tuple` ist unveränderlich – einmal erstellt, können seine Elemente nicht geändert werden.'
    }
  },
  {
    id: 6, title: 'Dateien, Fehlerbehandlung & Debugging',
    desc: 'Dateien lesen und schreiben, Ausnahmen mit try/except behandeln und Fehler systematisch debuggen.',
    status: 'locked', progress: 0, duration: '3h',
    materials: ['Exception Handling Guide (PDF)', 'Debugging Cheatsheet (PDF)', 'Übungen (ZIP)'],
    quiz: {
      q: 'Welches Schlüsselwort fängt Ausnahmen in Python ab?',
      opts: ['catch', 'except', 'handle', 'rescue'],
      correct: 1,
      tip: 'Python verwendet `try/except` – kein `catch` wie in Java oder JavaScript.'
    }
  },
  {
    id: 7, title: 'Objektorientierte Programmierung',
    desc: 'Klassen, Objekte, Vererbung, Kapselung und Polymorphismus in Python verstehen und anwenden.',
    status: 'locked', progress: 0, duration: '5h',
    materials: ['OOP Grundlagen (PDF)', 'Klassendiagramme (Video)', 'OOP-Aufgaben (ZIP)'],
    quiz: {
      q: 'Mit welchem Schlüsselwort wird eine Klasse in Python erstellt?',
      opts: ['object', 'class', 'new', 'type'],
      correct: 1,
      tip: 'Python-Klassen werden mit `class Klassenname:` definiert.'
    }
  },
  {
    id: 8, title: 'APIs, JSON & Web Requests',
    desc: 'REST APIs aufrufen, JSON-Daten verarbeiten und das requests-Modul professionell einsetzen.',
    status: 'locked', progress: 0, duration: '4h',
    materials: ['API Grundlagen (PDF)', 'requests Doku (Link)', 'API Projekt (ZIP)'],
    quiz: {
      q: 'Welches Python-Modul wird häufig für HTTP-Anfragen verwendet?',
      opts: ['urllib2', 'http', 'requests', 'fetch'],
      correct: 2,
      tip: 'Das `requests`-Modul ist der Standard für einfache und lesbare HTTP-Anfragen in Python.'
    }
  },
  {
    id: 9, title: 'Mini-Projekt / Abschlussprojekt',
    desc: 'Alle erlernten Konzepte in einem vollständigen Python-Projekt kombinieren und präsentieren.',
    status: 'locked', progress: 0, duration: '6h',
    materials: ['Projektanleitung (PDF)', 'Bewertungsrubrik (PDF)', 'Beispielprojekte (ZIP)'],
    quiz: {
      q: 'Was ist das Hauptziel des Abschlussprojekts?',
      opts: ['Nur Code schreiben', 'Alle Kurskonzepte in einem realen Projekt anwenden', 'Eine Datenbank erstellen', 'Eine Website deployen'],
      correct: 1,
      tip: 'Das Abschlussprojekt zeigt, dass du alle erlernten Python-Konzepte selbstständig anwenden kannst.'
    }
  },
];

// ── QUIZ BANK (course-level completion quizzes) ────────
const quizBank = {
  0: [
    { q: 'Was ist eine List Comprehension in Python?', opts: ['Eine Schleife', 'Eine kompakte Syntax zur Listenerstellung', 'Ein Datentyp', 'Eine Funktion'], correct: 1, tip: 'List Comprehensions erlauben kompakte Listenerstellung: `[x*2 for x in range(10)]`' },
    { q: 'Was macht das Schlüsselwort `yield` in Python?', opts: ['Beendet die Funktion', 'Gibt einen Generator-Wert zurück und pausiert', 'Deklariert eine Variable', 'Importiert ein Modul'], correct: 1, tip: '`yield` macht eine Funktion zum Generator – Werte werden lazy produziert.' },
  ],
  1: [
    { q: 'Was ist der Unterschied zwischen KI und Machine Learning?', opts: ['Kein Unterschied', 'ML ist ein Teilbereich von KI', 'KI ist ein Teilbereich von ML', 'Sie sind Synonyme'], correct: 1, tip: 'Machine Learning ist ein Unterbereich von KI, der auf Daten und Statistik basiert.' },
  ],
  2: [
    { q: 'Was macht der React Hook `useState`?', opts: ['Lädt externe Daten', 'Verwaltet lokalen Komponentenzustand', 'Rendert Komponenten', 'Definiert Props'], correct: 1, tip: '`useState` gibt einen Zustandswert und eine Setter-Funktion zurück.' },
  ],
  3: [
    { q: 'Was ist ein SQL-Injection-Angriff?', opts: ['DoS via Datenbank', 'Einschleusen von SQL-Code über Eingaben', 'Datenverschlüsselung', 'Netzwerkzugriff'], correct: 1, tip: 'SQL-Injection manipuliert Datenbankabfragen durch ungesäuberte Eingaben.' },
  ],
  4: [
    { q: 'Welche Bibliothek nutzt man in Python für DataFrames?', opts: ['NumPy', 'Pandas', 'Matplotlib', 'Seaborn'], correct: 1, tip: 'Pandas bietet DataFrame und Series – das Herzstück der Datenanalyse mit Python.' },
  ],
  5: [
    { q: 'Was beschreibt eine REST API?', opts: ['Eine Datenbank', 'Ein Kommunikationsstandard über HTTP', 'Ein Cloud-Anbieter', 'Ein Programmierparadigma'], correct: 1, tip: 'REST APIs nutzen HTTP-Methoden (GET, POST, PUT, DELETE) zum Datenaustausch.' },
  ],
};

// ── THEME (Dark / Light) ───────────────────────────────
function initTheme() {
  const saved = localStorage.getItem(THEME_KEY);
  if (saved === 'light') applyTheme('light');
  else applyTheme('dark');
}

function applyTheme(mode) {
  const btn = document.getElementById('themeToggle');
  if (mode === 'light') {
    document.body.classList.add('light-mode');
    if (btn) btn.textContent = '🌙';
  } else {
    document.body.classList.remove('light-mode');
    if (btn) btn.textContent = '☀️';
  }
  localStorage.setItem(THEME_KEY, mode);
}

function toggleTheme() {
  const isLight = document.body.classList.contains('light-mode');
  applyTheme(isLight ? 'dark' : 'light');
}

// ── FILE UPLOAD SIMULATION ─────────────────────────────
function initFileUpload() {
  const input = document.getElementById('fileUploadInput');
  if (!input) return;
  input.addEventListener('change', function () {
    const files = Array.from(this.files);
    if (!files.length) return;
    files.forEach(file => {
      const ext = file.name.split('.').pop().toUpperCase();
      const typeMap = {
        PDF: 'PDF-Dokument', ZIP: 'Archiv', MP4: 'Video (HD)',
        PY: 'Python-Skript', IPYNB: 'Jupyter Notebook',
        DOC: 'Word-Dokument', DOCX: 'Word-Dokument',
        PPTX: 'Präsentation', XLSX: 'Tabelle',
        PNG: 'Bild (PNG)', JPG: 'Bild (JPEG)',
      };
      const today = new Date().toLocaleDateString('de-CH', { day: '2-digit', month: 'short', year: 'numeric' });
      resources.unshift({
        name: file.name,
        type: typeMap[ext] || ext + '-Datei',
        date: 'Heute, ' + new Date().toLocaleTimeString('de-CH', { hour: '2-digit', minute: '2-digit' }),
        course: 'Python Bootcamp',
        access: 'Kursteilnehmer',
      });
      showUploadToast(`✓ ${file.name} hochgeladen`);
    });
    this.value = '';
    if (currentPage === 'ressourcen') render('ressourcen');
  });
}

function triggerFileUpload() {
  document.getElementById('fileUploadInput').click();
}

function showUploadToast(msg) {
  const el = document.getElementById('uploadToast');
  if (!el) return;
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(el._t);
  el._t = setTimeout(() => el.classList.remove('show'), 3200);
}

// ── XP / GAMIFICATION ─────────────────────────────────
function awardXP(amount, label = '') {
  state.xp = Math.min(state.xp + amount, state.xpMax);
  updateXPBar();
  showXPToast(`+${amount} XP ${label}`);
  if (state.xp >= state.xpMax) {
    setTimeout(() => { state.level++; state.xp = 0; updateXPBar(); showLevelModal(); }, 1200);
  }
}

function updateXPBar() {
  const pct = (state.xp / state.xpMax) * 100;
  const fill = document.getElementById('sidebarXpFill');
  const val = document.getElementById('sidebarXpVal');
  if (fill) fill.style.width = pct + '%';
  if (val) val.textContent = state.xp.toLocaleString('de-CH');
}

function showXPToast(msg) {
  const el = document.getElementById('xpToast');
  if (!el) return;
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(el._t);
  el._t = setTimeout(() => el.classList.remove('show'), 2800);
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

// ── CONFETTI ───────────────────────────────────────────
function launchConfetti() {
  const canvas = document.getElementById('confettiCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  const colors = ['#00f5e4', '#9d6cff', '#ffcf3f', '#2bde7e', '#ff8c42', '#ff5561', '#40fff5'];
  const particles = Array.from({ length: 140 }, () => ({
    x: Math.random() * canvas.width, y: -10 - Math.random() * 100,
    r: 4 + Math.random() * 6, color: colors[Math.floor(Math.random() * colors.length)],
    vx: (Math.random() - .5) * 4, vy: 2.5 + Math.random() * 3.5,
    rot: Math.random() * Math.PI * 2, rotV: (Math.random() - .5) * .15,
    shape: Math.random() > .5 ? 'rect' : 'circle', life: 1,
  }));
  let frame;
  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let alive = false;
    for (const p of particles) {
      p.x += p.vx; p.y += p.vy; p.rot += p.rotV; p.vy += .05;
      if (p.y < canvas.height + 20) alive = true;
      ctx.save();
      ctx.translate(p.x, p.y); ctx.rotate(p.rot);
      ctx.globalAlpha = Math.min(1, (canvas.height - p.y) / 150);
      ctx.fillStyle = p.color;
      if (p.shape === 'rect') ctx.fillRect(-p.r, -p.r / 2, p.r * 2, p.r);
      else { ctx.beginPath(); ctx.arc(0, 0, p.r, 0, Math.PI * 2); ctx.fill(); }
      ctx.restore();
    }
    if (alive) frame = requestAnimationFrame(draw);
    else ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
  cancelAnimationFrame(frame); draw();
  const overlay = document.createElement('div');
  overlay.className = 'celebrate-overlay';
  overlay.innerHTML = '<div class="celebrate-ring"></div>';
  document.body.appendChild(overlay);
  setTimeout(() => overlay.remove(), 1200);
}

// ── QUIZ MODAL ─────────────────────────────────────────
let quizState = { courseId: null, moduleIdx: null, questions: [], idx: 0, answered: false, isModuleQuiz: false };

function openQuiz(courseId) {
  quizState = {
    courseId, moduleIdx: null, isModuleQuiz: false,
    questions: quizBank[courseId] || [{
      q: 'Bist du bereit, diesen Kurs zu starten?',
      opts: ['Ja, los geht\'s!', 'Noch kurz durchatmen...', 'Ich bin top vorbereitet!', 'Challenge accepted!'],
      correct: 0, tip: 'Super Einstellung! Viel Erfolg beim Kurs! 🚀'
    }],
    idx: 0, answered: false
  };
  renderQuiz();
  document.getElementById('quizModal').classList.remove('hidden');
}

function openModuleQuiz(moduleIdx) {
  const mod = pythonModules[moduleIdx];
  if (!mod || !mod.quiz) { showXPToast('⚠ Kein Quiz für dieses Modul verfügbar.'); return; }
  quizState = {
    courseId: null, moduleIdx, isModuleQuiz: true,
    questions: [mod.quiz],
    idx: 0, answered: false
  };
  renderQuiz();
  document.getElementById('quizModal').classList.remove('hidden');
}

function renderQuiz() {
  const { questions, idx, answered } = quizState;
  const q = questions[idx];
  const total = questions.length;
  let contextLabel;
  if (quizState.isModuleQuiz) {
    contextLabel = pythonModules[quizState.moduleIdx].title;
  } else {
    contextLabel = courses[quizState.courseId].title;
  }
  const dots = questions.map((_, i) =>
    `<div class="quiz-dot ${i < idx ? 'done' : i === idx ? 'active' : ''}"></div>`
  ).join('');
  document.getElementById('quizContent').innerHTML = `
    <div class="quiz-dots">${dots}</div>
    <div class="quiz-context">
      📚 ${quizState.isModuleQuiz ? 'Modul' : 'Kurs'}: <strong>${contextLabel}</strong>
      <span class="muted" style="margin-left:12px;font-size:11px">Frage ${idx + 1} von ${total}</span>
    </div>
    <div class="quiz-question">${q.q}</div>
    <div class="quiz-options">
      ${q.opts.map((o, i) => `
        <button class="quiz-opt" onclick="answerQuiz(${i})" ${answered ? 'disabled' : ''}>
          <span style="color:var(--muted);font-family:var(--mono);margin-right:10px;font-size:11px">${String.fromCharCode(65 + i)}</span>
          ${o}
        </button>`).join('')}
    </div>
    <div class="quiz-feedback" id="quizFeedback"></div>
    <div style="display:flex;justify-content:space-between;align-items:center">
      <button class="ghost" onclick="closeQuiz()">Abbrechen</button>
      <button class="primary" id="quizNextBtn" onclick="quizNext()" style="display:none">
        ${idx + 1 < total ? 'Nächste Frage →' : (quizState.isModuleQuiz ? 'Modul abschliessen ✓' : 'Kurs starten! 🚀')}
      </button>
    </div>`;
}

function answerQuiz(chosen) {
  if (quizState.answered) return;
  quizState.answered = true;
  const q = quizState.questions[quizState.idx];
  const opts = document.querySelectorAll('.quiz-opt');
  const fb = document.getElementById('quizFeedback');
  const nextBtn = document.getElementById('quizNextBtn');
  opts.forEach((el, i) => {
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
  const { questions, idx } = quizState;
  if (idx + 1 < questions.length) {
    quizState.idx++;
    quizState.answered = false;
    renderQuiz();
  } else if (quizState.isModuleQuiz) {
    closeQuiz();
    completeModule(quizState.moduleIdx);
  } else {
    closeQuiz();
    startCourse(quizState.courseId);
  }
}

function closeQuiz() {
  document.getElementById('quizModal').classList.add('hidden');
}

// ── LEARNING PATH LOGIC ────────────────────────────────
function updateCourseProgressFromModules() {
  const total = pythonModules.reduce((sum, m) => sum + m.progress, 0);
  state.courseProgress[0] = Math.round(total / pythonModules.length);
}

function startModuleAction(idx) {
  const mod = pythonModules[idx];
  if (!mod) return;
  if (mod.status === 'locked') { showXPToast('🔒 Schliesse zuerst das vorherige Modul ab.'); return; }
  if (mod.status === 'completed') { openModuleQuiz(idx); return; }
  if (mod.status === 'open') {
    mod.status = 'in-progress';
    mod.progress = 15;
    awardXP(25, `– Modul ${idx + 1} gestartet`);
    updateCourseProgressFromModules();
    render('lernpfad');
    return;
  }
  if (mod.status === 'in-progress') {
    if (mod.progress < 100) {
      mod.progress = Math.min(mod.progress + 25, 100);
      if (mod.progress >= 100) {
        openModuleQuiz(idx);
      } else {
        awardXP(50, `– Modul ${idx + 1} Lerneinheit`);
        updateCourseProgressFromModules();
        render('lernpfad');
      }
    } else {
      openModuleQuiz(idx);
    }
  }
}

function completeModule(idx) {
  const mod = pythonModules[idx];
  mod.status = 'completed';
  mod.progress = 100;
  awardXP(150, `– Modul ${idx + 1} abgeschlossen! 🎉`);
  const next = pythonModules[idx + 1];
  if (next && next.status === 'locked') next.status = 'open';
  updateCourseProgressFromModules();
  launchConfetti();
  setTimeout(() => render('lernpfad'), 400);
}

// ── COURSE MODALS ──────────────────────────────────────
let _pendingCourseStartId = null;

function openCourseStartModal(courseId) {
  _pendingCourseStartId = courseId;
  const question = document.getElementById('courseQuestion');
  if (question) question.innerHTML = `Der Kurs <strong>${courses[courseId].title}</strong> steht bei 99%.<br>Kurze Abschlussfrage: Wie viel ist <strong>2 + 2</strong>?`;
  const modal = document.getElementById('courseStartModal');
  if (modal) {
    modal.classList.remove('hidden');
    setTimeout(() => { const input = document.getElementById('courseAnswer'); if (input) input.focus(); }, 100);
  }
}

function submitCourseStart() {
  const input = document.getElementById('courseAnswer');
  if (!input || !input.value.trim()) { showXPToast('⚠ Bitte beantworte die Frage!'); return; }
  const answer = input.value.trim().toLowerCase().replace(/\s+/g, '');
  if (!['4', 'vier'].includes(answer)) { showXPToast('✗ Falsch. Versuch es nochmals.'); input.select(); return; }
  const courseId = _pendingCourseStartId;
  closeCourseStartModal();
  if (courseId === null) return;
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

let _pendingEndId = null;

function confirmEndCourseModal(id) {
  _pendingEndId = id;
  const nameEl = document.getElementById('courseEndName');
  if (nameEl) nameEl.textContent = `„${courses[id].title}" wirklich abschliessen und +${courses[id].xp} XP erhalten?`;
  document.getElementById('courseEndModal').classList.remove('hidden');
}

function confirmCourseEnd() {
  document.getElementById('courseEndModal').classList.add('hidden');
  if (_pendingEndId !== null) { completeCourse(_pendingEndId); _pendingEndId = null; }
}

function closeCourseEndModal() {
  document.getElementById('courseEndModal').classList.add('hidden');
  _pendingEndId = null;
}

// ── WEAKNESS MODAL ─────────────────────────────────────
function openWeaknessModal() {
  const list = document.getElementById('weaknessModalList');
  if (list) list.innerHTML = weaknessesSelf.map(w => `<div class="weakness-tag">${w}</div>`).join('');
  const bars = document.getElementById('weaknessSkillBars');
  if (bars) bars.innerHTML = [
    ['Abstrakte Logik', 80, 'green'], ['Python Syntax', 70, 'cyan'],
    ['OOP Konzepte', 45, 'yellow'], ['Fehlerbehandlung', 38, 'red']
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

// ── STUDENT DETAIL MODAL ───────────────────────────────
function openStudentModal(idx) {
  const s = students[idx];
  document.getElementById('studentModalName').textContent  = s.name;
  document.getElementById('studentModalCourse').textContent = s.course;
  document.getElementById('sdProgress').textContent        = s.progress + '%';
  document.getElementById('sdProgressBar').style.width     = s.progress + '%';
  document.getElementById('sdGrade').textContent           = s.grade;
  document.getElementById('sdActivity').textContent        = s.activity;
  const status = s.progress === 100 ? '✓ Abgeschlossen' : s.activity === 'Aktiv' ? '● Aktiv' : '○ Inaktiv';
  const statusEl = document.getElementById('sdStatus');
  statusEl.textContent = status;
  statusEl.className = 'stat-value ' + (s.progress === 100 ? 'cyan' : s.activity === 'Aktiv' ? 'green' : 'red');
  const wl = document.getElementById('sdWeakness');
  wl.innerHTML = s.weaknesses.length === 0
    ? '<span style="color:var(--green);font-size:13px">✓ Keine Schwachpunkte erkannt</span>'
    : s.weaknesses.map(w => `<div class="weakness-tag">${w}</div>`).join('');
  document.getElementById('studentModal').classList.remove('hidden');
}

function closeStudentModal() {
  document.getElementById('studentModal').classList.add('hidden');
}

// ── ROLE ───────────────────────────────────────────────
function setRole(role) {
  state.role = role;
  document.querySelector('.sidebar').className = `sidebar role-${role}`;
  document.querySelectorAll('.role-btn').forEach(b => b.classList.toggle('active', b.dataset.role === role));
  const labels = { student: 'Level 42 Explorer', dozent: 'Dozenten-Ansicht', admin: 'Administrator' };
  const small = document.querySelector('.user-mini small');
  if (small) small.textContent = labels[role] || '';
  updateNavForRole();
  render(currentPage);
}

function updateNavForRole() {
  const studentHidden = ['benutzer'];
  document.querySelectorAll('nav button').forEach(btn => {
    const page = btn.dataset.page;
    btn.style.display = (state.role === 'student' && studentHidden.includes(page)) ? 'none' : '';
  });
}

function changeRole(role) { setRole(role); }

function switchAnalyseTab(btn, period) {
  btn.parentElement.querySelectorAll('button').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  showXPToast(period === 'month' ? '📊 Monatsansicht' : '📊 Wochenansicht');
}

// ── COMPONENT BUILDERS ─────────────────────────────────
function getCourseButtonState(id) {
  if (state.completedCourses.has(id)) return 'done';
  return 'start';
}

function handleCourseAction(id) {
  if (getCourseButtonState(id) === 'done') { render('kiTutor'); return; }
  openCourseStartModal(id);
}

function startCourse(id) { openCourseStartModal(id); }

function completeCourse(id) {
  state.completedCourses.add(id);
  state.activeCourseId = null;
  state.courseProgress[id] = 100;
  setTimeout(() => { launchConfetti(); awardXP(courses[id].xp, '– Kurs abgeschlossen! 🎉'); }, 200);
  render(currentPage);
}

function courseCard(c) {
  const prog = state.courseProgress[c.id] || 0;
  const btnState = getCourseButtonState(c.id);
  const isPython = c.id === 0;
  const btnLabel = { start: 'Kurs abschliessen', running: 'Kurs beenden', done: 'Wiederholen' }[btnState];
  const btnClass = { start: 'btn-start', running: 'btn-running', done: 'btn-done' }[btnState];
  const ringOffset = 188 - (188 * prog / 100);
  const levelColor = { GRUNDLAGEN: 'green', MITTELSTUFE: '', MASTERCLASS: 'yellow', FORTGESCHRITTEN: 'purple', ADVANCED: 'purple' }[c.level] || '';

  return `<div class="card course ${isPython ? 'course-featured' : ''}">
    <div class="course-img ${c.img || ''}"></div>
    <div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap">
      <span class="badge ${levelColor}">${c.level}</span>
      ${c.tag ? `<span class="badge orange">${c.tag}</span>` : ''}
    </div>
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
      <span class="muted mono" style="font-size:11px">+${c.xp} XP · ${CHF.format(c.price)}</span>
    </div>
    ${isPython ? `
    <button class="outline" style="width:100%;margin-top:10px" onclick="render('lernpfad')">◈ Lernpfad anzeigen →</button>
    <button class="primary ${btnClass}" style="margin-top:8px" onclick="handleCourseAction(${c.id})">${btnLabel}</button>
    ` : `
    <button class="primary ${btnClass}" onclick="handleCourseAction(${c.id})">${btnLabel}</button>
    `}
  </div>`;
}

function moduleCard(mod, idx) {
  const statusLabels = { completed: '✓ Abgeschlossen', 'in-progress': '▶ In Bearbeitung', open: '○ Offen', locked: '🔒 Gesperrt' };
  const badgeClass = { completed: 'mod-badge-completed', 'in-progress': 'mod-badge-in-progress', open: 'mod-badge-open', locked: 'mod-badge-locked' }[mod.status];
  const btnLabel = { completed: 'Wiederholen', 'in-progress': 'Weiterlernen →', open: 'Modul starten', locked: '🔒 Gesperrt' }[mod.status];
  const btnClass = { completed: 'outline', 'in-progress': 'primary', open: 'outline', locked: 'ghost' }[mod.status];
  const ringOffset = mod.status === 'locked' ? 188 : 188 - (188 * mod.progress / 100);
  const numIcon = mod.status === 'completed' ? '✓' : mod.status === 'locked' ? '🔒' : String(idx + 1);

  return `<div class="module-card status-${mod.status}">
    <div class="module-num">${numIcon}</div>
    <div class="module-body">
      <div class="module-title">${mod.title}</div>
      <div class="module-desc">${mod.desc}</div>
      <div class="module-meta">
        <span class="mod-badge ${badgeClass}">${statusLabels[mod.status]}</span>
        <span class="muted" style="font-size:11px">⏱ ${mod.duration}</span>
        ${mod.status !== 'locked' && mod.status !== 'open'
          ? `<span class="cyan mono" style="font-size:11px">${mod.progress}%</span>`
          : ''}
      </div>
      ${mod.status !== 'locked' ? `
      <div class="module-materials">
        ${mod.materials.map(m => `<span class="mat-chip">📄 ${m}</span>`).join('')}
      </div>` : ''}
      ${mod.status !== 'locked' && mod.status !== 'open' ? `
      <div class="progress" style="height:4px;margin-top:0;margin-bottom:10px">
        <span style="width:${mod.progress}%;${mod.status === 'completed' ? 'background:var(--green);box-shadow:0 0 5px var(--green)' : ''}"></span>
      </div>` : ''}
    </div>
    <div class="module-actions-col">
      <button class="${btnClass}" style="font-size:12px;padding:8px 14px;white-space:nowrap"
        onclick="startModuleAction(${idx})" ${mod.status === 'locked' ? 'disabled' : ''}>
        ${btnLabel}
      </button>
      ${mod.quiz && mod.status !== 'locked' ? `
      <button class="ghost" style="font-size:11px;padding:6px 10px" onclick="openModuleQuiz(${idx})">Quiz ▸</button>
      ` : ''}
    </div>
  </div>`;
}

function stat(label, value, sub, color = 'cyan') {
  return `<div class="card">
    <span class="muted" style="font-size:11px;text-transform:uppercase;letter-spacing:.1em">${label}</span>
    <div class="stat-value" style="margin-top:5px">${value}</div>
    <small class="${color}" style="font-size:11px">${sub}</small>
  </div>`;
}

function tableFromResources() {
  if (!resources.length) return '<p style="color:var(--muted);text-align:center;padding:20px">Keine Dateien vorhanden.</p>';
  return `<table class="table">
    <thead><tr><th>Name</th><th>Typ</th><th>Hochgeladen am</th><th>Kurszuordnung</th><th>Berechtigung</th></tr></thead>
    <tbody>${resources.map(r => `<tr>
      <td style="font-size:13px"><b>${r.name}</b></td>
      <td><span class="badge ${r.type.includes('Video') ? 'purple' : r.type.includes('Archiv') ? 'yellow' : 'green'}" style="font-size:10px">${r.type}</span></td>
      <td class="muted" style="font-size:12px">${r.date}</td>
      <td style="font-size:12px">${r.course}</td>
      <td><span class="muted" style="font-size:11px">${r.access}</span></td>
    </tr>`).join('')}</tbody>
  </table>`;
}

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
    ${[[0, 170], [190, 150], [360, 120], [520, 145], [600, 70]].map(([x, y]) =>
      `<circle cx="${x}" cy="${y}" r="4" fill="var(--cyan)" opacity=".8"/>`).join('')}
  </svg>`;
}

// ── PAGES ──────────────────────────────────────────────
const pages = {

  dashboard() {
    const completedMods = pythonModules.filter(m => m.status === 'completed').length;
    const activeMod = pythonModules.find(m => m.status === 'in-progress');
    return `<div class="page-enter">
    ${roleBanner()}
    <div class="hero">
      <h1>Willkommen zurück, Alexander 👋</h1>
      <p>Du lernst gerade <b class="cyan">Python Bootcamp</b>. Aktives Modul:
        <b class="cyan">${activeMod ? activeMod.title : 'Kein aktives Modul'}</b>.
      </p>
      <div class="hero-stats">
        <div class="hero-stat"><div class="hs-val cyan">Lv.${state.level}</div><div class="hs-lbl">Level</div></div>
        <div class="hero-stat"><div class="hs-val yellow">${state.streak}</div><div class="hs-lbl">Streak</div></div>
        <div class="hero-stat" style="cursor:pointer" onclick="render('analysen')"><div class="hs-val">${(state.xp / 1000).toFixed(1)}k</div><div class="hs-lbl" style="color:var(--cyan)">XP ↗</div></div>
        <div class="hero-stat" style="cursor:pointer" onclick="render('lernpfad')"><div class="hs-val green">${completedMods}/10</div><div class="hs-lbl" style="color:var(--green)">Module ↗</div></div>
      </div>
    </div>

    <!-- Python Bootcamp CTA -->
    <div class="card course-featured" style="margin-bottom:18px;display:flex;align-items:center;gap:18px;flex-wrap:wrap;padding:20px 24px">
      <div class="course-img python" style="height:64px;width:80px;border-radius:10px;margin:0;flex-shrink:0"></div>
      <div style="flex:1">
        <div class="muted" style="font-size:11px;text-transform:uppercase;letter-spacing:.1em;margin-bottom:4px">Aktiver Kurs · Apigenio GmbH</div>
        <h3 style="margin:0;font-size:16px">Python Bootcamp</h3>
        <p style="font-size:12px;margin:4px 0 0">
          ${activeMod
            ? `Weiter mit <b>${activeMod.title}</b> – ${activeMod.progress}% abgeschlossen`
            : `${completedMods} von 10 Modulen abgeschlossen`}
        </p>
      </div>
      <div style="display:flex;flex-direction:column;gap:8px;align-items:flex-end">
        <button class="primary" onclick="render('lernpfad')">◈ Lernpfad öffnen →</button>
        ${activeMod ? `<button class="outline" style="font-size:11px" onclick="startModuleAction(${activeMod.id})">Weiterlernen</button>` : ''}
      </div>
    </div>

    <div class="grid cols-2">
      <section>
        <h2>Deine Kurse</h2>
        <div class="grid cols-equal-2">${courses.slice(1, 3).map(courseCard).join('')}</div>
        <h2 style="margin-top:28px">Lernstatistik</h2>
        <div class="card">
          <div class="chart">
            ${[38, 62, 86, 100, 28, 16, 52].map((h, i) => `<div class="bar" style="left:${i * 14}%;height:${h}%"></div>`).join('')}
          </div>
          <div class="grid cols-equal-2" style="margin-top:12px">
            <div><span class="muted" style="font-size:11px">Wöchentl. Durchschnitt</span><div class="stat-value" style="font-size:20px">4.2 Std.</div></div>
            <div><span class="muted" style="font-size:11px">Lernserie</span><div class="stat-value cyan" style="font-size:20px">🔥 ${state.streak} Tage</div></div>
          </div>
        </div>
      </section>
      <aside class="grid" style="align-content:start">
        <div class="card">
          <h3>◉ KI-Tutor Empfehlungen</h3>
          ${activeMod
            ? `<p style="font-size:13px;margin-bottom:8px">Aktuelles Modul: <b class="cyan">${activeMod.title}</b></p>
               <p style="font-size:12px;margin-bottom:4px">💡 <b>Übe jetzt:</b> ${weaknessesSelf[0]} · 10 Min</p>
               <p style="font-size:12px">📝 <b>Quiz starten:</b> ${activeMod.title}</p>`
            : '<p style="font-size:13px">Starte ein Modul, um personalisierte Empfehlungen zu erhalten.</p>'}
          <button class="outline" style="margin-top:12px;width:100%" data-go="kiTutor">Mit KI-Tutor sprechen</button>
        </div>
        <div class="card">
          <h3>⚠ Meine Schwachpunkte <span class="badge" style="font-size:9px">${weaknessesSelf.length}</span></h3>
          <div class="weakness-list">${weaknessesSelf.slice(0, 3).map(w => `<div class="weakness-tag">${w}</div>`).join('')}</div>
          <div style="display:flex;gap:8px;margin-top:12px">
            <button class="outline" style="flex:1" onclick="openWeaknessModal()">Details</button>
            <button class="outline" style="flex:1" data-go="analysen">Analysen</button>
          </div>
        </div>
        ${state.role !== 'student' ? `<div class="card purple-glow">
          <h3 style="color:var(--purple)">📊 Dozentenübersicht</h3>
          <p style="font-size:12px">${students.filter(s => s.activity === 'Aktiv').length} Studenten aktiv · ${students.filter(s => s.weaknesses.length > 2).length} brauchen Unterstützung</p>
          <button class="outline" style="border-color:var(--purple);color:var(--purple);margin-top:10px;width:100%" data-go="benutzer">Studenten ansehen</button>
        </div>` : ''}
        <div class="card">
          <h3>Nächste Termine</h3>
          <p style="font-size:13px"><b>28. Jan</b> – Python Bootcamp Live-Session<br><span class="muted">Modul 3: Variablen & Operatoren</span></p>
          <p style="margin-top:8px;font-size:13px"><b>04. Feb</b> – Abgabe Übungsaufgaben Set 2<br><span class="muted">Python Bootcamp · Modul 4</span></p>
        </div>
      </aside>
    </div>
    </div>`;
  },

  kurse() {
    return `<div class="page-enter">
    ${roleBanner()}
    <h1>Meine Kurse</h1>
    <p>Setze deine Lernreise fort – oder starte einen neuen Kurs. Der <b class="cyan">Python Bootcamp</b> enthält einen strukturierten Lernpfad.</p>
    <div class="tabs">
      <button class="active">Alle (${courses.length})</button>
      <button>Aktiv (${state.activeCourseId !== null ? 1 : 0})</button>
      <button>Abgeschlossen (${state.completedCourses.size})</button>
    </div>
    ${state.role !== 'student' ? `<div class="card" style="margin-bottom:16px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px">
      <div><h3 style="margin:0">Kursverwaltung</h3><p style="font-size:12px;margin:0">${state.role === 'admin' ? 'Kurse erstellen, bearbeiten & archivieren' : 'Kurse bearbeiten & Materialien hochladen'}</p></div>
      <div style="display:flex;gap:8px;flex-wrap:wrap">
        <button class="outline" style="font-size:11px;padding:7px 12px">+ Neuer Kurs</button>
        ${state.role === 'admin' ? '<button class="outline" style="font-size:11px;padding:7px 12px;border-color:var(--yellow);color:var(--yellow)">⚙ Konfiguration</button>' : ''}
      </div>
    </div>` : ''}
    <div class="grid cols-equal-2" style="gap:18px">${courses.map(courseCard).join('')}</div>
    </div>`;
  },

  lernpfad() {
    const completedCount = pythonModules.filter(m => m.status === 'completed').length;
    const inProgressMod = pythonModules.find(m => m.status === 'in-progress');
    const overallProg = state.courseProgress[0] || 0;
    const totalHours = pythonModules.reduce((s, m) => {
      const h = parseFloat(m.duration); return s + (isNaN(h) ? 0 : h);
    }, 0);

    const timelineHtml = pythonModules.map((mod, idx) => {
      const isLast = idx === pythonModules.length - 1;
      const connClass = mod.status === 'completed' ? 'done' : mod.status === 'in-progress' ? 'active' : '';
      return `
        ${moduleCard(mod, idx)}
        ${!isLast ? `<div class="module-connector ${connClass}"></div>` : ''}
      `;
    }).join('');

    return `<div class="page-enter">
    <div style="display:flex;align-items:center;gap:12px;margin-bottom:20px;flex-wrap:wrap">
      <button class="ghost" style="font-size:12px;padding:7px 12px" onclick="render('kurse')">← Zurück zu Kursen</button>
      <h1 style="margin:0">Python Bootcamp <span class="cyan">Lernpfad</span></h1>
      <span class="badge orange">BESTSELLER</span>
    </div>

    <div class="lernpfad-header-card">
      <div style="flex:1">
        <div class="muted" style="font-size:11px;text-transform:uppercase;letter-spacing:.1em;margin-bottom:6px">Apigenio GmbH · Python Bootcamp</div>
        <div class="progress" style="height:10px;margin:0 0 10px">
          <span style="width:${overallProg}%"></span>
        </div>
        <div style="font-size:12px;color:var(--muted)">${overallProg}% des Lernpfads abgeschlossen</div>
      </div>
      <div class="lp-stats">
        <div class="lp-stat"><div class="lp-val cyan">${completedCount}/10</div><div class="lp-lbl">Module</div></div>
        <div class="lp-stat"><div class="lp-val yellow">${overallProg}%</div><div class="lp-lbl">Fortschritt</div></div>
        <div class="lp-stat"><div class="lp-val">${Math.round(totalHours)}h</div><div class="lp-lbl">Gesamtdauer</div></div>
        <div class="lp-stat"><div class="lp-val green">+600 XP</div><div class="lp-lbl">Abschluss-XP</div></div>
      </div>
      ${inProgressMod ? `
      <button class="primary" onclick="startModuleAction(${inProgressMod.id})">
        ▶ Weiterlernen: Modul ${inProgressMod.id + 1}
      </button>` : (completedCount === 0 ? `
      <button class="primary" onclick="startModuleAction(0)">Lernpfad starten →</button>
      ` : '')}
    </div>

    <div class="module-timeline">
      ${timelineHtml}
    </div>
    </div>`;
  },

  kiTutor() {
    const activeMod = pythonModules.find(m => m.status === 'in-progress');
    const contextMsg = activeMod
      ? `Ich sehe, du arbeitest gerade an <b class="cyan">${activeMod.title}</b>. Was möchtest du dazu wissen?`
      : 'Hallo! Ich bin dein Manthio KI-Tutor. Worüber möchtest du heute lernen?';

    return `<div class="page-enter"><div class="grid cols-2">
      <section class="card">
        <h2>KI‑Tutor <span class="badge">Aktive Lernsitzung</span></h2>
        <div class="chat" id="chat">
          <div class="msg">${contextMsg}</div>
          <div class="msg user">Was ist der Unterschied zwischen einer Liste und einem Tuple?</div>
          <div class="msg">Gute Frage! Eine <b class="cyan">Liste</b> ist veränderlich (mutable), ein <b class="cyan">Tuple</b> ist unveränderlich (immutable). Beide speichern geordnete Daten, aber Tuples sind schneller und signalisieren, dass die Daten nicht geändert werden sollen.</div>
        </div>
        <div class="chatbox">
          <input id="chatInput" placeholder="Stelle eine Frage zu deinem Kurs..." />
          <button class="primary" id="sendChat">Senden</button>
        </div>
      </section>
      <aside class="grid" style="align-content:start">
        ${activeMod ? `<div class="card highlight">
          <h3>◈ Aktuelles Modul</h3>
          <p style="font-size:13px"><b class="cyan">${activeMod.title}</b></p>
          <div class="progress" style="margin:8px 0;height:5px"><span style="width:${activeMod.progress}%"></span></div>
          <p style="font-size:12px">${activeMod.progress}% abgeschlossen · ${activeMod.duration}</p>
          <button class="outline" style="margin-top:8px;width:100%" onclick="render('lernpfad')">Lernpfad öffnen →</button>
        </div>` : ''}
        <div class="card">
          <h3>💡 Lernempfehlungen</h3>
          <p style="font-size:13px;margin-bottom:6px"><b>${weaknessesSelf[0]}</b> üben · 10 Min</p>
          <p style="font-size:13px;margin-bottom:6px"><b>${weaknessesSelf[1]}</b> Konzept · 8 Min</p>
          <p style="font-size:13px"><b>${activeMod ? activeMod.title : 'Python Grundlagen'}</b> Quiz · 5 Fragen</p>
        </div>
        <div class="card">
          <h3>Formel des Tages</h3>
          <pre class="mono code-block" style="color:var(--cyan);padding:10px;border-radius:8px;overflow:auto;font-size:13px"># List Comprehension
squares = [x**2 for x in range(10)]
# Dictionary Comprehension
d = {k:v for k,v in pairs}</pre>
        </div>
        <div class="card">
          <h3>⚠ Deine Schwachpunkte</h3>
          <div class="weakness-list">${weaknessesSelf.slice(0, 3).map(w => `<div class="weakness-tag">${w}</div>`).join('')}</div>
          <button class="outline" style="margin-top:10px;width:100%" onclick="openWeaknessModal()">Details ansehen</button>
        </div>
        <div class="card">
          <h3>Gespeicherte Ressourcen</h3>
          <p style="font-size:13px">📄 Python Cheatsheet – 420 KB</p>
          <p style="font-size:13px;margin-top:4px">🎬 OOP in Python erklärt – 12:30</p>
          <p style="font-size:13px;margin-top:4px">📦 Übungsaufgaben Set 2 – ZIP</p>
          <button class="outline" style="margin-top:10px;width:100%" data-go="ressourcen">Alle Ressourcen →</button>
        </div>
      </aside>
    </div></div>`;
  },

  analysen() {
    const isDozent = state.role !== 'student';
    const weekData = [38, 62, 86, 100, 28, 16, 52];
    return `<div class="page-enter">
    ${roleBanner()}
    <h1>Analysen <span class="cyan">Intelligence</span></h1>
    <p>${isDozent ? 'Detaillierte Einblicke in Kurs- und Studentenleistungen.' : 'Detaillierte Einblicke in deine Lernreise.'}</p>
    <div class="grid cols-4" style="margin-top:20px">
      ${isDozent
        ? stat('Aktive Studenten', '148', '+8 diese Woche', 'green')
          + stat('Ø Kursabschluss', '67%', 'Ziel: 75%', 'muted')
          + stat('Offene Abgaben', '12', 'Fällig diese Woche', 'red')
          + stat('Ø Notenschnitt', '2.1', 'Stabil', 'cyan')
        : stat('Lernstunden', '18.5 h', '+12% ggü. Vorwoche')
          + stat('Python Module', `${pythonModules.filter(m => m.status === 'completed').length}/10`, 'Abgeschlossen', 'green')
          + stat('Streak', '🔥 ' + state.streak + ' Tage', 'Rekord: 15 Tage', 'yellow')
          + stat('Kosten', CHF.format(9.99), 'Premium aktiv', 'green')
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
          ${['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'].map((d, i) =>
            `<span title="${weekData[i]} Min gelernt">${d}<br><span class="cyan">${weekData[i]}m</span></span>`).join('')}
        </div>
      </div>
      <div class="card">
        <h2>⚠ KI‑Schwachpunkt-Analyse</h2>
        <div class="weakness-list">${weaknessesSelf.map(w =>
          `<div class="weakness-tag" onclick="render('kiTutor')" style="cursor:pointer" title="Im Tutor üben">${w} ↗</div>`).join('')}</div>
        <div style="margin-top:16px">
          <div class="muted" style="font-size:11px;text-transform:uppercase;letter-spacing:.1em;margin-bottom:8px">Python Kompetenzprofil</div>
          ${[['Abstrakte Logik', 80, 'green'], ['Python Syntax', 70, 'cyan'], ['OOP Konzepte', 45, 'yellow'], ['Fehlerbehandlung', 38, 'red']].map(([l, v, c]) => `
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
        const color = bstate === 'done' ? 'var(--green)' : 'var(--cyan)';
        return `<div style="margin-bottom:12px">
          <div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:5px;align-items:center">
            <span>${c.title}</span>
            <span style="color:${color};font-family:var(--mono);font-size:11px">${prog}%${bstate === 'done' ? ' ✓' : ''}</span>
          </div>
          <div class="progress" style="height:5px"><span style="width:${prog}%;background:${color};box-shadow:none"></span></div>
        </div>`;
      }).join('')}
    </div>
    <div class="card" style="margin-top:20px">
      <h2>Lernzeitpunkt Heatmap</h2>
      <div style="display:flex;justify-content:space-between;font-size:11px;color:var(--muted);margin-bottom:7px">
        ${['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'].map(d => `<span>${d}</span>`).join('')}
      </div>
      <div class="heatmap">${Array.from({ length: 126 }, (_, i) =>
        `<span class="cell ${i % 5 === 0 ? 'on' : i % 3 === 0 ? 'mid' : ''}" title="Lernsitzung"></span>`).join('')}</div>
    </div>
    </div>`;
  },

  ressourcen() {
    const canUpload = state.role !== 'student';
    return `<div class="page-enter">
    ${roleBanner()}
    <h1>Datei‑Zentrum</h1>
    <p>Verwalte Kursmaterialien, Lernunterlagen und Übungssätze für alle Kurse.</p>
    <div class="grid cols-3" style="margin-top:20px">
      ${stat('Dateien gesamt', resources.length.toString(), 'PDF, Video, Archiv', 'muted')}
      ${stat('Kurszuordnungen', '6', 'Alle Kurse abgedeckt', 'muted')}
      <div class="card">
        <h3>KI‑Optimierung</h3>
        <p style="font-size:13px">Das KI-Modell hat <b class="cyan">45 neue Ressourcen</b> automatisch verschlagwortet.</p>
        <button class="outline" style="margin-top:10px;font-size:12px">Review starten</button>
      </div>
    </div>

    ${!canUpload ? `<div class="card" style="margin-top:16px">
      <p style="font-size:13px;color:var(--muted)">📋 Als Student kannst du Ressourcen einsehen, aber keine Dateien hochladen. Wende dich an deinen Dozenten.</p>
    </div>` : ''}

    <div class="card" style="margin-top:22px">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;flex-wrap:wrap;gap:10px">
        <div>
          <h2 style="margin:0">${resources.length} Dateien</h2>
          ${canUpload ? '<p style="font-size:12px;margin:2px 0 0;color:var(--muted)">Als Dozent / Admin kannst du Dateien hochladen.</p>' : ''}
        </div>
        ${canUpload ? `
        <div style="display:flex;gap:8px;flex-wrap:wrap">
          <button class="primary" style="font-size:12px;padding:9px 16px" onclick="triggerFileUpload()">
            ↑ Datei hochladen
          </button>
          ${state.role === 'admin' ? '<button class="outline" style="font-size:11px;padding:8px 12px;border-color:var(--yellow);color:var(--yellow)">⚙ Verwalten</button>' : ''}
        </div>` : ''}
      </div>
      ${tableFromResources()}
    </div>
    </div>`;
  },

  benutzer() {
    return `<div class="page-enter">
    ${roleBanner()}
    <h1>Benutzerverwaltung</h1>
    <p>Verwalte Plattformteilnehmer, Rollen und Zugangsdaten.</p>
    <div class="grid cols-4" style="margin-top:20px">
      ${stat('Gesamtbenutzer', '12.842', '+12% diesen Monat')}
      ${stat('Jetzt aktiv', '1.402', 'Live auf der Plattform', 'green')}
      ${stat('Dozenten-Verhältnis', '1:45', 'Optimal', 'muted')}
      ${stat('Systemstatus', '99.9%', '<span class="status-dot"></span> Stabil', 'green')}
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
          ${students.map((s, i) => `<tr>
            <td><b>${s.name}</b></td>
            <td style="font-size:12px">${s.course}</td>
            <td>
              <span class="${s.progress === 100 ? 'green' : s.progress < 20 ? 'red' : 'cyan'}">${s.progress}%</span>
              <div class="progress" style="margin-top:4px;width:90px"><span style="width:${s.progress}%;${s.progress === 100 ? 'background:var(--green)' : s.progress < 20 ? 'background:var(--red)' : ''}"></span></div>
            </td>
            <td class="muted" style="font-size:12px">${s.activity}</td>
            <td class="${parseFloat(s.grade) <= 1.5 ? 'green' : parseFloat(s.grade) >= 3 ? 'red' : ''}">${s.grade}</td>
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
        <label><b>Vollständiger Name</b><input class="field" value="Alex Chen"></label>
        <label><b>E‑Mail‑Adresse</b><input class="field" value="alex.chen@manthio.io"></label>
        <label><b>Berufliche Bio</b>
          <textarea>Software Developer & Python-Enthusiast. Aktuell im Python Bootcamp bei Apigenio GmbH.</textarea>
        </label>
        <button class="primary">Änderungen speichern</button>
      </section>
      <section>
        <div class="card" style="margin-bottom:16px">
          <h2>Abonnement & Preise</h2>
          <div class="grid cols-3">
            <div class="price-card">
              <div class="price-name">Basis</div>
              <div class="price-val">Gratis</div>
              <div class="price-sub">Essenzielle Werkzeuge</div>
              <button class="outline" style="margin-top:8px">Wählen</button>
            </div>
            <div class="price-card active">
              <div class="price-name">Premium</div>
              <div class="price-val">${CHF.format(9.99)}</div>
              <div class="price-sub cyan">Aktuell aktiv ✓</div>
              <button class="outline" style="margin-top:8px">Aktuell</button>
            </div>
            <div class="price-card">
              <div class="price-name">Business</div>
              <div class="price-val">Individ.</div>
              <div class="price-sub">Für Unternehmen</div>
              <button class="outline" style="margin-top:8px">Kontakt</button>
            </div>
          </div>
        </div>
        <div class="card">
          <h2>Darstellung & Präferenzen</h2>
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px">
            <div>
              <b style="display:block;font-size:14px">Anzeigemodus</b>
              <span class="muted" style="font-size:12px">Wechsle zwischen Dark- und Light-Mode</span>
            </div>
            <button class="outline" onclick="toggleTheme()" id="settingsThemeBtn" style="display:flex;align-items:center;gap:6px;font-size:13px">
              <span id="settingsThemeIcon">${document.body.classList.contains('light-mode') ? '🌙' : '☀️'}</span>
              ${document.body.classList.contains('light-mode') ? 'Light-Modus aktiv' : 'Dark-Modus aktiv'}
            </button>
          </div>
          <p style="font-size:13px"><label><input type="checkbox" checked> E‑Mail‑Benachrichtigungen</label></p>
          <p style="font-size:13px;margin-top:8px"><label><input type="checkbox"> Lernerinnerungen</label></p>
          <p style="font-size:13px;margin-top:8px"><label><input type="checkbox" checked> Datenanonymisierung</label></p>
          <div style="display:flex;gap:8px;margin-top:16px">
            <button class="primary">Speichern</button>
            <button class="danger">Konto deaktivieren</button>
          </div>
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
  document.querySelectorAll('nav button').forEach(b =>
    b.classList.toggle('active', b.dataset.page === page));
  const view = document.getElementById('view');
  view.innerHTML = pages[page] ? pages[page]() : pages.dashboard();
  // Wire [data-go] links inside the rendered view
  view.querySelectorAll('[data-go]').forEach(b =>
    b.onclick = () => render(b.dataset.go));
  // Wire tab buttons inside the rendered view
  view.querySelectorAll('.tabs button').forEach(b => b.onclick = function () {
    this.parentElement.querySelectorAll('button').forEach(x => x.classList.remove('active'));
    this.classList.add('active');
  });
  // KI Tutor chat
  const sendBtn = document.getElementById('sendChat');
  if (sendBtn) {
    const doSend = () => {
      const input = document.getElementById('chatInput');
      if (!input || !input.value.trim()) return;
      const chat = document.getElementById('chat');
      const activeMod = pythonModules.find(m => m.status === 'in-progress');
      const reply = activeMod
        ? `Gute Frage zu <b>${activeMod.title}</b>! Ich erkläre das Schritt für Schritt und gebe dir eine passende Übung.`
        : 'Gute Frage! Ich erkläre das Schritt für Schritt und gebe dir danach eine Übungsaufgabe.';
      chat.insertAdjacentHTML('beforeend',
        `<div class="msg user">${input.value}</div><div class="msg">${reply}</div>`);
      input.value = '';
      chat.scrollTop = chat.scrollHeight;
      awardXP(10, '– Tutorfrage gestellt');
    };
    sendBtn.onclick = doSend;
    const inp = document.getElementById('chatInput');
    if (inp) inp.onkeydown = e => { if (e.key === 'Enter') doSend(); };
  }
}

// ── HAMBURGER ──────────────────────────────────────────
function setupHamburger() {
  const hamBtn = document.getElementById('hamBtn');
  const sidebar = document.querySelector('.sidebar');
  const overlay = document.getElementById('sidebarOverlay');
  if (!hamBtn) return;
  hamBtn.onclick = () => { sidebar.classList.toggle('open'); overlay.classList.toggle('open'); };
  overlay.onclick = () => { sidebar.classList.remove('open'); overlay.classList.remove('open'); };
}

function closeSidebar() {
  document.querySelector('.sidebar').classList.remove('open');
  document.getElementById('sidebarOverlay').classList.remove('open');
}

// ── INIT ───────────────────────────────────────────────
document.querySelectorAll('nav button').forEach(b => b.onclick = () => {
  render(b.dataset.page);
  closeSidebar();
});
document.querySelectorAll('[data-go]').forEach(b => b.onclick = () => render(b.dataset.go));

document.getElementById('search').addEventListener('input', e => {
  document.title = e.target.value.length > 2
    ? 'Suche: ' + e.target.value + ' – Manthio'
    : 'Manthio – Lernplattform';
});

document.getElementById('streakCount').textContent = state.streak;

// Sync role select to state
document.getElementById('roleSelect').value = state.role;

// Calculate initial Python Bootcamp progress from modules
updateCourseProgressFromModules();

initTheme();
initFileUpload();
setupHamburger();
updateNavForRole();
render();
