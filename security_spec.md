# Security Specification: Amanhecer com Deus (SIB Jardim Tropical)

This document outlines the attribute-based access control (ABAC) invariants, security payloads, and verification patterns designed for the Devotional application backend on Firebase.

## 1. Data Invariants

Our database has two primary collections:
1. `/devotionals/{dayId}`:
   - Holds the daily devotions (keys `1` to `365`).
   - Read access is **public** so church members can read of the day without mandatory login friction.
   - Write access (Create, Update, Delete) is strictly restricted to **authenticated Administrators (Pastors)**.
2. `/admins/{adminUid}`:
   - Holds authorized admin user records.
   - Read access is restricted to authenticated users checking their own membership or looking up privileges.
   - Write access is closed on the client-side (managed by server bootstrap or manual database console configurations).

## 2. The "Dirty Dozen" Invalidation Payloads (Audit TDD)

These payloads must always result in a `PERMISSION_DENIED` rejection:

1. **Unauthenticated Write**: An anonymous user attempts to write/edit a devotional to `/devotionals/15`.
2. **Standard User Write**: A signed-in user who is *not* an admin attempts to update `/devotionals/32`.
3. **Privilege Escalation**: A standard user tries to register themselves in the admin list by creating `/admins/{userUid}` with `{ role: 'pastor' }`.
4. **Invalid Devotional ID**: An admin attempts to update `/devotionals/999` (day limit exceeded) or `/devotionals/-5`.
5. **ID Poisoning Attack**: An admin or attacker attempts to write to `/devotionals/someLongXSSPayloadStringContainingJunk`.
6. **Shadow Update Gate bypass**: An admin tries to add random data fields like `{ isHackApproved: true }` to `/devotionals/10`.
7. **Type Violations**: An admin tries to write `day` as a string instead of an integer.
8. **Missing Mandatory Fields**: An admin writes an incomplete devotional (missing `verseText` or `reflection`).
9. **Tampering with Audit Fields**: An editor tries to change immutable history timestamps or set arbitrary editors UID.
10. **Admin Self-Assignment**: A user tries to write a custom admin document with someone else's email to bypass checks.
11. **Value Poisoning**: An administrative update tries to insert excessively giant strings (>50KB) for simple values (e.g., `verseReference`).
12. **Malicious Admin Deletion**: A non-admin attempts to clean up or delete the `/admins` registry collection.

---

## 3. Verification & Rules Blueprint

The corresponding safety guidelines will be strictly enforced in `firestore.rules` using global validators, key-set sizing, and data types assertions.
