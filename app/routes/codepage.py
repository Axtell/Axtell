from app.helpers.render import render_template, render_json
from app.models.Language import Language
from app.server import server
from misc import path_for_icon, default_svg
from jinja2.exceptions import TemplateNotFound
from flask import abort, redirect
import golflang_encodings


@server.route("/codepage/<encoding>")
def codepage(encoding):
    if encoding in ['UTF-8', 'UTF-16', 'ISO-8859-1']:
        return redirect(f'https://en.wikipedia.org/wiki/{encoding}', code=303)

    if encoding not in golflang_encodings.add_encodings.codepages:
        return abort(404)

    raw_codepage = golflang_encodings.add_encodings.codepages.get(encoding)

    # Format into a 2D table
    mapped_codepage = [[None] * 16 for _ in range(16)]

    for self_codepoint, unicode_codepoint in raw_codepage.items():
        mapped_codepage[self_codepoint // 16][self_codepoint % 16] = (chr(unicode_codepoint), unicode_codepoint)

    print(mapped_codepage)
    return render_template('codepage.html', encoding=encoding, codepage=mapped_codepage)


@server.route("/static/encodings/<encoding>")
def get_encoding(encoding):
    encoding_data = golflang_encodings.add_encodings.codepages.get(encoding, None)
    print(encoding_data)
    return render_json({encoding: encoding_data})
