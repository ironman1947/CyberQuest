const missionsData = [
    {
        id: "mission-1",
        title: "CASE 01: Phishing Intel",
        description: "Analyze the intercepted communication and identify the primary indicator of compromise.",
        scenario: "From: security@paypal-support-urgent.com\nTo: admin@cyberquest.net\nSubject: URGENT: Your Account Will Be Suspended\n\nDear Customer,\nWe detected suspicious logins. Verify identity within 2 hours: http://secure-auth-paypal.com/login",
        options: [
            "The generic greeting.",
            "Fraudulent sender domain and URL.",
            "Urgent action demanded.",
            "All of the above."
        ],
        correctAnswer: 3,
        hint: "Phishing combines urgency with deceptive URLs.",
        explanation: "Fake domain, unencrypted HTTP link, generic greeting, and false urgency. All are classic signs.",
        reward: 500,
        inspectData: {
            "headers": "X-Originating-IP: 185.15.xx.xx (suspicious proxy)\nDKIM-Signature: FAIL",
            "url": "Resolved URL: http://192.168.x.x/payload.exe (MALWARE DETECTED)",
            "sender": "Domain registered 2 days ago. Registrar: Unknown."
        }
    },
    {
        id: "mission-2",
        title: "CASE 02: Auth Defense",
        description: "Select the most secure master password option to prevent a brute-force breach.",
        scenario: "System Prompt:\nENTER NEW MASTER PASSWORD.\nREQUIREMENTS: Strong resistance to dictionary attacks.",
        options: [
            "Admin_2026!",
            "CorrectHorseBatteryStaple",
            "c@tB0ard$kYw@lk3r99",
            "P@ssw0rd123"
        ],
        correctAnswer: 2,
        hint: "Avoid dictionary words completely. Mix case, numbers, symbols.",
        explanation: "High entropy, no dictionary words, sufficient length. Immune to standard dictionary attacks.",
        reward: 1000,
        inspectData: {
            "admin": "Length: 11. Est. crack time: 2 hours.",
            "correcthorse": "Length: 25. Dictionary words: 4. Est crack time: 50 years.",
            "catboard": "Length: 19. High entropy. No dictionary words. Est crack time: 2 trillion years.",
            "password": "Found in top 100 common passwords leak."
        }
    },
    {
        id: "mission-3",
        title: "CASE 03: Crypto Analysis",
        description: "Decrypt the intercepted message. Cipher detected: Caesar Shift +3.",
        scenario: "INTERCEPTED TRANSMISSION:\nCIPHERTEXT: KHOOR ZRUOG",
        options: [
            "HELLO WORLD",
            "HACKER SPACE",
            "SECURE COMMS",
            "CYBER QUEST"
        ],
        correctAnswer: 0,
        hint: "Shift +3 means move 3 spaces backward to decode (e.g., D becomes A).",
        explanation: "K(-3)=H, H(-3)=E, O(-3)=L, R(-3)=O. ZRUOG translates to WORLD.",
        reward: 1500,
        inspectData: {
            "cipher": "Algorithm: Substitution. Type: Caesar Shift. Offset: +3.",
            "khoor": "Shift -3 applied -> H E L L O",
            "zruog": "Shift -3 applied -> W O R L D"
        }
    },
    {
        id: "mission-4",
        title: "CASE 04: Log Audit",
        description: "Review firewall logs. Identify the entry indicating a potential attack.",
        scenario: "FIREWALL LOG EXCERPT:\n[10:14:01] 192.168.1.45 -> 10.0.0.5:443 (Allowed)\n[10:14:05] 192.168.1.12 -> 10.0.0.8:80 (Allowed)\n[10:14:08] 203.0.113.42 -> 10.0.0.5:22 (500 failed logins in 60s)\n[10:14:15] 10.0.0.5 -> 8.8.8.8:53 (Allowed)",
        options: [
            "HTTPS on port 443.",
            "HTTP on port 80.",
            "500 failed logins on port 22.",
            "DNS query to 8.8.8.8."
        ],
        correctAnswer: 2,
        hint: "High failure rate on remote administration ports (SSH).",
        explanation: "500 failed logins in 60s on Port 22 indicates an active SSH brute-force attack.",
        reward: 2000,
        inspectData: {
            "port 443": "Standard HTTPS web traffic. Normal volume.",
            "port 80": "Standard HTTP web traffic. Normal volume.",
            "port 22": "SSH Protocol. Critical alert: Anomalous login failure rate.",
            "203.0.113.42": "IP flagged in external Threat Intel feeds. Origin: Proxy network."
        }
    }
];

const INITIAL_TIME = 600;
const INITIAL_HINTS = 3;

let gameState = {
    score: 0,
    currentMissionIndex: 0,
    unlockedIndex: 0,
    completedMissions: [],
    hintsRemaining: INITIAL_HINTS,
    timeLeft: INITIAL_TIME,
    timerInterval: null,
    isGameOver: false,
    timerStarted: false,
    soundEnabled: false
};

// Audio Context (Mocked for browser safety without external assets)
const playBeep = (type = 'keypress') => {
    if (!gameState.soundEnabled) return;
    try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        if (type === 'keypress') { osc.frequency.value = 800; gain.gain.value = 0.05; osc.start(); osc.stop(ctx.currentTime + 0.05); }
        if (type === 'success') { osc.frequency.value = 1200; gain.gain.value = 0.1; osc.start(); osc.stop(ctx.currentTime + 0.1); }
        if (type === 'error') { osc.frequency.value = 300; gain.gain.value = 0.1; osc.type = 'square'; osc.start(); osc.stop(ctx.currentTime + 0.2); }
    } catch (e) {}
};

// DOM
const dashboardView = document.getElementById('dashboard-view');
const gameView = document.getElementById('game-view');
const resultView = document.getElementById('result-view');
const missionsGrid = document.getElementById('missions-grid');

const navScore = document.getElementById('nav-score');
const navBestScore = document.getElementById('nav-best-score');
const navHints = document.getElementById('nav-hints');
const navTime = document.getElementById('nav-time');

const missionProgress = document.getElementById('mission-progress');
const missionTitle = document.getElementById('mission-title');
const missionDesc = document.getElementById('mission-desc');
const missionScenario = document.getElementById('mission-scenario');
const gameReward = document.getElementById('game-reward');
const optionsContainer = document.getElementById('options-container');
const hintContainer = document.getElementById('hint-container');
const hintText = document.getElementById('hint-text');
const feedbackContainer = document.getElementById('feedback-container');
const feedbackTitle = document.getElementById('feedback-title');
const feedbackText = document.getElementById('feedback-text');

const startMissionBtn = document.getElementById('start-mission-btn');
const btnHint = document.getElementById('btn-hint');
const btnSubmit = document.getElementById('btn-submit');
const btnNext = document.getElementById('btn-next');
const btnDashboard = document.getElementById('btn-dashboard');
const btnRestart = document.getElementById('btn-restart');

// Terminal Elements
const terminalInput = document.getElementById('terminal-input');
const terminalOutputArea = document.getElementById('terminal-output-area');

let selectedOptionIndex = null;

document.addEventListener('DOMContentLoaded', () => {
    loadBestScore();
    initDashboard();

    document.getElementById('toggle-sound').addEventListener('click', () => {
        gameState.soundEnabled = !gameState.soundEnabled;
        document.querySelector('.btn-text').textContent = `AUDIO: ${gameState.soundEnabled ? 'ON' : 'OFF'}`;
    });

    startMissionBtn.addEventListener('click', () => {
        playBeep('keypress');
        if (!gameState.timerStarted) startGlobalTimer();
        startGame(gameState.unlockedIndex);
    });

    btnHint.addEventListener('click', () => { playBeep('keypress'); showHint(); });
    btnSubmit.addEventListener('click', () => { submitAnswer(); });
    btnNext.addEventListener('click', () => { playBeep('keypress'); loadNextMission(); });
    btnDashboard.addEventListener('click', () => { playBeep('keypress'); returnToDashboard(); });
    btnRestart.addEventListener('click', () => { playBeep('keypress'); resetGameEntirely(); });

    // Terminal Input
    terminalInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            const cmd = terminalInput.value.trim();
            if (cmd) {
                playBeep('keypress');
                handleTerminalCommand(cmd);
                terminalInput.value = '';
                // scroll to bottom
                terminalOutputArea.scrollTop = terminalOutputArea.scrollHeight;
            }
        }
    });
});

function loadBestScore() {
    const best = localStorage.getItem('cyberQuestBestScore');
    navBestScore.textContent = best ? best.padStart(4, '0') : "0000";
}

function saveBestScore() {
    const best = parseInt(localStorage.getItem('cyberQuestBestScore') || '0', 10);
    if (gameState.score > best) {
        localStorage.setItem('cyberQuestBestScore', gameState.score.toString());
        loadBestScore();
    }
}

function updateNavStats() {
    navScore.textContent = gameState.score.toString().padStart(4, '0');
    navHints.textContent = gameState.hintsRemaining;
    updateTimeline();
}

function updateTimeline() {
    const timelineList = document.getElementById('timeline-list');
    if (!timelineList) return;
    const items = timelineList.querySelectorAll('.timeline-item');
    items.forEach((item, idx) => {
        item.className = 'timeline-item';
        if (gameState.completedMissions.includes(idx)) item.classList.add('completed');
        else if (idx === gameState.currentMissionIndex && gameView.classList.contains('hidden') === false) item.classList.add('active');
    });
}

function startGlobalTimer() {
    gameState.timerStarted = true;
    gameState.timerInterval = setInterval(() => {
        if (gameState.timeLeft > 0) {
            gameState.timeLeft--;
            updateTimerDisplay();
        } else {
            endGame("timeout");
        }
    }, 1000);
}

function stopGlobalTimer() {
    if (gameState.timerInterval) {
        clearInterval(gameState.timerInterval);
        gameState.timerInterval = null;
    }
}

function updateTimerDisplay() {
    const m = Math.floor(gameState.timeLeft / 60);
    const s = gameState.timeLeft % 60;
    navTime.textContent = `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    
    if (gameState.timeLeft <= 60) navTime.classList.add('warning');
    else navTime.classList.remove('warning');
}

function initDashboard() {
    updateNavStats();
    updateTimerDisplay();
    missionsGrid.innerHTML = '';

    missionsData.forEach((mission, index) => {
        const isCompleted = gameState.completedMissions.includes(index);
        const isUnlocked = index <= gameState.unlockedIndex;
        let statusClass = isCompleted ? 'completed' : (isUnlocked ? 'available' : 'locked');
        let statusText = isCompleted ? 'COMPLETED' : (isUnlocked ? 'AVAILABLE' : 'LOCKED');

        const card = document.createElement('div');
        card.className = `mission-row ${statusClass}`;
        card.innerHTML = `
            <div class="mission-info">
                <h4>${mission.title}</h4>
                <p>Reward: ${mission.reward} XP</p>
            </div>
            <div class="status-badge ${statusClass}">${statusText}</div>
        `;
        if (isUnlocked && !gameState.isGameOver) {
            card.addEventListener('click', () => {
                playBeep('keypress');
                if (!gameState.timerStarted) startGlobalTimer();
                startGame(index);
            });
        }
        missionsGrid.appendChild(card);
    });

    if (gameState.isGameOver) {
        startMissionBtn.textContent = "OPERATION CONCLUDED";
        startMissionBtn.disabled = true;
    } else if (gameState.completedMissions.length === missionsData.length) {
        startMissionBtn.textContent = "VIEW FINAL DEBRIEF";
        startMissionBtn.onclick = () => endGame("completed");
    } else {
        startMissionBtn.textContent = "AUTHORIZE OPERATION";
        startMissionBtn.disabled = false;
        startMissionBtn.onclick = () => {
            playBeep('keypress');
            if (!gameState.timerStarted) startGlobalTimer();
            startGame(gameState.unlockedIndex);
        };
    }
}

function startGame(missionIndex) {
    gameState.currentMissionIndex = missionIndex;
    dashboardView.classList.add('hidden');
    resultView.classList.add('hidden');
    gameView.classList.remove('hidden');
    updateTimeline();
    renderMission();
}

function returnToDashboard() {
    gameView.classList.add('hidden');
    dashboardView.classList.remove('hidden');
    updateTimeline();
    initDashboard();
}

function renderMission() {
    const mission = missionsData[gameState.currentMissionIndex];
    selectedOptionIndex = null;

    missionProgress.textContent = `0${gameState.currentMissionIndex + 1}/04`;
    missionTitle.textContent = mission.title;
    missionDesc.textContent = mission.description;
    
    // Typewriter effect for scenario
    missionScenario.innerHTML = '';
    let i = 0;
    function typeScenario() {
        if (i < mission.scenario.length && !gameView.classList.contains('hidden') && gameState.currentMissionIndex === missionsData.indexOf(mission)) {
            missionScenario.textContent += mission.scenario.charAt(i);
            i++;
            setTimeout(typeScenario, 10);
        }
    }
    typeScenario();

    gameReward.textContent = `${mission.reward} XP`;
    hintText.textContent = mission.hint;

    // Reset Terminal
    terminalOutputArea.innerHTML = `<div class="term-line">> Connected to Investigation Node 0${gameState.currentMissionIndex + 1}</div>
    <div class="term-line">> Type 'help' to list commands. Type 'inspect <target>' to analyze evidence.</div>`;

    hintContainer.classList.add('hidden');
    feedbackContainer.classList.add('hidden');
    feedbackContainer.className = 'feedback-box hidden';
    btnSubmit.disabled = true;
    btnSubmit.classList.remove('hidden');
    btnNext.classList.add('hidden');
    
    const isCompleted = gameState.completedMissions.includes(gameState.currentMissionIndex);
    btnHint.disabled = (isCompleted || gameState.hintsRemaining <= 0);
    btnHint.classList.remove('hidden');

    optionsContainer.innerHTML = '';
    mission.options.forEach((optText, index) => {
        const btn = document.createElement('button');
        btn.className = 'option-btn';
        btn.textContent = optText;
        if (isCompleted) {
            btn.disabled = true;
            if (index === mission.correctAnswer) btn.classList.add('correct');
        } else {
            btn.addEventListener('click', () => { playBeep('keypress'); selectOption(index, btn); });
        }
        optionsContainer.appendChild(btn);
    });

    if (isCompleted) {
        btnSubmit.classList.add('hidden');
        btnHint.classList.add('hidden');
        showFeedback(true, true);
        checkIfHasNext();
    }
}

function handleTerminalCommand(cmd) {
    printToTerminal(`root@soc:~# ${cmd}`, 'cmd');
    const parts = cmd.toLowerCase().split(' ');
    const baseCmd = parts[0];
    const target = parts.slice(1).join(' ');
    const mission = missionsData[gameState.currentMissionIndex];

    setTimeout(() => {
        switch(baseCmd) {
            case 'help':
                printToTerminal("COMMANDS: help, status, objectives, inspect [target], clear");
                break;
            case 'clear':
                terminalOutputArea.innerHTML = '';
                break;
            case 'status':
                printToTerminal(`OP_STATUS: ACTIVE | UPTIME: ${INITIAL_TIME - gameState.timeLeft}s`);
                break;
            case 'objectives':
                printToTerminal(`CURRENT_OBJ: ${mission.description}`);
                break;
            case 'inspect':
                if (!target) {
                    printToTerminal("ERR: target required. Try inspecting words found in the evidence.", 'error');
                } else {
                    let found = false;
                    for (const [key, val] of Object.entries(mission.inspectData)) {
                        if (target.includes(key) || key.includes(target)) {
                            printToTerminal(`[ANALYSIS] ${key.toUpperCase()}:`, 'success');
                            printToTerminal(`  ${val}`);
                            found = true;
                            break;
                        }
                    }
                    if (!found) printToTerminal(`ERR: No data found for target '${target}'.`, 'error');
                }
                break;
            default:
                printToTerminal(`ERR: Unknown command '${baseCmd}'`, 'error');
        }
        terminalOutputArea.scrollTop = terminalOutputArea.scrollHeight;
    }, 200);
}

function printToTerminal(text, className = '') {
    const div = document.createElement('div');
    div.className = `term-line ${className}`;
    div.textContent = text;
    terminalOutputArea.appendChild(div);
}

function selectOption(index, btnElement) {
    selectedOptionIndex = index;
    const allOptions = document.querySelectorAll('.option-btn');
    allOptions.forEach(btn => btn.classList.remove('selected'));
    btnElement.classList.add('selected');
    btnSubmit.disabled = false;
}

function showHint() {
    if (gameState.hintsRemaining > 0) {
        gameState.hintsRemaining--;
        updateNavStats();
        hintContainer.classList.remove('hidden');
        btnHint.disabled = true;
    }
}

function submitAnswer() {
    if (selectedOptionIndex === null) return;
    const mission = missionsData[gameState.currentMissionIndex];
    const isCorrect = selectedOptionIndex === mission.correctAnswer;
    const allOptions = document.querySelectorAll('.option-btn');

    allOptions.forEach((btn, idx) => {
        btn.disabled = true;
        if (idx === mission.correctAnswer) btn.classList.add('correct');
        else if (idx === selectedOptionIndex && !isCorrect) btn.classList.add('incorrect');
    });

    btnSubmit.classList.add('hidden');
    btnHint.classList.add('hidden');
    
    if (isCorrect) {
        playBeep('success');
        if (!gameState.completedMissions.includes(gameState.currentMissionIndex)) {
            gameState.score += mission.reward;
            gameState.completedMissions.push(gameState.currentMissionIndex);
            if (gameState.unlockedIndex === gameState.currentMissionIndex && gameState.unlockedIndex < missionsData.length - 1) {
                gameState.unlockedIndex++;
            }
            updateNavStats();
        }
        showFeedback(true, false);
    } else {
        playBeep('error');
        if (!gameState.completedMissions.includes(gameState.currentMissionIndex)) {
            gameState.score = Math.max(0, gameState.score - 100);
            updateNavStats();
        }
        showFeedback(false, false);
    }
    checkIfHasNext();
}

function showFeedback(isCorrect, isReview) {
    const mission = missionsData[gameState.currentMissionIndex];
    feedbackContainer.classList.remove('hidden');
    
    if (isCorrect) {
        feedbackContainer.className = 'feedback-box success';
        feedbackTitle.textContent = isReview ? "[DEBRIEF LOGGED]" : "[DECISION CORRECT - ACCESS GRANTED]";
        feedbackText.textContent = mission.explanation;
    } else {
        feedbackContainer.className = 'feedback-box error';
        feedbackTitle.textContent = "[DECISION INCORRECT - 100 XP DEDUCTED]";
        feedbackText.textContent = `Security Audit Failed. ${mission.explanation}`;
    }
}

function checkIfHasNext() {
    if (gameState.currentMissionIndex < missionsData.length - 1 && gameState.unlockedIndex > gameState.currentMissionIndex) {
        btnNext.classList.remove('hidden');
        btnNext.textContent = "NEXT PHASE";
    } else if (gameState.completedMissions.length === missionsData.length) {
        btnNext.classList.remove('hidden');
        btnNext.textContent = "VIEW DEBRIEF";
    } else {
        btnNext.classList.remove('hidden');
        btnNext.textContent = "RETURN TO DASHBOARD";
    }
}

function loadNextMission() {
    if (gameState.completedMissions.length === missionsData.length) endGame("completed");
    else if (gameState.currentMissionIndex < missionsData.length - 1 && gameState.unlockedIndex > gameState.currentMissionIndex) startGame(gameState.currentMissionIndex + 1);
    else returnToDashboard();
}

function endGame(reason) {
    stopGlobalTimer();
    gameState.isGameOver = true;
    saveBestScore();

    dashboardView.classList.add('hidden');
    gameView.classList.add('hidden');
    resultView.classList.remove('hidden');

    document.getElementById('result-score').textContent = gameState.score.toString().padStart(4, '0');
    document.getElementById('result-completed').textContent = `${gameState.completedMissions.length}/${missionsData.length}`;
    
    const m = Math.floor(gameState.timeLeft / 60);
    const s = gameState.timeLeft % 60;
    document.getElementById('result-time').textContent = `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;

    if (reason === "timeout") {
        document.getElementById('result-title').textContent = "SYSTEM LOCKOUT";
        document.getElementById('result-message').textContent = "Time expired. The network administrators detected your presence.";
        document.querySelector('.result-icon').style.stroke = "var(--neon-red)";
    } else {
        document.getElementById('result-title').textContent = "OPERATION SUCCESSFUL";
        document.getElementById('result-message').textContent = `Excellent work. You successfully investigated ${gameState.completedMissions.length} cases.`;
        document.querySelector('.result-icon').style.stroke = "var(--neon-green)";
    }
}

function resetGameEntirely() {
    stopGlobalTimer();
    const currentSound = gameState.soundEnabled;
    gameState = {
        score: 0,
        currentMissionIndex: 0,
        unlockedIndex: 0,
        completedMissions: [],
        hintsRemaining: INITIAL_HINTS,
        timeLeft: INITIAL_TIME,
        timerInterval: null,
        isGameOver: false,
        timerStarted: false,
        soundEnabled: currentSound
    };
    
    resultView.classList.add('hidden');
    dashboardView.classList.remove('hidden');
    initDashboard();
}
