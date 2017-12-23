from secrets import token_hex

def rand_key():
    return 'i' + token_hex(16)
