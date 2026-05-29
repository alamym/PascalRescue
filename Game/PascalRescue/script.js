// Game State Management
let gameState = {
    rescuedTeachers: 0,
    currentRoom: null,
    phase: 'minion', // 'minion' or 'teacher_rescue' or 'boss'
    enemyHP: 100,
    progress: JSON.parse(localStorage.getItem('msaQuestProgress')) || {
        100: false, 200: false, 300: false, 400: false, 500: false, 0: false
    },
    roomMinionProgress: {}
};

// Full Year 7 Curriculum Room Data
const roomData = {
    // FLOOR 1: NUMBER
    101: {
        name: "101: Multiples & Powers",
        minions: [
            { q: "12 x 100 = ?", a: 1200, hint: "Add two zeros.", enemy: "Factor Imp 😈" },
            { q: "450 ÷ 10 = ?", a: 45, hint: "Remove one zero.", enemy: "Factor Imp 😈" },
            { q: "What is 2 to the power of 3 (2^3)?", a: 8, hint: "2 x 2 x 2", enemy: "Power Pixie ✨" }
        ],
        teacherRescue: { q: "Find the LCM of 6 and 8.", a: 24, hint: "Multiples of 6: 6,12,18,24. Multiples of 8: 8,16,24.", enemy: "Teacher's Cage ⛓️" }
    },
    102: {
        name: "102: Negative Dungeon",
        minions: [
            { q: "-5 + 8 = ?", a: 3, hint: "Think of temperature rising.", enemy: "Minus Shadow 👻" },
            { q: "3 - 10 = ?", a: -7, hint: "Go below zero.", enemy: "Minus Shadow 👻" }
        ],
        teacherRescue: { q: "-4 x -3 = ?", a: 12, hint: "Negative x Negative = Positive.", enemy: "Teacher's Cage ⛓️" }
    },
    103: {
        name: "103: Fraction Vault",
        minions: [
            { q: "0.5 as a fraction (numerator)? e.g. 1/2 answer 1", a: 1, hint: "It is one half.", enemy: "Decimal Drone 👾" },
            { q: "25% of 40?", a: 10, hint: "Divide by 4.", enemy: "Percent Pixel 👾" }
        ],
        teacherRescue: { q: "Find 3/4 of 24.", a: 18, hint: "Divide by 4, then multiply by 3.", enemy: "Teacher's Cage ⛓️" }
    },
    100: {
        name: "1F BOSS: Prime Golem",
        type: 'boss',
        badge: "DIGNITY",
        questions: [
            { q: "HCF of 24 and 36?", a: 12, hint: "Highest number that divides both.", enemy: "Prime Golem 🗿" },
            { q: "LCM of 4 and 10?", a: 20, hint: "Smallest number that is a multiple of both.", enemy: "Prime Golem 🗿" },
            { q: "What is 10 to the power of 4 (10^4)?", a: 10000, hint: "A 1 followed by four zeros.", enemy: "Prime Golem 🗿" }
        ]
    },

    // FLOOR 2: ALGEBRA
    201: {
        name: "201: Expression Arcade",
        minions: [
            { q: "Simplify: 3a + 2a", a: 5, hint: "Add the coefficients (answer only the number)", enemy: "Bracket Goblin 👺" },
            { q: "Simplify: 10x - 4x + 2x", a: 8, hint: "10-4+2...", enemy: "Bracket Goblin 👺" },
            { q: "Collect terms: 5y + 3 + 2y", a: 8, hint: "Only add the 'y' terms (answer the coefficient of y)", enemy: "Bracket Goblin 👺" }
        ],
        teacherRescue: { q: "Expand: 3(x + 4). If x=5, what is the total value?", a: 27, hint: "3 * (5 + 4)", enemy: "Teacher's Cage ⛓️" }
    },
    202: {
        name: "202: Equation Lab",
        minions: [
            { q: "x + 5 = 12, x = ?", a: 7, hint: "Subtract 5 from both sides.", enemy: "Variable Viper 🐍" },
            { q: "4x = 20, x = ?", a: 5, hint: "Divide by 4.", enemy: "Variable Viper 🐍" },
            { q: "x / 3 = 6, x = ?", a: 18, hint: "Multiply by 3.", enemy: "Variable Viper 🐍" }
        ],
        teacherRescue: { q: "2x - 4 = 10, x = ?", a: 7, hint: "Add 4, then divide by 2.", enemy: "Teacher's Cage ⛓️" }
    },
    200: {
        name: "2F BOSS: X-Algebrator",
        type: 'boss',
        badge: "KINDNESS",
        questions: [
            { q: "Substitution: If a=5 and b=3, what is 2a + b?", a: 13, hint: "2*5 + 3", enemy: "X-Algebrator 🤖" },
            { q: "Solve for x: 5x + 2 = 22", a: 4, hint: "Subtract 2, then divide by 5.", enemy: "X-Algebrator 🤖" },
            { q: "Solve for y: y/4 - 1 = 2", a: 12, hint: "Add 1, then multiply by 4.", enemy: "X-Algebrator 🤖" }
        ]
    },

    // FLOOR 3: RATIO & SHAPE
    301: {
        name: "301: Proportion Sector",
        minions: [
            { q: "Simplify ratio 5:10 (answer 1:x, x=?)", a: 2, hint: "Divide both by 5.", enemy: "Scaling Slime 💧" },
            { q: "Share £20 in ratio 1:1. Each gets?", a: 10, hint: "Split equally.", enemy: "Scaling Slime 💧" }
        ],
        teacherRescue: { q: "Share £60 in ratio 2:3. Find the larger share.", a: 36, hint: "Total parts = 5. £60/5 = £12. 3 parts = ?", enemy: "Teacher's Cage ⛓️" }
    },
    302: {
        name: "302: Geometry Zone",
        minions: [
            { q: "Angle on a straight line is ?", a: 180, hint: "A half turn.", enemy: "Angle Phantom 👻" },
            { q: "Angles in a triangle add to ?", a: 180, hint: "Same as a straight line.", enemy: "Angle Phantom 👻" }
        ],
        teacherRescue: { q: "One angle is 40 on a straight line. Find the missing angle.", a: 140, hint: "180 - 40", enemy: "Teacher's Cage ⛓️" }
    },
    303: {
        name: "303: Perimeter Perimeter",
        minions: [
            { q: "Perimeter of square with side 5cm?", a: 20, hint: "4 sides of 5cm.", enemy: "Area Anomaly 🟦" }
        ],
        teacherRescue: { q: "Area of triangle with base 10 and height 5?", a: 25, hint: "(Base x Height) / 2", enemy: "Teacher's Cage ⛓️" }
    },
    300: {
        name: "3F BOSS: Geometric Sphinx",
        type: 'boss',
        badge: "COMPASSION",
        questions: { q: "Find the area of a rectangle 8m by 7m.", a: 56, hint: "Length x Width", enemy: "Geometric Sphinx 🏺" }
    },

    // FLOOR 4: DATA & PROBABILITY
    401: {
        name: "401: Chance Chamber",
        minions: [
            { q: "Probability of 'Heads' on a coin (decimal)?", a: 0.5, hint: "1 out of 2.", enemy: "Dice Drone 🎲" }
        ],
        teacherRescue: { q: "Probability of rolling a 6 on a fair die (fraction 1/x, x=?)", a: 6, hint: "1 out of 6.", enemy: "Teacher's Cage ⛓️" }
    },
    402: {
        name: "402: Chart Citadel",
        minions: [
            { q: "Mean of 2, 4, 6?", a: 4, hint: "Total / 3.", enemy: "Graph Gremlin 📊" }
        ],
        teacherRescue: { q: "Find the range of 10, 20, 50.", a: 40, hint: "Largest - Smallest.", enemy: "Teacher's Cage ⛓️" }
    },
    400: {
        name: "4F BOSS: Stochastic Titan",
        type: 'boss',
        badge: "COURAGE",
        questions: { q: "Find the median of 3, 5, 8, 10, 12.", a: 8, hint: "The middle number.", enemy: "Stochastic Titan 🌪️" }
    },

    // ROOFTOP: THE FINAL CHALLENGE
    0: {
        name: "ROOFTOP: The Maths Demon",
        type: 'boss',
        badge: "ENDEAVOUR",
        questions: { q: "BIDMAS: (10 + 5) x 2 - 4 = ?", a: 26, hint: "Brackets first!", enemy: "The Maths Demon 👺" }
    }
};

let currentQuestionSet = [];
let questionIndex = 0;

document.addEventListener('DOMContentLoaded', () => {
    // Load progress
    const savedProgress = localStorage.getItem('msaQuestProgress');
    if (savedProgress) gameState.progress = JSON.parse(savedProgress);

    const savedRoomState = localStorage.getItem('msaRoomProgress');
    if (savedRoomState) gameState.roomMinionProgress = JSON.parse(savedRoomState);

    updateStats();
    updateMapUI();
    updateBadges();

    // Event Bindings
    document.querySelectorAll('.room-btn, .boss-btn').forEach(button => {
        button.addEventListener('click', () => {
            if (!button.classList.contains('locked') && !button.disabled) {
                const roomId = parseInt(button.getAttribute('data-room-id'));
                if (!isNaN(roomId)) initiateBattle(roomId);
            }
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
    if (!data) {
        console.error("Room data not found for ID:", roomId);
        return;
    }

    document.getElementById('map-screen').classList.add('hidden');
    document.getElementById('battle-screen').classList.remove('hidden');

    const roomNameEl = document.getElementById('room-name');
    if (roomNameEl) roomNameEl.innerText = data.name;

    document.getElementById('answer-input').focus();

    if (data.type === 'boss') {
        gameState.phase = 'boss';
        currentQuestionSet = Array.isArray(data.questions) ? data.questions : [data.questions];
        questionIndex = 0;
    } else {
        gameState.phase = 'minion';
        currentQuestionSet = data.minions;
        let savedIdx = gameState.roomMinionProgress[roomId] || 0;
        questionIndex = (savedIdx >= currentQuestionSet.length) ? 0 : savedIdx;
    }

    gameState.enemyHP = 100;
    updateBattleUI();
    loadQuestion();
}

function loadQuestion() {
    const roomId = gameState.currentRoom;
    const data = roomData[roomId];
    let qData = currentQuestionSet[questionIndex];

    if (gameState.phase === 'teacher_rescue') {
        qData = data.teacherRescue;
    }

    const qTextEl = document.getElementById('question-text');
    if (!qData) {
        console.error("No question data found!", roomId, gameState.phase, questionIndex);
        if (qTextEl) qTextEl.innerText = "Error: Question not found. Please return to map.";
        return;
    }

    if (qTextEl) qTextEl.innerText = qData.q;
    document.getElementById('answer-input').value = '';
    document.getElementById('math-hint').classList.add('hidden');
    document.getElementById('enemy-name').innerText = qData.enemy || "Math Minion";
    document.getElementById('enemy-sprite').innerText = (qData.enemy || "").split(' ').pop() || "👾";
}

function processAnswer() {
    const input = document.getElementById('answer-input').value;
    const roomId = gameState.currentRoom;
    const data = roomData[roomId];
    let qData;

    if (gameState.phase === 'minion') qData = currentQuestionSet[questionIndex];
    else if (gameState.phase === 'teacher_rescue') qData = data.teacherRescue;
    else qData = data.questions;

    if (parseFloat(input) === qData.a) {
        handleCorrect();
    } else {
        handleWrong(qData.hint);
    }
}

function handleCorrect() {
    createEffect("💥 HIT!", "player-attack");

    if (gameState.phase === 'minion' || gameState.phase === 'boss') {
        questionIndex++;
        if (gameState.phase === 'minion') {
            gameState.roomMinionProgress[gameState.currentRoom] = questionIndex;
            localStorage.setItem('msaRoomProgress', JSON.stringify(gameState.roomMinionProgress));
        }

        if (questionIndex >= currentQuestionSet.length) {
            if (gameState.phase === 'minion') {
                gameState.phase = 'teacher_rescue';
                gameState.enemyHP = 100;
                createEffect("RESCUE THE TEACHER!", "warning");
                setTimeout(loadQuestion, 1000);
            } else {
                // Boss defeated after all questions
                gameState.progress[gameState.currentRoom] = true;
                saveGame();
                showVictory(gameState.currentRoom);
            }
        } else {
            gameState.enemyHP -= (100 / currentQuestionSet.length);
            setTimeout(loadQuestion, 500);
        }
    } else {
        // Teacher rescued (one-shot stage)
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

    const titleEl = document.getElementById('victory-title');
    const textEl = document.getElementById('victory-text');
    const badgeEl = document.getElementById('victory-badge');

    if (roomId === 0) {
        titleEl.innerText = "MISSION COMPLETE! 🎓";
        textEl.innerText = "You rescued the Head of Math and mastered all Year 7 topics!";
        badgeEl.innerText = "🏆";
    } else if (data.type === 'boss') {
        titleEl.innerText = `${data.badge} BADGE EARNED! 🏆`;
        textEl.innerText = `You demonstrated ${data.badge} and rescued a specialist teacher!`;
        badgeEl.innerText = "✨";
    } else {
        titleEl.innerText = "ROOM CLEARED! 🏫";
        textEl.innerText = "The teacher is safe and sound. Great work!";
        badgeEl.innerText = "⭐";
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
    const bossIds = [100, 200, 300, 400, 0];
    gameState.rescuedTeachers = bossIds.filter(id => gameState.progress[id]).length;
    document.getElementById('teacher-count').innerText = gameState.rescuedTeachers;
}

function updateBadges() {
    const badges = { 100: 'dignity', 200: 'kindness', 300: 'compassion', 400: 'courage', 0: 'endeavour' };
    for (let id in badges) {
        const el = document.getElementById(`badge-${badges[id]}`);
        if (gameState.progress[id] && el) el.classList.add('earned');
    }
}

function updateMapUI() {
    const rooms = Object.keys(roomData);
    rooms.forEach(idStr => {
        const id = parseInt(idStr);
        const btn = document.querySelector(`[data-room-id="${id}"]`);
        if (!btn) return;

        const isCompleted = isRoomDone(id);
        const floorRow = btn.closest('.floor-row');

        if (isCompleted) {
            btn.classList.add('completed');
            btn.disabled = true;
            btn.classList.remove('locked');
        } else {
            let locked = false;
            // Floor 1 Rooms
            if (id == 102 && !isRoomDone(101)) locked = true;
            if (id == 103 && !isRoomDone(102)) locked = true;
            if (id == 100 && !isRoomDone(103)) locked = true;

            // Floor 2 unlocks if Floor 1 Boss (100) is done
            if (id == 201 && !isRoomDone(100)) locked = true;
            if (id == 202 && !isRoomDone(201)) locked = true;
            if (id == 200 && !isRoomDone(202)) locked = true;

            // Floor 3 unlocks if Floor 2 Boss (200) is done
            if (id == 301 && !isRoomDone(200)) locked = true;
            if (id == 302 && !isRoomDone(301)) locked = true;
            if (id == 303 && !isRoomDone(302)) locked = true;
            if (id == 300 && !isRoomDone(303)) locked = true;

            // Floor 4 unlocks if Floor 3 Boss (300) is done
            if (id == 401 && !isRoomDone(300)) locked = true;
            if (id == 402 && !isRoomDone(401)) locked = true;
            if (id == 400 && !isRoomDone(402)) locked = true;

            // HQ unlocks if Floor 4 Boss (400) is done
            if (id == 0 && !isRoomDone(400)) locked = true;

            if (locked) {
                btn.classList.add('locked');
                btn.disabled = true;
            } else {
                btn.classList.remove('locked');
                btn.disabled = false;
                // CRITICAL: Unlock the entire floor row so it can be clicked
                if (floorRow) {
                    floorRow.classList.remove('locked');
                    floorRow.classList.add('active');
                }
            }
        }
    });
}

// Helper to check progress safely
function isRoomDone(id) {
    return gameState.progress[id] === true || gameState.progress[String(id)] === true;
}

function saveGame() { localStorage.setItem('msaQuestProgress', JSON.stringify(gameState.progress)); }

function updateBattleUI() {
    const hp = document.getElementById('enemy-hp');
    if (hp) hp.style.width = gameState.enemyHP + "%";

    const phaseEl = document.getElementById('battle-phase');
    if (phaseEl && gameState.phase) {
        phaseEl.innerText = gameState.phase.toUpperCase();
    }
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
