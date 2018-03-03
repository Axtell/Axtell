from flask import request

from app.helpers.render import render_error, render_json, render_template
from app.server import server

from app.controllers.categories import search_category

@server.route("/categories/search")
def category_search():
	json = request.get_json(silent=True)

	if not json or 'query' not in json or len(str(json['query'])) == 0:
		return render_error('Bad query')

	return render_json({
		'results': search_category(query=str(json['query']))
	})


@server.route("/categories")
def categories():
	return render_template('categories.html')
