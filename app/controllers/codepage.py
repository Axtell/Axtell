import golflang_encodings
from codecs import lookup as lookup_codec

def get_normalized_encoding(encoding):
    try:
        return lookup_codec(encoding).name
    except LookupError:
        return None

def get_codepage(encoding):
    # Normalize name
    try:
        normalized_name = lookup_codec(encoding)
    except LookupError:
        return None

    golflang_codepages = {name.lower(): codepage
                          for name, codepage in golflang_encodings.add_encodings.codepages.items()}

    if encoding.lower() in golflang_codepages:
        return golflang_codepages.get(encoding.lower())

    codepage = {}

    for byte_value in range(256):
        try:
            codepage[byte_value] = ord(bytes([byte_value]).decode(encoding))
        except LookupError:
            return None
        except UnicodeDecodeError:
            continue

    return codepage
