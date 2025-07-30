async function main() {
    const selectedElems = [];
    let wordsInBoard = null;

    // Generate board on click
    document.querySelector('#generateBoardBtn')
    .addEventListener('click', async function() {
        const board = document.querySelector('#board');
        const content = await generateContentFromAPI(4, 4);

        // If board has content, reset it
        if (board.innerHTML) {
            board.innerHTML = '';
        }

        for (let i = 0; i < content['rows']; i++) {

            const divRow = document.createElement('div');
            divRow.classList.add('d-flex', 'justify-content-center', 'align-items-center');

            for (let j = 0; j < content['cols']; j++) {

                const spanCol = document.createElement('span');
                spanCol.classList.add('d-flex', 'justify-content-center', 'align-items-center',
                    'border', 'letter');
                spanCol.textContent = content['board'][i][j];

                // Listen for click even on grid cells; toggle 'selected' class on click
                spanCol.addEventListener('click', () => {
                    spanCol.classList.toggle('selected');
                    if (spanCol.classList.contains('selected')) {
                        selectedElems.push(spanCol);
                    } else {
                        selectedElems.splice(selectedElems.indexOf(spanCol), 1);
                    }

                    // Enable checking once we have 3 or more elements selected
                    if (selectedElems.length >= 3) {
                        document.querySelector('#checkWordBtn').disabled = false;
                    } else {
                        document.querySelector('#checkWordBtn').disabled = true;
                    }
                });
                
                divRow.appendChild(spanCol);
            }

            board.appendChild(divRow);
            document.querySelector('#checkWordBtn').hidden = false;
        }
    });

    // Check if word is in board
    document.querySelector('#checkWordBtn')
    .addEventListener('click', async function() {

        let word = '';
        selectedElems.forEach((selectedElem) => word += selectedElem.innerText);

        if (!wordsInBoard) {
            wordsInBoard = new Set(await getWordsInBoardFromAPI());
        }

        if (wordsInBoard.has(word)) {
            console.log(`${word} is in board`);
        } else {
            console.log(`${word} is NOT in board`);
        }
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

document.addEventListener('DOMContentLoaded', main);
