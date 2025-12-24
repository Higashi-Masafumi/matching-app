# Frontend Screen Map & Navigation (Proposed)

## 1. Tabs & Initial Navigation

### Tab placement (routes under `app/(tabs)/`)
| Tab | Route | Purpose | Notes |
| --- | --- | --- | --- |
| Swipe | `app/(tabs)/swipe` | Main discovery/swipe experience | Default tab after onboarding completes. |
| Likes | `app/(tabs)/likes` | Incoming likes / matches list | Can link to match details and chat. |
| Chat | `app/(tabs)/chat` | Ongoing conversations | Opens chat threads. |
| Profile | `app/(tabs)/profile` | User profile & settings | Entry point for edit profile, preferences. |

### Initial navigation rules
1. **First app open / logged out** → start onboarding (`app/(onboarding)/welcome`).
2. **Onboarding incomplete** → resume at last incomplete onboarding step.
3. **Onboarding complete + authenticated** → land on Swipe tab (`app/(tabs)/swipe`).

> Rationale: Swipe is the primary engagement loop. Likes/Chat/Profile are secondary tasks.

## 2. Onboarding Flow (Screens & Order)

Proposed routes under `app/(onboarding)/`:

1. **Welcome** → `app/(onboarding)/welcome`
2. **Auth** (sign up / login) → `app/(onboarding)/auth`
3. **Student verification** → `app/(onboarding)/student-verify`
4. **Profile creation** → `app/(onboarding)/profile-setup`
5. **Discovery settings** → `app/(onboarding)/discovery-settings`
6. **Swipe entry** → navigates to `app/(tabs)/swipe`

Notes:
- `student-verify` can re-use existing verification screen components (currently `app/verify/email-otp`).
- When onboarding is complete, persist a flag (e.g. `onboardingCompleted = true`) to skip on subsequent launches.

## 3. Match Modal (MatchModal) Entry & Return

### Entry points
- **Primary**: from Swipe flow when a mutual match occurs.
- **Secondary**: from Likes list if a match is revealed.

### Return destinations
- **If launched from Swipe** → return to `app/(tabs)/swipe`.
- **If launched from Likes** → return to `app/(tabs)/likes`.

### Modal/Stack structure (expo-router)
- Root Stack (`app/_layout.tsx`) includes a modal route:
  - `app/(modals)/match` (presentation: `modal`)
- The modal reads a `returnTo` param and navigates back accordingly.

Example param contract:
- `returnTo=swipe` or `returnTo=likes`.

## 4. Screen Inventory (Agreed List)

### Tabs
- `app/(tabs)/swipe`
- `app/(tabs)/likes`
- `app/(tabs)/chat`
- `app/(tabs)/profile`

### Onboarding
- `app/(onboarding)/welcome`
- `app/(onboarding)/auth`
- `app/(onboarding)/student-verify`
- `app/(onboarding)/profile-setup`
- `app/(onboarding)/discovery-settings`

### Modals
- `app/(modals)/match` (MatchModal)

### Existing routes to keep/align
- `app/verify/email-otp` → should be folded into onboarding as `student-verify` or reused via navigation.
- `app/matches` → can be deprecated in favor of `app/(tabs)/likes`.

---

**Decision log**
- Initial tab: Swipe
- Onboarding exit: to Swipe tab
- MatchModal return: swipe or likes based on entry

---

## 5. Profile Screen Information Architecture

Profile screen (`app/(tabs)/profile`) sections, top-to-bottom:

1. **Photo**
   - Main profile photo + edit button.
   - Tap opens photo editor/manager.
2. **Basic Info**
   - Display name, age, university, bio, interests.
   - “Edit profile” CTA opens profile edit flow.
3. **Student Verification**
   - Verification status summary (Not started / In progress / Verified).
   - “Verify now” CTA when not verified; “View status” CTA otherwise.
4. **Safety Features**
   - Entry to Safety Center (Block/Report/Warnings).
   - Compact summary showing last action or short guidance text.
5. **Settings**
   - Account, notifications, discovery settings, privacy.
   - “Logout”/“Delete account” in this area.

Notes:
- Order prioritizes identity → trust → safety → controls.
- If user is unverified, Student Verification section is highlighted.

---

## 6. Student Verification Flow (Order & Completion States)

Flow entry points:
- Onboarding: `app/(onboarding)/student-verify`
- Profile: Profile → Student Verification → “Verify now”

Screen order (single flow):
1. **University Email OTP**
   - Screen: `app/verify/email-otp` (reused in onboarding).
   - Completion state: `emailVerified = true`.
2. **Student ID Upload**
   - Screen: `app/verify/student-id-upload` (new or renamed).
   - Completion state: `studentIdUploaded = true`.
3. **Selfie Check**
   - Screen: `app/verify/selfie-check` (new).
   - Completion state: `selfieUploaded = true`.
4. **Review & Result**
   - Screen: `app/verify/status` (optional, can be inline on Profile).
   - Completion state: `verificationStatus = verified` (or `pending`).

Completion logic:
- “Verified” requires **all three** steps completed and approved.
- If steps are completed but awaiting review → `pending`.
- If any step missing → `incomplete` with resume CTA.

Progress UI:
- Stepper showing 1/3, 2/3, 3/3 with labels.
- Profile section shows status badge + last completed step.

---

## 7. Verification Badge UI Spec (Card / Profile / Chat)

Badge semantics:
- **Verified**: solid badge with check icon.
- **Pending**: outlined badge with clock icon.
- **Unverified**: no badge by default (avoid noise).

Placement & behavior:

### Card (Swipe / Likes list)
- Position: top-right of card image.
- Size: small capsule (icon + “Verified”).
- Tap opens a tooltip: “This user completed student verification.”

### Profile (Own + Other User)
- Position: next to display name.
- Size: medium (icon + label).
- For own profile, badge is tappable and opens verification status screen.

### Chat (Thread list + Chat header)
- Thread list: small icon next to name.
- Chat header: medium badge under name or aligned right.
- Pending shows “Pending” label in muted color.

Color & type:
- Verified: primary accent.
- Pending: neutral/gray.
- Consistent iconography across surfaces.

---

## 8. Safety Feature Entry Points (Block / Report / Warnings)

Safety Center entry points:
- **Profile screen → Safety Features section**.
- **Chat thread header menu** (⋯) → “Safety Center”.
- **User profile (other user)** → overflow menu → “Block / Report”.

Safety Center contents (single screen):
1. **Block user**
   - Primary action button.
   - Confirmation modal required.
2. **Report user**
   - Category selector + optional note.
   - Submit confirmation screen.
3. **Warnings / Tips**
   - Short safety guidance list (scams, off-platform contact).

Inline warning placements:
- During chat if off-platform link detected → show warning banner.
- On profile if user is unverified → show subtle warning copy.
