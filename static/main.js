async function main() {
    let selectedElems = [];
    let wordsInBoard = null;
    let wordsFound = [];

    // Get reference to elements (i.e. buttons and divs)
    const checkWordBtn = document.querySelector('#checkWordBtn');
    const generateBoardBtn = document.querySelector('#generateBoardBtn');
    const wordsFoundParagraph = document.querySelector('#wordsFound');
    const resultDiv = document.querySelector('#result');

    // Generate board on click
    generateBoardBtn.addEventListener('click', async function() {
        const board = document.querySelector('#board');
        const content = await generateContentFromAPI(4, 4);

        // If board has content, reset it
        if (board.innerHTML) {
            board.innerHTML = '';
            selectedElems = [];
            wordsInBoard = null;
            wordsFound = [];
            wordsFoundParagraph.innerHTML = '';
            resultDiv.innerHTML = '';
        }

        for (let i = 0; i < content['rows']; i++) {

            const divRow = document.createElement('div');
            divRow.classList.add('d-flex', 'justify-content-center', 'align-items-center');

            for (let j = 0; j < content['cols']; j++) {

                const spanCol = document.createElement('span');
                spanCol.classList.add('d-flex', 'justify-content-center', 'align-items-center',
                    'border', 'letter');
                spanCol.textContent = content['board'][i][j];

                spanCol.dataset.row = i;
                spanCol.dataset.col = j;

                // Listen for click event on grid cells; toggle 'selected' class on click
                spanCol.addEventListener('click', () => {

                    const alreadySelected = spanCol.classList.contains('selected');

                    if (alreadySelected) {
                        // Allow deselection only of the last selected
                        if (selectedElems[selectedElems.length - 1] == spanCol) {
                            spanCol.classList.remove('selected');
                            selectedElems.pop();
                        } else {
                            resultDiv.innerHTML =
                            `<p class="fw-bold text-info">
                                You can only only deselect the last selected letter.
                            </p>`;
                        }
                    } else {
                        // First click is allowed unconditionally
                        if (selectedElems.length == 0) {
                            spanCol.classList.add('selected');
                            selectedElems.push(spanCol);
                        } else {
                            const lastSelected = selectedElems[selectedElems.length - 1];
                            if (isAdjacent(spanCol, lastSelected)) {
                                spanCol.classList.add('selected');
                                selectedElems.push(spanCol);
                            } else {
                                // Not adjacent
                                resultDiv.innerHTML =
                                `<p class="fw-bold text-info">
                                    You can only only select adjacent letters.
                                </p>`;
                            }
                        }
                    }

                    // Enable/disable check button
                    checkWordBtn.disabled = selectedElems.length < 3;
                });
                
                divRow.appendChild(spanCol);
            }

            board.appendChild(divRow);
            checkWordBtn.hidden = false;
        }
    });

    // Check if word is in board
    checkWordBtn.addEventListener('click', async function() {
        // Immediataly disable to avoid successive calls/clicking
        checkWordBtn.disabled = true;

        let word = '';
        selectedElems.forEach((selectedElem) => word += selectedElem.innerText);

        if (!wordsInBoard) {
            wordsInBoard = new Set(await getWordsInBoardFromAPI());
        }

        if (wordsInBoard.has(word)) {
            const result = resultDiv;

            if (wordsFound.includes(word)) {
                result.innerHTML =
                `<p class="fw-bold">
                    You already found this word.
                </p>`;
            } else {
                wordsFound.push(word);
                
                result.innerHTML =
                `<p class="fw-bold">
                    That's right, the board contains ${word}.
                </p>`;
    
                wordsFoundParagraph.innerHTML = wordsFound.join(', ');

                // Winning condition
                if (wordsFound.length == wordsInBoard.size) {
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
            resultDiv.innerHTML =
            `<p class="fw-bold text-info">
                I'm afraid there is no such word as ${word} in this board.
            </p>`;
        }
        
        // Reset
        for (let i = 0; i < selectedElems.length; i++) {
            selectedElems[i].classList.remove('selected');
        }
        selectedElems = [];
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
