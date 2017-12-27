from os import path
import importlib
import pkgutil

md_exe = path.join(path.dirname(__file__), 'markdown.js')
hljs_exe = path.join(path.dirname(__file__), 'highlight.js')
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


# adapted from https://stackoverflow.com/a/25562415/2508324

def import_submodules(package, recursive=True):
    """ Import all submodules of a module, recursively, including subpackages

    :param package: package (name or actual module)
    :param recursive: recursively import submodules?
    :type package: str | module
    :rtype: dict[str, types.ModuleType]
    """
    if isinstance(package, str):
        package = importlib.import_module(package)
    results = {}
    for loader, name, is_pkg in pkgutil.walk_packages(package.__path__):
        full_name = package.__name__ + '.' + name
        results[full_name] = importlib.import_module(full_name)
        if recursive and is_pkg:
            results.update(import_submodules(full_name))
    return results
