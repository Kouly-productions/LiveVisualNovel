import { initializeApp } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-app.js";
import { getDatabase, ref, set, onValue } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-database.js";
import { bgm } from './bgm.js';

const firebaseConfig = {
    apiKey: "AIzaSyCTNcv4Xpys0MTsMl22Bos2q5NnZt1ctsg",
    authDomain: "visualnovel-9c891.firebaseapp.com",
    databaseURL: "https://visualnovel-9c891-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "visualnovel-9c891",
    storageBucket: "visualnovel-9c891.firebasestorage.app",
    messagingSenderId: "1059758683909",
    appId: "1:1059758683909:web:50aba578a246923d67696c",
    measurementId: "G-6C2XTJ44TV"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Global audio state
let currentAudio = null;
let currentBgmId = null;

// Initialize volume control
document.addEventListener('DOMContentLoaded', () => {
    const volumeSlider = document.getElementById('volume-slider');
    if (volumeSlider) {
        // Set initial volume from localStorage or default to 50
        const savedVolume = localStorage.getItem('audioVolume') || '50';
        volumeSlider.value = savedVolume;
        
        volumeSlider.addEventListener('input', (e) => {
            const volume = e.target.value / 100;
            if (currentAudio) {
                currentAudio.volume = volume;
            }
            localStorage.setItem('audioVolume', e.target.value);
        });
    }

    // Initialize send button handler
    const sendButton = document.getElementById('send-button');
    if (sendButton) {
        sendButton.addEventListener('click', handleSendMessage);
    }
});

// Handle send button click
function handleSendMessage() {
    const userInput = document.getElementById('user-input');
    const userWriteAs = document.getElementById('user-write-as');
    const message = userInput.value.trim();
    const writeAs = userWriteAs.value.trim();
    
    if (message) {
        // Update the database with the new message
        const sceneRef = ref(db, 'currentScene');
        
        // First get current scene data
        onValue(sceneRef, (snapshot) => {
            const currentData = snapshot.val();
            
            // Update only the playerText field
            const updatedData = {
                ...currentData,
                playerText: message,
                dialogue: {
                    ...currentData.dialogue,
                    speaker: writeAs,
                    text: message
                }
            };
            
            // Set the updated data back to Firebase
            set(sceneRef, updatedData)
                .then(() => {
                    console.log('Message sent successfully');
                    userInput.value = ''; // Clear the input field
                })
                .catch((error) => {
                    console.error('Error sending message:', error);
                });
        }, {
            onlyOnce: true
        });
    }
}

// Handle BGM changes
function handleBgmChange(data) {
    const newBgmId = data && data.bgm;
    
    if (newBgmId) {
        // Only create new audio if the BGM has actually changed
        if (newBgmId !== currentBgmId) {
            console.log('Switching to new BGM:', newBgmId);
            
            // Stop current audio if it exists
            if (currentAudio) {
                currentAudio.pause();
            }

            // Create new audio for the new BGM
            const bgmPath = bgm[newBgmId];
            currentAudio = new Audio(bgmPath);
            currentAudio.loop = true;
            
            // Set volume from slider
            const volumeSlider = document.getElementById('volume-slider');
            if (volumeSlider) {
                currentAudio.volume = volumeSlider.value / 100;
            }
            
            currentAudio.play().catch(error => {
                console.error('Audio playback failed:', error);
            });
            
            // Update current BGM ID
            currentBgmId = newBgmId;
        }
        // If the BGM is the same, just ensure it's playing
        else if (currentAudio && currentAudio.paused) {
            currentAudio.play().catch(error => {
                console.error('Audio playback failed:', error);
            });
        }
    } 
    // If there's no BGM in the data, stop any playing audio
    else if (currentAudio) {
        currentAudio.pause();
        currentAudio = null;
        currentBgmId = null;
    }
}

// Update scene display elements
function updateSceneDisplay(data) {
    // Update background
    if (data && data.background) {
        document.body.style.backgroundImage = `url(${data.background})`;
    }

    // Update characters
    if (data && data.characters) {
        ['left', 'center', 'right'].forEach(position => {
            const container = document.getElementById(`${position}-character`);
            if (container) {
                container.innerHTML = '';
                
                const imageUrl = data.characters[position];
                if (imageUrl && imageUrl !== "") {
                    const img = document.createElement('img');
                    img.src = imageUrl;
                    img.classList.add('character-image');
                    container.appendChild(img);
                }
            }
        });
    }

    // Update dialogue
    if (data && data.dialogue) {
        const dialogueBox = document.getElementById('dialogue-text');
        const speakerBox = document.getElementById('name-text');
        
        if (dialogueBox) dialogueBox.textContent = data.dialogue.text;
        if (speakerBox) speakerBox.textContent = data.dialogue.speaker;
    }

    // Update user response
    if (data && data.playerText) {
        const userResponse = document.getElementById('user-response');
        if (userResponse) {
            userResponse.textContent = data.playerText;
            userResponse.style.display = 'block';
        }
    } else {
        const userResponse = document.getElementById('user-response');
        if (userResponse) {
            userResponse.style.display = 'none';
        }
    }
}

// Listen for scene changes
const sceneRef = ref(db, 'currentScene');
onValue(sceneRef, (snapshot) => {
    const data = snapshot.val();
    console.log('Scene data received:', data);
    
    // Update scene display
    updateSceneDisplay(data);
    
    // Handle BGM changes
    handleBgmChange(data);
});

// Add keyboard event listener for Enter key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        const activeElement = document.activeElement;
        if (activeElement.id === 'user-input') {
            e.preventDefault(); // Prevent default Enter behavior
            handleSendMessage();
        }
    }
});

// Update Firebase references to match new structure
const kaikoPointsRef = ref(db, 'gameState/points/kaiko');
const jamesPointsRef = ref(db, 'gameState/points/james');
const currentDayRef = ref(db, 'gameState/currentDay');
const corruptionRef = ref(db, 'gameState/corruption');
const timeRef = ref(db, 'gameState/time');

// Initialize points and day listeners
document.addEventListener('DOMContentLoaded', () => {
    const kaikoInput = document.getElementById('kaiko-points');
    const jamesInput = document.getElementById('james-points');
    const dayDisplay = document.getElementById('current-day');
    const corruptionDisplay = document.getElementById('current-corrupt');
    const currentTime = document.getElementById('current-time');

    // Listen for Kaiko points changes
    onValue(kaikoPointsRef, (snapshot) => {
        const points = snapshot.val() || 1250;
        kaikoInput.value = points;
    });

    // Listen for James points changes
    onValue(jamesPointsRef, (snapshot) => {
        const points = snapshot.val() || 1250;
        jamesInput.value = points;
    });

    // Listen for day changes
    onValue(currentDayRef, (snapshot) => {
        const day = snapshot.val() || 'ONSDAG';
        dayDisplay.textContent = day;
    });

    // corruptionRef
    onValue(corruptionRef, (snapshot) => {
        const day = snapshot.val() || 'Corruption 55%';
        corruptionDisplay.textContent = day;
    });

    // timeRef
    onValue(timeRef, (snapshot) => {
        const day = snapshot.val() || '07:30';
        currentTime.textContent = day;
    });

    // Update points when input changes
    kaikoInput.addEventListener('change', (e) => {
        const points = parseInt(e.target.value) || 0;
        set(kaikoPointsRef, points);
    });

    jamesInput.addEventListener('change', (e) => {
        const points = parseInt(e.target.value) || 0;
        set(jamesPointsRef, points);
    });
});

// Add these functions after your existing Firebase initialization code
// Time control state
let timeInterval = null;
let isTimerRunning = false;

function parseTime(timeString) {
    const [hours, minutes] = timeString.split(':').map(num => parseInt(num));
    return { hours, minutes };
}

function formatTime(hours, minutes) {
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

function addMinutesToTime(timeString, minutesToAdd) {
    let { hours, minutes } = parseTime(timeString);
    
    minutes += minutesToAdd;
    hours += Math.floor(minutes / 60);
    minutes = minutes % 60;
    hours = hours % 24;  // Wrap around at midnight
    
    return formatTime(hours, minutes);
}

function updateTime() {
    onValue(timeRef, (snapshot) => {
        const currentTime = snapshot.val() || '07:30';
        const newTime = addMinutesToTime(currentTime, 5);
        set(timeRef, newTime)
            .then(() => console.log('Time updated to:', newTime))
            .catch(error => console.error('Error updating time:', error));
    }, {
        onlyOnce: true
    });
}

function startTimer() {
    if (!isTimerRunning) {
        isTimerRunning = true;
        timeInterval = setInterval(updateTime, 45000);
        document.getElementById('start-timer').disabled = true;
        document.getElementById('pause-timer').disabled = false;
        console.log('Timer started');
    }
}

function pauseTimer() {
    if (isTimerRunning) {
        isTimerRunning = false;
        clearInterval(timeInterval);
        document.getElementById('start-timer').disabled = false;
        document.getElementById('pause-timer').disabled = true;
        console.log('Timer paused');
    }
}

function initializeTimeSystem() {
    // Create timer controls
    const controlsContainer = document.createElement('div');
    controlsContainer.id = 'timer-controls';
    controlsContainer.className = 'timer-controls';
    
    const startButton = document.createElement('button');
    startButton.id = 'start-timer';
    startButton.textContent = '▶️ Resume';
    startButton.onclick = startTimer;
    
    const pauseButton = document.createElement('button');
    pauseButton.id = 'pause-timer';
    pauseButton.textContent = '⏸️ Pause';
    pauseButton.onclick = pauseTimer;
    pauseButton.disabled = true;  // Initially disabled since timer starts paused
    
    controlsContainer.appendChild(startButton);
    controlsContainer.appendChild(pauseButton);
    
    // Find the time display element
    const timeDisplay = document.getElementById('current-time');
    if (timeDisplay) {
        // Create a wrapper div for both time and controls if it doesn't exist
        let timeWrapper = timeDisplay.parentElement;
        if (!timeWrapper.classList.contains('time-wrapper')) {
            timeWrapper = document.createElement('div');
            timeWrapper.className = 'time-wrapper';
            timeDisplay.parentNode.insertBefore(timeWrapper, timeDisplay);
            timeWrapper.appendChild(timeDisplay);
        }
        
        // Add the controls after the time display
        timeWrapper.appendChild(controlsContainer);
    }
}

// Add styles to the document
const styles = document.createElement('style');
styles.textContent = `
.time-wrapper {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
}

.timer-controls {
    display: flex;
    gap: 10px;
}

.timer-controls button {
    padding: 4px 12px;
    border: none;
    border-radius: 4px;
    background-color: #333;
    color: white;
    cursor: pointer;
    transition: background-color 0.2s;
    font-size: 0.9em;
}

.timer-controls button:hover {
    background-color: #444;
}

.timer-controls button:disabled {
    background-color: #666;
    cursor: not-allowed;
}
`;
document.head.appendChild(styles);

// Initialize when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    initializeTimeSystem();
});