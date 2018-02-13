from app.models.Category import Category

def search_category(query):
	return [category.name for category in Category.query.filter(Category.name.like(f'%{query}%')).limit(8).all()]
