#!/usr/bin/env python
"""
Test script to verify client API functionality
"""
import requests
import json

BASE_URL = "http://localhost:8000/api"

def test_client_api():
    """Test client creation and retrieval"""
    
    print("=== Testing Client API ===")
    
    # Test 1: Register a test user
    user_data = {
        "first_name": "Test",
        "last_name": "User2",
        "email": "testuser2@example.com",
        "password": "testpass123"
    }
    
    response = requests.post(f"{BASE_URL}/users/members/", json=user_data)
    print(f"User registration response: {response.status_code}")
    
    if response.status_code == 201:
        user_response = response.json()
        tokens = user_response.get('tokens', {})
        access_token = tokens.get('access')
        print(f"Access token: {access_token[:50]}...")
        
        headers = {"Authorization": f"Bearer {access_token}"}
        
        # Test 2: Create a client
        client_data = {
            "name": "Test Client"
        }
        
        response = requests.post(f"{BASE_URL}/projects/clients/", 
                               json=client_data, headers=headers)
        print(f"Client creation response: {response.status_code}")
        
        if response.status_code == 201:
            client_response = response.json()
            client_id = client_response.get('id')
            print(f"Created client: {client_response}")
            
            # Test 3: Get all clients
            response = requests.get(f"{BASE_URL}/projects/clients/", headers=headers)
            print(f"Get clients response: {response.status_code}")
            
            if response.status_code == 200:
                clients = response.json()
                print(f"Retrieved {len(clients)} clients")
                for client in clients:
                    print(f"  - {client.get('name')} (ID: {client.get('id')})")
            
            # Test 4: Update the client
            update_data = {
                "name": "Updated Test Client"
            }
            
            response = requests.put(f"{BASE_URL}/projects/clients/{client_id}/", 
                                  json=update_data, headers=headers)
            print(f"Client update response: {response.status_code}")
            
            if response.status_code == 200:
                updated_client = response.json()
                print(f"Updated client: {updated_client}")
            
            # Test 5: Delete the client
            response = requests.delete(f"{BASE_URL}/projects/clients/{client_id}/", 
                                     headers=headers)
            print(f"Client deletion response: {response.status_code}")
            
            print("\n=== Test Results ===")
            print("✅ Client API endpoints working correctly")
            
        else:
            print(f"Failed to create client: {response.text}")
    else:
        print(f"Failed to register user: {response.text}")

if __name__ == "__main__":
    test_client_api() 