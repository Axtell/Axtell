from flask import g, abort, redirect, url_for

from app.instances.db import db
from app.models.Post import Post
from app.models.Answer import Answer
from app.models.PostVote import PostVote
from app.models.AnswerVote import AnswerVote
from app.helpers.render import render_json

# noinspection PyUnresolvedReferences
import app.routes.post
# noinspection PyUnresolvedReferences
import app.routes.theme
# noinspection PyUnresolvedReferences
import app.routes.auth


def get_post_vote_sum(post_id):
    post = Post.query.filter_by(id=post_id).first()
    if post is None:
        return abort(404)
    votes = PostVote.query(PostVote.vote).filter_by(post_id=post_id).all()
    return render_json({"votes": sum(votes)})


def get_answer_vote_sum(answer_id):
    answer = Answer.query.filter_by(id=answer_id).first()
    if answer is None:
        return abort(404)
    votes = AnswerVote.query(AnswerVote.vote).filter_by(answer_id=answer_id).all()
    return render_json({"votes": sum(votes)})


def get_post_vote(post_id):
    current_user = g.user
    if current_user is None:
        return abort(403)

    post_votes = PostVote.query.filter_by(post_id=post_id, user_id=current_user.id).first()
    if post_votes is None:
        return abort(404)
    return render_json(post_votes.first().to_json())


def get_answer_vote(answer_id):
    current_user = g.user
    if current_user is None:
        return abort(403)

    answer_votes = AnswerVote.query.filter_by(answer_id=answer_id, user_id=current_user.id).first()
    if answer_votes is None:
        return abort(404)
    return render_json(answer_votes.first().to_json())


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

    return "Voted"


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

    # handle changing existing vote
    prev_vote = AnswerVote.query.filter_by(answer_id=answer_id, user_id=current_user.id).first()
    answer = Answer.query.filter_by(id=answer_id).first()
    if prev_vote is not None:
        prev_vote.vote = vote
        db.session.commit()
    else:
        new_vote = AnswerVote(answer_id=answer_id, vote=vote, user_id=current_user.id)
        current_user.answer_votes.append(new_vote)
        answer.votes.append(new_vote)

        db.session.add(new_vote)
        db.session.commit()

    return "Voted"
