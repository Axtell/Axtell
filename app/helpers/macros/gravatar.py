from hashlib import md5
import random


def gravatar(email, size=128, rating='g', default='identicon', force_default=False):
    if email is None:
        email_bytes = bytes([random.randint(0, 255) for _ in range(256)])
    else:
        email_bytes = email.encode('utf-8')
    hashemail = md5(email_bytes).hexdigest()

    link = "https://secure.gravatar.com/avatar/{hashemail}?s={size}&d={default}&r={rating}".format(
        hashemail=hashemail, size=size,
        default=default, rating=rating)

    if force_default:
        link += "&f=y"

    return link
