from app.tasks.highlight import syntax_highlight
from re import findall
from app.tasks.markdown import render_markdown as markdown_renderer

def highlight_answer(answer):
    lang = answer.get_language()
    return syntax_highlight.delay(answer.code, lang.get_hljs_id(), lang.get_id()).wait()


def render_markdown(markdown):
    return markdown_renderer.delay(markdown).wait()


def text_preview(string, length=300):
    return ' '.join(findall(r'(?!\]\(|!\[)[^\s\[\]*]+', string)[:length])
