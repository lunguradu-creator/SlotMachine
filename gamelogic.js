let credits = 5000;
let currentBet = 100;
let lastWin = 0;
let winRate = 0.8;
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

    const isWin = Math.random() < winRate;
    let reels = [];

    for (let i = 0; i < 5; ++i) {
        let column = [];
        for (let j = 0; j < 3; ++j) {
            let symbol = getRandomSymbol();
            column.push(symbol);
            document.getElementById(`slot${i}_${j}`).innerText = symbol;
        }
        reels.push(column);
    }

    animateReels(reels, isWin);
}

function animateReels(reels, isWin) {
    for (let i = 0; i < 5; ++i) {
        let column = document.getElementById(`slot${i}`);
        let symbols = column.getElementsByClassName('slot-symbol');
        for (let j = 0; j < symbols.length; ++j) {
            symbols[j].classList.add('spin');
        }

        setTimeout(() => stopReel(i, reels, isWin), i * 700);
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

function adjustBet(amount) {
    if (currentBet + amount >= 100) {
        currentBet += amount;
        document.getElementById('current-bet').innerText = currentBet;
    }
}

function updateWinRate() {
    winRate = parseFloat(document.getElementById('win-rate').value);
}

function checkWin(reels) {
    let winPoints = 0;
    let winLines = [];

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

function calculatePointsForSymbol(mainSymbol, mainCount, sevenCount) {
    let points = 0;
    const totalSymbols = mainCount + sevenCount;

    if (totalSymbols >= 3) {
        switch (mainSymbol) {
            case '🍒':
                if (totalSymbols === 3) points += 100;
                if (totalSymbols === 4) points += 200;
                if (totalSymbols === 5) points += 50000;
                break;
            case '🍋':
                if (totalSymbols === 3) points += 75;
                if (totalSymbols === 4) points += 150;
                if (totalSymbols === 5) points += 300;
                break;
            case '🍊':
                if (totalSymbols === 3) points += 50;
                if (totalSymbols === 4) points += 100;
                if (totalSymbols === 5) points += 200;
                break;
            case '🍉':
                if (totalSymbols === 3) points += 200;
                if (totalSymbols === 4) points += 400;
                if (totalSymbols === 5) points += 800;
                break;
            case '🍇':
                if (totalSymbols === 3) points += 150;
                if (totalSymbols === 4) points += 300;
                if (totalSymbols === 5) points += 600;
                break;
            case '7':
                if (totalSymbols === 3) points += 1000;
                if (totalSymbols === 4) points += 5000;
                if (totalSymbols === 5) points += 100000;
                break;
        }
    }

    return points;
}

function calculatePoints(line) {
    let points = 0;
    let counts = {};
    line.forEach(symbol => counts[symbol] = (counts[symbol] || 0) + 1);

    let nonSevenSymbols = line.filter(symbol => symbol !== '7');
    if (nonSevenSymbols.length === 0) return 1000;

    let mainSymbol = nonSevenSymbols[0] || '7';
    let validLine = line.every(symbol => symbol === mainSymbol || symbol === '7');

    if (validLine) {
        let mainCount = counts[mainSymbol] || 0;
        let sevenCount = counts['7'] || 0;
        points += calculatePointsForSymbol(mainSymbol, mainCount, sevenCount);
    }

    return points;
}

function drawWinningLines(winLines) {
    const canvas = document.getElementById('winning-lines');
    const ctx = canvas.getContext('2d');
    const slotSize = 100;

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
