# Security Specification - Bible Quest: Word Search

## 1. Data Invariants
- **Identity Bounds**: A user's profile at `/users/{userId}` can only be created, written, or updated by the authenticated user whose `request.auth.uid == userId`.
- **Level Integrity**: Progression difficulty is strictly sequential. Experience points (XP) must be non-negative.
- **Score Integrity**: Daily leaderboard entries must match the submitting user's `uid` and can only be submitted for the current user's profile.
- **Timestamp Integrity**: All updates to `lastActive`, `completedAt` and `timestamp` fields must use `request.time` (server-side timestamps) to prevent cheating or forging.
- **No PII Leaks**: No personal information (emails, real names, auth tokens) is stored in the database.

## 2. Threat Model: The Dirty Dozen Malicious Payloads

The following attack vectors are mitigated and protected by Firestore Rules:

1. **Profile Hijack**: Authenticated User `A` attempts to write/edit a user profile at `/users/B`.
2. **Ghost Property Injection**: Creating a user profile with undefined fields like `{ isSystemAdmin: true, scoreModifier: 9999 }`.
3. **Score Spoofing**: Submitting a daily score on behalf of another user at `/leaderboards/{dayId}/scores/userB`.
4. **Time Forgery**: Submitting `completedAt` with a future timestamp or hardcoded past values of the user's choice to manipulate leaderboard resets.
5. **Level Shortcut**: Attempting to bypass the sequential flow by setting level to negative or extremely high numbers (`level: -1` or `level: 999999`).
6. **XP Exploitation**: Updating experience points (`xp`) to arbitrary high numbers or dropping it to negative numbers.
7. **Junk ID Poisoning**: Ingressing a 1.5KB malicious ID string to clutter Firestore index pages.
8. **PII Injection**: A user attempts to save highly sensitive email addresses or phone numbers into public activity logs.
9. **Fake Activity Log**: Attempting to publish entries in `/activities/` with a fake username or fake text pretending to be another player.
10. **Activity Trolling**: Deleting other players' achievements or modifying existing activities in the community feed.
11. **Negative Value Poisoning**: Setting `gamesPlayed` or `hintsUsed` to values below zero to scramble stats reports.
12. **Blanket Query Abuse**: Attempting to download the entire `/users` collection without filtering to scrape all system users.

## 3. Threat Mitigation Summary (Security Assertions)
- **Rule 1**: Default deny catch-all `allow read, write: if false;` is positioned at matching root.
- **Rule 2**: Type, length, bounds, and schema validations are packed inside standalone helpers `isValidUser()`, `isValidLeaderboardEntry()`, and `isValidActivity()`.
- **Rule 3**: Update operations are strictly bound with `affectedKeys().hasOnly(...)` to allow only appropriate fields (e.g. progress stats can be updated by the player, but no administrative fields or arbitrary schemas).
- **Rule 4**: Verified email requirement is enforced (`request.auth.token.email_verified == true`) for all write actions to block anonymous or fake bot operations.
