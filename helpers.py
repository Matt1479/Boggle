import random
import requests
from string import ascii_uppercase, ascii_lowercase

# Initialize pseudo-random number generator
random.seed()

VOWELS = {'a', 'e', 'i', 'o', 'u', 'A', 'E', 'I', 'O', 'U'}


def count_vowels_consonants(board, rows, cols):
    """Count the number of letters (vowels and consonants) in a board."""

    letters = {"vowels": 0, "consonants": 0}

    for i in range(rows):
        for j in range(cols):
            if board[i][j] in VOWELS:
                letters["vowels"] += 1
            else:
                letters["consonants"] += 1

    return letters


def generate_board(rows=4, cols=4, uppercase=True, min_vowel_ratio=0.25):
    """Generate a rows x cols board."""

    while (True):

        board = []

        for i in range(rows):

            row = []

            for j in range(cols):

                # Generate a pseudo-random uppercase or lowercase character
                r = random.choice(ascii_uppercase if uppercase else ascii_lowercase)

                # Append character to board
                row.append(r)
            
            board.append(row)
        
        letters = count_vowels_consonants(board, rows, cols)

        # Prevent division by 0
        consonants = letters["consonants"] or 1
        # Ensure there is at least (min_vowel_ratio * 100)% vowels
        if (letters["vowels"] / consonants) >= min_vowel_ratio:
            break

    return {
        "board": board,
        "rows": rows,
        "cols": cols
    }


def get_chain(rows: int, cols: int, board: []):
    
    if not board:
        return None

    chain = ""
    for i in range(rows):
        for j in range(cols):
            chain += board[i][j]
    
    return chain


def unpack(url, word):
    response = requests.get(f"{url}/{word}")
    if response.ok:
        response_json = response.json()[0]

        # Unpack
        out = {
            "meanings": [],
            "sourceUrls": response_json["sourceUrls"],
            "word": response_json["word"]
        }
        for meaning in response_json["meanings"]:
            out["meanings"].append({
                "definitions": [
                    definition["definition"]
                    for definition in meaning["definitions"]
                ],
                "partOfSpeech": meaning["partOfSpeech"],
            })

        return out
    else:
        return None
