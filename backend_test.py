import requests
import sys
import json
from datetime import datetime

class BellaCucinaAPITester:
    def __init__(self, base_url="https://fast-table.preview.emergentagent.com/api"):
        self.base_url = base_url
        self.admin_token = None
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []

    def log_test(self, name, success, details=""):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name}")
        else:
            print(f"❌ {name} - {details}")
        
        self.test_results.append({
            "test": name,
            "success": success,
            "details": details
        })

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.base_url}{endpoint}"
        test_headers = {'Content-Type': 'application/json'}
        if headers:
            test_headers.update(headers)
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=test_headers)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=test_headers)
            elif method == 'PATCH':
                response = requests.patch(url, json=data, headers=test_headers)

            success = response.status_code == expected_status
            details = f"Status: {response.status_code}"
            if not success:
                details += f" (expected {expected_status})"
                try:
                    error_data = response.json()
                    if 'detail' in error_data:
                        details += f" - {error_data['detail']}"
                except:
                    pass

            self.log_test(name, success, details)
            return success, response.json() if success and response.content else {}

        except Exception as e:
            self.log_test(name, False, f"Error: {str(e)}")
            return False, {}

    def test_public_endpoints(self):
        """Test all public endpoints"""
        print("\n🔍 Testing Public Endpoints...")
        
        # Test menu endpoint
        success, menu_data = self.run_test(
            "GET /api/menu returns menu data",
            "GET", "/menu", 200
        )
        
        if success:
            # Validate menu structure
            has_items = 'items' in menu_data and len(menu_data['items']) > 0
            has_categories = 'categories' in menu_data and len(menu_data['categories']) > 0
            
            self.log_test(
                "Menu has items and categories",
                has_items and has_categories,
                f"Items: {len(menu_data.get('items', []))}, Categories: {len(menu_data.get('categories', []))}"
            )
            
            # Check for expected categories
            expected_categories = ['Pizza', 'Burgers', 'Sides', 'Drinks', 'Desserts']
            actual_categories = menu_data.get('categories', [])
            categories_match = all(cat in actual_categories for cat in expected_categories)
            
            self.log_test(
                "Menu has all 5 expected categories",
                categories_match,
                f"Expected: {expected_categories}, Got: {actual_categories}"
            )
            
            # Check total items count (should be 17)
            item_count = len(menu_data.get('items', []))
            self.log_test(
                "Menu has 17 items total",
                item_count == 17,
                f"Found {item_count} items"
            )
        
        # Test restaurant settings
        success, settings_data = self.run_test(
            "GET /api/restaurant/settings returns settings",
            "GET", "/restaurant/settings", 200
        )
        
        if success:
            # Check restaurant name
            restaurant_name = settings_data.get('restaurant_name', '')
            self.log_test(
                "Restaurant name is 'Bella Cucina'",
                restaurant_name == 'Bella Cucina',
                f"Got: '{restaurant_name}'"
            )

    def test_order_creation(self):
        """Test order creation"""
        print("\n🔍 Testing Order Creation...")
        
        # Test order creation with valid data
        order_data = {
            "items": [
                {
                    "menu_item_id": "test-item-1",
                    "name": "Test Pizza",
                    "price": 15.99,
                    "quantity": 1,
                    "add_ons": [],
                    "special_instructions": ""
                }
            ],
            "customer_name": "Test Customer",
            "customer_phone": "555-0123",
            "customer_address": "123 Test St",
            "order_type": "delivery",
            "subtotal": 15.99,
            "total": 15.99
        }
        
        success, order_response = self.run_test(
            "POST /api/orders creates an order",
            "POST", "/orders", 200, order_data
        )
        
        if success:
            # Validate order response structure
            has_id = 'id' in order_response
            has_order_number = 'order_number' in order_response
            has_status = order_response.get('status') == 'new'
            
            self.log_test(
                "Order response has correct structure",
                has_id and has_order_number and has_status,
                f"ID: {has_id}, Order#: {has_order_number}, Status: {order_response.get('status')}"
            )
            
            # Store order ID for later tests
            self.test_order_id = order_response.get('id')
            
            # Test order retrieval
            if self.test_order_id:
                success, retrieved_order = self.run_test(
                    f"GET /api/orders/{self.test_order_id} retrieves order",
                    "GET", f"/orders/{self.test_order_id}", 200
                )
        
        # Test order creation with missing data
        invalid_order = {
            "items": [],
            "customer_name": "",
            "customer_phone": "",
            "subtotal": 0,
            "total": 0
        }
        
        self.run_test(
            "POST /api/orders rejects invalid order",
            "POST", "/orders", 400, invalid_order
        )

    def test_admin_login(self):
        """Test admin authentication"""
        print("\n🔍 Testing Admin Authentication...")
        
        # Test valid login
        login_data = {
            "username": "admin",
            "password": "admin123"
        }
        
        success, login_response = self.run_test(
            "POST /api/admin/login with valid credentials",
            "POST", "/admin/login", 200, login_data
        )
        
        if success:
            # Store token for authenticated requests
            self.admin_token = login_response.get('token')
            has_token = bool(self.admin_token)
            has_username = login_response.get('username') == 'admin'
            
            self.log_test(
                "Login response contains token and username",
                has_token and has_username,
                f"Token: {bool(self.admin_token)}, Username: {login_response.get('username')}"
            )
        
        # Test invalid login
        invalid_login = {
            "username": "admin",
            "password": "wrongpassword"
        }
        
        self.run_test(
            "POST /api/admin/login rejects invalid credentials",
            "POST", "/admin/login", 401, invalid_login
        )

    def test_admin_endpoints(self):
        """Test admin-only endpoints"""
        if not self.admin_token:
            print("\n❌ Skipping admin endpoint tests - no admin token")
            return
            
        print("\n🔍 Testing Admin Endpoints...")
        
        auth_headers = {'Authorization': f'Bearer {self.admin_token}'}
        
        # Test admin orders endpoint
        success, orders_data = self.run_test(
            "GET /api/admin/orders returns orders (with auth)",
            "GET", "/admin/orders", 200, headers=auth_headers
        )
        
        if success:
            has_orders_key = 'orders' in orders_data
            self.log_test(
                "Orders response has correct structure",
                has_orders_key,
                f"Has 'orders' key: {has_orders_key}"
            )
        
        # Test admin stats endpoint
        success, stats_data = self.run_test(
            "GET /api/admin/stats returns daily stats",
            "GET", "/admin/stats", 200, headers=auth_headers
        )
        
        if success:
            expected_keys = ['total_orders', 'total_revenue', 'avg_order_value', 'pending_orders']
            has_all_keys = all(key in stats_data for key in expected_keys)
            
            self.log_test(
                "Stats response has all required fields",
                has_all_keys,
                f"Keys: {list(stats_data.keys())}"
            )
        
        # Test order status update (if we have a test order)
        if hasattr(self, 'test_order_id') and self.test_order_id:
            status_update = {"status": "accepted"}
            success, updated_order = self.run_test(
                f"PATCH /api/admin/orders/{self.test_order_id}/status updates status (with auth)",
                "PATCH", f"/admin/orders/{self.test_order_id}/status", 200, 
                status_update, auth_headers
            )
            
            if success:
                status_updated = updated_order.get('status') == 'accepted'
                self.log_test(
                    "Order status updated correctly",
                    status_updated,
                    f"Status: {updated_order.get('status')}"
                )
        
        # Test settings update
        settings_update = {"is_open": True}
        success, updated_settings = self.run_test(
            "PATCH /api/admin/settings updates settings (with auth)",
            "PATCH", "/admin/settings", 200, 
            settings_update, auth_headers
        )

    def test_unauthorized_access(self):
        """Test that admin endpoints require authentication"""
        print("\n🔍 Testing Unauthorized Access...")
        
        # Test admin endpoints without token
        self.run_test(
            "GET /api/admin/orders without auth returns 401",
            "GET", "/admin/orders", 401
        )
        
        self.run_test(
            "GET /api/admin/stats without auth returns 401",
            "GET", "/admin/stats", 401
        )

    def run_all_tests(self):
        """Run all API tests"""
        print(f"🚀 Starting Bella Cucina API Tests")
        print(f"📍 Base URL: {self.base_url}")
        print("=" * 60)
        
        # Run test suites
        self.test_public_endpoints()
        self.test_order_creation()
        self.test_admin_login()
        self.test_admin_endpoints()
        self.test_unauthorized_access()
        
        # Print summary
        print("\n" + "=" * 60)
        print(f"📊 Test Results: {self.tests_passed}/{self.tests_run} passed")
        
        if self.tests_passed == self.tests_run:
            print("🎉 All tests passed!")
            return 0
        else:
            print(f"❌ {self.tests_run - self.tests_passed} tests failed")
            return 1

def main():
    tester = BellaCucinaAPITester()
    return tester.run_all_tests()

if __name__ == "__main__":
    sys.exit(main())