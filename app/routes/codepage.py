from app.helpers.render import render_template, render_json
from app.models.Language import Language
from app.server import server
from app.controllers import codepage
from misc import path_for_icon, default_svg
from jinja2.exceptions import TemplateNotFound
from flask import abort, redirect


@server.route("/codepage/<encoding>")
def codepage(encoding):
    if encoding in ['UTF-8', 'UTF-16']:
        return redirect(f'https://en.wikipedia.org/wiki/{encoding}', code=303)

    raw_codepage = codepage.get_codepage(encoding)

    if not raw_codepage:
        return abort(404)

    # Format into a 2D table
    mapped_codepage = [[None] * 16 for _ in range(16)]

    for self_codepoint, unicode_codepoint in raw_codepage.items():
        mapped_codepage[self_codepoint // 16][self_codepoint % 16] = (chr(unicode_codepoint), unicode_codepoint)

    return render_template('codepage.html', encoding=encoding, codepage=mapped_codepage)


@server.route("/static/encodings/<encoding>")
def get_encoding(encoding):
    raw_codepage = codepage.get_codepage(encoding)
    if raw_codepage:
        return render_json({encoding: raw_codepage})
    else:
        return abort(404)
