
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

for (let i = 0; i < 16; i++) {
    const cell = document.createElement('div');
    cell.className = 'cell';
    board.append(cell);
}

app.append(title, scoreBlock, board);
document.body.append(app);
