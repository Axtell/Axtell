from enum import Enum

class SerializableEnum(Enum):
    @classmethod
    def to_json(cls):
        return {name: member.value for name, member in cls.__members__.items()}
