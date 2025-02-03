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