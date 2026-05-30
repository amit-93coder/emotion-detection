// DOM Elements
const elements = {
    video: document.getElementById('video'),
    canvas: document.getElementById('canvas'),
    startBtn: document.getElementById('start-btn'),
    stopBtn: document.getElementById('stop-btn'),
    moodDisplay: document.getElementById('mood-display'),
    emojiDisplay: document.getElementById('emoji-display'),
    scoresContainer: document.getElementById('scores-container'),
    moodHistory: document.getElementById('mood-history'),
    moodQuote: document.getElementById('mood-quote'),
    liveIndicator: document.getElementById('live-indicator'),
    captureBtn: document.getElementById('capture-btn'),
    shareBtn: document.getElementById('share-btn'),
    clearBtn: document.getElementById('clear-history'),
    downloadBtn: document.getElementById('download-history'),
    detectionOverlay: document.getElementById('detection-overlay'),
    scannerLine: document.getElementById('scanner-line'),
    statusText: document.getElementById('status-text'),
    serverStatus: document.getElementById('server-status'),
    settingsBtn: document.getElementById('settings-btn'),
    settingsModal: document.getElementById('settings-modal'),
    closeModalBtn: document.getElementById('close-modal'),
    speechToggle: document.getElementById('speech-toggle'),
    intervalSelect: document.getElementById('interval-select'),
    themeSelect: document.getElementById('theme-select'),
    happyCountEl: document.getElementById('happy-count'),
    sadCountEl: document.getElementById('sad-count'),
    neutralCountEl: document.getElementById('neutral-count'),
    angryCountEl: document.getElementById('angry-count'),
    surpriseCountEl: document.getElementById('surprise-count'),
    fearCountEl: document.getElementById('fear-count'),
    streakEmojiEl: document.getElementById('streak-emoji'),
    streakTextEl: document.getElementById('streak-text'),
    suggestionsListEl: document.getElementById('suggestions-list'),
    badgeEmojiEl: document.getElementById('badge-emoji'),
    badgeTextEl: document.getElementById('badge-text'),
    cameraPlaceholder: document.getElementById('camera-placeholder'),
    videoContainer: document.querySelector('.video-container')
};

// Configuration
const API_URL = "https://emotion-detection-navy.vercel.app";
const emotionEmojis = {
    happy: "😊",
    sad: "😢",
    neutral: "😐",
    angry: "😠",
    surprise: "😲",
    fear: "😨"
};

const emotionQuotes = {
    happy: [
        "Happiness is not something ready made. It comes from your own actions.",
        "The best way to cheer yourself up is to try to cheer someone else up.",
        "Happiness is a choice. You can choose to be happy.",
        "Smile, it's the key that fits the lock on everyone's heart.",
        "Every day is a new beginning. Take a deep breath and start again."
    ],
    sad: [
        "Tears are words that need to be written.",
        "Every human walks around with a certain kind of sadness.",
        "The word 'happy' would lose its meaning if it were not balanced by sadness.",
        "It's okay to not be okay. Take your time to heal.",
        "Rainbows always come after the storm."
    ],
    neutral: [
        "Peace comes from within. Do not seek it without.",
        "Stay calm and carry on.",
        "Sometimes you just need to be neutral to find balance.",
        "Breathe in, breathe out, and be present in the moment.",
        "Center yourself and stay grounded."
    ],
    angry: [
        "When angry, count to ten before you speak. If very angry, count to one hundred.",
        "Anger is an acid that can do more harm to the vessel in which it is stored than to anything on which it is poured.",
        "For every minute you remain angry, you give up sixty seconds of peace of mind.",
        "Holding onto anger is like drinking poison and expecting the other person to get sick.",
        "Take a moment. You don't have to respond to everything immediately."
    ],
    surprise: [
        "Expect the unexpected, and life becomes an exciting adventure!",
        "Surprises are the spice of life!",
        "Life is full of unexpected twists and turns. Embrace them!",
        "The best things in life are unexpected.",
        "Wow! That's quite a surprise!"
    ],
    fear: [
        "The only thing we have to fear is fear itself.",
        "Courage is not the absence of fear, but the triumph over it.",
        "Face your fears, and they will disappear.",
        "Take a deep breath. You're safe and secure.",
        "You are stronger than your fears."
    ]
};

const activitySuggestions = {
    happy: [
        "🎉 Call a friend and share your happiness!",
        "🎵 Dance to your favorite upbeat song!",
        "✨ Write down what made you happy today!",
        "🎁 Treat yourself to something special!"
    ],
    sad: [
        "🧘 Try some deep breathing exercises",
        "☕ Make yourself a warm cup of tea",
        "📖 Read a comforting book or watch a feel-good movie",
        "🌳 Take a short walk in nature"
    ],
    neutral: [
        "🎨 Try a new hobby or creative activity",
        "🧠 Learn something new today!",
        "📝 Plan your week ahead",
        "🤝 Connect with someone you haven't talked to in a while"
    ],
    angry: [
        "🧘 Do 10 minutes of meditation",
        "🏃 Go for a quick run or walk to cool down",
        "🎨 Draw or write about what's bothering you",
        "🎵 Listen to calming music"
    ],
    surprise: [
        "📸 Capture the moment!",
        "💭 Journal about what surprised you",
        "🎉 Embrace the unexpected!",
        "🤔 Reflect on what you learned"
    ],
    fear: [
        "🧘 Take deep breaths - you're safe",
        "🏠 Find a comfortable spot to relax",
        "🗣️ Talk to someone you trust",
        "💪 Focus on your senses"
    ]
};

// State
let stream = null;
let detectionInterval = null;
let history = [];
let isDetecting = false;
let isProcessing = false;
let speechEnabled = true;
let detectionIntervalMs = 800;
let currentEmotion = null;
let streakEmotion = null;
let streakCount = 0;

// Utility Functions
function getTodayDateKey() {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
}

function getRandomItem(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

// Theme Functions
function loadTheme() {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    applyTheme(savedTheme);
    if (elements.themeSelect) {
        elements.themeSelect.value = savedTheme;
    }
}

function applyTheme(theme) {
    document.documentElement.removeAttribute('data-theme');
    if (theme !== 'dark') {
        document.documentElement.setAttribute('data-theme', theme);
    }
}

function saveTheme(theme) {
    localStorage.setItem('theme', theme);
}

// Settings Functions
function loadSettings() {
    loadTheme();
    const savedSpeech = localStorage.getItem('speechEnabled');
    if (savedSpeech !== null) {
        speechEnabled = savedSpeech === 'true';
        elements.speechToggle.checked = speechEnabled;
    }
    const savedInterval = localStorage.getItem('detectionInterval');
    if (savedInterval) {
        detectionIntervalMs = parseInt(savedInterval);
        elements.intervalSelect.value = savedInterval;
    }
}

function saveSettings() {
    localStorage.setItem('speechEnabled', speechEnabled);
    localStorage.setItem('detectionInterval', detectionIntervalMs);
}

// History Functions
function loadHistory() {
    const saved = localStorage.getItem('mood_history');
    if (saved) {
        history = JSON.parse(saved);
        renderHistory();
        updateDailySummary();
        if (history.length > 0) {
            updateStreak(history[0].emotion);
            updateSuggestions(history[0].emotion);
        }
    }
}

function saveHistory() {
    localStorage.setItem('mood_history', JSON.stringify(history));
}

function renderHistory() {
    if (history.length === 0) {
        elements.moodHistory.innerHTML = `<li class="history-item"><span class="no-history">No history yet. Start detecting!</span></li>`;
        return;
    }
    elements.moodHistory.innerHTML = history.map(item => `
        <li class="history-item">
            <span>${emotionEmojis[item.emotion] || ""} ${item.emotion.charAt(0).toUpperCase() + item.emotion.slice(1)}</span>
            <span class="history-time">${item.date || ""} ${item.time}</span>
        </li>
    `).join('');
}

function addToHistory(emotion) {
    if (history.length > 0 && history[0].emotion === emotion) return;
    const now = new Date();
    const dateKey = getTodayDateKey();
    const time = now.getHours().toString().padStart(2, '0') + ":" + 
                 now.getMinutes().toString().padStart(2, '0') + ":" + 
                 now.getSeconds().toString().padStart(2, '0');
    
    history.unshift({ emotion, time, date: dateKey });
    if (history.length > 50) history.pop(); 
    
    renderHistory();
    saveHistory();
    updateDailySummary();
    updateStreak(emotion);
}

// UI Update Functions
function updateDailySummary() {
    const today = getTodayDateKey();
    const todayHistory = history.filter(item => item.date === today);
    const counts = { happy: 0, sad: 0, neutral: 0, angry: 0, surprise: 0, fear: 0 };
    
    todayHistory.forEach(item => {
        if (counts[item.emotion] !== undefined) {
            counts[item.emotion]++;
        }
    });
    
    elements.happyCountEl.textContent = counts.happy;
    elements.sadCountEl.textContent = counts.sad;
    elements.neutralCountEl.textContent = counts.neutral;
    elements.angryCountEl.textContent = counts.angry;
    elements.surpriseCountEl.textContent = counts.surprise;
    elements.fearCountEl.textContent = counts.fear;
    
    updateBadge(counts);
}

function updateBadge(counts) {
    let maxEmotion = null;
    let maxCount = 0;
    Object.entries(counts).forEach(([emotion, count]) => {
        if (count > maxCount) {
            maxEmotion = emotion;
            maxCount = count;
        }
    });
    
    if (maxEmotion && maxCount > 0) {
        elements.badgeEmojiEl.textContent = emotionEmojis[maxEmotion];
        elements.badgeTextEl.textContent = `${maxEmotion.charAt(0).toUpperCase() + maxEmotion.slice(1)} (${maxCount}x)`;
    } else {
        elements.badgeEmojiEl.textContent = "🏆";
        elements.badgeTextEl.textContent = "Check back later!";
    }
}

function updateStreak(emotion) {
    if (streakEmotion === emotion) {
        streakCount++;
    } else {
        streakEmotion = emotion;
        streakCount = 1;
    }
    elements.streakEmojiEl.textContent = emotionEmojis[emotion] || "✨";
    elements.streakTextEl.innerHTML = `<h3>${streakCount} in a row!</h3><p class="streak-subtitle">Keep it going!</p>`;
}

function updateSuggestions(emotion) {
    const suggestions = activitySuggestions[emotion] || activitySuggestions.neutral;
    const selectedSuggestions = [];
    const usedIndices = new Set();
    while (selectedSuggestions.length < 3 && selectedSuggestions.length < suggestions.length) {
        const idx = Math.floor(Math.random() * suggestions.length);
        if (!usedIndices.has(idx)) {
            usedIndices.add(idx);
            selectedSuggestions.push(suggestions[idx]);
        }
    }
    elements.suggestionsListEl.innerHTML = selectedSuggestions.map(suggestion => 
        `<div class="suggestion-item">${suggestion}</div>`
    ).join('');
}

function updateQuote(emotion) {
    const quotes = emotionQuotes[emotion] || emotionQuotes.neutral;
    const quote = getRandomItem(quotes);
    elements.moodQuote.innerHTML = `<p class="quote-text">${quote}</p>`;
}

function speak(text) {
    if (!speechEnabled || !('speechSynthesis' in window)) return;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1;
    speechSynthesis.speak(utterance);
}

function updateUI(emotion, scores, intensity) {
    if (history.length === 0 || history[0].emotion !== emotion) {
        speak(`You look ${emotion}`);
    }
    currentEmotion = emotion;
    elements.moodDisplay.textContent = emotion.charAt(0).toUpperCase() + emotion.slice(1);
    elements.emojiDisplay.textContent = emotionEmojis[emotion] || "✨";
    
    addToHistory(emotion);
    updateQuote(emotion, intensity);
    updateSuggestions(emotion);
    
    elements.scoresContainer.innerHTML = '';
    Object.entries(scores).forEach(([emo, score]) => {
        const percentage = (score * 100).toFixed(1);
        const row = document.createElement('div');
        row.className = 'score-row';
        row.innerHTML = `
            <div class="score-label">
                <span>${emotionEmojis[emo] || ""} ${emo.charAt(0).toUpperCase() + emo.slice(1)}</span>
                <span>${percentage}%</span>
            </div>
            <div class="score-bar">
                <div class="score-fill" style="width: ${percentage}%"></div>
            </div>
        `;
        elements.scoresContainer.appendChild(row);
    });
}

// Detection Functions
async function detectEmotion() {
    if (isProcessing) return;
    isProcessing = true;
    try {
        elements.canvas.width = elements.video.videoWidth;
        elements.canvas.height = elements.video.videoHeight;
        const ctx = elements.canvas.getContext('2d');
        ctx.drawImage(elements.video, 0, 0);
        const imageData = elements.canvas.toDataURL('image/jpeg', 0.8);
        const response = await fetch(`${API_URL}/detect`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ image: imageData })
        });
        const result = await response.json();
        
        if (result.face_detected) {
            const face = result.face;
            const overlay = elements.detectionOverlay;
            const videoRect = elements.video.getBoundingClientRect();
            const scaleX = videoRect.width / elements.video.videoWidth;
            const scaleY = videoRect.height / elements.video.videoHeight;
            
            overlay.style.left = (face.x * scaleX) + 'px';
            overlay.style.top = (face.y * scaleY) + 'px';
            overlay.style.width = (face.w * scaleX) + 'px';
            overlay.style.height = (face.h * scaleY) + 'px';
            overlay.classList.add('active');
            
            updateUI(result.emotion, result.scores, result.intensity || 0.5);
        } else {
            elements.detectionOverlay.classList.remove('active');
        }
    } catch (error) {
        console.error('Detection error:', error);
    }
    isProcessing = false;
}

// Control Functions
async function startDetection() {
    try {
        stream = await navigator.mediaDevices.getUserMedia({ 
            video: { 
                width: { ideal: 640 }, 
                height: { ideal: 480 } 
            } 
        });
        
        elements.video.srcObject = stream;
        elements.video.play();
        
        elements.video.classList.add('active');
        elements.cameraPlaceholder.classList.add('hidden');
        elements.videoContainer.classList.add('detecting');
        
        isDetecting = true;
        elements.startBtn.disabled = true;
        elements.stopBtn.disabled = false;
        elements.captureBtn.disabled = false;
        elements.shareBtn.disabled = false;
        elements.liveIndicator.classList.add('active');
        elements.scannerLine.classList.add('active');
        
        detectionInterval = setInterval(detectEmotion, detectionIntervalMs);
    } catch (err) {
        alert('Camera access denied. Please allow camera access to use emotion detection.');
    }
}

function stopDetection() {
    if (detectionInterval) {
        clearInterval(detectionInterval);
        detectionInterval = null;
    }
    
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
        stream = null;
    }
    
    elements.video.classList.remove('active');
    elements.cameraPlaceholder.classList.remove('hidden');
    elements.videoContainer.classList.remove('detecting');
    
    isDetecting = false;
    elements.startBtn.disabled = false;
    elements.stopBtn.disabled = true;
    elements.captureBtn.disabled = true;
    elements.shareBtn.disabled = true;
    elements.liveIndicator.classList.remove('active');
    elements.scannerLine.classList.remove('active');
    elements.detectionOverlay.classList.remove('active');
}

function captureSnapshot() {
    if (!elements.video.srcObject) return;
    
    const canvas = document.createElement('canvas');
    canvas.width = elements.video.videoWidth;
    canvas.height = elements.video.videoHeight;
    canvas.getContext('2d').drawImage(elements.video, 0, 0);
    
    const link = document.createElement('a');
    link.download = `emotion-snapshot-${Date.now()}.jpg`;
    link.href = canvas.toDataURL('image/jpeg', 0.9);
    link.click();
}

function shareMood() {
    if (!currentEmotion) return;
    const emoji = emotionEmojis[currentEmotion] || '✨';
    const text = `I'm feeling ${currentEmotion} ${emoji} - Detected by EmotionAI`;
    if (navigator.share) {
        navigator.share({ title: 'My Current Mood', text, url: window.location.href }).catch(console.error);
    } else {
        navigator.clipboard.writeText(text).then(() => {
            alert('Mood copied to clipboard!');
        }).catch(() => {
            alert(text);
        });
    }
}

function clearHistory() {
    if (confirm('Are you sure you want to clear your mood history?')) {
        history = [];
        saveHistory();
        renderHistory();
        updateDailySummary();
        elements.streakEmojiEl.textContent = "✨";
        elements.streakTextEl.innerHTML = `<h3>Build your streak!</h3><p class="streak-subtitle">Start detecting to build a streak!</p>`;
        elements.suggestionsListEl.innerHTML = `<div class="suggestion-placeholder"><span class="placeholder-emoji">💭</span><p>Get personalized tips based on your mood</p></div>`;
        elements.badgeEmojiEl.textContent = "🏆";
        elements.badgeTextEl.textContent = "Check back later!";
        streakEmotion = null;
        streakCount = 0;
        currentEmotion = null;
    }
}

function downloadHistory() {
    if (history.length === 0) {
        alert('No history to download!');
        return;
    }
    const data = JSON.stringify(history, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = `mood-history-${getTodayDateKey()}.json`;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
}

// Server Status
async function checkStatus() {
    try {
        const response = await fetch(`${API_URL}/status`);
        const data = await response.json();
        elements.statusText.textContent = 'Backend Online';
        elements.serverStatus.classList.remove('offline');
        elements.serverStatus.classList.add('online');
    } catch (error) {
        elements.statusText.textContent = 'Backend Offline';
        elements.serverStatus.classList.remove('online');
        elements.serverStatus.classList.add('offline');
    }
}

// Modal Functions
function openModal() {
    elements.settingsModal.classList.add('show');
}

function closeModal() {
    elements.settingsModal.classList.remove('show');
}

// Event Listeners
function initEventListeners() {
    elements.startBtn.addEventListener('click', startDetection);
    elements.stopBtn.addEventListener('click', stopDetection);
    elements.captureBtn.addEventListener('click', captureSnapshot);
    elements.shareBtn.addEventListener('click', shareMood);
    elements.clearBtn.addEventListener('click', clearHistory);
    elements.downloadBtn.addEventListener('click', downloadHistory);
    elements.settingsBtn.addEventListener('click', openModal);
    elements.closeModalBtn.addEventListener('click', closeModal);
    
    elements.settingsModal.addEventListener('click', (e) => {
        if (e.target === elements.settingsModal) closeModal();
    });
    
    elements.speechToggle.addEventListener('change', (e) => {
        speechEnabled = e.target.checked;
        saveSettings();
    });
    
    elements.intervalSelect.addEventListener('change', (e) => {
        detectionIntervalMs = parseInt(e.target.value);
        saveSettings();
        if (isDetecting) {
            clearInterval(detectionInterval);
            detectionInterval = setInterval(detectEmotion, detectionIntervalMs);
        }
    });
    
    if (elements.themeSelect) {
        elements.themeSelect.addEventListener('change', (e) => {
            applyTheme(e.target.value);
            saveTheme(e.target.value);
        });
    }
}

// Initialize
function init() {
    loadSettings();
    loadHistory();
    initEventListeners();
    checkStatus();
    setInterval(checkStatus, 30000);
}

window.addEventListener('load', init);
