let credits = 5000;
let currentBet = 100;
let lastWin = 0;
let winRate = 0.8; // Rata default de câștig (rata de câștig poate fi reglata de către deținătorul slotului, cel puțin așa m-am gândit).
const symbols = ['🍒', '🍋', '🍊', '🍉', '🍇', '7'];
const winColors = ['red', 'green', 'blue', 'yellow', 'purple', 'orange'];

function getRandomSymbol() {
    return symbols[Math.floor(Math.random() * symbols.length)];
}

function spin() {
    clearCanvas();
    if (credits < currentBet) {
        document.getElementById('message').innerText = "Not enough credits!";
        return;
    }

    credits -= currentBet;
    document.getElementById('credits').innerText = credits;

    // Determine if this spin is a win based on the win rate
    const isWin = Math.random() < winRate;
    let reels = [];

    for (let i = 0; i < 5; ++i) { // 5 columns
        let column = [];
        for (let j = 0; j < 3; ++j) { // 3 rows
            let symbol = getRandomSymbol();
            column.push(symbol);
            document.getElementById(`slot${i}_${j}`).innerText = symbol;
        }
        reels.push(column);
    }

    animateReels(reels, isWin);
}
// Animation finaly done thanks to stackoverflow.com (great web with great sugestions)
function animateReels(reels, isWin) {
    for (let i = 0; i < 5; ++i) {
        let column = document.getElementById(`slot${i}`);
        let symbols = column.getElementsByClassName('slot-symbol');
        for (let j = 0; j < symbols.length; ++j) {
            symbols[j].classList.add('spin');
        }

        setTimeout(() => stopReel(i, reels, isWin), i * 700); // Delay between stopping each reel
    }
}

function stopReel(index, reels, isWin) {
    let column = document.getElementById(`slot${index}`);
    let symbols = column.getElementsByClassName('slot-symbol');
    for (let j = 0; j < symbols.length; ++j) {
        symbols[j].classList.remove('spin');
        symbols[j].innerText = reels[index][j];
    }

    if (index === 4 && isWin) {
        checkWin(reels);
    } else if (index === 4) {
        document.getElementById('message').innerText = "Try again!";
    }
}

function increaseBet() {
    currentBet += 100;
    document.getElementById('current-bet').innerText = currentBet;
}

function decreaseBet() {
    if (currentBet > 100) {
        currentBet -= 100;
        document.getElementById('current-bet').innerText = currentBet;
    }
}

function updateWinRate() {
    winRate = parseFloat(document.getElementById('win-rate').value);
}

function checkWin(reels) {
    let winPoints = 0;
    let winLines = [];

    // Check horizontal wins
    for (let j = 0; j < 3; ++j) {
        for (let i = 0; i < 3; ++i) {
            let row = [];
            let positions = [];
            for (let k = i; k < i + 3; ++k) {
                row.push(reels[k][j]);
                positions.push({ x: k, y: j });
            }
            let points = calculatePoints(row);
            if (points > 0) {
                winPoints += points;
                winLines.push({ type: 'row', index: j, positions: positions });
            }
        }
    }

    // Check vertical wins
    for (let i = 0; i < 5; ++i) {
        for (let j = 0; j < 1; ++j) {
            let column = [];
            let positions = [];
            for (let k = j; k < j + 3; ++k) {
                column.push(reels[i][k]);
                positions.push({ x: i, y: k });
            }
            let points = calculatePoints(column);
            if (points > 0) {
                winPoints += points;
                winLines.push({ type: 'column', index: i, positions: positions });
            }
        }
    }

    // Check diagonal wins
    let diagonals = [
        [{ x: 0, y: 0 }, { x: 1, y: 1 }, { x: 2, y: 2 }],
        [{ x: 4, y: 0 }, { x: 3, y: 1 }, { x: 2, y: 2 }],
        [{ x: 0, y: 2 }, { x: 1, y: 1 }, { x: 2, y: 0 }],
        [{ x: 4, y: 2 }, { x: 3, y: 1 }, { x: 2, y: 0 }],
        [{ x: 1, y: 1 }, { x: 2, y: 2 }, { x: 3, y: 1 }, { x: 4, y: 0 }],
        [{ x: 0, y: 0 }, { x: 1, y: 1 }, { x: 2, y: 2 }, { x: 3, y: 1 }, { x: 4, y: 0 }],
        [{ x: 4, y: 0 }, { x: 3, y: 1 }, { x: 2, y: 2 }, { x: 1, y: 1 }, { x: 0, y: 2 }],
        [{ x: 0, y: 2 }, { x: 1, y: 1 }, { x: 2, y: 0 }, { x: 3, y: 1 }, { x: 4, y: 2 }],
        [{ x: 4, y: 2 }, { x: 3, y: 1 }, { x: 2, y: 0 }, { x: 1, y: 1 }, { x: 0, y: 0 }]
    ];

    diagonals.forEach((diagonal, index) => {
        let diagonalSymbols = diagonal.map(pos => reels[pos.x][pos.y]);
        let points = calculatePoints(diagonalSymbols);
        if (points > 0) {
            winPoints += points;
            winLines.push({ type: 'diagonal', index: index + 1, positions: diagonal });
        }
    });

    if (winPoints > 0) {
        // Multiply points by the ratio of the current bet to the base bet (100)
        winPoints *= currentBet / 100;

        credits += winPoints;
        lastWin = winPoints;
        document.getElementById('credits').innerText = credits;
        document.getElementById('last-win').innerText = lastWin;
        document.getElementById('message').innerText = `You win! You earned ${winPoints} points!`;
        drawWinningLines(winLines);
    } else {
        document.getElementById('message').innerText = "Try again!";
    }
}


function calculatePoints(line) {
    let points = 0;
    let counts = {};
    line.forEach(symbol => counts[symbol] = (counts[symbol] || 0) + 1);

    let nonSevenSymbols = line.filter(symbol => symbol !== '7');
    if (nonSevenSymbols.length === 0) return 1000; // All symbols are 7

    let mainSymbol = nonSevenSymbols[0] || '7';
    let validLine = line.every(symbol => symbol === mainSymbol || symbol === '7');

    if (validLine) {
        let mainCount = counts[mainSymbol] || 0;
        let sevenCount = counts['7'] || 0;

        if (mainCount + sevenCount >= 3) {
            // Calculate points for all possible combinations
            if (mainSymbol === '🍒' || mainSymbol === '7') {
                if (mainCount + sevenCount === 3) points += 100;
                if (mainCount + sevenCount === 4) points += 200;  // 4 Cherries or 3 Cherries + 1 Seven
                if (mainCount + sevenCount === 5) points += 50000; // 5 Cherries
            }
            if (mainSymbol === '🍋' || mainSymbol === '7') {
                if (mainCount + sevenCount === 3) points += 75;
                if (mainCount + sevenCount === 4) points += 150;  // 4 Lemons or 3 Lemons + 1 Seven
                if (mainCount + sevenCount === 5) points += 300;  // 5 Lemons
            }
            if (mainSymbol === '🍊' || mainSymbol === '7') {
                if (mainCount + sevenCount === 3) points += 50;
                if (mainCount + sevenCount === 4) points += 100;  // 4 Oranges or 3 Oranges + 1 Seven
                if (mainCount + sevenCount === 5) points += 200;  // 5 Oranges
            }
            if (mainSymbol === '🍉' || mainSymbol === '7') {
                if (mainCount + sevenCount === 3) points += 200;
                if (mainCount + sevenCount === 4) points += 400;  // 4 Watermelons or 3 Watermelons + 1 Seven
                if (mainCount + sevenCount === 5) points += 800;  // 5 Watermelons
            }
            if (mainSymbol === '🍇' || mainSymbol === '7') {
                if (mainCount + sevenCount === 3) points += 150;
                if (mainCount + sevenCount === 4) points += 300;  // 4 Grapes or 3 Grapes + 1 Seven
                if (mainCount + sevenCount === 5) points += 600;  // 5 Grapes
            }
            if (mainSymbol === '7') {
                if (mainCount + sevenCount === 3) points += 1000;
                if (mainCount + sevenCount === 4) points += 5000; // 4 Sevens
                if (mainCount + sevenCount === 5) points += 100000; // 5 Sevens
            }
        }
    }

    return points;
}


function drawWinningLines(winLines) {
    const canvas = document.getElementById('winning-lines');
    const ctx = canvas.getContext('2d');
    const slotSize = 100; // Size of each slot

    winLines.forEach((line, index) => {
        ctx.strokeStyle = winColors[index % winColors.length];
        ctx.lineWidth = 5;
        ctx.beginPath();
        const positions = line.positions;
        ctx.moveTo(positions[0].x * slotSize + slotSize / 2, positions[0].y * slotSize + slotSize / 2);

        for (let i = 1; i < positions.length; i++) {
            ctx.lineTo(positions[i].x * slotSize + slotSize / 2, positions[i].y * slotSize + slotSize / 2);
        }
        ctx.stroke();
    });
}

function clearCanvas() {
    const canvas = document.getElementById('winning-lines');
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}
