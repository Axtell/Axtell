from app.tasks.highlight import syntax_highlight

def highlight_answer(answer):
    lang = answer.get_language()
    return syntax_highlight.delay(answer.code, lang.get_hljs_id(), lang.get_id()).wait()
