// --- Data Section (Directly embedded for compatibility) ---
const levels = {
    floors: [
        {
            id: 1,
            name: "Ground Floor: Number Mastery",
            rooms: [
                {
                    id: 101,
                    name: "Room 101",
                    teacher: "Mr. Jones",
                    avatar: "👨‍🏫",
                    topic: "Powers of 10 & Multiples",
                    minions: [
                        { type: "multiple", target: 10 },
                        { type: "power10", val: 100 },
                        { type: "multiple", target: 5 }
                    ],
                    boss: {
                        question: "What is 12 x 1000?",
                        answer: "12000",
                        hint: "Count the zeros in 1000 and append them to 12."
                    },
                    reward: "Badge of Zeros"
                },
                {
                    id: 102,
                    name: "Room 102",
                    teacher: "Ms. Smith",
                    avatar: "👩‍🏫",
                    topic: "Factors & Prime Numbers",
                    minions: [
                        { type: "factor", target: 12 },
                        { type: "prime", range: [1, 20] },
                        { type: "factor", target: 20 }
                    ],
                    boss: {
                        question: "Is 17 a prime number? (Type 1 for Yes, 0 for No)",
                        answer: "1",
                        hint: "A prime number only has two factors: 1 and itself."
                    },
                    reward: "Prime Protector"
                },
                {
                    id: 103,
                    name: "Room 103",
                    teacher: "Mr. Lee",
                    avatar: "👨🏻‍🏫",
                    topic: "Estimation & Rounding",
                    minions: [
                        { type: "multiple", target: 100 },
                        { type: "power10", val: 1000 },
                        { type: "multiple", target: 20 }
                    ],
                    boss: {
                        question: "What is 45 x 100?",
                        answer: "4500",
                        hint: "Multiply by 100 by moving the decimal point two places to the right."
                    },
                    reward: "Estimation Expert"
                }
            ]
        }
    ]
};

console.log('Pascal Rescue: main.js loading (No-Module Version)...');

// DOM Elements with safety checks
const getEl = (id) => {
    const el = document.getElementById(id);
    if (!el) console.warn(`Element with id "${id}" not found!`);
    return el;
};

const gameCanvas = getEl('game-canvas');
const ctx = gameCanvas ? gameCanvas.getContext('2d') : null;
const startScreen = getEl('start-screen');
const startBtn = getEl('start-btn');
const leaderboardBtn = getEl('leaderboard-btn');
const hud = getEl('hud');
const currentFloorSpan = getEl('current-floor');
const currentRoomSpan = getEl('current-room');
const badgeCountSpan = getEl('badge-count');
const soundBtn = getEl('sound-btn');
const battleUi = getEl('battle-ui');
const mathProblemText = getEl('problem-text');
const answerDisplay = document.getElementById('answer-display');
const hintText = getEl('hint-text');
const victoryScreen = getEl('victory-screen');
const nextRoomBtn = getEl('next-room-btn');

// Game State
let currentState = 'start';
let currentFloor = 1;
let currentRoomId = 101;
let badges = 0;
let currentLevelData = null;
let audioEnabled = false;
let audioCtx = null;

// Battle State
let battlePhase = 'minions';
let currentMinionIndex = 0;
let currentQuestion = { text: '', answer: '', hint: '' };
let playerAnswer = '';
let hintLevel = 0;
let isCorrectAnim = false;

// Initialization
function init() {
    console.log('Pascal Rescue: Initializing...');
    try {
        loadGame();
        if (gameCanvas) {
            resizeCanvas();
            window.addEventListener('resize', resizeCanvas);
            gameCanvas.addEventListener('click', handleCanvasClick);
        }
        setupEventListeners();
        setupKeypad();
        switchToState('start');
        console.log('Pascal Rescue: Init complete.');
    } catch (e) {
        console.error('Initialization failed:', e);
    }
}

function saveGame() {
    try {
        const gameState = { badges: badges };
        localStorage.setItem('pascalRescue_save', JSON.stringify(gameState));
    } catch (e) {
        console.error('Save failed:', e);
    }
}

function loadGame() {
    try {
        const savedData = localStorage.getItem('pascalRescue_save');
        if (savedData) {
            const gameState = JSON.parse(savedData);
            badges = gameState.badges || 0;
        }
    } catch (e) {
        console.error('Load failed:', e);
    }
}

function setupEventListeners() {
    if (startBtn) {
        startBtn.onclick = () => {
            console.log('Start button clicked via onclick');
            initAudio();
            currentFloor = 1;
            currentRoomId = 101;
            loadRoomData();
            switchToState('map');
        };
    }

    if (leaderboardBtn) {
        leaderboardBtn.onclick = () => alert('Leaderboard coming soon!');
    }

    if (soundBtn) {
        soundBtn.onclick = () => {
            initAudio();
            audioEnabled = !audioEnabled;
            soundBtn.textContent = audioEnabled ? '🔊 ON' : '🔇 OFF';
        };
    }

    if (nextRoomBtn) {
        nextRoomBtn.onclick = () => switchToState('map');
    }
}

function initAudio() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
}

function setupKeypad() {
    const keys = document.querySelectorAll('.key');
    keys.forEach(key => {
        key.onclick = () => handleInput(key.textContent);
    });

    window.onkeydown = (e) => {
        if (currentState !== 'battle') return;
        if (e.key >= '0' && e.key <= '9') handleInput(e.key);
        if (e.key === 'Backspace' || e.key === 'Delete') handleInput('DEL');
        if (e.key === 'Enter') handleInput('ENTER');
    };
}

function handleInput(val) {
    if (currentState !== 'battle') return;

    if (val === 'DEL') {
        playerAnswer = playerAnswer.slice(0, -1);
    } else if (val === 'ENTER') {
        checkAnswer();
    } else if (playerAnswer.length < 8) {
        playerAnswer += val;
    }
    updateBattleUI();
}

function checkAnswer() {
    if (playerAnswer === currentQuestion.answer) {
        processCorrectAnswer();
    } else {
        processWrongAnswer();
    }
}

function processCorrectAnswer() {
    isCorrectAnim = true;
    playerAnswer = 'CORRECT!';
    updateBattleUI();

    setTimeout(() => {
        isCorrectAnim = false;
        playerAnswer = '';
        hintLevel = 0;
        if (hintText) hintText.style.opacity = 0;

        if (battlePhase === 'minions') {
            currentMinionIndex++;
            if (currentMinionIndex >= (currentLevelData?.minions?.length || 0)) {
                startBossPhase();
            } else {
                nextQuestion();
            }
        } else {
            badges++;
            saveGame();
            switchToState('victory');
        }
    }, 1500);
}

function processWrongAnswer() {
    playerAnswer = '';
    hintLevel = Math.min(hintLevel + 1, 2);
    showHint();
    updateBattleUI();

    if (mathProblemText) {
        mathProblemText.classList.add('shake');
        setTimeout(() => mathProblemText.classList.remove('shake'), 500);
    }
}

function showHint() {
    if (!hintText) return;
    hintText.textContent = `Hint: ${currentQuestion.hint}`;
    hintText.style.opacity = hintLevel > 0 ? 1 : 0;
    hintText.style.color = hintLevel === 2 ? '#ff4d6d' : '#0077b6';
}

function startBattle() {
    battlePhase = 'minions';
    currentMinionIndex = 0;
    nextQuestion();
}

function startBossPhase() {
    battlePhase = 'boss';
    if (currentLevelData && currentLevelData.boss) {
        currentQuestion = {
            text: currentLevelData.boss.question,
            answer: currentLevelData.boss.answer,
            hint: currentLevelData.boss.hint
        };
    }
    updateBattleUI();
}

function nextQuestion() {
    if (currentLevelData && currentLevelData.minions) {
        const minion = currentLevelData.minions[currentMinionIndex];
        if (minion) generateQuestion(minion);
    }
    updateBattleUI();
}

function loadRoomData() {
    const floor = levels.floors.find(f => f.id === currentFloor);
    if (floor) {
        currentLevelData = floor.rooms.find(r => r.id === currentRoomId);
    }
}

function generateQuestion(minion) {
    let text = '';
    let answer = '';
    let hint = '';

    switch (minion.type) {
        case 'multiple':
            const mult = Math.floor(Math.random() * 12) + 1;
            text = `${minion.target} x ${mult} = ?`;
            answer = (minion.target * mult).toString();
            hint = `Think of the ${minion.target} times table.`;
            break;
        case 'power10':
            const base = Math.floor(Math.random() * 9) + 2;
            text = `${base} x ${minion.val} = ?`;
            answer = (base * minion.val).toString();
            hint = `Just add the zeros from ${minion.val} to ${base}.`;
            break;
        case 'factor':
            text = `Find a factor of ${minion.target}`;
            const factors = [];
            for(let i=1; i<=minion.target; i++) if(minion.target % i === 0) factors.push(i.toString());
            answer = factors[Math.floor(Math.random() * factors.length)];
            hint = `What number can divide ${minion.target} exactly?`;
            break;
        case 'prime':
            const primes = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37];
            const filteredPrimes = primes.filter(p => p >= minion.range[0] && p <= minion.range[1]);
            const isPrimeQuestion = Math.random() > 0.5;

            if (isPrimeQuestion) {
                const p = filteredPrimes[Math.floor(Math.random() * filteredPrimes.length)];
                text = `Is ${p} a prime number? (1=Y, 0=N)`;
                answer = "1";
            } else {
                let n = Math.floor(Math.random() * (minion.range[1] - minion.range[0])) + minion.range[0];
                while (primes.includes(n)) n++;
                text = `Is ${n} a prime number? (1=Y, 0=N)`;
                answer = "0";
            }
            hint = "A prime number has only 1 and itself as factors.";
            break;
    }

    currentQuestion = { text, answer, hint };
}

function updateBattleUI() {
    if (mathProblemText) mathProblemText.textContent = currentQuestion.text;
    if (answerDisplay) {
        answerDisplay.textContent = playerAnswer || '_';
        answerDisplay.style.color = isCorrectAnim ? '#52b788' : '#00b4d8';
    }
}

function switchToState(state) {
    currentState = state;

    if (startScreen) startScreen.style.display = 'none';
    if (hud) hud.style.display = 'none';
    if (battleUi) battleUi.style.display = 'none';
    if (victoryScreen) victoryScreen.style.display = 'none';

    switch (state) {
        case 'start':
            if (startScreen) startScreen.style.display = 'flex';
            break;
        case 'map':
            if (hud) hud.style.display = 'flex';
            updateHud();
            renderMap();
            break;
        case 'battle':
            if (hud) hud.style.display = 'flex';
            if (battleUi) battleUi.style.display = 'flex';
            startBattle();
            updateHud();
            renderBattle();
            break;
        case 'victory':
            if (victoryScreen) {
                victoryScreen.style.display = 'flex';
                const teacherSpan = victoryScreen.querySelector('b');
                if (teacherSpan) teacherSpan.textContent = currentLevelData ? currentLevelData.topic : '';
            }
            break;
    }
}

function updateHud() {
    if (currentFloorSpan) currentFloorSpan.textContent = currentFloor;
    if (currentRoomSpan) currentRoomSpan.textContent = currentRoomId;
    if (badgeCountSpan) badgeCountSpan.textContent = badges;
}

function renderMap() {
    if (!ctx) return;
    ctx.clearRect(0, 0, gameCanvas.width, gameCanvas.height);

    ctx.strokeStyle = '#001d3d';
    ctx.lineWidth = 1;
    for (let x = 0; x < gameCanvas.width; x += 40) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, gameCanvas.height); ctx.stroke();
    }
    for (let y = 0; y < gameCanvas.height; y += 40) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(gameCanvas.width, y); ctx.stroke();
    }

    const floor = levels.floors.find(f => f.id === currentFloor);
    ctx.fillStyle = '#00b4d8';
    ctx.font = 'bold 28px Courier New';
    ctx.textAlign = 'center';
    ctx.fillText(floor ? floor.name.toUpperCase() : 'UNKNOWN FLOOR', gameCanvas.width / 2, 60);

    ctx.font = '16px Courier New';
    ctx.fillText('SELECT A CLASSROOM TO SECURE', gameCanvas.width / 2, 90);

    if (floor) {
        floor.rooms.forEach((room, index) => {
            drawRoom(room, index);
        });
    }
}

function drawRoom(room, index) {
    if (!ctx) return;
    const margin = 50;
    const spacing = 220;
    const x = margin + (index % 3) * spacing;
    const y = 150 + Math.floor(index / 3) * 180;
    const w = 180;
    const h = 120;

    room.rect = { x, y, w, h };

    ctx.shadowBlur = 10;
    ctx.shadowColor = '#00b4d8';
    ctx.strokeStyle = '#00b4d8';
    ctx.lineWidth = 3;
    ctx.strokeRect(x, y, w, h);
    ctx.shadowBlur = 0;

    ctx.fillStyle = 'rgba(0, 180, 216, 0.05)';
    ctx.fillRect(x, y, w, h);

    ctx.fillStyle = '#00b4d8';
    ctx.fillRect(x, y, w, 25);

    ctx.fillStyle = '#000814';
    ctx.font = 'bold 14px Courier New';
    ctx.textAlign = 'center';
    ctx.fillText(room.name, x + w / 2, y + 18);

    ctx.fillStyle = '#caf0f8';
    ctx.font = 'bold 16px Courier New';
    ctx.fillText(room.teacher, x + w / 2, y + 60);

    ctx.font = '12px Courier New';
    ctx.fillStyle = '#0077b6';
    ctx.fillText(room.topic, x + w / 2, y + 85);

    ctx.strokeStyle = '#0077b6';
    ctx.lineWidth = 1;
    ctx.strokeRect(x + 10, y + h - 25, w - 20, 15);
    ctx.fillStyle = '#0077b6';
    ctx.font = '10px Courier New';
    ctx.fillText('STATUS: OCCUPIED', x + w / 2, y + h - 14);
}

function renderBattle() {
    if (!ctx) return;
    ctx.clearRect(0, 0, gameCanvas.width, gameCanvas.height);

    const centerX = gameCanvas.width / 2;
    const centerY = gameCanvas.height / 2;

    ctx.strokeStyle = '#0077b6';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, centerY + 100);
    ctx.lineTo(gameCanvas.width, centerY + 100);
    ctx.stroke();

    drawCharacter(centerX - 150, centerY + 50, '#00b4d8', 'YOU');
    const enemyName = battlePhase === 'boss' ? 'BOSS' : `MINION ${currentMinionIndex + 1}`;
    drawCharacter(centerX + 150, centerY + 50, '#ff4d6d', enemyName);

    ctx.fillStyle = '#00b4d8';
    ctx.font = 'bold 20px Courier New';
    ctx.textAlign = 'center';
    ctx.fillText(`${currentLevelData?.topic?.toUpperCase() || ''}`, centerX, 40);
}

function drawCharacter(x, y, color, label) {
    if (!ctx) return;
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = 3;

    ctx.beginPath(); ctx.arc(x, y - 60, 15, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x, y - 45); ctx.lineTo(x, y); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x - 20, y - 30); ctx.lineTo(x + 20, y - 30); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - 15, y + 30); ctx.moveTo(x, y); ctx.lineTo(x + 15, y + 30); ctx.stroke();

    ctx.font = 'bold 12px Courier New';
    ctx.textAlign = 'center';
    ctx.fillText(label, x, y + 55);
}

function handleCanvasClick(e) {
    if (currentState !== 'map') return;

    const rect = gameCanvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const floor = levels.floors.find(f => f.id === currentFloor);
    if (floor) {
        const clickedRoom = floor.rooms.find(room => {
            if (!room.rect) return false;
            return x >= room.rect.x && x <= room.rect.x + room.rect.w &&
                   y >= room.rect.y && y <= room.rect.y + room.rect.h;
        });

        if (clickedRoom) {
            currentRoomId = clickedRoom.id;
            loadRoomData();
            switchToState('battle');
        }
    }
}

function resizeCanvas() {
    if (!gameCanvas) return;
    gameCanvas.width = gameCanvas.clientWidth;
    gameCanvas.height = gameCanvas.clientHeight;
    if (currentState === 'map') renderMap();
    if (currentState === 'battle') renderBattle();
}

// Start the game
init();
