from app.controllers import user

class User:
    """
    Manages a user (given its id) and will obtain data from database as
    appropriate.
    
    Note:
        No checks are done to check if `id` actually exists.
        You can also use this to create a user, if this is the case, don't call
        on any method that would otherwise result in an error.
    """
    
    def __init__(self, id, name=None):
        """
        If you don't know some of the data, don't provide it and it will be
        fetched from the database.
        
        Args:
            id (int): User id of the user
            name (:obj:`str`, optional): Name of the user if known
        """
        
        self.id = id
        self.__name = name
    
    def get name(self):
        """
        Returns the user-friendly name of the current user.
        
        Returns:
            `None` if could not obtain or the username if exists.
        """
        if self.__name is not None:
            return self.__name
        else:
            self.__get_data()
            return self.__name
            
    def __get_data(self):
        user_data = user.get_user(self.id)
        if user_data is not None:
            self.__name = user_data['username']
