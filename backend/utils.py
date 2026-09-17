import hashlib

def hash_7_chars(url: str) -> str:
    hash_bytes = hashlib.sha256(url.encode('utf-8')).digest()
    hash_int = int.from_bytes(hash_bytes, 'big')
    
    chars = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"
    result = ""
    while len(result) < 7:
        hash_int, rest = divmod(hash_int, 62)
        result += chars[rest]
    
    return result[:7]