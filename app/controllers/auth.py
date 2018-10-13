from flask import request, redirect, abort, url_for, g
from json import loads as json_loads

from jwcrypto.jwt import JWT

from app.helpers.oauth.config import oauth_config
from app.helpers.render import render_json, render_error
from app.instances import db
from app.instances.redis import redis_db
from app.jwkeys import jwkeys
from app.models.User import User, AuthTokenType, UserAuthToken
from app.models.Login import Login
from app.session import user_session
from app.helpers import oauth

from config import canonical_host, oauth as oauth_data, app as app_config
from json import loads as json_parse
import requests


def auth_hack():
    if not app_config.get('debug', False):
        return abort(404)
    user = User.query.first()
    user_session.set_session_user(user)
    g.user = user

    ip_address = getattr(request, 'access_route', [request.remote_addr])[0]
    login = Login(ip_address=ip_address, user_id=g.user.id)
    db.session.add(login)
    db.session.commit()


def get_or_set_user(auth_token=None, profile={}):
    """
    This will take an auth object and login the user. If the user does not
    exist, it will save (persist) the auth and create a new account using the
    profile details.
    """

    if auth_token:
        existing_auth_token = UserAuthToken.query.\
            filter_by(
                auth_method=auth_token.auth_method,
                identity=auth_token.identity,
                issuer=auth_token.issuer
            ).first()
    else:
        return abort(500)

    user = None
    if existing_auth_token:
        # This means the user exists
        user = existing_auth_token.user
    else:
        # This means the user does not exist and we must create it.
        name = profile.get('name')
        email = profile.get('email')

        # Make sure we have both fields or return missing error
        if not name:
            return render_error("Profile does not have name", error_type='bad_profile'), 400

        user = User(name=name, email=email, avatar=profile.get('avatar'))

        user.auth_tokens.append(auth_token)

        db.session.add(user)
        db.session.commit()

    user_session.set_session_user(user)
    g.user = user

    ip_address = getattr(request, 'access_route', [request.remote_addr])[0]
    login = Login(ip_address=ip_address, user_id=g.user.id)
    db.session.add(login)
    db.session.commit()


def set_user_oauth(code, provider, client_side=False):
    """
    Logs in an OAuth redirect request given the `provider` describing the type
    """

    oauth_provider = oauth_config.get(provider, None)
    if oauth_provider is None:
        return abort(400)

    oauth_callback = oauth_provider.get('token')
    oauth_login = oauth_provider.get('auth')
    oauth_provider_identifier = provider

    oauth_id = oauth_data.get(oauth_provider_identifier).get('client-id')
    oauth_secret = oauth_data.get(oauth_provider_identifier).get('client-secret')

    try:
        # Get the auth key. By polling the provider we both validate
        # the login request and now are able to submit requests as
        # users of the provider.
        auth_key = requests.post(
            oauth_callback,
            data={
                'code': code,
                'redirect_uri': canonical_host + url_for('auth_login_oauth'),
                'client_id': oauth_id,
                'client_secret': oauth_secret
            },
            headers={
                'Accept': 'application/json'
            }
        ).json().get('access_token', '')
    except:
        # Errors mean we couldn't get access key
        return render_error('Could not obtain OAuth access token.'), 403

    # If we're client-side we'll stop here
    if client_side:
        return auth_key

    try:
        # Get identity key, this is something that allows us
        # to uniquely identify the user
        oauth_identity, profile = oauth_login(auth_key)
    except:
        # If we get here that means we could not get profile
        # this is our fault since we validated
        return render_error('Could not obtain OAuth profile.'), 500

    if 'identifier' not in profile:
        return render_error('Could not obtain identifier'), 400

    # Model instance for the token
    # Links together the provider, provider's ID, and our user ID
    token = UserAuthToken(
        auth_method=AuthTokenType.OAUTH,
        issuer=oauth_provider_identifier,
        identity=oauth_identity,
        identifier=profile.get('identifier')
    )

    return get_or_set_user(auth_token=token, profile=profile)


def set_user_jwt(auth_key, profile):
    """
    Logs in (or signs up) a new user given its JWT and a default profile
    """

    # Load the most current keys from Redis
    jwkeys.import_keyset(redis_db.get('jwkeys'))

    try:
        jwt = JWT(jwt=auth_key, key=jwkeys)
        claims = json_loads(jwt.claims)
    except:
        # This is called if the authorization failed (auth key has been forged)
        # We don't really care about providing malicious requests with debug
        # info so this is just a really basic error message
        return render_error('rejected.'), 403

    # JWT has a couple of fields (claims) that we care about:
    #  - iss: Issuer - Basically provider of open id (google, SE, etc.)
    #  - sub: Subject - Who is auth'd by this.
    # Together we will use these to store an auth method.
    issuer = claims.get('iss')
    subject = claims.get('sub')

    # Error handle against malformed keys. This should never really happen and
    # the error is not shown to the user so doesn't need to be user-friendly
    if not issuer or not subject:
        return render_error('malformed. Missing iss or sub'), 400

    if 'identifier' not in profile:
        return render_error('malformed. Missing identifier'), 400

    # If we are here that means we have validated a valid login attempt. Now we
    # will delegate to another method
    token = UserAuthToken(
        auth_method=AuthTokenType.JWT,
        identity=subject,
        issuer=issuer,
        identifier=profile.get('identifier')
    )

    return get_or_set_user(auth_token=token, profile=profile)


def get_auth_methods(user):
    auth_tokens = UserAuthToken.query.filter_by(user=user)

    return [token.to_json() for token in auth_tokens]
