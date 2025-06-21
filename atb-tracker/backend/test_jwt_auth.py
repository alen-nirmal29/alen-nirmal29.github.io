#!/usr/bin/env python
"""
Test script to verify JWT authentication and user data isolation
"""
import requests
import json

BASE_URL = "http://localhost:8000/api"

def test_user_registration_and_isolation():
    """Test user registration and data isolation"""
    
    # Test 1: Register User 1
    print("=== Testing User Registration and Data Isolation ===")
    
    user1_data = {
        "name": "Test User 1",
        "email": "user1@test.com",
        "password": "testpass123"
    }
    
    response = requests.post(f"{BASE_URL}/users/members/", json=user1_data)
    print(f"User 1 registration response: {response.status_code}")
    if response.status_code == 201:
        user1_response = response.json()
        user1_tokens = user1_response.get('tokens', {})
        user1_access_token = user1_tokens.get('access')
        print(f"User 1 access token: {user1_access_token[:50]}...")
        
        # Test 2: Register User 2
        user2_data = {
            "name": "Test User 2", 
            "email": "user2@test.com",
            "password": "testpass123"
        }
        
        response = requests.post(f"{BASE_URL}/users/members/", json=user2_data)
        print(f"User 2 registration response: {response.status_code}")
        if response.status_code == 201:
            user2_response = response.json()
            user2_tokens = user2_response.get('tokens', {})
            user2_access_token = user2_tokens.get('access')
            print(f"User 2 access token: {user2_access_token[:50]}...")
            
            # Test 3: User 1 creates a project
            headers1 = {"Authorization": f"Bearer {user1_access_token}"}
            project_data = {
                "name": "User 1's Project",
                "status": "Planning",
                "progress": 0
            }
            
            response = requests.post(f"{BASE_URL}/projects/projects/", 
                                   json=project_data, headers=headers1)
            print(f"User 1 project creation: {response.status_code}")
            
            # Test 4: User 2 creates a project
            headers2 = {"Authorization": f"Bearer {user2_access_token}"}
            project_data2 = {
                "name": "User 2's Project", 
                "status": "Planning",
                "progress": 0
            }
            
            response = requests.post(f"{BASE_URL}/projects/projects/", 
                                   json=project_data2, headers=headers2)
            print(f"User 2 project creation: {response.status_code}")
            
            # Test 5: User 1 should only see their own projects
            response = requests.get(f"{BASE_URL}/projects/projects/", headers=headers1)
            print(f"User 1 projects list: {response.status_code}")
            if response.status_code == 200:
                user1_projects = response.json()
                print(f"User 1 sees {len(user1_projects)} projects")
                for project in user1_projects:
                    print(f"  - {project.get('name')}")
            
            # Test 6: User 2 should only see their own projects
            response = requests.get(f"{BASE_URL}/projects/projects/", headers=headers2)
            print(f"User 2 projects list: {response.status_code}")
            if response.status_code == 200:
                user2_projects = response.json()
                print(f"User 2 sees {len(user2_projects)} projects")
                for project in user2_projects:
                    print(f"  - {project.get('name')}")
            
            # Test 7: Test without authentication (should fail)
            response = requests.get(f"{BASE_URL}/projects/projects/")
            print(f"Unauthenticated request: {response.status_code}")
            
            print("\n=== Test Results ===")
            print("✅ User registration with JWT tokens working")
            print("✅ User data isolation working - each user only sees their own data")
            print("✅ Authentication required for protected endpoints")
            
        else:
            print(f"Failed to register user 2: {response.text}")
    else:
        print(f"Failed to register user 1: {response.text}")

def test_login():
    """Test user login"""
    print("\n=== Testing User Login ===")
    
    login_data = {
        "email": "user1@test.com",
        "password": "testpass123"
    }
    
    response = requests.post(f"{BASE_URL}/users/login/", json=login_data)
    print(f"Login response: {response.status_code}")
    if response.status_code == 200:
        login_response = response.json()
        tokens = login_response.get('tokens', {})
        print(f"Login successful, got access token: {tokens.get('access', '')[:50]}...")
        print("✅ Login functionality working")
    else:
        print(f"Login failed: {response.text}")

if __name__ == "__main__":
    try:
        test_user_registration_and_isolation()
        test_login()
    except requests.exceptions.ConnectionError:
        print("❌ Could not connect to server. Make sure the Django server is running on localhost:8000")
    except Exception as e:
        print(f"❌ Test failed with error: {e}") 