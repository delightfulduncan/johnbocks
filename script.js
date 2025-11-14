// -----------------------
// Supabase setup
// -----------------------
const SUPABASE_URL = "https://cdjgwdqvcbptdohjczww.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNkamd3ZHF2Y2JwdGRvaGpjend3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI5Mzk2OTEsImV4cCI6MjA3ODUxNTY5MX0.SUIVOLFjXLDR8pAtQJUrpLKWWTKVkYs9Qw7xEl5EreM";
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

let user = null;
let playerId = null;
let roundId = null;

// -----------------------
// LOGIN BUTTON
// -----------------------
document.getElementById("enter").onclick = async () => {
  console.log("Enter clicked!"); // DEBUG

  const name = document.getElementById("username").value.trim();
  const emoji = document.getElementById("emoji").value;

  if (!name) {
    alert("Please enter a username!");
    return;
  }

  console.log("Username:", name, "Emoji:", emoji); // DEBUG

  try {
    const { data, error } = await supabase.from("players_online").insert({
      username: name,
      emoji: emoji,
      last_seen: new Date().toISOString()
    }).select().single();

    if (error) {
      console.error("Supabase insert error:", error);
      alert("Error joining game: " + error.message);
      return;
    }

    console.log("Player added successfully:", data); // DEBUG

    user = { name, emoji };
    playerId = data.id;

    document.getElementById("welcome").innerText = `${emoji} ${name}`;
    document.getElementById("login-screen").style.display = "none";
    document.getElementById("game-screen").style.display = "block";

    // Start heartbeat & subscriptions
    startHeartbeat();
    subscribeOnlinePlayers();
    subscribeGameState();

  } catch (err) {
    console.error("Unexpected error:", err);
    alert("Unexpected error. Check console.");
  }
};
// -----------------------
// KEEP PLAYER ONLINE
// -----------------------
function startHeartbeat() {
  setInterval(async () => {
    if (!playerId) return;
    await supabase.from("players_online").update({
      last_seen: new Date().toISOString()
    }).eq("id", playerId);
  }, 5000);
}

// -----------------------
// ONLINE PLAYER COUNT
// -----------------------
async function subscribeOnlinePlayers() {
  const { data: players, error } = await supabase
    .from("players_online")
    .select("id,last_seen");

  updateOnlineCount(players);

  supabase.from("players_online").on("UPDATE", payload => {
    fetchOnlineCount();
  }).subscribe();

  supabase.from("players_online").on("INSERT", payload => {
    fetchOnlineCount();
  }).subscribe();

  supabase.from("players_online").on("DELETE", payload => {
    fetchOnlineCount();
  }).subscribe();
}

async function fetchOnlineCount() {
  const { data } = await supabase.from("players_online")
    .select("*")
    .gte("last_seen", new Date(Date.now() - 15000).toISOString());

  updateOnlineCount(data);
}

function updateOnlineCount(players) {
  document.getElementById("online-count").innerText = players.length;
}

// -----------------------
// GAME STATE
// -----------------------
async function subscribeGameState() {
  const { data: game } = await supabase.from("game_state").select("*").limit(1).single();
  updateGameUI(game);

  supabase.from("game_state").on("UPDATE", payload => {
    updateGameUI(payload.new);
  }).subscribe();
}

// Update the UI based on game state
function updateGameUI(game) {
  if (!game) return;

  const now = new Date();
  const end = new Date(game.end_time);
  let diff = Math.max(0, Math.ceil((end - now) / 1000));

  document.getElementById("timer").innerText = diff;
  document.getElementById("game-status").innerText = game.phase.toUpperCase();

  if (game.phase === "pregame") {
    document.getElementById("join-btn").style.display = "block";
    document.getElementById("spectating").style.display = "none";
  } else if (game.phase === "game") {
    document.getElementById("join-btn").style.display = "none";
    document.getElementById("spectating").style.display = "block";
  } else {
    document.getElementById("join-btn").style.display = "none";
    document.getElementById("spectating").style.display = "none";
  }

  // Countdown timer every second
  clearInterval(window.timerInterval);
  window.timerInterval = setInterval(() => {
    diff--;
    document.getElementById("timer").innerText = Math.max(0, diff);
    if (diff <= 0) clearInterval(window.timerInterval);
  }, 1000);
}

// -----------------------
// JOIN BUTTON
// -----------------------
document.getElementById("join-btn").onclick = async () => {
  if (!playerId || !roundId) return;
  await supabase.from("game_players").insert({
    player_id: playerId,
    round_id: roundId,
    is_playing: true
  });
  document.getElementById("join-btn").style.display = "none";
  document.getElementById("spectating").style.display = "none";
};
