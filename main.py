#!/usr/bin/env python3

from flask import Flask

app = Flask("PPCG v2")


@app.route("/")
def hello():
    return "Hello, World!"


if __name__ == '__main__':
    app.run()
