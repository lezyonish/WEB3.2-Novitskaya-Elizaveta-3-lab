
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

const board = document.createElement('div');
board.className = 'board';

app.append(title, scoreBlock, board);
document.body.append(app);

let cells = new Array(16).fill(0);

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

function moveTiles(direction) {
    const newCells = new Array(16).fill(0);

    for (let i = 0; i < 4; i++) {
        const line = [];

        for (let j = 0; j < 4; j++) {
            const index = getCellIndex(i, j, direction);
            line.push(cells[index]);
        }

        const movedLine = line.filter(function(value) {
            return value !== 0;
        });

        while (movedLine.length < 4) {
            movedLine.push(0);
        }

        for (let j = 0; j < 4; j++) {
            const index = getCellIndex(i, j, direction);
            newCells[index] = movedLine[j];
        }
    }

    cells = newCells;
    renderBoard();
}

document.addEventListener('keydown', function(event) {
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

const startTiles = Math.floor(Math.random() * 3) + 1;

for (let i = 0; i < startTiles; i++) {
    addRandomTile();
}

renderBoard();
