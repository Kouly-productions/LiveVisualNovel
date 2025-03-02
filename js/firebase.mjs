import { initializeApp } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-app.js";
import { getDatabase, ref, set, onValue } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-database.js";
import { backgrounds } from './backgrounds.js';
import { characters } from './characters.js';
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
                sharedApp = initializeApp(firebaseConfig, 'admin-shared-app');
            }
            currentApp = sharedApp;
        } else {
            // Create the single user app if it doesn't exist yet
            if (!singleApp) {
                console.log('Creating new single user app instance');
                singleApp = initializeApp(firebaseConfigSingle, 'admin-single-app');
            }
            currentApp = singleApp;
        }
        
        // Get database for the current app
        db = getDatabase(currentApp);
        
        // Store the current mode
        currentMode = mode;
        
        // Set up scene listener
        setupSceneListener();
        
        console.log(`Admin panel initialized Firebase in ${mode} mode`);
    } catch (error) {
        console.error('Error initializing Firebase:', error);
    }
}

// Setup scene listener
function setupSceneListener() {
    const sceneRef = ref(db, 'currentScene');
    const sceneListener = onValue(sceneRef, (snapshot) => {
        const data = snapshot.val();
        console.log('Current scene data:', data);
        updateDisplay(data);
    });
    activeListeners.push(() => sceneListener());
}

// Global state
let selectedCharacter = null;
let selectedEmotion = null;

// Background Control
window.updateBackground = function(backgroundId) {
    if (!backgrounds[backgroundId]) {
        console.error(`Background ${backgroundId} not found!`);
        return;
    }

    const sceneRef = ref(db, 'currentScene/background');
    set(sceneRef, backgrounds[backgroundId])
        .then(() => {
            updateStatus('Background updated successfully!');
            // Highlight the selected background
            document.querySelectorAll('.background-item').forEach(item => {
                item.style.border = '1px solid #ddd';
            });
            const selectedItem = Array.from(document.querySelectorAll('.background-item'))
                .find(item => item.querySelector('button').textContent === backgroundId.replace(/_/g, ' '));
            if (selectedItem) {
                selectedItem.style.border = '2px solid #4CAF50';
            }
        })
        .catch(handleError);
}

// Character Control
window.selectEmotion = function(characterId, emotion) {
    selectedCharacter = characterId;
    selectedEmotion = emotion;
    
    document.querySelectorAll('.emotion-buttons button').forEach(btn => {
        btn.classList.remove('selected');
    });
    event.target.classList.add('selected');
    
    updateStatus(`Selected ${characterId} with ${emotion} emotion`);
}

window.placeCharacter = function(position) {
    if (!selectedCharacter || !selectedEmotion) {
        updateStatus('Please select a character and emotion first!');
        return;
    }

    updateCharacter(selectedCharacter, selectedEmotion, position);
}

window.updateCharacter = function(characterId, emotion, position) {
    if (!characters[characterId]) {
        console.error(`Character ${characterId} not found!`);
        return;
    }

    const characterSprite = characters[characterId].expressions[emotion];
    if (!characterSprite) {
        console.error(`Expression ${emotion} not found for character ${characterId}!`);
        return;
    }

    const characterRef = ref(db, `currentScene/characters/${position}`);
    set(characterRef, characterSprite)
        .then(() => updateStatus(`${characterId} with ${emotion} placed at ${position}!`))
        .catch(handleError);
}

function getSpriteUrlsForCharacter(characterId) {
    if (!characters[characterId]) return [];
    return Object.values(characters[characterId].expressions);
}

window.removeCharacter = function(characterId) {
    // Get all possible sprite URLs for this character
    const characterSprites = getSpriteUrlsForCharacter(characterId);
    
    // Check each position
    ['left', 'center', 'right'].forEach(position => {
        const characterRef = ref(db, `currentScene/characters/${position}`);
        
        // Get the current sprite at this position
        onValue(characterRef, (snapshot) => {
            const currentSprite = snapshot.val();
            
            // Only remove if this position contains one of this character's sprites
            if (currentSprite && characterSprites.includes(currentSprite)) {
                set(characterRef, "")
                    .then(() => updateStatus(`${characterId} removed from ${position}!`))
                    .catch(handleError);
            }
        }, {
            onlyOnce: true // We only need to check once
        });
    });
}

window.clearCharacters = function() {
    const charactersRef = ref(db, 'currentScene/characters');
    set(charactersRef, {
        left: "",
        center: "",
        right: ""
    })
        .then(() => updateStatus('All characters cleared!'))
        .catch(handleError);
}

// Dialogue Control
window.setDialogue = function(speakerId, text) {
    if (speakerId && !characters[speakerId]) {
        console.error(`Character ${speakerId} not found!`);
        return;
    }

    const dialogueRef = ref(db, 'currentScene/dialogue');
    set(dialogueRef, {
        speaker: speakerId ? characters[speakerId].name : '',
        text: text
    }).catch(handleError);
}

// BGM Control
window.playBGM = function(songId) {
    if (!bgm[songId]) {
        console.error(`BGM ${songId} not found!`);
        return;
    }

    const bgmRef = ref(db, 'currentScene/bgm');
    set(bgmRef, songId)
        .then(() => updateStatus(`Now playing: ${songId}`))
        .catch(handleError);
}

window.stopBGM = function() {
    const bgmRef = ref(db, 'currentScene/bgm');
    set(bgmRef, null)
        .then(() => updateStatus('Music stopped'))
        .catch(handleError);
}

// Utility Functions
function updateStatus(message) {
    const statusElement = document.getElementById('status');
    if (statusElement) {
        statusElement.textContent = message;
    }
}

function handleError(error) {
    console.error('Error:', error);
    updateStatus('Error: ' + error.message);
}

// Scene Update Handler
function updateDisplay(sceneData) {
    if (!sceneData) return;

    // Update background
    if (sceneData.background) {
        document.body.style.backgroundImage = `url(${sceneData.background})`;
    }

    // Update characters
    if (sceneData.characters) {
        ['left', 'center', 'right'].forEach(position => {
            const container = document.getElementById(`${position}-character`);
            if (container) {
                container.innerHTML = '';
                
                const imageUrl = sceneData.characters[position];
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
    if (sceneData.dialogue) {
        const dialogueText = document.getElementById('dialogue-text');
        const speakerBox = document.getElementById('name-text');
        
        if (dialogueText) dialogueText.textContent = sceneData.dialogue.text;
        if (speakerBox) speakerBox.textContent = sceneData.dialogue.speaker;
    }

    // Update user response
    if (sceneData.playerText) {
        const userResponse = document.getElementById('user-response');
        if (userResponse) {
            userResponse.textContent = sceneData.playerText;
            userResponse.style.display = 'block';
        }
    } else {
        const userResponse = document.getElementById('user-response');
        if (userResponse) {
            userResponse.style.display = 'none';
        }
    }
}

// Create database mode indicator
function createDatabaseModeIndicator() {
    // Create container
    const container = document.createElement('div');
    container.className = 'db-mode-indicator';
    container.style.cssText = `
        position: fixed;
        top: 10px;
        right: 10px;
        background-color: rgba(0, 0, 0, 0.6);
        color: white;
        padding: 10px 15px;
        border-radius: 10px;
        z-index: 1000;
        backdrop-filter: blur(3px);
        border: 1px solid rgba(255, 192, 203, 0.4);
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
        display: flex;
        flex-direction: column;
        align-items: center;
    `;
    
    // Add label
    const label = document.createElement('div');
    label.textContent = 'Database Mode';
    label.style.cssText = `
        margin-bottom: 8px;
        font-size: 14px;
        text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
    `;
    container.appendChild(label);
    
    // Add button group
    const buttonGroup = document.createElement('div');
    buttonGroup.style.cssText = `
        display: flex;
        gap: 8px;
        width: 100%;
    `;
    
    // Create shared button
    const sharedButton = document.createElement('button');
    sharedButton.id = 'admin-db-shared';
    sharedButton.textContent = 'Fælles';
    sharedButton.style.cssText = `
        flex: 1;
        padding: 8px 12px;
        border: none;
        border-radius: 20px;
        background-color: #ff9ec5;
        color: #800033;
        cursor: pointer;
        transition: all 0.3s ease;
        font-weight: bold;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        outline: none;
        font-size: 12px;
    `;
    
    // Create single button
    const singleButton = document.createElement('button');
    singleButton.id = 'admin-db-single';
    singleButton.textContent = 'Jacob';
    singleButton.style.cssText = `
        flex: 1;
        padding: 8px 12px;
        border: none;
        border-radius: 20px;
        background-color: #ff9ec5;
        color: #800033;
        cursor: pointer;
        transition: all 0.3s ease;
        font-weight: bold;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        outline: none;
        font-size: 12px;
    `;
    
    // Add buttons to group
    buttonGroup.appendChild(sharedButton);
    buttonGroup.appendChild(singleButton);
    container.appendChild(buttonGroup);
    
    // Add container to body
    document.body.appendChild(container);
    
    // Set up button event listeners
    sharedButton.addEventListener('click', () => {
        updateDatabaseMode('shared');
        updateButtonStyles(sharedButton, singleButton);
    });
    
    singleButton.addEventListener('click', () => {
        updateDatabaseMode('single');
        updateButtonStyles(singleButton, sharedButton);
    });
    
    // Add hover effects
    [sharedButton, singleButton].forEach(button => {
        button.addEventListener('mouseover', () => {
            if (button.style.backgroundColor !== 'rgb(255, 94, 153)') {
                button.style.backgroundColor = '#ffb2d0';
                button.style.transform = 'translateY(-2px)';
                button.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.3)';
            }
        });
        
        button.addEventListener('mouseout', () => {
            if (button.style.backgroundColor !== 'rgb(255, 94, 153)') {
                button.style.backgroundColor = '#ff9ec5';
                button.style.transform = 'translateY(0)';
                button.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.2)';
            }
        });
    });
    
    // Set initial active button based on localStorage
    const savedMode = localStorage.getItem('databaseMode') || 'shared';
    if (savedMode === 'shared') {
        updateButtonStyles(sharedButton, singleButton);
    } else {
        updateButtonStyles(singleButton, sharedButton);
    }
    
    return { sharedButton, singleButton };
}

function updateButtonStyles(activeButton, inactiveButton) {
    activeButton.style.backgroundColor = '#ff5e99';
    activeButton.style.color = 'white';
    activeButton.style.boxShadow = '0 0 12px #ff5e99, 0 0 20px rgba(255, 105, 180, 0.4)';
    activeButton.classList.add('active-db-button');
    
    inactiveButton.style.backgroundColor = '#ff9ec5';
    inactiveButton.style.color = '#800033';
    inactiveButton.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.2)';
    inactiveButton.classList.remove('active-db-button');
}

// Update database mode and reinitialize
function updateDatabaseMode(mode) {
    localStorage.setItem('databaseMode', mode);
    initializeFirebase(mode);
}

// Add heartbeat animation to the active button
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
        
        .active-db-button {
            animation: heartbeat 2s infinite;
        }
    `;
    document.head.appendChild(style);
}

// Initialize everything on DOM content loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize with mode from localStorage
    const savedMode = localStorage.getItem('databaseMode') || 'shared';
    initializeFirebase(savedMode);
    
    // Create database mode indicator
    const { sharedButton, singleButton } = createDatabaseModeIndicator();
    
    // Add heartbeat animation
    addHeartbeatAnimation();
    
    // Listen for mode changes from other tabs/windows
    window.addEventListener('storage', (event) => {
        if (event.key === 'databaseMode') {
            if (event.newValue !== currentMode) {
                initializeFirebase(event.newValue);
                
                // Update button display
                if (event.newValue === 'shared') {
                    updateButtonStyles(sharedButton, singleButton);
                } else {
                    updateButtonStyles(singleButton, sharedButton);
                }
            }
        }
    });
    
    // Create search functionality for characters
    const characterControls = document.querySelector('.character-controls');
    if (characterControls) {
        const searchContainer = document.createElement('div');
        searchContainer.className = 'search-container';
        
        const searchInput = document.createElement('input');
        searchInput.type = 'text';
        searchInput.id = 'character-search';
        searchInput.placeholder = 'Search characters...';
        
        searchContainer.appendChild(searchInput);
        characterControls.parentNode.insertBefore(searchContainer, characterControls);

        // Search functionality
        searchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            const characterSections = document.querySelectorAll('.character-section');

            characterSections.forEach(section => {
                const characterName = section.querySelector('h3').textContent.toLowerCase();
                if (characterName.includes(searchTerm)) {
                    section.classList.remove('hidden');
                } else {
                    section.classList.add('hidden');
                }
            });
        });
    }
    
    // Create background search and buttons
    const controlsDiv = document.querySelector('.controls');
    if (controlsDiv) {
        const searchContainer = document.createElement('div');
        searchContainer.className = 'search-container';
        
        const searchInput = document.createElement('input');
        searchInput.type = 'text';
        searchInput.id = 'background-search';
        searchInput.placeholder = 'Search backgrounds...';
        
        searchContainer.appendChild(searchInput);
        const backgroundButtons = document.querySelector('.background-buttons');
        if (backgroundButtons) {
            controlsDiv.insertBefore(searchContainer, backgroundButtons);

            // Create background buttons
            // Clear existing buttons
            backgroundButtons.innerHTML = '';
            
            // Create new button-preview pairs
            Object.entries(backgrounds).forEach(([backgroundId, backgroundUrl]) => {
                const item = document.createElement('div');
                item.className = 'background-item';
                
                // Create button
                const button = document.createElement('button');
                button.textContent = backgroundId.replace(/_/g, ' ');
                button.onclick = () => updateBackground(backgroundId);
                
                // Create preview div
                const preview = document.createElement('div');
                preview.className = 'background-preview';
                preview.style.backgroundImage = `url(${backgroundUrl})`;
                
                // Add button and preview to item container
                item.appendChild(button);
                item.appendChild(preview);
                backgroundButtons.appendChild(item);
            });

            // Add search functionality
            searchInput.addEventListener('input', (e) => {
                const searchTerm = e.target.value.toLowerCase();
                const backgroundItems = document.querySelectorAll('.background-item');
                
                backgroundItems.forEach(item => {
                    const buttonText = item.querySelector('button').textContent.toLowerCase();
                    if (buttonText.includes(searchTerm)) {
                        item.classList.remove('hidden');
                    } else {
                        item.classList.add('hidden');
                    }
                });
            });
        }
    }
    
    // Create BGM buttons
    const bgmContainer = document.querySelector('.bgm-buttons');
    if (bgmContainer && bgm) {
        bgmContainer.innerHTML = '';
        Object.keys(bgm).forEach(songId => {
            const button = document.createElement('button');
            button.textContent = songId.replace(/_/g, ' ').toUpperCase();
            
            // Check if the button text contains 'dark' and add the theme class
            if (button.textContent.toLowerCase().includes('dark')) {
                button.classList.add('dark-theme');
            }

            // Check if the button text contains 'orange' and add the theme class
            if (button.textContent.toLowerCase().includes('theme')) {
                button.classList.add('orange-theme');
            }

            // Check if the button text contains 'dark_green' and add the theme class
            if (button.textContent.toLowerCase().includes('sv')) {
                button.classList.add('dark_green-theme');
            }

            // Check if the button text contains 'dark_pinkt' and add the theme class
            if (button.textContent.toLowerCase().includes('doki')) {
                button.classList.add('dark_pink-theme');
            }
            
            button.onclick = () => playBGM(songId);
            bgmContainer.appendChild(button);
        });
    }
    
    // Create floating navigation
    const nav = document.createElement('div');
    nav.className = 'floating-nav';

    // Define sections to jump to
    const sections = [
        { title: 'Backgrounds', selector: '.background-buttons' },
        { title: 'Characters', selector: '.character-controls' },
        { title: 'Music', selector: '.bgm-controls' },
    ];

    // Create buttons for each section
    sections.forEach(section => {
        const button = document.createElement('button');
        button.textContent = `Jump to ${section.title}`;
        
        button.addEventListener('click', () => {
            const element = document.querySelector(section.selector);
            if (element) {
                element.scrollIntoView({ 
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
        
        nav.appendChild(button);
    });

    // Add "Jump to Top" button
    const topButton = document.createElement('button');
    topButton.textContent = 'Back to Top';
    topButton.addEventListener('click', () => {
        window.scrollTo({ 
            top: 0,
            behavior: 'smooth'
        });
    });
    nav.appendChild(topButton);

    // Add navigation to the page
    document.body.appendChild(nav);
});

// Export necessary functions for external use
export {
    db,
    ref,
    set,
    onValue
};