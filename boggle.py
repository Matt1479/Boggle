# https://www.geeksforgeeks.org/dsa/boggle-using-trie/
# Time Complexity:  O(N*W + R*C^2)
# Space Complexity: O(N*W + R*C)
# N: len(words) in dictionary
# R: Rows; C: Columns

def exists(board, word, rows, cols):
    """Returns True if word exists in board."""

    for i in range(rows):
        for j in range(cols):
            # If current letter matches with first character in word and board contains word
            if board[i][j] == word[0] and search(board, word, 0, i, j, rows, cols):
                return True
    return False


def load(dictionary, min_len=3, uppercase=True):
    """Load dictionary of words (uppercase or lowercase) of length >= min_len
    into a set data structure to avoid duplicates. Return words as a list."""
    # Words in dictionary
    words = set()

    file = open(dictionary, "r")
    for line in file:
        word = line.rstrip()
        if len(word) >= min_len:
            words.add(word.upper() if uppercase else word)
    file.close()

    return list(words)


def search(board, word, length, i, j, rows, cols):
    """Recursively searches for word in board."""
    
    # If out of bounds
    if i < 0 or i >= rows or j < 0 or j >= cols:
        return False

    # If respective letters don't match (e.g. board[1][1] != word[1])
    if board[i][j] != word[length]:
        return False

    # If length of "path" is equal to length of word - 1
    if length == len(word) - 1:
        # Board contains word
        return True

    # Make a copy of current character
    c = board[i][j]
    # Only allow using this character once
    board[i][j] = "@"

    ans = (
            search(board, word, length + 1, i - 1, j - 1, rows, cols)
        or  search(board, word, length + 1, i - 1, j    , rows, cols)
        or  search(board, word, length + 1, i - 1, j + 1, rows, cols)
        or  search(board, word, length + 1, i    , j - 1, rows, cols)
        or  search(board, word, length + 1, i    , j + 1, rows, cols)
        or  search(board, word, length + 1, i + 1, j - 1, rows, cols)
        or  search(board, word, length + 1, i + 1, j    , rows, cols)
        or  search(board, word, length + 1, i + 1, j + 1, rows, cols)
    )

    # After the search, reassign c to board[i][j]
    board[i][j] = c
    return ans


def word_boggle(board: list, rows, cols, words: list):
    """Find words in board."""

    # Words in board
    result = []

    for word in words:
        if exists(board, word, rows, cols):
            result.append(word)

    return result
