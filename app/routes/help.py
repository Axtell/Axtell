from app.server import server
from app.helpers.render import render_template
from app.controllers import help as help_center

from flask import abort


@server.route("/help")
def help():
    return render_template('help.html')


@server.route("/help/<path:path>")
def help_page(path):
    # Get the human-readable path
    breadcrumbs = help_center.get_breadcrumbs(path)
    if breadcrumbs is None:
        return abort(404)

    section_name, doc_name = breadcrumbs

    html, frontmatter_params, headings = help_center.render_doc_path(path, breadcrumbs=breadcrumbs)

    caption = frontmatter_params.get('caption')

    return render_template('docpage.html', **{
        'doc_structure': help_center.DOC_STRUCTURE,
        'path_name': path,
        'section_name': section_name,
        'doc_name': doc_name,
        'headings': headings,
        'caption': caption,
        'html': html
    })
