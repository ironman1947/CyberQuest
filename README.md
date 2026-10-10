# CyberQuest 🚀

CyberQuest is an immersive, browser-based cybersecurity escape room built entirely with Vanilla web technologies. Test your skills through interactive puzzles ranging from phishing detection to network log analysis, all presented in a sleek, retro-futuristic "Cyber" dashboard. 

### 🏆 Team: Ghost Protocol
- **Om Sivaleeshraman**
- **Partil**
- **Vedant Sahoo**

---

## 🎯 Objectives
- **Educational Gameplay:** Teach fundamental cybersecurity concepts (Phishing, Password Strength, Cryptography, Network Analysis) in an engaging, gamified format.
- **Zero-Dependency Security:** Run entirely on the client-side without external dependencies, backend APIs, or databases to ensure maximum privacy and security.
- **Rich User Experience:** Deliver a visually stunning "dark mode" neon interface with micro-animations, mimicking a real terminal and hacker dashboard.

## ✨ Features
- **4 Connected Missions:** Unlocking sequentially upon successful completion.
- **Dynamic Scoring & Global Timer:** A 10-minute countdown, XP rewards, penalty deductions, and limited hints.
- **Persistent High Scores:** Utilizes browser `localStorage` to save your best score securely.
- **Responsive Design:** Fully playable on both desktop and mobile devices.

## 🛠️ Technologies Used
- **HTML5:** Semantic structure.
- **CSS3:** Custom variables, grid/flexbox layouts, glassmorphism, and keyframe animations.
- **Vanilla JavaScript (ES6+):** Complete game state management, DOM manipulation, and interactive logic. No frameworks required.

---

## 🚀 Setup Instructions

Since CyberQuest is a completely static frontend application without a backend, it is incredibly simple to run.

### How to run locally:
1. Clone or download this repository.
2. Navigate to the project folder.
3. Double-click the `index.html` file to open it directly in your default web browser.
*(Alternatively, you can use any local development server like VSCode Live Server or `npx serve` to host it locally).*

## 🎮 Gameplay Instructions
1. Open the game in your browser to view the **Gaming Dashboard**.
2. Click **INITIALIZE MISSION** to start the global timer and begin Mission 1.
3. Read the intercepted scenario and select the most appropriate answer from the multiple choices.
4. Use the **REQUEST HINT** button wisely—you only have 3 for the entire game!
5. Submit your answer. Correct answers unlock the next mission and grant XP. Incorrect answers deduct 100 XP.
6. Race against the 10-minute clock to complete all 4 missions and maximize your score!

---

## 📸 Screenshots
*(Add images here by placing them in your project folder and linking them like below)*
- `![Dashboard](screenshot-dashboard.png)`
- `![Mission View](screenshot-mission.png)`
- `![Results Screen](screenshot-results.png)`
