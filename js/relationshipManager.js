// Character Relationship Manager
// Add this script to your project to enable user-friendly relationship management
import { getDatabase, ref, onValue, set } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-database.js";

// Only initialize character system if it's not already initialized
if (typeof window.characterRelationshipManager === 'undefined') {
    // Initialize the character relationship manager
    window.characterRelationshipManager = {
        init: function() {
            // Create overlay for relationship manager
            this.createRelationshipUI();
            // Add event listener to character menu button
            this.addCharacterButtonListener();
        },

        createRelationshipUI: function() {
            // Create relationship manager UI
            const relationshipUI = document.createElement('div');
            relationshipUI.id = 'relationship-manager';
            relationshipUI.className = 'relationship-manager hidden';
            
            relationshipUI.innerHTML = `
                <div class="relationship-container">
                    <div class="relationship-header">
                        <h2>Relationship Manager</h2>
                        <button class="close-relationship-manager">&times;</button>
                    </div>
                    <div class="relationship-content">
                        <div class="character-info">
                            <img src="" alt="Character" id="rel-character-avatar">
                            <div>
                                <h3 id="rel-character-name">Character Name</h3>
                                <span id="rel-character-type">Character Type</span>
                            </div>
                        </div>
                        
                        <div class="player-tabs">
                            <button class="player-tab active" data-player="james">Jakob</button>
                            <button class="player-tab" data-player="kaiko">Elias</button>
                        </div>
                        
                        <div class="relationship-status">
                            <div class="status-value">
                                <span id="rel-value">0</span>
                                <span class="rel-percent">%</span>
                            </div>
                            <div id="rel-stage" class="status-stage">Neutral</div>
                        </div>
                        
                        <div class="relationship-visual">
                            <div class="hearts-container" id="rel-hearts"></div>
                            <div class="progress-container">
                                <div class="progress-bar" id="rel-progress-bar"></div>
                            </div>
                        </div>
                        
                        <div class="slider-container">
                            <input type="range" id="rel-slider" min="-100" max="200" value="0" step="1">
                            <div class="slider-labels">
                                <span>Hadefuld</span>
                                <span>Neutral</span>
                                <span>Kæreste</span>
                                <span>Yandere</span>
                            </div>
                        </div>
                        
                        <div class="adjustment-controls">
                            <div class="control-buttons">
                                <button class="control-btn decrease-large" data-value="-10">-10</button>
                                <button class="control-btn decrease-medium" data-value="-5">-5</button>
                                <button class="control-btn decrease-small" data-value="-1">-1</button>
                                <input type="number" id="rel-input" min="-100" max="200" value="0">
                                <button class="control-btn increase-small" data-value="1">+1</button>
                                <button class="control-btn increase-medium" data-value="5">+5</button>
                                <button class="control-btn increase-large" data-value="10">+10</button>
                            </div>
                            <button id="save-relationship" class="save-btn">Gem Forhold (Save)</button>
                        </div>
                        
                        <div class="preset-container">
                            <h4>Hurtige Indstillinger (Quick Settings)</h4>
                            <div class="preset-buttons">
                                <button class="preset-btn negative" data-value="-100">Hadefuld<br>-100%</button>
                                <button class="preset-btn negative" data-value="-50">Negativ<br>-50%</button>
                                <button class="preset-btn neutral" data-value="0">Neutral<br>0%</button>
                                <button class="preset-btn positive" data-value="50">Bedste ven<br>50%</button>
                                <button class="preset-btn positive" data-value="100">Kæreste<br>100%</button>
                                <button class="preset-btn obsession" data-value="150">Besættelse<br>150%</button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            document.body.appendChild(relationshipUI);
            
            // Add event listeners
            document.querySelector('.close-relationship-manager').addEventListener('click', () => {
                relationshipUI.classList.add('hidden');
            });
            
            // Close on clicking outside the container
            relationshipUI.addEventListener('click', (e) => {
                if (e.target === relationshipUI) {
                    relationshipUI.classList.add('hidden');
                }
            });
            
            // Add player tab switching
            document.querySelectorAll('.player-tab').forEach(tab => {
                tab.addEventListener('click', () => {
                    // Remove active class from all tabs
                    document.querySelectorAll('.player-tab').forEach(t => t.classList.remove('active'));
                    // Add active to clicked tab
                    tab.classList.add('active');
                    
                    // Update relationship display for selected player
                    this.updateRelationshipDisplay(
                        this.currentCharacterId, 
                        this.currentCharacterType, 
                        tab.dataset.player
                    );
                });
            });
            
            // Add slider input event
            document.getElementById('rel-slider').addEventListener('input', (e) => {
                const value = parseInt(e.target.value);
                document.getElementById('rel-input').value = value;
                this.previewRelationshipChange(value);
            });
            
            // Add direct input event
            document.getElementById('rel-input').addEventListener('change', (e) => {
                const value = this.clampValue(parseInt(e.target.value) || 0);
                document.getElementById('rel-slider').value = value;
                document.getElementById('rel-input').value = value;
                this.previewRelationshipChange(value);
            });
            
            // Add control buttons events
            document.querySelectorAll('.control-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    const currentValue = parseInt(document.getElementById('rel-input').value);
                    const change = parseInt(btn.dataset.value);
                    const newValue = this.clampValue(currentValue + change);
                    
                    document.getElementById('rel-slider').value = newValue;
                    document.getElementById('rel-input').value = newValue;
                    this.previewRelationshipChange(newValue);
                });
            });
            
            // Add preset button events
            document.querySelectorAll('.preset-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    const value = parseInt(btn.dataset.value);
                    document.getElementById('rel-slider').value = value;
                    document.getElementById('rel-input').value = value;
                    this.previewRelationshipChange(value);
                });
            });
            
            // Add save button event
            document.getElementById('save-relationship').addEventListener('click', () => {
                this.saveRelationship();
            });
            
            // Add styles
            this.addStyles();
        },
        
        addCharacterButtonListener: function() {
            // Check the existing character module's expand buttons and add relationship functionality
            document.addEventListener('click', (e) => {
                if (e.target.classList.contains('expand-button')) {
                    const characterId = e.target.getAttribute('data-id');
                    const characterType = e.target.getAttribute('data-type');
                    
                    if (characterId && characterType) {
                        // Get the active player
                        const activePlayerTab = document.querySelector('.player-tab.active');
                        const playerKey = activePlayerTab ? activePlayerTab.dataset.player : 'james';
                        
                        // Open relationship manager
                        this.openRelationshipManager(characterId, characterType, playerKey);
                    }
                }
            });
        },
        
        // Get stage info based on percentage value
        // Get stage info based on percentage value
        getStageInfo: function(percentValue, characterType) {
            let stageName = 'Neutral';
            let thresholds;
            
            if (characterType === 'girls') {
                thresholds = [
                    { stage: 'Hadefuld', threshold: -100 },
                    { stage: 'Fjendtlig', threshold: -80 },
                    { stage: 'Meget negativ', threshold: -60 },
                    { stage: 'Negativ', threshold: -45 },
                    { stage: 'Irriteret', threshold: -30 },
                    { stage: 'Utilfreds', threshold: -20 },
                    { stage: 'Skeptisk', threshold: -10 },
                    { stage: 'Mindre værd', threshold: -5 },
                    { stage: 'Neutral', threshold: 0 },
                    { stage: 'Nysgerrig', threshold: 15 },
                    { stage: 'Venlig', threshold: 30 },
                    { stage: 'Venskab', threshold: 40 },
                    { stage: 'Bedste ven', threshold: 50 },
                    { stage: 'Interesseret', threshold: 60 },
                    { stage: 'Tiltrukket', threshold: 70 },
                    { stage: 'Forelsket', threshold: 80 },
                    { stage: 'Kærlighed', threshold: 90 },
                    { stage: 'Kæreste', threshold: 100 },
                    { stage: 'Besættelse', threshold: 150 },
                    { stage: 'Yandere', threshold: 200 }
                ];
            } else if (characterType === 'teachers') {
                thresholds = [
                    { stage: 'Hadefuld', threshold: -100 },
                    { stage: 'Fjendtlig', threshold: -80 },
                    { stage: 'Meget negativ', threshold: -60 },
                    { stage: 'Negativ', threshold: -45 },
                    { stage: 'Irriteret', threshold: -30 },
                    { stage: 'Utilfreds', threshold: -20 },
                    { stage: 'Skeptisk', threshold: -10 },
                    { stage: 'Mindre værd', threshold: -5 },
                    { stage: 'Neutral', threshold: 0 },
                    { stage: 'Observerende', threshold: 15 },
                    { stage: 'Støttende', threshold: 30 },
                    { stage: 'Respekteret', threshold: 45 },
                    { stage: 'Stolt', threshold: 60 },
                    { stage: 'Favorit', threshold: 75 },
                    { stage: 'Beskyttende', threshold: 85 },
                    { stage: 'Overbeskyttende', threshold: 100 }
                ];
            } else { // boys
                thresholds = [
                    { stage: 'Hadefuld', threshold: -100 },
                    { stage: 'Fjendtlig', threshold: -80 },
                    { stage: 'Meget negativ', threshold: -60 },
                    { stage: 'Negativ', threshold: -45 },
                    { stage: 'Irriteret', threshold: -30 },
                    { stage: 'Utilfreds', threshold: -20 },
                    { stage: 'Skeptisk', threshold: -10 },
                    { stage: 'Mindre værd', threshold: -5 },
                    { stage: 'Neutral', threshold: 0 },
                    { stage: 'Nysgerrig', threshold: 15 },
                    { stage: 'Venlig', threshold: 30 },
                    { stage: 'Venskab', threshold: 45 },
                    { stage: 'Tæt Venskab', threshold: 60 },
                    { stage: 'Loyal', threshold: 75 },
                    { stage: 'Broderskab', threshold: 90 },
                    { stage: 'Bedste ven', threshold: 100 }
                ];
            }
            
            // Find current stage based on percentage - ONE UNIFIED APPROACH
            for (let i = thresholds.length - 1; i >= 0; i--) {
                if (percentValue >= thresholds[i].threshold) {
                    stageName = thresholds[i].stage;
                    break;
                }
            }

            const progressBarWidth = Math.min(Math.abs(percentValue), 100);
            const isNegative = percentValue < 0;
            
            return {
                stageName,
                progressBarWidth,
                isNegative
            };
        },
        // Generate hearts based on percentage
        renderHearts: function(percentValue, characterType) {
            const isNegative = percentValue < 0;
            const isHighLevel = percentValue > 100;
            
            // Set icon and total hearts based on character type
            let icon, totalHearts;
            
            if (characterType === 'girls') {
                icon = '❤️';
                totalHearts = isNegative ? 8 : 12;
            } else if (characterType === 'teachers') {
                icon = '📚';
                totalHearts = 8;
            } else { // boys
                icon = '🤝';
                totalHearts = 8;
            }
            
            // Calculate filled hearts
            let filledHearts = 0;
            
            if (isNegative) {
                // For negative, calculate based on percentage
                filledHearts = Math.min(Math.ceil(8 * (Math.abs(percentValue) / 100)), totalHearts);
            } else {
                // For positive, calculate based on percentage
                filledHearts = Math.min(Math.ceil(totalHearts * (percentValue / 100)), totalHearts);
            }
            
            // Generate hearts HTML
            let heartsHTML = '';
            for (let i = 0; i < totalHearts; i++) {
                if (i < filledHearts) {
                    // Filled hearts
                    const heartEmoji = isNegative ? '🖤' : icon;
                    const highLevelClass = isHighLevel ? 'obsession-heart' : '';
                    heartsHTML += `<span class="heart-emoji active ${highLevelClass}">${heartEmoji}</span>`;
                } else {
                    // Empty hearts
                    heartsHTML += `<span class="heart-emoji">${icon}</span>`;
                }
            }
            
            return heartsHTML;
        },
        
        // Open relationship manager
        openRelationshipManager: function(characterId, characterType, playerKey) {
            this.currentCharacterId = characterId;
            this.currentCharacterType = characterType;
            this.currentPlayerKey = playerKey;
            
            // Get character info
            const db = getDatabase();
            const feelingRef = ref(db, `gameState/feelings/${characterId}`);
            
            onValue(feelingRef, (snapshot) => {
                const relationships = snapshot.val() || {};
                
                // Update the UI with the character info
                this.updateRelationshipUI(characterId, characterType, relationships, playerKey);
                
                // Show the relationship manager
                document.getElementById('relationship-manager').classList.remove('hidden');
            }, { onlyOnce: true });
        },
        
        // Update relationship UI
        updateRelationshipUI: function(characterId, characterType, relationships, playerKey) {
            // Get character data
            const characterData = this.getCharacterData(characterId, characterType);
            
            // Update header info
            document.getElementById('rel-character-name').textContent = characterData.name;
            document.getElementById('rel-character-avatar').src = characterData.image;
            document.getElementById('rel-character-type').textContent = this.getTypeLabel(characterType);
            
            // Update player tab
            document.querySelectorAll('.player-tab').forEach(tab => {
                tab.classList.toggle('active', tab.dataset.player === playerKey);
            });
            
            // Update relationship info
            this.updateRelationshipDisplay(characterId, characterType, playerKey);
        },
        
        // Update relationship display for the selected player
        updateRelationshipDisplay: function(characterId, characterType, playerKey) {
            const db = getDatabase();
            const feelingRef = ref(db, `gameState/feelings/${characterId}/${playerKey}`);
            
            onValue(feelingRef, (snapshot) => {
                const percentValue = snapshot.val() || 0;
                this.currentValue = percentValue;
                
                // Update value displays
                document.getElementById('rel-value').textContent = percentValue;
                document.getElementById('rel-input').value = percentValue;
                document.getElementById('rel-slider').value = percentValue;
                
                // Update stage and visuals
                const stageInfo = this.getStageInfo(percentValue, characterType);
                document.getElementById('rel-stage').textContent = stageInfo.stageName;
                
                // Update progress bar
                const progressBar = document.getElementById('rel-progress-bar');
                progressBar.style.width = `${stageInfo.progressBarWidth}%`;
                progressBar.className = `progress-bar ${stageInfo.isNegative ? 'negative' : ''}`;
                
                // Update hearts
                document.getElementById('rel-hearts').innerHTML = this.renderHearts(percentValue, characterType);
                
                // Update UI colors based on relationship value
                this.updateUIColors(percentValue);
            }, { onlyOnce: true });
        },
        
        // Preview relationship change without saving
        previewRelationshipChange: function(newValue) {
            // Update value display
            document.getElementById('rel-value').textContent = newValue;
            
            // Update stage and visuals
            const stageInfo = this.getStageInfo(newValue, this.currentCharacterType);
            document.getElementById('rel-stage').textContent = stageInfo.stageName;
            
            // Update progress bar
            const progressBar = document.getElementById('rel-progress-bar');
            progressBar.style.width = `${stageInfo.progressBarWidth}%`;
            progressBar.className = `progress-bar ${stageInfo.isNegative ? 'negative' : ''}`;
            
            // Update hearts
            document.getElementById('rel-hearts').innerHTML = this.renderHearts(newValue, this.currentCharacterType);
            
            // Update UI colors
            this.updateUIColors(newValue);
        },
        
        // Save relationship
        saveRelationship: function() {
            const newValue = parseInt(document.getElementById('rel-input').value);
            const characterId = this.currentCharacterId;
            const playerKey = document.querySelector('.player-tab.active').dataset.player;
            
            if (characterId && playerKey) {
                const db = getDatabase();
                const feelingRef = ref(db, `gameState/feelings/${characterId}/${playerKey}`);
                
                // Save to database
                set(feelingRef, newValue)
                    .then(() => {
                        // Show save confirmation
                        const saveBtn = document.getElementById('save-relationship');
                        saveBtn.classList.add('saved');
                        saveBtn.textContent = 'Gemt! (Saved!)';
                        
                        setTimeout(() => {
                            saveBtn.classList.remove('saved');
                            saveBtn.textContent = 'Gem Forhold (Save)';
                        }, 2000);
                        
                        // Also update the UI
                        this.currentValue = newValue;
                    })
                    .catch(error => {
                        console.error('Error saving relationship:', error);
                    });
            }
        },
        
        // Clamp value between min and max
        clampValue: function(value) {
            return Math.max(Math.min(value, 200), -100);
        },
        
        // Update UI colors based on relationship value
        updateUIColors: function(value) {
            const container = document.querySelector('.relationship-container');
            
            // Remove existing state classes
            container.classList.remove('negative-state', 'neutral-state', 'positive-state', 'obsession-state');
            
            // Add appropriate state class
            if (value < -20) {
                container.classList.add('negative-state');
            } else if (value < 20) {
                container.classList.add('neutral-state');
            } else if (value <= 100) {
                container.classList.add('positive-state');
            } else {
                container.classList.add('obsession-state');
            }
        },
        
        // Get character data
        getCharacterData: function(characterId, characterType) {
            let characterData = {
                name: characterId,
                image: "./assets/characters/default/head.png"
            };
            
            // Get from global character data (this matches what's in your data)
            const characterGroups = {
                'girls': {
                    akira: { name: "Akira", image: "./assets/characters/akira/head.png" },
                    mia: { name: "Mia", image: "./assets/characters/akemi/head.png" },
                    aiko: { name: "Aiko", image: "./assets/characters/aiko/head.png" },
                    aya: { name: "Aya", image: "./assets/characters/aya/head.png" },
                    ayano: { name: "Ayano", image: "./assets/characters/ayano/head.png" },
                    mika: { name: "Mika", image: "./assets/characters/mika/head.png" },
                    minako: { name: "Minako", image: "./assets/characters/minako/head.png" },
                    natsuki: { name: "Natsuki", image: "./assets/characters/natsuki/head.png" },
                    sakura: { name: "Sakura", image: "./assets/characters/sakura/head.png" },
                    sayori: { name: "Sayori", image: "./assets/characters/sayori/head.png" }
                },
                'boys': {
                    eddy: { name: "Eddy", image: "./assets/characters/eddy/head.png" },
                    vanny: { name: "Vanny", image: "./assets/characters/vanny/head.png" },
                    funtimefoxy: { name: "Funtime Foxy", image: "./assets/characters/FT/FTHappy.png" },
                    helpy: { name: "Helpy", image: "./assets/characters/helpy/head.png" },
                    bg: { name: "Bedste mor gris", image: "./assets/characters/bedste/head.png" },
                    puppet: { name: "Puppet", image: "./assets/characters/puppet/puppet_idle.png" },
                    spongebob: { name: "Svampebob", image: "./assets/characters/spongebob/head.png" },
                    pumbaa: { name: "Pumbaa", image: "./assets/characters/pumbaa/head.png" }
                },
                'teachers': {
                    rekter: { name: "Rekter", image: "./assets/characters/jacob/jacob.png" },
                    freddy: { name: "Freddy", image: "./assets/characters/freddy/head.png" },
                    toyfreddy: { name: "Toy Freddy", image: "./assets/characters/toyfreddy/toyfreddyNeutral.png" },
                    goldenfreddy: { name: "Golden Freddy", image: "./assets/characters/gf/gfIdle.png" },
                    squidward: { name: "Blækward", image: "./assets/characters/squidward/squidwardDC.png" },
                    foxy: { name: "Foxy", image: "./assets/characters/foxy/dc.png" },
                    glitchtrap: { name: "Glitchtrap", image: "./assets/characters/glitchtrap/head.png" },
                    baldi: { name: "Baldi", image: "./assets/characters/baldi/idle.png" },
                    sun: { name: "Sun", image: "./assets/characters/sun/head.png" },
                    bonnie: { name: "Bonnie", image: "./assets/characters/bonnie/glad.png" },
                    toy_bonnie: { name: "Toy Bonnie", image: "./assets/characters/toy_bonnie/tb_idle.png" }
                }
            };
            
            // Find character in appropriate group
            if (characterGroups[characterType] && characterGroups[characterType][characterId]) {
                characterData = characterGroups[characterType][characterId];
            }
            
            return characterData;
        },
        
        // Get type label
        getTypeLabel: function(characterType) {
            const labels = {
                'girls': 'Dating Character',
                'teachers': 'Teacher',
                'boys': 'Friend'
            };
            
            return labels[characterType] || characterType;
        },
        
        // Add styles
        addStyles: function() {
            const styleElement = document.createElement('style');
            styleElement.textContent = `
                /* Relationship Manager Styles */
                .relationship-manager {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background-color: rgba(0, 0, 0, 0.7);
                    z-index: 9999;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    padding: 20px;
                }
                
                .relationship-manager.hidden {
                    display: none;
                }
                
                .relationship-container {
                    background-color: var(--panel-bg, #f5f8f5);
                    width: 100%;
                    max-width: 600px;
                    border-radius: 15px;
                    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
                    overflow: hidden;
                    transition: all 0.3s ease;
                }
                
                /* Header */
                .relationship-header {
                    background-color: var(--primary, #4CAF50);
                    color: white;
                    padding: 15px 20px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    transition: background-color 0.3s ease;
                }
                
                .relationship-header h2 {
                    margin: 0;
                    font-size: 1.5rem;
                }
                
                .close-relationship-manager {
                    background: none;
                    border: none;
                    color: white;
                    font-size: 24px;
                    cursor: pointer;
                    width: 30px;
                    height: 30px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 50%;
                    transition: background-color 0.3s ease;
                }
                
                .close-relationship-manager:hover {
                    background-color: rgba(255, 255, 255, 0.2);
                }
                
                /* Content */
                .relationship-content {
                    padding: 20px;
                }
                
                /* Character info */
                .character-info {
                    display: flex;
                    align-items: center;
                    margin-bottom: 20px;
                }
                
                .character-info img {
                    width: 80px;
                    height: 80px;
                    border-radius: 50%;
                    margin-right: 15px;
                    border: 3px solid var(--primary, #4CAF50);
                    object-fit: cover;
                }
                
                .character-info h3 {
                    margin: 0 0 5px 0;
                    color: var(--text, #4a4a4a);
                    font-size: 1.4rem;
                }
                
                .character-info span {
                    color: var(--primary, #4CAF50);
                    font-size: 0.9rem;
                    font-weight: 500;
                }
                
                /* Player tabs */
                .player-tabs {
                    display: flex;
                    gap: 10px;
                    margin-bottom: 20px;
                }
                
                .player-tab {
                    flex: 1;
                    padding: 10px;
                    border: none;
                    border-radius: 10px;
                    background-color: #e0e0e0;
                    cursor: pointer;
                    font-weight: bold;
                    transition: all 0.2s ease;
                }
                
                .player-tab.active {
                    background-color: var(--primary, #4CAF50);
                    color: white;
                }
                
                /* Status display */
                .relationship-status {
                    text-align: center;
                    margin-bottom: 15px;
                }
                
                .status-value {
                    font-size: 2.5rem;
                    font-weight: bold;
                    color: var(--primary-dark, #388E3C);
                    display: flex;
                    align-items: baseline;
                    justify-content: center;
                    transition: color 0.3s ease;
                }
                
                .rel-percent {
                    font-size: 1.5rem;
                    margin-left: 3px;
                }
                
                .status-stage {
                    font-size: 1.2rem;
                    font-weight: 500;
                    transition: color 0.3s ease;
                }
                
                /* Visual elements */
                .relationship-visual {
                    margin-bottom: 20px;
                }
                
                .hearts-container {
                    display: flex;
                    justify-content: center;
                    font-size: 22px;
                    margin-bottom: 10px;
                }
                
                .heart-emoji {
                    margin: 0 3px;
                    opacity: 0.3;
                    filter: grayscale(100%);
                    transition: all 0.2s ease;
                }
                
                .heart-emoji.active {
                    opacity: 1;
                    filter: none;
                    animation: heartbeat 1.5s infinite;
                }
                
                @keyframes heartbeat {
                    0% { transform: scale(1); }
                    5% { transform: scale(1.2); }
                    10% { transform: scale(1); }
                    15% { transform: scale(1.1); }
                    20% { transform: scale(1); }
                    100% { transform: scale(1); }
                }
                
                .heart-emoji.obsession-heart {
                    animation: obsession 1s infinite;
                    filter: hue-rotate(45deg);
                }
                
                @keyframes obsession {
                    0% { transform: scale(1) rotate(0deg); }
                    25% { transform: scale(1.3) rotate(-5deg); }
                    50% { transform: scale(1) rotate(0deg); }
                    75% { transform: scale(1.3) rotate(5deg); }
                    100% { transform: scale(1) rotate(0deg); }
                }
                
                .progress-container {
                    height: 15px;
                    background-color: #e0e0e0;
                    border-radius: 10px;
                    overflow: hidden;
                }
                
                .progress-bar {
                    height: 100%;
                    width: 0;
                    background: linear-gradient(to right, var(--primary-light, #81C784), var(--primary, #4CAF50));
                    border-radius: 10px;
                    transition: width 0.3s ease, background 0.3s ease;
                }
                
                .progress-bar.negative {
                    background: linear-gradient(to right, #ef5350, #e53935);
                }
                
                /* Slider */
                .slider-container {
                    margin-bottom: 20px;
                }
                
                #rel-slider {
                    width: 100%;
                    height: 15px;
                    -webkit-appearance: none;
                    border-radius: 10px;
                    background: linear-gradient(to right, 
                        #e53935 0%, #e53935 33%, 
                        #e0e0e0 33%, #e0e0e0 34%, 
                        var(--primary, #4CAF50) 34%, var(--primary, #4CAF50) 67%,
                        #9c27b0 67%, #9c27b0 100%);
                    outline: none;
                    margin-bottom: 10px;
                }
                
                #rel-slider::-webkit-slider-thumb {
                    -webkit-appearance: none;
                    width: 25px;
                    height: 25px;
                    border-radius: 50%;
                    background: var(--primary-dark, #388E3C);
                    cursor: pointer;
                    border: 3px solid white;
                    box-shadow: 0 0 5px rgba(0, 0, 0, 0.3);
                }
                
                .slider-labels {
                    display: flex;
                    justify-content: space-between;
                    color: var(--text, #4a4a4a);
                    font-size: 0.9rem;
                }
                
                /* Adjustment controls */
                .adjustment-controls {
                    margin-bottom: 20px;
                }
                
                .control-buttons {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    gap: 5px;
                    margin-bottom: 15px;
                }
                
                .control-btn {
                    padding: 10px;
                    border: none;
                    border-radius: 5px;
                    cursor: pointer;
                    font-weight: bold;
                    width: 40px;
                    transition: all 0.2s ease;
                }
                
                .decrease-large, .decrease-medium, .decrease-small {
                    background-color: #ffcdd2;
                    color: #c62828;
                }
                
                .decrease-large:hover, .decrease-medium:hover, .decrease-small:hover {
                    background-color: #ef9a9a;
                }
                
                .increase-large, .increase-medium, .increase-small {
                    background-color: #c8e6c9;
                    color: #2e7d32;
                }
                
                .increase-large:hover, .increase-medium:hover, .increase-small:hover {
                    background-color: #a5d6a7;
                }
                
                #rel-input {
                    width: 70px;
                    padding: 10px;
                    border: 2px solid #ccc;
                    border-radius: 5px;
                    text-align: center;
                    font-size: 1rem;
                    font-weight: bold;
                }
                
                .save-btn {
                    width: 100%;
                    padding: 12px;
                    background-color: var(--primary, #4CAF50);
                    color: white;
                    border: none;
                    border-radius: 10px;
                    font-size: 1rem;
                    font-weight: bold;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }
                
                .save-btn:hover {
                    background-color: var(--primary-dark, #388E3C);
                }
                
                .save-btn.saved {
                    background-color: #8bc34a;
                }
                
                /* Preset buttons */
                .preset-container {
                    text-align: center;
                }
                
                .preset-container h4 {
                    margin-bottom: 15px;
                    color: var(--text, #4a4a4a);
                }
                
                .preset-buttons {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 10px;
                }
                
                .preset-btn {
                    padding: 15px 10px;
                    border: none;
                    border-radius: 10px;
                    cursor: pointer;
                    font-weight: bold;
                    transition: all 0.2s ease;
                }
                
                .preset-btn:hover {
                    transform: translateY(-3px);
                    box-shadow: 0 5px 10px rgba(0, 0, 0, 0.1);
                }
                
                .preset-btn.negative {
                    background-color: #ffcdd2;
                    color: #c62828;
                }
                
                .preset-btn.negative:hover {
                    background-color: #ef9a9a;
                }
                
                .preset-btn.neutral {
                    background-color: #e0e0e0;
                    color: #424242;
                }
                
                .preset-btn.neutral:hover {
                    background-color: #bdbdbd;
                }
                
                .preset-btn.positive {
                    background-color: #c8e6c9;
                    color: #2e7d32;
                }
                
                .preset-btn.positive:hover {
                    background-color: #a5d6a7;
                }
                
                .preset-btn.obsession {
                    background-color: #e1bee7;
                    color: #6a1b9a;
                }
                
                .preset-btn.obsession:hover {
                    background-color: #ce93d8;
                }
                
                /* State-based styling */
                .negative-state .relationship-header {
                    background-color: #e53935;
                }
                
                .negative-state .character-info img {
                    border-color: #e53935;
                }
                
                .negative-state .status-value,
                .negative-state .status-stage {
                    color: #e53935;
                }
                
                .negative-state .player-tab.active {
                    background-color: #e53935;
                }
                
                .negative-state .save-btn {
                    background-color: #e53935;
                }
                
                .negative-state .save-btn:hover {
                    background-color: #c62828;
                }
                
                .neutral-state .relationship-header {
                    background-color: #757575;
                }
                
                .neutral-state .character-info img {
                    border-color: #757575;
                }
                
                .neutral-state .player-tab.active {
                    background-color: #757575;
                }
                
                .neutral-state .save-btn {
                    background-color: #757575;
                }
                
                .neutral-state .save-btn:hover {
                    background-color: #424242;
                }
                
                .obsession-state .relationship-header {
                    background-color: #9c27b0;
                }
                
                .obsession-state .character-info img {
                    border-color: #9c27b0;
                }
                
                .obsession-state .status-value,
                .obsession-state .status-stage {
                    color: #9c27b0;
                }
                
                .obsession-state .player-tab.active {
                    background-color: #9c27b0;
                }
                
                .obsession-state .save-btn {
                    background-color: #9c27b0;
                }
                
                .obsession-state .save-btn:hover {
                    background-color: #6a1b9a;
                }
            `;
            
            document.head.appendChild(styleElement);
        }
    };

    // Initialize the character relationship manager
    window.characterRelationshipManager.init();
    
    // If we want to access this from the global scope:
    window.openRelationshipManager = function(characterId, characterType, playerKey) {
        window.characterRelationshipManager.openRelationshipManager(characterId, characterType, playerKey);
    };
}