from hashlib import md5

def gravatar(email, size=128, rating='g', default='identicon', force_default=False):
    hashemail = md5(email.encode('utf-8')).hexdigest()

    link = "https://secure.gravatar.com/avatar/{hashemail}?s={size}&d={default}&r={rating}".format(
        hashemail=hashemail, size=size,
        default=default, rating=rating)

    if force_default:
        link += "&f=y"

    return link
