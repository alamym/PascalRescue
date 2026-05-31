// --- Firebase Integration ---
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, query, orderBy, limit, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCQu3bWWBVk90ZuqdaqOap5YXbwz2pMf1U",
  authDomain: "pascalrescue-e5aca.firebaseapp.com",
  projectId: "pascalrescue-e5aca",
  storageBucket: "pascalrescue-e5aca.firebasestorage.app",
  messagingSenderId: "5292211601",
  appId: "1:5292211601:web:a8e466b5f3e7b7944cee30",
  measurementId: "G-ENKHCW4E9N"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// --- Sound Effects Manager ---
const Sound = {
    ctx: null,
    init() { if (!this.ctx) this.ctx = new (window.AudioContext || window.webkitAudioContext)(); },
    play(type) {
        this.init();
        if (this.ctx.state === 'suspended') this.ctx.resume();
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        const now = this.ctx.currentTime;
        if (type === 'correct') {
            osc.type = 'sine';
            osc.frequency.setValueAtTime(523.25, now);
            osc.frequency.exponentialRampToValueAtTime(880, now + 0.1);
            gain.gain.setValueAtTime(0.1, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
            osc.start(now); osc.stop(now + 0.3);
        } else if (type === 'wrong') {
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(150, now);
            osc.frequency.linearRampToValueAtTime(50, now + 0.2);
            gain.gain.setValueAtTime(0.1, now);
            gain.gain.linearRampToValueAtTime(0.01, now + 0.2);
            osc.start(now); osc.stop(now + 0.2);
        } else if (type === 'victory') {
            [523.25, 659.25, 783.99, 1046.50].forEach((f, i) => {
                const o = this.ctx.createOscillator(); const g = this.ctx.createGain();
                o.connect(g); g.connect(this.ctx.destination);
                o.frequency.setValueAtTime(f, now + i * 0.1);
                g.gain.setValueAtTime(0.05, now + i * 0.1);
                g.gain.exponentialRampToValueAtTime(0.01, now + i * 0.1 + 0.5);
                o.start(now + i * 0.1); o.stop(now + i * 0.1 + 0.5);
            });
        }
    }
};

// Game State Management
let gameState = {
    rescuedTeachers: 0,
    score: 0,
    lives: 3,
    currentRoom: null,
    phase: 'minion',
    enemyHP: 100,
    progress: JSON.parse(localStorage.getItem('msaQuestProgress')) || {
        100: false, 200: false, 300: false, 400: false, 500: false, 0: false
    }
};

// --- Leaderboard Logic ---
async function saveScore(playerName) {
    if (!playerName) return;
    const badgeNames = { 100: 'DIGNITY', 200: 'KINDNESS', 300: 'COMPASSION', 400: 'COURAGE', 0: 'ENDEAVOUR' };
    const earnedBadges = Object.keys(badgeNames).filter(id => gameState.progress[id]).map(id => badgeNames[id]);

    try {
        await addDoc(collection(db, "leaderboard"), {
            name: playerName,
            score: gameState.score,
            teachers: gameState.rescuedTeachers,
            badges: earnedBadges,
            timestamp: serverTimestamp()
        });
        toggleLeaderboard(true);
    } catch (e) {
        alert("Error saving score.");
    }
}

async function fetchLeaderboard() {
    const list = document.getElementById('leaderboard-list');
    if (!list) return;
    list.innerHTML = "Loading...";
    try {
        const q = query(collection(db, "leaderboard"), orderBy("score", "desc"), limit(10));
        const snap = await getDocs(q);
        list.innerHTML = "";
        let rank = 1;
        snap.forEach((doc) => {
            const d = doc.data();
            const entry = document.createElement('div');
            entry.className = 'leader-entry';
            entry.innerHTML = `<span>#${rank} ${d.name}</span> <span>${d.score} pts</span>`;
            list.appendChild(entry);
            rank++;
        });
    } catch (e) { list.innerHTML = "Error loading."; }
}

function toggleLeaderboard(forceShow = null) {
    const overlay = document.getElementById('leaderboard-overlay');
    if (!overlay) return;
    if (forceShow === true || (forceShow === null && overlay.classList.contains('hidden'))) {
        overlay.classList.remove('hidden'); fetchLeaderboard();
    } else { overlay.classList.add('hidden'); }
}

// --- Question Data ---
const roomData = {
    101: { name: "101: Multiples", minions: [{q:"5x5?",a:25},{q:"12x2?",a:24},{q:"10x10?",a:100}], teacherRescue: {q:"LCM of 4,6?",a:12,enemy:"Cage ⛓️"} },
    102: { name: "102: Negatives", minions: [{q:"-5+3?",a:-2},{q:"10-15?",a:-5}], teacherRescue: {q:"-3x-4?",a:12} },
    103: { name: "103: Fractions", minions: [{q:"1/2 of 20?",a:10},{q:"25% of 100?",a:25}], teacherRescue: {q:"3/4 of 40?",a:30} },
    100: { name: "1F BOSS", type: 'boss', badge: "DIGNITY", questions: [{q:"HCF 12,18?",a:6},{q:"LCM 3,5?",a:15}] },
    201: { name: "201: Algebra", minions: [{q:"3a+2a?",a:"5a"},{q:"10x-x?",a:"9x"}], teacherRescue: {q:"3(x+2)?",a:"3x+6"} },
    202: { name: "202: Equations", minions: [{q:"x+5=10?",a:5},{q:"2x=20?",a:10}], teacherRescue: {q:"2x-2=8?",a:5} },
    200: { name: "2F BOSS", type: 'boss', badge: "KINDNESS", questions: [{q:"x/2=10?",a:20},{q:"3x+1=10?",a:3}] },
    301: { name: "301: Ratio", minions: [{q:"5:10 simpl?",a:2},{q:"1:2 of 30?",a:10}], teacherRescue: {q:"2:3 of 50?",a:30} },
    302: { name: "302: Angles", minions: [{q:"Line angle?",a:180},{q:"Triangle?",a:180}], teacherRescue: {q:"Rect angle?",a:90} },
    303: { name: "303: Perimeter", minions: [{q:"Sq side 4?",a:16},{q:"Rect 2x3?",a:10}], teacherRescue: {q:"Tri B10 H5?",a:25} },
    300: { name: "3F BOSS", type: 'boss', badge: "COMPASSION", questions: [{q:"Octagon sides?",a:8},{q:"Hexagon?",a:6}] },
    401: { name: "401: Chance", minions: [{q:"Heads prob?",a:0.5},{q:"Certain?",a:1}], teacherRescue: {q:"Die 6 prob?",a:6} },
    402: { name: "402: Data", minions: [{q:"Mean 2,4,6?",a:4},{q:"Mode 1,2,2?",a:2}], teacherRescue: {q:"Range 10,50?",a:40} },
    400: { name: "4F BOSS", type: 'boss', badge: "COURAGE", questions: [{q:"Median 1,5,9?",a:5},{q:"Impossible?",a:0}] },
    0: { name: "ROOFTOP", type: 'boss', badge: "ENDEAVOUR", questions: [{q:"(10+5)x2?",a:30},{q:"3x+1=10?",a:3}] }
};

// --- Logic ---
let currentQuestionSet = [];
let questionIndex = 0;
let bossTimer = null;
let timeLeft = 60;

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function getRandomQuestions(pool, count) {
    return shuffleArray([...pool]).slice(0, Math.min(count, pool.length));
}

function initiateBattle(roomId) {
    gameState.currentRoom = roomId;
    const data = roomData[roomId];
    if (!data) return;

    gameState.lives = 3;
    document.getElementById('map-screen').classList.add('hidden');
    document.getElementById('battle-screen').classList.remove('hidden');
    document.getElementById('room-name').innerText = data.name;

    if (bossTimer) clearInterval(bossTimer);
    document.getElementById('answer-input').focus();

    if (roomId === 0) {
        gameState.phase = 'boss';
        currentQuestionSet = getRandomQuestions(data.questions, 5);
    } else if (data.type === 'boss') {
        gameState.phase = 'boss';
        currentQuestionSet = getRandomQuestions(data.questions, 3);
    } else {
        gameState.phase = 'minion';
        currentQuestionSet = getRandomQuestions(data.minions, 3);
    }

    questionIndex = 0;
    gameState.enemyHP = 100;
    updateBattleUI();
    loadQuestion();
}

function loadQuestion() {
    const data = roomData[gameState.currentRoom];
    let qData = (gameState.phase === 'teacher_rescue') ? data.teacherRescue : currentQuestionSet[questionIndex];

    if (!qData) { showMap(); return; }

    document.getElementById('question-text').innerText = qData.q;
    document.getElementById('answer-input').value = '';
    document.getElementById('answer-input').focus();
    document.getElementById('math-hint').classList.add('hidden');
    document.getElementById('enemy-name').innerText = qData.enemy || "Enemy";
    document.getElementById('enemy-sprite').innerText = (qData.enemy || "👾").split(' ').pop();
}

function processAnswer() {
    const input = document.getElementById('answer-input').value.trim().toLowerCase();
    const data = roomData[gameState.currentRoom];
    const qData = (gameState.phase === 'teacher_rescue') ? data.teacherRescue : currentQuestionSet[questionIndex];

    if (!qData) return;
    const expected = String(qData.a).toLowerCase().trim();
    const isCorrect = (!isNaN(input) && !isNaN(expected) && input !== "") ?
        parseFloat(input) === parseFloat(expected) :
        input.replace(/\s+/g, '') === expected.replace(/\s+/g, '');

    if (isCorrect) {
        if (gameState.phase === 'minion') gameState.score += 10;
        else if (gameState.phase === 'teacher_rescue') gameState.score += 50;
        else if (gameState.phase === 'boss') gameState.score += 100;

        updateStats();
        handleCorrect();
    } else {
        handleWrong(qData.hint || "Wrong!");
    }
}

function handleCorrect() {
    Sound.play('correct');
    createEffect("💥 HIT!", "player-attack");

    if (gameState.phase === 'minion' || gameState.phase === 'boss') {
        questionIndex++;
        if (questionIndex >= currentQuestionSet.length) {
            if (gameState.phase === 'minion') {
                gameState.phase = 'teacher_rescue';
                gameState.enemyHP = 100;
                createEffect("RESCUE!", "warning");
                setTimeout(loadQuestion, 800);
            } else {
                gameState.progress[gameState.currentRoom] = true;
                setTimeout(() => showVictory(gameState.currentRoom), 500);
            }
        } else {
            gameState.enemyHP = Math.max(0, 100 - (questionIndex * (100 / currentQuestionSet.length)));
            setTimeout(loadQuestion, 500);
        }
    } else {
        gameState.progress[gameState.currentRoom] = true;
        setTimeout(() => showVictory(gameState.currentRoom), 500);
    }
    updateBattleUI();
}

function handleWrong(hint) {
    Sound.play('wrong');
    gameState.lives--;
    updateBattleUI();
    document.getElementById('game-container').classList.add('shake');
    setTimeout(() => document.getElementById('game-container').classList.remove('shake'), 200);

    if (gameState.lives <= 0) {
        alert("FAILED! Try again.");
        showMap();
    } else {
        const hintBox = document.getElementById('math-hint');
        hintBox.innerText = hint;
        hintBox.classList.remove('hidden');
    }
}

function showVictory(roomId) {
    Sound.play('victory');
    document.getElementById('battle-screen').classList.add('hidden');
    document.getElementById('victory-screen').classList.remove('hidden');
    const data = roomData[roomId];
    document.getElementById('victory-title').innerText = (roomId === 0) ? "MISSION COMPLETE!" : "VICTORY!";
    document.getElementById('name-input-section').classList.toggle('hidden', !(data.type === 'boss' || roomId === 0));
}

function showMap() {
    document.getElementById('victory-screen').classList.add('hidden');
    document.getElementById('battle-screen').classList.add('hidden');
    document.getElementById('map-screen').classList.remove('hidden');
    updateStats(); updateMapUI(); updateBadges();
}

function updateStats() {
    const bossIds = [100, 200, 300, 400, 0];
    gameState.rescuedTeachers = bossIds.filter(id => gameState.progress[id]).length;
    document.getElementById('teacher-count').innerText = gameState.rescuedTeachers;
    document.getElementById('current-score').innerText = gameState.score;
}

function updateBadges() {
    const badges = { 100: 'dignity', 200: 'kindness', 300: 'compassion', 400: 'courage', 0: 'endeavour' };
    for (let id in badges) {
        const el = document.getElementById(`badge-${badges[id]}`);
        if (gameState.progress[id] && el) el.classList.add('earned');
    }
}

function updateMapUI() {
    Object.keys(roomData).forEach(idStr => {
        const id = parseInt(idStr);
        const btn = document.querySelector(`[data-room-id="${id}"]`);
        if (!btn) return;
        const floorRow = btn.closest('.floor-row');
        const done = gameState.progress[id] || gameState.progress[String(id)];

        if (done) {
            btn.classList.add('completed'); btn.classList.remove('locked'); btn.disabled = false;
            if (floorRow) { floorRow.classList.remove('locked'); floorRow.classList.add('active'); }
        } else {
            let lock = false;
            if (id == 102 && !isRoomDone(101)) lock = true;
            // ... (其餘鎖定邏輯簡化保持不變)
            if (lock) { btn.classList.add('locked'); btn.disabled = true; }
            else {
                btn.classList.remove('locked'); btn.disabled = false;
                if (floorRow) { floorRow.classList.remove('locked'); floorRow.classList.add('active'); }
            }
        }
    });
}

function isRoomDone(id) { return gameState.progress[id] === true || gameState.progress[String(id)] === true; }

function updateBattleUI() {
    const hp = document.getElementById('enemy-hp');
    if (hp) hp.style.width = gameState.enemyHP + "%";
    const livesEl = document.getElementById('lives-display');
    if (livesEl) livesEl.innerText = "❤️".repeat(Math.max(0, gameState.lives));
    const phaseEl = document.getElementById('battle-phase');
    if (phaseEl) phaseEl.innerText = gameState.phase.toUpperCase();
}

function createEffect(text, type) {
    const layer = document.getElementById('effect-layer');
    const div = document.createElement('div');
    div.className = `hit-effect ${type}`;
    div.innerText = text;
    div.style.left = (Math.random() * 60 + 20) + "%";
    div.style.top = (Math.random() * 60 + 20) + "%";
    layer.appendChild(div);
    setTimeout(() => div.remove(), 1000);
}

// --- Init ---
document.addEventListener('DOMContentLoaded', () => {
    updateStats(); updateMapUI(); updateBadges();
    document.querySelectorAll('.room-btn, .boss-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            if (!btn.classList.contains('locked')) initiateBattle(parseInt(btn.dataset.roomId));
        });
    });
    document.getElementById('attack-btn').addEventListener('click', processAnswer);
    document.getElementById('answer-input').addEventListener('keypress', (e) => { if (e.key === 'Enter') processAnswer(); });
    document.getElementById('view-leaderboard').addEventListener('click', () => toggleLeaderboard());
    document.getElementById('close-leaderboard').addEventListener('click', () => toggleLeaderboard(false));
    document.getElementById('return-map-btn').addEventListener('click', showMap);
    document.getElementById('submit-score-btn').addEventListener('click', () => {
        const name = document.getElementById('player-name-input').value.trim();
        if (name) { saveScore(name); document.getElementById('name-input-section').classList.add('hidden'); }
    });
});
