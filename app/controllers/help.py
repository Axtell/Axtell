from app.tasks.docs import render_docs
from os import getcwd, path
from collections import OrderedDict

doc_structure = {
    'Getting Started': OrderedDict([
        ('What is Axtell?', 'intro/getting-started'),
    ]),
    'Legal': OrderedDict([
        ('Privacy Policy', 'legal/privacy'),
    ]),
    'FAQ': OrderedDict([
        ('General FAQ', 'faq/general-faq'),
        ('Answering', 'faq/answering'),
        ('Challenges', 'faq/challenges'),
        ('Languages', 'faq/languages'),
    ]),
}

doc_root = path.join(getcwd(), 'docs')

def get_breadcrumbs(doc_path):
    for section_name, section in doc_structure.items():
        for ref_doc_name, ref_doc_path in section.items():
            if ref_doc_path == doc_path:
                return section_name, ref_doc_name

    return None

def render_doc_path(doc_path, breadcrumbs):
    md_file = path.join(doc_root, doc_path + '.md')

    # We know the file exists because we checked the manual dir structure.
    with open(md_file, 'r') as file:
        html, frontmatter_params, headings = render_docs.delay(file.read()).wait()

    return html, frontmatter_params, headings
