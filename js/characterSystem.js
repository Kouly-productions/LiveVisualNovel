// characterSystem.js
import { getDatabase, ref, onValue, set } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-database.js";

// Constants for relationship stages
const relationshipStagePoints = {
    'Neutral': 0,
    'Nysgerrig': 50,
    'Venlig': 150,
    'Venskab': 200,
    'Interesseret': 250,
    'Tiltrukket': 400,
    'Forelsket': 800,
    'Kærlighed': 1200,
    'Eneste ene': 3000,
    'Besættelse': 4000,
    'Yandere': 5000
};

const relationshipStages = Object.keys(relationshipStagePoints);

// Character data
const characterData = {
    akira: {
        name: "Akira",
        image: "./assets/characters/akira/flirt1.png"
    },
    mika: {
        name: "Mika",
        image: "./assets/characters/mika/idle1.png"
    },
    sakura: {
        name: "Sakura",
        image: "./assets/characters/sakura/idle1.png"
    },
    aiko: {
        name: "Aiko",
        image: "./assets/characters/aiko/heart.png"
    },
    ayano: {
        name: "Ayano",
        image: "./assets/characters/ayano/shy1.png"
    },
    minako: {
        name: "Minako",
        image: "./assets/characters/minako/ohReally1.png"
    },
    monika: {
        name: "Monika",
        image: "./assets/characters/monika/flirt.png"
    },
    sayori: {
        name: "Sayori",
        image: "./assets/characters/sayori/glad.png"
    },
    natsuki: {
        name: "Natsuki",
        image: "./assets/characters/natsuki/smil.png"
    }
};

// Utility functions for relationship calculation
function getCurrentStageIndex(points) {
    let currentStage = 0;
    relationshipStages.forEach((stage, index) => {
        if (points >= relationshipStagePoints[stage]) {
            currentStage = index;
        }
    });
    return currentStage;
}

function calculateProgress(points) {
    const currentStageIndex = getCurrentStageIndex(points);
    
    if (currentStageIndex === relationshipStages.length - 1) {
        return 100;
    }

    const currentStagePoints = relationshipStagePoints[relationshipStages[currentStageIndex]];
    const nextStagePoints = relationshipStagePoints[relationshipStages[currentStageIndex + 1]];
    const pointsInCurrentStage = points - currentStagePoints;
    const pointsNeededForNextStage = nextStagePoints - currentStagePoints;

    const segmentProgress = pointsInCurrentStage / pointsNeededForNextStage;
    const baseProgress = (currentStageIndex / (relationshipStages.length - 1)) * 90;
    const additionalProgress = (segmentProgress / (relationshipStages.length - 1)) * 90;

    return Math.min(baseProgress + additionalProgress + 5, 100);
}

// UI Component Generation Functions
function createRelationshipTrack(character, relationship, isKaiko) {
    const points = relationship;
    const progress = calculateProgress(points);
    const currentStageIndex = getCurrentStageIndex(points);
    
    const progressBar = `
        <div class="progress-bar ${isKaiko ? 'kaiko' : 'james'}">
            <div class="progress-fill" style="width: ${progress}%"></div>
        </div>
    `;

    const stagesHTML = relationshipStages.map((stage, index) => {
        const stageClass = index < currentStageIndex ? 'completed'
            : index === currentStageIndex ? 'current' : '';
        const requiredPoints = relationshipStagePoints[stage];
        
        return `
            <div class="stage ${stageClass} ${isKaiko ? 'kaiko' : 'james'}">
                <div class="stage-dot"></div>
                <span class="stage-name">${stage}</span>
                <span class="stage-points">${requiredPoints}p</span>
            </div>
        `;
    }).join('');

    return `
        <div class="relationship-track">
            <div class="track-label">
                ${character.name}'s syn på ${isKaiko ? 'Kaiko' : 'James'}
                <span class="current-points">(${points}p)</span>
            </div>
            <div class="relationship-stages">
                ${progressBar}
                ${stagesHTML}
            </div>
        </div>
    `;
}

function createCharacterCard(character, relationships) {
    const kaikoPoints = relationships?.kaiko || 0;
    const jamesPoints = relationships?.james || 0;

    return `
        <div class="character-card">
            <img src="${character.image}" alt="${character.name}" class="character-portrait">
            <div class="character-info">
                <div class="character-name">${character.name}</div>
                ${createRelationshipTrack(character, kaikoPoints, true)}
                ${createRelationshipTrack(character, jamesPoints, false)}
            </div>
        </div>
    `;
}

function createMyInfoContent() {
    return `
        <div class="my-info-container">
            <div class="player-stats">
                <div class="player-section kaiko">
                    <h2>Kaiko</h2>
                    <div class="stats-grid">
                        <div class="stat-item">
                            <span class="stat-label">Money:</span>
                            <span class="stat-value">5000¥</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">Hunger:</span>
                            <div class="progress-bar"">
                                <div class="progress-fill" style="width: 75%;"></div>
                            </div>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">First:</span>
                            <div class="progress-bar" id="thirst-bar">
                                <div class="progress-fill" style="width: 60%;"></div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="player-section james">
                    <h2>James</h2>
                    <div class="stats-grid">
                        <div class="stat-item">
                            <span class="stat-label">Money:</span>
                            <span class="stat-value">3500¥</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">Hunger:</span>
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: 85%;"></div>
                            </div>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">First:</span>
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: 45%;"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="schedule-section">
                <h2>Timer</h2>
                <div class="schedule-grid">
                    <div class="schedule-item past">
                        <span class="time">08:30</span>
                        <span class="subject">Math</span>
                        <span class="teacher">Ms. Akira</span>
                    </div>
                    <div class="schedule-item current">
                        <span class="time">10:15</span>
                        <span class="subject">Physics</span>
                        <span class="teacher">Mr. Freddy</span>
                    </div>
                    <div class="schedule-item next">
                        <span class="time">13:00</span>
                        <span class="subject">Literature</span>
                        <span class="teacher">Baldi</span>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// UI Setup and Event Handlers
function createCharacterStatusUI() {
    const menuContainer = document.getElementById('character-menu-container').children[0];
    menuContainer.id = 'character-menu';
    
    const button = document.createElement('button');
    button.id = 'character_btn';
    button.textContent = 'Characters';
    menuContainer.appendChild(button);

    const overlay = document.createElement('div');
    overlay.id = 'character-status-overlay';
    overlay.classList.add('hidden');
    
    overlay.innerHTML = `
        <div id="character-status-window">
            <div class="tabs">
                <button class="tab-button active" data-tab="relations">Character Relations</button>
                <button class="tab-button" data-tab="info">My Info</button>
            </div>
            <div class="tab-content">
                <div id="relations-content" class="tab-pane active">
                    <!-- Character cards will be dynamically inserted here -->
                </div>
                <div id="info-content" class="tab-pane">
                    ${createMyInfoContent()}
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(overlay);

    // Event Listeners
    button.addEventListener('click', () => {
        overlay.classList.remove('hidden');
    });

    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            overlay.classList.add('hidden');
        }
    });

    // Tab switching functionality
    const tabButtons = overlay.querySelectorAll('.tab-button');
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Update active tab button
            tabButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            // Update active content
            const tabId = button.getAttribute('data-tab');
            const tabPanes = overlay.querySelectorAll('.tab-pane');
            tabPanes.forEach(pane => pane.classList.remove('active'));
            overlay.querySelector(`#${tabId}-content`).classList.add('active');
        });
    });
}

function updateCharacterDisplay(relationships) {
    const characterWindow = document.getElementById('relations-content');
    if (!characterWindow) return;

    characterWindow.innerHTML = Object.entries(characterData)
        .map(([id, char]) => createCharacterCard(char, relationships[id]))
        .join('');
}

// Initialize the system
function initializeCharacterSystem() {
    const db = getDatabase();
    const feelingsRef = ref(db, 'gameState/feelings');
    
    createCharacterStatusUI();

    // Listen for changes in relationships
    onValue(feelingsRef, (snapshot) => {
        const relationships = snapshot.val();
        updateCharacterDisplay(relationships);
    });
}

export { initializeCharacterSystem };