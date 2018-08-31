from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy import create_engine
from sqlalchemy.types import *
from sqlalchemy.schema import *
from sqlalchemy.orm import *

from config import db_config
from math import ceil

# Note: A lot is stolen from http://derrickgilland.com/posts/demystifying-flask-sqlalchemy/


class Pagination(object):
    def __init__(self, query, page, per_page, total, items):
        self.query = query
        self.page = page
        self.per_page = per_page
        self.total = total
        self.items = items

        if self.per_page == 0:
            self.pages = 0
        else:
            self.pages = int(ceil(self.total / float(self.per_page)))

        self.prev_num = self.page - 1
        self.has_prev = self.page > 1
        self.next_num = self.page + 1
        self.has_next = self.page < self.pages

    def prev(self, error_out=False):
        assert self.query is not None, \
            'a query object is required for this method to work'
        return self.query.paginate(self.page - 1, self.per_page, error_out)

    def next(self, error_out=False):
        assert self.query is not None, \
            'a query object is required for this method to work'
        return self.query.paginate(self.page + 1, self.per_page, error_out)


class BaseQuery(Query):
    def paginate(self, page, per_page=20, error_out=True):
        if error_out and page < 1:
            raise IndexError

        if per_page is None:
            per_page = self.DEFAULT_PER_PAGE

        items = self.limit(per_page).offset((page - 1) * per_page).all()

        if not items and page != 1 and error_out:
            raise IndexError

        if page == 1 and len(items) < per_page:
            total = len(items)
        else:
            total = self.order_by(None).count()

        return Pagination(self, page, per_page, total, items)


db_uri = \
    f"mysql+mysqlconnector://{db_config['user']}:{db_config['password']}@{db_config['host']}:{db_config['port']}/" \
    f"{db_config['database']}?charset=utf8mb4"

engine = create_engine(db_uri)
session = scoped_session(sessionmaker(bind=engine, query_cls=BaseQuery))

Model = declarative_base()
Model.query = session.query_property()

