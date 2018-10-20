from app.instances.google import get_analytics
from app.instances.redis import redis_db
from math import log10
from config import auth


# The redis prefix as post views are stored in redis
POST_VIEW_PREFIX = 'post-view:'

# Time until view count is determined to be old (20 minutes)
VIEW_COUNT_REFRESH_TIME = 60 * 20

# List of factors
FACTORS = {
    3: 'K', # Thousand
    6: 'M', # Million
    9: 'B', # Billion
    12: 'T' # Trillion (just to be safe)
}


def format_view_count(views):
    """
    Formats view count into e.g. 1.1K
    """

    if views < 1000:
        return str(views)

    decimals = int(log10(views))

    # Get if 'K', 'M', 'B', etc.
    factor = 3 * int(decimals / 3)
    string_factor = FACTORS.get(factor, '?')

    if decimals % 3 == 0:
        return f'{views / 10**decimals:.1f}{string_factor}'
    else:
        return f'{views // 10**factor}{string_factor}'


def get_post_views(post_id):
    """
    Obtains view count for a post given it's ID. This caches meaning that view
    counts will not be instantly updated. Also this required Google Analytics,
    if analytics is not configured then this will return zero.
    """

    # Key in redis for post view count
    redis_key = f'{POST_VIEW_PREFIX}{post_id}'

    try:
        return int(redis_db.get(redis_key))
    except (TypeError, ValueError):
        pass

    analytics = get_analytics()
    if analytics is None:
        return 0

    view_request = analytics.reports().batchGet(body={
        "reportRequests": [
            {
                "metrics": [
                    {
                        "expression": "ga:pageviews"
                    }
                ],
                "viewId": auth['google.com']['view-id'],
                "dimensionFilterClauses": [
                    {
                        "filters": [
                            {
                                "dimensionName": "ga:pagePathLevel1",
                                "operator": "EXACT",
                                "expressions": ["/post/"]
                            },
                            {
                                "dimensionName": "ga:pagePathLevel2",
                                "expressions": [f'/{post_id}/?'],
                                "operator": "REGEXP"
                            }
                        ]
                    }
                ],
                "hideValueRanges": True
            }
        ]
    })

    view_response = view_request.execute()

    # Access value from deeply nested JSON
    try:
        api_view_count = int(view_response['reports'][0]['data']['totals'][0]['values'][0])
    except (KeyError, ValueError):
        # Gracefully handle
        api_view_count = 0

    redis_db.set(redis_key, api_view_count)
    redis_db.expire(redis_key, VIEW_COUNT_REFRESH_TIME)

    return api_view_count
