# Emergent Google Auth Testing Playbook — صاحب يلا Admin

## Admin allowlist
- Only email permitted: **mortadagzar@gmail.com**
- Anyone else signing in with Google must receive HTTP 403 "Access denied".

## Step 1 — Create test user + session manually (MongoDB)
```bash
mongosh --eval "
use('yallai');
const userId = 'test-user-' + Date.now();
const sessionToken = 'test_session_' + Date.now();
db.users.insertOne({
  user_id: userId,
  email: 'mortadagzar@gmail.com',
  name: 'Test Admin',
  picture: '',
  is_admin: true,
  created_at: new Date()
});
db.user_sessions.insertOne({
  user_id: userId,
  session_token: sessionToken,
  expires_at: new Date(Date.now() + 7*24*60*60*1000),
  created_at: new Date()
});
print('Session token: ' + sessionToken);
"
```

## Step 2 — Backend curl tests
```bash
API=https://<preview-host>
# /auth/me (expects 200 + user)
curl -X GET "$API/api/auth/me" -H "Authorization: Bearer $SESSION_TOKEN"
# admin overview (expects 200 only for mortadagzar@gmail.com)
curl -X GET "$API/api/admin/overview" -H "Authorization: Bearer $SESSION_TOKEN"
# shares list
curl -X GET "$API/api/admin/shares?limit=20" -H "Authorization: Bearer $SESSION_TOKEN"
# logout
curl -X POST "$API/api/auth/logout" -H "Authorization: Bearer $SESSION_TOKEN"
```

## Step 3 — Playwright: cookie-injection test
```python
await page.context.add_cookies([{
    "name": "session_token",
    "value": "<SESSION_TOKEN>",
    "domain": "<preview-host>",
    "path": "/",
    "httpOnly": True,
    "secure": True,
    "sameSite": "None"
}])
await page.goto("<preview-host>/admin")
# /admin should load dashboard without redirecting to /login
```

## Failure signals
- ❌ `/api/auth/me` → 401 even with valid token in DB (check Mongo `_id` projection, timezone-aware expiry)
- ❌ `/admin` redirects to `/login` even with cookie (check `credentials: "include"` on fetches, SameSite on cookie)
- ❌ `/admin/*` opens for non-admin Google account (check the email allowlist in `require_admin`)

## Checklist
- [ ] `users` doc uses custom `user_id` UUID field, always query with `{"_id": 0}`
- [ ] `user_sessions.expires_at` is stored timezone-aware and compared timezone-aware
- [ ] Cookie set with `path="/"`, `httponly=True`, `secure=True`, `samesite="none"`
- [ ] `require_admin` dependency checks `user.email == "mortadagzar@gmail.com"`
- [ ] Frontend: admin page detects `#session_id=` synchronously during render (not inside useEffect)
- [ ] Frontend: all admin fetches pass `credentials: "include"`
