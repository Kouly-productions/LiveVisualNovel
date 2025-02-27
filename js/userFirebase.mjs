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

const firebaseConfigSingle = {
    apiKey: "AIzaSyCENG1rfaoxspHPBZ8_YMicR6hm7PqOsEk",
    authDomain: "visualnovelsingle.firebaseapp.com",
    databaseURL: "https://visualnovelsingle-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "visualnovelsingle",
    storageBucket: "visualnovelsingle.firebasestorage.app",
    messagingSenderId: "968465504382",
    appId: "1:968465504382:web:525c275983566d1a4a602f",
    measurementId: "G-SK0SW5KNGP"
};

// Firebase app instances with different names
let sharedApp = null;
let singleApp = null;
let db;
let activeListeners = [];
let currentMode = 'shared'; // Default mode

// Initialize Firebase with the appropriate config
function initializeFirebase(mode = 'shared') {
    // Clear any existing listeners
    if (activeListeners.length > 0) {
        console.log(`Clearing ${activeListeners.length} listeners`);
        activeListeners.forEach(listener => listener());
        activeListeners = [];
    }
    
    try {
        let currentApp;
        
        // Use named apps to avoid conflicts
        if (mode === 'shared') {
            // Create the shared app if it doesn't exist yet
            if (!sharedApp) {
                console.log('Creating new shared app instance');
                sharedApp = initializeApp(firebaseConfig, 'shared-app');
            }
            currentApp = sharedApp;
        } else {
            // Create the single user app if it doesn't exist yet
            if (!singleApp) {
                console.log('Creating new single user app instance');
                singleApp = initializeApp(firebaseConfigSingle, 'single-app');
            }
            currentApp = singleApp;
        }
        
        // Get database for the current app
        db = getDatabase(currentApp);
        
        // Update UI to show active mode
        updateActiveButton(mode);
        
        // Store the current mode
        currentMode = mode;
        localStorage.setItem('databaseMode', mode);
        
        // Set up all the listeners again
        setupAllListeners();
        
        // Ensure the character system is re-initialized
        if (typeof window.initializeCharacterSystem === 'function') {
            console.log('Re-initializing character system after database switch');
            window.initializeCharacterSystem();
        }
        
        console.log(`Successfully initialized Firebase in ${mode} mode`);
    } catch (error) {
        console.error('Error initializing Firebase:', error);
    }
}

// Update active button UI
function updateActiveButton(mode) {
    const sharedButton = document.getElementById('db-shared');
    const singleButton = document.getElementById('db-single');
    
    if (sharedButton && singleButton) {
        if (mode === 'shared') {
            sharedButton.classList.add('active');
            singleButton.classList.remove('active');
        } else {
            sharedButton.classList.remove('active');
            singleButton.classList.add('active');
        }
    }
}

// Global audio state
let currentAudio = null;
let currentBgmId = null;

// Setup all the Firebase listeners
function setupAllListeners() {
    // Scene listener
    const sceneRef = ref(db, 'currentScene');
    const sceneListener = onValue(sceneRef, (snapshot) => {
        const data = snapshot.val();
        console.log('Scene data received:', data);
        
        // Update scene display
        updateSceneDisplay(data);
        
        // Handle BGM changes
        handleBgmChange(data);
        
        // Check for character menu data
        if (data && data.characterMenu) {
            updateCharacterMenu(data.characterMenu);
        }
    });
    activeListeners.push(() => sceneListener());
    
    // Game state listeners
    const kaikoPointsRef = ref(db, 'gameState/points/kaiko');
    const kaikoListener = onValue(kaikoPointsRef, (snapshot) => {
        const points = snapshot.val() || 1250;
        const kaikoInput = document.getElementById('kaiko-points');
        if (kaikoInput) kaikoInput.value = points;
    });
    activeListeners.push(() => kaikoListener());
    
    const jamesPointsRef = ref(db, 'gameState/points/james');
    const jamesListener = onValue(jamesPointsRef, (snapshot) => {
        const points = snapshot.val() || 1250;
        const jamesInput = document.getElementById('james-points');
        if (jamesInput) jamesInput.value = points;
    });
    activeListeners.push(() => jamesListener());
    
    const currentDayRef = ref(db, 'gameState/currentDay');
    const dayListener = onValue(currentDayRef, (snapshot) => {
        const day = snapshot.val() || 'ONSDAG';
        const dayDisplay = document.getElementById('current-day');
        if (dayDisplay) dayDisplay.textContent = day;
    });
    activeListeners.push(() => dayListener());
    
    const corruptionRef = ref(db, 'gameState/corruption');
    const corruptionListener = onValue(corruptionRef, (snapshot) => {
        const corruption = snapshot.val() || 'Corruption 55%';
        const corruptionDisplay = document.getElementById('current-corrupt');
        if (corruptionDisplay) corruptionDisplay.textContent = corruption;
    });
    activeListeners.push(() => corruptionListener());
    
    const timeRef = ref(db, 'gameState/time');
    const timeListener = onValue(timeRef, (snapshot) => {
        const time = snapshot.val() || '07:30';
        const timeDisplay = document.getElementById('current-time');
        if (timeDisplay) timeDisplay.textContent = time;
    });
    activeListeners.push(() => timeListener());
    
    // Character menu listener (if available)
    const characterMenuRef = ref(db, 'currentScene/characterMenu');
    const characterMenuListener = onValue(characterMenuRef, (snapshot) => {
        const menuData = snapshot.val();
        if (menuData) {
            updateCharacterMenu(menuData);
        }
    });
    activeListeners.push(() => characterMenuListener());
    
    // Time speed listener
    const timeSpeedRef = ref(db, 'gameState/timeSpeedMultiplier');
    const timeSpeedListener = onValue(timeSpeedRef, (snapshot) => {
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
    activeListeners.push(() => timeSpeedListener());
    
    // Timer state listener
    const timerStateRef = ref(db, 'gameState/timerState');
    const timerStateListener = onValue(timerStateRef, (snapshot) => {
        const timerState = snapshot.val() || 'paused';
        handleTimerStateChange(timerState === 'running');
    });
    activeListeners.push(() => timerStateListener());
    
    // Setup points change events
    setupPointsChangeEvents();
}

// Setup points change events
function setupPointsChangeEvents() {
    const kaikoInput = document.getElementById('kaiko-points');
    const jamesInput = document.getElementById('james-points');
    
    if (kaikoInput) {
        kaikoInput.onchange = (e) => {
            const points = parseInt(e.target.value) || 0;
            const kaikoPointsRef = ref(db, 'gameState/points/kaiko');
            set(kaikoPointsRef, points);
        };
    }
    
    if (jamesInput) {
        jamesInput.onchange = (e) => {
            const points = parseInt(e.target.value) || 0;
            const jamesPointsRef = ref(db, 'gameState/points/james');
            set(jamesPointsRef, points);
        };
    }
}

// Update character menu
function updateCharacterMenu(menuData) {
    const menuContainer = document.getElementById('character-menu');
    if (!menuContainer) return;
    
    // Clear existing menu
    menuContainer.innerHTML = '';
    
    // If no menu data, hide container
    if (!menuData || !Array.isArray(menuData) || menuData.length === 0) {
        const parentContainer = document.getElementById('character-menu-container');
        if (parentContainer) {
            parentContainer.style.display = 'none';
        }
        return;
    }
    
    // Show the container
    const parentContainer = document.getElementById('character-menu-container');
    if (parentContainer) {
        parentContainer.style.display = 'block';
    }
    
    // Create buttons for each menu item
    menuData.forEach(item => {
        if (!item.text) return;
        
        const button = document.createElement('button');
        button.className = 'character-menu-option';
        button.textContent = item.text;
        
        // Add special styling if indicated
        if (item.special) {
            button.classList.add('special-option');
        }
        
        // Add click handler
        button.addEventListener('click', () => {
            if (item.action) {
                handleMenuAction(item.action, item.text);
            } else {
                // Default action is to set dialogue
                handleSendMenuResponse(item.text);
            }
        });
        
        menuContainer.appendChild(button);
    });
}

// Handle menu action
function handleMenuAction(action, text) {
    console.log(`Menu action: ${action}, text: ${text}`);
    
    // Handle different action types
    switch(action) {
        case 'dialogue':
            handleSendMenuResponse(text);
            break;
        case 'clearMenu':
            clearCharacterMenu();
            break;
        default:
            // For custom actions, update the database with the selection
            const actionRef = ref(db, 'gameState/lastAction');
            set(actionRef, {
                type: action,
                text: text,
                timestamp: Date.now()
            });
            break;
    }
}

// Send a menu response
function handleSendMenuResponse(text) {
    const userWriteAs = document.getElementById('user-write-as');
    const writeAs = userWriteAs ? userWriteAs.value.trim() : '';
    
    // Update the database with the selected dialogue option
    const sceneRef = ref(db, 'currentScene');
    
    // First get current scene data
    onValue(sceneRef, (snapshot) => {
        const currentData = snapshot.val();
        
        // Update dialogue fields
        const updatedData = {
            ...currentData,
            playerText: text,
            dialogue: {
                ...currentData.dialogue,
                speaker: writeAs,
                text: text
            }
        };
        
        // Remove the menu if it exists in the data
        if (updatedData.characterMenu) {
            delete updatedData.characterMenu;
        }
        
        // Set the updated data back to Firebase
        set(sceneRef, updatedData)
            .then(() => {
                console.log('Menu response sent successfully');
                clearCharacterMenu();
            })
            .catch((error) => {
                console.error('Error sending menu response:', error);
            });
    }, {
        onlyOnce: true
    });
}

// Clear the character menu
function clearCharacterMenu() {
    const characterMenuRef = ref(db, 'currentScene/characterMenu');
    set(characterMenuRef, null)
        .then(() => console.log('Character menu cleared'))
        .catch(error => console.error('Error clearing menu:', error));
}

// Initialize database buttons and other elements
document.addEventListener('DOMContentLoaded', () => {
    // Initialize database buttons
    const sharedButton = document.getElementById('db-shared');
    const singleButton = document.getElementById('db-single');
    
    if (sharedButton && singleButton) {
        // Check localStorage for saved preference
        const savedMode = localStorage.getItem('databaseMode') || 'shared';
        
        // Initialize Firebase with saved mode
        initializeFirebase(savedMode);
        
        // Add click event listeners
        sharedButton.addEventListener('click', () => {
            if (currentMode !== 'shared') {
                initializeFirebase('shared');
            }
        });
        
        singleButton.addEventListener('click', () => {
            if (currentMode !== 'single') {
                initializeFirebase('single');
            }
        });
    } else {
        // Just initialize with default if buttons don't exist
        initializeFirebase();
    }
    
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
    
    // Initialize time system
    initializeTimeSystem();
    
    // Add a heartbeat animation for extra romantic feel
    addHeartbeatAnimation();
    
    // Add styles for character menu options
    addCharacterMenuStyles();
});

// Add character menu styles
function addCharacterMenuStyles() {
    const style = document.createElement('style');
    style.textContent = `
        #character-menu-container {
            margin-top: 10px;
            padding: 5px;
            text-align: center;
        }
        
        #character-menu {
            display: flex;
            flex-wrap: wrap;
            justify-content: center;
            gap: 8px;
        }
        
        .character-menu-option {
            padding: 10px 15px;
            background-color: rgba(255, 158, 197, 0.8);
            color: #800033;
            border: none;
            border-radius: 20px;
            cursor: pointer;
            font-weight: bold;
            transition: all 0.3s ease;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }
        
        .character-menu-option:hover {
            background-color: rgba(255, 94, 153, 0.9);
            color: white;
            transform: translateY(-2px);
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
        }
        
        .character-menu-option.special-option {
            background-color: rgba(255, 215, 0, 0.8);
            color: #8B4513;
        }
        
        .character-menu-option.special-option:hover {
            background-color: rgba(255, 215, 0, 0.9);
            color: #5C2F0E;
        }
    `;
    document.head.appendChild(style);
}

// Add heartbeat animation to active button
function addHeartbeatAnimation() {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes heartbeat {
            0% { transform: scale(1); }
            15% { transform: scale(1.05); }
            30% { transform: scale(1); }
            45% { transform: scale(1.05); }
            60% { transform: scale(1); }
        }
        
        .db-button.active {
            animation: heartbeat 2s infinite;
        }
    `;
    document.head.appendChild(style);
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

// Time control state
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
    const timeRef = ref(db, 'gameState/time');
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
    // Update Firebase timer state
    const timerStateRef = ref(db, 'gameState/timerState');
    set(timerStateRef, 'running')
        .then(() => {
            console.log('Timer state updated to running');
        })
        .catch(error => console.error('Error updating timer state:', error));
}

function pauseTimer() {
    // Update Firebase timer state
    const timerStateRef = ref(db, 'gameState/timerState');
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
        const startButton = document.getElementById('start-timer');
        const pauseButton = document.getElementById('pause-timer');
        if (startButton) startButton.disabled = true;
        if (pauseButton) pauseButton.disabled = false;
        console.log('Timer started with speed multiplier:', currentTimeSpeed);
    } else {
        isTimerRunning = false;
        clearInterval(timeInterval);
        const startButton = document.getElementById('start-timer');
        const pauseButton = document.getElementById('pause-timer');
        if (startButton) startButton.disabled = false;
        if (pauseButton) pauseButton.disabled = true;
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

// Export functions for use in other modules
export {
    db,
    ref,
    set,
    onValue
};