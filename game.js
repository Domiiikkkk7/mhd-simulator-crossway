// ============================================
// MHD SIMULÁTOR - Rozšířená verze
// Vozidla: Iveco E-way 12M, Karosa B 931.1677, Iveco Crossway 12M, Iveco E-way 9,5M
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
    audioEnabled: true,
    penalties: 0,
    totalPassengersServed: 0,
    missionComplete: false
};

// Hráčův autobus - Iveco E-way 12M
const bus = {
    x: 200,
    y: 200,
    width: 45,
    height: 85,
    maxSpeed: 8,
    speed: 0,
    acceleration: 0.3,
    deceleration: 0.2,
    rotation: 0,
    doorsOpen: false,
    doorsTimer: 0,
    maxPassengers: 50,
    passengers: 0,
    battery: 100,
    maxBattery: 100,
    batteryDrain: 0.02,
    type: 'eway12',
    line: 12,
    stoppedAtStop: false,
    stopTimer: 0,
    boardingTimer: 0
};

// AI vozidla
const aiVehicles = [
    {
        x: 800,
        y: 400,
        speed: 3,
        rotation: 0.5,
        width: 40,
        height: 75,
        type: 'karosa931', // Karosa B 931.1677
        color: '#1E90FF',
        line: 5
    },
    {
        x: 400,
        y: 800,
        speed: 4,
        rotation: -0.2,
        width: 42,
        height: 80,
        type: 'crossway12', // Iveco Crossway 12M
        color: '#FF6B6B',
        line: 7
    },
    {
        x: 1400,
        y: 600,
        speed: 3.5,
        rotation: 0.8,
        width: 35,
        height: 65,
        type: 'eway9', // Iveco E-way 9,5M
        color: '#FFD700',
        line: 14
    },
    {
        x: 1000,
        y: 1200,
        speed: 2.5,
        rotation: -0.5,
        width: 40,
        height: 75,
        type: 'karosa931',
        color: '#1E90FF',
        line: 11
    }
];

// Input handling
const keys = {};
window.addEventListener('keydown', (e) => {
    keys[e.key.toLowerCase()] = true;
    
    if (e.key === ' ') {
        bus.doorsOpen = !bus.doorsOpen;
        bus.doorsTimer = 0;
        bus.boardingTimer = 0;
        if (bus.doorsOpen) {
            playSound('stop');
        }
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
    width: 2500,
    height: 1800,
    offsetX: 0,
    offsetY: 0
};

// Definice zastávek s cestujícími
const stops = [
    { name: 'Náměstí Republiky', x: 300, y: 300, passengersWaiting: 5, passengersExit: 1 },
    { name: 'Hlavní nádraží', x: 600, y: 200, passengersWaiting: 12, passengersExit: 3 },
    { name: 'Stanice metra', x: 900, y: 400, passengersWaiting: 8, passengersExit: 5 },
    { name: 'Divadlo', x: 700, y: 700, passengersWaiting: 4, passengersExit: 2 },
    { name: 'Nemocnice', x: 1100, y: 600, passengersWaiting: 3, passengersExit: 4 },
    { name: 'Univerzita', x: 1400, y: 900, passengersWaiting: 15, passengersExit: 1 },
    { name: 'Letiště', x: 1800, y: 500, passengersWaiting: 10, passengersExit: 6 },
    { name: 'Obchodní centrum', x: 1300, y: 1300, passengersWaiting: 8, passengersExit: 7 },
    { name: 'Stadion', x: 500, y: 1400, passengersWaiting: 6, passengersExit: 2 }
];

// Definice semaforů
const trafficLights = [
    { x: 500, y: 300, state: 'green', timer: 30, greenDuration: 30, redDuration: 20, radius: 40 },
    { x: 800, y: 500, state: 'red', timer: 15, greenDuration: 25, redDuration: 25, radius: 40 },
    { x: 1000, y: 200, state: 'green', timer: 20, greenDuration: 35, redDuration: 20, radius: 40 },
    { x: 1300, y: 800, state: 'red', timer: 10, greenDuration: 30, redDuration: 25, radius: 40 },
    { x: 1600, y: 400, state: 'green', timer: 25, greenDuration: 28, redDuration: 22, radius: 40 }
];

// Definice ulic
const roads = [
    // Hlavní ulice
    { x1: 0, y1: 300, x2: 2500, y2: 300, width: 100 },
    { x1: 0, y1: 700, x2: 2500, y2: 700, width: 100 },
    { x1: 0, y1: 1100, x2: 2500, y2: 1100, width: 100 },
    
    // Vedlejší ulice
    { x1: 300, y1: 0, x2: 300, y2: 1800, width: 80 },
    { x1: 600, y1: 0, x2: 600, y2: 1800, width: 80 },
    { x1: 900, y1: 0, x2: 900, y2: 1800, width: 80 },
    { x1: 1200, y1: 0, x2: 1200, y2: 1800, width: 80 },
    { x1: 1600, y1: 0, x2: 1600, y2: 1800, width: 80 }
];

// ============================================
// DRAWING FUNCTIONS
// ============================================

function drawMap() {
    // Pozadí
    ctx.fillStyle = '#90EE90';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Ulice
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
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(stop.passengersWaiting, x, y + 5);
        
        // Název zastávky
        ctx.fillStyle = '#000';
        ctx.font = 'bold 11px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(stop.name, x, y - 30);
        ctx.textAlign = 'left';
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
        
        // Kontrolní zóna
        ctx.strokeStyle = 'rgba(255, 215, 0, 0.3)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(x, y, light.radius, 0, Math.PI * 2);
        ctx.stroke();
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
    for (let i = 0; i < 3; i++) {
        ctx.fillRect(-bus.width / 2 + 5, -bus.height / 2 + 5 + i * 15, 10, 10);
        ctx.fillRect(bus.width / 2 - 15, -bus.height / 2 + 5 + i * 15, 10, 10);
    }
    
    // Kola
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(-bus.width / 2 + 10, bus.height / 2 - 5, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(bus.width / 2 - 10, bus.height / 2 - 5, 5, 0, Math.PI * 2);
    ctx.fill();
    
    // Dveře
    if (bus.doorsOpen) {
        ctx.fillStyle = 'rgba(100, 200, 100, 0.5)';
        ctx.fillRect(-bus.width / 2 + 15, -bus.height / 2, 8, bus.height);
    }
    
    ctx.restore();
    
    // HUD linka
    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 16px Arial';
    ctx.fillText('Linka ' + bus.line, x - 20, y - bus.height / 2 - 10);
}

function drawAIVehicles() {
    aiVehicles.forEach(vehicle => {
        const x = vehicle.x - map.offsetX;
        const y = vehicle.y - map.offsetY;
        
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(vehicle.rotation);
        
        // Karosérie
        ctx.fillStyle = vehicle.color;
        ctx.fillRect(-vehicle.width / 2, -vehicle.height / 2, vehicle.width, vehicle.height);
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.strokeRect(-vehicle.width / 2, -vehicle.height / 2, vehicle.width, vehicle.height);
        
        // Okna
        ctx.fillStyle = '#87CEEB';
        for (let i = 0; i < 2; i++) {
            ctx.fillRect(-vehicle.width / 2 + 3, -vehicle.height / 2 + 5 + i * 15, 8, 8);
            ctx.fillRect(vehicle.width / 2 - 11, -vehicle.height / 2 + 5 + i * 15, 8, 8);
        }
        
        // Kola
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(-vehicle.width / 2 + 8, vehicle.height / 2 - 4, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(vehicle.width / 2 - 8, vehicle.height / 2 - 4, 4, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
        
        // Linka číslo
        ctx.fillStyle = vehicle.color;
        ctx.font = 'bold 12px Arial';
        ctx.fillText('L' + vehicle.line, x - 10, y - vehicle.height / 2 - 5);
    });
}

function drawUI() {
    // Informace o blízkých zastávkách
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(10, 10, 280, 120);
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 2;
    ctx.strokeRect(10, 10, 280, 120);
    
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 12px Arial';
    ctx.fillText('📍 Nejbližší zastávka:', 20, 30);
    
    const nearestStop = findNearestStop();
    if (nearestStop) {
        ctx.fillStyle = '#00FF00';
        ctx.font = 'bold 11px Arial';
        ctx.fillText(nearestStop.data.name, 20, 50);
        ctx.fillStyle = '#fff';
        ctx.font = '11px Arial';
        ctx.fillText(`Vzdálenost: ${Math.round(nearestStop.distance)}m`, 20, 65);
        ctx.fillText(`Čekajících: ${nearestStop.data.passengersWaiting}`, 20, 80);
        
        if (nearestStop.distance < 50) {
            ctx.fillStyle = '#FF6B6B';
            ctx.font = 'bold 11px Arial';
            ctx.fillText('Zastavte - blízko zastávky!', 20, 100);
        }
    }
    
    // Score
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(10, canvas.height - 80, 280, 70);
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 2;
    ctx.strokeRect(10, canvas.height - 80, 280, 70);
    
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 12px Arial';
    ctx.fillText('📊 STATISTIKA:', 20, canvas.height - 60);
    ctx.font = '11px Arial';
    ctx.fillText(`Přepraveni: ${game.totalPassengersServed}`, 20, canvas.height - 40);
    ctx.fillText(`Penalizace: ${game.penalties}`, 20, canvas.height - 20);
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
        bus.speed -= bus.deceleration * 0.5;
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
    
    // Dveře a nástup cestujících
    if (bus.doorsOpen) {
        bus.doorsTimer++;
        bus.boardingTimer++;
        
        const nearestStop = findNearestStop();
        if (nearestStop && nearestStop.distance < 50) {
            // Cestující nastupují
            if (bus.boardingTimer % 30 === 0) { // Každý frame
                const canBoard = Math.min(
                    bus.maxPassengers - bus.passengers,
                    nearestStop.data.passengersWaiting
                );
                if (canBoard > 0) {
                    bus.passengers += canBoard;
                    nearestStop.data.passengersWaiting -= canBoard;
                    game.totalPassengersServed += canBoard;
                }
            }
            
            // Cestující vystupují
            if (bus.boardingTimer % 25 === 0 && nearestStop.data.passengersExit > 0) {
                const exiting = Math.min(bus.passengers, nearestStop.data.passengersExit);
                bus.passengers -= exiting;
                nearestStop.data.passengersExit -= exiting;
            }
        }
        
        if (bus.doorsTimer > 180) {
            bus.doorsOpen = false;
        }
    }
}

function updateAIVehicles() {
    if (game.paused) return;
    
    aiVehicles.forEach(vehicle => {
        // Jednoduchá AI - jezdí po mapě a otáčí se
        vehicle.x += Math.sin(vehicle.rotation) * vehicle.speed;
        vehicle.y -= Math.cos(vehicle.rotation) * vehicle.speed;
        
        // Random otáčení
        if (Math.random() < 0.01) {
            vehicle.rotation += (Math.random() - 0.5) * 0.3;
        }
        
        // Hranice mapy
        if (vehicle.x < 50 || vehicle.x > map.width - 50) {
            vehicle.rotation = -vehicle.rotation;
        }
        if (vehicle.y < 50 || vehicle.y > map.height - 50) {
            vehicle.rotation = Math.PI - vehicle.rotation;
        }
    });
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
// TRAFFIC LIGHTS & COLLISION
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
        
        // Detekce semaforu
        const dx = bus.x - light.x;
        const dy = bus.y - light.y;
        const distToLight = Math.sqrt(dx * dx + dy * dy);
        
        if (distToLight < light.radius && light.state === 'red' && bus.speed > 0.5) {
            game.penalties++;
            playSound('warning');
            updateStatus('⚠️ ČERVENÁ! Penalizace!');
        }
    });
}

function checkCollisions() {
    aiVehicles.forEach(vehicle => {
        const dx = bus.x - vehicle.x;
        const dy = bus.y - vehicle.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 40) {
            game.penalties += 2;
            bus.speed = 0;
            playSound('warning');
            updateStatus('💥 KOLIZE! Velká penalizace!');
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
    
    // Status
    if (bus.battery < 20) {
        document.getElementById('status').textContent = '⚠️ BATERIE NÍZKÁ!';
        document.getElementById('status').classList.add('warning');
    } else if (bus.doorsOpen) {
        document.getElementById('status').textContent = '🚪 Dveře otevřené - cestující nastupují';
        document.getElementById('status').classList.remove('warning', 'error');
    } else if (bus.speed > 7) {
        document.getElementById('status').textContent = '⚠️ Zpomalte!';
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
    
    try {
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
                oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
                oscillator.frequency.linearRampToValueAtTime(600, audioContext.currentTime + 0.5);
                gainNode.gain.setValueAtTime(0.08, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
                oscillator.start(audioContext.currentTime);
                oscillator.stop(audioContext.currentTime + 0.5);
                break;
        }
    } catch (e) {
        console.log('Zvuk: ' + type);
    }
}

function updateStatus(message) {
    const statusEl = document.getElementById('status');
    statusEl.textContent = message;
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
    updateAIVehicles();
    updateTrafficLights();
    checkCollisions();
    updateHUD();
    
    if (!game.paused) {
        game.time += 1 / 60;
    }
    
    // Draw
    drawMap();
    drawStops();
    drawTrafficLights();
    drawAIVehicles();
    drawBus();
    drawUI();
    
    requestAnimationFrame(gameLoop);
}

// ============================================
// INITIALIZATION
// ============================================

window.addEventListener('load', () => {
    console.log('🚌 MHD Simulátor spuštěn!');
    console.log('Vozidla: Iveco E-way 12M, Karosa B 931.1677, Iveco Crossway 12M, Iveco E-way 9,5M');
    gameLoop();
});
