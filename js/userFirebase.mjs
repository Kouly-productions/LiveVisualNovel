import { initializeApp } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-app.js";
import { getDatabase, ref, set, onValue } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-database.js";

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

// Handle send button click
document.getElementById('send-button').addEventListener('click', () => {
    const userInput = document.getElementById('user-input');
    const message = userInput.value.trim();
    
    if (message) {
        // Update the database with the new message
        const sceneRef = ref(db, 'currentScene');
        
        // First get current scene data
        onValue(sceneRef, (snapshot) => {
            const currentData = snapshot.val();
            
            // Update only the playerText field
            const updatedData = {
                ...currentData,
                playerText: message
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
            onlyOnce: true // Only read the data once
        });
    }
});

// Listen for scene changes
const sceneRef = ref(db, 'currentScene');
onValue(sceneRef, (snapshot) => {
    const data = snapshot.val();
    console.log('Scene data received:', data);
    
    // Update background
    if (data && data.background) {
        document.body.style.backgroundImage = `url(${data.background})`;
    }

    // Update characters
    if (data && data.characters) {
        // Clear all character positions first
        ['left', 'center', 'right'].forEach(position => {
            const container = document.getElementById(`${position}-character`);
            if (container) {
                container.innerHTML = '';
            }
        });

            // Update each position that has a character
            Object.entries(data.characters).forEach(([position, imageUrl]) => {
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
    

    // Update dialogue
    if (data && data.dialogue) {
        const dialogueBox = document.getElementById('dialogue-text');
        const speakerBox = document.getElementById('name-text');
        
        if (dialogueBox) dialogueBox.textContent = data.dialogue.text;
        if (speakerBox) speakerBox.textContent = data.dialogue.speaker;
    }
});