# Boggle

## Table of Contents

- [About the Project](#about-the-project)
- [File Structure](#file-structure)
- [Getting Started](#getting-started)
    - [Installation](#installation)
- [Usage](#usage)
    - [Examples](#examples)
- [Tech Stack](#tech-stack)
- [References](#references)
- [License](#license)

## About the Project

#TODO

## File Structure

```bash
├── app.py                  Server-side Python code
├── boggle.py               Boggle game code
├── requirements.txt        Python dependencies
├── schema.sql              Design of database
├── static                  Static content for web pages (Images, JavaScript, CSS files)
│   ├── dictionaries/
│   └── styles.css
├── templates               HTML files
|   ├── layout.html         Blueprint of HTML files
|   └── *.html
├── LICENSE
└── README.md
```

## Getting Started

### Installation

1. Clone this repository:
    ```
    git clone https://github.com/Matt1479/Boggle
    ```
2. (Optional) Change Git remote URL to avoid pushing to the original:
    ```bash
    git remote set-url origin <your_github_username>/<your_repository_link>
    git remote -v # confirm the change
    ```
3. Install Python dependencies:
    ```bash
    pip install -r requirements.txt
    ```

## Usage

Run project with:
```bash
flask run
```

### Examples

#TODO

## Tech Stack

Backend:
- Python (Flask)
- Jinja
- SQLite3

Frontend:
- HTML
- CSS (Bootstrap)
- JavaScript

## References

- Boggle code inspired by [GFG Boggle](https://www.geeksforgeeks.org/dsa/boggle-using-trie/)

## License

This project is for educational purposes only and is not licensed for reuse.
