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

// Full Year 7 Curriculum Room Data (Expanded Pools)
const roomData = {
    // FLOOR 1: NUMBER
    101: {
        name: "101: Multiples & Powers",
        minions: [
            { q: "12 x 100 = ?", a: 1200, hint: "Add two zeros.", enemy: "Factor Imp 😈" },
            { q: "450 ÷ 10 = ?", a: 45, hint: "Remove one zero.", enemy: "Factor Imp 😈" },
            { q: "What is 2^3?", a: 8, hint: "2 x 2 x 2", enemy: "Power Pixie ✨" },
            { q: "What is 5^2?", a: 25, hint: "5 x 5", enemy: "Power Pixie ✨" },
            { q: "First 3 multiples of 7? (e.g. 7,14,21)", a: "7,14,21", hint: "7x1, 7x2, 7x3", enemy: "Factor Imp 😈" },
            { q: "Is 15 a multiple of 3? (1 for Yes, 0 for No)", a: 1, hint: "3, 6, 9, 12, 15...", enemy: "Factor Imp 😈" },
            { q: "10^3 = ?", a: 1000, hint: "1 followed by 3 zeros.", enemy: "Power Pixie ✨" }
        ],
        teacherRescue: { q: "Find the LCM of 6 and 8.", a: 24, hint: "Multiples of 6: 6,12,18,24. Multiples of 8: 8,16,24.", enemy: "Teacher's Cage ⛓️" }
    },
    102: {
        name: "102: Negative Dungeon",
        minions: [
            { q: "-5 + 8 = ?", a: 3, hint: "Think of temperature rising.", enemy: "Minus Shadow 👻" },
            { q: "3 - 10 = ?", a: -7, hint: "Go below zero.", enemy: "Minus Shadow 👻" },
            { q: "-2 - 4 = ?", a: -6, hint: "Getting colder!", enemy: "Minus Shadow 👻" },
            { q: "-10 + 15 = ?", a: 5, hint: "Start at -10, go up 15.", enemy: "Minus Shadow 👻" },
            { q: "5 + (-2) = ?", a: 3, hint: "Same as 5 - 2.", enemy: "Minus Shadow 👻" },
            { q: "-1 x 5 = ?", a: -5, hint: "Negative x Positive = Negative.", enemy: "Minus Shadow 👻" }
        ],
        teacherRescue: { q: "-4 x -3 = ?", a: 12, hint: "Negative x Negative = Positive.", enemy: "Teacher's Cage ⛓️" }
    },
    103: {
        name: "103: Fraction Vault",
        minions: [
            { q: "0.5 as a fraction numerator (e.g. 1/2 answer 1)?", a: 1, hint: "One half.", enemy: "Decimal Drone 👾" },
            { q: "25% of 40?", a: 10, hint: "Divide by 4.", enemy: "Percent Pixel 👾" },
            { q: "1/2 of 50?", a: 25, hint: "Divide by 2.", enemy: "Fraction Fragment 🧩" },
            { q: "10% of 200?", a: 20, hint: "Divide by 10.", enemy: "Percent Pixel 👾" },
            { q: "0.25 as a percentage?", a: 25, hint: "Multiply by 100.", enemy: "Decimal Drone 👾" },
            { q: "Simplify 2/4 (numerator)?", a: 1, hint: "Divide both by 2.", enemy: "Fraction Fragment 🧩" }
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
            { q: "10^4 = ?", a: 10000, hint: "A 1 followed by four zeros.", enemy: "Prime Golem 🗿" },
            { q: "Is 17 a prime number? (1/0)", a: 1, hint: "Only 1 and 17 divide it.", enemy: "Prime Golem 🗿" },
            { q: "Square root of 64?", a: 8, hint: "What number times itself is 64?", enemy: "Prime Golem 🗿" }
        ]
    },

    // FLOOR 2: ALGEBRA
    201: {
        name: "201: Expression Arcade",
        minions: [
            { q: "Simplify: 3a + 2a", a: "5a", hint: "3+2 coefficients.", enemy: "Bracket Goblin 👺" },
            { q: "Simplify: 10x - 4x", a: "6x", hint: "Subtract coefficients.", enemy: "Bracket Goblin 👺" },
            { q: "Collect: 5y + 3 + 2y", a: "7y+3", hint: "Group the y terms.", enemy: "Bracket Goblin 👺" },
            { q: "Simplify: 4b + 4b", a: "8b", hint: "Add them up.", enemy: "Bracket Goblin 👺" },
            { q: "Simplify: 2x + 3y + x", a: "3x+3y", hint: "Only add the x terms together.", enemy: "Bracket Goblin 👺" },
            { q: "If x=2, what is 5x?", a: 10, hint: "5 times 2.", enemy: "Bracket Goblin 👺" }
        ],
        teacherRescue: { q: "Expand: 3(x + 4)", a: "3x+12", hint: "Multiply 3 by both inside terms.", enemy: "Teacher's Cage ⛓️" }
    },
    202: {
        name: "202: Equation Lab",
        minions: [
            { q: "x + 5 = 12, x = ?", a: 7, hint: "-5 from both sides.", enemy: "Variable Viper 🐍" },
            { q: "4x = 20, x = ?", a: 5, hint: "Divide by 4.", enemy: "Variable Viper 🐍" },
            { q: "x / 3 = 6, x = ?", a: 18, hint: "Multiply by 3.", enemy: "Variable Viper 🐍" },
            { q: "2x + 1 = 11, x = ?", a: 5, hint: "Subtract 1, then divide by 2.", enemy: "Variable Viper 🐍" },
            { q: "x - 8 = 2, x = ?", a: 10, hint: "Add 8 to both sides.", enemy: "Variable Viper 🐍" },
            { q: "10 - x = 4, x = ?", a: 6, hint: "10 minus what is 4?", enemy: "Variable Viper 🐍" }
        ],
        teacherRescue: { q: "2x - 4 = 10, x = ?", a: 7, hint: "Add 4, then divide by 2.", enemy: "Teacher's Cage ⛓️" }
    },
    200: {
        name: "2F BOSS: X-Algebrator",
        type: 'boss',
        badge: "KINDNESS",
        questions: [
            { q: "If a=5 and b=3, what is 2a + b?", a: 13, hint: "2*5 + 3", enemy: "X-Algebrator 🤖" },
            { q: "Solve for x: 5x + 2 = 22", a: 4, hint: "Subtract 2, divide by 5.", enemy: "X-Algebrator 🤖" },
            { q: "Solve for y: y/4 - 1 = 2", a: 12, hint: "Add 1, multiply by 4.", enemy: "X-Algebrator 🤖" },
            { q: "Expand: 5(2x - 3)", a: "10x-15", hint: "5*2x and 5*-3", enemy: "X-Algebrator 🤖" },
            { q: "Simplify: 3a + 2b - a + b", a: "2a+3b", hint: "Group a's and b's.", enemy: "X-Algebrator 🤖" }
        ]
    },

    // FLOOR 3: RATIO & SHAPE
    301: {
        name: "301: Proportion Sector",
        minions: [
            { q: "Simplify ratio 5:10 (1:x, x=?)", a: 2, hint: "Divide by 5.", enemy: "Scaling Slime 💧" },
            { q: "Share £20 in ratio 1:1. Each?", a: 10, hint: "Split equally.", enemy: "Scaling Slime 💧" },
            { q: "Ratio of 2 Red to 6 Blue simplified (1:x, x=?)", a: 3, hint: "Divide by 2.", enemy: "Scaling Slime 💧" },
            { q: "3 pens cost £6. 1 pen costs?", a: 2, hint: "Divide by 3.", enemy: "Scaling Slime 💧" },
            { q: "Scale factor: 2cm becomes 10cm. SF=?", a: 5, hint: "10 / 2", enemy: "Scaling Slime 💧" }
        ],
        teacherRescue: { q: "Share £60 in ratio 2:3. Larger share?", a: 36, hint: "Total 5 parts. 60/5=12. 12*3=?", enemy: "Teacher's Cage ⛓️" }
    },
    302: {
        name: "302: Geometry Zone",
        minions: [
            { q: "Angle on a straight line is ?", a: 180, hint: "A half turn.", enemy: "Angle Phantom 👻" },
            { q: "Angles in a triangle add up to ?", a: 180, hint: "Same as a straight line.", enemy: "Angle Phantom 👻" },
            { q: "Angle in a full turn is ?", a: 360, hint: "A circle.", enemy: "Angle Phantom 👻" },
            { q: "A right angle is how many degrees?", a: 90, hint: "An L shape.", enemy: "Angle Phantom 👻" },
            { q: "Angles in a quadrilateral total ?", a: 360, hint: "Two triangles.", enemy: "Angle Phantom 👻" }
        ],
        teacherRescue: { q: "One angle is 40 on a straight line. Find missing.", a: 140, hint: "180 - 40", enemy: "Teacher's Cage ⛓️" }
    },
    303: {
        name: "303: Perimeter Perimeter",
        minions: [
            { q: "Perimeter of square side 5cm?", a: 20, hint: "5+5+5+5", enemy: "Area Anomaly 🟦" },
            { q: "Perimeter of rectangle 4cm by 6cm?", a: 20, hint: "(4+6) * 2", enemy: "Area Anomaly 🟦" },
            { q: "Area of square side 4cm?", a: 16, hint: "4 x 4", enemy: "Area Anomaly 🟦" },
            { q: "Area of rectangle 3m by 10m?", a: 30, hint: "3 x 10", enemy: "Area Anomaly 🟦" },
            { q: "Side of square with perimeter 12cm?", a: 3, hint: "12 / 4", enemy: "Area Anomaly 🟦" }
        ],
        teacherRescue: { q: "Area of triangle: Base=10, Height=5?", a: 25, hint: "(B x H) / 2", enemy: "Teacher's Cage ⛓️" }
    },
    300: {
        name: "3F BOSS: Geometric Sphinx",
        type: 'boss',
        badge: "COMPASSION",
        questions: [
            { q: "Find the area of a rectangle 8m by 7m.", a: 56, hint: "Length x Width", enemy: "Geometric Sphinx 🏺" },
            { q: "A circle has no corners. (1 for True, 0 for False)", a: 1, hint: "True", enemy: "Geometric Sphinx 🏺" },
            { q: "Perimeter of a regular hexagon with side 3cm.", a: 18, hint: "3 * 6", enemy: "Geometric Sphinx 🏺" },
            { q: "How many sides does an octagon have?", a: 8, hint: "Octopus legs.", enemy: "Geometric Sphinx 🏺" },
            { q: "Area of triangle: Base=10, Height=4. Area=?", a: 20, hint: "(B x H) / 2", enemy: "Geometric Sphinx 🏺" },
            { q: "Angle x: 180 - 45 = ?", a: 135, hint: "Subtract carefully.", enemy: "Geometric Sphinx 🏺" }
        ]
    },

    // FLOOR 4: DATA & PROBABILITY
    401: {
        name: "401: Chance Chamber",
        minions: [
            { q: "Prob of 'Heads' on a coin (decimal)?", a: 0.5, hint: "1 out of 2.", enemy: "Dice Drone 🎲" },
            { q: "Prob of 'Red' in bag (3 Red, 7 Blue) (decimal)?", a: 0.3, hint: "3 out of 10.", enemy: "Dice Drone 🎲" },
            { q: "If 'Certain', probability is?", a: 1, hint: "100% as a whole number.", enemy: "Dice Drone 🎲" },
            { q: "If 'Impossible', probability is?", a: 0, hint: "Zero chance.", enemy: "Dice Drone 🎲" },
            { q: "Prob of rolling a 1 on a 6-sided die (1/x, x=?)", a: 6, hint: "1 out of 6.", enemy: "Dice Drone 🎲" }
        ],
        teacherRescue: { q: "Probability of rolling an EVEN number on a die (decimal)?", a: 0.5, hint: "2, 4, 6 are even. That is 3 out of 6.", enemy: "Teacher's Cage ⛓️" }
    },
    402: {
        name: "402: Chart Citadel",
        minions: [
            { q: "Mean of 2, 4, 6?", a: 4, hint: "Sum=12. 12/3=?", enemy: "Graph Gremlin 📊" },
            { q: "Mode of 1, 2, 2, 3?", a: 2, hint: "Most frequent.", enemy: "Graph Gremlin 📊" },
            { q: "Median of 1, 5, 10?", a: 5, hint: "Middle value.", enemy: "Graph Gremlin 📊" },
            { q: "Range of 5, 15, 20?", a: 15, hint: "20 - 5", enemy: "Graph Gremlin 📊" },
            { q: "Mean of 10 and 20?", a: 15, hint: "30 / 2", enemy: "Graph Gremlin 📊" }
        ],
        teacherRescue: { q: "Find the range of 10, 20, 50.", a: 40, hint: "Largest - Smallest.", enemy: "Teacher's Cage ⛓️" }
    },
    400: {
        name: "4F BOSS: Stochastic Titan",
        type: 'boss',
        badge: "COURAGE",
        questions: [
            { q: "Find the median of 3, 5, 8, 10, 12.", a: 8, hint: "Middle number.", enemy: "Stochastic Titan 🌪️" },
            { q: "Probability of an impossible event is ?", a: 0, hint: "Cannot happen.", enemy: "Stochastic Titan 🌪️" },
            { q: "Mean of 10, 10, 40?", a: 20, hint: "60 / 3", enemy: "Stochastic Titan 🌪️" },
            { q: "Mode of 7, 8, 7, 9, 7?", a: 7, hint: "Most common.", enemy: "Stochastic Titan 🌪️" },
            { q: "Range of 1, 2, 3, 4, 10?", a: 9, hint: "10 - 1", enemy: "Stochastic Titan 🌪️" }
        ]
    },

    // ROOFTOP: THE FINAL CHALLENGE
    0: {
        name: "ROOFTOP: The Maths Demon",
        type: 'boss',
        badge: "ENDEAVOUR",
        questions: [
            { q: "BIDMAS: (10 + 5) x 2 - 4 = ?", a: 26, hint: "Brackets first!", enemy: "The Maths Demon 👺" },
            { q: "Solve for x: 3x + 10 = 40", a: 10, hint: "Subtract 10, then divide by 3.", enemy: "The Maths Demon 👺" },
            { q: "Area of triangle: Base=8, Height=6", a: 24, hint: "8*6 / 2", enemy: "The Maths Demon 👺" },
            { q: "Simplify ratio 12:4 (x:1, x=?)", a: 3, hint: "Divide by 4.", enemy: "The Maths Demon 👺" },
            { q: "-5 - (-10) = ?", a: 5, hint: "-5 + 10", enemy: "The Maths Demon 👺" }
        ]
    }
};

// --- Helper Functions ---
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function getRandomQuestions(pool, count) {
    let shuffled = shuffleArray([...pool]);
    return shuffled.slice(0, Math.min(count, pool.length));
}

let currentQuestionSet = [];
let questionIndex = 0;
let bossTimer = null;
let timeLeft = 60;

// --- Initialization ---
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
    if (!data) return;

    document.getElementById('map-screen').classList.add('hidden');
    document.getElementById('battle-screen').classList.remove('hidden');

    const roomNameEl = document.getElementById('room-name');
    if (roomNameEl) roomNameEl.innerText = data.name;

    // Reset and hide timer box by default
    const timerBox = document.getElementById('timer-box');
    if (timerBox) timerBox.classList.add('hidden');
    if (bossTimer) clearInterval(bossTimer);

    document.getElementById('answer-input').focus();

    if (roomId === 0) {
        // FINAL BOSS LOGIC: Pick 5 random from the Demon Pool
        gameState.phase = 'boss';
        currentQuestionSet = getRandomQuestions(data.questions, 5);
        questionIndex = 0;
        startBossTimer();
    } else if (data.type === 'boss') {
        gameState.phase = 'boss';
        // Pick 3 random questions from boss pool
        currentQuestionSet = getRandomQuestions(data.questions, 3);
        questionIndex = 0;
    } else {
        gameState.phase = 'minion';
        // Pick 3 random minions from the room pool
        currentQuestionSet = getRandomQuestions(data.minions, 3);
        questionIndex = 0; // Always start fresh with random set
    }

    gameState.enemyHP = 100;
    updateBattleUI();
    loadQuestion();
}

function generateFinalBossQuestions() {
    let allPool = [];
    // Scrap every question from 1F-4F
    Object.keys(roomData).forEach(id => {
        const room = roomData[id];
        if (parseInt(id) === 0) return;
        if (room.minions) allPool.push(...room.minions);
        if (room.teacherRescue) allPool.push(room.teacherRescue);
        if (room.questions) {
            if (Array.isArray(room.questions)) allPool.push(...room.questions);
            else allPool.push(room.questions);
        }
    });
    return shuffleArray(allPool).slice(0, 5);
}

function startBossTimer() {
    timeLeft = 60;
    const timerBox = document.getElementById('timer-box');
    const timerDisplay = document.getElementById('time-left');
    if (timerBox) timerBox.classList.remove('hidden');
    if (timerDisplay) timerDisplay.innerText = timeLeft;

    bossTimer = setInterval(() => {
        timeLeft--;
        if (timerDisplay) timerDisplay.innerText = timeLeft;

        if (timeLeft <= 0) {
            clearInterval(bossTimer);
            alert("TIME UP! The Maths Demon has overpowered you. Try again!");
            showMap();
        }
    }, 1000);
}

function loadQuestion() {
    const roomId = gameState.currentRoom;
    const data = roomData[roomId];
    let qData = currentQuestionSet[questionIndex];

    if (gameState.phase === 'teacher_rescue') {
        qData = data.teacherRescue;
    }

    const qTextEl = document.getElementById('question-text');
    const inputEl = document.getElementById('answer-input');
    const hintBox = document.getElementById('math-hint');

    // Defensive check
    if (!qData) {
        console.error("No question data found!", {roomId, phase: gameState.phase, index: questionIndex});
        if (qTextEl) qTextEl.innerText = "Teacher rescued! Returning to map...";
        setTimeout(showMap, 2000);
        return;
    }

    // Update Question
    if (qTextEl) qTextEl.innerText = qData.q;

    // Reset Input
    if (inputEl) {
        inputEl.value = '';
        inputEl.focus();
    }

    // Clear and hide hint
    if (hintBox) {
        hintBox.innerText = '';
        hintBox.classList.add('hidden');
    }

    // Update Enemy Info
    const enemyNameEl = document.getElementById('enemy-name');
    const enemySpriteEl = document.getElementById('enemy-sprite');

    if (enemyNameEl) enemyNameEl.innerText = qData.enemy || "Math Minion";
    if (enemySpriteEl) {
        const sprite = (qData.enemy || "").split(' ').pop() || "👾";
        enemySpriteEl.innerText = sprite;
    }
}

function processAnswer() {
    let input = document.getElementById('answer-input').value.trim().toLowerCase();
    const roomId = gameState.currentRoom;
    const data = roomData[roomId];
    let qData;

    // Correctly identify which question to compare against
    if (gameState.phase === 'teacher_rescue') {
        qData = data.teacherRescue;
    } else {
        qData = currentQuestionSet[questionIndex];
    }

    if (!qData) return;

    // Prepare expected answer for comparison
    let expected = String(qData.a).toLowerCase().trim();

    // Check if both are numbers for precise float comparison (e.g. 0.5 vs .5)
    if (!isNaN(input) && !isNaN(expected) && input !== "" && expected !== "") {
        if (parseFloat(input) === parseFloat(expected)) {
            handleCorrect();
            return;
        }
    }

    // String comparison (for algebra like '5a' or '3x+12')
    // Remove all spaces for algebra comparison to be flexible (e.g. '3x + 12' vs '3x+12')
    let inputNormalized = input.replace(/\s+/g, '');
    let expectedNormalized = expected.replace(/\s+/g, '');

    if (inputNormalized === expectedNormalized) {
        handleCorrect();
    } else {
        handleWrong(qData.hint || "Try again!");
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
            gameState.enemyHP = 0; // Ensure it hits 0
            updateBattleUI();
            if (gameState.phase === 'minion') {
                gameState.phase = 'teacher_rescue';
                gameState.enemyHP = 100;
                createEffect("RESCUE THE TEACHER!", "warning");
                setTimeout(loadQuestion, 1000);
            } else {
                // Boss defeated after all questions
                gameState.progress[gameState.currentRoom] = true;
                saveGame();
                setTimeout(() => showVictory(gameState.currentRoom), 500);
            }
        } else {
            // Smooth HP reduction
            const damage = 100 / currentQuestionSet.length;
            gameState.enemyHP = Math.max(0, 100 - (questionIndex * damage));
            setTimeout(loadQuestion, 500);
        }
    } else {
        // Teacher rescued (one-shot stage)
        gameState.enemyHP = 0;
        updateBattleUI();
        gameState.progress[gameState.currentRoom] = true;
        saveGame();
        setTimeout(() => showVictory(gameState.currentRoom), 500);
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
    if (bossTimer) clearInterval(bossTimer);
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
    if (bossTimer) clearInterval(bossTimer);
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
            btn.classList.remove('locked');
            btn.disabled = false; // Allow re-playing rooms if desired, or keep true to lock
            if (floorRow) {
                floorRow.classList.remove('locked');
                floorRow.classList.add('active');
            }
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
