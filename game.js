// ============================================
// MHD SIMULÁTOR - Iveco Crossway LE CITY 13M ELEC
// ============================================

// Canvas setup
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight - 150;

// Game state
const game = {
    paused: false,
    running: true,
    time: 0,
    delay: 0,
    score: 0,
    audioEnabled: true
};

// Bus object
const bus = {
    x: 200,
    y: 200,
    width: 40,
    height: 80,
    maxSpeed: 8,
    speed: 0,
    acceleration: 0.3,
    deceleration: 0.2,
    rotation: 0,
    doorsOpen: false,
    doorsTimer: 0,
    maxPassengers: 45,
    passengers: 0,
    battery: 100,
    maxBattery: 100,
    batteryDrain: 0.02,
    stoppedAtStop: false,
    stopTimer: 0
};

// Input handling
const keys = {};
window.addEventListener('keydown', (e) => {
    keys[e.key.toLowerCase()] = true;
    
    if (e.key === ' ') {
        bus.doorsOpen = !bus.doorsOpen;
        bus.doorsTimer = 0;
    }
    if (e.key.toLowerCase() === 'k') {
        playSound('honk');
    }
    if (e.key.toLowerCase() === 'p') {
        game.paused = !game.paused;
        updateStatus(game.paused ? 'Pozastaveno' : 'Pokračuje jízda');
    }
});

window.addEventListener('keyup', (e) => {
    keys[e.key.toLowerCase()] = false;
});

window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight - 150;
});

// ============================================
// MAP - Ulice, zastávky, semafory
// ============================================

const map = {
    width: 2000,
    height: 1500,
    offsetX: 0,
    offsetY: 0
};

// Definice zastávek
const stops = [
    { name: 'Náměstí Republiky', x: 300, y: 300, passengersWaiting: 5 },
    { name: 'Hlavní nádraží', x: 600, y: 200, passengersWaiting: 8 },
    { name: 'Stanice metra', x: 900, y: 400, passengersWaiting: 6 },
    { name: 'Divadlo', x: 700, y: 700, passengersWaiting: 4 },
    { name: 'Nemocnice', x: 1100, y: 600, passengersWaiting: 3 },
    { name: 'Univerzita', x: 1400, y: 800, passengersWaiting: 10 },
    { name: 'Letiště', x: 1600, y: 500, passengersWaiting: 7 },
    { name: 'Obchodní centrum', x: 1200, y: 1100, passengersWaiting: 5 }
];

// Definice semaforů
const trafficLights = [
    { x: 500, y: 300, state: 'green', timer: 30, greenDuration: 30, redDuration: 20 },
    { x: 800, y: 500, state: 'red', timer: 15, greenDuration: 25, redDuration: 25 },
    { x: 1000, y: 200, state: 'green', timer: 20, greenDuration: 35, redDuration: 20 },
    { x: 1300, y: 700, state: 'red', timer: 10, greenDuration: 30, redDuration: 25 }
];

// Definice ulic (cesty)
const roads = [
    // Hlavní ulice
    { x1: 0, y1: 300, x2: 2000, y2: 300, width: 80 },
    { x1: 0, y1: 700, x2: 2000, y2: 700, width: 80 },
    { x1: 0, y1: 1100, x2: 2000, y2: 1100, width: 80 },
    
    // Vedlejší ulice
    { x1: 300, y1: 0, x2: 300, y2: 1500, width: 80 },
    { x1: 600, y1: 0, x2: 600, y2: 1500, width: 80 },
    { x1: 900, y1: 0, x2: 900, y2: 1500, width: 80 },
    { x1: 1200, y1: 0, x2: 1200, y2: 1500, width: 80 },
    { x1: 1600, y1: 0, x2: 1600, y2: 1500, width: 80 }
];

// ============================================
// DRAWING FUNCTIONS
// ============================================

function drawMap() {
    // Pozadí
    ctx.fillStyle = '#90EE90';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Ulice
    ctx.fillStyle = '#333';
    roads.forEach(road => {
        const x1 = road.x1 - map.offsetX;
        const y1 = road.y1 - map.offsetY;
        const x2 = road.x2 - map.offsetX;
        const y2 = road.y2 - map.offsetY;
        
        ctx.strokeStyle = '#333';
        ctx.lineWidth = road.width;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
        
        // Značení středu silnice
        ctx.setLineDash([20, 10]);
        ctx.strokeStyle = '#FFF';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
        ctx.setLineDash([]);
    });
}

function drawStops() {
    stops.forEach((stop, idx) => {
        const x = stop.x - map.offsetX;
        const y = stop.y - map.offsetY;
        
        // Zastávka - znak
        ctx.fillStyle = '#FF6B6B';
        ctx.fillRect(x - 20, y - 20, 40, 40);
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.strokeRect(x - 20, y - 20, 40, 40);
        
        // Čekající cestující
        ctx.fillStyle = '#FFD700';
        ctx.font = '12px Arial';
        ctx.fillText(stop.passengersWaiting, x - 5, y + 5);
        
        // Název zastávky
        ctx.fillStyle = '#000';
        ctx.font = 'bold 11px Arial';
        ctx.fillText(stop.name, x - 40, y - 30);
    });
}

function drawTrafficLights() {
    trafficLights.forEach(light => {
        const x = light.x - map.offsetX;
        const y = light.y - map.offsetY;
        
        // Tvar semaforu
        ctx.fillStyle = '#222';
        ctx.fillRect(x - 15, y - 40, 30, 80);
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.strokeRect(x - 15, y - 40, 30, 80);
        
        // Červená
        ctx.fillStyle = light.state === 'red' ? '#FF0000' : '#660000';
        ctx.beginPath();
        ctx.arc(x, y - 20, 8, 0, Math.PI * 2);
        ctx.fill();
        
        // Žlutá
        ctx.fillStyle = '#666600';
        ctx.beginPath();
        ctx.arc(x, y, 8, 0, Math.PI * 2);
        ctx.fill();
        
        // Zelená
        ctx.fillStyle = light.state === 'green' ? '#00FF00' : '#006600';
        ctx.beginPath();
        ctx.arc(x, y + 20, 8, 0, Math.PI * 2);
        ctx.fill();
    });
}

function drawBus() {
    const x = bus.x - map.offsetX;
    const y = bus.y - map.offsetY;
    
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(bus.rotation);
    
    // Karosérie
    ctx.fillStyle = '#E8102E';
    ctx.fillRect(-bus.width / 2, -bus.height / 2, bus.width, bus.height);
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.strokeRect(-bus.width / 2, -bus.height / 2, bus.width, bus.height);
    
    // Okna
    ctx.fillStyle = '#87CEEB';
    ctx.fillRect(-bus.width / 2 + 5, -bus.height / 2 + 5, 10, 10);
    ctx.fillRect(-bus.width / 2 + 5, -bus.height / 2 + 20, 10, 10);
    ctx.fillRect(-bus.width / 2 + 5, -bus.height / 2 + 35, 10, 10);
    ctx.fillRect(bus.width / 2 - 15, -bus.height / 2 + 5, 10, 10);
    ctx.fillRect(bus.width / 2 - 15, -bus.height / 2 + 20, 10, 10);
    ctx.fillRect(bus.width / 2 - 15, -bus.height / 2 + 35, 10, 10);
    
    // Kola
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(-bus.width / 2 + 10, bus.height / 2 - 5, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(bus.width / 2 - 10, bus.height / 2 - 5, 4, 0, Math.PI * 2);
    ctx.fill();
    
    // Dveře (když jsou otevřené)
    if (bus.doorsOpen) {
        ctx.fillStyle = 'rgba(100, 200, 100, 0.5)';
        ctx.fillRect(-bus.width / 2 + 15, -bus.height / 2, 8, bus.height);
    }
    
    ctx.restore();
    
    // HUD linka
    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 14px Arial';
    ctx.fillText('Linka 13', x - 15, y - bus.height / 2 - 10);
}

function drawUI() {
    // Informace o blízkých zastávkách
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(10, 10, 250, 100);
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 2;
    ctx.strokeRect(10, 10, 250, 100);
    
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 12px Arial';
    ctx.fillText('Nejbližší zastávka:', 20, 30);
    
    const nearestStop = findNearestStop();
    if (nearestStop) {
        ctx.fillStyle = '#00FF00';
        ctx.fillText(nearestStop.name, 20, 50);
        ctx.fillStyle = '#fff';
        ctx.fillText(`Vzdálenost: ${Math.round(nearestStop.distance)}m`, 20, 65);
        ctx.fillText(`Čekajících: ${nearestStop.data.passengersWaiting}`, 20, 80);
    }
}

// ============================================
// BUS LOGIC
// ============================================

function updateBus() {
    if (game.paused) return;
    
    // Ovládání
    const accelerating = keys['arrowup'] || keys['w'];
    const braking = keys['arrowdown'] || keys['s'];
    const turningLeft = keys['arrowleft'] || keys['a'];
    const turningRight = keys['arrowright'] || keys['d'];
    
    // Akcelerace a brzda
    if (accelerating && bus.speed < bus.maxSpeed) {
        bus.speed += bus.acceleration;
    } else if (braking && bus.speed > 0) {
        bus.speed -= bus.deceleration;
    } else if (bus.speed > 0) {
        bus.speed -= bus.deceleration * 0.5; // Přirozené zpomalení
    }
    
    bus.speed = Math.max(0, Math.min(bus.maxSpeed, bus.speed));
    
    // Otáčení
    if (turningLeft) {
        bus.rotation -= 0.08;
    }
    if (turningRight) {
        bus.rotation += 0.08;
    }
    
    // Pohyb
    bus.x += Math.sin(bus.rotation) * bus.speed;
    bus.y -= Math.cos(bus.rotation) * bus.speed;
    
    // Baterie
    if (bus.speed > 0) {
        bus.battery -= bus.batteryDrain;
    }
    bus.battery = Math.max(0, bus.battery);
    
    // Mapa offset (camera follow)
    map.offsetX = bus.x - canvas.width / 2;
    map.offsetY = bus.y - canvas.height / 2;
    
    // Hranice mapy
    bus.x = Math.max(bus.width / 2, Math.min(map.width - bus.width / 2, bus.x));
    bus.y = Math.max(bus.height / 2, Math.min(map.height - bus.height / 2, bus.y));
    
    // Dveře
    if (bus.doorsOpen) {
        bus.doorsTimer++;
        if (bus.doorsTimer > 180) { // 3 sekundy
            bus.doorsOpen = false;
        }
    }
}

function findNearestStop() {
    let nearest = null;
    let minDistance = Infinity;
    
    stops.forEach(stop => {
        const dx = bus.x - stop.x;
        const dy = bus.y - stop.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < minDistance) {
            minDistance = distance;
            nearest = { data: stop, distance };
        }
    });
    
    return nearest;
}

// ============================================
// TRAFFIC LIGHTS UPDATE
// ============================================

function updateTrafficLights() {
    if (game.paused) return;
    
    trafficLights.forEach(light => {
        light.timer--;
        
        if (light.timer <= 0) {
            if (light.state === 'green') {
                light.state = 'red';
                light.timer = light.redDuration;
            } else {
                light.state = 'green';
                light.timer = light.greenDuration;
            }
        }
    });
}

// ============================================
// HUD UPDATE
// ============================================

function updateHUD() {
    document.getElementById('speedometer').textContent = Math.round(bus.speed * 10) + ' km/h';
    document.getElementById('passengers').textContent = bus.passengers + ' / ' + bus.maxPassengers;
    document.getElementById('battery').textContent = Math.round(bus.battery) + '%';
    document.getElementById('delay').textContent = Math.round(game.delay) + ' min';
    
    const minutes = Math.floor(game.time / 60);
    const seconds = Math.floor(game.time % 60);
    document.getElementById('timeDisplay').textContent = 
        String(minutes).padStart(2, '0') + ':' + String(seconds).padStart(2, '0');
    
    // Status aktualizace
    if (bus.battery < 20) {
        document.getElementById('status').textContent = '⚠️ BATERIE NÍZKÁ!';
        document.getElementById('status').classList.add('warning');
    } else if (bus.doorsOpen) {
        document.getElementById('status').textContent = '🚪 Dveře otevřené';
        document.getElementById('status').classList.remove('warning', 'error');
    } else if (bus.speed > 7) {
        document.getElementById('status').textContent = '⚠️ Zpomalte! Překročili jste maximální rychlost';
        document.getElementById('status').classList.add('warning');
    } else {
        document.getElementById('status').textContent = '✓ Jízda v normě';
        document.getElementById('status').classList.remove('warning', 'error');
    }
}

// ============================================
// SOUND FUNCTIONS
// ============================================

function playSound(type) {
    if (!game.audioEnabled) return;
    
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    switch(type) {
        case 'honk':
            oscillator.frequency.value = 800;
            gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.3);
            break;
        case 'stop':
            oscillator.frequency.value = 600;
            gainNode.gain.setValueAtTime(0.05, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.2);
            break;
        case 'warning':
            oscillator.frequency.value = 500;
            gainNode.gain.setValueAtTime(0.08, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.5);
            break;
    }
}

function updateStatus(message) {
    const statusEl = document.getElementById('status');
    statusEl.textContent = message;
    statusEl.classList.remove('warning', 'error');
}

// ============================================
// GAME LOOP
// ============================================

function gameLoop() {
    // Clear canvas
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Update
    updateBus();
    updateTrafficLights();
    updateHUD();
    
    if (!game.paused) {
        game.time += 1 / 60;
    }
    
    // Draw
    drawMap();
    drawStops();
    drawTrafficLights();
    drawBus();
    drawUI();
    
    requestAnimationFrame(gameLoop);
}

// ============================================
// INITIALIZATION
// ============================================

window.addEventListener('load', () => {
    console.log('MHD Simulátor spuštěn!');
    gameLoop();
});
