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

window.updateCharacter = function(characterId, expression, position) {
     // Check if character exists
    if (!characters[characterId]) {
        console.error(`Character ${characterId} not found!`);
        return;
    }

    // Check if expression exists for this character
    const characterSprite = characters[characterId].expressions[expression];
    if (!characterSprite) {
        console.error(`Expression ${expression} not found for character ${characterId}!`);
        return;
    }

    // Update the character at the specified position in Firebase
    const characterRef = ref(db, `currentScene/characters/${position}`);
    set(characterRef, characterSprite)
        .then(() => {
            document.getElementById('status').textContent = `Character ${characterId} with expression ${expression} updated at ${position}!`;
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

// Listen for scene changes
const sceneRef = ref(db, 'currentScene');
onValue(sceneRef, (snapshot) => {
    const data = snapshot.val();
    console.log('Current scene data:', data);
    document.getElementById('status').textContent = 'Data received: ' + JSON.stringify(data);
    updateDisplay(data);
});

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
}