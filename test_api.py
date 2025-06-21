import requests
import json

# Test API endpoints
BASE_URL = "http://localhost:8000/api"

def test_projects_api():
    print("Testing Projects API...")
    
    # Test GET projects
    try:
        response = requests.get(f"{BASE_URL}/projects/")
        print(f"GET /projects/ - Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"Projects found: {len(data)}")
            for project in data:
                print(f"  - {project.get('name', 'No name')} (ID: {project.get('id', 'No ID')})")
        else:
            print(f"Error: {response.text}")
    except Exception as e:
        print(f"Error testing GET /projects/: {e}")
    
    print("\n" + "="*50 + "\n")

if __name__ == "__main__":
    test_projects_api() 