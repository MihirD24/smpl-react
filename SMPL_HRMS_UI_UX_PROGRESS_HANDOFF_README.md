# SMPL HRMS Mobile App — UI/UX Progress & Handoff README

## Project
**SMPL HRMS / Shantinath JCB**
React Native HRMS mobile application.

### Brand / UI direction
- Primary brand: **JCB Yellow + Black + White**
- Primary CTA: **JCB Yellow**
- Blue should NOT be the primary brand CTA
- Enterprise ERP / workforce / field-operations visual style
- iPhone, iPad and Android phone/tablet responsive
- Preserve all existing API, navigation and business logic unless explicitly requested
- Empty API data should show a normal empty state, not an error

---

# Current UI Progress

## Completed

| Screen / Module | Status |
|---|---|
| Splash Screen | ✅ Done |
| Login | ✅ Done |
| OTP Verification | ✅ Done |
| Home Dashboard | ✅ Done |
| Punch / Attendance | ✅ Done |
| Attendance List | ✅ Done |
| Attendance Filter / Card | ✅ Done |
| Leave List | ✅ Done |
| Add Leave | ✅ Done |
| Service Visit List | ✅ Done |
| Add Service Visit | ✅ Done |
| Salary List | ✅ Done |
| Staff Salary | ✅ Done |
| Calculate Salary | ✅ Done |
| Profile | 🟡 Almost Done |
| Holiday List | 🟡 Pending UI polish |
| Notification | 🟡 Pending UI polish |
| Common UI / responsive final pass | 🟡 Pending |
| iPhone / iPad / Android final QA | ⏳ Pending |

### Overall progress
Approximately **85–90% of the planned mobile UI/UX work is complete**.

---

# Profile Screen

Profile has already been redesigned with:

- JCB Yellow / Black enterprise styling
- Employee information card
- Employee ID / username / mobile / email / DOJ
- Quick Access section
- Salary / Attendance / Leave / Holiday navigation
- Notifications
- Sign Out
- Safe-area support
- iPhone Dynamic Island safe spacing
- Responsive tablet layout
- Existing `userDetails()` and navigation logic preserved

## Current Profile issue

### Quick Access scrolling
The Quick Access section needs to support **horizontal scrolling/swiping**, especially when more than the visible number of cards are present.

A corrected Profile V2 ZIP was generated for this:

`shantinath-jcb-hrms-profile-quick-access-scroll-v2.zip`

If continuing in another chat, upload the latest project ZIP and explain that **Profile Quick Access horizontal scrolling needs to be verified/fixed**.

---

# Important Runtime Fix Already Applied

There was a runtime error:

```text
ReferenceError: Property 'insets' doesn't exist
```

Cause:
`insets.top` was being referenced from a style definition where the component's `insets` variable was not available.

The Profile screen was corrected so Safe Area handling does not reference `insets` from an out-of-scope StyleSheet definition.

---

# Holiday List

The Holiday API response currently looks like:

```json
{
  "data": [
    {
      "id": 2,
      "name": "DUSSEHERA",
      "date": "2026-10-19T18:30:00.000000Z"
    },
    {
      "id": 3,
      "name": "DIWALI",
      "date": "2026-11-07T18:30:00.000000Z"
    },
    {
      "id": 4,
      "name": "NEW YEAR",
      "date": "2026-11-08T18:30:00.000000Z"
    }
  ],
  "message": "data found!!",
  "success": true
}
```

Holiday UI is the next major screen to polish.

### Suggested Holiday UI
- Enterprise header
- Upcoming Holidays title
- Holiday count
- Date / day clearly displayed
- Holiday name
- Month / year grouping
- Upcoming indicator
- JCB Yellow accent
- Search
- Pull-to-refresh
- Proper loading skeleton
- Normal empty state
- iPhone/iPad/Android responsive layout
- Preserve existing `getHolidayList()` API logic

**Before modifying HolidayList, inspect `getHolidayList()` service implementation** to confirm whether it returns the full API response or `response.data`.

---

# Next Recommended Work Order

## 1. Profile
- Verify Quick Access horizontal scrolling
- Check iPhone small-screen layout
- Check iPad layout
- Check Android layout
- Verify all navigation actions

## 2. Holiday List
Complete the Holiday List UI redesign.

## 3. Notification
Polish notification list/detail states.

## 4. Common Components
Final consistency pass for:
- Header
- Buttons
- Cards
- Search bars
- Empty states
- Skeletons
- Modals
- Spacing
- Typography
- Safe-area handling

## 5. Responsive QA
Test:
- iPhone
- iPad
- Android phone
- Android tablet

## 6. Release QA
After UI completion:
- Debug build
- Release build
- API regression
- Navigation regression
- Store screenshots
- App Store / Play Store final checks

---

# Important Engineering Rules

### Do NOT break existing logic
When redesigning a screen:
- Keep existing API endpoints
- Keep existing service functions
- Keep existing navigation routes
- Keep existing form submission
- Keep existing validation
- Keep existing camera/location functionality
- Keep existing authentication flow

Only improve UI/UX unless a functional bug is explicitly requested.

### Responsive design
Use tablet-aware layouts rather than simply stretching mobile layouts.

Recommended breakpoint:

```ts
const isTabletWidth = (width: number) => width >= 768;
```

Recommended content widths:

```ts
const contentMaxWidth = (width: number) =>
  width >= 1200 ? 1120 : width >= 768 ? 980 : width;
```

### Brand tokens

```ts
export const BRAND = {
  yellow: '#F9C900',
  yellowSoft: '#FFF7CC',
  black: '#111111',
  charcoal: '#1C1C1C',
  ink: '#171717',
  slate: '#5F6368',
  muted: '#8A8F98',
  background: '#F5F6F7',
  surface: '#FFFFFF',
  border: '#E4E6E8',
  success: '#16803C',
  successSoft: '#E8F6ED',
  danger: '#C62828',
  dangerSoft: '#FDECEC',
  info: '#1F5EFF',
  infoSoft: '#EAF0FF',
};
```

---

# Main API Endpoints

```ts
export const API_ENDPOINTS = {
  AUTH: {
    AUTHENTICATE_USER: '/authenticate-user',
    VERIFY_OTP: '/otp-verify',
    RESEND_OTP: '/otp-resend',
  },
  ATTENDANCE_BY_USER: 'attendance-by-user',
  ATTENDANCE_STATUS_COUNT: 'attendance-status-count',
  ADD_IN_TIME: 'add-in-time',
  ADD_OUT_TIME: 'add-out-time',
  CHECK_ATTENDANCE: 'check-attendance',
  LEAVE_BY_USER: 'leave-by-user',
  ADD_LEAVE: 'add-leave',
  LEAVE_ACCEPT_REJECT: 'leave-accept-reject',
  GET_NOTIFICATION_LIST: 'get-notification-list',
  USER_DETAILS: 'user-details',
  SALARY_LIST: 'salary-list',
  SALARY_CALCULATE: 'salary-calculate',
  PRINT_SALARY_SLIP: 'print-salary-slip',
  HOLIDAY_LIST: 'holiday-list',
  ATTENDANCE_DATA: 'attendance-data',
  DASHBOARD_SALES: 'dashboard-sales',
  DASHBOARD_PURCHASE: 'dashboard-purchases',
  GET_DASHBOARD_COUNT: 'get-dashboard-count',
  BRANCH_LIST: 'branch-list',
  EMPLOYEE_LIST: 'employee-list',
  SERVICE_VISIT_GET_EMPLOYEES_BY_BRANCH: 'service-visit-get-employees-by-branch',
  MACHINE_MODEL_LIST: 'machine-model-list',
  SERVICE_VISIT_GET_PARTY_BY_MACHINE: 'service-visit-get-party-by-machine',
  SERVICE_VISIT_STORE_MACHINE: 'service-visit-store-machine',
  SERVICE_VISIT_GET_DA_AMOUNT: 'service-visit-get-da-amount',
  SERVICE_VISIT_ADD: 'service-visit-add',
  SERVICE_VISITS_LIST: 'service-visits-list',
  SERVICE_VISITS_BULK_APPROVE: 'service-visits-bulk-approve',
};
```

---

# Handoff Instructions for Another Chat

When continuing this project in another ChatGPT chat:

1. Upload the **latest source ZIP**.
2. Also upload this README if needed.
3. Tell ChatGPT:
   - This is the current SMPL HRMS UI/UX project.
   - Read this README first.
   - Do not change API/business logic.
   - Continue from the current progress.
   - Work screen-by-screen.
4. For code changes, return a complete updated ZIP when requested.
5. Do not restart already completed UI work unless there is a bug or inconsistency.

### Current next task

**Profile Quick Access → verify/fix horizontal scrolling, then move to Holiday List UI polish.**

---
