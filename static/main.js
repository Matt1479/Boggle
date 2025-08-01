const stateObj = {
    selectedElems: null,
    wordsFound: null,
    wordsInBoard: null,

    board: null,
    content: null,

    checkWordBtn: null,
    generateBoardBtn: null,
    wordsFoundParagraph: null,
    resultDiv: null,

    generateModal: null,
    dimensionsModal: null,

    rows: 4,
    cols: 4
};

async function main() {
    // Initialize fields
    stateObj.selectedElems = [];
    stateObj.wordsInBoard = null;
    stateObj.wordsFound = [];

    // Get reference to elements (i.e. buttons and divs)
    stateObj.checkWordBtn = document.querySelector('#checkWordBtn');
    stateObj.generateBoardBtn = document.querySelector('#generateBoardBtn');
    stateObj.wordsFoundParagraph = document.querySelector('#wordsFound');
    stateObj.resultDiv = document.querySelector('#result');

    // Initialize/instantiate modals
    stateObj.generateModal = new bootstrap.Modal('#generateModal');
    stateObj.dimensionsModal = new bootstrap.Modal('#dimensionsModal');

    // Attach event listener to confirm generate modal button
    document.querySelector('#confirmGenerateModalBtn').addEventListener('click', async () => {
        stateObj.generateModal.hide();
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

        stateObj.dimensionsModal.hide();
        
        await generateBoard();
    });

    // Generate board on click
    stateObj.generateBoardBtn.addEventListener('click', async function () {
        stateObj.board = document.querySelector('#board');
        if (stateObj.board.innerHTML.trim()) {
            // Generate new board board (if player agrees)
            stateObj.generateModal.show();
        } else {
            // Grab dimensions for board from player
            stateObj.dimensionsModal.show();
        }
    });

    // Check if word is in board
    stateObj.checkWordBtn.addEventListener('click', async function () {
        // Immediataly disable to avoid successive calls/clicking
        stateObj.checkWordBtn.disabled = true;

        let word = '';
        stateObj.selectedElems.forEach((selectedElem) => word += selectedElem.innerText);

        if (!stateObj.wordsInBoard) {
            stateObj.wordsInBoard = new Set(await getWordsInBoardFromAPI());
        }

        if (stateObj.wordsInBoard.has(word)) {
            const result = stateObj.resultDiv;

            if (stateObj.wordsFound.includes(word)) {
                result.innerHTML =
                    `<p class="fw-bold">
                    You already found this word.
                </p>`;
            } else {
                stateObj.wordsFound.push(word);

                result.innerHTML =
                    `<p class="fw-bold">
                    That's right, the board contains ${word}.
                </p>`;

                stateObj.wordsFoundParagraph.innerHTML = stateObj.wordsFound.join(', ');

                // Winning condition
                if (stateObj.wordsFound.length == stateObj.wordsInBoard.size) {
                    result.innerHTML +=
                        `<p class="fw-bold text-success my-3">
                        You have found all the words!
                    </p>
                    <div class="my-3">
                        <button class="btn btn-success" onclick="window.location.reload()">
                            Restart
                        </button>
                    </div>
                    `;
                }
            }
        } else {
            stateObj.resultDiv.innerHTML =
                `<p class="fw-bold text-info">
                I'm afraid there is no such word as ${word} in this board.
            </p>`;
        }

        // Reset
        for (let i = 0; i < stateObj.selectedElems.length; i++) {
            stateObj.selectedElems[i].classList.remove('selected');
        }
        stateObj.selectedElems = [];
    });
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
        console.error(error.message);
    }
}

async function getWordsInBoardFromAPI() {
    const url = '/api/get-words-in-board';
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }

        const json = await response.json();
        return json;
    } catch (error) {
        console.error(error.message);
    }
}

async function generateBoard() {
    stateObj.board = document.querySelector('#board');
    stateObj.content = await generateContentFromAPI(stateObj.rows, stateObj.cols);

    if (!stateObj.content || !stateObj.board) {
        stateObj.resultDiv.innerHTML = 
        `<p class="text-danger">
            Failed to generate board. Try again.
        </p>`;
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
                        stateObj.resultDiv.innerHTML =
                            `<p class="fw-bold text-info">
                                You can only deselect the last selected letter.
                            </p>`;
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
                            stateObj.resultDiv.innerHTML =
                                `<p class="fw-bold text-info">
                                    You can only select adjacent letters.
                                </p>`;
                        }
                    }
                }

                // Enable/disable check button
                stateObj.checkWordBtn.disabled = stateObj.selectedElems.length < 3;
            });

            divRow.appendChild(spanCol);
        }

        stateObj.board.appendChild(divRow);
    }

    stateObj.checkWordBtn.hidden = false;
}

function resetBoardState() {
    stateObj.board.innerHTML = '';
    stateObj.selectedElems = [];
    stateObj.wordsInBoard = null;
    stateObj.wordsFound = [];
    stateObj.wordsFoundParagraph.innerHTML = '';
    stateObj.resultDiv.innerHTML = '';
    stateObj.checkWordBtn.disabled = true;
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

document.addEventListener('DOMContentLoaded', main);
