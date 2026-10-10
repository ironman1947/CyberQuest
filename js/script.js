const missionsData = [
    {
        id: "mission-1",
        title: "Mission 01: Phishing Detective",
        description: "Analyze the intercepted communication and identify the primary indicator of compromise.",
        scenario: "From: security@paypal-support-urgent.com\nTo: admin@cyberquest.net\nDate: Oct 10, 2026\nSubject: URGENT: Your Account Will Be Suspended\n\nDear Customer,\nWe detected suspicious logins on your account. To prevent immediate suspension, you must verify your identity within 2 hours.\n\nClick here to verify: http://secure-auth-paypal.com/login\n\nFailure to comply will result in account deletion.\n- Security Team",
        options: [
            "The email uses a generic greeting ('Dear Customer').",
            "The sender's domain and the verification link are fraudulent.",
            "The email demands urgent action within 2 hours.",
            "All of the above."
        ],
        correctAnswer: 3,
        hint: "Phishing attacks often combine a false sense of urgency with deceptive URLs that mimic legitimate services.",
        explanation: "This is a classic phishing attack. It uses a fake sender domain (paypal-support-urgent.com), an unencrypted fraudulent link (http://secure-auth-paypal.com), a generic greeting, and false urgency to panic the victim into revealing credentials. Therefore, all options are correct.",
        reward: 500,
        icon: '<svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>'
    },
    {
        id: "mission-2",
        title: "Mission 02: Password Guardians",
        description: "The mainframe needs a new master override password. Select the most secure option to prevent a brute-force breach.",
        scenario: "System Prompt:\nENTER NEW MASTER PASSWORD.\nREQUIREMENTS: Strong resistance to dictionary attacks and brute-force tools.",
        options: [
            "Admin_2026!",
            "CorrectHorseBatteryStaple",
            "c@tB0ard$kYw@lk3r99",
            "P@ssw0rd123"
        ],
        correctAnswer: 2,
        hint: "A strong password avoids common dictionary words entirely and utilizes a mix of uppercase, lowercase, numbers, and symbols.",
        explanation: "'c@tB0ard$kYw@lk3r99' is the most secure because it combines multiple character types, does not form predictable dictionary words, and has sufficient length. 'CorrectHorseBatteryStaple' is long but uses common words (susceptible to advanced dictionary attacks). 'Admin_2026!' and 'P@ssw0rd123' are highly predictable.",
        reward: 1000,
        icon: '<svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>'
    },
    {
        id: "mission-3",
        title: "Mission 03: Cipher Breaker",
        description: "We've intercepted encrypted hostile comms. Decrypt the message using a Caesar Cipher with a Shift of 3.",
        scenario: "INTERCEPTED TRANSMISSION:\nENCRYPTION: CAESAR SHIFT +3\n\nCIPHERTEXT: KHOOR ZRUOG",
        options: [
            "HELLO WORLD",
            "HACKER SPACE",
            "SECURE COMMS",
            "CYBER QUEST"
        ],
        correctAnswer: 0,
        hint: "A Caesar Shift of +3 means the original letter was moved 3 spaces forward. To decode, move 3 spaces backward (e.g., D becomes A).",
        explanation: "By shifting each letter back 3 positions in the alphabet, 'K' becomes 'H', 'H' becomes 'E', 'O' becomes 'L', 'O' becomes 'L', and 'R' becomes 'O'. The space remains a space. 'ZRUOG' similarly translates to 'WORLD'.",
        reward: 1500,
        icon: '<svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"></ellipse><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path></svg>'
    },
    {
        id: "mission-4",
        title: "Mission 04: Network Investigator",
        description: "Review the firewall access logs and identify the entry that indicates a potential attack.",
        scenario: "FIREWALL LOG EXCERPT:\n[10:14:01] INFO: 192.168.1.45 -> 10.0.0.5:443 (Allowed)\n[10:14:05] INFO: 192.168.1.12 -> 10.0.0.8:80 (Allowed)\n[10:14:08] WARN: 203.0.113.42 -> 10.0.0.5:22 (500 failed login attempts in 60s)\n[10:14:15] INFO: 10.0.0.5 -> 8.8.8.8:53 (Allowed)",
        options: [
            "The HTTPS connection on port 443.",
            "The HTTP connection on port 80.",
            "The 500 failed login attempts on port 22.",
            "The DNS query to 8.8.8.8 on port 53."
        ],
        correctAnswer: 2,
        hint: "Look for unusually high activity on remote administration ports that indicates guessing credentials.",
        explanation: "500 failed login attempts in 60 seconds on Port 22 (SSH) is a clear indicator of a brute-force attack. The attacker is trying to guess the username and password to gain remote administrative access to the server. The other logs are standard network traffic.",
        reward: 2000,
        icon: '<svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"></path></svg>'
    }
];

const INITIAL_TIME = 600; // 10 minutes in seconds
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
    timerStarted: false
};

// DOM Elements
const dashboardView = document.getElementById('dashboard-view');
const gameView = document.getElementById('game-view');
const resultView = document.getElementById('result-view');
const missionsGrid = document.getElementById('missions-grid');

// Nav Stats
const navScore = document.getElementById('nav-score');
const navBestScore = document.getElementById('nav-best-score');
const navHints = document.getElementById('nav-hints');
const navTime = document.getElementById('nav-time');
const navTimeContainer = navTime.parentElement;

// Game Elements
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

// Buttons
const startMissionBtn = document.getElementById('start-mission-btn');
const terminalOutput = document.getElementById('terminal-output');
const btnHint = document.getElementById('btn-hint');
const btnSubmit = document.getElementById('btn-submit');
const btnNext = document.getElementById('btn-next');
const btnDashboard = document.getElementById('btn-dashboard');
const btnRestart = document.getElementById('btn-restart');

let selectedOptionIndex = null;

document.addEventListener('DOMContentLoaded', () => {
    loadBestScore();
    initDashboard();

    startMissionBtn.addEventListener('click', () => {
        if (!gameState.timerStarted) startGlobalTimer();
        startTerminalSequence(() => startGame(gameState.unlockedIndex));
    });

    btnHint.addEventListener('click', showHint);
    btnSubmit.addEventListener('click', submitAnswer);
    btnNext.addEventListener('click', loadNextMission);
    btnDashboard.addEventListener('click', returnToDashboard);
    btnRestart.addEventListener('click', resetGameEntirely);
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

    if (gameState.timeLeft <= 60) {
        navTimeContainer.classList.add('danger');
        navTimeContainer.classList.remove('warning');
    } else if (gameState.timeLeft <= 180) {
        navTimeContainer.classList.add('warning');
        navTimeContainer.classList.remove('danger');
    } else {
        navTimeContainer.classList.remove('warning', 'danger');
    }
}

function initDashboard() {
    updateNavStats();
    updateTimerDisplay();
    missionsGrid.innerHTML = '';

    missionsData.forEach((mission, index) => {
        const isCompleted = gameState.completedMissions.includes(index);
        const isUnlocked = index <= gameState.unlockedIndex;
        
        let statusClass = 'locked';
        let statusText = 'LOCKED';
        
        if (isCompleted) {
            statusClass = 'completed'; statusText = 'COMPLETED';
        } else if (isUnlocked) {
            statusClass = 'available'; statusText = 'AVAILABLE';
        }

        const card = document.createElement('div');
        card.className = `mission-card ${statusClass}`;
        card.innerHTML = `
            <div class="card-status ${statusClass}">${statusText}</div>
            <div class="card-icon">${mission.icon}</div>
            <h3 class="card-title">${mission.title}</h3>
            <p class="card-desc">${mission.description}</p>
            <div class="card-meta">
                <span>Difficulty: ${['Low', 'Medium', 'High', 'Expert'][index]}</span>
                <span>Reward: ${mission.reward} XP</span>
            </div>
        `;

        if (isUnlocked && !gameState.isGameOver) {
            card.addEventListener('click', () => {
                if (!gameState.timerStarted) startGlobalTimer();
                startGame(index);
            });
        }
        missionsGrid.appendChild(card);
    });

    if (gameState.isGameOver) {
        startMissionBtn.textContent = "SIMULATION ENDED";
        startMissionBtn.disabled = true;
    } else if (gameState.completedMissions.length === missionsData.length) {
        startMissionBtn.textContent = "VIEW FINAL RESULTS";
        startMissionBtn.onclick = () => endGame("completed");
    } else {
        startMissionBtn.textContent = "INITIALIZE MISSION";
        startMissionBtn.disabled = false;
        startMissionBtn.onclick = () => {
            if (!gameState.timerStarted) startGlobalTimer();
            startTerminalSequence(() => startGame(gameState.unlockedIndex));
        };
    }
}

function startTerminalSequence(callback) {
    startMissionBtn.textContent = "INITIALIZING...";
    startMissionBtn.style.pointerEvents = "none";
    let dots = 0;
    terminalOutput.innerHTML = "> Establishing secure connection...";
    terminalOutput.style.color = "var(--success-color)";
    
    const interval = setInterval(() => {
        dots = (dots + 1) % 4;
        terminalOutput.innerHTML = `> Bypassing firewall${'.'.repeat(dots)}`;
    }, 300);

    setTimeout(() => {
        clearInterval(interval);
        terminalOutput.innerHTML = "> Access granted. Initializing environment...";
        setTimeout(() => {
            startMissionBtn.style.pointerEvents = "auto";
            terminalOutput.innerHTML = "> System awaiting input...";
            callback();
        }, 800);
    }, 1500);
}

function startGame(missionIndex) {
    gameState.currentMissionIndex = missionIndex;
    dashboardView.classList.add('hidden');
    resultView.classList.add('hidden');
    gameView.classList.remove('hidden');
    renderMission();
}

function returnToDashboard() {
    gameView.classList.add('hidden');
    dashboardView.classList.remove('hidden');
    initDashboard();
}

function renderMission() {
    const mission = missionsData[gameState.currentMissionIndex];
    selectedOptionIndex = null;

    missionProgress.textContent = `MISSION ${gameState.currentMissionIndex + 1} / ${missionsData.length}`;
    missionTitle.textContent = mission.title;
    missionDesc.textContent = mission.description;
    missionScenario.textContent = mission.scenario;
    gameReward.textContent = `${mission.reward} XP`;
    hintText.textContent = mission.hint;

    hintContainer.classList.add('hidden');
    feedbackContainer.classList.add('hidden');
    feedbackContainer.className = 'feedback-box hidden';
    btnSubmit.disabled = true;
    btnSubmit.classList.remove('hidden');
    btnNext.classList.add('hidden');
    
    const isCompleted = gameState.completedMissions.includes(gameState.currentMissionIndex);
    
    if (isCompleted || gameState.hintsRemaining <= 0) {
        btnHint.disabled = true;
    } else {
        btnHint.disabled = false;
    }
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
            btn.addEventListener('click', () => selectOption(index, btn));
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
        if (idx === mission.correctAnswer) {
            btn.classList.add('correct');
        } else if (idx === selectedOptionIndex && !isCorrect) {
            btn.classList.add('incorrect');
        }
    });

    btnSubmit.classList.add('hidden');
    btnHint.classList.add('hidden');
    
    if (isCorrect) {
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
        // Penalty for incorrect answer
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
        feedbackTitle.textContent = isReview ? "MISSION ACCOMPLISHED" : "ACCESS GRANTED - MISSION ACCOMPLISHED";
        feedbackText.textContent = mission.explanation;
    } else {
        feedbackContainer.className = 'feedback-box error';
        feedbackTitle.textContent = "ACCESS DENIED - INCORRECT RESPONSE (-100 XP)";
        feedbackText.textContent = `Security Breach: Incorrect analysis. ${mission.explanation}`;
    }
}

function checkIfHasNext() {
    if (gameState.currentMissionIndex < missionsData.length - 1 && gameState.unlockedIndex > gameState.currentMissionIndex) {
        btnNext.classList.remove('hidden');
        btnNext.textContent = "PROCEED TO NEXT MISSION";
    } else if (gameState.completedMissions.length === missionsData.length) {
        btnNext.classList.remove('hidden');
        btnNext.textContent = "VIEW FINAL RESULTS";
    } else {
        btnNext.classList.remove('hidden');
        btnNext.textContent = "RETURN TO DASHBOARD";
    }
}

function loadNextMission() {
    if (gameState.completedMissions.length === missionsData.length) {
        endGame("completed");
    } else if (gameState.currentMissionIndex < missionsData.length - 1 && gameState.unlockedIndex > gameState.currentMissionIndex) {
        startGame(gameState.currentMissionIndex + 1);
    } else {
        returnToDashboard();
    }
}

function endGame(reason) {
    stopGlobalTimer();
    gameState.isGameOver = true;
    saveBestScore();

    dashboardView.classList.add('hidden');
    gameView.classList.add('hidden');
    resultView.classList.remove('hidden');

    const resultTitle = document.getElementById('result-title');
    const resultMessage = document.getElementById('result-message');
    const resultIcon = document.querySelector('.result-icon');

    document.getElementById('result-score').textContent = gameState.score.toString().padStart(4, '0');
    document.getElementById('result-completed').textContent = `${gameState.completedMissions.length}/${missionsData.length}`;
    
    const m = Math.floor(gameState.timeLeft / 60);
    const s = gameState.timeLeft % 60;
    document.getElementById('result-time').textContent = `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;

    if (reason === "timeout") {
        resultTitle.textContent = "SYSTEM LOCKOUT";
        resultMessage.textContent = "Time expired. The network administrators have detected your presence and locked you out.";
        resultIcon.classList.add('failed');
        resultIcon.innerHTML = `<svg viewBox="0 0 24 24" width="80" height="80" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>`;
    } else {
        resultTitle.textContent = "SIMULATION COMPLETE";
        resultMessage.textContent = `Excellent work, Operative. You successfully navigated the network and completed ${gameState.completedMissions.length} out of ${missionsData.length} objectives.`;
        resultIcon.classList.remove('failed');
        resultIcon.innerHTML = `<svg viewBox="0 0 24 24" width="80" height="80" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>`;
    }
}

function resetGameEntirely() {
    stopGlobalTimer();
    gameState = {
        score: 0,
        currentMissionIndex: 0,
        unlockedIndex: 0,
        completedMissions: [],
        hintsRemaining: INITIAL_HINTS,
        timeLeft: INITIAL_TIME,
        timerInterval: null,
        isGameOver: false,
        timerStarted: false
    };
    
    navTimeContainer.classList.remove('warning', 'danger');
    resultView.classList.add('hidden');
    dashboardView.classList.remove('hidden');
    initDashboard();
}
