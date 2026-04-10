#!/usr/bin/env python3
import json
try:
    import urllib.request
    response = urllib.request.urlopen('http://localhost:8080/api/stats')
    data = json.loads(response.read())
    print(json.dumps(data, indent=2))
except Exception as e:
    print(f"Error: {e}")
