from app.helpers.render import render_template, render_json
from app.models.Language import Language
from app.server import server
from app.controllers import codepage as codepage_controller
from misc import path_for_icon, default_svg
from jinja2.exceptions import TemplateNotFound
from flask import abort, redirect
import golflang_encodings


PYTHON_STD_ENCODINGS = frozenset({
    'ascii',
    'big5',
    'big5hkscs',
    'cp037',
    'cp273',
    'cp424',
    'cp437',
    'cp500',
    'cp720',
    'cp737',
    'cp775',
    'cp850',
    'cp852',
    'cp855',
    'cp856',
    'cp857',
    'cp858',
    'cp860',
    'cp861',
    'cp862',
    'cp863',
    'cp864',
    'cp865',
    'cp866',
    'cp869',
    'cp874',
    'cp875',
    'cp932',
    'cp949',
    'cp950',
    'cp1006',
    'cp1026',
    'cp1125',
    'cp1140',
    'cp1250',
    'cp1251',
    'cp1252',
    'cp1253',
    'cp1254',
    'cp1255',
    'cp1256',
    'cp1257',
    'cp1258',
    'cp65001',
    'euc_jp',
    'euc_jis_2004',
    'euc_jisx0213',
    'euc_kr',
    'gb2312',
    'gbk',
    'gb18030',
    'hz',
    'iso2022_jp',
    'iso2022_jp_1',
    'iso2022_jp_2',
    'iso2022_jp_2004',
    'iso2022_jp_3',
    'iso2022_jp_ext',
    'iso2022_kr',
    'latin-1',
    'iso8859-2',
    'iso8859-3',
    'iso8859-4',
    'iso8859-5',
    'iso8859-6',
    'iso8859-7',
    'iso8859-8',
    'iso8859-9',
    'iso8859-10',
    'iso8859-11',
    'iso8859-13',
    'iso8859-14',
    'iso8859-15',
    'iso8859-16',
    'johab',
    'koi8-r',
    'koi8-t',
    'koi8-u',
    'kz1048',
    'mac-cyrillic',
    'mac-greek',
    'mac-iceland',
    'mac-latin2',
    'mac-roman',
    'mac-turkish',
    'ptcp154',
    'shift_jis',
    'shift_jis_2004',
    'shift_jisx0213',
    'utf-32',
    'utf-32-be',
    'utf-32-le',
    'utf-16',
    'utf-16-be',
    'utf-16-le',
    'utf-7',
    'utf-8',
    'utf-8-sig'
})

GOLFLANG_ENCODINGS = frozenset(golflang_encodings.add_encodings.codepages.keys())

ALL_ENCODINGS = PYTHON_STD_ENCODINGS | GOLFLANG_ENCODINGS


@server.route("/static/encodings")
def get_all_encodings():
    return render_json({'encodings': list(ALL_ENCODINGS)})


@server.route("/codepage/<encoding>")
def codepage(encoding):
    if encoding.lower() in ['utf-8', 'u8', 'utf', 'utf8']:
        return redirect('https://en.wikipedia.org/wiki/UTF-8', code=303)

    if encoding.lower() in ['utf-16', 'u16', 'utf16']:
        return redirect('https://en.wikipedia.org/wiki/UTF-16', code=303)

    raw_codepage = codepage_controller.get_codepage(encoding)

    if not raw_codepage:
        return abort(404)

    # Format into a 2D table
    mapped_codepage = [[None] * 16 for _ in range(16)]

    for self_codepoint, unicode_codepoint in raw_codepage.items():
        mapped_codepage[self_codepoint // 16][self_codepoint % 16] = (chr(unicode_codepoint), unicode_codepoint)

    return render_template('codepage.html', encoding=encoding, codepage=mapped_codepage)


@server.route("/static/encodings/<encoding>")
def get_encoding(encoding):
    raw_codepage = codepage_controller.get_codepage(encoding)
    if raw_codepage:
        return render_json({encoding: raw_codepage})
    else:
        return abort(404)
