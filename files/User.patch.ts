// PATCH for src/models/User.ts
// ---------------------------------------------------------
// Add these fields to your existing User schema. Don't replace the
// whole file — just merge these into your current schema definition.

/*
  totpSecret: {
    type: String,
    default: null,
    select: false,      // never return this field by default in queries
  },
  totpEnabled: {
    type: Boolean,
    default: false,
  },
  role: {
    type: String,
    enum: ["patient", "admin"],
    default: "patient",
  },
*/

// If your User model doesn't already have a `role` field distinguishing
// admins from patients, add it too (shown above) — the admin signup flow
// below assumes `role: "admin"` marks an account as an admin.

// Reminder: because `totpSecret` uses `select: false`, any query that
// needs it (like verifying a login code) must explicitly request it:
//   User.findById(id).select("+totpSecret")
