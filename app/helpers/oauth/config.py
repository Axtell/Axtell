from app.helpers.oauth import profiles

oauth_config = {
    'stackexchange.com': {
        'authorize': 'https://stackexchange.com/oauth',
        'token': 'https://stackexchange.com/oauth/access_token/json',
        'auth': profiles.stackexchange,
        'scopes': []
    },
    'google.com': {
        'authorize': 'https://accounts.google.com/o/oauth2/v2/auth',
        'token': 'https://www.googleapis.com/oauth2/v4/token',
        'auth': profiles.google,
        'scopes': ['email', 'profile']
    },
    'github.com': {
        'authorize': 'https://github.com/login/oauth/authorize',
        'token': 'https://github.com/login/oauth/access_token',
        'auth': profiles.github,
        'scopes': ['read:user', 'user:email']
    }
}


