from config import user_list
from flask import g

from app.helpers.render import render_json, render_error
from app.models.User import User
from app.instances import db


def get_my_profile():
    """
    Returns the logged in user's profile or a JSON with `unauthorized: true`
    """
    if isinstance(g.user, User):
        return render_json(g.user.to_json(own=True))
    else:
        return render_json({'unauthorized': True})


def get_profile(user_id):
    """
    Returns a user's user_id
    """
    user = User.query.filter_by(id=user_id).first()

    if user is None:
        return render_error('user not found'), 400
    else:
        return render_json(user.to_json(bio=True))


def get_followers(user_id, page):
    user = User.query.filter_by(id=user_id).first()

    if not isinstance(user, User):
        return render_error('Nonexistent ID'), 404

    followers = user.followers.filter_by(following_public=True).paginate(page, user_list['page_len'], error_out=False)

    return render_json({
        'data': [follower.to_json(current_user=g.user) for follower in followers.items],
        'are_more': followers.has_next
    })


def get_following(user_id, page):
    user = User.query.filter_by(id=user_id).first()

    if not isinstance(user, User):
        return render_error('Nonexistent ID'), 404

    if not user.following_public:
        return render_error('Forbidden'), 403

    following = user.following.filter_by().paginate(page, user_list['page_len'], error_out=False)

    return render_json({
        'data': [follower.to_json(current_user=g.user) for follower in following.items],
        'are_more': following.has_next
    })


def follow(source_user_id, target_user_id):
    """
    Makes 1st param follow the 2nd param
    """
    if source_user_id == target_user_id:
        return render_error('cannot follow oneself'), 400

    source_user = User.query.filter_by(id=source_user_id).first()
    target_user = User.query.filter_by(id=target_user_id).first()

    if not isinstance(g.user, User):
        return render_error('Unauthorized'), 401

    if source_user is None or target_user is None:
        return render_error('source user or target user doesn\'t exist'), 400

    if source_user.id != g.user.id:
        return render_error('Forbidden'), 403

    source_user.follow(target_user)
    db.session.commit()

    return render_json({ 'following': True })


def unfollow(source_user_id, target_user_id):
    """
    Makes 1st param unfollow the 2nd param
    """
    if source_user_id == target_user_id:
        return render_error('cannot follow oneself'), 400

    source_user = User.query.filter_by(id=source_user_id).first()
    target_user = User.query.filter_by(id=target_user_id).first()

    if not isinstance(g.user, User):
        return render_error('Unauthorized'), 401

    if source_user is None or target_user is None:
        return render_error('source user or target user doesn\'t exist'), 400

    if source_user.id != g.user.id:
        return render_error('Forbidden'), 403

    source_user.unfollow(target_user)
    db.session.commit()

    return render_json({ 'following': False })
