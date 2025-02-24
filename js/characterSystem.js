import { getDatabase, ref, onValue, set } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-database.js";

// Keep your relationship stage descriptions for tooltips
const relationshipStageDescriptions = {
    'Neutral': 'I kender knap nok hinanden',
    'Nysgerrig': 'vil gerne lære dig bedre at kende',
    'Venlig': 'Er glad for at snakke med dig',
    'Venskab': 'Deler personlige ting med dig',
    'Bedste ven': 'Ser dig som sin bedste ven',
    'Interesseret': 'Giver dig komplimenter og vil være sammen med dig',
    'Tiltrukket': 'Opfører sig anderledes omkring dig, og vil gerne være tættere på dig',
    'Forelsket': 'Er blevet forelsket i dig',
    'Kærlighed': 'Føler en dyb kærlighed til dig',
    'Eneste ene': 'Ser dig som deres eneste ene',
    'Besættelse': 'Kan ikke acceptere at komme væk fra dig',
    'Yandere': 'Vil gøre alt for at beholde dig - også skade andre.'
};

const teacherRelationshipDescriptions = {
    'Neutral': 'Ser dig som alle de andre elever',
    'Observerende': 'Ligger mere mærke til dig end de andre elever',
    'Støttende': 'Ønsker at hjælpe dig med at blive bedre.',
    'Respekteret': 'Respektere dig faktisk.',
    'Stolt': 'Stolt af dig, og stoler på dig',
    'Favorit': 'Du er en af lærerens yndlings elever.',
    'Beskyttende': 'Læreren føler at han har en ansvar over for dig.',
    'Overbeskyttende': 'Læren vil altid tro mere på dig end nogen anden'
};

const nonDatableRelationshipDescriptions = {
    'Neutral': 'I kender knap nok hinanden.',
    'Nysgerrig': 'Der er en begyndende interesse for venskab.',
    'Venlig': 'Karakteren er venlig over for dig, og er glad for at se dig.',
    'Venskab': 'Et ægte venskab.',
    'Tæt Venskab': 'I stoler på hinanden og deler personlige tanker.',
    'Loyal': 'Personen har ikke at dele personlige ting og hemmeligheder med dig',
    'Broderskab': 'I ser hinanden som brødre/søstre.',
    'Bedste ven': 'Det stærkeste venskab.'
};

// Stage thresholds for heart progression - these values will be used for determining stages
// but the actual progress will be directly calculated from the percentage (0-100)
const relationshipStageThresholds = [
    { stage: 'Neutral', threshold: 0 },
    { stage: 'Nysgerrig', threshold: 15 },
    { stage: 'Venlig', threshold: 30 },
    { stage: 'Venskab', threshold: 40 },
    { stage: 'Bedste ven', threshold: 50 },
    { stage: 'Interesseret', threshold: 60 },
    { stage: 'Tiltrukket', threshold: 70 },
    { stage: 'Forelsket', threshold: 80 },
    { stage: 'Kærlighed', threshold: 90 },
    { stage: 'Eneste ene', threshold: 100 },
    { stage: 'Besættelse', threshold: 150 },
    { stage: 'Yandere', threshold: 200 }
];

const teacherRelationshipThresholds = [
    { stage: 'Neutral', threshold: 0 },
    { stage: 'Observerende', threshold: 15 },
    { stage: 'Støttende', threshold: 30 },
    { stage: 'Respekteret', threshold: 45 },
    { stage: 'Stolt', threshold: 60 },
    { stage: 'Favorit', threshold: 75 },
    { stage: 'Beskyttende', threshold: 85 },
    { stage: 'Overbeskyttende', threshold: 100 }
];

const nonDatableRelationshipThresholds = [
    { stage: 'Neutral', threshold: 0 },
    { stage: 'Nysgerrig', threshold: 15 },
    { stage: 'Venlig', threshold: 30 },
    { stage: 'Venskab', threshold: 45 },
    { stage: 'Tæt Venskab', threshold: 60 },
    { stage: 'Loyal', threshold: 75 },
    { stage: 'Broderskab', threshold: 90 },
    { stage: 'Bedste ven', threshold: 100 }
];

// Character data unchanged
const characterData = {
    akira: {
        name: "Akira",
        image: "./assets/characters/akira/head.png"
    },
    akemi: {
        name: "Mia",
        image: "./assets/characters/akemi/head.png"
    },
    aiko: {
        name: "Aiko",
        image: "./assets/characters/aiko/head.png"
    },
    aya: {
        name: "Aya",
        image: "./assets/characters/aya/head.png"
    },
    ayano: {
        name: "Ayano",
        image: "./assets/characters/ayano/head.png"
    },
    mika: {
        name: "Mika",
        image: "./assets/characters/mika/head.png"
    },
    minako: {
        name: "Minako",
        image: "./assets/characters/minako/head.png"
    },
    monika: {
        name: "Monika",
        image: "./assets/characters/monika/head.png"
    },
    natsuki: {
        name: "Natsuki",
        image: "./assets/characters/natsuki/head.png"
    },
    sakura: {
        name: "Sakura",
        image: "./assets/characters/sakura/head.png"
    },
    sayori: {
        name: "Sayori",
        image: "./assets/characters/sayori/head.png"
    }
};

const nonDatableCharacterData = {
    eddy: {
        name: "Eddy",
        image: "./assets/characters/eddy/head.png"
    },
    vanny: {
        name: "Vanny",
        image: "./assets/characters/vanny/head.png"
    },
    funtimefoxy: {
        name: "Funtime Foxy",
        image: "./assets/characters/FT/FTHappy.png"
    },
    helpy: {
        name: "Helpy",
        image: "./assets/characters/helpy/head.png"
    },
    bg: {
        name: "Bedste mor gris",
        image: "./assets/characters/bedste/head.png"
    }
};

const teacherCharacterData = {
    rekter: {
        name: "Rekter",
        image: "./assets/characters/jacob/jacob.png"
    },
    freddy: {
        name: "Freddy",
        image: "./assets/characters/freddy/head.png"
    },
    toyfreddy: {
        name: "Toy Freddy",
        image: "./assets/characters/toyfreddy/toyfreddyNeutral.png"
    },
    goldenfreddy: {
        name: "Golden Freddy",
        image: "./assets/characters/gf/gfIdle.png"
    },
    squidward: {
        name: "Blækward",
        image: "./assets/characters/squidward/squidwardDC.png"
    },
    foxy: {
        name: "Foxy",
        image: "./assets/characters/foxy/dc.png"
    },
    glitchtrap: {
        name: "Glitchtrap",
        image: "./assets/characters/glitchtrap/head.png"
    },
    baldi: {
        name: "Baldi",
        image: "./assets/characters/baldi/idle.png"
    },
    bonnie: {
        name: "Bonnie",
        image: "./assets/characters/bonnie/glad.png"
    }
};

// Core utility functions for determining relationship stages based on percentage
function getStageData(percentValue, thresholds) {
    // Find current stage based on thresholds
    let currentStage = thresholds[0].stage;
    let currentThreshold = 0;
    let nextThreshold = 100;
    let nextStage = null;
    
    for (let i = 0; i < thresholds.length; i++) {
        if (percentValue >= thresholds[i].threshold) {
            currentStage = thresholds[i].stage;
            currentThreshold = thresholds[i].threshold;
            
            // Find next stage if there is one
            if (i < thresholds.length - 1) {
                nextStage = thresholds[i + 1].stage;
                nextThreshold = thresholds[i + 1].threshold;
            }
        } else {
            nextStage = thresholds[i].stage;
            nextThreshold = thresholds[i].threshold;
            break;
        }
    }
    
    // Calculate how much more needed for next stage
    const pointsNeeded = nextStage ? (nextThreshold - percentValue) : 0;
    
    return {
        currentStage,
        progress: percentValue,
        nextStage,
        pointsNeeded
    };
}

// Renders active/inactive hearts based on the percentage value
function renderHearts(percentValue, thresholds, icon = '❤️') {
    // Count how many stages have been achieved
    let filledHearts = 0;
    for (let threshold of thresholds) {
        if (percentValue >= threshold.threshold) {
            filledHearts++;
        } else {
            break; // Stop once we exceed the percentage
        }
    }

    // Total hearts is the number of stages
    const totalHearts = thresholds.length;
    let heartsHTML = '';
    for (let i = 0; i < totalHearts; i++) {
        if (i < filledHearts) {
            heartsHTML += `<span class="heart active">${icon}</span>`; // Filled heart
        } else {
            heartsHTML += `<span class="heart">${icon}</span>`; // Empty heart
        }
    }

    return heartsHTML;
}

// New card creation functions for the grid layout
function createCharacterCard(id, character, relationships, type) {
    // Get the active player from the UI or default to Jakob (james)
    const activePlayerElement = document.querySelector('.player-option.active');
    const isJakobActive = !activePlayerElement || activePlayerElement.classList.contains('jakob');
    const playerKey = isJakobActive ? 'james' : 'kaiko';
    const displayName = isJakobActive ? 'Jakob' : 'Elias';
    const playerClass = isJakobActive ? 'jakob' : 'elias';
    
    let percentage = {
        kaiko: 0,
        james: 0
    };

    if (relationships) {
        percentage.kaiko = relationships.kaiko || 0;
        percentage.james = relationships.james || 0;
    }
    
    let thresholds, descriptions, icon;
    
    if (type === 'girls') {
        thresholds = relationshipStageThresholds;
        descriptions = relationshipStageDescriptions;
        icon = '❤️';
    } else if (type === 'teachers') {
        thresholds = teacherRelationshipThresholds;
        descriptions = teacherRelationshipDescriptions;
        icon = '📚';
    } else { // boys
        thresholds = nonDatableRelationshipThresholds;
        descriptions = nonDatableRelationshipDescriptions;
        icon = '🤝';
    }
    
    // Get relationship data for the active player
    const { currentStage, progress } = getStageData(percentage[playerKey], thresholds);
    
    const typeLabel = type === 'girls' ? 'Datable' : (type === 'teachers' ? 'Teacher' : 'Friend');
    
    return `
        <div class="character-card" data-id="${id}" data-type="${type}">
            <div class="character-info">
                <img src="${character.image}" alt="${character.name}" class="character-avatar">
                <div class="character-details">
                    <h3 class="character-name">${character.name}</h3>
                    <span class="character-type">${typeLabel}</span>
                </div>
            </div>
            <div class="relationship-tracks">
                <div class="relationship-track" data-player="${playerKey}">
                    <div class="track-header">
                        <span class="player-name player-${playerClass}">${displayName}</span>
                        <span class="relationship-points">${percentage[playerKey]}% - <span class="relationship-status">${currentStage}</span></span>
                    </div>
                    <div class="progress-container">
                        <div class="progress-bar" style="width: ${progress}%;"></div>
                    </div>
                    <div class="hearts-container">
                        ${renderHearts(percentage[playerKey], thresholds, icon)}
                    </div>
                </div>
            </div>
            <button class="expand-button" data-id="${id}" data-type="${type}">+</button>
        </div>
    `;
}

// Create detailed popup for character
// Update createCharacterPopup function to include the player name parameter
function createCharacterPopup(id, character, relationships, type, playerName = 'kaiko') {
    // Convert to percentages for display
    let percentage = {
        kaiko: relationships?.kaiko || 0,
        james: relationships?.james || 0
    };

    if (relationships) {
        percentage.kaiko = relationships.kaiko || 0;
        percentage.james = relationships.james || 0;
    }
    
    let thresholds, descriptions, icon;
    
    if (type === 'girls') {
        thresholds = relationshipStageThresholds;
        descriptions = relationshipStageDescriptions;
        icon = '❤️';
    } else if (type === 'teachers') {
        thresholds = teacherRelationshipThresholds;
        descriptions = teacherRelationshipDescriptions;
        icon = '📚';
    } else { // boys
        thresholds = nonDatableRelationshipThresholds;
        descriptions = nonDatableRelationshipDescriptions;
        icon = '🤝';
    }
    
    // Get data for the selected player
    const playerKey = playerName === 'kaiko' ? 'kaiko' : 'james';
    const displayName = playerName === 'kaiko' ? 'Elias' : 'Jakob';
    
    // Current active player 
    const { currentStage, progress } = getStageData(percentage[playerKey], thresholds);
    
    const typeLabel = type === 'girls' ? 'Datable' : (type === 'teachers' ? 'Teacher' : 'Friend');
    
    // Create the relationship stages visualization
    let stagesVisualization = createStagesVisualization(thresholds, currentStage, percentage[playerKey], descriptions);
    
    return `
        <div class="popup-header">
            <img src="${character.image}" alt="${character.name}" class="popup-avatar" id="popupAvatar">
            <div>
                <h2 class="popup-name" id="popupName">${character.name}</h2>
                <span class="character-type" id="popupType">${typeLabel}</span>
            </div>
        </div>
        
        <div class="relationship-details" data-player="${playerKey}">
            <h3 class="player-name player-${playerName === 'kaiko' ? 'elias' : 'jakob'}">Relation med ${displayName}</h3>
            <div class="progress-container">
                <div class="progress-bar" id="popupProgress" style="width: ${progress}%;"></div>
            </div>
            
            <div class="hearts-container large">
                ${renderHearts(percentage[playerKey], thresholds, icon)}
            </div>
            
            <div class="current-stage-info">
                <div class="current-level">
                    <span class="level-label">Nuværende niveau:</span>
                    <span class="level-value">${currentStage} (${percentage[playerKey]}%)</span>
                </div>
                <p class="current-description">
                    ${descriptions[currentStage]}
                </p>
            </div>
            
            <div class="relationship-progression">
                <h4>Forhold Progression</h4>
                ${stagesVisualization}
            </div>
        </div>
    `;
}

function createStagesVisualization(thresholds, currentStage, currentPercentage, descriptions) {
    let html = '<div class="stages-container">';
    
    
    thresholds.forEach((threshold, index) => {
        const isCurrentStage = threshold.stage === currentStage;
        const isPastStage = currentPercentage >= threshold.threshold;
        const stageClass = isCurrentStage ? 'current' : (isPastStage ? 'completed' : 'future');
        
        // Get the next threshold value for width calculation
        const nextThreshold = index < thresholds.length - 1 ? thresholds[index + 1].threshold : 100;
        const stageWidth = index < thresholds.length - 1 ? 
            (nextThreshold - threshold.threshold) + '%' : 
            (100 - threshold.threshold) + '%';
        
        html += `
            <div class="stage-item ${stageClass}" 
                 style="--stage-width: ${stageWidth};" 
                 title="${threshold.stage}: ${descriptions[threshold.stage]}">
                <div class="stage-marker">
                    <span class="stage-number">${index + 1}</span>
                </div>
                <div class="stage-info">
                    <div class="stage-name">${threshold.stage}</div>
                    <div class="stage-threshold">${threshold.threshold}%</div>
                </div>
            </div>
        `;
    });
    
    html += '</div>';
    return html;
}


// Display update functions
function updateCharacterGridDisplay(relationships) {
    const characterGrid = document.querySelector('.characters-grid');
    if (!characterGrid) return;

    // Build the grid based on the active filter
    const activeFilter = document.querySelector('.filter-button.active').getAttribute('data-filter');
    
    let html = '';
    
    if (activeFilter === 'all' || activeFilter === 'girls') {
        Object.entries(characterData).forEach(([id, char]) => {
            html += createCharacterCard(id, char, relationships[id], 'girls');
        });
    }
    
    if (activeFilter === 'all' || activeFilter === 'teachers') {
        Object.entries(teacherCharacterData).forEach(([id, char]) => {
            html += createCharacterCard(id, char, relationships[id], 'teachers');
        });
    }
    
    if (activeFilter === 'all' || activeFilter === 'boys') {
        Object.entries(nonDatableCharacterData).forEach(([id, char]) => {
            html += createCharacterCard(id, char, relationships[id], 'boys');
        });
    }
    
    characterGrid.innerHTML = html;
    
    // Add click event listeners to all expand buttons
    document.querySelectorAll('.expand-button').forEach(button => {
        button.addEventListener('click', event => {
            const id = event.target.getAttribute('data-id');
            const type = event.target.getAttribute('data-type');
            
            let character, characterRelationship;
            
            if (type === 'girls') {
                character = characterData[id];
            } else if (type === 'teachers') {
                character = teacherCharacterData[id];
            } else { // boys
                character = nonDatableCharacterData[id];
            }
            
            characterRelationship = relationships[id] || { kaiko: 0, james: 0 };
            
            // Get currently active player
            const activePlayer = document.querySelector('.player-option.active').classList.contains('elias') ? 'kaiko' : 'james';
            
            const popup = document.getElementById('characterPopup');
            const popupContent = popup.querySelector('.popup-content');
            
            popupContent.innerHTML = `
                <button class="close-popup">&times;</button>
                ${createCharacterPopup(id, character, characterRelationship, type, activePlayer)}
            `;
            
            popup.classList.add('active');
            
            // Add close event listener
            popup.querySelector('.close-popup').addEventListener('click', () => {
                popup.classList.remove('active');
            });
        });
    });
}

// Apply search filter
function applySearchFilter(searchTerm) {
    const characterCards = document.querySelectorAll('.character-card');
    
    characterCards.forEach(card => {
        const characterName = card.querySelector('.character-name').textContent.toLowerCase();
        
        if (characterName.includes(searchTerm.toLowerCase())) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

// Switch active player
function switchActivePlayer(player) {
    // Toggle player buttons
    document.querySelectorAll('.player-option').forEach(opt => {
        opt.classList.remove('active');
    });
    document.querySelector(`.player-option.${player}`).classList.add('active');
    
    // Update all cards to show the selected player's relationship
    document.querySelectorAll('.character-card').forEach(card => {
        const id = card.getAttribute('data-id');
        const type = card.getAttribute('data-type');
        
        // Get the current data from global store
        const relationships = window.currentRelationships || {}; 
        const relationshipData = relationships[id] || { kaiko: 0, james: 0 };
        
        // Convert to percentage
        let percentage;
        if (player === 'elias') {
            percentage = relationshipData.kaiko || 0;
        } else {
            percentage = relationshipData.james || 0;
        }
        
        let thresholds, icon;
        if (type === 'girls') {
            thresholds = relationshipStageThresholds;
            icon = '❤️';
        } else if (type === 'teachers') {
            thresholds = teacherRelationshipThresholds;
            icon = '📚';
        } else { // boys
            thresholds = nonDatableRelationshipThresholds;
            icon = '🤝';
        }
        
        const { currentStage, progress } = getStageData(percentage, thresholds);
        
        // Update the track element
        const trackElement = card.querySelector('.relationship-track');
        trackElement.setAttribute('data-player', player === 'elias' ? 'kaiko' : 'james');
        
        const playerNameElement = trackElement.querySelector('.player-name');
        playerNameElement.className = `player-name player-${player}`;
        playerNameElement.textContent = player === 'elias' ? 'Elias' : 'Jakob';
        
        // Update the points display
        const pointsElement = trackElement.querySelector('.relationship-points');
        pointsElement.innerHTML = `${percentage}% - <span class="relationship-status">${currentStage}</span>`;
        
        // Update the progress bar
        const progressBar = trackElement.querySelector('.progress-bar');
        progressBar.style.width = `${progress}%`;
        
        // Update hearts
        const heartsContainer = trackElement.querySelector('.hearts-container');
        heartsContainer.innerHTML = renderHearts(percentage, thresholds, icon);
    });
}

// Create new UI structure
function createCharacterStatusUI() {
    const menuContainer = document.getElementById('character-menu-container').children[0];
    menuContainer.id = 'character-menu';
    
    const button = document.createElement('button');
    button.id = 'character_btn';
    button.textContent = 'Characters';
    button.classList.add('character-button');
    menuContainer.appendChild(button);

    const overlay = document.createElement('div');
    overlay.id = 'character-status-overlay';
    overlay.classList.add('hidden');
    
    overlay.innerHTML = `
        <div class="container">
            <h1>💕 Sweet Pink Dating Sim - Relationship Tracker 💕</h1>
            
            <!-- Player switcher - Note Jakob is active by default -->
            <div class="player-switch">
                <button class="player-option elias">Elias</button>
                <button class="player-option jakob active">Jakob</button>
            </div>
            
            <!-- Filter controls -->
            <div class="filter-controls">
                <button class="filter-button" data-filter="all">All Characters</button>
                <button class="filter-button active" data-filter="girls">Girls</button>
                <button class="filter-button" data-filter="teachers">Teachers</button>
                <button class="filter-button" data-filter="boys">Boys</button>
            </div>
            
            <!-- Search -->
            <div class="characters-search">
                <input type="text" class="search-input" placeholder="Search characters...">
            </div>
            
            <!-- Characters grid -->
            <div class="characters-grid">
                <!-- Characters will be dynamically inserted here -->
            </div>
            
            <div class="footer">
                Sweet Pink Dating Sim © 2025 - Relationship Tracker v2.0
            </div>
        </div>
        
        <!-- Character Details Popup -->
        <div class="character-details-popup" id="characterPopup">
            <div class="popup-content">
                <button class="close-popup">&times;</button>
                <!-- Character details will be dynamically inserted here -->
            </div>
        </div>
    `;
    
    // Rest of the function remains the same
    const styleElement = document.createElement('style');
    
    document.head.appendChild(styleElement);
    document.body.appendChild(overlay);

    // Event Listeners
    button.addEventListener('click', () => {
        overlay.classList.remove('hidden');
    });

    // Close on clicking outside container
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            overlay.classList.add('hidden');
        }
    });

    // Filter functionality
    const filterButtons = overlay.querySelectorAll('.filter-button');
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons
            filterButtons.forEach(btn => btn.classList.remove('active'));
            
            // Add active class to clicked button
            button.classList.add('active');
            
            // Update grid based on database values (happens in updateCharacterGridDisplay)
            const db = getDatabase();
            const feelingsRef = ref(db, 'gameState/feelings');
            onValue(feelingsRef, (snapshot) => {
                updateCharacterGridDisplay(snapshot.val());
            }, { onlyOnce: true });
        });
    });
    
    // Search functionality
    const searchInput = overlay.querySelector('.search-input');
    searchInput.addEventListener('input', () => {
        applySearchFilter(searchInput.value);
    });
    
    // Player switcher
    const playerOptions = overlay.querySelectorAll('.player-option');
    playerOptions.forEach(option => {
        option.addEventListener('click', () => {
            const player = option.classList.contains('elias') ? 'elias' : 'jakob';
            switchActivePlayer(player);
        });
    });
    
    // Initialize popup click outside to close
    const popup = overlay.querySelector('.character-details-popup');
    popup.addEventListener('click', (e) => {
        if (e.target === popup) {
            popup.classList.remove('active');
        }
    });
}

// Helper function to update a character's relationship value in the database
function updateRelationshipValue(characterId, player, percentValue) {
    // Store the percentage directly - no conversion needed
    const db = getDatabase();
    const feelingRef = ref(db, `gameState/feelings/${characterId}/${player === 'elias' ? 'kaiko' : 'james'}`);
    
    set(feelingRef, percentValue);
}

// Initialize the character system
function initializeCharacterSystem() {
    const db = getDatabase();
    const feelingsRef = ref(db, 'gameState/feelings');
    
    createCharacterStatusUI();

    onValue(feelingsRef, (snapshot) => {
        const relationships = snapshot.val();
        // Store relationships for use in player switching
        window.currentRelationships = relationships;
        updateCharacterGridDisplay(relationships);
    });
}

export { initializeCharacterSystem };