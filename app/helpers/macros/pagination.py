from config import pagination as pagination_config

def pages_above(pagination):
    return range(pagination.page + 1, min(pagination.pages, pagination.page + pagination_config['links']) + 1)

def pages_below(pagination):
    return range(max(1, pagination.page - pagination_config['links']), pagination.page)
