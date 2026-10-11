// ============================================
// MHD SIMULÁTOR - PRO VERZE
// Vozidla: Karosa B 932.1672, B 932.1678, B 931.1675, B 732.20/B 731.20, B 731.00, B 731, B 932.1680, B 731.1659
// ============================================

// Canvas setup
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight - 150;

// ============================================
// DEFINICE VOZIDEL - SPRÁVNÉ VLASTNOSTI
// ============================================

const vehicleTypes = {
    'karosa932_1672': {
        name: 'Karosa B 932.1672',
        width: 42,
        height: 85,
        maxPassengers: 43,
        maxSpeed: 7,
        color: '#1E90FF',
        acceleration: 0.25,
        batteryLife: 200,
        year: '1998-2005'
    },
    'karosa932_1678': {
        name: 'Karosa B 932.1678',
        width: 42,
        height: 85,
        maxPassengers: 43,
        maxSpeed: 7.2,
        color: '#00CED1',
        acceleration: 0.26,
        batteryLife: 210,
        year: '2000-2008'
    },
    'karosa931_1675': {
        name: 'Karosa B 931.1675',
        width: 40,
        height: 80,
        maxPassengers: 40,
        maxSpeed: 6.8,
        color: '#20B2AA',
        acceleration: 0.24,
        batteryLife: 190,
        year: '1995-2003'
    },
    'karosa732_20': {
        name: 'Karosa B 732.20',
        width: 40,
        height: 75,
        maxPassengers: 38,
        maxSpeed: 6.5,
        color: '#FF6347',
        acceleration: 0.23,
        batteryLife: 180,
        year: '1995-2000'
    },
    'karosa731_20': {
        name: 'Karosa B 731.20',
        width: 38,
        height: 70,
        maxPassengers: 35,
        maxSpeed: 6.3,
        color: '#FF7F50',
        acceleration: 0.22,
        batteryLife: 170,
        year: '1993-1998'
    },
    'karosa731_00': {
        name: 'Karosa B 731.00',
        width: 38,
        height: 70,
        maxPassengers: 35,
        maxSpeed: 6.2,
        color: '#FFA500',
        acceleration: 0.21,
        batteryLife: 165,
        year: '1990-1996'
    },
    'karosa731': {
        name: 'Karosa B 731',
        width: 37,
        height: 68,
        maxPassengers: 33,
        maxSpeed: 6.0,
        color: '#FFD700',
        acceleration: 0.20,
        batteryLife: 160,
        year: '1988-1994'
    },
    'karosa932_1680': {
        name: 'Karosa B 932.1680',
        width: 42,
        height: 85,
        maxPassengers: 44,
        maxSpeed: 7.3,
        color: '#4169E1',
        acceleration: 0.27,
        batteryLife: 215,
        year: '2002-2010'
    },
    'karosa731_1659': {
        name: 'Karosa B 731.1659',
        width: 39,
        height: 72,
        maxPassengers: 36,
        maxSpeed: 6.4,
        color: '#9370DB',
        acceleration: 0.23,
        batteryLife: 175,
        year: '1994-1999'
    },
    'eway12': {
        name: 'Iveco E-way 12M',
        width: 45,
        height: 85,
        maxPassengers: 50,
        maxSpeed: 8.5,
        color: '#E8102E',
        acceleration: 0.35,
        batteryLife: 250,
        year: '2010-现在',
        electric: true
    }
};

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
    missionComplete: false,
    currentMission: null,
    missionProgress: 0,
    missions: [
        {
            id: 1,
            name: 'Základní trasa',
            description: 'Projed všechny 9 zastávek v pořadí',
            reward: 100,
            target: 9,
            type: 'stops'
        },
        {
            id: 2,
            name: 'Přepravce',
            description: 'Přepravy 100 cestujících bez penalizace',
            reward: 150,
            target: 100,
            type: 'passengers'
        },
        {
            id: 3,
            name: 'Bezpečný řidič',
            description: 'Projed bez nehody a porušení pravidel',
            reward: 200,
            target: 0,
            type: 'penalties'
        },
        {
            id: 4,
            name: 'Efektivní provoz',
            description: 'Dosáhni maxima efektivity - čas a cestující',
            reward: 250,
            target: 50,
            type: 'efficiency'
        }
    ]
};

// Hráčův autobus
const bus = {
    x: 200,
    y: 200,
    speed: 0,
    rotation: 0,
    doorsOpen: false,
    doorsTimer: 0,
    passengers: 0,
    battery: 100,
    maxBattery: 100,
    batteryDrain: 0.015,
    type: 'eway12',
    line: 12,
    boardingTimer: 0,
    visitedStops: [],
    stoppedAtStop: false,
    stopTimer: 0,
    lastCollisionTime: 0,
    speedViolations: 0
};

Object.assign(bus, vehicleTypes['eway12']);

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
            updateStatus('🚪 Dveře otevřené');
        }
    }
    if (e.key.toLowerCase() === 'k') {
        playSound('honk');
    }
    if (e.key.toLowerCase() === 'p') {
        game.paused = !game.paused;
        updateStatus(game.paused ? 'POZASTAVENO' : 'Pokračuje jízda');
    }
    if (e.key.toLowerCase() === 'm') {
        startNewMission();
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
// MAP - Rozšířená mapa s více prvky
// ============================================

const map = {
    width: 3500,
    height: 2500,
    offsetX: 0,
    offsetY: 0
};

// Rozšířené zastávky
const stops = [
    { id: 1, name: 'Náměstí Republiky', x: 300, y: 300, passengersWaiting: 5, passengersExit: 1, capacity: 20 },
    { id: 2, name: 'Hlavní nádraží', x: 700, y: 200, passengersWaiting: 12, passengersExit: 3, capacity: 25 },
    { id: 3, name: 'Stanice metra', x: 1100, y: 400, passengersWaiting: 8, passengersExit: 5, capacity: 20 },
    { id: 4, name: 'Divadlo', x: 900, y: 800, passengersWaiting: 4, passengersExit: 2, capacity: 15 },
    { id: 5, name: 'Nemocnice', x: 1400, y: 700, passengersWaiting: 3, passengersExit: 4, capacity: 18 },
    { id: 6, name: 'Univerzita', x: 1800, y: 1000, passengersWaiting: 15, passengersExit: 1, capacity: 30 },
    { id: 7, name: 'Letiště', x: 2200, y: 600, passengersWaiting: 10, passengersExit: 6, capacity: 22 },
    { id: 8, name: 'Obchodní centrum', x: 1600, y: 1600, passengersWaiting: 8, passengersExit: 7, capacity: 25 },
    { id: 9, name: 'Stadion', x: 700, y: 1800, passengersWaiting: 6, passengersExit: 2, capacity: 20 }
];

// Semafory
const trafficLights = [
    { x: 500, y: 300, state: 'green', timer: 30, greenDuration: 30, redDuration: 20, radius: 60 },
    { x: 900, y: 500, state: 'red', timer: 15, greenDuration: 25, redDuration: 25, radius: 60 },
    { x: 1200, y: 200, state: 'green', timer: 20, greenDuration: 35, redDuration: 20, radius: 60 },
    { x: 1500, y: 900, state: 'red', timer: 10, greenDuration: 30, redDuration: 25, radius: 60 },
    { x: 1900, y: 500, state: 'green', timer: 25, greenDuration: 28, redDuration: 22, radius: 60 },
    { x: 1200, y: 1400, state: 'red', timer: 18, greenDuration: 32, redDuration: 23, radius: 60 }
];

// Ulice
const roads = [
    // Hlavní ulice
    { x1: 0, y1: 300, x2: 3500, y2: 300, width: 120 },
    { x1: 0, y1: 800, x2: 3500, y2: 800, width: 120 },
    { x1: 0, y1: 1300, x2: 3500, y2: 1300, width: 120 },
    { x1: 0, y1: 1800, x2: 3500, y2: 1800, width: 120 },
    
    // Vedlejší ulice
    { x1: 300, y1: 0, x2: 300, y2: 2500, width: 100 },
    { x1: 700, y1: 0, x2: 700, y2: 2500, width: 100 },
    { x1: 1100, y1: 0, x2: 1100, y2: 2500, width: 100 },
    { x1: 1500, y1: 0, x2: 1500, y2: 2500, width: 100 },
    { x1: 1900, y1: 0, x2: 1900, y2: 2500, width: 100 },
    { x1: 2300, y1: 0, x2: 2300, y2: 2500, width: 100 }
];

// AI vozidla - různé typy
const aiVehicles = [
    createAIBus(800, 400, 'karosa932_1672', 5),
    createAIBus(400, 900, 'karosa931_1675', 7),
    createAIBus(1600, 600, 'karosa731_1659', 14),
    createAIBus(1200, 1300, 'karosa932_1680', 11),
    createAIBus(2000, 1100, 'karosa732_20', 9),
    createAIBus(600, 1900, 'karosa731_20', 3)
];

function createAIBus(x, y, type, line) {
    const typeData = vehicleTypes[type];
    return {
        x: x,
        y: y,
        speed: 2 + Math.random() * 2,
        rotation: Math.random() * Math.PI * 2,
        width: typeData.width,
        height: typeData.height,
        type: type,
        color: typeData.color,
        line: line,
        passengers: Math.floor(Math.random() * typeData.maxPassengers * 0.7)
    };
}

// ============================================
// DRAWING FUNCTIONS
// ============================================

function drawMap() {
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
        
        // Značení středu
        ctx.setLineDash([30, 15]);
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
    stops.forEach(stop => {
        const x = stop.x - map.offsetX;
        const y = stop.y - map.offsetY;
        
        // Zastávka
        ctx.fillStyle = '#FF6B6B';
        ctx.fillRect(x - 25, y - 25, 50, 50);
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 3;
        ctx.strokeRect(x - 25, y - 25, 50, 50);
        
        // Počet čekajících
        ctx.fillStyle = '#FFD700';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(stop.passengersWaiting, x, y + 6);
        
        // Název
        ctx.fillStyle = '#000';
        ctx.font = 'bold 11px Arial';
        ctx.fillText(stop.name, x, y - 35);
        ctx.textAlign = 'left';
    });
}

function drawTrafficLights() {
    trafficLights.forEach(light => {
        const x = light.x - map.offsetX;
        const y = light.y - map.offsetY;
        
        // Sloupek
        ctx.fillStyle = '#222';
        ctx.fillRect(x - 12, y - 45, 24, 90);
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.strokeRect(x - 12, y - 45, 24, 90);
        
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
        ctx.strokeStyle = 'rgba(255, 215, 0, 0.2)';
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
    ctx.fillStyle = bus.color;
    ctx.fillRect(-bus.width / 2, -bus.height / 2, bus.width, bus.height);
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.strokeRect(-bus.width / 2, -bus.height / 2, bus.width, bus.height);
    
    // Okna
    ctx.fillStyle = '#87CEEB';
    for (let i = 0; i < 3; i++) {
        ctx.fillRect(-bus.width / 2 + 4, -bus.height / 2 + 5 + i * 18, 11, 12);
        ctx.fillRect(bus.width / 2 - 15, -bus.height / 2 + 5 + i * 18, 11, 12);
    }
    
    // Kola
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(-bus.width / 2 + 8, bus.height / 2 - 5, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(bus.width / 2 - 8, bus.height / 2 - 5, 5, 0, Math.PI * 2);
    ctx.fill();
    
    // Dveře
    if (bus.doorsOpen) {
        ctx.fillStyle = 'rgba(100, 200, 100, 0.6)';
        ctx.fillRect(-bus.width / 2 + 15, -bus.height / 2, 8, bus.height);
    }
    
    ctx.restore();
    
    // Linka
    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 18px Arial';
    ctx.fillText('Linka ' + bus.line, x - 25, y - bus.height / 2 - 15);
}

function drawAIVehicles() {
    aiVehicles.forEach(vehicle => {
        const x = vehicle.x - map.offsetX;
        const y = vehicle.y - map.offsetY;
        
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(vehicle.rotation);
        
        ctx.fillStyle = vehicle.color;
        ctx.fillRect(-vehicle.width / 2, -vehicle.height / 2, vehicle.width, vehicle.height);
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.strokeRect(-vehicle.width / 2, -vehicle.height / 2, vehicle.width, vehicle.height);
        
        ctx.fillStyle = '#87CEEB';
        for (let i = 0; i < 2; i++) {
            ctx.fillRect(-vehicle.width / 2 + 3, -vehicle.height / 2 + 5 + i * 18, 9, 11);
            ctx.fillRect(vehicle.width / 2 - 12, -vehicle.height / 2 + 5 + i * 18, 9, 11);
        }
        
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(-vehicle.width / 2 + 6, vehicle.height / 2 - 4, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(vehicle.width / 2 - 6, vehicle.height / 2 - 4, 4, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
        
        ctx.fillStyle = vehicle.color;
        ctx.font = 'bold 12px Arial';
        ctx.fillText('L' + vehicle.line, x - 12, y - vehicle.height / 2 - 8);
    });
}

function drawUI() {
    // Info panel
    ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
    ctx.fillRect(10, 10, 320, 140);
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 2;
    ctx.strokeRect(10, 10, 320, 140);
    
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 12px Arial';
    ctx.fillText('📍 ' + vehicleTypes[bus.type].name, 20, 30);
    
    const nearestStop = findNearestStop();
    if (nearestStop) {
        ctx.fillStyle = '#00FF00';
        ctx.font = 'bold 11px Arial';
        ctx.fillText(nearestStop.data.name, 20, 50);
        ctx.fillStyle = '#fff';
        ctx.font = '11px Arial';
        ctx.fillText(`Vzdálenost: ${Math.round(nearestStop.distance)}m`, 20, 65);
        ctx.fillText(`Čekajících: ${nearestStop.data.passengersWaiting}`, 20, 80);
        ctx.fillText(`Kapacita: ${nearestStop.data.capacity}`, 20, 95);
        
        if (nearestStop.distance < 60) {
            ctx.fillStyle = '#FF6B6B';
            ctx.font = 'bold 11px Arial';
            ctx.fillText('⚠️ BLÍZKO ZASTÁVKY', 20, 115);
        }
    }
    
    // Mission panel
    ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
    ctx.fillRect(10, canvas.height - 100, 320, 90);
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 2;
    ctx.strokeRect(10, canvas.height - 100, 320, 90);
    
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 12px Arial';
    ctx.fillText('🎯 MISE:', 20, canvas.height - 80);
    
    if (game.currentMission) {
        ctx.font = 'bold 11px Arial';
        ctx.fillStyle = '#00FF00';
        ctx.fillText(game.currentMission.name, 20, canvas.height - 60);
        ctx.fillStyle = '#fff';
        ctx.font = '10px Arial';
        ctx.fillText(game.currentMission.description, 20, canvas.height - 45);
        ctx.fillText(`Postup: ${game.missionProgress}/${game.currentMission.target}`, 20, canvas.height - 25);
    } else {
        ctx.fillStyle = '#FFD700';
        ctx.font = '11px Arial';
        ctx.fillText('Stiskni M pro zahájení mise', 20, canvas.height - 60);
    }
    
    // Statistics panel
    ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
    ctx.fillRect(canvas.width - 320, 10, 310, 100);
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 2;
    ctx.strokeRect(canvas.width - 320, 10, 310, 100);
    
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 12px Arial';
    ctx.fillText('📊 STATISTIKA', canvas.width - 310, 30);
    ctx.font = '11px Arial';
    ctx.fillText(`Přepraveni: ${game.totalPassengersServed}`, canvas.width - 310, 50);
    ctx.fillText(`Penalizace: ${game.penalties}`, canvas.width - 310, 65);
    ctx.fillText(`Skóre: ${game.score}`, canvas.width - 310, 80);
}

// ============================================
// BUS LOGIC
// ============================================

function updateBus() {
    if (game.paused) return;
    
    const accelerating = keys['arrowup'] || keys['w'];
    const braking = keys['arrowdown'] || keys['s'];
    const turningLeft = keys['arrowleft'] || keys['a'];
    const turningRight = keys['arrowright'] || keys['d'];
    
    if (accelerating && bus.speed < bus.maxSpeed) {
        bus.speed += bus.acceleration;
    } else if (braking && bus.speed > 0) {
        bus.speed -= bus.deceleration;
    } else if (bus.speed > 0) {
        bus.speed -= bus.deceleration * 0.4;
    }
    
    bus.speed = Math.max(0, Math.min(bus.maxSpeed, bus.speed));
    
    if (turningLeft) {
        bus.rotation -= 0.08;
    }
    if (turningRight) {
        bus.rotation += 0.08;
    }
    
    bus.x += Math.sin(bus.rotation) * bus.speed;
    bus.y -= Math.cos(bus.rotation) * bus.speed;
    
    if (bus.speed > 0) {
        bus.battery -= bus.batteryDrain;
    }
    bus.battery = Math.max(0, bus.battery);
    
    map.offsetX = bus.x - canvas.width / 2;
    map.offsetY = bus.y - canvas.height / 2;
    
    bus.x = Math.max(bus.width / 2, Math.min(map.width - bus.width / 2, bus.x));
    bus.y = Math.max(bus.height / 2, Math.min(map.height - bus.height / 2, bus.y));
    
    // Nástup/výstup cestujících
    if (bus.doorsOpen) {
        bus.doorsTimer++;
        bus.boardingTimer++;
        
        const nearestStop = findNearestStop();
        if (nearestStop && nearestStop.distance < 50) {
            if (!bus.visitedStops.includes(nearestStop.data.id)) {
                bus.visitedStops.push(nearestStop.data.id);
                if (game.currentMission && game.currentMission.type === 'stops') {
                    game.missionProgress++;
                }
            }
            
            if (bus.boardingTimer % 20 === 0) {
                const canBoard = Math.min(
                    bus.maxPassengers - bus.passengers,
                    nearestStop.data.passengersWaiting
                );
                if (canBoard > 0) {
                    bus.passengers += canBoard;
                    nearestStop.data.passengersWaiting -= canBoard;
                    game.totalPassengersServed += canBoard;
                    game.score += canBoard * 5;
                    
                    if (game.currentMission && game.currentMission.type === 'passengers') {
                        game.missionProgress += canBoard;
                    }
                }
            }
            
            if (bus.boardingTimer % 25 === 0 && nearestStop.data.passengersExit > 0) {
                const exiting = Math.min(bus.passengers, nearestStop.data.passengersExit);
                bus.passengers -= exiting;
                nearestStop.data.passengersExit -= exiting;
            }
        }
        
        if (bus.doorsTimer > 180) {
            bus.doorsOpen = false;
            playSound('stop');
        }
    }
}

function updateAIVehicles() {
    if (game.paused) return;
    
    aiVehicles.forEach(vehicle => {
        vehicle.x += Math.sin(vehicle.rotation) * vehicle.speed;
        vehicle.y -= Math.cos(vehicle.rotation) * vehicle.speed;
        
        if (Math.random() < 0.005) {
            vehicle.rotation += (Math.random() - 0.5) * 0.3;
        }
        
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

function updateTrafficLights() {
    if (game.paused) return;
    
    trafficLights.forEach(light => {
        light.timer--;
        
        if (light.timer <= 0) {
            light.state = light.state === 'green' ? 'red' : 'green';
            light.timer = light.state === 'green' ? light.greenDuration : light.redDuration;
        }
        
        const dx = bus.x - light.x;
        const dy = bus.y - light.y;
        const distToLight = Math.sqrt(dx * dx + dy * dy);
        
        if (distToLight < light.radius && light.state === 'red' && bus.speed > 0.5) {
            game.penalties++;
            bus.speedViolations++;
            playSound('warning');
            updateStatus('⚠️ ČERVENÁ! Penalizace!');
            game.score -= 50;
        }
    });
}

function checkCollisions() {
    aiVehicles.forEach(vehicle => {
        const dx = bus.x - vehicle.x;
        const dy = bus.y - vehicle.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 35 && Date.now() - bus.lastCollisionTime > 2000) {
            game.penalties += 3;
            bus.speed = 0;
            bus.lastCollisionTime = Date.now();
            playSound('warning');
            updateStatus('💥 KOLIZE! Velká penalizace!');
            game.score -= 150;
        }
    });
}

// ============================================
// MISSION SYSTEM
// ============================================

function startNewMission() {
    if (game.currentMission) return;
    
    const mission = game.missions[Math.floor(Math.random() * game.missions.length)];
    game.currentMission = mission;
    game.missionProgress = 0;
    updateStatus(`🎯 Mise začala: ${mission.name}`);
    playSound('stop');
}

function checkMissionComplete() {
    if (!game.currentMission) return;
    
    const mission = game.currentMission;
    let complete = false;
    
    switch (mission.type) {
        case 'stops':
            complete = game.missionProgress >= mission.target;
            break;
        case 'passengers':
            complete = game.missionProgress >= mission.target;
            break;
        case 'penalties':
            complete = game.penalties === 0 && game.time > 300;
            break;
        case 'efficiency':
            complete = game.totalPassengersServed >= mission.target && game.penalties < 5;
            break;
    }
    
    if (complete) {
        game.score += mission.reward;
        updateStatus(`✅ MISE SPLNĚNA! Odměna: ${mission.reward} bodů`);
        playSound('stop');
        game.currentMission = null;
        game.missionProgress = 0;
    }
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
    
    if (bus.battery < 20) {
        document.getElementById('status').textContent = '⚠️ BATERIE NÍZKÁ!';
        document.getElementById('status').classList.add('warning');
    } else if (bus.doorsOpen) {
        document.getElementById('status').textContent = '🚪 Dveře - cestující nastupují';
        document.getElementById('status').classList.remove('warning', 'error');
    } else if (bus.speed > bus.maxSpeed * 0.9) {
        document.getElementById('status').textContent = '⚠️ Zpomalte!';
        document.getElementById('status').classList.add('warning');
    } else {
        document.getElementById('status').textContent = '✓ Normální provoz';
        document.getElementById('status').classList.remove('warning', 'error');
    }
}

// ============================================
// SOUND
// ============================================

function playSound(type) {
    if (!game.audioEnabled) return;
    
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();
        
        osc.connect(gain);
        gain.connect(audioContext.destination);
        
        switch(type) {
            case 'honk':
                osc.frequency.value = 850;
                gain.gain.setValueAtTime(0.1, audioContext.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
                break;
            case 'stop':
                osc.frequency.value = 600;
                gain.gain.setValueAtTime(0.05, audioContext.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
                break;
            case 'warning':
                osc.frequency.setValueAtTime(400, audioContext.currentTime);
                osc.frequency.linearRampToValueAtTime(700, audioContext.currentTime + 0.5);
                gain.gain.setValueAtTime(0.08, audioContext.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
                break;
        }
        
        osc.start(audioContext.currentTime);
        osc.stop(audioContext.currentTime + 0.5);
    } catch (e) {}
}

function updateStatus(message) {
    const statusEl = document.getElementById('status');
    statusEl.textContent = message;
}

// ============================================
// GAME LOOP
// ============================================

function gameLoop() {
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    updateBus();
    updateAIVehicles();
    updateTrafficLights();
    checkCollisions();
    checkMissionComplete();
    updateHUD();
    
    if (!game.paused) {
        game.time += 1 / 60;
    }
    
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
    console.log('🚌 MHD Simulátor - PRO verze spuštěna!');
    console.log('Dostupná vozidla: 9 typů Karosa + Iveco E-way 12M');
    gameLoop();
});
