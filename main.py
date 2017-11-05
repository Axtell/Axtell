#!/usr/bin/env python3

from flask import Flask, render_template

app = Flask("PPCG v2")


@app.route("/")
def hello():
    return render_template('index.html')


if __name__ == '__main__':
    app.run()
