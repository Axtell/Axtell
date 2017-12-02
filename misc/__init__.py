from os import path

md_exe = path.join(path.dirname(__file__), 'markdown.js')
lang_path = path.join(path.dirname(__file__), 'languages.json')
icon_template_path = path.join(path.dirname(__file__), 'logo-template.svg')

def path_for_icon(name):
    return path.join(path.dirname(__file__), 'lang-logos', name + '.svg')


cached_template = None

def default_svg(name, color):
    global cached_template

    if cached_template is None:
        with open(icon_template_path) as template:
            cached_template = template.read()

    return cached_template. \
        replace('LANGUAGE_COLOR', color) \
        .replace('LANGUAGE_NAME', name)
