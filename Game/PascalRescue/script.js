// Game State Management
let gameState = {
    rescuedTeachers: 0,
    currentRoom: null,
    phase: 'minion', // 'minion' or 'teacher_rescue' or 'boss'
    enemyHP: 100,
    progress: JSON.parse(localStorage.getItem('msaQuestProgress')) || {
        100: false, 200: false, 300: false, 400: false, 500: false, 0: false,
        101: false, 102: false, 103: false, 201: false, 202: false, 301: false, 302: false, 303: false, 401: false, 402: false
    },
    roomMinionProgress: {}
};

// Full Year 7 Curriculum Room Data
const roomData = {
    // FLOOR 1: NUMBER
    101: {
        name: "101: Multiples & Powers",
        topic: "Number",
        minions: [
            { q: "12 x 100 = ?", a: 1200, hint: "Add two zeros.", enemy: "Factor Imp 😈" },
            { q: "450 ÷ 10 = ?", a: 45, hint: "Remove one zero.", enemy: "Factor Imp 😈" },
            { q: "Is 15 a multiple of 3?", a: 1, hint: "Answer 1 for Yes, 0 for No.", enemy: "Factor Imp 😈" }
        ],
        teacherRescue: { q: "Find the LCM of 4 and 6.", a: 12, hint: "Multiples of 4: 4,8,12... Multiples of 6: 6,12...", enemy: "Teacher's Cage ⛓️" }
    },
    102: {
        name: "102: Negative Dungeon",
        topic: "Number",
        minions: [
            { q: "-5 + 8 = ?", a: 3, hint: "Think of temperature.", enemy: "Minus Shadow 👻" },
            { q: "3 - 10 = ?", a: -7, hint: "Go below zero.", enemy: "Minus Shadow 👻" }
        ],
        teacherRescue: { q: "-4 x -3 = ?", a: 12, hint: "Negative x Negative = Positive.", enemy: "Teacher's Cage ⛓️" }
    },
    103: {
        name: "103: Fraction Vault",
        topic: "Number",
        minions: [
            { q: "0.5 as a fraction (numerator)? e.g. 1/2 answer 1", a: 1, hint: "1/2", enemy: "Percent Pixel 👾" },
            { q: "25% of 40?", a: 10, hint: "Divide by 4.", enemy: "Percent Pixel 👾" }
        ],
        teacherRescue: { q: "Find 3/4 of 24.", a: 18, hint: "Divide by 4, then multiply by 3.", enemy: "Teacher's Cage ⛓️" }
    },
    100: {
        name: "1F BOSS: Prime Golem",
        type: 'boss',
        badge: "DIGNITY",
        questions: { q: "Find the HCF of 24 and 36.", a: 12, hint: "Highest number that divides both.", enemy: "Prime Golem 🗿" }
    },

    // FLOOR 2: ALGEBRA
    201: {
        name: "201: Expression Arcade",
        minions: [{ q: "Simplify: 3a + 2a", a: 5, hint: "Add the coefficients (answer just the number 5)", enemy: "Bracket Goblin 👺" }],
        teacherRescue: { q: "Expand: 3(x + 4) if x=2, what is the value?", a: 18, hint: "3 * (2 + 4)", enemy: "Teacher's Cage ⛓️" }
    },
    202: {
        name: "202: Equation Lab",
        minions: [{ q: "x + 5 = 12, x = ?", a: 7, hint: "Subtract 5.", enemy: "Variable Viper 🐍" }],
        teacherRescue: { q: "2x - 3 = 7, x = ?", a: 5, hint: "Add 3, then divide by 2.", enemy: "Teacher's Cage ⛓️" }
    },
    200: {
        name: "2F BOSS: X-Algebrator",
        type: 'boss',
        badge: "KINDNESS",
        questions: { q: "If a=3, b=4, what is 2a + b?", a: 10, hint: "2*3 + 4", enemy: "X-Algebrator 🤖" }
    }
};

// Add placeholder data for F3 and F4 to prevent crashes
[301, 302, 303, 401, 402, 300, 400, 500, 0].forEach(id => {
    if (!roomData[id]) roomData[id] = { name: "Coming Soon", minions: [{q:"1+1=?", a:2, enemy:"?"}], teacherRescue: {q:"2+2=?", a:4, enemy:"?"}, questions: {q:"3+3=?", a:6, enemy:"?"} };
});

let currentQuestionSet = [];
let questionIndex = 0;

document.addEventListener('DOMContentLoaded', () => {
    const savedProgress = localStorage.getItem('msaQuestProgress');
    if (savedProgress) gameState.progress = JSON.parse(savedProgress);
    updateStats();
    updateMapUI();
    updateBadges();

    document.querySelectorAll('.room-btn, .boss-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = parseInt(btn.dataset.roomId);
            if (!btn.disabled) initiateBattle(id);
        });
    });

    document.getElementById('attack-btn').addEventListener('click', processAnswer);
    document.getElementById('answer-input').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') processAnswer();
    });
});

function initiateBattle(roomId) {
    gameState.currentRoom = roomId;
    const data = roomData[roomId];
    document.getElementById('map-screen').classList.add('hidden');
    document.getElementById('battle-screen').classList.remove('hidden');
    document.getElementById('room-info').innerText = data.name;
    document.getElementById('answer-input').focus();

    if (data.type === 'boss') {
        gameState.phase = 'boss';
        currentQuestionSet = [data.questions];
    } else {
        gameState.phase = 'minion';
        currentQuestionSet = data.minions;
    }

    questionIndex = 0;
    gameState.enemyHP = 100;
    updateBattleUI();
    loadQuestion();
}

function loadQuestion() {
    const roomId = gameState.currentRoom;
    let qData;

    if (gameState.phase === 'minion') {
        qData = currentQuestionSet[questionIndex];
    } else if (gameState.phase === 'teacher_rescue') {
        qData = roomData[roomId].teacherRescue;
    } else {
        qData = roomData[roomId].questions;
    }

    if (!qData) { console.error("No question data found!"); return; }

    // CRITICAL: Ensure text is pushed to UI
    document.getElementById('question-text').innerText = qData.q;
    document.getElementById('answer-input').value = '';
    document.getElementById('math-hint').classList.add('hidden');
    document.getElementById('enemy-name').innerText = qData.enemy;
    document.getElementById('enemy-sprite').innerText = qData.enemy.split(' ').pop();
}

function processAnswer() {
    const input = document.getElementById('answer-input').value;
    const roomId = gameState.currentRoom;
    let qData;

    if (gameState.phase === 'minion') qData = currentQuestionSet[questionIndex];
    else if (gameState.phase === 'teacher_rescue') qData = roomData[roomId].teacherRescue;
    else qData = roomData[roomId].questions;

    if (parseFloat(input) === qData.a) {
        handleCorrect();
    } else {
        handleWrong(qData.hint);
    }
}

function handleCorrect() {
    createEffect("💥 HIT!", "player-attack");

    if (gameState.phase === 'minion') {
        questionIndex++;
        if (questionIndex >= currentQuestionSet.length) {
            gameState.phase = 'teacher_rescue';
            gameState.enemyHP = 100; // Reset for Teacher Rescue
            createEffect("TEACHER RESCUE STAGE!", "warning");
            setTimeout(loadQuestion, 1000);
        } else {
            gameState.enemyHP -= (100 / currentQuestionSet.length);
            setTimeout(loadQuestion, 500);
        }
    } else {
        // Teacher or Boss rescued
        gameState.progress[gameState.currentRoom] = true;
        saveGame();
        showVictory(gameState.currentRoom);
    }
    updateBattleUI();
}

function handleWrong(hint) {
    document.getElementById('game-container').classList.add('shake');
    setTimeout(() => document.getElementById('game-container').classList.remove('shake'), 200);
    const hintBox = document.getElementById('math-hint');
    hintBox.innerText = hint;
    hintBox.classList.remove('hidden');
}

function showVictory(roomId) {
    const data = roomData[roomId];
    document.getElementById('battle-screen').classList.add('hidden');
    document.getElementById('victory-screen').classList.remove('hidden');

    if (data.type === 'boss') {
        document.getElementById('victory-title').innerText = "VALUE EARNED! 🏆";
        document.getElementById('victory-text').innerText = `You mastered ${data.badge} and rescued a specialist teacher!`;
    } else {
        document.getElementById('victory-title').innerText = "ROOM CLEARED! 🏫";
        document.getElementById('victory-text').innerText = "The classroom is safe. On to the next!";
    }
}

function showMap() {
    document.getElementById('victory-screen').classList.add('hidden');
    document.getElementById('battle-screen').classList.add('hidden');
    document.getElementById('map-screen').classList.remove('hidden');
    updateStats();
    updateMapUI();
    updateBadges();
}

function updateStats() {
    const bossIds = [100, 200, 300, 400, 500];
    gameState.rescuedTeachers = bossIds.filter(id => gameState.progress[id]).length;
    document.getElementById('teacher-count').innerText = gameState.rescuedTeachers;
}

function updateBadges() {
    const badges = { 100: 'dignity', 200: 'kindness', 300: 'compassion', 400: 'courage', 500: 'endeavour' };
    for (let id in badges) {
        const el = document.getElementById(`badge-${badges[id]}`);
        if (gameState.progress[id] && el) el.classList.add('earned');
    }
}

function updateMapUI() {
    const rooms = Object.keys(roomData);
    rooms.forEach(id => {
        const btn = document.querySelector(`[data-room-id="${id}"]`);
        if (!btn) return;

        if (gameState.progress[id]) {
            btn.classList.add('completed');
            btn.disabled = true;
        } else {
            // Unlock logic: 101 always open, others depend on previous
            let locked = false;
            if (id == 102 && !gameState.progress[101]) locked = true;
            if (id == 103 && !gameState.progress[102]) locked = true;
            if (id == 100 && !gameState.progress[103]) locked = true;
            // Floor 2 unlocks after Floor 1 Boss
            if (id == 201 && !gameState.progress[100]) locked = true;
            if (id == 202 && !gameState.progress[201]) locked = true;
            if (id == 200 && !gameState.progress[202]) locked = true;

            if (locked) { btn.classList.add('locked'); btn.disabled = true; }
            else { btn.classList.remove('locked'); btn.disabled = false; }
        }
    });
}

function saveGame() { localStorage.setItem('msaQuestProgress', JSON.stringify(gameState.progress)); }

function updateBattleUI() {
    const hp = document.getElementById('enemy-hp');
    hp.style.width = gameState.enemyHP + "%";
    document.getElementById('battle-phase').innerText = gameState.phase.toUpperCase();
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
