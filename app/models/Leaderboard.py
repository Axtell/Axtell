from app.models.Answer import Answer
from config import answers

class Leaderboard(object):
    """
    Manages leaderboard for a post
    """

    def __init__(self, post_id, limit=answers['leaderboard_items']):
        self.post_id = post_id
        self.default_limit = limit

    def get_answers(self, limit=None):
        if limit is None:
            limit = self.default_limit

        query = Answer.query \
            .filter_by(post_id=self.post_id) \
            .order_by(Answer.byte_len.asc())

        if limit > -1:
            query = query.limit(limit)

        return query.all()


    def get_count(self):
        return self.default_limit


    def get_total_count(self):
        return Answer.query.filter_by(post_id=self.post_id).count()
