// -----------------------
// LOCAL GAME SIMULATION (with fake multiplayer)
// -----------------------

let user = null;
let playingThisRound = false;
let currentState = null;
let timerHandle = null;

// Simulated online players
let onlinePlayers = 0;

// -----------------------
// LOGIN BUTTON
// -----------------------
document.getElementById("enter").onclick = () => {
  const name = document.getElementById("username").value.trim();
  const emoji = document.getElementById("emoji").value || "🙂";

  if (!name) return alert("Enter username");

  user = { name, emoji };
  onlinePlayers++; // increment simulated online counter

  document.getElementById("welcome").innerText = `${emoji} ${name}`;
  document.getElementById("login-screen").style.display = "none";
  document.getElementById("game-screen").style.display = "block";

  // Start the local game loop
  initLocalGame();
};

// -----------------------
// LOCAL GAME LOOP
// -----------------------
function initLocalGame() {
  updateUI();
  gameLoop();
  updateOnlineCounter();
}

function updateUI() {
  const phase = currentState?.phase || "idle";
  const end_time = currentState?.end_time || new Date().toISOString();

  if (phase === "idle") {
    document.getElementById("game-status").innerText = "Waiting for next round...";
    document.getElementById("timer").innerText = "";
    document.getElementById("join-btn").style.display = "none";
    document.getElementById("spectating").style.display = "none";
  }

  if (phase === "pregame") {
    document.getElementById("game-status").innerText = "Round Starting!";
    countdownTo(end_time);
    document.getElementById("join-btn").style.display = "block";
    document.getElementById("spectating").style.display = "none";
  }

  if (phase === "game") {
    document.getElementById("game-status").innerText = "GAME IN PROGRESS!";
    countdownTo(end_time);
    if (!playingThisRound) {
      document.getElementById("join-btn").style.display = "none";
      document.getElementById("spectating").style.display = "block";
    } else {
      document.getElementById("join-btn").style.display = "none";
      document.getElementById("spectating").style.display = "none";
    }
  }
}

// -----------------------
// COUNTDOWN TIMER
// -----------------------
function countdownTo(endTime) {
  clearInterval(timerHandle);
  timerHandle = setInterval(() => {
    const diff = (new Date(endTime) - new Date()) / 1000;
    document.getElementById("timer").innerText = diff > 0 ? Math.ceil(diff) : "0";
  }, 200);
}

// -----------------------
// SIMULATED GAME LOOP
// -----------------------
async function gameLoop() {
  while (true) {
    // PREGAME: 10 seconds
    currentState = { phase: "pregame", end_time: new Date(Date.now() + 10000).toISOString() };
    playingThisRound = false;
    updateUI();
    await sleep(10000);

    // GAME: 10 seconds
    currentState = { phase: "game", end_time: new Date(Date.now() + 10000).toISOString() };
    updateUI();
    await sleep(10000);

    // IDLE: 3 seconds before next round
    currentState = { phase: "idle", end_time: new Date().toISOString() };
    updateUI();
    await sleep(3000);
  }
}

// -----------------------
// JOIN BUTTON
// -----------------------
document.getElementById("join-btn").onclick = () => {
  playingThisRound = true;
  document.getElementById("join-btn").style.display = "none";
  document.getElementById("spectating").style.display = "none";
};

// -----------------------
// ONLINE PLAYER COUNTER
// -----------------------
function updateOnlineCounter() {
  const counterEl = document.getElementById("online-count");
  counterEl.innerText = onlinePlayers;

  // Simulate random players joining/leaving every 5-8 seconds
  setInterval(() => {
    const change = Math.floor(Math.random() * 3) - 1; // -1, 0, +1
    onlinePlayers = Math.max(1, onlinePlayers + change);
    counterEl.innerText = onlinePlayers;
  }, 5000);
}

// -----------------------
// HELPER FUNCTION
// -----------------------
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
