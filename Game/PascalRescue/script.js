// Game State Management
let gameState = {
    rescuedTeachers: 0,
    currentRoom: null,
    phase: 'minion', // 'minion' or 'boss'
    enemyHP: 100,
    progress: JSON.parse(localStorage.getItem('msaQuestProgress')) || {
        100: false, // 1F Boss (Dignity)
        200: false, // 2F Boss (Kindness)
        300: false, // 3F Boss (Compassion)
        400: false, // 4F Boss (Courage)
        500: false, // 5F Boss (Endeavour)
        0: false    // HQ Final Boss (Head of Math)
    },
    roomMinionProgress: {} // Track progress within rooms
};

// Data Structure for MSA Floors, Values, and Challenges
const roomData = {
    // 1F: DIGNITY
    101: { name: "Room 101: Multiples", type: 'minion', floor: 1, minions: [{ q: "7 x 8 = ?", a: 56, hint: "Check your 7 times table.", enemy: "Number Imp 😈" }] },
    100: { name: "1F BOSS: The Dignity Trial", type: 'boss', floor: 1, value: "Dignity", badge: "⚖️", teacher: "Mr. Brown", questions: { q: "HCF of 12 and 18?", a: 6, hint: "Factors of 12: 1,2,3,4,6,12. Factors of 18: 1,2,3,6,9,18.", enemy: "Dignity Golem 🗿" } },

    // 2F: KINDNESS
    201: { name: "Room 201: Negatives", type: 'minion', floor: 2, minions: [{ q: "-5 + 11 = ?", a: 6, hint: "Start at -5, move 11 right.", enemy: "Negative Wraith 👻" }] },
    200: { name: "2F BOSS: The Kindness Gate", type: 'boss', floor: 2, value: "Kindness", badge: "🤝", teacher: "Ms. Smith", questions: { q: "-4 x -3 = ?", a: 12, hint: "Negative x Negative = Positive.", enemy: "Kindness Warden 🛡️" } },

    // 3F: COMPASSION
    301: { name: "Room 301: Fractions", type: 'minion', floor: 3, minions: [{ q: "1/2 of 50 = ?", a: 25, hint: "Divide by 2.", enemy: "Fraction Slime 💧" }] },
    300: { name: "3F BOSS: The Compassion Lock", type: 'boss', floor: 3, value: "Compassion", badge: "❤️", teacher: "Mr. Jones", questions: { q: "25% of 80 = ?", a: 20, hint: "25% is a quarter.", enemy: "Compassion Heart 💎" } },

    // 4F: COURAGE
    401: { name: "Room 401: Algebra", type: 'minion', floor: 4, minions: [{ q: "If 2x = 20, x = ?", a: 10, hint: "Divide both sides by 2.", enemy: "Algebra Bat 🦇" }] },
    400: { name: "4F BOSS: The Courage Arena", type: 'boss', floor: 4, value: "Courage", badge: "🦁", teacher: "Ms. Taylor", questions: { q: "Square root of 81?", a: 9, hint: "What times itself is 81?", enemy: "Courage Lion 🦁" } },

    // 5F: ENDEAVOUR
    501: { name: "Room 501: Ratios", type: 'minion', floor: 5, minions: [{ q: "Simplify 4:8", a: 0.5, hint: "Divide both by 4 (Answer as decimal 0.5)", enemy: "Ratio Robot 🤖" }] },
    500: { name: "5F BOSS: The Endeavour Pillar", type: 'boss', floor: 5, value: "Endeavour", badge: "🛠️", teacher: "Mr. Wilson", questions: { q: "15% of 200?", a: 30, hint: "10% is 20, 5% is 10.", enemy: "Endeavour Titan 🏗️" } },

    // HQ: FINAL CHALLENGE
    0: { name: "HQ: The Final Rescue", type: 'boss', floor: 0, value: "Head of Math", badge: "🎓", teacher: "Head of Math", questions: { q: "(10 + 5) x 2 - 4 = ?", a: 26, hint: "BIDMAS: Brackets first, then Multiply, then Subtract.", enemy: "The Logic Overlord 👑" } }
};

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
    const qData = currentQuestionSet[questionIndex];
    document.getElementById('question-text').innerText = qData.q;
    document.getElementById('answer-input').value = '';
    document.getElementById('math-hint').classList.add('hidden');
    document.getElementById('enemy-name').innerText = qData.enemy;
    document.getElementById('enemy-sprite').innerText = qData.enemy.split(' ').pop();
}

function processAnswer() {
    const input = document.getElementById('answer-input').value;
    const qData = currentQuestionSet[questionIndex];

    if (parseFloat(input) === qData.a) {
        handleCorrect();
    } else {
        handleWrong(qData.hint);
    }
}

function handleCorrect() {
    createEffect("💥 HIT!", "player-attack");
    questionIndex++;

    if (questionIndex >= currentQuestionSet.length) {
        const data = roomData[gameState.currentRoom];
        if (data.type === 'boss') {
            gameState.progress[gameState.currentRoom] = true;
            saveGame();
            showVictory(gameState.currentRoom);
        } else {
            // Minion defeated
            createEffect("ROOM CLEARED!", "warning");
            setTimeout(showMap, 1000);
        }
    } else {
        gameState.enemyHP -= (100 / currentQuestionSet.length);
        updateBattleUI();
        setTimeout(loadQuestion, 500);
    }
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

    if (roomId === 0) {
        document.getElementById('victory-title').innerText = "MISSION COMPLETE!";
        document.getElementById('victory-text').innerText = "You rescued the Head of Math and saved MSA!";
        document.getElementById('victory-badge').innerText = "🎓";
    } else {
        document.getElementById('victory-title').innerText = `${data.value.toUpperCase()} EARNED!`;
        document.getElementById('victory-text').innerText = `You rescued ${data.teacher} and demonstrated ${data.value}!`;
        document.getElementById('victory-badge').innerText = data.badge;
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
    const prog = Math.floor(((gameState.rescuedTeachers + (gameState.progress[0] ? 1 : 0)) / 6) * 100);
    document.getElementById('overall-progress').innerText = prog + "%";
}

function updateBadges() {
    const badges = { 100: 'dignity', 200: 'kindness', 300: 'compassion', 400: 'courage', 500: 'endeavour' };
    for (let id in badges) {
        const el = document.getElementById(`badge-${badges[id]}`);
        if (gameState.progress[id]) el.classList.add('earned');
    }
}

function updateMapUI() {
    const floors = [1, 2, 3, 4, 5, 0];
    let allBadges = true;

    floors.forEach(f => {
        const floorEl = document.getElementById(f === 0 ? 'floor-hq' : `floor-${f}`);
        if (!floorEl) return;

        let floorUnlocked = false;
        if (f === 1) floorUnlocked = true;
        else if (f === 2 && gameState.progress[100]) floorUnlocked = true;
        else if (f === 3 && gameState.progress[200]) floorUnlocked = true;
        else if (f === 4 && gameState.progress[300]) floorUnlocked = true;
        else if (f === 5 && gameState.progress[400]) floorUnlocked = true;
        else if (f === 0 && gameState.progress[100] && gameState.progress[200] && gameState.progress[300] && gameState.progress[400] && gameState.progress[500]) floorUnlocked = true;

        if (floorUnlocked) {
            floorEl.classList.remove('locked');
            floorEl.classList.add('active');
            const btns = floorEl.querySelectorAll('button');
            btns.forEach(btn => {
                const rid = parseInt(btn.dataset.roomId);
                if (gameState.progress[rid]) {
                    btn.disabled = true;
                    btn.classList.add('completed');
                } else {
                    // Logic to unlock boss only after room?
                    if (btn.classList.contains('boss-btn')) {
                        const roomId = parseInt(btn.dataset.roomId);
                        const roomRequired = roomId + 1; // e.g., 100 needs 101
                        // For simplicity, boss is open if floor is open
                        btn.disabled = false;
                        btn.classList.remove('locked');
                    } else {
                        btn.disabled = false;
                        btn.classList.remove('locked');
                    }
                }
            });
        } else {
            floorEl.classList.add('locked');
            allBadges = false;
        }
    });
}

function saveGame() {
    localStorage.setItem('msaQuestProgress', JSON.stringify(gameState.progress));
}

function updateBattleUI() {
    const hp = document.getElementById('enemy-hp');
    hp.style.width = gameState.enemyHP + "%";
    document.getElementById('battle-phase').innerText = gameState.phase === 'boss' ? "BOSS BATTLE" : "Stage 1";
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
