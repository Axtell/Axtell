from app.tasks.docs import render_docs
from os import getcwd, path
from collections import OrderedDict
from yaml import load as yaml_load

DOC_ROOT = path.join(getcwd(), 'docs')
DOC_INDEX_PATH = path.join(DOC_ROOT, 'index.yml')
DOC_STRUCTURE = yaml_load(open(DOC_INDEX_PATH).read())['structure']


def get_breadcrumbs(doc_path):
    for section in DOC_STRUCTURE:
        section_name = section['name']
        section_items = section['contents']

        for section_item in section_items:
            document_name = section_item['name']
            document_path = section_item['path']

            if document_path == doc_path:
                return section_name, document_name

    return None

def render_doc_path(doc_path, breadcrumbs):
    md_file = path.join(DOC_ROOT, doc_path + '.md')

    # We know the file exists because we checked the manual dir structure.
    with open(md_file, 'r') as file:
        html, frontmatter_params, headings = render_docs.delay(file.read()).wait()

    return html, frontmatter_params, headings
