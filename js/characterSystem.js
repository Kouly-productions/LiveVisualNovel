import { getDatabase, ref, onValue, set } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-database.js";

/*──────────────────────────────
  CONSTANTS & THRESHOLDS
──────────────────────────────*/
// For girls, we now use two sets of descriptions & thresholds
const romanticDescriptions = {
    'Ingen interesse': 'Ser dig ikke på en romantisk måde',
    'Nysgerrig': 'Begynder at se dig i et mere interessant lys',
    'Synes godt om': 'Tænker på dig når du ikke er der',
    'Interesseret': 'Synes du er sød og vil være sammen med dig',
    'Tiltrukket': 'Vil gerne være tæt på dig hele tiden',
    'Forelsket': 'Er blevet forelsket i dig',
    'Kærlighed': 'Føler sig dybt forelsket i dig',
    'Kæreste': 'Ser dig som sin kæreste (Eller i er kærester)',
    'Besættelse': 'Kan ikke acceptere at komme væk fra dig',
    'Yandere': 'Vil gøre alt for at beholde dig - også skade andre.'
};

const friendshipDescriptions = {
    'Hadefuld': 'Hader dig intenst, og kan blive farligt',
    'Fjendtlig': 'Ser dig som en fjende, vil gerne straffe dig',
    'Meget negativ': 'Har stærke negative følelser for dig',
    'Negativ': 'Kan slet ikke lide dig',
    'Irriteret': 'Finder dig irriterende',
    'Utilfreds': 'Kan ikke lide dig',
    'Skeptisk': 'Stoler ikke på dig',
    'Mindre værd': 'Tillader at du er i samme rum',
    'Neutral': 'Kender dig næsten ikke',
    'Bekendt': 'Genkender dig og kan huske dit navn',
    'Venlig': 'Er glad for at snakke med dig',
    'Venskab': 'Føler sig tryg med dig og deler tanker',
    'Tæt ven': 'Stoler på dig med personlige problemer',
    'Bedste ven': 'Ser dig som sin bedste ven og fortrolige',
    'Uadskillelige': 'Vil altid være der for dig uanset hvad'
};

const teacherRelationshipDescriptions = {
    'Hadefuld': 'Vil forsøge at få dig smidt ud',
    'Fjendtlig': 'Ønsker at straffe dig ofte',
    'Meget negativ': 'Ser dig som person som et problem',
    'Negativ': 'Vil helst undgå dig',
    'Irriteret': 'Finder dig irriterende',
    'Utilfreds': 'Er utilfreds med dig',
    'Skeptisk': 'Stoler ikke på dig',
    'Mindre værd': 'Kan lide dig mindre end de andre',
    'Neutral': 'Ser dig som alle de andre elever',
    'Observerende': 'Ligger mere mærke til dig end de andre elever',
    'Støttende': 'Ønsker at hjælpe dig med at blive bedre.',
    'Respekteret': 'Respektere dig faktisk.',
    'Stolt': 'Stolt af dig, og stoler på dig',
    'Favorit': 'Du er en af lærerens yndlings elever.',
    'Beskyttende': 'Vil passe godt på dig.',
    'Overbeskyttende': 'Vil altid vælge din side'
};

const nonDatableRelationshipDescriptions = {
    'Neutral': 'Kender dig næsten ikke.',
    'Nysgerrig': 'Vil gerne snakke mere med dig.',
    'Venlig': 'Venlig over for dig, og er glad for at se dig.',
    'Venskab': 'Stoler på dig.',
    'Tæt Venskab': 'Deler personlige ting om sig selv',
    'Loyal': 'Er der altid for dig, når du har brug for det',
    'Broderskab': 'I ser hinanden som bror/søster.',
    'Bedste ven': 'Det stærkeste venskab.'
};

// Thresholds for girls – separate values for friendship and romantic
const romanticThresholds = [
    { stage: 'Ingen interesse', threshold: 0 }, // This is our "neutral" equivalent for romantic
    { stage: 'Nysgerrig', threshold: 10 },
    { stage: 'Synes godt om', threshold: 25 },
    { stage: 'Interesseret', threshold: 40 },
    { stage: 'Tiltrukket', threshold: 60 },
    { stage: 'Forelsket', threshold: 80 },
    { stage: 'Kærlighed', threshold: 90 },
    { stage: 'Kæreste', threshold: 100 },
    { stage: 'Besættelse', threshold: 150 },
    { stage: 'Yandere', threshold: 200 }
];

const friendshipThresholds = [
    { stage: 'Hadefuld', threshold: -100 },
    { stage: 'Fjendtlig', threshold: -80 },
    { stage: 'Meget negativ', threshold: -60 },
    { stage: 'Negativ', threshold: -45 },
    { stage: 'Irriteret', threshold: -30 },
    { stage: 'Utilfreds', threshold: -20 },
    { stage: 'Skeptisk', threshold: -10 },
    { stage: 'Mindre værd', threshold: -5 },
    { stage: 'Neutral', threshold: 0 },
    { stage: 'Bekendt', threshold: 15 },
    { stage: 'Venlig', threshold: 30 },
    { stage: 'Venskab', threshold: 50 },
    { stage: 'Tæt ven', threshold: 70 },
    { stage: 'Bedste ven', threshold: 90 },
    { stage: 'Uadskillelige', threshold: 100 }
];

const teacherRelationshipThresholds = [
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

const nonDatableRelationshipThresholds = [
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

/*──────────────────────────────
  CHARACTER DATA
──────────────────────────────*/
const characterData = {
    akira: {
        name: "Akira",
        image: "./assets/characters/akira/head.png"
    },
    mia: {
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
    },
    reika: {
        name: "Reika",
        image: "./assets/characters/reika/head.png"
    },
    funtimefoxy: {
        name: "Funtime Foxy",
        image: "./assets/characters/FT/FTHappy.png"
    },
    vanny: {
        name: "Vanny",
        image: "./assets/characters/vanny/head.png"
    },
    bg: {
        name: "Bedste mor gris",
        image: "./assets/characters/bedste/head.png"
    },
};

const nonDatableCharacterData = {
    eddy: {
        name: "Eddy",
        image: "./assets/characters/eddy/head.png"
    },
    helpy: {
        name: "Helpy",
        image: "./assets/characters/helpy/head.png"
    },
    jan: {
        name: "Jan",
        image: "./assets/characters/jan/head.png"
    },
    shaggy: {
        name: "Stuppe",
        image: "./assets/characters/shaggy/head.png"
    },
    puppet: {
        name: "Puppet",
        image: "./assets/characters/puppet/puppet_idle.png"
    },
    spongebob: {
        name: "Svampebob",
        image: "./assets/characters/spongebob/head.png"
    },
    pumbaa: {
        name: "Pumbaa",
        image: "./assets/characters/pumbaa/head.png"
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
    dawko: {
        name: "Dawko",
        image: "./assets/characters/dawko/head.png"
    },
    markiplier: {
        name: "Markiplier",
        image: "./assets/characters/markiplier/head.png"
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
    oogway: {
        name: "Oogway",
        image: "./assets/characters/oogway/head.png"
    },
    sun: {
        name: "Sun",
        image: "./assets/characters/sun/head.png"
    },
    bonnie: {
        name: "Bonnie",
        image: "./assets/characters/bonnie/glad.png"
    },
    toy_bonnie: {
        name: "Toy Bonnie",
        image: "./assets/characters/toy_bonnie/tb_idle.png"
    }
};

/*──────────────────────────────
  UTILITY FUNCTIONS
──────────────────────────────*/
// Determines stage info based on percentage and thresholds
function getStageData(percentValue, thresholds) {
    let currentStage = thresholds[0].stage;
    let nextStage = null;
    let pointsNeeded = 0;
    const isNegative = percentValue < 0;

    if (isNegative) {
        for (let i = thresholds.length - 1; i >= 0; i--) {
            if (thresholds[i].threshold < 0) {
                const previousThreshold = i > 0 ? thresholds[i - 1].threshold : -Infinity;
                if (percentValue > previousThreshold && percentValue <= thresholds[i].threshold) {
                    currentStage = thresholds[i].stage;
                    nextStage = i < thresholds.length - 1 ? thresholds[i + 1].stage : null;
                    pointsNeeded = nextStage ? (thresholds[i + 1].threshold - percentValue) : 0;
                    break;
                }
            }
        }
    } else {
        for (let i = 0; i < thresholds.length; i++) {
            const nextThreshold = i < thresholds.length - 1 ? thresholds[i + 1].threshold : Infinity;
            if (percentValue >= thresholds[i].threshold && percentValue < nextThreshold) {
                currentStage = thresholds[i].stage;
                nextStage = i < thresholds.length - 1 ? thresholds[i + 1].stage : null;
                pointsNeeded = nextStage ? (thresholds[i + 1].threshold - percentValue) : 0;
                break;
            }
        }
    }
    return {
        currentStage,
        progress: percentValue,
        progressBarWidth: isNegative ? Math.abs(percentValue) : percentValue,
        isNegative,
        nextStage,
        pointsNeeded
    };
}

// Renders hearts based on the value and thresholds
// Modified to handle friendship and romantic differently
function renderHearts(percentValue, thresholds, icon, isRomantic = false) {
    const isNegative = percentValue < 0;
    const isHighLevel = percentValue > 100;
    
    // Total hearts remains the same
    let totalHearts = (icon === '📚' || icon === '🤝') ? 8 : (isNegative ? 8 : 12);
    
    // For friendship, we'll use plain hearts without special effects
    const neutralIndex = thresholds.findIndex(t => {
        // For romantic relationships, "Ingen interesse" is our base (neutral) stage
        if (isRomantic) return t.stage === 'Ingen interesse';
        return t.stage === 'Neutral';
    });
    
    if (neutralIndex === -1) {
        console.error(`Base stage not found in thresholds for ${isRomantic ? 'romantic' : 'friendship'} relationship`);
        return '';
    }
    
    const negativeThresholds = thresholds.slice(0, neutralIndex).reverse();
    let filledHearts = 0;
    
    if (isNegative) {
        for (let i = 0; i < negativeThresholds.length; i++) {
            if (percentValue <= negativeThresholds[i].threshold) {
                filledHearts = i + 1;
            } else { break; }
        }
    } else {
        const denominator = 100;
        filledHearts = Math.min(totalHearts, Math.max(0, Math.round(totalHearts * (percentValue / denominator))));
    }
    
    let heartsHTML = '';
    for (let i = 0; i < totalHearts; i++) {
        if (i < filledHearts) {
            const heartEmoji = isNegative ? '🖤' : icon;
            // Only add special effects for romantic hearts
            const highLevelClass = (isRomantic && isHighLevel) ? 'obsession-heart' : '';
            heartsHTML += `<span class="heart active ${highLevelClass}">${heartEmoji}</span>`;
        } else {
            heartsHTML += `<span class="heart">${icon}</span>`;
        }
    }
    return heartsHTML;
}

// Creates stages visualization (tooltip for each stage)
// Modified to handle cases where "Neutral" doesn't exist (like in romantic relationships)
function createStagesVisualization(thresholds, currentStage, currentPercentage, descriptions, isRomantic = false) {
    let html = '<div class="stages-container">';
    
    // For romantic relationships, use "Ingen interesse" as the base stage
    const neutralStage = isRomantic ? 'Ingen interesse' : 'Neutral';
    const neutralIndex = thresholds.findIndex(t => t.stage === neutralStage);
    
    if (neutralIndex === -1) {
        console.error(`${neutralStage} stage not found in thresholds`);
        return `<div>Error: ${neutralStage} stage not found</div>`;
    }
    
    const currentStageIndex = thresholds.findIndex(t => t.stage === currentStage);
    const isNegativeRelationship = currentPercentage < 0;
    
    thresholds.forEach((threshold, index) => {
        const stageNumber = index - neutralIndex;
        const isCurrentStage = index === currentStageIndex;
        const isNegativeStage = threshold.threshold < 0 || (threshold.stage === neutralStage && isNegativeRelationship);
        
        let isPastStage = false;
        if (isNegativeRelationship) {
            isPastStage = (index >= currentStageIndex && index <= neutralIndex);
        } else {
            isPastStage = (index >= neutralIndex && index <= currentStageIndex);
        }
        
        let stageClass = 'future';
        if (isCurrentStage) {
            stageClass = isNegativeStage ? 'current-negative' : 'current';
        } else if (isPastStage) {
            stageClass = isNegativeStage ? 'completed-negative' : 'completed';
        }
        
        const nextThreshold = index < thresholds.length - 1 ? thresholds[index + 1].threshold : 100;
        const stageWidth = index < thresholds.length - 1 ? (nextThreshold - threshold.threshold) + '%' : (100 - threshold.threshold) + '%';
        
        html += `
            <div class="stage-item ${stageClass}" style="--stage-width: ${stageWidth};">
                <div class="stage-marker"><span class="stage-number">${stageNumber}</span></div>
                <div class="stage-info">
                    <div class="stage-name">${threshold.stage}</div>
                    <div class="stage-threshold">${threshold.threshold}%</div>
                </div>
                <span class="tooltip-text">${descriptions[threshold.stage]}</span>
            </div>
        `;
    });
    
    html += '</div>';
    return html;
}

/*──────────────────────────────
  CARD & POPUP CREATION
──────────────────────────────*/
// Creates a character card. For girls, shows two separate bars.
function createCharacterCard(id, character, relationships, type) {
    // Determine active player from UI (defaults to Jakob)
    const activePlayerElement = document.querySelector('.player-option.active');
    const isJakobActive = !activePlayerElement || activePlayerElement.classList.contains('jakob');
    const playerKey = isJakobActive ? 'james' : 'kaiko';
    const displayName = isJakobActive ? 'Jakob' : 'Elias';
    const playerClass = isJakobActive ? 'jakob' : 'elias';

    if (type === 'girls') {
        // For girls, expect relationships with two fields: romantic & friendship
        const romanticValue = relationships?.romantic ? (relationships.romantic[playerKey] || 0) : 0;
        const friendshipValue = relationships?.friendship ? (relationships.friendship[playerKey] || 0) : 0;
        const isDatable = relationships?.datable ?? true;
        const typeLabel = isDatable ? 'Kan dates' : 'Har kæreste';
        const romanticData = getStageData(romanticValue, romanticThresholds);
        const friendshipData = getStageData(friendshipValue, friendshipThresholds);
        
        // Assign classes based on relationship values
        let romanticClass = '';
        if (romanticValue === 100) {
            romanticClass = 'perfect-relationship';
        } else if (romanticValue > 100) {
            romanticClass = 'above-perfect-relationship';
        }
        
        let friendshipClass = '';
        if (friendshipValue === 100) {
            friendshipClass = 'perfect-relationship';
        } else if (friendshipValue > 100) {
            friendshipClass = 'above-perfect-relationship';
        }
        
        // Define icons for each bar
        const romanticIcon = '💖';
        const friendshipIcon = '🤝';
        
        return `
            <div class="character-card" data-id="${id}" data-type="${type}">
                <div class="character-info">
                    <img src="${character.image}" alt="${character.name}" class="character-avatar">
                    <div class="character-details">
                        <h3 class="character-name">${character.name}</h3>
                        <span class="character-type">${typeLabel}</span>
                    </div>
                </div>
                <div class="relationship-tracks girls">
                    <div class="relationship-track romantic ${romanticClass}" data-player="${playerKey}" data-field="romantic">
                        <div class="track-header">
                            <span class="relationship-label">💖 Romantik</span>
                            <span class="relationship-points">${romanticValue}% - <span class="relationship-status" data-field="romantic">${romanticData.currentStage}</span></span>
                        </div>
                        <div class="progress-container">
                            <div class="progress-bar ${romanticData.isNegative ? 'negative' : ''}" style="width: ${romanticData.progressBarWidth}%;"></div>
                        </div>
                        <div class="hearts-container">
                            ${renderHearts(romanticValue, romanticThresholds, romanticIcon, true)}
                        </div>
                    </div>
                    <div class="relationship-track friendship ${friendshipClass}" data-player="${playerKey}" data-field="friendship">
                        <div class="track-header">
                            <span class="relationship-label">🤝 Venskab</span>
                            <span class="relationship-points">${friendshipValue}% - <span class="relationship-status" data-field="friendship">${friendshipData.currentStage}</span></span>
                        </div>
                        <div class="progress-container">
                            <div class="progress-bar ${friendshipData.isNegative ? 'negative' : ''}" style="width: ${friendshipData.progressBarWidth}%;"></div>
                        </div>
                        <div class="hearts-container">
                            ${renderHearts(friendshipValue, friendshipThresholds, friendshipIcon, false)}
                        </div>
                    </div>
                </div>
                <button class="expand-button" data-id="${id}" data-type="${type}">+</button>
            </div>
        `;
    } else {
        // For teachers and boys (non-datable)
        let percentage = { kaiko: 0, james: 0 };
        if (relationships) { percentage[playerKey] = relationships[playerKey] || 0; }
        let thresholds, descriptions, icon, typeLabel;
        if (type === 'teachers') {
            thresholds = teacherRelationshipThresholds;
            descriptions = teacherRelationshipDescriptions;
            icon = '📚';
            typeLabel = 'Lære';
        } else {
            thresholds = nonDatableRelationshipThresholds;
            descriptions = nonDatableRelationshipDescriptions;
            icon = '🤝';
            typeLabel = 'Ven';
        }
        const data = getStageData(percentage[playerKey], thresholds);
        
        // Add relationship class
        let relationshipClass = '';
        if (percentage[playerKey] === 100) {
            relationshipClass = 'perfect-relationship';
        } else if (percentage[playerKey] > 100) {
            relationshipClass = 'above-perfect-relationship';
        }
        
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
                    <div class="relationship-track ${relationshipClass}" data-player="${playerKey}">
                        <div class="track-header">
                            <span class="player-name player-${playerClass}">${displayName}</span>
                            <span class="relationship-points">${percentage[playerKey]}% - <span class="relationship-status">${data.currentStage}</span></span>
                        </div>
                        <div class="progress-container">
                            <div class="progress-bar ${data.isNegative ? 'negative' : ''}" style="width: ${data.progressBarWidth}%;"></div>
                        </div>
                        <div class="hearts-container">
                            ${renderHearts(percentage[playerKey], thresholds, icon, false)}
                        </div>
                    </div>
                </div>
                <button class="expand-button" data-id="${id}" data-type="${type}">+</button>
            </div>
        `;
    }
}

// Creates a detailed popup. For girls, shows separate sections for romantic and friendship.
function createCharacterPopup(id, character, relationships, type, activePlayerName = 'kaiko') {
    const playerKey = activePlayerName === 'kaiko' ? 'kaiko' : 'james';
    let popupHTML = `
        <div class="popup-header">
            <img src="${character.image}" alt="${character.name}" class="popup-avatar" id="popupAvatar">
            <div>
                <h2 class="popup-name" id="popupName">${character.name}</h2>
            </div>
        </div>
    `;
    if (type === 'girls') {
        // For girls, extract both relationship values
        const romanticValue = relationships?.romantic ? (relationships.romantic[playerKey] || 0) : 0;
        const friendshipValue = relationships?.friendship ? (relationships.friendship[playerKey] || 0) : 0;
        const isDatable = relationships?.datable ?? true;
        const typeLabel = isDatable ? 'Datable' : 'Optaget';
        const romanticData = getStageData(romanticValue, romanticThresholds);
        const friendshipData = getStageData(friendshipValue, friendshipThresholds);
        const romanticIcon = '💖';
        const friendshipIcon = '🤝';
        
        // Create separate sections for each bar
        popupHTML += `
            ${!isDatable ? '<p class="taken-note">Denne karakter er optaget og kan ikke dates.</p>' : ''}
            <div class="relationship-details girls" data-player="${playerKey}">
                <h3>${typeLabel}</h3>
                <div class="relationship-section" data-field="romantic">
                    <h4>💖 Romantisk Forhold</h4>
                    <div class="progress-container">
                        <div class="progress-bar ${romanticData.isNegative ? 'negative' : ''}" id="popupProgress-romantic" style="width: ${romanticData.progressBarWidth}%;"></div>
                    </div>
                    <div class="hearts-container large" id="heartsContainer-romantic">
                        ${renderHearts(romanticValue, romanticThresholds, romanticIcon, true)}
                    </div>
                    <div class="relationship-progression">
                        <h5>Romantisk Progression</h5>
                        ${createStagesVisualization(romanticThresholds, romanticData.currentStage, romanticValue, romanticDescriptions, true)}
                    </div>
                    <div class="relationship-editor" data-field="romantic">
                        <h4>Rediger Romantisk Forhold</h4>
                        <div class="current-value">
                            <span class="value-label">Nuværende værdi:</span>
                            <span class="value-display" id="currentValue-romantic">${romanticValue}</span>%
                        </div>
                        <div class="adjustment-controls">
                            <div class="preset-buttons">
                                <button class="adjustment-btn" data-field="romantic" data-adjust="-25">-25</button>
                                <button class="adjustment-btn" data-field="romantic" data-adjust="-10">-10</button>
                                <button class="adjustment-btn" data-field="romantic" data-adjust="-5">-5</button>
                                <button class="adjustment-btn" data-field="romantic" data-adjust="-1">-1</button>
                                <button class="adjustment-btn" data-field="romantic" data-adjust="1">+1</button>
                                <button class="adjustment-btn" data-field="romantic" data-adjust="5">+5</button>
                                <button class="adjustment-btn" data-field="romantic" data-adjust="10">+10</button>
                                <button class="adjustment-btn" data-field="romantic" data-adjust="25">+25</button>
                            </div>
                        </div>
                        <div class="save-controls">
                            <button class="save-relationship-btn" data-id="${id}" data-player="${playerKey}" data-field="romantic">Gem Romantiske Ændringer</button>
                            <div class="save-feedback" id="saveFeedback-romantic"></div>
                        </div>
                    </div>
                </div>
                <div class="relationship-section" data-field="friendship">
                    <h4>🤝 Venskabs Forhold</h4>
                    <div class="progress-container">
                        <div class="progress-bar ${friendshipData.isNegative ? 'negative' : ''}" id="popupProgress-friendship" style="width: ${friendshipData.progressBarWidth}%;"></div>
                    </div>
                    <div class="hearts-container large" id="heartsContainer-friendship">
                        ${renderHearts(friendshipValue, friendshipThresholds, friendshipIcon, false)}
                    </div>
                    <div class="relationship-progression">
                        <h5>Venskabs Progression</h5>
                        ${createStagesVisualization(friendshipThresholds, friendshipData.currentStage, friendshipValue, friendshipDescriptions, false)}
                    </div>
                    <div class="relationship-editor" data-field="friendship">
                        <h4>Rediger Venskab</h4>
                        <div class="current-value">
                            <span class="value-label">Nuværende værdi:</span>
                            <span class="value-display" id="currentValue-friendship">${friendshipValue}</span>%
                        </div>
                        <div class="adjustment-controls">
                            <div class="preset-buttons">
                                <button class="adjustment-btn" data-field="friendship" data-adjust="-25">-25</button>
                                <button class="adjustment-btn" data-field="friendship" data-adjust="-10">-10</button>
                                <button class="adjustment-btn" data-field="friendship" data-adjust="-5">-5</button>
                                <button class="adjustment-btn" data-field="friendship" data-adjust="-1">-1</button>
                                <button class="adjustment-btn" data-field="friendship" data-adjust="1">+1</button>
                                <button class="adjustment-btn" data-field="friendship" data-adjust="5">+5</button>
                                <button class="adjustment-btn" data-field="friendship" data-adjust="10">+10</button>
                                <button class="adjustment-btn" data-field="friendship" data-adjust="25">+25</button>
                            </div>
                        </div>
                        <div class="save-controls">
                            <button class="save-relationship-btn" data-id="${id}" data-player="${playerKey}" data-field="friendship">Gem Venskabs Ændringer</button>
                            <div class="save-feedback" id="saveFeedback-friendship"></div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    } else {
        // For teachers and boys – single relationship value
        let percentage = { kaiko: 0, james: 0 };
        if (relationships) { percentage[playerKey] = relationships[playerKey] || 0; }
        let thresholds, descriptions, icon, typeLabel;
        if (type === 'teachers') {
            thresholds = teacherRelationshipThresholds;
            descriptions = teacherRelationshipDescriptions;
            icon = '📚';
            typeLabel = 'Teacher';
        } else {
            thresholds = nonDatableRelationshipThresholds;
            descriptions = nonDatableRelationshipDescriptions;
            icon = '🤝';
            typeLabel = 'Friend';
        }
        const data = getStageData(percentage[playerKey], thresholds);
        popupHTML += `
            <div class="relationship-details" data-player="${playerKey}">
                <div class="progress-container">
                    <div class="progress-bar ${data.isNegative ? 'negative' : ''}" id="popupProgress" style="width: ${data.progressBarWidth}%;"></div>
                </div>
                <div class="hearts-container large">
                    ${renderHearts(percentage[playerKey], thresholds, icon, false)}
                </div>
                <div class="relationship-progression">
                    <h4>Forhold Progression</h4>
                    ${createStagesVisualization(thresholds, data.currentStage, percentage[playerKey], descriptions, false)}
                </div>
                <div class="relationship-editor">
                    <h4>Rediger Forhold</h4>
                    <div class="current-value">
                        <span class="value-label">Nuværende værdi:</span>
                        <span class="value-display" id="currentValue">${percentage[playerKey]}</span>%
                    </div>
                    <div class="adjustment-controls">
                        <div class="preset-buttons">
                            <button class="adjustment-btn" data-adjust="-25">-25</button>
                            <button class="adjustment-btn" data-adjust="-10">-10</button>
                            <button class="adjustment-btn" data-adjust="-5">-5</button>
                            <button class="adjustment-btn" data-adjust="-1">-1</button>
                            <button class="adjustment-btn" data-adjust="1">+1</button>
                            <button class="adjustment-btn" data-adjust="5">+5</button>
                            <button class="adjustment-btn" data-adjust="10">+10</button>
                            <button class="adjustment-btn" data-adjust="25">+25</button>
                        </div>
                    </div>
                    <div class="save-controls">
                        <button class="save-relationship-btn" data-id="${id}" data-player="${playerKey}">Gem Ændringer</button>
                        <div class="save-feedback" id="saveFeedback"></div>
                    </div>
                </div>
            </div>
        `;
    }
    return popupHTML;
}

/*──────────────────────────────
  DISPLAY & EVENT HANDLERS
──────────────────────────────*/
function updateCharacterGridDisplay(relationships) {
    const characterGrid = document.querySelector('.characters-grid');
    if (!characterGrid) return;
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
    document.querySelectorAll('.expand-button').forEach(button => {
        button.addEventListener('click', event => {
            const id = event.target.getAttribute('data-id');
            const type = event.target.getAttribute('data-type');
            let character, characterRelationship;
            if (type === 'girls') {
                character = characterData[id];
            } else if (type === 'teachers') {
                character = teacherCharacterData[id];
            } else {
                character = nonDatableCharacterData[id];
            }
            characterRelationship = relationships[id] || (type === 'girls' ? { romantic: { kaiko: 0, james: 0 }, friendship: { kaiko: 0, james: 0 } } : { kaiko: 0, james: 0 });
            const activePlayer = document.querySelector('.player-option.active').classList.contains('elias') ? 'kaiko' : 'james';
            const popup = document.getElementById('characterPopup');
            const popupContent = popup.querySelector('.popup-content');
            popupContent.innerHTML = `
                <button class="close-popup">&times;</button>
                ${createCharacterPopup(id, character, characterRelationship, type, activePlayer)}
            `;
            popup.classList.add('active');
            popup.querySelector('.close-popup').addEventListener('click', () => { popup.classList.remove('active'); });
            setupRelationshipEditorListeners(popup, id, type, activePlayer, characterRelationship);
        });
    });
}

function setupRelationshipEditorListeners(popup, characterId, type, playerKey, relationships) {
    // For girls, set up listeners for both "romantic" and "friendship" fields.
    if (type === 'girls') {
        // Setup each relationship field independently
        ['romantic', 'friendship'].forEach(field => {
            const currentValueElement = popup.querySelector(`#currentValue-${field}`);
            let currentValue = relationships?.[field] ? (relationships[field][playerKey] || 0) : 0;
            let newValue = currentValue;
            
            // Update display for this specific field
            const updateValueDisplay = (value) => {
                const el = popup.querySelector(`#currentValue-${field}`);
                if (el) { el.textContent = value; }
                updateRelationshipPreview(popup, value, type, playerKey, field);
            };
            
            // Setup adjustment buttons for this field
            popup.querySelectorAll(`.adjustment-btn[data-field="${field}"]`).forEach(button => {
                button.addEventListener('click', () => {
                    const adjustment = parseInt(button.getAttribute('data-adjust'));
                    // For romantic relationships, don't allow negative values
                    if (field === 'romantic') {
                        newValue = Math.max(0, Math.min(200, newValue + adjustment));
                    } else {
                        newValue = Math.max(-100, Math.min(200, newValue + adjustment));
                    }
                    updateValueDisplay(newValue);
                });
            });
            
            // Setup save button for this field
            popup.querySelector(`.save-relationship-btn[data-field="${field}"]`).addEventListener('click', () => {
                const newValue = parseInt(popup.querySelector(`#currentValue-${field}`).textContent);
                saveRelationshipTypeValue(characterId, playerKey, field, newValue);
                
                const feedbackElement = popup.querySelector(`#saveFeedback-${field}`);
                feedbackElement.textContent = 'Gemt!';
                feedbackElement.classList.add('success');
                setTimeout(() => {
                    feedbackElement.textContent = '';
                    feedbackElement.classList.remove('success');
                }, 2000);
            });
        });
    } else {
        // Single value case for teachers and boys
        const currentValueElement = popup.querySelector('#currentValue');
        let currentValue = currentValueElement ? parseInt(currentValueElement.textContent) : 0;
        let newValue = currentValue;
        
        const updateValueDisplay = (value) => {
            const el = popup.querySelector('#currentValue');
            if (el) { el.textContent = value; }
            updateRelationshipPreview(popup, value, type, playerKey);
        };
        
        popup.querySelectorAll('.adjustment-btn').forEach(button => {
            button.addEventListener('click', () => {
                const adjustment = parseInt(button.getAttribute('data-adjust'));
                newValue = Math.max(-100, Math.min(200, newValue + adjustment));
                updateValueDisplay(newValue);
            });
        });
        
        popup.querySelector('.save-relationship-btn').addEventListener('click', () => {
            saveRelationshipValue(characterId, playerKey, newValue);
            
            const feedbackElement = popup.querySelector('#saveFeedback');
            feedbackElement.textContent = 'Gemt!';
            feedbackElement.classList.add('success');
            setTimeout(() => {
                feedbackElement.textContent = '';
                feedbackElement.classList.remove('success');
            }, 2000);
        });
    }
}

function updateRelationshipPreview(popup, newValue, type, playerKey, field = null) {
    let thresholds, icon, isRomantic = false;
    
    if (type === 'girls' && field) {
        if (field === 'romantic') {
            thresholds = romanticThresholds;
            icon = '💖';
            isRomantic = true;
        } else if (field === 'friendship') {
            thresholds = friendshipThresholds;
            icon = '🤝';
        }
        
        const data = getStageData(newValue, thresholds);
        
        // Update status for the specific field
        const statusElement = popup.querySelector(`.relationship-section[data-field="${field}"] .relationship-status`);
        if (statusElement) { statusElement.textContent = data.currentStage; }
        
        // Update progress bar for the specific field
        const progressBar = popup.querySelector(`#popupProgress-${field}`);
        if (progressBar) {
            progressBar.style.width = `${data.progressBarWidth}%`;
            if (data.isNegative) { progressBar.classList.add('negative'); }
            else { progressBar.classList.remove('negative'); }
        }
        
        // Update hearts container for the specific field
        const heartsContainer = popup.querySelector(`#heartsContainer-${field}`);
        if (heartsContainer) {
            heartsContainer.innerHTML = renderHearts(newValue, thresholds, icon, isRomantic);
        }
    } else {
        if (type === 'teachers') {
            thresholds = teacherRelationshipThresholds;
            icon = '📚';
        } else {
            thresholds = nonDatableRelationshipThresholds;
            icon = '🤝';
        }
        
        const data = getStageData(newValue, thresholds);
        
        const statusElement = popup.querySelector('.relationship-status');
        if (statusElement) { statusElement.textContent = data.currentStage; }
        
        const progressBar = popup.querySelector('#popupProgress');
        if (progressBar) {
            progressBar.style.width = `${data.progressBarWidth}%`;
            if (data.isNegative) { progressBar.classList.add('negative'); }
            else { progressBar.classList.remove('negative'); }
        }
        
        const heartsContainer = popup.querySelector('.hearts-container.large');
        if (heartsContainer) {
            heartsContainer.innerHTML = renderHearts(newValue, thresholds, icon, false);
        }
    }
}

function applySearchFilter(searchTerm) {
    document.querySelectorAll('.character-card').forEach(card => {
        const characterName = card.querySelector('.character-name').textContent.toLowerCase();
        card.style.display = characterName.includes(searchTerm.toLowerCase()) ? 'block' : 'none';
    });
}

function switchActivePlayer(player) {
    // Toggle active class on player buttons
    document.querySelectorAll('.player-option').forEach(opt => { opt.classList.remove('active'); });
    document.querySelector(`.player-option.${player}`).classList.add('active');
    
    // Get current player key
    const playerKey = player === 'elias' ? 'kaiko' : 'james';
    const displayName = player === 'elias' ? 'Elias' : 'Jakob';
    const playerClass = player === 'elias' ? 'elias' : 'jakob';
    
    // Update all cards
    const relationships = window.currentRelationships || {};
    
    // For simplicity, we'll refresh the entire grid
    updateCharacterGridDisplay(relationships);
}

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
            <div class="player-switch">
                <button class="player-option elias">Elias</button>
                <button class="player-option jakob active">Jakob</button>
            </div>
            <div class="filter-controls">
                <button class="filter-button" data-filter="all">All Characters</button>
                <button class="filter-button active" data-filter="girls">Girls</button>
                <button class="filter-button" data-filter="teachers">Teachers</button>
                <button class="filter-button" data-filter="boys">Boys</button>
            </div>
            <div class="characters-search">
                <input type="text" class="search-input" placeholder="Søg efter en karakter...">
            </div>
            <div class="characters-grid"></div>
            <div class="footer">
                Sweet Pink Dating Sim © 2025 - Relationship Tracker v2.0
            </div>
        </div>
        <div class="character-details-popup" id="characterPopup">
            <div class="popup-content">
                <button class="close-popup">&times;</button>
            </div>
        </div>
    `;
    const styleElement = document.createElement('style');
    styleElement.textContent = `
        /* Base styles */
        .relationship-editor {
            margin-top: 20px;
            padding: 15px;
            background: rgba(255, 192, 203, 0.1);
            border-radius: 8px;
            border: 1px solid #ffaabb;
        }
        .relationship-editor h4 {
            margin-top: 0;
            font-size: 18px;
            color: #ff6699;
            text-align: center;
        }
        .current-value {
            text-align: center;
            margin-bottom: 15px;
            font-size: 20px;
            font-weight: bold;
        }
        .value-display {
            color: #ff6699;
            font-size: 24px;
        }
        .adjustment-controls {
            display: flex;
            flex-direction: column;
            gap: 10px;
        }
        .preset-buttons {
            display: flex;
            justify-content: center;
            flex-wrap: wrap;
            gap: 5px;
        }
        .adjustment-btn {
            padding: 8px 12px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            transition: background-color 0.2s;
            font-weight: bold;
        }
        .decrease-large { background-color: #ff4040; color: white; }
        .decrease-medium { background-color: #ff6b6b; color: white; }
        .decrease-small { background-color: #ff9999; color: black; }
        .decrease-mini { background-color: #ffcccc; color: black; }
        .increase-mini { background-color: #ccffcc; color: black; }
        .increase-small { background-color: #99ff99; color: black; }
        .increase-medium { background-color: #6bff6b; color: black; }
        .increase-large { background-color: #40ff40; color: black; }
        .save-controls {
            display: flex;
            flex-direction: column;
            align-items: center;
            margin-top: 15px;
        }
        .save-relationship-btn {
            padding: 10px 20px;
            background-color: #ff6699;
            color: white;
            border: none;
            border-radius: 20px;
            cursor: pointer;
            font-weight: bold;
            transition: background-color 0.2s;
        }
        .save-relationship-btn:hover { background-color: #ff3377; }
        .save-feedback {
            height: 20px;
            margin-top: 5px;
            color: #4CAF50;
            text-align: center;
            font-weight: bold;
        }
        .save-feedback.success { color: #4CAF50; }
        .save-feedback.error { color: #f44336; }
        .adjustment-btn:hover { filter: brightness(90%); }
        
        /* Specific styling for relationship types */
        .relationship-section {
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 1px dashed #ccc;
        }
        
        .relationship-section[data-field="romantic"] h4 {
            color: #ff6699;
        }
        
        .relationship-section[data-field="friendship"] h4 {
            color: #4287f5;
        }
        
        .save-relationship-btn[data-field="romantic"] {
            background-color: #ff6699;
        }
        
        .save-relationship-btn[data-field="friendship"] {
            background-color: #4287f5;
        }
        
        /* Styling for heart animations - only for romantic hearts */
        @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.2); }
            100% { transform: scale(1); }
        }
        
        .heart.active {
            display: inline-block;
        }
        
        /* Only romantic hearts pulse */
        .romantic .heart.active, 
        .relationship-section[data-field="romantic"] .heart.active {
            animation: pulse 1.5s infinite;
        }
        
        /* Friendship hearts don't pulse */
        .friendship .heart.active,
        .relationship-section[data-field="friendship"] .heart.active {
            animation: none;
        }
        
        /* Additional styling for cards */
        .relationship-tracks.girls {
            display: flex;
            flex-direction: column;
            gap: 10px;
        }
        
        .relationship-track.romantic {
            border-left: 4px solid #ff6699;
        }
        
        .relationship-track.friendship {
            border-left: 4px solid #4287f5;
        }
        
        .relationship-label {
            font-weight: bold;
        }
        
        /* Styles for extreme values */
        .obsession-heart {
            color: #ff0000;
            text-shadow: 0 0 5px #ff0000;
        }
    `;
    document.head.appendChild(styleElement);
    document.body.appendChild(overlay);
    button.addEventListener('click', () => { overlay.classList.remove('hidden'); });
    overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.classList.add('hidden'); });
    const filterButtons = overlay.querySelectorAll('.filter-button');
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            const db = getDatabase();
            const feelingsRef = ref(db, 'gameState/feelings');
            onValue(feelingsRef, (snapshot) => { updateCharacterGridDisplay(snapshot.val()); }, { onlyOnce: true });
        });
    });
    const searchInput = overlay.querySelector('.search-input');
    searchInput.addEventListener('input', () => { applySearchFilter(searchInput.value); });
    const playerOptions = overlay.querySelectorAll('.player-option');
    playerOptions.forEach(option => {
        option.addEventListener('click', () => {
            const player = option.classList.contains('elias') ? 'elias' : 'jakob';
            switchActivePlayer(player);
        });
    });
    const popup = overlay.querySelector('.character-details-popup');
    popup.addEventListener('click', (e) => { if (e.target === popup) popup.classList.remove('active'); });
}

// Save a single value for teachers/boys
function saveRelationshipValue(characterId, playerKey, percentValue) {
    const db = getDatabase();
    const feelingRef = ref(db, `gameState/feelings/${characterId}/${playerKey}`);
    const validValue = Math.max(-100, Math.min(200, percentValue));
    
    set(feelingRef, validValue)
        .then(() => {
            console.log(`Relationship updated for ${characterId}: ${validValue}%`);
            
            // Refresh character grid to reflect changes
            const feelingsRef = ref(db, 'gameState/feelings');
            onValue(feelingsRef, (snapshot) => {
                window.currentRelationships = snapshot.val();
                updateCharacterGridDisplay(snapshot.val());
            }, { onlyOnce: true });
        })
        .catch((error) => { 
            console.error("Error updating relationship:", error); 
        });
}

// Save a specific relationship type (friendship/romantic) for girls
function saveRelationshipTypeValue(characterId, playerKey, relationshipType, percentValue) {
    const db = getDatabase();
    const feelingRef = ref(db, `gameState/feelings/${characterId}/${relationshipType}/${playerKey}`);
    
    // Ensure value is within valid range, romantic relationship cannot be negative
    let validValue;
    if (relationshipType === 'romantic') {
        validValue = Math.max(0, Math.min(200, percentValue));
    } else {
        validValue = Math.max(-100, Math.min(200, percentValue));
    }
    
    set(feelingRef, validValue)
        .then(() => {
            console.log(`${relationshipType} updated for ${characterId}: ${validValue}%`);
            
            // Refresh character grid to reflect changes
            const feelingsRef = ref(db, 'gameState/feelings');
            onValue(feelingsRef, (snapshot) => {
                window.currentRelationships = snapshot.val();
                updateCharacterGridDisplay(snapshot.val());
            }, { onlyOnce: true });
        })
        .catch((error) => { 
            console.error(`Error updating ${relationshipType}:`, error); 
        });
}

// Function to migrate old data structure to new
function migrateRelationshipData() {
    const db = getDatabase();
    const feelingsRef = ref(db, 'gameState/feelings');
    
    onValue(feelingsRef, (snapshot) => {
        const relationships = snapshot.val() || {};
        
        // For each girl character
        Object.entries(characterData).forEach(([id, char]) => {
            const relationship = relationships[id];
            
            // Check if this relationship needs migration (has direct james/kaiko properties)
            if (relationship && (relationship.james !== undefined || relationship.kaiko !== undefined)) {
                console.log(`Migrating data for ${id}...`);
                
                // Create new structure
                const newData = {
                    friendship: {
                        james: relationship.james || 0,
                        kaiko: relationship.kaiko || 0
                    },
                    romantic: {
                        james: 0,
                        kaiko: 0
                    }
                };
                
                // Preserve datable status if it exists
                if (relationship.datable !== undefined) {
                    newData.datable = relationship.datable;
                }
                
                // Save the new structure
                set(ref(db, `gameState/feelings/${id}`), newData)
                    .then(() => {
                        console.log(`Migration complete for ${id}`);
                    })
                    .catch((error) => {
                        console.error(`Migration failed for ${id}:`, error);
                    });
            }
        });
    }, { onlyOnce: true });
}

function initializeCharacterSystem() {
    const db = getDatabase();
    const feelingsRef = ref(db, 'gameState/feelings');
    createCharacterStatusUI();
    
    // Run data migration to convert old structure to new
    migrateRelationshipData();
    
    onValue(feelingsRef, (snapshot) => {
        const relationships = snapshot.val();
        window.currentRelationships = relationships;
        updateCharacterGridDisplay(relationships);
    });
}

export { initializeCharacterSystem };