
const fileSystem = {
  '/': {
    type: 'folder',
    content: {
      'Desktop': { type: 'folder', content: {
        'ProjectNebula': { type: 'folder', content: {} },
        'Notes.txt': { type: 'file', content: 'Welcome to NebulaOS!' }
      }},
      'Documents': { type: 'folder', content: {
        'Report.docx': { type: 'file', content: '' },
        'Data.csv': { type: 'file', content: '' }
      }},
      'Downloads': { type: 'folder', content: {
        'Installer.exe': { type: 'file', content: '' },
        'Image.png': { type: 'file', content: '' }
      }},
      'Pictures': { type: 'folder', content: {} },
      'Music': { type: 'folder', content: {} },
      'Videos': { type: 'folder', content: {} }
    }
  }
};

let notepadContent = '';
let historyStack = ['/'];
let historyIndex = 0;
let soundEnabled = false;
let wifiEnabled = false;
let bluetoothEnabled = false;
let batteryLevel = 100;
let batteryDrainRate = 0.5;
let batteryChargeStatus = 'Discharging';
let selectedItem = null;
let copiedItem = null;
let copiedItemPath = null;
let draggedIcon = null;
let iconPositions = {};
let dragInfo = null;
let gameInstance = null;
let currentGame = null;
let mouseHandler = null;
let keyHandler = null;
let currentPuzzle = null;
let puzzleCallback = null;

window.onload = function() {
  document.body.className = 'light-mode'; // Set light mode as default
  document.body.style.backgroundImage = 'url("https://images.unsplash.com/photo-1441974231531-c6227db76b6e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80")'; // Set default nature background
  showWelcomeScreen();
  updateWifiStatus();
  updateBatteryIcon();
  updateVolumeStatus();
  initializeIconPositions();
  updateClock();
  createPuzzleModal();
  // Set theme select to light mode
  const themeSelect = document.getElementById('theme-select');
  if (themeSelect) {
    themeSelect.value = 'light';
  }
  // Set background select to new default
  const backgroundSelect = document.getElementById('background-select');
  if (backgroundSelect) {
    backgroundSelect.value = 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80';
  }
};

function updateClock() {
  const clock = document.getElementById('clock');
  const format = document.getElementById('time-format')?.value || '12';
  const now = new Date();
  const istOffset = 5.5 * 60 * 60 * 1000;
  const istTime = new Date(now.getTime() + istOffset);
  if (clock) {
    clock.textContent = istTime.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      hour12: format === '12',
      timeZone: 'UTC'
    });
  }
}
setInterval(updateClock, 1000);

function updateBattery() {
  const batteryLevelDisplay = document.getElementById('battery-level');
  if (batteryChargeStatus === 'Discharging' && batteryLevel > 0) {
    batteryLevel -= batteryDrainRate;
  } else if (batteryChargeStatus === 'Charging' && batteryLevel < 100) {
    batteryLevel += batteryDrainRate;
  }
  batteryLevel = Math.max(0, Math.min(100, batteryLevel));
  if (batteryLevelDisplay) {
    batteryLevelDisplay.textContent = `${Math.round(batteryLevel)}%`;
  }
  updateBatteryIcon();
}
setInterval(updateBattery, 60000);

function updateBatteryIcon() {
  const batteryIcon = document.getElementById('battery-icon');
  if (batteryIcon) {
    let iconLevel = Math.ceil(batteryLevel / 10);
    const baseIcon = `battery_${iconLevel}_24_filled`;
    batteryIcon.src = `https://cdn.jsdelivr.net/npm/@fluentui/svg-icons/icons/${baseIcon}.svg`;
    batteryIcon.alt = 'Battery Icon';
  }
}

function showBatteryPerformance() {
  const estimatedTimeRemaining = calculateEstimatedTimeRemaining();
  const message = `Battery Performance:\nLevel: ${Math.round(batteryLevel)}%\nStatus: ${batteryChargeStatus}\nEstimated Time Remaining: ${estimatedTimeRemaining}`;
  alert(message);
}

function calculateEstimatedTimeRemaining() {
  if (batteryChargeStatus === 'Charging') {
    return 'N/A (Charging)';
  }
  const drainRatePerHour = batteryDrainRate * 60;
  const remainingHours = batteryLevel / drainRatePerHour;
  const hours = Math.floor(remainingHours);
  const minutes = Math.round((remainingHours - hours) * 60);
  return hours === 0 && minutes === 0 ? 'Less than a minute' : `${hours}h ${minutes}m`;
}

function updateWifiStatus() {
  const wifiIcon = document.getElementById('wifi-icon');
  const wifiToggleBtn = document.getElementById('wifi-toggle');
  if (wifiIcon) {
    wifiIcon.src = wifiEnabled
      ? 'https://cdn.jsdelivr.net/npm/@fluentui/svg-icons/icons/wifi_1_24_filled.svg'
      : 'https://cdn.jsdelivr.net/npm/@fluentui/svg-icons/icons/wifi_off_24_filled.svg';
    wifiIcon.alt = wifiEnabled ? 'Wi-Fi On Icon' : 'Wi-Fi Off Icon';
  }
  if (wifiToggleBtn) {
    wifiToggleBtn.textContent = `Wi-Fi: ${wifiEnabled ? 'On' : 'Off'}`;
  }
}

function toggleWifi() {
  wifiEnabled = !wifiEnabled;
  updateWifiStatus();
  alert(`Wi-Fi ${wifiEnabled ? 'enabled' : 'disabled'}`);
}

function updateVolumeStatus() {
  const volumeIcon = document.getElementById('volume-icon');
  if (volumeIcon) {
    volumeIcon.src = soundEnabled
      ? 'https://cdn.jsdelivr.net/npm/@fluentui/svg-icons/icons/volume_3_24_filled.svg'
      : 'https://cdn.jsdelivr.net/npm/@fluentui/svg-icons/icons/volume_off_24_filled.svg';
    volumeIcon.alt = soundEnabled ? 'Volume On Icon' : 'Volume Off Icon';
  }
}

function toggleSound() {
  soundEnabled = !soundEnabled;
  const soundToggle = document.getElementById('sound-toggle');
  if (soundToggle) {
    soundToggle.textContent = `Sound: ${soundEnabled ? 'On' : 'Off'}`;
  }
  updateVolumeStatus();
  alert(`Sound ${soundEnabled ? 'enabled' : 'disabled'}`);
}

function toggleBluetooth() {
  bluetoothEnabled = !bluetoothEnabled;
  const bluetoothToggle = document.getElementById('bluetooth-toggle');
  if (bluetoothToggle) {
    bluetoothToggle.textContent = `Bluetooth: ${bluetoothEnabled ? 'On' : 'Off'}`;
  }
  alert(`Bluetooth ${bluetoothEnabled ? 'enabled' : 'disabled'}`);
}

function adjustBrightness() {
  const brightness = document.getElementById('brightness');
  if (brightness) {
    const value = brightness.value;
    alert(`Brightness set to ${value}%`);
  }
}

function changePowerMode() {
  const powerMode = document.getElementById('power-mode');
  if (powerMode) {
    const mode = powerMode.value;
    batteryDrainRate = mode === 'Performance' ? 1 : mode === 'Power Saving' ? 0.3 : 0.5;
    alert(`Power mode set to ${mode}`);
  }
}

function changeTheme() {
  const themeSelect = document.getElementById('theme-select');
  if (themeSelect) {
    const theme = themeSelect.value;
    document.body.className = theme + '-mode';
    document.querySelectorAll('.window').forEach(win => win.classList.remove('active'));
  }
}

function changeBackground() {
  const backgroundSelect = document.getElementById('background-select');
  if (backgroundSelect) {
    const bg = backgroundSelect.value;
    document.body.style.backgroundImage = `url('${bg}')`;
  }
}

function showSettingsSection(section) {
  document.querySelectorAll('.settings-section').forEach(el => el.style.display = 'none');
  const sectionElement = document.getElementById(section);
  if (sectionElement) {
    sectionElement.style.display = 'block';
  }
  document.querySelectorAll('.settings-sidebar li').forEach(li => li.classList.remove('active'));
  const sidebarItem = document.querySelector(`.settings-sidebar li[data-section="${section}"]`);
  if (sidebarItem) {
    sidebarItem.classList.add('active');
  }
}

function searchStartMenu() {
  const startSearch = document.getElementById('start-search');
  if (startSearch) {
    const query = startSearch.value.toLowerCase();
    const items = document.querySelectorAll('.start-menu-item');
    items.forEach(item => {
      item.style.display = item.textContent.toLowerCase().includes(query) ? 'block' : 'none';
    });
  }
}

function loadWebsite() {
  const browserUrl = document.getElementById('browser-url');
  const browserContent = document.getElementById('browser-content');
  if (browserUrl && browserContent) {
    const url = browserUrl.value.trim();
    browserContent.src = url ? (url.startsWith('http') ? url : 'https://' + url) : '';
  }
}

function showGameHub() {
  if (gameInstance) {
    gameInstance.reset();
    gameInstance = null;
  }
  if (mouseHandler) {
    const canvas = document.getElementById('game-canvas');
    if (canvas) {
      canvas.removeEventListener('mousedown', mouseHandler);
      canvas.removeEventListener('mousemove', mouseHandler);
      canvas.removeEventListener('mouseup', mouseHandler);
    }
    mouseHandler = null;
  }
  if (keyHandler) {
    document.removeEventListener('keydown', keyHandler);
    document.removeEventListener('keyup', keyHandler);
    keyHandler = null;
  }
  currentGame = null;
  const gameHub = document.getElementById('game-hub');
  const gamePlayArea = document.getElementById('game-play-area');
  if (gameHub && gamePlayArea) {
    gameHub.style.display = 'grid';
    gamePlayArea.style.display = 'none';
  }
}

function startGame(gameMode) {
  if (gameInstance) {
    gameInstance.reset();
    gameInstance = null;
  }
  if (mouseHandler) {
    const canvas = document.getElementById('game-canvas');
    if (canvas) {
      canvas.removeEventListener('mousedown', mouseHandler);
      canvas.removeEventListener('mousemove', mouseHandler);
      canvas.removeEventListener('mouseup', mouseHandler);
    }
    mouseHandler = null;
  }
  if (keyHandler) {
    document.removeEventListener('keydown', keyHandler);
    document.removeEventListener('keyup', keyHandler);
    keyHandler = null;
  }
  const gameHub = document.getElementById('game-hub');
  const gamePlayArea = document.getElementById('game-play-area');
  if (gameHub && gamePlayArea) {
    gameHub.style.display = 'none';
    gamePlayArea.style.display = 'flex';
  }
  currentGame = gameMode;
  if (gameMode === 'colorMatch') {
    startColorMatch();
  } else if (gameMode === 'shapeCatch') {
    startShapeCatch();
  } else if (gameMode === 'numberPop') {
    startNumberPop();
  } else if (gameMode === 'blockStack') {
    startBlockStack();
  } else if (gameMode === 'blockMatch') {
    startBlockMatch();
  }
}

function startColorMatch() {
  const canvas = document.getElementById('game-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const scoreDisplay = document.getElementById('game-score');
  let balloons = [];
  let baskets = [
    { x: 50, color: 'red' },
    { x: 150, color: 'blue' },
    { x: 250, color: 'yellow' }
  ];
  let score = 0;
  let misses = 0;
  let selectedBalloon = null;
  let gameLoop = null;

  function spawnBalloon() {
    const colors = ['red', 'blue', 'yellow'];
    return {
      x: Math.random() * (canvas.width - 30) + 15,
      y: canvas.height,
      color: colors[Math.floor(Math.random() * colors.length)],
      radius: 15
    };
  }

  function draw() {
    ctx.fillStyle = '#E0F7FA';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    baskets.forEach(basket => {
      ctx.fillStyle = basket.color;
      ctx.fillRect(basket.x - 30, canvas.height - 50, 60, 30);
    });
    balloons.forEach(balloon => {
      ctx.fillStyle = balloon.color;
      ctx.beginPath();
      ctx.arc(balloon.x, balloon.y, balloon.radius, 0, Math.PI * 2);
      ctx.fill();
    });
    if (scoreDisplay) {
      scoreDisplay.textContent = `Score: ${score}`;
    }
  }

  function update() {
    balloons.forEach(balloon => {
      balloon.y -= 0.5;
    });
    balloons = balloons.filter(balloon => {
      if (balloon.y < -balloon.radius) {
        misses++;
        if (misses >= 5) {
          resetGame();
          alert('Oh no! Too many balloons missed. Try again!');
        }
        return false;
      }
      return true;
    });
    if (Math.random() < 0.02) balloons.push(spawnBalloon());
    if (score >= 10) {
      resetGame();
      alert('Great job! You matched all the balloons!');
    }
  }

  function resetGame() {
    balloons = [];
    score = 0;
    misses = 0;
    selectedBalloon = null;
    if (scoreDisplay) {
      scoreDisplay.textContent = `Score: ${score}`;
    }
    if (gameLoop) {
      clearInterval(gameLoop);
      gameLoop = null;
    }
    draw();
  }

  function gameTick() {
    update();
    draw();
  }

  function handleMouse(e) {
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    if (e.type === 'mousedown') {
      balloons.forEach(balloon => {
        const dx = mouseX - balloon.x;
        const dy = mouseY - balloon.y;
        if (Math.sqrt(dx * dx + dy * dy) < balloon.radius) {
          selectedBalloon = balloon;
        }
      });
    } else if (e.type === 'mousemove' && selectedBalloon) {
      selectedBalloon.x = mouseX;
      selectedBalloon.y = mouseY;
    } else if (e.type === 'mouseup' && selectedBalloon) {
      baskets.forEach(basket => {
        if (
          mouseX > basket.x - 30 && mouseX < basket.x + 30 &&
          mouseY > canvas.height - 50 && mouseY < canvas.height - 20 &&
          selectedBalloon.color === basket.color
        ) {
          score++;
          balloons = balloons.filter(b => b !== selectedBalloon);
        }
      });
      selectedBalloon = null;
    }
  }

  mouseHandler = handleMouse;
  canvas.addEventListener('mousedown', mouseHandler);
  canvas.addEventListener('mousemove', mouseHandler);
  canvas.addEventListener('mouseup', mouseHandler);
  gameInstance = { reset: resetGame };
  balloons.push(spawnBalloon());
  gameLoop = setInterval(gameTick, 50);
  draw();
}

function startShapeCatch() {
  const canvas = document.getElementById('game-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const scoreDisplay = document.getElementById('game-score');
  const basketWidth = 60;
  let basketX = canvas.width / 2 - basketWidth / 2;
  let shapes = [];
  let targetShape = 'circle';
  let score = 0;
  let wrongCatches = 0;
  let dx = 0;
  let gameLoop = null;

  function spawnShape() {
    const types = ['circle', 'square', 'triangle'];
    return {
      x: Math.random() * (canvas.width - 30) + 15,
      y: 0,
      type: types[Math.floor(Math.random() * types.length)],
      size: 30
    };
  }

  function draw() {
    ctx.fillStyle = '#E0F7FA';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'green';
    ctx.fillRect(basketX, canvas.height - 50, basketWidth, 30);
    shapes.forEach(shape => {
      ctx.fillStyle = shape.type === targetShape ? 'yellow' : 'red';
      if (shape.type === 'circle') {
        ctx.beginPath();
        ctx.arc(shape.x, shape.y, shape.size / 2, 0, Math.PI * 2);
        ctx.fill();
      } else if (shape.type === 'square') {
        ctx.fillRect(shape.x - shape.size / 2, shape.y - shape.size / 2, shape.size, shape.size);
      } else if (shape.type === 'triangle') {
        ctx.beginPath();
        ctx.moveTo(shape.x, shape.y - shape.size / 2);
        ctx.lineTo(shape.x - shape.size / 2, shape.y + shape.size / 2);
        ctx.lineTo(shape.x + shape.size / 2, shape.y + shape.size / 2);
        ctx.closePath();
        ctx.fill();
      }
    });
    ctx.fillStyle = 'black';
    ctx.font = '16px Orbitron';
    ctx.fillText(`Catch: ${targetShape}`, 10, 20);
    if (scoreDisplay) {
      scoreDisplay.textContent = `Score: ${score}`;
    }
  }

  function update() {
    basketX += dx;
    if (basketX < 0) basketX = 0;
    if (basketX > canvas.width - basketWidth) basketX = canvas.width - basketWidth;

    shapes.forEach(shape => {
      shape.y += 1;
    });

    shapes = shapes.filter(shape => {
      if (shape.y > canvas.height - 50 && shape.x > basketX && shape.x < basketX + basketWidth) {
        if (shape.type === targetShape) {
          score++;
          const types = ['circle', 'square', 'triangle'];
          targetShape = types[Math.floor(Math.random() * types.length)];
        } else {
          wrongCatches++;
          if (wrongCatches >= 3) {
            resetGame();
            alert('Oops! Too many wrong shapes. Try again!');
          }
        }
        return false;
      }
      return shape.y < canvas.height + shape.size;
    });

    if (Math.random() < 0.02) shapes.push(spawnShape());
    if (score >= 10) {
      resetGame();
      alert('Awesome! You caught all the shapes!');
    }
  }

  function resetGame() {
    basketX = canvas.width / 2 - basketWidth / 2;
    shapes = [];
    targetShape = 'circle';
    score = 0;
    wrongCatches = 0;
    dx = 0;
    if (scoreDisplay) {
      scoreDisplay.textContent = `Score: ${score}`;
    }
    if (gameLoop) {
      clearInterval(gameLoop);
      gameLoop = null;
    }
    draw();
  }

  function gameTick() {
    update();
    draw();
  }

  function handleKey(e) {
    if (e.type === 'keydown') {
      if (!gameLoop && ['ArrowLeft', 'ArrowRight'].includes(e.key)) {
        gameLoop = setInterval(gameTick, 50);
      }
      if (e.key === 'ArrowLeft') dx = -5;
      if (e.key === 'ArrowRight') dx = 5;
    } else if (e.type === 'keyup') {
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') dx = 0;
    }
  }

  keyHandler = handleKey;
  document.addEventListener('keydown', keyHandler);
  document.addEventListener('keyup', keyHandler);
  gameInstance = { reset: resetGame };
  shapes.push(spawnShape());
  gameLoop = setInterval(gameTick, 50);
  draw();
}

function startNumberPop() {
  const canvas = document.getElementById('game-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const scoreDisplay = document.getElementById('game-score');
  let bubbles = [];
  let targetNumber = 1;
  let wrongClicks = 0;

  function spawnBubble(ensureTarget = false) {
    const number = ensureTarget ? targetNumber : Math.floor(Math.random() * 5) + 1;
    let x, y, tooClose;
    do {
      x = Math.random() * (canvas.width - 40) + 20;
      y = Math.random() * (canvas.height - 40) + 20;
      tooClose = bubbles.some(b => {
        const dx = b.x - x;
        const dy = b.y - y;
        return Math.sqrt(dx * dx + dy * dy) < 50;
      });
    } while (tooClose);
    return { x, y, number, radius: 20 };
  }

  function ensureTargetBubble() {
    if (!bubbles.some(b => b.number === targetNumber)) {
      bubbles.push(spawnBubble(true));
    }
    while (bubbles.length < 3) {
      bubbles.push(spawnBubble());
    }
    while (bubbles.length > 5) {
      bubbles.pop();
    }
  }

  function draw() {
    ctx.fillStyle = '#E0F7FA';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    bubbles.forEach(bubble => {
      ctx.fillStyle = bubble.number === targetNumber ? 'yellow' : 'red';
      ctx.beginPath();
      ctx.arc(bubble.x, bubble.y, bubble.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'black';
      ctx.font = '16px Orbitron';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(bubble.number, bubble.x, bubble.y);
    });
    ctx.fillStyle = 'black';
    ctx.font = '16px Orbitron';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText(`Find: ${targetNumber}`, 10, 10);
    if (scoreDisplay) {
      scoreDisplay.textContent = `Score: ${targetNumber - 1}`;
    }
  }

  function resetGame() {
    bubbles = [];
    targetNumber = 1;
    wrongClicks = 0;
    if (scoreDisplay) {
      scoreDisplay.textContent = `Score: 0`;
    }
    ensureTargetBubble();
    draw();
  }

  function handleMouse(e) {
    if (e.type !== 'mousedown') return;
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    let hit = false;

    for (let i = bubbles.length - 1; i >= 0; i--) {
      const bubble = bubbles[i];
      const dx = mouseX - bubble.x;
      const dy = mouseY - bubble.y;
      if (Math.sqrt(dx * dx + dy * dy) < bubble.radius) {
        if (bubble.number === targetNumber) {
          bubbles.splice(i, 1);
          targetNumber++;
          hit = true;
          if (targetNumber > 5) {
            resetGame();
            alert('Yay! You found all the numbers!');
            return;
          }
        } else {
          wrongClicks++;
          if (wrongClicks >= 3) {
            resetGame();
            alert('Oops! Too many wrong clicks. Try again!');
            return;
          }
        }
        break;
      }
    }

    if (!hit && !e.target.closest('#game-back-button')) {
      wrongClicks++;
      if (wrongClicks >= 3) {
        resetGame();
        alert('Oops! Too many wrong clicks. Try again!');
        return;
      }
    }

    ensureTargetBubble();
    draw();
  }

  mouseHandler = handleMouse;
  canvas.addEventListener('mousedown', mouseHandler);
  gameInstance = { reset: resetGame };
  resetGame();
}

function startBlockStack() {
  const canvas = document.getElementById('game-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const scoreDisplay = document.getElementById('game-score');
  const platformY = canvas.height - 50;
  let blocks = [];
  let currentBlock = null;
  let score = 0;
  let falls = 0;
  let dx = 0;
  let gameLoop = null;

  function spawnBlock() {
    const widths = [60, 80, 100];
    return {
      x: Math.random() * (canvas.width - 100) + 50,
      y: 0,
      width: widths[Math.floor(Math.random() * widths.length)],
      height: 30,
      color: ['red', 'blue', 'yellow'][Math.floor(Math.random() * 3)]
    };
  }

  function draw() {
    ctx.fillStyle = '#E0F7FA';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'gray';
    ctx.fillRect(0, platformY, canvas.width, 30);
    blocks.forEach(block => {
      ctx.fillStyle = block.color;
      ctx.fillRect(block.x, block.y, block.width, block.height);
    });
    if (currentBlock) {
      ctx.fillStyle = currentBlock.color;
      ctx.fillRect(currentBlock.x, currentBlock.y, currentBlock.width, currentBlock.height);
    }
    if (scoreDisplay) {
      scoreDisplay.textContent = `Score: ${score}`;
    }
  }

  function update() {
    if (currentBlock) {
      currentBlock.x += dx;
      currentBlock.y += 1;
      if (currentBlock.x < 0) currentBlock.x = 0;
      if (currentBlock.x > canvas.width - currentBlock.width) currentBlock.x = canvas.width - currentBlock.width;

      if (currentBlock.y + currentBlock.height >= platformY) {
        if (currentBlock.x < 0 || currentBlock.x + currentBlock.width > canvas.width) {
          falls++;
          currentBlock = null;
          if (falls >= 3) {
            resetGame();
            alert('Oops! Too many blocks fell off. Try again!');
            return;
          }
        } else {
          currentBlock.y = platformY - blocks.length * currentBlock.height - currentBlock.height;
          blocks.push(currentBlock);
          score++;
          currentBlock = null;
          if (score >= 10) {
            resetGame();
            alert('Great job! You stacked all the blocks!');
            return;
          }
        }
      }
    } else {
      currentBlock = spawnBlock();
    }
  }

  function resetGame() {
    blocks = [];
    currentBlock = null;
    score = 0;
    falls = 0;
    dx = 0;
    if (scoreDisplay) {
      scoreDisplay.textContent = `Score: ${score}`;
    }
    if (gameLoop) {
      clearInterval(gameLoop);
      gameLoop = null;
    }
    draw();
  }

  function gameTick() {
    update();
    draw();
  }

  function handleKey(e) {
    if (e.type === 'keydown') {
      if (!gameLoop && ['ArrowLeft', 'ArrowRight'].includes(e.key)) {
        gameLoop = setInterval(gameTick, 50);
      }
      if (e.key === 'ArrowLeft') dx = -5;
      if (e.key === 'ArrowRight') dx = 5;
    } else if (e.type === 'keyup') {
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') dx = 0;
    }
  }

  keyHandler = handleKey;
  document.addEventListener('keydown', keyHandler);
  document.addEventListener('keyup', keyHandler);
  gameInstance = { reset: resetGame };
  currentBlock = spawnBlock();
  gameLoop = setInterval(gameTick, 50);
  draw();
}

function startBlockMatch() {
  const canvas = document.getElementById('game-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const scoreDisplay = document.getElementById('game-score');
  const gridSize = 5;
  const blockSize = canvas.width / gridSize;
  let grid = [];
  let selectedBlock = null;
  let score = 0;
  let wrongClicks = 0;

  function initializeGrid() {
    grid = [];
    const colors = ['red', 'blue', 'yellow'];
    for (let i = 0; i < gridSize; i++) {
      const row = [];
      for (let j = 0; j < gridSize; j++) {
        row.push(colors[Math.floor(Math.random() * colors.length)]);
      }
      grid.push(row);
    }
  }

  function draw() {
    ctx.fillStyle = '#E0F7FA';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < gridSize; i++) {
      for (let j = 0; j < gridSize; j++) {
        ctx.fillStyle = grid[i][j];
        ctx.fillRect(j * blockSize, i * blockSize, blockSize - 2, blockSize - 2);
      }
    }
    if (selectedBlock) {
      ctx.strokeStyle = 'black';
      ctx.lineWidth = 4;
      ctx.strokeRect(
        selectedBlock.j * blockSize,
        selectedBlock.i * blockSize,
        blockSize - 2,
        blockSize - 2
      );
    }
    ctx.fillStyle = 'black';
    ctx.font = '16px Orbitron';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText('Match pairs', 10, 10);
    if (scoreDisplay) {
      scoreDisplay.textContent = `Score: ${score}`;
    }
  }

  function resetGame() {
    initializeGrid();
    selectedBlock = null;
    score = 0;
    wrongClicks = 0;
    if (scoreDisplay) {
      scoreDisplay.textContent = `Score: ${score}`;
    }
    draw();
  }

  function handleMouse(e) {
    if (e.type !== 'mousedown') return;
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    if (e.target.closest('#game-back-button')) return;

    const i = Math.floor(mouseY / blockSize);
    const j = Math.floor(mouseX / blockSize);
    if (i < 0 || i >= gridSize || j < 0 || j >= gridSize) {
      wrongClicks++;
      if (wrongClicks >= 3) {
        resetGame();
        alert('Oops! Too many wrong clicks. Try again!');
      }
      return;
    }

    if (!selectedBlock) {
      selectedBlock = { i, j };
    } else {
      const isAdjacent =
        (Math.abs(selectedBlock.i - i) === 1 && selectedBlock.j === j) ||
        (Math.abs(selectedBlock.j - j) === 1 && selectedBlock.i === i);
      if (isAdjacent && grid[selectedBlock.i][selectedBlock.j] === grid[i][j]) {
        grid[selectedBlock.i][selectedBlock.j] = ['red', 'blue', 'yellow'][Math.floor(Math.random() * 3)];
        grid[i][j] = ['red', 'blue', 'yellow'][Math.floor(Math.random() * 3)];
        score++;
        if (score >= 10) {
          resetGame();
          alert('Awesome! You matched all the pairs!');
          return;
        }
      } else {
        wrongClicks++;
        if (wrongClicks >= 3) {
          resetGame();
          alert('Oops! Too many wrong clicks. Try again!');
          return;
        }
      }
      selectedBlock = null;
    }
    draw();
  }

  mouseHandler = handleMouse;
  canvas.addEventListener('mousedown', mouseHandler);
  gameInstance = { reset: resetGame };
  resetGame();
}

// Puzzle Logic
const puzzles = [
  // Math Puzzles
  {
    type: 'math',
    generate: () => ({
      question: 'What is 6 + 7?',
      answer: '13',
      inputType: 'text'
    })
  },
  {
    type: 'math',
    generate: () => ({
      question: 'What is 12 - 5?',
      answer: '7',
      inputType: 'text'
    })
  },
  {
    type: 'math',
    generate: () => ({
      question: 'What is 4 * 3?',
      answer: '12',
      inputType: 'text'
    })
  },
  {
    type: 'math',
    generate: () => ({
      question: 'What is 15 / 3?',
      answer: '5',
      inputType: 'text'
    })
  },
  // Pattern Puzzles
  {
    type: 'pattern',
    generate: () => ({
      question: 'Next in sequence: 2, 4, 8, 16, ?',
      answer: '32',
      inputType: 'text'
    })
  },
  {
    type: 'pattern',
    generate: () => ({
      question: 'Next in sequence: 1, 3, 6, 10, ?',
      answer: '15',
      inputType: 'text'
    })
  },
  {
    type: 'pattern',
    generate: () => ({
      question: 'Next in sequence: 5, 10, 20, 35, ?',
      answer: '50',
      inputType: 'text'
    })
  },
  // Memory Puzzles
  {
    type: 'memory',
    generate: () => {
      const colors = ['Red', 'Blue', 'Yellow'];
      const sequence = ['Red', 'Blue', 'Red'];
      return {
        question: `Memorize: ${sequence.join(' -> ')}. Click in order.`,
        answer: sequence,
        inputType: 'buttons',
        options: colors
      };
    }
  },
  {
    type: 'memory',
    generate: () => {
      const shapes = ['Circle', 'Square', 'Triangle'];
      const sequence = ['Circle', 'Triangle', 'Square'];
      return {
        question: `Memorize: ${sequence.join(' -> ')}. Click in order.`,
        answer: sequence,
        inputType: 'buttons',
        options: shapes
      };
    }
  },
  {
    type: 'memory',
    generate: () => {
      const numbers = ['1', '2', '3'];
      const sequence = ['2', '1', '3'];
      return {
        question: `Memorize: ${sequence.join(' -> ')}. Click in order.`,
        answer: sequence,
        inputType: 'buttons',
        options: numbers
      };
    }
  },
  // Trivia Puzzles
  {
    type: 'trivia',
    generate: () => ({
      question: 'What is the capital of France?',
      answer: 'Paris',
      inputType: 'multiple-choice',
      options: ['Paris', 'London', 'Berlin', 'Madrid']
    })
  },
  {
    type: 'trivia',
    generate: () => ({
      question: 'Which planet is known as the Red Planet?',
      answer: 'Mars',
      inputType: 'multiple-choice',
      options: ['Venus', 'Mars', 'Jupiter', 'Mercury']
    })
  },
  {
    type: 'trivia',
    generate: () => ({
      question: 'What is the largest mammal?',
      answer: 'Blue Whale',
      inputType: 'multiple-choice',
      options: ['Elephant', 'Blue Whale', 'Giraffe', 'Polar Bear']
    })
  },
  // Logic Puzzles
  {
    type: 'logic',
    generate: () => ({
      question: 'If A is B\'s brother and C is B\'s sister, who is C to A?',
      answer: 'Sister',
      inputType: 'text'
    })
  },
  {
    type: 'logic',
    generate: () => ({
      question: 'If today is Wednesday, what day is it in two days?',
      answer: 'Friday',
      inputType: 'text'
    })
  }
];

function createPuzzleModal() {
  const modal = document.createElement('div');
  modal.id = 'puzzle-modal';
  modal.style.position = 'fixed';
  modal.style.top = '50%';
  modal.style.left = '50%';
  modal.style.transform = 'translate(-50%, -50%)';
  modal.style.background = 'rgba(0, 0, 0, 0.8)';
  modal.style.borderRadius = '16px';
  modal.style.padding = '2rem';
  modal.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.2), 0 0 10px rgba(0, 191, 165, 0.5)';
  modal.style.color = 'white';
  modal.style.zIndex = '1000';
  modal.style.display = 'none';
  modal.style.fontFamily = 'Roboto, sans-serif';
  modal.style.maxWidth = '400px';
  modal.style.textAlign = 'center';
  
  const question = document.createElement('p');
  question.id = 'puzzle-question';
  modal.appendChild(question);
  
  const inputContainer = document.createElement('div');
  inputContainer.id = 'puzzle-input';
  inputContainer.style.marginTop = '1rem';
  modal.appendChild(inputContainer);
  
  const submitButton = document.createElement('button');
  submitButton.textContent = 'Submit';
  submitButton.style.padding = '0.75rem 1.5rem';
  submitButton.style.border = 'none';
  submitButton.style.borderRadius = '8px';
  submitButton.style.background = '#26A69A';
  submitButton.style.color = 'white';
  submitButton.style.cursor = 'pointer';
  submitButton.style.marginTop = '1rem';
  submitButton.onclick = checkPuzzleAnswer;
  modal.appendChild(submitButton);
  
  const cancelButton = document.createElement('button');
  cancelButton.textContent = 'Cancel';
  cancelButton.style.padding = '0.75rem 1.5rem';
  cancelButton.style.border = 'none';
  cancelButton.style.borderRadius = '8px';
  cancelButton.style.background = '#FF1744';
  cancelButton.style.color = 'white';
  cancelButton.style.cursor = 'pointer';
  cancelButton.style.marginTop = '0.5rem';
  cancelButton.onclick = () => {
    modal.style.display = 'none';
    currentPuzzle = null;
    puzzleCallback = null;
  };
  modal.appendChild(cancelButton);
  
  document.body.appendChild(modal);
}

function showPuzzle(callback) {
  const modal = document.getElementById('puzzle-modal');
  const question = document.getElementById('puzzle-question');
  const inputContainer = document.getElementById('puzzle-input');
  if (!modal || !question || !inputContainer) return;
  
  currentPuzzle = puzzles[Math.floor(Math.random() * puzzles.length)].generate();
  puzzleCallback = callback;
  
  question.textContent = currentPuzzle.question;
  inputContainer.innerHTML = '';
  
  if (currentPuzzle.inputType === 'text') {
    const input = document.createElement('input');
    input.type = 'text';
    input.id = 'puzzle-answer';
    input.style.padding = '0.75rem';
    input.style.borderRadius = '8px';
    input.style.border = 'none';
    input.style.width = '100%';
    input.style.marginBottom = '1rem';
    inputContainer.appendChild(input);
  } else if (currentPuzzle.inputType === 'buttons') {
    currentPuzzle.userSequence = [];
    currentPuzzle.options.forEach(option => {
      const button = document.createElement('button');
      button.textContent = option;
      button.style.padding = '0.5rem 1rem';
      button.style.border = 'none';
      button.style.borderRadius = '8px';
      button.style.background = '#26A69A';
      button.style.color = 'white';
      button.style.margin = '0.5rem';
      button.style.cursor = 'pointer';
      button.onclick = () => {
        currentPuzzle.userSequence.push(option);
        if (currentPuzzle.userSequence.length === currentPuzzle.answer.length) {
          const isCorrect = currentPuzzle.userSequence.every(
            (val, i) => val === currentPuzzle.answer[i]
          );
          if (isCorrect) {
            alert('Correct! Accessing the application.');
            modal.style.display = 'none';
            currentPuzzle = null;
            puzzleCallback();
          } else {
            alert('Incorrect sequence. Try again.');
            currentPuzzle.userSequence = [];
          }
        }
      };
      inputContainer.appendChild(button);
    });
  } else if (currentPuzzle.inputType === 'multiple-choice') {
    currentPuzzle.options.forEach(option => {
      const button = document.createElement('button');
      button.textContent = option;
      button.style.padding = '0.5rem 1rem';
      button.style.border = 'none';
      button.style.borderRadius = '8px';
      button.style.background = '#26A69A';
      button.style.color = 'white';
      button.style.margin = '0.5rem';
      button.style.cursor = 'pointer';
      button.onclick = () => {
        if (option === currentPuzzle.answer) {
          alert('Correct! Accessing the application.');
          modal.style.display = 'none';
          currentPuzzle = null;
          puzzleCallback();
        } else {
          alert('Incorrect answer. Try again.');
        }
      };
      inputContainer.appendChild(button);
    });
  }
  
  modal.style.display = 'block';
}

function checkPuzzleAnswer() {
  const modal = document.getElementById('puzzle-modal');
  if (!modal || !currentPuzzle || !puzzleCallback) return;
  
  if (currentPuzzle.inputType === 'text') {
    const input = document.getElementById('puzzle-answer');
    if (!input) return;
    const userAnswer = input.value.trim();
    if (userAnswer.toLowerCase() === currentPuzzle.answer.toLowerCase()) {
      alert('Correct! Accessing the application.');
      modal.style.display = 'none';
      currentPuzzle = null;
      puzzleCallback();
    } else {
      alert('Incorrect answer. Try again.');
      input.value = '';
    }
  }
}

function toggleStartMenu() {
  const menu = document.getElementById('start-menu');
  if (menu) {
    menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
  }
}

function showContextMenu(e) {
  e.preventDefault();
  const menu = document.getElementById('context-menu');
  if (menu) {
    menu.style.display = 'block';
    menu.style.left = `${Math.min(e.clientX, window.innerWidth - 150)}px`;
    menu.style.top = `${Math.min(e.clientY, window.innerHeight - 150)}px`;
  }
}

function showFolderContextMenu(e, name, type) {
  e.preventDefault();
  e.stopPropagation();
  selectedItem = { name, type };
  const menu = document.getElementById('folder-context-menu');
  if (menu) {
    menu.style.display = 'block';
    menu.style.left = `${Math.min(e.clientX, window.innerWidth - 150)}px`;
    menu.style.top = `${Math.min(e.clientY, window.innerHeight - 150)}px`;
  }
}

function createNewFile() {
  const filename = prompt('Enter file name:', 'NewFile.txt');
  if (filename) {
    const currentPath = historyStack[historyIndex] || '/';
    let node = getNodeFromPath(currentPath);
    if (!node) return alert('Invalid path!');
    node.content[filename] = { type: 'file', content: '' };
    loadFolder(currentPath);
  }
}

function createNewFolder() {
  const folderName = prompt('Enter folder name:', 'NewFolder');
  if (folderName) {
    const currentPath = historyStack[historyIndex] || '/';
    let node = getNodeFromPath(currentPath);
    if (!node) return alert('Invalid path!');
    node.content[folderName] = { type: 'folder', content: {} };
    loadFolder(currentPath);
  }
}

function openItem() {
  if (selectedItem) {
    const currentPath = historyStack[historyIndex] || '/';
    if (selectedItem.type === 'folder') {
      historyStack = historyStack.slice(0, historyIndex + 1);
      historyStack.push(currentPath + (currentPath.endsWith('/') ? '' : '/') + selectedItem.name);
      historyIndex++;
      loadFolder(historyStack[historyIndex]);
    } else if (selectedItem.type === 'file' && selectedItem.name.endsWith('.txt')) {
      openWindow('notepad');
      const textarea = document.getElementById('notepad-text');
      const node = getNodeFromPath(currentPath);
      if (textarea && node) {
        textarea.value = node.content[selectedItem.name].content || '';
      }
      const notepadFilename = document.getElementById('notepad-filename');
      if (notepadFilename) {
        notepadFilename.value = selectedItem.name;
      }
    }
    selectedItem = null;
  }
}

function deleteItem() {
  if (selectedItem) {
    alert(`Deleting ${selectedItem.type} "${selectedItem.name}"...`);
    const currentPath = historyStack[historyIndex] || '/';
    let node = getNodeFromPath(currentPath);
    if (!node) return alert('Invalid path!');
    delete node.content[selectedItem.name];
    loadFolder(currentPath);
    selectedItem = null;
  }
}

function renameItem() {
  if (selectedItem) {
    const newName = prompt(`Enter new name for ${selectedItem.type} "${selectedItem.name}":`, selectedItem.name);
    if (newName && newName !== selectedItem.name) {
      const currentPath = historyStack[historyIndex] || '/';
      let node = getNodeFromPath(currentPath);
      if (!node) return alert('Invalid path!');
      const item = node.content[selectedItem.name];
      delete node.content[selectedItem.name];
      node.content[newName] = item;
      loadFolder(currentPath);
    }
    selectedItem = null;
  }
}

function showProperties() {
  if (selectedItem) {
    const currentPath = historyStack[historyIndex] || '/';
    const node = getNodeFromPath(currentPath);
    if (node) {
      const item = node.content[selectedItem.name];
      const type = item.type;
      const size = type === 'file' ? (item.content ? item.content.length : 0) + ' bytes' : 'N/A';
      alert(`Properties of "${selectedItem.name}"\nType: ${type}\nSize: ${size}\nLocation: ${currentPath}`);
    }
    selectedItem = null;
  }
}

function getNodeFromPath(path) {
  let node = fileSystem['/'];
  const parts = path.split('/').filter(Boolean);
  for (const part of parts) {
    if (node.content && node.content[part]) {
      node = node.content[part];
    } else {
      return null;
    }
  }
  return node;
}

function copyItem() {
  if (selectedItem) {
    copiedItem = selectedItem;
    copiedItemPath = historyStack[historyIndex] || '/';
    alert(`Copied ${selectedItem.type} "${selectedItem.name}"`);
    selectedItem = null;
  }
}

function pasteItem() {
  if (copiedItem) {
    const currentPath = historyStack[historyIndex] || '/';
    let node = getNodeFromPath(currentPath);
    let sourceNode = getNodeFromPath(copiedItemPath);
    if (!node || !sourceNode) return alert('Invalid path!');
    const item = JSON.parse(JSON.stringify(sourceNode.content[copiedItem.name]));
    let newName = copiedItem.name;
    let counter = 1;
    while (node.content[newName]) {
      newName = `${copiedItem.name.split('.')[0]} (${counter})${copiedItem.name.includes('.') ? '.' + copiedItem.name.split('.').pop() : ''}`;
      counter++;
    }
    node.content[newName] = item;
    loadFolder(currentPath);
    alert(`Pasted "${newName}" to ${currentPath}`);
  }
}

document.addEventListener('click', () => {
  const contextMenu = document.getElementById('context-menu');
  const startMenu = document.getElementById('start-menu');
  const folderContextMenu = document.getElementById('folder-context-menu');
  if (contextMenu) contextMenu.style.display = 'none';
  if (startMenu) startMenu.style.display = 'none';
  if (folderContextMenu) folderContextMenu.style.display = 'none';
  selectedItem = null;
});

function initializeIconPositions() {
  const desktop = document.getElementById('desktop');
  if (!desktop) return;
  const gridWidth = 120;
  const gridGap = 24;
  const maxColumns = Math.floor((desktop.offsetWidth - gridGap) / (gridWidth + gridGap));
  let occupied = new Set();

  document.querySelectorAll('.desktop-icon').forEach((icon, index) => {
    const id = icon.querySelector('div')?.textContent;
    if (!id) return;
    let col = Math.floor(index % maxColumns);
    let row = Math.floor(index / maxColumns);
    let x = col * (gridWidth + gridGap) + gridGap;
    let y = row * (gridGap + gridWidth) + gridGap;

    while (occupied.has(`${x},${y}`)) {
      col++;
      if (col >= maxColumns) {
        col = 0;
        row++;
      }
      x = col * (gridWidth + gridGap) + gridGap;
      y = row * (gridGap + gridWidth) + gridGap;
    }

    iconPositions[id] = { x, y };
    occupied.add(`${x},${y}`);
    icon.style.position = 'absolute';
    icon.style.left = x + 'px';
    icon.style.top = y + 'px';
  });
}

function startIconDrag(e) {
  draggedIcon = e.target.closest('.desktop-icon');
  if (draggedIcon) {
    e.dataTransfer.setData('text/plain', null);
  }
}

function endIconDrag(e) {
  if (!draggedIcon) return;
  const desktop = document.getElementById('desktop');
  if (!desktop) return;
  const rect = desktop.getBoundingClientRect();
  const gridWidth = 120;
  const gridGap = 24;
  const maxColumns = Math.floor((rect.width - gridGap) / (gridWidth + gridGap));

  let newX = e.clientX - rect.left - (draggedIcon.offsetWidth / 2);
  let newY = e.clientY - rect.top - (draggedIcon.offsetHeight / 2);
  newX = Math.max(gridGap, Math.min(newX, rect.width - gridWidth - gridGap));
  newY = Math.max(gridGap, Math.min(newY, rect.height - gridWidth - gridGap));

  const col = Math.round((newX - gridGap) / (gridWidth + gridGap));
  const row = Math.round((newY - gridGap) / (gridWidth + gridGap));
  newX = col * (gridWidth + gridGap) + gridGap;
  newY = row * (gridGap + gridWidth) + gridGap;

  const id = draggedIcon.querySelector('div')?.textContent;
  if (!id) return;
  const occupied = new Set(Object.entries(iconPositions)
    .filter(([key]) => key !== id)
    .map(([, pos]) => `${pos.x},${pos.y}`));

  if (!occupied.has(`${newX},${newY}`)) {
    draggedIcon.style.left = newX + 'px';
    draggedIcon.style.top = newY + 'px';
    iconPositions[id] = { x: newX, y: newY };
  } else {
    draggedIcon.style.left = iconPositions[id].x + 'px';
    draggedIcon.style.top = iconPositions[id].y + 'px';
  }

  draggedIcon = null;
}

function openWindow(id) {
  showPuzzle(() => {
    const win = document.getElementById(id);
    if (!win) return;
    win.style.display = 'flex';
    bringToFront(win);
    if (id === 'myComputer') {
      loadFolder('/');
      addTaskbarButton(id);
    } else if (id === 'notepad') {
      const textarea = document.getElementById('notepad-text');
      if (textarea) {
        textarea.value = notepadContent;
      }
      addTaskbarButton(id);
    } else if (id === 'browser') {
      const browserUrl = document.getElementById('browser-url');
      const browserContent = document.getElementById('browser-content');
      if (browserUrl && browserContent) {
        browserUrl.value = '';
        browserContent.src = '';
      }
      addTaskbarButton(id);
    } else if (id === 'settings') {
      showSettingsSection('appearance');
      addTaskbarButton(id);
    } else if (id === 'game') {
      showGameHub();
      addTaskbarButton(id);
    }
  });
}

function closeWindow(id) {
  const win = document.getElementById(id);
  if (!win) return;
  win.style.display = 'none';
  win.classList.remove('active');
  if (id === 'notepad') {
    const textarea = document.getElementById('notepad-text');
    if (textarea) {
      notepadContent = textarea.value;
    }
  } else if (id === 'game') {
    if (gameInstance) {
      gameInstance.reset();
      gameInstance = null;
    }
    if (mouseHandler) {
      const canvas = document.getElementById('game-canvas');
      if (canvas) {
        canvas.removeEventListener('mousedown', mouseHandler);
        canvas.removeEventListener('mousemove', mouseHandler);
        canvas.removeEventListener('mouseup', mouseHandler);
      }
      mouseHandler = null;
    }
    if (keyHandler) {
      document.removeEventListener('keydown', keyHandler);
      document.removeEventListener('keyup', keyHandler);
      keyHandler = null;
    }
    currentGame = null;
  }
  removeTaskbarButton(id);
}

function minimizeWindow(id) {
  const win = document.getElementById(id);
  if (!win) return;
  win.style.display = 'none';
  win.classList.remove('active');
  if (id === 'notepad') {
    const textarea = document.getElementById('notepad-text');
    if (textarea) {
      notepadContent = textarea.value;
    }
  } else if (id === 'game') {
    if (gameInstance) {
      gameInstance.reset();
      gameInstance = null;
    }
    if (mouseHandler) {
      const canvas = document.getElementById('game-canvas');
      if (canvas) {
        canvas.removeEventListener('mousedown', mouseHandler);
        canvas.removeEventListener('mousemove', mouseHandler);
        canvas.removeEventListener('mouseup', mouseHandler);
      }
      mouseHandler = null;
    }
    if (keyHandler) {
      document.removeEventListener('keydown', keyHandler);
      document.removeEventListener('keyup', keyHandler);
      keyHandler = null;
    }
    currentGame = null;
  }
}

function toggleFullscreen(id) {
  const win = document.getElementById(id);
  if (!win) return;
  if (win.style.width !== '100%' && win.style.height !== '100%') {
    win.style.top = '0';
    win.style.left = '0';
    win.style.width = '100%';
    win.style.height = 'calc(100% - 4rem)';
  } else {
    win.style.top = '6rem';
    win.style.left = '6rem';
    win.style.width = '700px';
    win.style.height = '500px';
  }
  bringToFront(win);
}

function showDesktop() {
  document.querySelectorAll('.window').forEach(win => {
    if (win.style.display !== 'none') {
      win.style.display = 'none';
      win.classList.remove('active');
      if (win.id === 'notepad') {
        const textarea = document.getElementById('notepad-text');
        if (textarea) {
          notepadContent = textarea.value;
        }
      } else if (win.id === 'game') {
        if (gameInstance) {
          gameInstance.reset();
          gameInstance = null;
        }
        if (mouseHandler) {
          const canvas = document.getElementById('game-canvas');
          if (canvas) {
            canvas.removeEventListener('mousedown', mouseHandler);
            canvas.removeEventListener('mousemove', mouseHandler);
            canvas.removeEventListener('mouseup', mouseHandler);
          }
          mouseHandler = null;
        }
        if (keyHandler) {
          document.removeEventListener('keydown', keyHandler);
          document.removeEventListener('keyup', keyHandler);
          keyHandler = null;
        }
        currentGame = null;
      }
    }
  });
}

function startDrag(e) {
  if (!e.target.classList.contains('window-header')) return;
  const win = e.target.parentElement;
  dragInfo = {
    win,
    offsetX: e.clientX - win.offsetLeft,
    offsetY: e.clientY - win.offsetTop
  };
  document.addEventListener('mousemove', dragMove);
  document.addEventListener('mouseup', stopDrag);
  bringToFront(win);
}

function dragMove(e) {
  if (!dragInfo) return;
  const win = dragInfo.win;
  let newX = e.clientX - dragInfo.offsetX;
  let newY = e.clientY - dragInfo.offsetY;
  newX = Math.max(0, Math.min(newX, window.innerWidth - win.offsetWidth));
  newY = Math.max(0, Math.min(newY, window.innerHeight - win.offsetHeight - 4));
  win.style.left = newX + 'px';
  win.style.top = newY + 'px';
}

function stopDrag() {
  dragInfo = null;
  document.removeEventListener('mousemove', dragMove);
  document.removeEventListener('mouseup', stopDrag);
}

function bringToFront(win) {
  document.querySelectorAll('.window').forEach(w => w.classList.remove('active'));
  win.classList.add('active');
  const allWindows = document.querySelectorAll('.window');
  allWindows.forEach(w => w.style.zIndex = 10);
  win.style.zIndex = 20;
}

function addTaskbarButton(id) {
  const btnContainer = document.getElementById('taskbar-buttons');
  if (!btnContainer || document.getElementById('btn-' + id)) return;
  const btn = document.createElement('button');
  btn.id = 'btn-' + id;
  btn.textContent = id === 'myComputer' ? 'My Computer' : id === 'game' ? 'Game Hub' : id.charAt(0).toUpperCase() + id.slice(1);
  btn.setAttribute('aria-label', `Toggle ${id}`);
  btn.onclick = () => {
    const win = document.getElementById(id);
    if (!win) return;
    if (win.style.display === 'none') {
      win.style.display = 'flex';
      bringToFront(win);
      if (id === 'notepad') {
        const textarea = document.getElementById('notepad-text');
        if (textarea) {
          textarea.value = notepadContent;
        }
      } else if (id === 'game') {
        showGameHub();
      }
    } else {
      win.style.display = 'none';
      win.classList.remove('active');
      if (id === 'notepad') {
        const textarea = document.getElementById('notepad-text');
        if (textarea) {
          notepadContent = textarea.value;
        }
      } else if (id === 'game') {
        if (gameInstance) {
          gameInstance.reset();
          gameInstance = null;
        }
        if (mouseHandler) {
          const canvas = document.getElementById('game-canvas');
          if (canvas) {
            canvas.removeEventListener('mousedown', mouseHandler);
            canvas.removeEventListener('mousemove', mouseHandler);
            canvas.removeEventListener('mouseup', mouseHandler);
          }
          mouseHandler = null;
        }
        if (keyHandler) {
          document.removeEventListener('keydown', keyHandler);
          document.removeEventListener('keyup', keyHandler);
          keyHandler = null;
        }
        currentGame = null;
      }
    }
  };
  btnContainer.appendChild(btn);
}

function removeTaskbarButton(id) {
  const btn = document.getElementById('btn-' + id);
  if (btn) btn.remove();
}

function loadFolder(path) {
  const foldersDiv = document.getElementById('folders');
  const navPath = document.getElementById('nav-path');
  if (!foldersDiv || !navPath) return;
  foldersDiv.innerHTML = '';
  navPath.textContent = path;
  const node = getNodeFromPath(path);
  if (!node || node.type !== 'folder') return;

  for (const [name, item] of Object.entries(node.content)) {
    const folderDiv = document.createElement('div');
    folderDiv.className = 'folder';
    folderDiv.title = name;
    folderDiv.setAttribute('aria-label', name);
    folderDiv.tabIndex = 0;

    const img = document.createElement('img');
    img.src = item.type === 'folder'
      ? 'https://cdn.jsdelivr.net/npm/@fluentui/svg-icons/icons/folder_24_filled.svg'
      : 'https://cdn.jsdelivr.net/npm/@fluentui/svg-icons/icons/document_24_filled.svg';

    folderDiv.appendChild(img);
    const label = document.createElement('div');
    label.textContent = name;
    folderDiv.appendChild(label);

    folderDiv.addEventListener('contextmenu', (e) => showFolderContextMenu(e, name, item.type));

    folderDiv.ondblclick = () => {
      if (item.type === 'folder') {
        showPuzzle(() => {
          historyStack = historyStack.slice(0, historyIndex + 1);
          historyStack.push(path + (path.endsWith('/') ? '' : '/') + name);
          historyIndex++;
          loadFolder(historyStack[historyIndex]);
        });
      } else if (item.type === 'file' && name.endsWith('.txt')) {
        showPuzzle(() => {
          openWindow('notepad');
          const textarea = document.getElementById('notepad-text');
          const node = getNodeFromPath(path);
          if (textarea && node) {
            textarea.value = node.content[name].content || '';
          }
          const notepadFilename = document.getElementById('notepad-filename');
          if (notepadFilename) {
            notepadFilename.value = name;
          }
        });
      }
    };
    foldersDiv.appendChild(folderDiv);
  }
}

function navigateTo(path) {
  historyStack = historyStack.slice(0, historyIndex + 1);
  historyStack.push(path);
  historyIndex++;
  loadFolder(path);
}

function goBack() {
  if (historyIndex > 0) {
    historyIndex--;
    loadFolder(historyStack[historyIndex]);
  }
}

function goForward() {
  if (historyIndex < historyStack.length - 1) {
    historyIndex++;
    loadFolder(historyStack[historyIndex]);
  }
}

function goUp() {
  if (historyIndex < 0) return;
  const currentPath = historyStack[historyIndex];
  if (currentPath === '/') return;
  const parts = currentPath.split('/').filter(Boolean);
  parts.pop();
  navigateTo('/' + parts.join('/') || '/');
}

function saveNotepadFile() {
  const notepadFilename = document.getElementById('notepad-filename');
  const textarea = document.getElementById('notepad-text');
  if (!notepadFilename || !textarea) return;
  const filename = notepadFilename.value || 'NewFile.txt';
  const content = textarea.value;
  const currentPath = historyStack[historyIndex] || '/';
  let node = getNodeFromPath(currentPath);
  if (!node) return alert('Invalid path!');
  node.content[filename] = { type: 'file', content };
  loadFolder(currentPath);
  alert(`Saved ${filename} to ${currentPath}`);
}

function showWelcomeScreen() {
  const welcomeMessage = document.getElementById('welcome-message');
  const welcomeScreen = document.getElementById('welcome-screen');
  if (!welcomeMessage || !welcomeScreen) return;
  const now = new Date();
  const istOffset = 5.5 * 60 * 60 * 1000;
  const istTime = new Date(now.getTime() + istOffset);
  const dateString = istTime.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  const timeString = istTime.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
    timeZone: 'UTC'
  });
  welcomeMessage.textContent = `Welcome to NebulaOS! Today is ${dateString} at ${timeString}. Click Start to explore!`;
  welcomeScreen.style.display = 'flex';
}

function dismissWelcomeScreen() {
  const welcomeScreen = document.getElementById('welcome-screen');
  const desktop = document.getElementById('desktop');
  const dock = document.getElementById('dock');
  if (welcomeScreen && desktop && dock) {
    welcomeScreen.style.display = 'none';
    desktop.style.display = 'block';
    dock.style.display = 'flex';
  }
  updateClock();
  updateBattery();
}

// Add puzzle to start menu items
document.querySelectorAll('.start-menu-item').forEach(item => {
  const originalClick = item.onclick;
  item.onclick = () => {
    showPuzzle(() => {
      if (originalClick) originalClick();
    });
  };
});

// Add puzzle to desktop icons
document.querySelectorAll('.desktop-icon').forEach(icon => {
  const originalDblClick = icon.ondblclick;
  icon.ondblclick = () => {
    showPuzzle(() => {
      if (originalDblClick) originalDblClick();
    });
  };
});
