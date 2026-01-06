# Chat System Testing Guide

## Quick Verification Steps

### Step 1: Verify Backend is Running
```powershell
# Check if Node processes are running
Get-Process | Where-Object {$_.ProcessName -like "*node*"}
```

Expected: See multiple node processes (backend API, frontend dev server)

### Step 2: Test API Endpoint Directly
```powershell
# Test without token (should return 401, not 403)
$response = Invoke-RestMethod -Uri "http://localhost:8000/api/v1/users" -Method Get -ErrorAction SilentlyContinue
```

Expected response:
```
Status Code: 401
Error: "You are not login, Please login to get access this route"
```

❌ If you see 403: The fix wasn't applied correctly
✅ If you see 401: Fix is working!

### Step 3: Test with Browser Developer Tools
1. Open chat in browser
2. Open Developer Tools (F12)
3. Go to Network tab
4. Click "+" to create new chat
5. Type a user name in search box
6. Look for request to `/api/v1/users?keyword=...`

Expected:
- ✅ Status: 200 OK (when logged in with valid token)
- ✅ Response: Array of user objects with name, profileImg, role
- ❌ Status: 403 Forbidden (means fix not applied)
- ❌ Status: 401 Unauthorized (means token not being sent or expired)

### Step 4: Check Console for Errors
If search doesn't work:
1. Press F12 to open Developer Tools
2. Go to Console tab
3. Look for error messages like:
   - "Failed to search users:" - API error
   - "Unexpected token" - Response parsing error
   - "Authorization" errors - Token/permission issues

## Common Issues and Solutions

### Issue: Still Getting 403 Forbidden
**Solution**: Make sure the file was modified correctly
```javascript
// Check this in userRoute.js line 40-55:
router.use(authService.protect);
router.get('/', getUsers);  // This MUST be before the next line!
router.use(authService.allowedTo('admin', 'manager'));
```

### Issue: Getting 401 Unauthorized
**Possible causes**:
1. Token not stored in localStorage
2. Token expired (need to login again)
3. Wrong token key name

**Check**:
```javascript
// In browser console:
localStorage.getItem('token')  // Should return a long JWT string
localStorage.getItem('userId')  // Should return a user ID
```

### Issue: Search returns empty results
**Possible causes**:
1. No users in database with that name
2. Search query doesn't match any user names
3. User is searching for themselves (filtered out)

**Solution**:
- Try searching for common names like "admin"
- Add test users if database is empty
- Check user names in MongoDB

### Issue: Creating conversation fails
**Possible causes**:
1. User selected themselves (filtered out)
2. Conversation already exists (should open instead)
3. Backend error creating conversation

**Check**: Look in Network tab for POST to `/api/v1/chat/conversations` and check response error message

## Server Restart Guide

If changes aren't reflecting:

### Backend Server
```bash
# In terminal at: d:\Programing\AVinarcenter\udemy-build-ecommerce-api-using-nodejs-master\

# Stop current server (Ctrl+C)
# Then restart:
npm start
```

### Frontend Server
```bash
# In terminal at: d:\Programing\AVinarcenter\

# Stop current server (Ctrl+C)
# Then restart:
npm run dev
```

### Verify Services are Running
```bash
# Backend should show:
# [nodemon] app crashed - waiting for file changes before starting...
# Then [nodemon] restarting due to changes
# Then Server running on port 8000

# Frontend should show:
#  VITE v... ready in XXX ms
#  ➜  Local:   http://localhost:5173/
```

## File Locations Reference

- **Backend Routes**: `udemy-build-ecommerce-api-using-nodejs-master/routes/userRoute.js`
- **Chat Component**: `src/components/chat/ChatDashboardWidget.tsx`
- **Backend Config**: `udemy-build-ecommerce-api-using-nodejs-master/config.env`
- **Frontend Config**: `src/config/env.ts`
- **API Base**: `http://localhost:8000/api/v1`

## MongoDB Query Reference

If you need to check users in database:

```javascript
// In MongoDB shell or compass
db.users.find({}, {name: 1, role: 1, email: 1})

// To see if users exist with names you're searching for
db.users.find({name: /admin/i})  // Case-insensitive search for "admin"
```

## Performance Tips

### Reduce Load Times
1. API search has 300ms debounce built in
2. Paginated results (50 per page by default)
3. Only fetch unread conversations by default

### Check Network Performance
In DevTools Network tab:
- Search requests should take < 200ms
- Message fetch < 500ms
- Message send < 100ms

If slower:
- Check internet connection
- Check database performance
- Verify backend server is not overloaded

## Success Indicators

✅ Chat system is working correctly when:
1. User search returns results (no 403 error)
2. Can create new conversations with users
3. Can send and receive messages
4. Can create admin support conversations
5. Message reactions and edits work
6. Read receipts show up correctly
7. No console errors about authorization

## Emergency Restart Commands

If everything seems broken:

```powershell
# Kill all Node processes
Get-Process node | Stop-Process -Force

# Clear npm cache
npm cache clean --force

# Reinstall dependencies
npm install

# Restart backend
cd udemy-build-ecommerce-api-using-nodejs-master
npm install
npm start

# In separate terminal, restart frontend
cd .. (back to root)
npm run dev
```

---

## Key Files Modified in This Fix

1. `/routes/userRoute.js` - Reorganized middleware to allow authenticated users to search
2. `/src/components/chat/ChatDashboardWidget.tsx` - Already had correct implementation
3. `/src/config/env.ts` - Configuration correct, no changes needed

**Total changes**: 1 file modified (userRoute.js)
**Impact**: High - Fixes the core 403 Forbidden issue
**Breaking changes**: None - only fixes permissions
