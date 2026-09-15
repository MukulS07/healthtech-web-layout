# Admin signup with authenticator-app 2FA

This adds Google-Authenticator-style 2FA to your admin accounts using TOTP
(Time-based One-Time Password) — the same standard used by Google, GitHub,
AWS, etc.

## Flow

1. **Signup**: admin enters name/email/password → account is created → server
   generates a secret + QR code.
2. **Verify**: admin scans the QR code in an authenticator app (Google
   Authenticator, Authy, 1Password...), then types the 6-digit code shown to
   confirm it worked. Only now is 2FA marked "enabled."
3. **Login**: every future admin login requires password **and** the current
   6-digit code from the app.

## 1. Install dependencies

```bash
npm install otplib qrcode
npm install -D @types/qrcode
```

## 2. Copy files into your project

```
lib/totp.ts                      -> src/lib/totp.ts
server-functions/admin-auth.ts   -> src/lib/server-functions/admin-auth.ts
components/AdminSignup.tsx       -> src/components/auth/AdminSignup.tsx
components/AdminLogin.tsx        -> src/components/auth/AdminLogin.tsx
```

## 3. Update your User model

Open `src/models/User.ts` and merge in the fields from `models/User.patch.ts`
(`totpSecret`, `totpEnabled`, and `role` if you don't already have it).

## 4. Wire up admin-auth.ts to your real auth helpers

`server-functions/admin-auth.ts` imports `hashPassword`, `verifyPassword`,
and `createSession` from `~/lib/auth` — rename these to whatever your
existing `src/lib/auth.ts` actually exports. Your project already does
scrypt hashing + session cookies for patients, so admin login should reuse
that same session/cookie logic for consistency.

## 5. Add the signup route

Somewhere only you (or your first admin) can reach — don't leave a public
"become an admin" page live. Options:
- A one-time route you delete after creating your first admin
- Gate `/admin/signup` behind an invite code or an existing super-admin
  session before it renders `<AdminSignup />`

```tsx
// src/routes/admin/signup.tsx
import { createFileRoute } from "@tanstack/react-router";
import { AdminSignup } from "~/components/auth/AdminSignup";

export const Route = createFileRoute("/admin/signup")({
  component: () => <AdminSignup />,
});
```

## 6. Swap the Admin Access tab

In `AuthPanel.tsx`, replace the current Admin Access tab's login form with
`<AdminLogin />` so it asks for the authenticator code too.

## Notes

- `totpSecret` is stored with `select: false` so it's never accidentally
  returned from normal queries — only pulled in with `.select("+totpSecret")`
  where needed.
- Styling in the components uses plain Tailwind classes to match your
  project's Tailwind v4 setup — adjust to your actual class names/UI kit
  (shadcn `<Input>`/`<Button>` etc.) if you want it to match the rest of
  `AuthPanel.tsx`.
- Consider rate-limiting `adminLogin` and `confirmAdminTotp` since they're
  guessable-code endpoints.
