import base64

def validate_by_base64(username, password):
    decoded_name_bytes = base64.b64decode(username)
    decoded_name = decoded_name_bytes .decode('ascii')
    
    decoded_pwd_bytes = base64.b64decode(password)
    decoded_pwd = decoded_pwd_bytes .decode('ascii')

    if decoded_name == 'guru_back_server' and decoded_pwd == 'back!Password123!':
        return True
    return False
