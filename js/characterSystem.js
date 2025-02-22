import { getDatabase, ref, onValue, set } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-database.js";

// Relationship stage descriptions
const relationshipStageDescriptions = {
    'Neutral': 'Karakteren viser ingen særlig interesse i dig. De hilser måske, men glemmer dig hurtigt.',
    'Nysgerrig': 'Karakteren vil gerne lære mere om dig, og er villig til at stille dig spørgsmål',
    'Venlig': 'Karakteren smiler til dig, og kan godt lide at snakke med dig',
    'Venskab': 'Karakteren vil gerne være sammen med dig, personen deler personlige historier og stoler på dig',
    'Interesseret': 'Karakteren ligger mere mærke til dig, giver dig komplimenter og finder undskyldinger for at være sammen med dig',
    'Tiltrukket': 'Karakteren opfører sig mere nervøst eller energisk omkring dig, personen griner mere af dine vittigheder og finder måder at røre dig let på',
    'Forelsket': 'Karakteren er blevet forelsket i dig, og vil beskytte dig og føle at du er det vigtigste for dem om alt andet',
    'Kærlighed': 'En dyb og ægte kærlighed er opstået mellem jer.',
    'Eneste ene': 'Karakteren ser dig som deres eneste ene, og planlægger sin fremtid i hemmelighed sammen med dig.',
    'Besættelse': 'Karakteren har svært ved at acceptere afstand. De vil altid vide, hvor du er, og kan reagere stærkt på, hvis du trækker dig væk',
    'Yandere': 'Karakteren vil gøre ALT for at holde dig for sig selv – hun vik skubbe andre væk, manipulere situationer eller i værste fald bruge ekstreme midler for at sikre, at du aldrig forlader hende. Hun vil endda skade andre eller slå ijhel'
};

const teacherRelationshipDescriptions = {
    'Neutral': 'Et almindeligt lærer-elev forhold.',
    'Observerende': 'Læreren har bemærket dit potentiale.',
    'Støttende': 'Læreren ønsker aktivt at hjælpe dig med at udvikle dig.',
    'Respekteret': 'Du har vundet lærerens professionelle respekt.',
    'Stolt': 'Læreren er stolt af din udvikling og præstationer.',
    'Favorit': 'Du er blevet en af lærerens foretrukne elever.',
    'Beskyttende': 'Læreren føler et særligt ansvar for din trivsel.',
    'Overbeskyttende': 'Læreren er ekstremt fokuseret på din succes og sikkerhed.'
};

const nonDatableRelationshipDescriptions = {
    'Neutral': 'I kender knap nok hinanden.',
    'Nysgerrig': 'Der er en begyndende interesse for venskab.',
    'Venlig': 'En behagelig og afslappet relation er opstået.',
    'Venskab': 'Et ægte venskab er under udvikling.',
    'Tæt Venskab': 'I stoler på hinanden og deler personlige tanker.',
    'Loyal': 'En ubetinget loyalitet er opstået mellem jer.',
    'Broderskab': 'I ser hinanden som brødre/søstre.',
    'Bedste ven': 'Det stærkeste venskabsbånd er smedet mellem jer.'
};

// Constants for student relationship stages
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

// Constants for teacher relationship stages
const teacherRelationshipStagePoints = {
    'Neutral': 0,
    'Observerende': 50,
    'Støttende': 150,
    'Respekteret': 400,
    'Stolt': 800,
    'Favorit': 1200,
    'Beskyttende': 3000,
    'Overbeskyttende': 4000
};

const nonDatableRelationshipStagePoints = {
    'Neutral': 0,
    'Nysgerrig': 50,
    'Venlig': 150,
    'Venskab': 250,
    'Tæt Venskab': 400,
    'Loyal': 800,
    'Broderskab': 1200,
    'Bedste ven': 3000
};

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

const nonDatableCharacterData = {
    eddy: {
        name: "Eddy",
        image: "./assets/characters/eddy/eddyHappy.png"
    },
    vanny: {
        name: "Vanny",
        image: "./assets/characters/vanny/vanny.png"
    },
    funtimefoxy: {
        name: "Funtime Foxy",
        image: "./assets/characters/FT/FTHappy.png"
    },
    helpy: {
        name: "Helpy",
        image: "./assets/characters/helpy/helpydc.png"
    },
    bg: {
        name: "Bedste mor gris",
        image: "./assets/characters/bedste/bgLaugh.png"
    }
};

const teacherCharacterData = {
    rekter: {
        name: "Rekter",
        image: "./assets/characters/jacob/jacob.png"
    },
    freddy: {
        name: "Freddy",
        image: "./assets/characters/freddy/freddyNeutral.png"
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
        image: "./assets/characters/glitchtrap/glitchtrap.png"
    },
    bonnie: {
        name: "Bonnie",
        image: "./assets/characters/bonnie/glad.png"
    }
};

// Utility functions for student relationships
function getCurrentStageIndex(points) {
    let currentStage = 0;
    const stages = Object.keys(relationshipStagePoints);
    stages.forEach((stage, index) => {
        if (points >= relationshipStagePoints[stage]) {
            currentStage = index;
        }
    });
    return currentStage;
}

function calculateProgress(points) {
    const stages = Object.keys(relationshipStagePoints);
    const currentStageIndex = getCurrentStageIndex(points);
    
    if (currentStageIndex === stages.length - 1) {
        return 100;
    }

    const currentStagePoints = relationshipStagePoints[stages[currentStageIndex]];
    const nextStagePoints = relationshipStagePoints[stages[currentStageIndex + 1]];
    const pointsInCurrentStage = points - currentStagePoints;
    const pointsNeededForNextStage = nextStagePoints - currentStagePoints;

    const segmentProgress = pointsInCurrentStage / pointsNeededForNextStage;
    const baseProgress = (currentStageIndex / (stages.length - 1)) * 90;
    const additionalProgress = (segmentProgress / (stages.length - 1)) * 90;

    return Math.min(baseProgress + additionalProgress + 5, 100);
}

// Utility functions for teacher relationships
function getTeacherStageIndex(points) {
    let currentStage = 0;
    const stages = Object.keys(teacherRelationshipStagePoints);
    stages.forEach((stage, index) => {
        if (points >= teacherRelationshipStagePoints[stage]) {
            currentStage = index;
        }
    });
    return currentStage;
}

function calculateTeacherProgress(points) {
    const stages = Object.keys(teacherRelationshipStagePoints);
    const currentStageIndex = getTeacherStageIndex(points);
    
    if (currentStageIndex === stages.length - 1) {
        return 100;
    }

    const currentStagePoints = teacherRelationshipStagePoints[stages[currentStageIndex]];
    const nextStagePoints = teacherRelationshipStagePoints[stages[currentStageIndex + 1]];
    const pointsInCurrentStage = points - currentStagePoints;
    const pointsNeededForNextStage = nextStagePoints - currentStagePoints;

    const segmentProgress = pointsInCurrentStage / pointsNeededForNextStage;
    const baseProgress = (currentStageIndex / (stages.length - 1)) * 90;
    const additionalProgress = (segmentProgress / (stages.length - 1)) * 90;

    return Math.min(baseProgress + additionalProgress + 5, 100);
}

// Heart generation functions
function createHeartWithLabel(stage, index, currentStageIndex, points, descriptions, totalStages) {
    const filled = index <= currentStageIndex;
    const isCurrent = index === currentStageIndex;
    const position = index === 0 ? 'left' : index === totalStages - 1 ? 'right' : 'center';
    
    return `
        <div class="heart-container">
            <div class="heart ${filled ? 'filled' : ''} ${isCurrent ? 'current' : ''}" data-position="${position}">
                ❤️
                <div class="stage-tooltip tooltip-${position}">
                    <div class="tooltip-header">
                        <strong>${stage}</strong>
                        <span class="tooltip-points">${points}p</span>
                    </div>
                    <div class="tooltip-description">
                        ${descriptions[stage]}
                    </div>
                </div>
            </div>
            <div class="stage-label">${stage}</div>
        </div>
    `;
}

function createTeacherHeartWithLabel(stage, index, currentStageIndex, points, descriptions, totalStages) {
    const filled = index <= currentStageIndex;
    const isCurrent = index === currentStageIndex;
    const position = index === 0 ? 'left' : index === totalStages - 1 ? 'right' : 'center';

    return `
        <div class="heart-container">
            <div class="heart ${filled ? 'filled' : ''} ${isCurrent ? 'current' : ''}" data-position="${position}">
                📚
                <div class="stage-tooltip tooltip-${position}">
                    <div class="tooltip-header">
                        <strong>${stage}</strong>
                        <span class="tooltip-points">${points}p</span>
                    </div>
                    <div class="tooltip-description">
                        ${descriptions[stage]}
                    </div>
                </div>
            </div>
            <div class="stage-label">${stage}</div>
        </div>
    `;
}

function createNonDatableHeartWithLabel(stage, index, currentStageIndex, points, descriptions, totalStages) {
    const filled = index <= currentStageIndex;
    const isCurrent = index === currentStageIndex;
    const position = index === 0 ? 'left' : index === totalStages - 1 ? 'right' : 'center';

    return `
        <div class="heart-container">
            <div class="heart ${filled ? 'filled' : ''} ${isCurrent ? 'current' : ''}" data-position="${position}">
                🤝
                <div class="stage-tooltip tooltip-${position}">
                    <div class="tooltip-header">
                        <strong>${stage}</strong>
                        <span class="tooltip-points">${points}p</span>
                    </div>
                    <div class="tooltip-description">
                        ${descriptions[stage]}
                    </div>
                </div>
            </div>
            <div class="stage-label">${stage}</div>
        </div>
    `;
}

// Track creation functions
function createStudentRelationshipTrack(character, relationship, isKaiko) {
    const points = relationship;
    const stages = Object.keys(relationshipStagePoints);
    const totalStages = stages.length;
    const progress = calculateProgress(points);
    const currentStageIndex = getCurrentStageIndex(points);
    const currentStage = stages[currentStageIndex];
    
    const nextStage = stages[currentStageIndex + 1];
    const pointsNeeded = nextStage ? 
        relationshipStagePoints[nextStage] - points : 0;
    
    const playerClass = isKaiko ? 'kaiko' : 'james';

    const heartsHTML = stages.map((stage, index) => 
        createHeartWithLabel(stage, index, currentStageIndex, relationshipStagePoints[stage], relationshipStageDescriptions, totalStages)
    ).join('');

    return `
        <div class="relationship-track ${playerClass}">
            <div class="track-label">
                <span class="status-main-name">${isKaiko ? 'Kaiko' : 'James'}</span>
                <span class="current-points">${points}p (${currentStage})</span>
            </div>
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${progress}%"></div>
            </div>
            <div class="hearts-row">
                ${heartsHTML}
            </div>
            ${nextStage ? `
                <div class="current-stage">
                    ✨ ${currentStage} ✨ (${pointsNeeded} point indtil ${nextStage})
                </div>
            ` : ''}
        </div>
    `;
}

function createTeacherRelationshipTrack(character, relationship, isKaiko) {
    const points = relationship;
    const stages = Object.keys(teacherRelationshipStagePoints);
    const totalStages = stages.length;
    const progress = calculateTeacherProgress(points);
    const currentStageIndex = getTeacherStageIndex(points);
    const currentStage = stages[currentStageIndex];
    
    const nextStage = stages[currentStageIndex + 1];
    const pointsNeeded = nextStage ? 
        teacherRelationshipStagePoints[nextStage] - points : 0;
    
    const playerClass = isKaiko ? 'kaiko' : 'james';

    const heartsHTML = stages.map((stage, index) => 
        createTeacherHeartWithLabel(stage, index, currentStageIndex, teacherRelationshipStagePoints[stage], teacherRelationshipDescriptions, totalStages)
    ).join('');

    return `
        <div class="relationship-track ${playerClass}">
            <div class="track-label">
                <span class="status-main-name">${isKaiko ? 'Kaiko' : 'James'}</span>
                <span class="current-points">${points}p (${currentStage})</span>
            </div>
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${progress}%"></div>
            </div>
            <div class="hearts-row">
                ${heartsHTML}
            </div>
            ${nextStage ? `
                <div class="current-stage">
                    📚 ${currentStage} 📚 (${pointsNeeded} point indtil ${nextStage})
                </div>
            ` : ''}
        </div>
    `;
}

function createNonDatableRelationshipTrack(character, relationship, isKaiko) {
    const points = relationship;
    const stages = Object.keys(nonDatableRelationshipStagePoints);
    const totalStages = stages.length;
    const progress = calculateTeacherProgress(points);
    const currentStageIndex = getTeacherStageIndex(points);
    const currentStage = stages[currentStageIndex];
    
    const nextStage = stages[currentStageIndex + 1];
    const pointsNeeded = nextStage ? 
        nonDatableRelationshipStagePoints[nextStage] - points : 0;
    
    const playerClass = isKaiko ? 'kaiko' : 'james';

    const heartsHTML = stages.map((stage, index) => 
        createNonDatableHeartWithLabel(stage, index, currentStageIndex, nonDatableRelationshipStagePoints[stage], nonDatableRelationshipDescriptions, totalStages)
    ).join('');

    return `
        <div class="relationship-track ${playerClass}">
            <div class="track-label">
                <span class="status-main-name">${isKaiko ? 'Kaiko' : 'James'}</span>
                <span class="current-points">${points}p (${currentStage})</span>
            </div>
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${progress}%"></div>
            </div>
            <div class="hearts-row">
                ${heartsHTML}
            </div>
            ${nextStage ? `
                <div class="current-stage">
                    🤝 ${currentStage} 🤝 (${pointsNeeded} point indtil ${nextStage})
                </div>
            ` : ''}
        </div>
    `;
}

// Card creation functions
function createStudentCard(character, relationships) {
    const kaikoPoints = relationships?.kaiko || 0;
    const jamesPoints = relationships?.james || 0;

    return `
        <div class="character-card">
            <div class="character-info">
                <div class="character-header">
                    <img src="${character.image}" alt="${character.name}" class="character-portrait">
                    <div class="character-name">${character.name}</div>
                </div>
                ${createStudentRelationshipTrack(character, kaikoPoints, true)}
                ${createStudentRelationshipTrack(character, jamesPoints, false)}
            </div>
        </div>
    `;
}

function createTeacherCard(character, relationships) {
    const kaikoPoints = relationships?.kaiko || 0;
    const jamesPoints = relationships?.james || 0;

    return `
        <div class="character-card">
            <div class="character-info">
                <div class="character-header">
                    <img src="${character.image}" alt="${character.name}" class="character-portrait">
                    <div class="character-name">${character.name}</div>
                </div>
                ${createTeacherRelationshipTrack(character, kaikoPoints, true)}
                ${createTeacherRelationshipTrack(character, jamesPoints, false)}
            </div>
        </div>
    `;
}

function createNonDatableCard(character, relationships) {
    const kaikoPoints = relationships?.kaiko || 0;
    const jamesPoints = relationships?.james || 0;

    return `
        <div class="character-card">
            <div class="character-info">
                <div class="character-header">
                    <img src="${character.image}" alt="${character.name}" class="character-portrait">
                    <div class="character-name">${character.name}</div>
                </div>
                ${createNonDatableRelationshipTrack(character, kaikoPoints, true)}
                ${createNonDatableRelationshipTrack(character, jamesPoints, false)}
            </div>
        </div>
    `;
}

// Display update functions
function updateStudentDisplay(relationships) {
    const characterWindow = document.getElementById('relations-content');
    if (!characterWindow) return;

    characterWindow.innerHTML = Object.entries(characterData)
        .map(([id, char]) => createStudentCard(char, relationships[id]))
        .join('');
}

function updateTeacherDisplay(relationships) {
    const teacherWindow = document.getElementById('teachers-content');
    if (!teacherWindow) return;

    teacherWindow.innerHTML = Object.entries(teacherCharacterData)
        .map(([id, char]) => createTeacherCard(char, relationships[id]))
        .join('');
}

function updateBoysDisplay(relationships) {
    const boysWindow = document.getElementById('boys-content');
    if (!boysWindow) return;

    boysWindow.innerHTML = Object.entries(nonDatableCharacterData)
        .map(([id, char]) => createNonDatableCard(char, relationships[id]))
        .join('');
}

// UI creation and initialization
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
                <button class="tab-button active" data-tab="relations">Pige relationer</button>
                <button class="tab-button" data-tab="teachers">Lære Relationer</button>
                <button class="tab-button" data-tab="boys">Drenge Relationer</button>
            </div>
            <div class="tab-content">
                <div id="relations-content" class="tab-pane active">
                    <!-- Character cards will be dynamically inserted here -->
                </div>
                <div id="teachers-content" class="tab-pane">
                    <!-- Teacher cards will be dynamically inserted here -->
                </div>
                <div id="boys-content" class="tab-pane">
                    <!-- Boys cards will be dynamically inserted here -->
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
            tabButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            const tabId = button.getAttribute('data-tab');
            const tabPanes = overlay.querySelectorAll('.tab-pane');
            tabPanes.forEach(pane => pane.classList.remove('active'));
            
            if (tabId === 'relations') {
                overlay.querySelector('#relations-content').classList.add('active');
            } 
            else if (tabId === 'teachers') {
                overlay.querySelector('#teachers-content').classList.add('active');
            } 
            else if (tabId === 'boys') {
                overlay.querySelector('#boys-content').classList.add('active');
            }
        });
    });
}

function initializeCharacterSystem() {
    const db = getDatabase();
    const feelingsRef = ref(db, 'gameState/feelings');
    
    createCharacterStatusUI();

    onValue(feelingsRef, (snapshot) => {
        const relationships = snapshot.val();
        updateStudentDisplay(relationships);
        updateTeacherDisplay(relationships);
        updateBoysDisplay(relationships);
    });
}

export { initializeCharacterSystem };