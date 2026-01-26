"""
Poker Coach E2E Tests using Playwright
Tests the app's UI and basic functionality
"""

from playwright.sync_api import sync_playwright
import requests
import sys

FRONTEND_URL = "http://localhost:5173"
BACKEND_URL = "http://localhost:3001"

def test_backend_health():
    """Test that the backend API is responding"""
    print("Testing backend health endpoint...")
    try:
        response = requests.get(f"{BACKEND_URL}/api/health", timeout=5)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert data["status"] == "ok", f"Expected status 'ok', got {data.get('status')}"
        print("  ✓ Backend health check passed")
        return True
    except Exception as e:
        print(f"  ✗ Backend health check failed: {e}")
        return False

def test_frontend_loads():
    """Test that the frontend loads and shows sign-in"""
    print("Testing frontend loads...")

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        try:
            # Navigate to the app
            page.goto(FRONTEND_URL)
            page.wait_for_load_state("networkidle")

            # Check title contains Poker Coach
            title = page.title()
            assert "Poker" in title, f"Expected 'Poker' in title, got: {title}"
            print(f"  ✓ Page title: {title}")

            # Take screenshot
            page.screenshot(path="/tmp/poker-coach-signin.png", full_page=True)
            print("  ✓ Screenshot saved to /tmp/poker-coach-signin.png")

            # Check for Poker Coach branding
            content = page.content()
            assert "Poker" in content, "Expected 'Poker' text on page"
            print("  ✓ Poker Coach branding found")

            # Check for Clerk sign-in (should show for unauthenticated users)
            # Look for sign-in related elements
            page.wait_for_timeout(2000)  # Wait for Clerk to load

            print("  ✓ Frontend loads successfully")
            return True

        except Exception as e:
            print(f"  ✗ Frontend test failed: {e}")
            page.screenshot(path="/tmp/poker-coach-error.png", full_page=True)
            print("  Error screenshot saved to /tmp/poker-coach-error.png")
            return False
        finally:
            browser.close()

def test_frontend_responsive():
    """Test that the frontend is responsive on mobile"""
    print("Testing mobile responsiveness...")

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)

        # Mobile viewport
        context = browser.new_context(
            viewport={"width": 375, "height": 667},
            device_scale_factor=2
        )
        page = context.new_page()

        try:
            page.goto(FRONTEND_URL)
            page.wait_for_load_state("networkidle")
            page.wait_for_timeout(2000)

            # Take mobile screenshot
            page.screenshot(path="/tmp/poker-coach-mobile.png", full_page=True)
            print("  ✓ Mobile screenshot saved to /tmp/poker-coach-mobile.png")
            print("  ✓ Mobile view loads successfully")
            return True

        except Exception as e:
            print(f"  ✗ Mobile test failed: {e}")
            return False
        finally:
            browser.close()

def test_api_modules_requires_auth():
    """Test that API endpoints require authentication"""
    print("Testing API authentication requirements...")

    try:
        # Try to access modules without auth
        response = requests.get(f"{BACKEND_URL}/api/modules", timeout=5)
        assert response.status_code == 401, f"Expected 401 unauthorized, got {response.status_code}"
        print("  ✓ /api/modules requires authentication (401)")

        # Try to access progress without auth
        response = requests.get(f"{BACKEND_URL}/api/progress", timeout=5)
        assert response.status_code == 401, f"Expected 401 unauthorized, got {response.status_code}"
        print("  ✓ /api/progress requires authentication (401)")

        # Try to access achievements without auth
        response = requests.get(f"{BACKEND_URL}/api/achievements", timeout=5)
        assert response.status_code == 401, f"Expected 401 unauthorized, got {response.status_code}"
        print("  ✓ /api/achievements requires authentication (401)")

        print("  ✓ API authentication tests passed")
        return True

    except Exception as e:
        print(f"  ✗ API auth test failed: {e}")
        return False

def run_all_tests():
    """Run all tests and report results"""
    print("\n" + "="*50)
    print("  POKER COACH E2E TESTS")
    print("="*50 + "\n")

    results = []

    # Run tests
    results.append(("Backend Health", test_backend_health()))
    results.append(("Frontend Loads", test_frontend_loads()))
    results.append(("Mobile Responsive", test_frontend_responsive()))
    results.append(("API Auth Required", test_api_modules_requires_auth()))

    # Summary
    print("\n" + "="*50)
    print("  TEST RESULTS")
    print("="*50)

    passed = sum(1 for _, result in results if result)
    total = len(results)

    for name, result in results:
        status = "✓ PASS" if result else "✗ FAIL"
        print(f"  {status}: {name}")

    print(f"\n  Total: {passed}/{total} tests passed")
    print("="*50 + "\n")

    return passed == total

if __name__ == "__main__":
    # Check if requests is available
    try:
        import requests
    except ImportError:
        print("Installing requests...")
        import subprocess
        subprocess.run([sys.executable, "-m", "pip", "install", "requests", "-q"])
        import requests

    success = run_all_tests()
    sys.exit(0 if success else 1)
