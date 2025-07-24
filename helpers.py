import random
from string import ascii_uppercase, ascii_lowercase

def generate_board(rows=4, cols=4, uppercase=True):
    temp = {
        "board": [],
        "rows": rows,
        "cols": cols
    }

    # Initialize pseudo-random number generator
    random.seed()

    for i in range(rows):

        # Append a list
        temp["board"].append( [] )

        for j in range(cols):

            # Generate a pseudo-random uppercase or lowercase character
            r = random.choice(ascii_uppercase if uppercase else ascii_lowercase)

            # Append character to board
            temp["board"][i].append(r)

    return temp
