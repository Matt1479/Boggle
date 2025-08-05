from flask import Flask, flash, jsonify, request, render_template, session
from flask_session import Session
import boggle
import helpers

# Configure application
app = Flask(__name__)

# Configure session (store on disk)
app.config["SESSION_PERMANENT"] = False
app.config["SESSION_TYPE"] = "filesystem"
Session(app)

# Words in dictionary (of length >= 3)
G_WORDS = boggle.load("static/dictionaries/large")


@app.after_request
def after_request(response):
    """Ensure responses aren't cached, so that whenever there is a change,
    the browser will 'notice' that change."""
    response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
    response.headers["Expires"] = 0
    response.headers["Pragma"] = "no-cache"
    return response


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/api/generate-content-<rows>-<cols>")
def api_generate_content(rows, cols):
    try:
        if (rows and cols) and rows == cols:
            session["content"] = helpers.generate_board(int(rows), int(cols))
        else:
            session["content"] = {}
    except ValueError:
        return jsonify({"Error": "rows and cols must be equal and an integer."})
    
    return jsonify(session["content"])


@app.route("/api/get-words-in-board")
def api_get_words_in_board():
    if not session["content"]:
        return jsonify({"Error": "No content."})
    
    return jsonify(boggle.word_boggle(
        session["content"]["board"], session["content"]["rows"],
        session["content"]["cols"], G_WORDS))


@app.route("/dictionary", methods=["GET", "POST"])
def dictionary():
    if request.method == "POST":
        word = request.form.get("word")
    else:
        word = request.args.get("word")
    
    if word:
        out = helpers.unpack("https://api.dictionaryapi.dev/api/v2/entries/en", word)
        if out:
            return render_template("dictionary.html", message=out)
        else:
            flash(f"Sorry, the word {word} is not in dictionary.")

    return render_template("dictionary.html")


@app.route("/history")
def history():
    return render_template("history.html")
