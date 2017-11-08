import os

__all__ = []


# This seems like a hack but it doesn't work with the default __all__ and this way this file doesn't
# Need to be updated for each new route module.
for i in os.listdir('./app/routes'):
    if i != '__init__.py' and i.endswith('.py'):
        __all__.append(i[0:-3])
