let credits = 5000;
let currentBet = 100;
let lastWin = 0;
let winRate = 0.8; // Rata default de câștig (rata de câștig poate fi reglata de către deținătorul slotului, cel puțin așa m-am gândit).
const symbols = ['🍒', '🍋', '🍊', '🍉', '🍇', '7'];

//Funcție pentru generarea random a simbolurilor.
function getRandomSymbol() {
    return symbols[Math.floor(Math.random() * symbols.length)];
}

function spin() {
    if (credits < currentBet) {
        document.getElementById('message').innerText = "Not enough credits!";
        return;
    }

    credits -= currentBet;
    document.getElementById('credits').innerText = credits;

    // Determine if this spin is a win based on the win rate
    const isWin = Math.random() < winRate;
    let reels = [];

    for (let i = 0; i < 3; ++i) {
        let row = [];
        for (let j = 0; j < 5; ++j) {
            let symbol = getRandomSymbol();
            row.push(symbol);
            document.getElementById(`slot${i}_${j}`).innerText = symbol;
        }
        reels.push(row);
    }

    if (isWin) {
        checkWin(reels);
    } else {
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

    // Check horizontal wins
    for (let i = 0; i < 3; ++i) {
        let row = reels[i];
        winPoints += calculatePoints(row);
    }

    // Check diagonal wins
    let diagonal1 = [reels[0][0], reels[1][1], reels[2][2], reels[1][3], reels[0][4]];
    let diagonal2 = [reels[2][0], reels[1][1], reels[0][2], reels[1][3], reels[2][4]];
    winPoints += calculatePoints(diagonal1);
    winPoints += calculatePoints(diagonal2);

    if (winPoints > 0) {
        // Multiply points by the ratio of the current bet to the base bet (100)
        winPoints *= currentBet / 100;

        credits += winPoints;
        lastWin = winPoints;
        document.getElementById('credits').innerText = credits;
        document.getElementById('last-win').innerText = lastWin;
        document.getElementById('message').innerText = `You win! You earned ${winPoints} points!`;
    } else {
        document.getElementById('message').innerText = "Try again!";
    }
}

function calculatePoints(line) {
    let points = 0;
    let counts = {};
    line.forEach(symbol => counts[symbol] = (counts[symbol] || 0) + 1);

    // Check for specific winning combinations
    if (counts['🍒'] === 3) points += 100;  // 3 Cherries
    if (counts['🍊'] === 3) points += 50;   // 3 Oranges
    if (counts['🍒'] === 5) points += 50000; // 5 Cherries
    if (counts['🍋'] === 3) points += 75;    // 3 Lemons
    if (counts['🍉'] === 3) points += 200;   // 3 Watermelons
    if (counts['🍇'] === 3) points += 150;   // 3 Grapes
    if (counts['7'] === 3) points += 1000;   // 3 Sevens
    if (counts['7'] === 5) points += 100000; // 5 Sevens

    return points;
}

function spin() {
    if (credits < currentBet) {
        document.getElementById('message').innerText = "Not enough credits!";
        return;
    }

    credits -= currentBet;
    document.getElementById('credits').innerText = credits;

    let reels = [];

    for (let i = 0; i < 3; ++i) {
        for (let j = 0; j < 5; ++j) {
            let slot = document.getElementById(`slot${i}_${j}`);
            slot.classList.add('spin');
        }
    }

    setTimeout(() => stopReel(0, reels), 1000); // Stop first reel after 1 second
    setTimeout(() => stopReel(1, reels), 2000); // Stop second reel after 2 seconds
    setTimeout(() => stopReel(2, reels), 3000); // Stop third reel after 3 seconds
}

function stopReel(index, reels) {
    let row = [];
    for (let j = 0; j < 5; ++j) {
        let symbol = getRandomSymbol();
        row.push(symbol);
        let slot = document.getElementById(`slot${index}_${j}`);
        slot.innerText = symbol;
        slot.classList.remove('spin');
    }
    reels[index] = row;

    if (index === 2) { // Check win only after the last reel stops
        checkWin(reels);
    }
}