import app.tasks.highlight

def highlight_answer(answer):
    return app.tasks.highlight.syntax_highlight(answer.code, answer.get_language().get_hljs_id())
