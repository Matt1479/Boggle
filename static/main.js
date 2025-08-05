const stateObj = {
    selectedElems: null,
    wordsFound: null,
    wordsInBoard: null,

    board: null,
    content: null,

    checkWordBtn: null,
    generateBoardBtn: null,
    wordsFoundElem: null,
    resultElem: null,

    wordsElem: null,

    displayElem: null,
    displayBtn: null,

    generateModalElem: null,
    dimensionsModalElem: null,

    rows: 4,
    cols: 4,

    minWordLength: 3
};

async function main() {
    // Initialize fields
    stateObj.selectedElems = [];
    stateObj.wordsInBoard = null;
    stateObj.wordsFound = [];

    // Get reference to elements (i.e. buttons and divs)
    stateObj.checkWordBtn = document.querySelector('#checkWordBtn');
    stateObj.generateBoardBtn = document.querySelector('#generateBoardBtn');
    stateObj.wordsFoundElem = document.querySelector('#wordsFound');
    stateObj.resultElem = document.querySelector('#result');
    stateObj.displayElem = document.querySelector('#display');
    stateObj.displayBtn = document.querySelector('#display > button');
    stateObj.wordsElem = document.querySelector('#words');

    // Try to get content from API/session
    stateObj.content = await getDataFromAPI('/api/get-content');
    if (stateObj.content.Error) {
        stateObj.content = null;
    } else {
        // Generate board, passing in content from API/session
        await generateBoard(stateObj.content);
    }

    // Initialize/instantiate modals
    stateObj.generateModalElem = new bootstrap.Modal('#generateModal');
    stateObj.dimensionsModalElem = new bootstrap.Modal('#dimensionsModal');

    // Attach event listener to confirm generate modal button
    document.querySelector('#confirmGenerateModalBtn').addEventListener('click', async () => {
        stateObj.generateModalElem.hide();
        await generateBoard();
    });

    // Attach event listener to confirm dimensions modal button
    document.querySelector('#confirmDimensionsModalBtn').addEventListener('click', async () => {
        // Get values of inputs
        const rows = parseInt(document.querySelector('#rowsInput').value);
        const cols = parseInt(document.querySelector('#colsInput').value);

        // Validate inputs
        if (rows < 2 || cols < 2 || rows > 10 || cols > 10 || rows != cols) {
            alert("Rows and Columns must be between 2 and 10 and be equal to each other.");
            return;
        }

        // Store values in state
        stateObj.rows = rows;
        stateObj.cols = cols;

        stateObj.dimensionsModalElem.hide();
        
        await generateBoard();
    });

    // Generate board on click
    stateObj.generateBoardBtn.addEventListener('click', async function () {
        stateObj.board = document.querySelector('#board');
        if (stateObj.board.innerHTML.trim()) {
            // Generate new board (if player agrees)
            stateObj.generateModalElem.show();
        } else {
            // Grab dimensions for board from player
            stateObj.dimensionsModalElem.show();
        }
    });

    // Check if word is in board
    stateObj.checkWordBtn.addEventListener('click', async function () {
        // Immediataly disable to avoid successive calls/clicking
        stateObj.checkWordBtn.disabled = true;

        let word = '';
        stateObj.selectedElems.forEach((selectedElem) => word += selectedElem.innerText);

        if (word.length < stateObj.minWordLength) {
            showResultMessage(`Words must be at least ${stateObj.minWordLength} letters long.`);
            return;
        }

        if (!stateObj.wordsInBoard) {
            stateObj.wordsInBoard = new Set(await getDataFromAPI('/api/get-words-in-board'));
        }

        if (stateObj.wordsInBoard.has(word)) {
            if (stateObj.wordsFound.includes(word)) {
                showResultMessage('You already found this word.');
            } else {
                stateObj.wordsFound.push(word);
                showResultMessage(`That's right, the board contains ${word}.`);

                stateObj.wordsFoundElem.innerHTML = stateObj.wordsFound.join(', ');

                // Winning condition
                if (stateObj.wordsFound.length == stateObj.wordsInBoard.size) {
                    showResultMessage(`You have found all the words!`);
                    stateObj.resultElem.innerHTML +=
                    `<div class="my-3">
                        <button class="btn btn-success" onclick="window.location.reload()">
                            Restart
                        </button>
                    </div>
                    `;
                }
            }
        } else {
            showResultMessage(`I'm afraid there is no such word as ${word} in this board.`);
        }

        // Reset
        for (let i = 0; i < stateObj.selectedElems.length; i++) {
            stateObj.selectedElems[i].classList.remove('selected');
        }
        stateObj.selectedElems = [];
    });

    stateObj.displayBtn.addEventListener('click', async () => {
        // Immediataly disable to avoid successive calls/clicking
        stateObj.displayBtn.disabled = true;
        if (!stateObj.wordsInBoard) {
            stateObj.wordsInBoard = new Set(await getDataFromAPI('/api/get-words-in-board'));
        }

        // When done fetching change display text and toggle the button
        if (stateObj.displayBtn.innerText == 'Display all words') {
            if (!stateObj.wordsElem.innerHTML.trim()) {
                const wordMap = new Map();
    
                // Group words by length
                for (const word of stateObj.wordsInBoard) {
                    const len = word.length;
                    if (!wordMap.has(len)) {
                        wordMap.set(len, []);
                    }
                    wordMap.get(len).push(word);
                }
    
                // Create DOM structure
                for (const [length, words] of [...wordMap.entries()]) {
                    const groupContainer = document.createElement('div');
                    groupContainer.classList.add('row', 'mb-3');
    
                    const title = document.createElement('h4');
                    title.textContent = `${length} letter`;
                    title.classList.add('fs-2', 'text-start');
    
                    groupContainer.appendChild(title);
    
                    words.sort().forEach((word) => {
                        const a = document.createElement('a');
                        a.textContent = word.at(0).toUpperCase() + word.slice(1).toLowerCase();
                        a.classList.add('word', 'w-auto', 'btn', 'mx-1');
                        a.href = `/dictionary?word=${word}`;

                        groupContainer.appendChild(a); 
                    });

                    stateObj.wordsElem.appendChild(groupContainer);
                }
            }

            stateObj.wordsElem.hidden = false;
            stateObj.displayBtn.innerText = 'Hide all words';
        } else {
            stateObj.wordsElem.hidden = true;
            stateObj.displayBtn.innerText = 'Display all words';
        }

        stateObj.displayBtn.disabled = false;
    });
}

async function generateBoard(content = null) {
    stateObj.board = document.querySelector('#board');
    stateObj.content = content ? content : await generateContentFromAPI(stateObj.rows, stateObj.cols);

    if (!stateObj.content || !stateObj.board) {
        showResultMessage('Failed to generate board. Try again.', 'text-danger');
        return;
    }

    // If board has content, reset it
    if (stateObj.board.innerHTML.trim()) {
        resetBoardState();
    }

    for (let i = 0; i < stateObj.content['rows']; i++) {

        const divRow = document.createElement('div');
        divRow.classList.add('d-flex', 'justify-content-center', 'align-items-center');

        for (let j = 0; j < stateObj.content['cols']; j++) {

            const spanCol = document.createElement('span');
            spanCol.classList.add('d-flex', 'justify-content-center', 'align-items-center',
                'border', 'letter');
            spanCol.textContent = stateObj.content['board'][i][j];

            spanCol.dataset.row = i;
            spanCol.dataset.col = j;

            // Listen for click event on grid cells; toggle 'selected' class on click
            spanCol.addEventListener('click', () => {

                const alreadySelected = spanCol.classList.contains('selected');

                if (alreadySelected) {
                    // Allow deselection only of the last selected
                    if (stateObj.selectedElems[stateObj.selectedElems.length - 1] == spanCol) {
                        spanCol.classList.remove('selected');
                        stateObj.selectedElems.pop();
                    } else {
                        showResultMessage('You can only deselect the last selected letter.');
                    }
                } else {
                    // First click is allowed unconditionally
                    if (stateObj.selectedElems.length == 0) {
                        spanCol.classList.add('selected');
                        stateObj.selectedElems.push(spanCol);
                    } else {
                        const lastSelected = stateObj.selectedElems[stateObj.selectedElems.length - 1];
                        if (isAdjacent(spanCol, lastSelected)) {
                            spanCol.classList.add('selected');
                            stateObj.selectedElems.push(spanCol);
                        } else {
                            // Not adjacent
                            showResultMessage('You can only select adjacent letters.');
                        }
                    }
                }

                // Enable/disable check button
                stateObj.checkWordBtn.disabled = stateObj.selectedElems.length < stateObj.minWordLength;
            });

            divRow.appendChild(spanCol);
        }

        stateObj.board.appendChild(divRow);
    }

    stateObj.checkWordBtn.hidden = false;
    stateObj.displayElem.hidden = false;
}

async function generateContentFromAPI(rows, cols) {
    const url = '/api/generate-content-' + rows + '-' + cols;
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }

        const json = await response.json();
        return json;
    } catch (error) {
        showResultMessage('Could not fetch data from API.', 'text-danger');
    }
}

async function getDataFromAPI(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }

        const json = await response.json();
        return json;
    } catch (error) {
        showResultMessage('Could not fetch data from API.', 'text-danger');
    }
}

function isAdjacent(a, b) {
    const rowA = parseInt(a.dataset.row);
    const colA = parseInt(a.dataset.col);
    
    const rowB = parseInt(b.dataset.row);
    const colB = parseInt(b.dataset.col);

    const rowDiff = Math.abs(rowA - rowB);
    const colDiff = Math.abs(colA - colB);

    // Adjacent only if rowDiff <= 1 and colDiff <= 1 and they're not equal
    return rowDiff <= 1 && colDiff <= 1 && !(rowA == rowB && colA == colB);
}

function resetBoardState() {
    stateObj.board.innerHTML = '';
    stateObj.selectedElems = [];
    stateObj.wordsInBoard = null;
    stateObj.wordsFound = [];
    stateObj.wordsFoundElem.innerHTML = '';
    stateObj.resultElem.innerHTML = '';
    stateObj.checkWordBtn.disabled = true;
    stateObj.displayBtn.innerText = 'Display all words';
    stateObj.displayBtn.disabled = false;
    stateObj.wordsElem.hidden = true;
    stateObj.wordsElem.innerHTML = '';
}

function showResultMessage(message, classes='text-info') {
    stateObj.resultElem.innerHTML = `<p class="${classes}">${message}</p>`;
}

document.addEventListener('DOMContentLoaded', main);
