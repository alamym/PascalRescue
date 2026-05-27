// Game State Management
let gameState = {
    rescuedTeachers: 0, // This now tracks Values earned
    currentRoom: null,
    phase: 'minion', // 'minion' or 'value_earned' or 'boss'
    enemyHP: 100,
    progress: JSON.parse(localStorage.getItem('msaQuestProgress')) || {
        101: false, // Dignity
        102: false, // Kindness
        103: false, // Compassion
        104: false, // Courage
        105: false, // Endeavour
        100: false  // Final Boss
    },
    roomMinionProgress: {
        101: 0, 102: 0, 103: 0, 104: 0, 105: 0
    }
};

// Data Structure for MSA Values and Challenges
const roomData = {
    101: {
        name: "DIGNITY Room",
        value: "Dignity",
        badge: "⚖️",
        minions: [
            { q: "12 x 11 = ?", a: 132, hint: "Hint: 12x10 + 12", enemy: "Confusion Imp 😈" },
            { q: "List the factors of 10. How many are there?", a: 4, hint: "Hint: 1, 2, 5, 10", enemy: "Doubt Wraith 👻" }
        ],
        valueChallenge: {
            q: "What is the Highest Common Factor (HCF) of 20 and 30?",
            a: 10,
            hint: "Hint: Factors of 20 (1,2,4,5,10,20), Factors of 30 (1,2,3,5,6,10,15,30).",
            enemy: "The Gate of Honour ⛩️"
        }
    },
    102: {
        name: "KINDNESS Room",
        value: "Kindness",
        badge: "🤝",
        minions: [
            { q: "-7 + 12 = ?", a: 5, hint: "Hint: Think of a thermometer.", enemy: "Frost Bite ❄️" },
            { q: "10 - (-5) = ?", a: 15, hint: "Hint: Subtracting a negative is like adding.", enemy: "Frost Bite ❄️" }
        ],
        valueChallenge: {
            q: "-3 x 8 = ?",
            a: -24,
            hint: "Hint: A negative times a positive is negative.",
            enemy: "The Wall of Barriers 🧱"
        }
    },
    103: {
        name: "COMPASSION Room",
        value: "Compassion",
        badge: "❤️",
        minions: [
            { q: "0.5 + 0.25 = ?", a: 0.75, hint: "Hint: Think of quarters.", enemy: "Fraction Slime 💧" },
            { q: "What is 1/4 as a percentage?", a: 25, hint: "Hint: 1 out of 4 is how many out of 100?", enemy: "Fraction Slime 💧" }
        ],
        valueChallenge: {
            q: "What is 20% of 60?",
            a: 12,
            hint: "Hint: 10% is 6, so 20% is...",
            enemy: "The Tolerance Lock 🔓"
        }
    },
    104: {
        name: "COURAGE Room",
        value: "Courage",
        badge: "🦁",
        minions: [
            { q: "If a map scale is 1:100, how many cm is 5m?", a: 5, hint: "Hint: 5m = 500cm, then divide by 100.", enemy: "Shadow Lion 🦁" },
            { q: "3^2 + 4^2 = ?", a: 25, hint: "Hint: 9 + 16", enemy: "Shadow Lion 🦁" }
        ],
        valueChallenge: {
            q: "What is the square root of 144?",
            a: 12,
            hint: "Hint: What number times itself is 144?",
            enemy: "The Brave Sentinel 🛡️"
        }
    },
    105: {
        name: "ENDEAVOUR Room",
        value: "Endeavour",
        badge: "🛠️",
        minions: [
            { q: "The mean of 5, 10, and 15 is?", a: 10, hint: "Hint: Add them up and divide by 3.", enemy: "Data Gremlin 📊" }
        ],
        valueChallenge: {
            q: "What is the median of 3, 7, 8, 12, 15?",
            a: 8,
            hint: "Hint: The middle number in a sorted list.",
            enemy: "The Pillar of Hard Work 🏛️"
        }
    },
    100: {
        name: "THE FINAL CHALLENGE",
        value: "All Values",
        badge: "🏆",
        questions: {
            q: "Solve: (2 + 3) x (10 - 4) / 2",
            a: 15,
            hint: "Hint: Follow BIDMAS (Brackets, Indices, Division, Multiplication, Addition, Subtraction).",
            enemy: "The Master of Ignorance 👺"
        }
    }
};

let currentQuestionSet = [];
let questionIndex = 0;

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    // Load progress
    const savedProgress = localStorage.getItem('msaQuestProgress');
    if (savedProgress) {
        gameState.progress = JSON.parse(savedProgress);
    }

    const savedState = localStorage.getItem('msaQuestState');
    if (savedState) {
        const parsed = JSON.parse(savedState);
        gameState.roomMinionProgress = parsed.roomMinionProgress || gameState.roomMinionProgress;
    }

    // Sync rescued count
    gameState.rescuedTeachers = Object.keys(roomData)
        .filter(id => id != 100 && gameState.progress[id]).length;

    updateMapUI();
    updateStatsDisplay();
    updateBadges();

    // Event Bindings
    document.querySelectorAll('.room-btn, .boss-btn').forEach(button => {
        button.addEventListener('click', () => {
            if (!button.classList.contains('locked') && !button.disabled) {
                const roomId = parseInt(button.dataset.roomId);
                if (!isNaN(roomId)) initiateBattle(roomId);
            }
        });
    });

    document.getElementById('attack-btn').addEventListener('click', processAnswer);
    document.getElementById('answer-input').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') processAnswer();
    });
});

// --- Game Logic ---

function initiateBattle(roomId) {
    gameState.currentRoom = roomId;
    document.getElementById('map-screen').classList.add('hidden');
    document.getElementById('battle-screen').classList.remove('hidden');
    document.getElementById('answer-input').focus();

    if (roomId === 100) {
        gameState.phase = 'boss';
        currentQuestionSet = [roomData[100].questions];
        questionIndex = 0;
    } else {
        gameState.phase = 'minion';
        questionIndex = gameState.roomMinionProgress[roomId] || 0;
        currentQuestionSet = [...roomData[roomId].minions];
    }

    gameState.enemyHP = 100;
    updateBattleUI();
    loadQuestion();
}

function loadQuestion() {
    const roomId = gameState.currentRoom;
    let qData;

    if (gameState.phase === 'minion') {
        qData = currentQuestionSet[questionIndex];
    } else if (gameState.phase === 'value_earned' || gameState.phase === 'boss') {
        qData = (roomId === 100) ? roomData[100].questions : roomData[roomId].valueChallenge;
    }

    if (!qData) return;

    document.getElementById('question-text').innerText = qData.q;
    document.getElementById('answer-input').value = '';
    document.getElementById('math-hint').classList.add('hidden');
    document.getElementById('enemy-name').innerText = qData.enemy || "Enemy";
    document.getElementById('enemy-sprite').innerText = (qData.enemy || "").split(' ').pop() || "👾";
}

function processAnswer() {
    const input = document.getElementById('answer-input').value;
    const roomId = gameState.currentRoom;
    let qData;

    if (gameState.phase === 'minion') {
        qData = currentQuestionSet[questionIndex];
    } else {
        qData = (roomId === 100) ? roomData[100].questions : roomData[roomId].valueChallenge;
    }

    if (parseFloat(input) === qData.a) {
        handleCorrect();
    } else {
        handleWrong(qData.hint);
    }
}

function handleCorrect() {
    createEffect("✨ EXCELLENT ✨", "player-attack");

    if (gameState.phase === 'minion') {
        questionIndex++;
        gameState.roomMinionProgress[gameState.currentRoom] = questionIndex;

        if (questionIndex >= currentQuestionSet.length) {
            gameState.phase = 'value_earned';
            createEffect("CORE VALUE CHALLENGE!", "warning");
            setTimeout(loadQuestion, 1000);
        } else {
            gameState.enemyHP -= (100 / currentQuestionSet.length);
            setTimeout(loadQuestion, 500);
        }
    } else {
        // Value Earned or Boss Defeated
        gameState.progress[gameState.currentRoom] = true;
        if (gameState.currentRoom !== 100) gameState.rescuedTeachers++;
        saveGameState();
        showVictoryScreen(gameState.currentRoom);
    }
    updateBattleUI();
}

function handleWrong(hint) {
    const container = document.getElementById('game-container');
    container.classList.add('shake');
    createEffect("Try again!", "enemy-attack");
    setTimeout(() => container.classList.remove('shake'), 200);

    const hintBox = document.getElementById('math-hint');
    hintBox.innerText = hint;
    hintBox.classList.remove('hidden');
}

function updateBattleUI() {
    const hpBar = document.getElementById('enemy-hp');
    const phaseLabel = document.getElementById('battle-phase');
    const roomTitle = document.getElementById('room-info');
    const data = roomData[gameState.currentRoom];

    roomTitle.innerText = data.name;

    if (gameState.phase === 'boss') {
        phaseLabel.innerText = "FINAL CHALLENGE";
        hpBar.style.backgroundColor = "var(--danger-red)";
    } else if (gameState.phase === 'minion') {
        phaseLabel.innerText = "Challenge Phase";
        hpBar.style.backgroundColor = "var(--blueprint-line)";
    } else {
        phaseLabel.innerText = `${data.value.toUpperCase()} CHALLENGE`;
        hpBar.style.backgroundColor = "var(--math-gold)";
    }
    hpBar.style.width = gameState.enemyHP + "%";
}

function showVictoryScreen(roomId) {
    const data = roomData[roomId];
    document.getElementById('battle-screen').classList.add('hidden');
    document.getElementById('victory-screen').classList.remove('hidden');

    if (roomId === 100) {
        document.getElementById('victory-title').innerText = "QUEST COMPLETE! 🏆";
        document.getElementById('victory-text').innerText = "You have mastered all MSA Values and completed the quest!";
        document.getElementById('victory-badge').innerText = "🎓";
    } else {
        document.getElementById('victory-title').innerText = `${data.value.toUpperCase()} EARNED!`;
        document.getElementById('victory-text').innerText = `You have demonstrated the value of ${data.value}. Well done!`;
        document.getElementById('victory-badge').innerText = data.badge;
    }
}

function showMap() {
    document.getElementById('victory-screen').classList.add('hidden');
    document.getElementById('battle-screen').classList.add('hidden');
    document.getElementById('map-screen').classList.remove('hidden');
    updateMapUI();
    updateStatsDisplay();
    updateBadges();
}

function saveGameState() {
    localStorage.setItem('msaQuestProgress', JSON.stringify(gameState.progress));
    localStorage.setItem('msaQuestState', JSON.stringify({
        roomMinionProgress: gameState.roomMinionProgress
    }));
}

function updateStatsDisplay() {
    document.getElementById('teacher-count').innerText = gameState.rescuedTeachers;
    const progress = Math.floor((gameState.rescuedTeachers / 5) * 100);
    document.getElementById('overall-progress').innerText = `${progress}%`;
}

function updateBadges() {
    const badges = {
        101: 'badge-dignity',
        102: 'badge-kindness',
        103: 'badge-compassion',
        104: 'badge-courage',
        105: 'badge-endeavour'
    };
    for (let id in badges) {
        const el = document.getElementById(badges[id]);
        if (gameState.progress[id]) el.classList.add('earned');
        else el.classList.remove('earned');
    }
}

function updateMapUI() {
    const rooms = [101, 102, 103, 104, 105, 100];
    let allValuesEarned = true;

    rooms.forEach(id => {
        const btn = document.querySelector(`[data-room-id="${id}"]`);
        if (!btn) return;

        if (id !== 100 && !gameState.progress[id]) allValuesEarned = false;

        if (gameState.progress[id]) {
            btn.classList.add('completed');
            btn.disabled = true;
        } else {
            let locked = false;
            // Linear progression for rooms
            if (id === 102 && !gameState.progress[101]) locked = true;
            if (id === 103 && !gameState.progress[102]) locked = true;
            if (id === 104 && !gameState.progress[103]) locked = true;
            if (id === 105 && !gameState.progress[104]) locked = true;
            // Boss needs all 5
            if (id === 100 && !allValuesEarned) locked = true;

            if (locked) {
                btn.classList.add('locked');
                btn.disabled = true;
            } else {
                btn.classList.remove('locked');
                btn.disabled = false;
            }
        }
    });

    if (allValuesEarned) {
        document.getElementById('boss-floor').classList.remove('locked');
        document.getElementById('boss-floor').classList.add('active');
    }
}

function createEffect(text, type) {
    const layer = document.getElementById('effect-layer');
    const div = document.createElement('div');
    div.className = `hit-effect ${type}`;
    div.innerText = text;
    div.style.left = (Math.random() * 50 + 25) + "%";
    div.style.top = (Math.random() * 50 + 25) + "%";
    layer.appendChild(div);
    setTimeout(() => div.remove(), 1000);
}
