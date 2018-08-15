from app.helpers.SerializableEnum import SerializableEnum

class IndexStatus(SerializableEnum):
    UNINDEXED = 0
    TRANSITIONING = 1
    INDEXED = 2
    STALE = 3

