# User Management Troubleshooting Guide

## Issue: User Management Page Not Loading

### Checklist to Debug:

#### 1. **Verify Route Configuration**
The route has been updated in `App.jsx`:
- Changed from `/user-management` to `user-management` (removed leading slash for nested routes)
- Route path: `/user-management` (full URL)
- Component: `<UserManagement />`

#### 2. **Check User Authentication**
Open browser console and check:
```javascript
// In console, type:
JSON.parse(localStorage.getItem('user'))
```

Expected output should include:
```json
{
  "id": "...",
  "name": "...",
  "email": "...",
  "role": "admin"  // Must be "admin" to access
}
```

#### 3. **Verify Admin Role**
The page will automatically redirect to `/dashboard` if:
- User is not logged in
- User role is NOT "admin"
- Check console logs for: "UserManagement: Checking admin access, user role:"

#### 4. **Test the Link**
Try accessing directly:
```
http://localhost:5173/user-management
```

#### 5. **Check Browser Console**
Look for these console messages:
- "UserManagement: Rendering with user:" - Component is loading
- "UserManagement: Checking admin access, user role: admin" - Access check passing
- "UserManagement: Not admin, redirecting to dashboard" - Being redirected (not admin)

#### 6. **Verify Backend is Running**
Ensure backend is running on port 5000:
```bash
curl http://localhost:5000/api/users/stats
```

Should get 401 Unauthorized (expected without token) or proper response with token.

#### 7. **Check Network Tab**
When clicking "User Management":
- Should see requests to `/api/users/stats`
- Should see requests to `/api/users?page=1&limit=10`
- Check if getting 403 Forbidden (not admin) or 200 OK

## Quick Fixes:

### Fix 1: Ensure You're Logged in as Admin
1. Login with an admin account
2. Check localStorage: `localStorage.getItem('user')`
3. Verify role is "admin"

### Fix 2: Create Admin User
If you don't have an admin user:
```bash
# In backend terminal
mongosh
use your_database
db.users.updateOne(
  { email: "your_email@example.com" },
  { $set: { role: "admin" } }
)
```

### Fix 3: Clear Cache and Reload
1. Open DevTools
2. Right-click refresh button
3. Select "Empty Cache and Hard Reload"

### Fix 4: Check .env file
Ensure `.env` in frontend has:
```
VITE_API_URL=http://localhost:5000
```

## Debug Commands:

### Terminal 1 (Backend):
```bash
cd /workspaces/ApothecaryShop/ApothecaryShopserver
npm run dev
```

### Terminal 2 (Frontend):
```bash
cd /workspaces/ApothecaryShop/ApothecaryShopUI
npm run dev
```

## Expected Behavior:

1. **Click Profile Icon** → Dropdown opens
2. **See "User Management" link** (only if admin)
3. **Click "User Management"** → Navigate to `/user-management`
4. **Page Loads** → Shows statistics, user table, search, etc.

## If Page is Blank:

Check these in order:
1. Browser console for errors
2. Network tab for failed requests
3. User role in localStorage
4. Backend server running
5. Frontend dev server running

## Common Issues:

### Issue: Page redirects to dashboard immediately
**Cause**: User is not admin
**Fix**: Update user role to admin in database

### Issue: 403 Forbidden error
**Cause**: Backend rejects non-admin requests
**Fix**: Verify user has admin role

### Issue: Network request fails
**Cause**: Backend not running or wrong URL
**Fix**: Start backend server, check VITE_API_URL

### Issue: Component doesn't render
**Cause**: Route configuration or import issue
**Fix**: Verify import in App.jsx, check route path

## Test Script:

Open browser console on User Management page:
```javascript
// Check authentication
console.log('Token:', localStorage.getItem('token'));
console.log('User:', JSON.parse(localStorage.getItem('user')));

// Check if admin
const user = JSON.parse(localStorage.getItem('user'));
console.log('Is Admin?', user?.role === 'admin');

// Test API call
fetch('http://localhost:5000/api/users/stats', {
  headers: {
    'Authorization': localStorage.getItem('token')
  }
})
  .then(r => r.json())
  .then(d => console.log('Stats:', d))
  .catch(e => console.error('Error:', e));
```

## Files to Check:

1. **App.jsx** - Route configuration ✅
2. **Navbar.jsx** - Profile dropdown and link ✅
3. **UserManagement.jsx** - Page component ✅
4. **userService.js** - API calls ✅
5. **AuthContext.jsx** - User state management ✅

## Success Indicators:

When working correctly, you should see:
- ✅ Profile icon in navbar (circle with initial)
- ✅ Dropdown on click showing user info
- ✅ "User Management" link visible (admin only)
- ✅ Click navigates to user management page
- ✅ Statistics cards display
- ✅ User table with data
- ✅ Search and filter controls
- ✅ Create/Edit/Delete buttons

## Still Not Working?

1. Restart both servers
2. Clear all localStorage
3. Login again with admin account
4. Try direct URL: http://localhost:5173/user-management

Console logs added to UserManagement.jsx will help identify the issue!
