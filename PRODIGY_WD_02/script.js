const mainTimeEl = document.getElementById("mainTime");
const splitTimeEl = document.getElementById("splitTime");
const lapListEl = document.getElementById("lapList");
const startPauseBtn = document.getElementById("startPause");
const resetBtn = document.getElementById("reset");
const lapBtn = document.getElementById("lap");

const saveBtn = document.getElementById("save");
const clearHistoryBtn = document.getElementById("clearHistory");
const historyListEl = document.getElementById("historyList");

// Time state
let startTime = 0;
let elapsed = 0;
let splitStart = 0;
let splitElapsed = 0;
let timerId = null;
let running = false;
let laps = [];

// Helpers
const fmt = (ms) => {
  const m = Math.floor(ms / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  const cs = Math.floor((ms % 1000) / 10); // centiseconds
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}.${String(cs).padStart(2, "0")}`;
};

function renderTimes() {
  mainTimeEl.textContent = fmt(elapsed);
  splitTimeEl.textContent = fmt(splitElapsed);
}

function renderLaps() {
  lapListEl.innerHTML = "";
  laps
    .map((lap, i) => ({ ...lap, index: laps.length - i })) // reverse numbering
    .forEach(({ index, lapTime, total }, idx) => {
      const li = document.createElement("li");
      li.className = "lap-item";
      if (idx === 0) li.classList.add("highlight"); // most recent
      li.innerHTML = `
        <span class="lap-index">Lap ${String(index).padStart(2, "0")}</span>
        <span class="lap-time">${fmt(lapTime)}</span>
        <span class="lap-total">${fmt(total)}</span>
      `;
      lapListEl.prepend(li);
    });
}

function renderHistory() {
  const hist = JSON.parse(localStorage.getItem("stopwatch_history") || "[]");
  historyListEl.innerHTML = "";
  hist.forEach((entry) => {
    const li = document.createElement("li");
    li.className = "history-item";
    li.innerHTML = `
      <span class="title">${entry.title}</span>
      <span class="value">${entry.value}</span>
    `;
    historyListEl.appendChild(li);
  });
}

function start() {
  running = true;
  startTime = Date.now() - elapsed;
  splitStart = Date.now() - splitElapsed;
  timerId = setInterval(() => {
    const now = Date.now();
    elapsed = now - startTime;
    splitElapsed = now - splitStart;
    renderTimes();
  }, 16); // ~60fps
  startPauseBtn.textContent = "Pause";
  startPauseBtn.classList.remove("primary");
  startPauseBtn.classList.add("ghost");
}

function pause() {
  running = false;
  clearInterval(timerId);
  startPauseBtn.textContent = "Resume";
  startPauseBtn.classList.remove("ghost");
  startPauseBtn.classList.add("primary");
}

function reset() {
  pause();
  elapsed = 0;
  splitElapsed = 0;
  laps = [];
  renderTimes();
  renderLaps();
  startPauseBtn.textContent = "Start";
  startPauseBtn.classList.add("primary");
}

function addLap() {
  if (!running && elapsed === 0) return; // no lap before start
  const lapTime = splitElapsed;
  const total = elapsed;
  laps.push({ lapTime, total });
  splitElapsed = 0;
  splitStart = Date.now();
  renderLaps();
  renderTimes();
}

function saveHistory() {
  const hist = JSON.parse(localStorage.getItem("stopwatch_history") || "[]");
  const sessionTitle = `Session ${new Date().toLocaleString()}`;
  const totalTime = fmt(elapsed);
  const lapCount = laps.length;
  hist.unshift({ title: sessionTitle, value: `${totalTime} • ${lapCount} laps` });
  localStorage.setItem("stopwatch_history", JSON.stringify(hist.slice(0, 20)));
  renderHistory();
}

function clearHistory() {
  localStorage.removeItem("stopwatch_history");
  renderHistory();
}

// Events
startPauseBtn.addEventListener("click", () => (running ? pause() : start()));
resetBtn.addEventListener("click", reset);
lapBtn.addEventListener("click", addLap);
saveBtn.addEventListener("click", saveHistory);
clearHistoryBtn.addEventListener("click", clearHistory);

// Keyboard accessibility
document.addEventListener("keydown", (e) => {
  if (e.code === "Space") { e.preventDefault(); running ? pause() : start(); }
  if (e.code === "Enter") { e.preventDefault(); addLap(); }
  if (e.code === "Escape") { e.preventDefault(); reset(); }
});

// Initial render
renderTimes();
renderLaps();
renderHistory();