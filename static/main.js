async function main() {
    const selectedElems = [];

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
            
                    console.log(selectedElems);
                });
                
                divRow.appendChild(spanCol);
            }

            board.appendChild(divRow);
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
