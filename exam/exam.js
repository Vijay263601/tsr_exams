/*************************************************
 * TSR EXAMS – STUDENT EXAM SCRIPT (STRICT MODE)
 *************************************************/

/* ================= UTIL ================= */

function shuffleArray(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/* ================= PARAMS ================= */

const params = new URLSearchParams(window.location.search);
const examId = params.get("examId");

const examTitle = document.getElementById("examTitle");
const questionBox = document.getElementById("questionBox");
const timerEl = document.getElementById("timer");
const warningEl = document.getElementById("warning");

/* ================= STATE ================= */

let answers = {};
let timeLeft = 0;
let timerInterval = null;
let examSubmitted = false;

/* ================= INIT ================= */

if (!examId) {
  alert("Exam ID missing");
} else {
  loadExam();
}

/* ================= BLOCK COPY / PASTE ================= */

document.addEventListener("contextmenu", e => e.preventDefault());
document.addEventListener("selectstart", e => e.preventDefault());

["copy", "cut", "paste"].forEach(evt => {
  document.addEventListener(evt, e => {
    e.preventDefault();
    warningEl.innerText = "⚠️ Copy / Paste is not allowed";
  });
});

document.addEventListener("keydown", e => {
  if (e.ctrlKey && ["c", "v", "x"].includes(e.key.toLowerCase())) {
    e.preventDefault();
    warningEl.innerText = "⚠️ Copy / Paste is not allowed";
  }
});

/* ================= BLOCK REFRESH ================= */

document.addEventListener("keydown", e => {
  if (e.key === "F5" || (e.ctrlKey && e.key.toLowerCase() === "r")) {
    e.preventDefault();
    autoSubmit("REFRESH_ATTEMPT");
  }
});

window.addEventListener("beforeunload", e => {
  if (!examSubmitted) {
    e.preventDefault();
    e.returnValue = "";
  }
});

/* ================= LOAD EXAM ================= */

function loadExam() {
  fetch(API_URL + "?type=GET_EXAM&examId=" + encodeURIComponent(examId))
    .then(res => res.json())
    .then(data => {
      if (data.status !== "EXAM_LOADED") {
        alert("Failed to load exam");
        return;
      }

      examTitle.innerText = data.exam.examName;
      timeLeft = Number(data.exam.duration) * 60;
      startTimer();

      const shuffledQuestions = shuffleArray([...data.questions]);
      renderQuestions(shuffledQuestions);

      enableAntiCheat();
    })
    .catch(() => alert("Error loading exam"));
}

/* ================= TIMER ================= */

function startTimer() {
  updateTimer();
  timerInterval = setInterval(() => {
    timeLeft--;
    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      autoSubmit("TIME_OVER");
    }
    updateTimer();
  }, 1000);
}

function updateTimer() {
  const m = Math.floor(timeLeft / 60);
  const s = timeLeft % 60;
  timerEl.innerText =
    String(m).padStart(2, "0") + ":" + String(s).padStart(2, "0");
}

/* ================= QUESTIONS ================= */

function renderQuestions(questions) {
  questionBox.innerHTML = "";

  questions.forEach((q, i) => {
    const div = document.createElement("div");
    div.className = "question";

    let html = `<p><b>Q${i + 1}. ${q.question}</b></p>`;

    if (q.image) {
      html += `<img src="${q.image}" width="300"><br>`;
    }

    let options = q.options.map((opt, idx) => ({
      text: opt,
      letter: String.fromCharCode(65 + idx)
    }));

    options = shuffleArray(options);

    options.forEach(opt => {
      html += `
        <label>
          <input type="radio"
            name="${q.qid}"
            onchange="answers['${q.qid}']='${opt.letter}'">
          ${opt.text}
        </label><br>
      `;
    });

    div.innerHTML = html;
    questionBox.appendChild(div);
  });
}

/* ================= STRICT ANTI-CHEAT ================= */

function enableAntiCheat() {

  // Force fullscreen ONCE
  document.body.addEventListener(
    "click",
    requestFullscreenOnce,
    { once: true }
  );

  // ❌ EXIT FULLSCREEN = IMMEDIATE SUBMIT
  document.addEventListener("fullscreenchange", () => {
    if (!document.fullscreenElement && !examSubmitted) {
      autoSubmit("EXIT_FULLSCREEN");
    }
  });

  // ❌ TAB SWITCH / MINIMIZE = IMMEDIATE SUBMIT
  document.addEventListener("visibilitychange", () => {
    if (document.hidden && !examSubmitted) {
      autoSubmit("TAB_SWITCH");
    }
  });

  // ❌ ESC KEY = IMMEDIATE SUBMIT
  document.addEventListener("keydown", e => {
    if (e.key === "Escape" && !examSubmitted) {
      e.preventDefault();
      autoSubmit("ESC_PRESSED");
    }
  });
}

function requestFullscreenOnce() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen().catch(() => {
      autoSubmit("FULLSCREEN_DENIED");
    });
  }
}

/* ================= SUBMIT ================= */

function submitExam() {
  if (examSubmitted) return;
  autoSubmit("MANUAL");
}

function autoSubmit(reason) {
  if (examSubmitted) return;

  examSubmitted = true;
  clearInterval(timerInterval);
  disableInputs();

  const payload = {
    type: "SUBMIT_RESPONSE",
    examId: examId,
    student: JSON.parse(sessionStorage.getItem("student")) || {},
    answers: answers,
    tabSwitch: 1,
    cheated: reason !== "MANUAL"
  };

  fetch(API_URL, {
    method: "POST",
    body: JSON.stringify(payload)
  }).finally(() => {
    sessionStorage.removeItem("student");
    window.location.replace("thankyou.html");
  });
}

function disableInputs() {
  document
    .querySelectorAll("input, button")
    .forEach(el => (el.disabled = true));
}
