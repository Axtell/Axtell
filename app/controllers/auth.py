from app.helpers.render import render_json, render_error
from app.models.User import User, UserJWTToken
from app.session import user_session
from app.instances.db import db

from json import loads as json_loads
from app.jwkeys import jwkeys
from jwcrypto.jwt import JWT

def get_or_set_user(jwt_token, profile):
    """
    This will take an auth object and login the user. If the user does not
    exist, it will save (persist) the auth and create a new account using the
    profile details.
    """
    token = UserJWTToken.query.filter_by(identity=jwt_token.identity, issuer=jwt_token.issuer).first()
    
    user = None
    if token is not None:
        # This means the user exists
        user = token.user
    else:
        # This means the user does not exist and we must create it.
        name = profile.get('name')
        email = profile.get('email')
        
        # Make sure we have both fields or return missing error
        if not name or not email:
            return render_error("Profile does not have name and email", type='bad_profile')
        
        user = User(name=name, email=email)
        user.jwt_tokens.append(jwt_token)
        
        db.session.add(user)
        db.session.commit()
    
    user_session.set_session_user(user)
    return render_json({ 'user_id': user.id })

def set_user_jwt(authKey, profile):
    """
    Logs in (or signs up) a new user given its JWT and a default profile
    """
    try:
        jwt = JWT(jwt=authKey, key=jwkeys)
        claims = json_loads(jwt.claims)
    except:
        # This is called if the authorization failed (auth key has been forged)
        # We don't really care about providing malicious requests with debug
        # info so this is just a really basic error message
        return render_error('rejected.')

    # JWT has a couple of fields (claims) that we care about:
    #  - iss: Issuer - Basically provider of open id (google, SE, etc.)
    #  - sub: Subject - Who is auth'd by this.
    # Together we will use these to store an auth method.
    issuer = claims.get('iss')
    subject = claims.get('sub')
    
    # Error handle against malformed keys. This should never really happen and
    # the error is not shown to the user so doesn't need to be user-friendly
    if not issuer or not subject:
        return render_error('malformed. Missing iss or sub')
    
    # If we are here that means we have validated a valid login attempt. Now we
    # will delegate to another method
    token = UserJWTToken(identity=subject, issuer=issuer)
    return get_or_set_user(jwt_token=token, profile=profile)
