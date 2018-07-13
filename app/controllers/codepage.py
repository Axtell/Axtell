import golflang_encodings


def get_codepage(encoding):
    if encoding in ['utf-8', 'u8', 'utf', 'utf8', 'utf-16', 'u16', 'utf16']:
        return None
    
    golflang_codepages = {name.lower(): codepage
                          for name, codepage in golflang_encodings.add_encodings.codepages.items()}

    if encoding.lower() in golflang_codepages:
        return golflang_codepages.get(encoding.lower())

    codepage = {}

    for byte_value in range(256):
        try:
            codepage[byte_value] = bytes([byte_value]).decode(encoding)
        except LookupError:
            return None
        except UnicodeDecodeError:
            continue

    return codepage
