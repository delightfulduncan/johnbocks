let user = null;
let playingThisRound = false;
let currentState = null;
let timerHandle = null;

// LOGIN
document.getElementById("enter").onclick = () => {
  const name = document.getElementById("username").value.trim();
  const emoji = document.getElementById("emoji").value;
  if (!name) return alert("Enter username");

  user = { name, emoji };

  document.getElementById("welcome").innerText = `${emoji} ${name}`;
  document.getElementById("login-screen").style.display = "none";
  document.getElementById("game-screen").style.display = "block";

  // Start local game loop
  initLocalGame();
};

// LOCAL GAME LOOP (no Supabase)
function initLocalGame() {
  updateUI();
  gameLoop();
}

function updateUI() {
  const phase = currentState?.phase || "idle";
  const end_time = currentState?.end_time || new Date().toISOString();

  if (phase === "idle") {
    document.getElementById("game-status").innerText = "Waiting...";
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
    }
  }
}

function countdownTo(endTime) {
  clearInterval(timerHandle);
  timerHandle = setInterval(() => {
    const diff = (new Date(endTime) - new Date()) / 1000;
    document.getElementById("timer").innerText = diff > 0 ? Math.ceil(diff) : "0";
  }, 200);
}

async function gameLoop() {
  while (true) {
    currentState = { phase: "pregame", end_time: new Date(Date.now() + 10000).toISOString() };
    playingThisRound = false;
    updateUI();
    await new Promise(r => setTimeout(r, 10000));

    currentState = { phase: "game", end_time: new Date(Date.now() + 10000).toISOString() };
    updateUI();
    await new Promise(r => setTimeout(r, 10000));

    currentState = { phase: "idle", end_time: new Date().toISOString() };
    updateUI();
    await new Promise(r => setTimeout(r, 3000));
  }
}

// JOIN BUTTON
document.getElementById("join-btn").onclick = () => {
  playingThisRound = true;
  document.getElementById("join-btn").style.display = "none";
  document.getElementById("spectating").style.display = "none";
};
