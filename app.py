from flask import Flask, render_template
import boggle

# Configure application
app = Flask(__name__)

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


@app.route("/dictionary")
def dictionary():
    return render_template("dictionary.html")


@app.route("/history")
def history():
    return render_template("history.html")
