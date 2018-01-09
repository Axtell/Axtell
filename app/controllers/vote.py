from flask import g, abort, redirect, url_for

from app.instances.db import db
from app.models.Post import Post
from app.models.Answer import Answer
from app.models.PostVote import PostVote
from app.models.AnswerVote import AnswerVote

# noinspection PyUnresolvedReferences
import app.routes.post
# noinspection PyUnresolvedReferences
import app.routes.theme
# noinspection PyUnresolvedReferences
import app.routes.auth


def get_post_vote_breakdown(post_id):
    post = Post.query.filter_by(id=post_id).first()
    if post is None:
        return abort(404)
    votes = list(map(lambda vote: vote.vote, PostVote.query.filter_by(post_id=post_id).all()))
    upvotes = votes.count(1)
    downvotes = votes.count(-1)
    return {"upvote": upvotes, "downvote": downvotes}


def get_answer_vote_breakdown(answer_id):
    answer = Answer.query.filter_by(id=answer_id).first()
    if answer is None:
        return abort(404)
    votes = list(map(lambda vote: vote.vote, AnswerVote.query.filter_by(answer_id=answer_id).all()))
    upvotes = votes.count(1)
    downvotes = votes.count(-1)
    return {"upvote": upvotes, "downvote": downvotes}


def get_post_vote(post_id):
    current_user = g.user
    if current_user is None:
        return abort(403)

    post_votes = PostVote.query.filter_by(post_id=post_id, user_id=current_user.id).first()
    if post_votes is None:
        return abort(404)
    return post_votes.to_json()


def get_answer_vote(answer_id):
    current_user = g.user
    if current_user is None:
        return abort(403)

    answer_votes = AnswerVote.query.filter_by(answer_id=answer_id, user_id=current_user.id).first()
    if answer_votes is None:
        vote = 0
    else:
        vote = answer_votes.vote

    return {"vote": vote, "breakdown": get_answer_vote_breakdown(answer_id)}


def do_post_vote(post_id, vote):
    current_user = g.user
    if current_user is None:
        return abort(403)

    # ensure that vote is a valid value
    try:
        vote = int(vote)
    except ValueError:
        return abort(400)
    if vote not in (-1, 0, 1):
        return abort(400)

    post = Post.query.filter_by(post_id=post_id).first()
    # ensure that user is not voting on own content
    if post.user_id == g.user.id:
        return abort(403)

    # handle changing existing vote
    prev_vote = PostVote.query.filter_by(post_id=post_id, user_id=current_user.id).first()
    if prev_vote is not None:
        prev_vote.vote = vote
        db.session.commit()
    else:
        new_vote = PostVote(post_id=post_id, vote=vote, user_id=current_user.id)
        current_user.post_votes.append(new_vote)
        post = Post.query.filter_by(id=post_id).first()
        post.votes.append(new_vote)

        db.session.add(new_vote)
        db.session.commit()

    return {"vote": vote, "breakdown": get_post_vote_breakdown(post_id)}


def do_answer_vote(answer_id, vote):
    current_user = g.user
    if current_user is None:
        return abort(403)

    # ensure that vote is a valid value
    try:
        vote = int(vote)
    except ValueError:
        return abort(400)
    if vote not in (-1, 0, 1):
        return abort(400)

    answer = Answer.query.filter_by(id=answer_id).first()

    # ensure that user is not voting on own content
    if answer.user_id == g.user.id:
        return abort(403)

    # handle changing existing vote
    prev_vote = AnswerVote.query.filter_by(answer_id=answer_id, user_id=current_user.id).first()
    if prev_vote is not None:
        prev_vote.vote = vote
        db.session.commit()
    else:
        new_vote = AnswerVote(answer_id=answer_id, vote=vote, user_id=current_user.id)
        current_user.answer_votes.append(new_vote)
        answer.votes.append(new_vote)

        db.session.add(new_vote)
        db.session.commit()

    return {"vote": vote, "breakdown": get_answer_vote_breakdown(answer_id)}
