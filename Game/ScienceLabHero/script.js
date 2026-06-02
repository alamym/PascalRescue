/**
 * Science Lab Hero - Core Game Logic (v0.5.0)
 * Updated by SzeMan (小敏)
 * Changes: External JSON Questions, Game Over on 3 Deaths, Top 10 Leaderboard
 */

class AudioManager {
    constructor() {
        this.audioCtx = null;
        this.isMuted = false;
        const muteBtn = document.getElementById('mute-btn');
        if (muteBtn) {
            muteBtn.onclick = () => {
                this.isMuted = !this.isMuted;
                muteBtn.innerText = this.isMuted ? '🔇' : '🔊';
            };
        }
    }
    initCtx() { if (!this.audioCtx) this.audioCtx = new (window.AudioContext || window.webkitAudioContext)(); }
    playSFX(type) {
        this.initCtx();
        if (this.isMuted) return;
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        osc.connect(gain); gain.connect(this.audioCtx.destination);
        if (type === 'success') {
            osc.frequency.setValueAtTime(523.25, this.audioCtx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(1046.50, this.audioCtx.currentTime + 0.1);
            gain.gain.setValueAtTime(0.1, this.audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, this.audioCtx.currentTime + 0.3);
            osc.start(); osc.stop(this.audioCtx.currentTime + 0.3);
        } else if (type === 'fail') {
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(110, this.audioCtx.currentTime);
            osc.frequency.linearRampToValueAtTime(55, this.audioCtx.currentTime + 0.2);
            gain.gain.setValueAtTime(0.1, this.audioCtx.currentTime);
            gain.gain.linearRampToValueAtTime(0, this.audioCtx.currentTime + 0.4);
            osc.start(); osc.stop(this.audioCtx.currentTime + 0.4);
        }
    }
}

class GameEngine {
    constructor() {
        this.level = 1;
        this.score = 0;
        this.lives = 3;
        this.db = null; // Question Database
        this.currentQuestions = [];
        this.qIndex = 0;
        this.questionsPerLevel = 5;
        this.levelPerfect = true;
        this.audio = new AudioManager();

        this.ui = {
            level: document.getElementById('level-display'),
            score: document.getElementById('score-display'),
            lives: document.getElementById('lives-display'),
            content: document.getElementById('game-content'),
            startBtn: document.getElementById('start-btn'),
            startScreen: document.getElementById('start-screen'),
            gameOverScreen: document.getElementById('game-over-screen'),
            leaderboardScreen: document.getElementById('leaderboard-screen'),
            finalScore: document.getElementById('final-score'),
            playerName: document.getElementById('player-name'),
            submitScoreBtn: document.getElementById('submit-score-btn'),
            leaderboardBody: document.getElementById('leaderboard-body')
        };
        this.init();
    }

    async init() {
        // Load External Questions
        try {
            const response = await fetch('questions.json');
            this.db = await response.json();
            console.log("Questions loaded successfully.");
        } catch (error) {
            console.error("Failed to load questions:", error);
            alert("Error: Lab Database not found!");
        }

        this.ui.startBtn.addEventListener('click', () => {
            this.audio.initCtx();
            this.ui.startScreen.style.display = 'none';
            this.startLevel(this.level);
        });

        this.ui.submitScoreBtn.addEventListener('click', () => this.saveScore());
    }

    shuffle(array) {
        return array.sort(() => Math.random() - 0.5);
    }

    startLevel(lv) {
        this.level = lv;
        this.lives = 3;
        this.qIndex = 0;
        this.levelPerfect = true;

        if (lv === 11) {
            // Boss Level: One random question from each level
            const bossPool = [];
            for (let i = 1; i <= 10; i++) {
                const topicPool = this.db[i].questions;
                bossPool.push(topicPool[Math.floor(Math.random() * topicPool.length)]);
            }
            this.currentQuestions = this.shuffle(bossPool).slice(0, 10);
        } else {
            const data = this.db[lv];
            if (!data) {
                this.showVictory();
                return;
            }
            // Randomly select 5 questions from the pool
            this.currentQuestions = this.shuffle([...data.questions]).slice(0, this.questionsPerLevel);
        }

        this.renderQuestion();
        this.updateUI();
    }

    renderQuestion() {
        this.ui.content.innerHTML = '';
        const data = this.db[this.level];
        const currentQ = this.currentQuestions[this.qIndex];

        const title = document.createElement('h2');
        title.innerText = (this.level === 11) ? "👹 BOSS LEVEL: ULTIMATE CHALLENGE" : data.title;
        this.ui.content.appendChild(title);

        const progress = document.createElement('p');
        progress.innerText = `Task ${this.qIndex + 1} of ${this.currentQuestions.length}`;
        progress.style.color = "#3498db";
        progress.style.fontWeight = "bold";
        this.ui.content.appendChild(progress);

        const qText = document.createElement('p');
        qText.className = "question-text";
        qText.innerText = currentQ.q;
        this.ui.content.appendChild(qText);

        const optionsContainer = document.createElement('div');
        optionsContainer.className = "options-container";

        const shuffledOptions = this.shuffle([...currentQ.options]);

        shuffledOptions.forEach(opt => {
            const btn = document.createElement('button');
            btn.className = "choice-btn";
            btn.innerText = opt.text;
            btn.onclick = () => this.handleAnswer(opt, btn);
            optionsContainer.appendChild(btn);
        });
        this.ui.content.appendChild(optionsContainer);
        document.getElementById('game-screen').scrollTop = 0;
    }

    handleAnswer(opt, btn) {
        const buttons = this.ui.content.querySelectorAll('.choice-btn');
        buttons.forEach(b => b.disabled = true);

        if (opt.correct) {
            btn.classList.add('correct-ans');
            this.audio.playSFX('success');
            this.score += (this.level === 11 ? 500 : 100);
            this.updateUI();

            setTimeout(() => {
                this.qIndex++;
                if (this.qIndex >= this.currentQuestions.length) {
                    if (this.levelPerfect) {
                        this.score += 500;
                        this.updateUI();
                        alert("🌟 PERFECT! Level completed with zero damage. Bonus +500 points!");
                    }
                    this.level++;
                    if (this.level > 11) {
                        this.showVictory();
                    } else {
                        alert(this.level === 11 ? "WARNING: BOSS INBOUND!" : "Level Complete!");
                        this.startLevel(this.level);
                    }
                } else {
                    this.renderQuestion();
                }
            }, 800);
        } else {
            btn.classList.add('wrong-ans');
            this.audio.playSFX('fail');
            this.lives--;
            this.levelPerfect = false;
            this.updateUI();

            if (this.lives <= 0) {
                setTimeout(() => {
                    this.triggerGameOver();
                }, 500);
            } else {
                setTimeout(() => {
                    alert("Incorrect result. Try another hypothesis!");
                    buttons.forEach(b => b.disabled = false);
                    btn.classList.remove('wrong-ans');
                }, 500);
            }
        }
    }

    updateUI() {
        this.ui.level.innerText = (this.level === 11 ? "BOSS" : this.level);
        this.ui.score.innerText = this.score;
        this.ui.lives.innerText = "❤️".repeat(this.lives);
    }

    triggerGameOver() {
        this.ui.content.style.display = 'none';
        this.ui.gameOverScreen.style.display = 'flex';
        this.ui.finalScore.innerText = this.score;
    }

    async saveScore() {
        const name = this.ui.playerName.value.trim() || "Anonymous Hero";
        try {
            const scoresRef = database.ref('leaderboard');
            await scoresRef.push({
                name: name,
                score: this.score,
                timestamp: Date.now()
            });
            this.showLeaderboard();
        } catch (error) {
            console.error("Score submission failed:", error);
            alert("Connection error! Score not saved.");
        }
    }

    async showLeaderboard() {
        this.ui.gameOverScreen.style.display = 'none';
        this.ui.content.style.display = 'none';
        this.ui.leaderboardScreen.style.display = 'flex';
        this.ui.leaderboardBody.innerHTML = '<tr><td colspan="3">Loading rankings...</td></tr>';

        try {
            const snapshot = await database.ref('leaderboard').orderByChild('score').limitToLast(10).once('value');
            const data = [];
            snapshot.forEach(child => {
                data.push(child.val());
            });
            // Firebase limitToLast gives lowest to highest, so we reverse it
            data.reverse();

            this.ui.leaderboardBody.innerHTML = '';
            data.forEach((entry, index) => {
                const row = `<tr>
                    <td>${index + 1}</td>
                    <td>${entry.name}</td>
                    <td>${entry.score}</td>
                </tr>`;
                this.ui.leaderboardBody.innerHTML += row;
            });
        } catch (error) {
            this.ui.leaderboardBody.innerHTML = '<tr><td colspan="3">Failed to load leaderboard.</td></tr>';
        }
    }

    showVictory() {
        this.ui.content.innerHTML = `
            <div style="text-align: center; padding: 40px;">
                <h1 style="font-size: 5rem; color: #f1c40f;">🏆</h1>
                <h2 style="font-size: 2.5rem;">UK SCIENCE HERO!</h2>
                <p style="font-size: 1.2rem;">You successfully mastered all topics.</p>
                <button onclick="window.game.triggerGameOver()" style="font-size: 1.5rem; margin-top: 20px;">Submit Final Score</button>
            </div>
        `;
    }
}

window.onload = () => {
    window.game = new GameEngine();
};
