from app.tasks.highlight import syntax_highlight

def highlight_answer(answer):
    return syntax_highlight.delay(answer.code, answer.get_language().get_hljs_id()).wait()
