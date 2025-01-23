import { initializeApp } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-app.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-database.js";

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

// Listen for scene changes
const sceneRef = ref(db, 'currentScene');
onValue(sceneRef, (snapshot) => {
    const data = snapshot.val();
    console.log('Scene data received:', data);
    
    // Update background
    if (data && data.background) {
        document.body.style.backgroundImage = `url(${data.background})`;
    }

    // Update dialogue
    if (data && data.dialogue) {
        const dialogueBox = document.getElementById('dialogue-box');
        const speakerBox = document.getElementById('character-name');
        
        if (dialogueBox) dialogueBox.textContent = data.dialogue.text;
        if (speakerBox) speakerBox.textContent = data.dialogue.speaker;
    }
});