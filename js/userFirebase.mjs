import { initializeApp } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-app.js";
import { getDatabase, ref, set, onValue } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-database.js";
import { bgm } from './bgm.js';
import { sfx } from './sfx.js';

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
let currentBgmAudio = null;
let currentSfxAudio = null;
let currentBgmId = null;
let currentSfxId = null;

// Initialize volume control
document.addEventListener('DOMContentLoaded', () => {
    const volumeSlider = document.getElementById('volume-slider');
    if (volumeSlider) {
        // Set initial volume from localStorage or default to 50
        const savedVolume = localStorage.getItem('audioVolume') || '50';
        volumeSlider.value = savedVolume;
        
        // Apply initial volume
        applyVolume(parseInt(savedVolume));
        
        // Handle volume changes
        volumeSlider.addEventListener('input', (e) => {
            const sliderValue = parseInt(e.target.value);
            applyVolume(sliderValue);
            localStorage.setItem('audioVolume', sliderValue);
        });
    }

    // Initialize send button handler
    const sendButton = document.getElementById('send-button');
    if (sendButton) {
        sendButton.addEventListener('click', handleSendMessage);
    }
});

const SFX_VOLUME_MULTIPLIER = 2.0; // 2x louder than BGM

// Function to apply volume settings
function applyVolume(sliderValue) {
    const bgmVolume = sliderValue / 100;
    
    // Apply multiplier to SFX but cap at 1.0 (max volume)
    const sfxVolume = Math.min(bgmVolume * SFX_VOLUME_MULTIPLIER, 1.0);
    
    if (currentBgmAudio) {
        currentBgmAudio.volume = bgmVolume;
    }
    if (currentSfxAudio) {
        currentSfxAudio.volume = sfxVolume;
    }
}

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

// Update the handleBgmChange function to use its own audio instance
function handleBgmChange(data) {
    const newBgmId = data && data.bgm;
    
    if (newBgmId) {
        // Only create new audio if the BGM has actually changed
        if (newBgmId !== currentBgmId) {
            console.log('Switching to new BGM:', newBgmId);
            
            // Stop current BGM audio if it exists
            if (currentBgmAudio) {
                currentBgmAudio.pause();
            }

            // Create new audio for the new BGM
            const bgmPath = bgm[newBgmId];
            if (!bgmPath) {
                console.error('BGM not found:', newBgmId);
                return;
            }
            
            currentBgmAudio = new Audio(bgmPath);
            currentBgmAudio.loop = true;
            
            // Set volume based on slider
            const volumeSlider = document.getElementById('volume-slider');
            if (volumeSlider) {
                currentBgmAudio.volume = parseInt(volumeSlider.value) / 100;
            }
            
            currentBgmAudio.play().catch(error => {
                console.error('BGM playback failed:', error);
            });
            
            // Update current BGM ID
            currentBgmId = newBgmId;
        }
        // If the BGM is the same, just ensure it's playing
        else if (currentBgmAudio && currentBgmAudio.paused) {
            currentBgmAudio.play().catch(error => {
                console.error('BGM playback failed:', error);
            });
        }
    } 
    // If there's no BGM in the data, stop any playing BGM audio
    else if (currentBgmAudio) {
        currentBgmAudio.pause();
        currentBgmAudio = null;
        currentBgmId = null;
    }
}

// Update handleSfxChange to use the new volume system
function handleSfxChange(data) {
    const newSfxId = data && data.sfx;
    
    if (newSfxId) {
        // Only create new audio if the SFX has actually changed
        if (newSfxId !== currentSfxId) {
            console.log('Playing new SFX:', newSfxId);
            
            // Stop current SFX audio if it exists
            if (currentSfxAudio) {
                currentSfxAudio.pause();
            }

            // Create new audio for the new SFX
            const sfxPath = sfx[newSfxId];
            if (!sfxPath) {
                console.error('SFX not found:', newSfxId);
                return;
            }
            
            currentSfxAudio = new Audio(sfxPath);
            currentSfxAudio.loop = true;
            
            // Set volume based on slider with the multiplier
            const volumeSlider = document.getElementById('volume-slider');
            if (volumeSlider) {
                const baseVolume = parseInt(volumeSlider.value) / 100;
                currentSfxAudio.volume = Math.min(baseVolume * SFX_VOLUME_MULTIPLIER, 1.0);
            }
            
            currentSfxAudio.play().catch(error => {
                console.error('SFX playback failed:', error);
            });
            
            // Update current SFX ID
            currentSfxId = newSfxId;
        }
        // If the SFX is the same, just ensure it's playing
        else if (currentSfxAudio && currentSfxAudio.paused) {
            currentSfxAudio.play().catch(error => {
                console.error('SFX playback failed:', error);
            });
        }
    } 
    // If there's no SFX in the data, stop any playing SFX audio
    else if (currentSfxAudio) {
        currentSfxAudio.pause();
        currentSfxAudio = null;
        currentSfxId = null;
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
    handleSfxChange(data);
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
// Add new reference for time speed multiplier
const timeSpeedRef = ref(db, 'gameState/timeSpeedMultiplier');
const timerStateRef = ref(db, 'gameState/timerState');
let timeInterval = null;
let isTimerRunning = false;
let currentTimeSpeed = 45;

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
        const newTime = addMinutesToTime(currentTime, 1);
        set(timeRef, newTime)
            .then(() => console.log('Time updated to:', newTime))
            .catch(error => console.error('Error updating time:', error));
    }, {
        onlyOnce: true
    });
}

function startTimer() {
    // Update Firebase timer state
    set(timerStateRef, 'running')
        .then(() => {
            console.log('Timer state updated to running');
        })
        .catch(error => console.error('Error updating timer state:', error));
}

function pauseTimer() {
    // Update Firebase timer state
    set(timerStateRef, 'paused')
        .then(() => {
            console.log('Timer state updated to paused');
        })
        .catch(error => console.error('Error updating timer state:', error));
}

function handleTimerStateChange(isRunning) {
    if (isRunning) {
        isTimerRunning = true;
        timeInterval = setInterval(updateTime, currentTimeSpeed * 1000);
        document.getElementById('start-timer').disabled = true;
        document.getElementById('pause-timer').disabled = false;
        console.log('Timer started with speed multiplier:', currentTimeSpeed);
    } else {
        isTimerRunning = false;
        clearInterval(timeInterval);
        document.getElementById('start-timer').disabled = false;
        document.getElementById('pause-timer').disabled = true;
        console.log('Timer paused');
    }
}

// Listen for changes to time speed multiplier
function initializeTimeSpeedListener() {
    onValue(timeSpeedRef, (snapshot) => {
        const newTimeSpeed = snapshot.val() || 45;
        if (newTimeSpeed !== currentTimeSpeed) {
            currentTimeSpeed = newTimeSpeed;
            console.log('Time speed updated to:', currentTimeSpeed);
            
            // Restart timer if it's running to apply new speed
            if (isTimerRunning) {
                clearInterval(timeInterval);
                timeInterval = setInterval(updateTime, currentTimeSpeed * 1000);
            }
        }
    });
}


function initializeTimeSystem() {
    // Initialize time speed listener
    initializeTimeSpeedListener();
    
    // Listen for timer state changes
    onValue(timerStateRef, (snapshot) => {
        const timerState = snapshot.val() || 'paused';
        handleTimerStateChange(timerState === 'running');
    });
    
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
    pauseButton.disabled = true;
    
    // Add speed display
    const speedDisplay = document.createElement('div');
    
    controlsContainer.appendChild(startButton);
    controlsContainer.appendChild(pauseButton);
    controlsContainer.appendChild(speedDisplay);
    
    // Find the time display element and add controls
    const timeDisplay = document.getElementById('current-time');
    if (timeDisplay) {
        let timeWrapper = timeDisplay.parentElement;
        if (!timeWrapper.classList.contains('time-wrapper')) {
            timeWrapper = document.createElement('div');
            timeWrapper.className = 'time-wrapper';
            timeDisplay.parentNode.insertBefore(timeWrapper, timeDisplay);
            timeWrapper.appendChild(timeDisplay);
        }
        timeWrapper.appendChild(controlsContainer);
    }
}

// Add styles to the document
const styles = document.createElement('style');

document.head.appendChild(styles);

// Initialize when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    initializeTimeSystem();
});