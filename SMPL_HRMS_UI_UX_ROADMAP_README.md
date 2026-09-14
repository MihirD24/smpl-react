# SMPL HRMS Mobile App — UI/UX Development Roadmap

## Project

**App:** Shantinath JCB — SMPL HRMS  
**Technology:** React Native  
**Target Platforms:** iPhone, iPad, Android Phone, Android Tablet  
**Design Direction:** Enterprise ERP / Workforce Management

---

## 1. UI/UX Objective

The application UI should feel like a professional enterprise HRMS/ERP system rather than a basic mobile form application.

### Design principles

- Clean enterprise layout
- Shantinath JCB brand identity
- Yellow + black primary brand language
- White / very light neutral backgrounds
- Strong typography hierarchy
- Clear cards and sections
- Large touch targets
- Minimal unnecessary scrolling
- Consistent spacing across screens
- iOS and Android friendly components
- Responsive layout for phone and tablet
- Reusable components instead of screen-specific styling
- API behaviour must remain unchanged while UI is redesigned

### Brand

Use the provided **SHANTINATH JCB** logo consistently where appropriate.

Primary visual language:

- JCB Yellow: `#FFCC00` / project-approved brand yellow
- Black: `#111111`
- White: `#FFFFFF`
- Dark text: `#172033`
- Secondary text: `#64748B`
- Light background: `#F5F7FA`
- Success: green
- Error: red
- Informational/action blue may be used only where it improves usability, not as the main brand colour

> Important: Primary CTA buttons for Shantinath JCB workflows should normally use the brand yellow unless a specific state requires another colour.

---

# 2. Current API Endpoints

The existing API contract should not be changed during the UI redesign.

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
  SERVICE_VISIT_GET_EMPLOYEES_BY_BRANCH:
    'service-visit-get-employees-by-branch',
  MACHINE_MODEL_LIST: 'machine-model-list',
  SERVICE_VISIT_GET_PARTY_BY_MACHINE:
    'service-visit-get-party-by-machine',
  SERVICE_VISIT_STORE_MACHINE:
    'service-visit-store-machine',
  SERVICE_VISIT_GET_DA_AMOUNT:
    'service-visit-get-da-amount',
  SERVICE_VISIT_ADD: 'service-visit-add',
  SERVICE_VISITS_LIST: 'service-visits-list',
  SERVICE_VISITS_BULK_APPROVE:
    'service-visits-bulk-approve',
};
```

---

# 3. Phase 1 — Foundation & Core Employee Experience

## Completed / worked on

### Splash Screen

Goal:

- Proper Shantinath JCB branded splash
- Logo visible and correctly sized
- Enterprise ERP appearance
- No stretched logo
- Safe-area aware
- Works on iPhone, iPad and Android
- Avoid hard-coded dimensions that break on tablets

### Login / OTP

Goal:

- Professional authentication flow
- OTP screen should fit completely on iPhone without unnecessary scrolling
- Keyboard should not hide OTP fields/buttons
- Resend OTP and verification states should be clear
- Loading/error states should be consistent

### Home Dashboard

Current design direction:

- Workforce overview
- Today's attendance
- Punch-in / punch-out status
- Attendance / Leave / Salary / Holiday shortcuts
- Pending Service Visits
- Shantinath JCB branding
- Bottom navigation

Home should remain the primary employee dashboard.

### Punch & Attendance

Current design direction:

- Current time
- Current date
- Location
- Punch-in / punch-out
- Attendance status
- Map/location section
- Clear live state
- Bottom navigation

Important:

The Punch screen must remain practical for employees who use the application in the field. The action to punch should always be visually obvious.

### Service Visit List

Current design direction:

- Field Operations / Service
- Search
- All / Pending / Approved filters
- Empty state
- Floating Add button
- Bottom navigation

### New Service Visit

Current workflow includes:

1. General Details
2. Branch
3. Visit Date
4. Company Vehicle
5. Number of Employees
6. Visiting Employee
7. Sales Visit Specifications
8. Client Name
9. Attachment
10. Travel & Expense Allowances
11. Location
12. KM Travelled
13. Night Stay
14. Travel Allowance
15. Stay Amount
16. Expense
17. Total Expenses
18. Remarks
19. Submit Visit

The sequence should not be changed unless the business workflow requires it.

---

# 4. Service Visit UI Rules

The Service Visit form is a long enterprise form and must be designed carefully.

## Recommended structure

Use a single scrollable form with clearly separated cards/sections:

### Section 1 — General Details

```text
General Details
-------------------------
Branch *
Visit Date *
Company Vehicle
No. of Employees
Visiting Employee *
```

### Section 2 — Visit / Sales Information

```text
Sales Visit Specifications
-------------------------
Client Name
Attachment
```

### Section 3 — Travel & Expenses

```text
Travel & Expense Allowances
-------------------------
Location *
KM Travelled
Night Stay

Travel Allowance
Stay Amount
Expense

Total Expenses
```

### Section 4 — Remarks

```text
Remarks
-------------------------
Add any extra remarks...
```

### Final CTA

```text
SUBMIT VISIT
```

The final CTA should use the Shantinath JCB yellow theme.

---

# 5. Phase 2 — HRMS Modules

Phase 2 should start only after Phase 1 screens are stable.

## Attendance

Pending / enhancement areas:

- Attendance history
- Monthly attendance
- Present / Absent / Leave counts
- Daily attendance detail
- Attendance status
- Better filtering
- Date selection
- Empty/loading/error states

## Leave

Pending:

- Leave list
- Apply leave
- Leave type
- Start date / end date
- Reason
- Leave balance
- Pending / Approved / Rejected states
- Leave detail
- Approval/rejection display

## Salary

Pending:

- Salary list
- Monthly salary
- Salary summary
- Earnings
- Deductions
- Net salary
- Salary calculation
- Salary slip
- Print/share salary slip

The salary UI should look like an ERP payroll module rather than a generic list.

## Holidays

Pending:

- Holiday list
- Current/upcoming holidays
- Month/year grouping
- Holiday type
- Empty state

## Notifications

Pending:

- Notification list
- Read/unread state
- Notification category
- Date/time
- Empty state

## Profile

Pending:

- Employee information
- Department
- Designation
- Branch
- Contact information
- Employee code
- Profile image
- Account/logout actions

---

# 6. Service Visit — Phase 2 Enhancements

After the basic Service Visit UI is stable:

### Service Visit List

Add:

- Better visit cards
- Visit status badges
- Employee name
- Client/customer
- Branch
- Visit date
- Expense amount
- Approval status
- Pull-to-refresh
- Pagination if supported by API
- Search/filter

### Service Visit Detail

Add a dedicated detail screen:

```text
Service Visit
--------------------------------
Status

General Details
Branch
Visit Date
Employee

Customer / Client
Machine

Travel
KM
Night Stay

Expenses
TA
Stay
Other Expense
Total

Remarks
Attachments
```

### Approval

If the logged-in user has permission:

- Approve
- Reject
- Bulk approve
- Confirmation dialog
- Success/error feedback

Do not expose approval controls to users who do not have permission.

---

# 7. Responsive Design Strategy

The app must not be designed only for one iPhone screenshot.

## Phone

Recommended behaviour:

- Single-column layout
- Comfortable horizontal padding
- Bottom tab navigation
- Full-width CTA
- Scrollable forms
- Large touch targets

## iPad / Android Tablet

Recommended behaviour:

- Wider content area
- Maximum content width
- Two-column form where appropriate
- Larger cards
- Better use of horizontal space
- Do not simply stretch the phone UI
- Bottom navigation can remain, but spacing should adapt
- Avoid excessive empty space

Example:

```text
Tablet

+------------------------------------------------+
| Header                                         |
+------------------------------------------------+
|                                                |
|  General Details                               |
|  +----------------+  +----------------------+ |
|  | Branch         |  | Visit Date           | |
|  +----------------+  +----------------------+ |
|  | Employees      |  | Visiting Employee    | |
|  +----------------+  +----------------------+ |
|                                                |
|  Travel & Expense                              |
|  +----------------+  +----------------------+ |
|  | Location       |  | KM Travelled         | |
|  +----------------+  +----------------------+ |
|                                                |
+------------------------------------------------+
```

---

# 8. Safe Area & Keyboard Rules

All screens must handle:

- iPhone Dynamic Island
- iPhone notch
- iPad safe areas
- Android status bar
- Android navigation bar
- Keyboard
- Landscape orientation where supported

### Forms

Use keyboard-aware behaviour so that:

- OTP fields remain visible
- Text inputs are not hidden
- Submit button remains accessible
- No unnecessary scrolling is required on short screens

Avoid fixed heights for major screen containers.

---

# 9. Component Architecture

The UI should gradually move toward reusable components.

Suggested structure:

```text
src/
├── components/
│   ├── common/
│   │   ├── AppHeader.tsx
│   │   ├── AppButton.tsx
│   │   ├── AppInput.tsx
│   │   ├── AppCard.tsx
│   │   ├── EmptyState.tsx
│   │   ├── LoadingState.tsx
│   │   └── StatusBadge.tsx
│   │
│   ├── attendance/
│   ├── leave/
│   ├── salary/
│   └── serviceVisit/
│
├── screens/
│   ├── auth/
│   ├── home/
│   ├── attendance/
│   ├── leave/
│   ├── salary/
│   ├── holiday/
│   ├── notification/
│   ├── serviceVisit/
│   └── profile/
│
├── navigation/
├── services/
├── constants/
├── utils/
└── assets/
```

---

# 10. API & UI Separation

UI redesign must not break the existing API integration.

Recommended separation:

```text
Screen
  ↓
Hook / Controller
  ↓
API Service
  ↓
API Endpoint
  ↓
Response Mapper
  ↓
UI State
```

Do not place large Axios/API blocks directly inside JSX.

Keep:

- Loading state
- Success state
- Empty state
- Error state
- Retry state

separate from the UI layout.

---

# 11. Error Handling

All API screens should have professional error handling.

Avoid showing raw errors such as:

```text
AxiosError: Request failed...
```

Instead show:

```text
Unable to load service visits

Please check your connection and try again.

[ TRY AGAIN ]
```

For development, log the technical error to the console.

For users, show a clean business-friendly message.

---

# 12. Loading & Empty States

Every API-driven screen should support:

### Loading

Use skeletons or a clean loading indicator.

### Empty

Example:

```text
No service visits found

There are no service visits available right now.
```

### Error

Example:

```text
Unable to load data

Please try again.

[ TRY AGAIN ]
```

### Success

Show the actual business data.

---

# 13. Navigation

Current primary navigation:

```text
Home
Punch
Service Visit
Profile
```

Keep this navigation consistent across employee screens.

Secondary modules such as:

- Attendance
- Leave
- Salary
- Holidays
- Notifications

can be opened from Home or a module/menu structure.

---

# 14. Visual Consistency Checklist

Before marking any screen complete, verify:

- [ ] Shantinath JCB branding is correct
- [ ] Logo is not stretched
- [ ] Yellow brand CTA is used where appropriate
- [ ] Typography hierarchy is consistent
- [ ] Card radius is consistent
- [ ] Border styling is consistent
- [ ] Icon sizes are consistent
- [ ] Horizontal padding is consistent
- [ ] Empty state is designed
- [ ] Loading state is designed
- [ ] API error state is designed
- [ ] Keyboard does not hide inputs
- [ ] iPhone safe area is correct
- [ ] iPad layout is correct
- [ ] Android phone layout is correct
- [ ] Android tablet layout is correct
- [ ] No hard-coded screen-specific positioning
- [ ] No unnecessary vertical whitespace
- [ ] Buttons have comfortable touch areas
- [ ] Text does not overflow
- [ ] Long forms remain usable

---

# 15. Current Development Sequence

The implementation should follow this order:

```text
PHASE 1
│
├── Splash
├── Login
├── OTP
├── Home Dashboard
├── Punch / Attendance
└── Service Visit
     ├── List
     └── New Visit

        ↓

PHASE 2
│
├── Attendance History
├── Leave
├── Salary
├── Holidays
├── Notifications
└── Profile

        ↓

PHASE 3
│
├── Advanced Service Visit
├── Approval Workflow
├── Better Dashboard Analytics
├── Offline/Retry UX
├── Tablet Optimization
└── Final UI Polish

        ↓

RELEASE QA
│
├── iPhone
├── iPad
├── Android Phone
├── Android Tablet
├── API Error Testing
├── Keyboard Testing
├── Orientation Testing
└── Store Build Testing
```

---

# 16. Important Development Rule

### Do not change business logic just for UI.

The existing:

- API endpoints
- request payloads
- response handling
- authentication
- attendance logic
- service visit logic
- salary logic

should remain functional.

UI improvements should be implemented around the existing working functionality.

If an API response does not contain data, show a professional empty state rather than changing the API logic unnecessarily.

---

# 17. Definition of Done

A screen is considered complete only when:

1. UI looks professional and enterprise-grade.
2. Existing API integration still works.
3. Loading state works.
4. Empty state works.
5. Error state works.
6. Form validation works.
7. Keyboard behaviour works.
8. iPhone layout works.
9. iPad layout works.
10. Android phone layout works.
11. Android tablet layout works.
12. Navigation works.
13. Branding is consistent.
14. No console/render errors are introduced.

---

## Status

### Phase 1

- [x] Splash UI direction
- [x] Login / OTP UI direction
- [x] Home Dashboard UI
- [x] Punch UI
- [x] Service Visit List UI
- [x] New Service Visit UI
- [ ] Final responsive QA
- [ ] Final API/error-state QA
- [ ] Final iPad/tablet optimization

### Phase 2

- [ ] Attendance
- [ ] Leave
- [ ] Salary
- [ ] Holidays
- [ ] Notifications
- [ ] Profile
- [ ] Service Visit detail
- [ ] Service Visit approval workflow

### Phase 3

- [ ] Advanced ERP dashboard
- [ ] Advanced service visit workflow
- [ ] Offline/retry UX
- [ ] Performance optimization
- [ ] Final tablet optimization
- [ ] Release QA

---

## Final Design Goal

The final application should communicate:

> **Shantinath JCB — Professional Workforce & Field Operations ERP**

It should feel reliable, structured, fast and business-oriented for employees, managers and field-service users on both mobile phones and tablets.
