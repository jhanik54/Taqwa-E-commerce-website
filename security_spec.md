# Security Specification - Firebase Security TDD

This document defines the security boundaries, data invariants, and the "Dirty Dozen" malicious payloads designed to test our Firestore rules against illegal operations.

## 1. Data Invariants
1. **User Identity Invariant**: A user profile document inside `/users/{userId}` can only be read, created, or updated by the authenticated user whose `request.auth.uid == userId`.
2. **Profile Data Integrity**: A user cannot modify key fields of another user's profile or elevate their own privileges.
3. **Product Read-Only Invariant**: Products inside `/products/{productId}` are publicly readable (any user or guest), but can only be modified by administrative users (never standard users or guests).
4. **ID Poisoning Guard**: Document IDs must be validated to prevent denial of wallet attacks using oversized strings.

## 2. The "Dirty Dozen" Payloads

The following 12 payloads represent attacks on our Firestore architecture. All of these must return `PERMISSION_DENIED` under our security rules:

1. **Identity Spoofing**: Attempt to write a user profile at `/users/alice_uid` while authenticated as `bob_uid`.
2. **Anonymous/Guest Profile Creation**: Attempt to create a user profile at `/users/any_uid` without an active, verified Firebase Auth session.
3. **Privilege Escalation in Profile**: Attempt to update a user profile to inject an admin flag (e.g., `"role": "admin"` or `"isAdmin": true`).
4. **Oversized String Injection (Denial of Wallet)**: Attempt to write a user profile with a 1MB string inside `displayName`.
5. **Unauthorized Product Insertion**: Attempt to create a new product at `/products/new_product` as a standard authenticated customer.
6. **Unauthorized Product Update**: Attempt to edit the price of an existing product at `/products/cat-1` as a guest or standard customer.
7. **Unauthorized Product Deletion**: Attempt to delete a product at `/products/cat-1` as a guest or standard customer.
8. **Malicious ID Poisoning (Oversized Document ID)**: Attempt to write a profile document with an ID of 200+ characters (e.g., `/users/very_long_garbage_id_over_128_bytes_...`).
9. **Unverified Email Writes**: Attempt to register/write user data when the authenticated email state is unverified (`email_verified` is `false`).
10. **Shadow Key Injection**: Attempt to create a user profile containing extra unvalidated fields (e.g., `"hack_field": "data"`).
11. **Immutability Bypass**: Attempt to update the `createdAt` timestamp field to a date different from `request.time`.
12. **Blanket Query Scraping**: Attempting a query-all collection list request without restricting queries to the user's own `userId` (where applicable).

## 3. Test Runner
Below is a conceptual validation suite matching our security assertions:

```typescript
// firestore.rules.test.ts
import { assertSucceeds, assertFails, initializeTestEnvironment } from '@firebase/rules-unit-testing';

describe('Taqwa Enterprise Security Rules Test', () => {
  let testEnv: any;

  before(async () => {
    testEnv = await initializeTestEnvironment({
      projectId: "taqwa-enterprise-jhsoft",
      firestore: {
        rules: require('fs').readFileSync('firestore.rules', 'utf8')
      }
    });
  });

  after(async () => {
    await testEnv.cleanup();
  });

  it('blocks Alice from writing to Bob\'s user document', async () => {
    const bobDb = testEnv.authenticatedContext('bob', { email_verified: true }).firestore();
    await assertFails(bobDb.doc('users/alice').set({ uid: 'alice', email: 'alice@example.com' }));
  });

  it('allows Alice to write to her own user document', async () => {
    const aliceDb = testEnv.authenticatedContext('alice', { email: 'alice@example.com', email_verified: true }).firestore();
    await assertSucceeds(aliceDb.doc('users/alice').set({ uid: 'alice', email: 'alice@example.com' }));
  });

  it('blocks standard user from writing products', async () => {
    const aliceDb = testEnv.authenticatedContext('alice', { email_verified: true }).firestore();
    await assertFails(aliceDb.doc('products/cat-1').set({ id: 'cat-1', name: 'Premium Salmon Oil', price: 999 }));
  });
});
```
