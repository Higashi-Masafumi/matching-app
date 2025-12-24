# Frontend Screen Map & Navigation (Proposed)

## 1. Delivery Priorities (MVP)

1. **Onboarding (auth → profile)** is the top priority, with student verification delivered first.
2. **Swipe → Match Modal → Likes → Chat** is the fixed build order for the core loop.
3. **Profile/Settings** can be built in parallel with the above, but student verification ships ahead of the rest.
4. **Admin settings** stay minimal for MVP (show only essential status/controls plus extension hooks).

## 2. Tabs & Initial Navigation

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

## 3. Onboarding Flow (Screens & Order)

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

## 4. Match Modal (MatchModal) Entry & Return

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

## 5. Screen Inventory (Agreed List)

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
