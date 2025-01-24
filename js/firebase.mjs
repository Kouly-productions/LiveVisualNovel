import { initializeApp } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-app.js";
import { getDatabase, ref, set, onValue } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-database.js";
import { backgrounds } from './backgrounds.js';
import { characters } from './characters.js';

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

let selectedCharacter = null;
let selectedEmotion = null;

// Update background function
window.updateBackground = function(backgroundId) {
    if (!backgrounds[backgroundId]) {
        console.error(`Background ${backgroundId} not found!`);
        return;
    }

    const sceneRef = ref(db, 'currentScene/background');
    set(sceneRef, backgrounds[backgroundId])
        .then(() => {
            document.getElementById('status').textContent = 'Background updated successfully!';
        })
        .catch((error) => {
            document.getElementById('status').textContent = 'Error: ' + error.message;
        });
}

// Function to select emotion
window.selectEmotion = function(characterId, emotion) {
    selectedCharacter = characterId;
    selectedEmotion = emotion;
    
    // Visual feedback
    document.querySelectorAll('.emotion-buttons button').forEach(btn => {
        btn.classList.remove('selected');
    });
    event.target.classList.add('selected');
    
    document.getElementById('status').textContent = `Selected ${characterId} with ${emotion} emotion`;
}

// Function to place character in position
window.placeCharacter = function(position) {
    if (!selectedCharacter || !selectedEmotion) {
        document.getElementById('status').textContent = 'Please select a character and emotion first!';
        return;
    }

    updateCharacter(selectedCharacter, selectedEmotion, position);
}

// Update character function
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
        .then(() => {
            document.getElementById('status').textContent = `${characterId} with ${emotion} placed at ${position}!`;
        })
        .catch((error) => {
            document.getElementById('status').textContent = 'Error: ' + error.message;
        });
}

// Function to clear all characters
window.clearCharacters = function() {
    const charactersRef = ref(db, 'currentScene/characters');
    set(charactersRef, {
        left: "",
        center: "",
        right: ""
    })
        .then(() => {
            document.getElementById('status').textContent = 'All characters cleared!';
        })
        .catch((error) => {
            document.getElementById('status').textContent = 'Error: ' + error.message;
        });
}

// Set dialogue function
window.setDialogue = function(speakerId, text) {
    if (speakerId && !characters[speakerId]) {
        console.error(`Character ${speakerId} not found!`);
        return;
    }

    const dialogueRef = ref(db, 'currentScene/dialogue');
    set(dialogueRef, {
        speaker: speakerId ? characters[speakerId].name : '',
        text: text
    });
}

// Update display function
function updateDisplay(sceneData) {
    if (!sceneData) return;

    if (sceneData.background) {
        document.body.style.backgroundImage = `url(${sceneData.background})`;
    }

    if (sceneData.dialogue) {
        const dialogueText = document.querySelector('.dialogue-text');
        const characterName = document.querySelector('#character-name p');
        
        if (dialogueText) dialogueText.textContent = sceneData.dialogue.text;
        if (characterName) characterName.textContent = sceneData.dialogue.speaker;
    }

    // Update characters
    if (sceneData.characters) {
        // Clear all character positions first
        ['left', 'center', 'right'].forEach(position => {
            const container = document.getElementById(`${position}-character`);
            if (container) {
                container.innerHTML = '';
            }
        });

        // Update each position that has a character
        Object.entries(sceneData.characters).forEach(([position, imageUrl]) => {
            if (imageUrl && imageUrl !== "") {
                const container = document.getElementById(`${position}-character`);
                if (container) {
                    const img = document.createElement('img');
                    img.src = imageUrl;
                    img.classList.add('character-image');
                    container.appendChild(img);
                }
            }
        });
    }
}

// Single listener for scene changes
const sceneRef = ref(db, 'currentScene');
onValue(sceneRef, (snapshot) => {
    const data = snapshot.val();
    console.log('Current scene data:', data);
    
    // Update background and characters
    updateDisplay(data);
    
    // Update the user response if it exists
    if (data.playerText) {
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
    
    document.getElementById('status').textContent = 'Data received: ' + JSON.stringify(data);
});