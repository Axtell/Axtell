from flask import session, request, redirect

from app.server import server


@server.route("/theme/light", methods=['POST'])
def set_light_theme():
    session['dark_theme'] = False
    redirect_url = request.args.get('redirect') or '/'
    return redirect(redirect_url, code=303)


@server.route("/theme/dark", methods=['POST'])
def set_dark_theme():
    session['dark_theme'] = True
    redirect_url = request.args.get('redirect') or '/'
    return redirect(redirect_url, code=303)
