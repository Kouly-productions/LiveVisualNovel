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

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

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
        .then(() => updateStatus('Background updated successfully!'))
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

// Initialize scene listener
const sceneRef = ref(db, 'currentScene');
onValue(sceneRef, (snapshot) => {
    const data = snapshot.val();
    console.log('Current scene data:', data);
    updateDisplay(data);
});

// Initialize BGM buttons when the page loads
document.addEventListener('DOMContentLoaded', () => {
    const container = document.querySelector('.bgm-buttons');
    if (container && bgm) {
        Object.keys(bgm).forEach(songId => {
            const button = document.createElement('button');
            button.textContent = songId.replace(/_/g, ' ').toUpperCase();
            button.onclick = () => playBGM(songId);
            container.appendChild(button);
        });
    }
});