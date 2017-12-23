from app.tasks.highlight import syntax_highlight
import app.tasks.markdown
from re import findall

def highlight_answer(answer):
    lang = answer.get_language()
    return syntax_highlight.delay(answer.code, lang.get_hljs_id(), lang.get_id()).wait()


def render_markdown(string):
    return app.tasks.markdown.render_markdown(string)


def text_preview(string, length=300):
    return ' '.join(findall(r'(?!\]\(|!\[)[^\s\[\]*]+', string)[:length])
