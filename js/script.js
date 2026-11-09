
const app = document.createElement('main');
app.className = 'app';

const title = document.createElement('h1');
title.textContent = '2048';

const scoreBlock = document.createElement('div');
scoreBlock.className = 'score-block';

const scoreText = document.createElement('span');
scoreText.textContent = 'Счёт: ';

const scoreValue = document.createElement('span');
scoreValue.textContent = '0';

scoreBlock.append(scoreText, scoreValue);

const restartButton = document.createElement('button');
restartButton.type = 'button';
restartButton.textContent = 'Начать заново';

const undoButton = document.createElement('button');
undoButton.type = 'button';
undoButton.textContent = 'Отменить ход';
undoButton.disabled = true;

const leaderboardButton = document.createElement('button');
leaderboardButton.type = 'button';
leaderboardButton.textContent = 'Таблица лидеров';

const boardContainer = document.createElement('div');
boardContainer.className = 'board-container';

const board = document.createElement('div');
board.className = 'board';

const gameOverMessage = document.createElement('div');
gameOverMessage.className = 'game-over-message';
gameOverMessage.hidden = true;

const gameOverTitle = document.createElement('h2');
gameOverTitle.textContent = 'Игра окончена';

const recordForm = document.createElement('form');
recordForm.className = 'record-form';

const playerNameLabel = document.createElement('label');
playerNameLabel.htmlFor = 'player-name';
playerNameLabel.textContent = 'Введите ваше имя';

const playerNameInput = document.createElement('input');
playerNameInput.type = 'text';
playerNameInput.id = 'player-name';
playerNameInput.maxLength = 30;
playerNameInput.required = true;

const saveRecordButton = document.createElement('button');
saveRecordButton.type = 'submit';
saveRecordButton.textContent = 'Сохранить результат';

recordForm.append(
    playerNameLabel,
    playerNameInput,
    saveRecordButton
);

const gameOverRestartButton = document.createElement('button');
gameOverRestartButton.type = 'button';
gameOverRestartButton.textContent = 'Начать заново';

gameOverMessage.append(
    gameOverTitle,
    recordForm,
    gameOverRestartButton
);

boardContainer.append(board, gameOverMessage);

const leaderboardDialog = document.createElement('dialog');
leaderboardDialog.className = 'leaderboard-dialog';
leaderboardDialog.setAttribute('aria-labelledby', 'leaderboard-title');

const leaderboardTitle = document.createElement('h2');
leaderboardTitle.id = 'leaderboard-title';
leaderboardTitle.textContent = 'Таблица лидеров';

const closeLeaderboardButton = document.createElement('button');
closeLeaderboardButton.type = 'button';
closeLeaderboardButton.textContent = 'Закрыть';

const leaderboardTable = document.createElement('table');
leaderboardTable.className = 'leaderboard-table';

const tableHead = document.createElement('thead');
const headerRow = document.createElement('tr');

const columnNames = ['Имя игрока', 'Очки', 'Дата сохранения'];

columnNames.forEach(function(name) {
    const heading = document.createElement('th');
    heading.textContent = name;
    heading.scope = 'col';
    headerRow.append(heading);
});

tableHead.append(headerRow);

const tableBody = document.createElement('tbody');

leaderboardTable.append(tableHead, tableBody);

const emptyRecordsMessage = document.createElement('p');
emptyRecordsMessage.textContent = 'Рекордов пока нет';

leaderboardDialog.append(
    leaderboardTitle,
    closeLeaderboardButton,
    leaderboardTable,
    emptyRecordsMessage
);

app.append(
    title,
    scoreBlock,
    restartButton,
    undoButton,
    leaderboardButton,
    boardContainer
);

document.body.append(app, leaderboardDialog);

let cells = new Array(16).fill(0);
let score = 0;
let gameOver = false;
let previousState = null;
let recordSaved = false;
let records = [];

function saveGame() {
    const gameData = {
        cells: cells,
        score: score,
        gameOver: gameOver,
        previousState: previousState,
        recordSaved: recordSaved
    };

    localStorage.setItem('game2048', JSON.stringify(gameData));
}

function loadGame() {
    const savedData = localStorage.getItem('game2048');

    if (!savedData) {
        return false;
    }

    try {
        const gameData = JSON.parse(savedData);

        if (!Array.isArray(gameData.cells) || gameData.cells.length !== 16) {
            return false;
        }

        if (typeof gameData.score !== 'number') {
            return false;
        }

        cells = gameData.cells;
        score = gameData.score;
        gameOver = gameData.gameOver === true || isGameOver();
        recordSaved = gameOver && gameData.recordSaved === true;

        if (
            gameData.previousState &&
            Array.isArray(gameData.previousState.cells) &&
            gameData.previousState.cells.length === 16 &&
            typeof gameData.previousState.score === 'number'
        ) {
            previousState = gameData.previousState;
        } else {
            previousState = null;
        }

        scoreValue.textContent = score;
        undoButton.disabled = gameOver || previousState === null;

        renderBoard();
        updateGameOver();

        return true;
    } catch (error) {
        return false;
    }
}

function loadRecords() {
    try {
        const savedRecords = JSON.parse(
            localStorage.getItem('game2048Leaderboard')
        );

        if (Array.isArray(savedRecords)) {
            records = savedRecords.filter(function(record) {
                return record &&
                    typeof record.name === 'string' &&
                    typeof record.score === 'number' &&
                    typeof record.date === 'string';
            });

            records.sort(function(a, b) {
                return b.score - a.score;
            });

            records = records.slice(0, 10);
        }
    } catch (error) {
        records = [];
    }
}

function renderLeaderboard() {
    tableBody.replaceChildren();

    records.forEach(function(record) {
        const row = document.createElement('tr');

        const nameCell = document.createElement('td');
        nameCell.textContent = record.name;

        const scoreCell = document.createElement('td');
        scoreCell.textContent = record.score;

        const dateCell = document.createElement('td');
        dateCell.textContent = record.date;

        row.append(nameCell, scoreCell, dateCell);
        tableBody.append(row);
    });

    emptyRecordsMessage.hidden = records.length > 0;
}

function saveRecord(event) {
    event.preventDefault();

    if (!gameOver || recordSaved) {
        return;
    }

    const playerName = playerNameInput.value.trim();

    if (!playerName) {
        playerNameInput.value = '';
        playerNameInput.reportValidity();
        return;
    }

    const newRecord = {
        name: playerName,
        score: score,
        date: new Date().toLocaleDateString('ru-RU')
    };

    records.push(newRecord);

    records.sort(function(a, b) {
        return b.score - a.score;
    });

    records = records.slice(0, 10);

    localStorage.setItem(
        'game2048Leaderboard',
        JSON.stringify(records)
    );

    recordSaved = true;

    updateGameOver();
    renderLeaderboard();
    saveGame();
}

function addRandomTile() {
    const emptyCells = [];

    for (let i = 0; i < cells.length; i++) {
        if (cells[i] === 0) {
            emptyCells.push(i);
        }
    }

    if (emptyCells.length === 0) {
        return;
    }

    const randomIndex = Math.floor(Math.random() * emptyCells.length);
    const cellIndex = emptyCells[randomIndex];

    cells[cellIndex] = Math.random() < 0.5 ? 2 : 4;
}

function renderBoard() {
    board.replaceChildren();

    for (let i = 0; i < cells.length; i++) {
        const cell = document.createElement('div');
        cell.className = 'cell';

        if (cells[i] !== 0) {
            cell.textContent = cells[i];
        }

        board.append(cell);
    }
}

function getCellIndex(line, position, direction) {
    if (direction === 'left') {
        return line * 4 + position;
    }

    if (direction === 'right') {
        return line * 4 + (3 - position);
    }

    if (direction === 'up') {
        return position * 4 + line;
    }

    return (3 - position) * 4 + line;
}

function mergeLine(line) {
    const mergedLine = line.filter(function(value) {
        return value !== 0;
    });

    let earnedPoints = 0;
    let i = 0;

    while (i < mergedLine.length - 1) {
        if (mergedLine[i] === mergedLine[i + 1]) {
            mergedLine[i] *= 2;
            earnedPoints += mergedLine[i];
            mergedLine.splice(i + 1, 1);

            if (i > 0) {
                i--;
            }
        } else {
            i++;
        }
    }

    while (mergedLine.length < 4) {
        mergedLine.push(0);
    }

    return {
        line: mergedLine,
        points: earnedPoints
    };
}

function isGameOver() {
    if (cells.includes(0)) {
        return false;
    }

    for (let row = 0; row < 4; row++) {
        for (let col = 0; col < 4; col++) {
            const index = row * 4 + col;

            if (col < 3 && cells[index] === cells[index + 1]) {
                return false;
            }

            if (row < 3 && cells[index] === cells[index + 4]) {
                return false;
            }
        }
    }

    return true;
}

function updateGameOver() {
    gameOverMessage.hidden = !gameOver;

    if (gameOver) {
        if (recordSaved) {
            gameOverTitle.textContent = 'Ваш рекорд сохранен';
            recordForm.hidden = true;
        } else {
            gameOverTitle.textContent = 'Игра окончена';
            recordForm.hidden = false;
        }
    }
}

function checkGameOver() {
    if (isGameOver()) {
        gameOver = true;
        undoButton.disabled = true;
        updateGameOver();
    }
}

function moveTiles(direction) {
    if (gameOver || leaderboardDialog.open) {
        return;
    }

    const newCells = new Array(16).fill(0);
    let earnedPoints = 0;

    for (let i = 0; i < 4; i++) {
        const line = [];

        for (let j = 0; j < 4; j++) {
            const index = getCellIndex(i, j, direction);
            line.push(cells[index]);
        }

        const result = mergeLine(line);
        earnedPoints += result.points;

        for (let j = 0; j < 4; j++) {
            const index = getCellIndex(i, j, direction);
            newCells[index] = result.line[j];
        }
    }

    const hasChanged = newCells.some(function(value, index) {
        return value !== cells[index];
    });

    if (!hasChanged) {
        return;
    }

    previousState = {
        cells: cells.slice(),
        score: score
    };

    cells = newCells;
    score += earnedPoints;

    const newTilesCount = Math.floor(Math.random() * 2) + 1;

    for (let i = 0; i < newTilesCount; i++) {
        addRandomTile();
    }

    scoreValue.textContent = score;
    undoButton.disabled = false;

    renderBoard();
    checkGameOver();
    saveGame();
}

function undoMove() {
    if (previousState === null || gameOver || leaderboardDialog.open) {
        return;
    }

    cells = previousState.cells.slice();
    score = previousState.score;
    previousState = null;

    scoreValue.textContent = score;
    undoButton.disabled = true;

    renderBoard();
    saveGame();
}

function startNewGame() {
    cells = new Array(16).fill(0);
    score = 0;
    gameOver = false;
    previousState = null;
    recordSaved = false;

    scoreValue.textContent = '0';
    playerNameInput.value = '';
    undoButton.disabled = true;

    const startTiles = Math.floor(Math.random() * 3) + 1;

    for (let i = 0; i < startTiles; i++) {
        addRandomTile();
    }

    updateGameOver();
    renderBoard();
    saveGame();
}

document.addEventListener('keydown', function(event) {
    if (leaderboardDialog.open || gameOver) {
        return;
    }

    let direction = '';

    if (event.key === 'ArrowLeft') {
        direction = 'left';
    } else if (event.key === 'ArrowRight') {
        direction = 'right';
    } else if (event.key === 'ArrowUp') {
        direction = 'up';
    } else if (event.key === 'ArrowDown') {
        direction = 'down';
    }

    if (direction) {
        event.preventDefault();
        moveTiles(direction);
    }
});

restartButton.addEventListener('click', startNewGame);
gameOverRestartButton.addEventListener('click', startNewGame);
undoButton.addEventListener('click', undoMove);
recordForm.addEventListener('submit', saveRecord);

leaderboardButton.addEventListener('click', function() {
    renderLeaderboard();
    leaderboardDialog.showModal();
});

closeLeaderboardButton.addEventListener('click', function() {
    leaderboardDialog.close();
});

loadRecords();
renderLeaderboard();

if (!loadGame()) {
    startNewGame();
}
