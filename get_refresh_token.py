import requests
import base64

client_id = '2bebfbc8162d46608ed8cb91a0d58f32'
client_secret = '5d1990e586e94dc987925c5c888e463e'
authorization_code = 'AQB_pkAwFLXqIU1eEzeFZek3NXxRVgFgDl5QgEJ4iP8Ofh8CP5Ndnp0Pncm60ac-po6eQbgSOic40X0u81NVjob1eadHJkBhhTZwwvULCuUqSPfSzuADE6Y3F8yOuYNjchbqXQ44ziIvzRqCxrFxYXX5H2puaH21lkHD5fs1Sy8FAvMFS-t3doDFGkEJ19wGB71PF3SgNzlpEE3mXeQBjDVlKbIPI4XNl3UcvVBRUmk54LcrsEQrlGgTjw8xz_E7afPhq8EhT1p2dEHgqeAckklXG3I6NX_CjRogD8L-4YyNywOjNRDS9L3NmQtTS1dbsIKgFe96W-4oezd7kRHPDfxxHFUoG99ppMYQX1pvYIM2ASn2cKAKMRfVwxk_z1DqnnY5Pcxih2tCYZfP-NdqMacivtItFCh36AIGg6kom5D-afnTTowbQdwCE-Id12H6HhsdKyYXPARCOvjjj4u1eeak'

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
