from app.models.User import User, UserToken
from app.helpers.render import render_json, render_error
from app.session import user_session

from json import loads as json_loads
from app.keys.jwkeys import jwkeys
from jwcrypto.jwt import JWT

def get_or_set_user(user_id, auth, profile):
    """
    This will take an auth db entry and login the user. Otherwise, it will
    create a new user
    """
    
    matched_auth =

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
    # user = get_or_set_user()
