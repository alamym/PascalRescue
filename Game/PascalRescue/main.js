---// Game State Variables
let currentFloor = 1;
let currentRoom = 101;
let score = 0;
let rescuedTeachers = {}; // Stores which teachers have been rescued, e.g., {1: true, 2: false}
let gameProgress = {}; // Stores detailed progress for each room/level

// DOM Elements (assuming these exist in index.html)
const gameContainer = document.getElementById('game-container');
const questionDisplay = document.getElementById('question-display');
const answerInput = document.getElementById('answer-input');
const submitButton = document.getElementById('submit-answer');
const feedbackDisplay = document.getElementById('feedback-display');
const floorMapDisplay = document.getElementById('floor-map');
const teacherRescuedScreen = document.getElementById('teacher-rescued-s
const nextLevelButton = document.getElementById('next-level-button');

// --- Game Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    loadGameProgress();
    renderFloorMap();
    startRoom(currentRoom);
});

// --- Local Storage Functions ---
function saveGameProgress() {
    gameProgress = {
        currentFloor,
        currentRoom,
        score,
        rescuedTeachers
    };
    localStorage.setItem('pascalRescueProgress', JSON.stringify(gamePro
    console.log('Game progress saved:', gameProgress);
}

function loadGameProgress() {
    const savedProgress = localStorage.getItem('pascalRescueProgress');
    if (savedProgress) {
        const parsedProgress = JSON.parse(savedProgress);
        currentFloor = parsedProgress.currentFloor || 1;
        currentRoom = parsedProgress.currentRoom || 101;
        score = parsedProgress.score || 0;
        rescuedTeachers = parsedProgress.rescuedTeachers || {};
        console.log('Game progress loaded:', gameProgress);
    }
}

// --- UI Rendering ---
function renderFloorMap() {
    // This is a placeholder. In a real game, this would draw the Pasca
    // For now, it just shows current room.
    floorMapDisplay.innerHTML =         <h2>Pascal Building - Floor ${cCurrent Room: Classroom ${currentRoom}</p>         <p>Rescued Teachers:${Object.keys(rescuedTeachers).filter(key => rescuedTeachers[key]).length}</p>    ;
}

function showTeacherRescuedScreen(teacherNumber) {
    gameContainer.style.display = 'none';
    teacherRescuedScreen.style.display = 'flex';
    teacherRescuedScreen.innerHTML =         <h2>恭喜！你成功解救了第 ${teacherNumber} 位老師！</h2>         <p>你已掌握了該數學領域的核心知識。</p>         <button
id="next-level-button">繼續挑戰！</button>    ;
    document.getElementById('next-level-button').onclick = () => {
        teacherRescuedScreen.style.display = 'none';
        gameContainer.style.display = 'block';
        // Logic to move to the next room/floor
        moveToNextRoom();
    };
}

// --- Game Logic ---
let currentQuestion = null;
let currentAnswer = null;

function startRoom(roomNumber) {
    currentRoom = roomNumber;
    renderFloorMap();
    feedbackDisplay.textContent = '';
    answerInput.value = '';
    gameContainer.style.display = 'block';
    teacherRescuedScreen.style.display = 'none';

switch (roomNumber) {
    case 101: // Room of Multiples & Powers (Minions: Factor Imps)
        generateClassroom101Question();
        break;
    // case 102: // The Negative Dungeon
    //     generateClassroom102Question();
    //     break;
    // ... other rooms
    default:
        questionDisplay.textContent = "歡迎來到 Pascal Building！請選擇
        break;
}
}

function generateClassroom101Question() {
    const questionTypes = ['multiples', 'factors', 'powersOf10'];
    const selectedType = questionTypes[Math.floor(Math.random() * questionTypes.length)];

let num, questionText, correctAnswer;

switch (selectedType) {
    case 'multiples':
        num = Math.floor(Math.random() * 10) + 2; // Number between 2 and 11
        const count = Math.floor(Math.random() * 3) + 2; // Get 2nd to
        correctAnswer = num * count;
        questionText = `請找出 ${num} 的第 ${count} 個倍數。`;
        break;
    case 'factors':
        num = Math.floor(Math.random() * 30) + 12; // Number between 12 and 41
        const factors = getFactors(num);
        // Ensure there's at least one factor other than 1 and itself for the question
        const nonTrivialFactors = factors.filter(f => f !== 1 && f !==
        if (nonTrivialFactors.length > 0) {
            const randomIndex = Math.floor(Math.random() * nonTrivialFa
            correctAnswer = nonTrivialFactors[randomIndex];
            questionText = `請找出 ${num} 的一個因數 (不包括 1 和 ${num
        } else {
            // Fallback for prime numbers or numbers with only 1 and it
            // In this case, we'll ask for the smallest prime factor
            correctAnswer = getSmallestPrimeFactor(num);
            questionText = `請找出 ${num} 的最小質因數。`;
        }
        // Store all valid factors for validation, not just one.
        currentAnswer = factors; // Store all factors for validation
        break;
    case 'powersOf10':
        num = (Math.random() * 100).toFixed(2); // A decimal number like 12.34
        const power = Math.floor(Math.random() * 4) + 1; // Multiply by
        const operation = Math.random() < 0.5 ? 'multiply' : 'divide';
        let multiplier = Math.pow(10, power);

        if (operation === 'multiply') {
            correctAnswer = parseFloat((parseFloat(num) * multiplier).toFixed(2));
            questionText = `請計算 ${num} 乘以 ${multiplier} 等於多少？
        } else {
            correctAnswer = parseFloat((parseFloat(num) / multiplier).timal places for division
            questionText = `請計算 ${num} 除以 ${multiplier} 等於多少？`;
        }
        break;
}

currentQuestion = {
    type: selectedType,
    question: questionText,
    correctAnswer: correctAnswer // For multiples/powersOf10, this is the direct answer
};
questionDisplay.textContent = currentQuestion.question;
answerInput.value = ''; // Clear previous input
feedbackDisplay.textContent = '';

// For factors, currentAnswer holds the array of valid factors
if (selectedType !== 'factors') {
    currentAnswer = correctAnswer;
}
}

function getFactors(n) {
    const factors = [];
    for (let i = 1; i <= Math.sqrt(n); i++) {
        if (n % i === 0) {
            factors.push(i);
            if (i * i !== n) {
                factors.push(n / i);
            }
        }
    }
    return factors.sort((a, b) => a - b);
}

function getSmallestPrimeFactor(n) {
    if (n % 2 === 0) return 2;
    for (let i = 3; i * i <= n; i += 2) {
        if (n % i === 0) return i;
    }
    return n; // n itself is prime
}

submitButton.addEventListener('click', () => {
    const playerAnswer = answerInput.value.trim();
    let isCorrect = false;

if (currentQuestion.type === 'factors') {
    // For factor questions, currentAnswer is an array of all factors
    const parsedAnswer = parseInt(playerAnswer);
    if (!isNaN(parsedAnswer) && currentAnswer.includes(parsedAnswer) && parsedAnswer !== 1 && parsedAnswer !== currentQuestion.num) {
        // Check if the factor is valid and not 1 or the number itself ions)
        // This logic needs refinement based on the exact factor question asked.
        // For now, let's simplify: if it's in the list and not 1, it's
        isCorrect = currentAnswer.includes(parsedAnswer) && parsedAnswer !== 1; // Simplified check
        if (currentQuestion.question.includes('最小質因數')) {
            isCorrect = parsedAnswer === currentQuestion.correctAnswer;
        } else if (currentQuestion.question.includes('一個因數')) {
            isCorrect = currentAnswer.includes(parsedAnswer) && parsedAnswer !== 1 && parsedAnswer !== currentQuestion.num;
        }
    }
} else {
    // For multiples and powersOf10, direct comparison
    isCorrect = parseFloat(playerAnswer) === currentAnswer;
}

if (isCorrect) {
    feedbackDisplay.textContent = '正確！';
    score++;
    saveGameProgress();
    // For Classroom 101, after a few correct answers, consider it "cleared"
    // This is a placeholder for a more robust minion-clearing mechanis
    if (score % 3 === 0) { // Clear a minion every 3 correct answers
        // In a real game, this would track minions per room
        // For now, let's simulate clearing the room after 3 correct answers
        if (!rescuedTeachers[1]) { // If Teacher #1 (Number Specialist)
            rescuedTeachers[1] = true;
            saveGameProgress();
            showTeacherRescuedScreen(1);
        } else {
            // If teacher already rescued, just generate next question
            generateClassroom101Question();
        }
    } else {
        generateClassroom101Question(); // Next question
    }
} else {
    feedbackDisplay.textContent = '錯誤，請再試一次。';
    // Optional: provide a hint here
}
});

function moveToNextRoom() {
    // This is simplified. In a full game, this would check if all room
    // and then move to the next floor or boss battle.
    if (currentRoom === 101 && rescuedTeachers[1]) {
        // For now, just restart 101 for demonstration or move to a placeholder for 102
        // In a real game, this would be startRoom(102);
        alert('恭喜！你已完成 Classroom 101。接下來將進入 Classroom 102 (待開發)。');
        // For now, let's reset score and restart 101 for continuous pl
        score = 0;
        startRoom(101);
    }
    // Add more logic for other rooms/floors
}

// --- Firebase Integration Placeholder ---
// This section will be populated once you provide the Firebase config.
// Example structure:
/*
import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function saveGameProgressToFirebase(userId) {
    await setDoc(doc(db, "users", userId), gameProgress);
    console.log("Game progress saved to Firebase!");
}

async function loadGameProgressFromFirebase(userId) {
    const docRef = doc(db, "users", userId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        const data = docSnap.data();
        currentFloor = data.currentFloor || 1;
        currentRoom = data.currentRoom || 101;
        score = data.score || 0;
        rescuedTeachers = data.rescuedTeachers || {};
        console.log("Game progress loaded from Firebase:", data);
    } else {
        console.log("No such document in Firebase!");
    }
}
*/
"""
write_file("C:/Users/Lam/Desktop/SzeMan/Game/PascalRescue/main.js", EDITED_CODE)


print(bash_tool.run(cmd=f"write_file("C:/Users/Lam/Desktop/SzeMan/Game/_CODE)"))