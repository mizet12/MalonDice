import requests
import base64

client_id = '2bebfbc8162d46608ed8cb91a0d58f32'
client_secret = '5d1990e586e94dc987925c5c888e463e'
authorization_code = 'AQCIfWWQTo3-CC9wvTOu2_RllRIhF5MJCDtSgmFoqMv5Z4vmV_0JZilTWd3X6P6SaL-fL4zUorZNRXJTFNIKmKNgR1N68sfb10InVEWA6RRRp0AqAKErPn8Clem0Ar4AtDFeYmaSCZ3BgnkUWNWcwLr9ClZu2VSKlwweQpvhlIx0Ck9HJldTmHgs2QAW140yvy_sg5H_MEgsrsm1Y5imQL0LPw1436OcoaGY3W4PK9jNsJo1uPnTDTeX0q-vo_Ur390XEZPMZ00Y-1McGvC2Kfy7k0zI9Y1O1ss'

auth_string = f"{client_id}:{client_secret}"
auth_bytes = auth_string.encode('ascii')
auth_base64 = base64.b64encode(auth_bytes).decode('ascii')

headers = {
    'Authorization': f'Basic {auth_base64}',
}

data = {
    'grant_type': 'authorization_code',
    'code': authorization_code,
    'redirect_uri': 'http://localhost:8888/callback',
}

response = requests.post('https://accounts.spotify.com/api/token', headers=headers, data=data)

if response.status_code == 200:
    print(response.json())
else:
    print(f"Failed to get token: {response.status_code}")
    print(response.json())
