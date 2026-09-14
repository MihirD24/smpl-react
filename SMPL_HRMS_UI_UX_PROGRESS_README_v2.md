# SMPL HRMS – UI/UX Polish Progress & Updated Plan

> **Project:** Shantinath Motors Pvt. Ltd. / Shantinath JCB HRMS  
> **Current focus:** Basic UI polish and consistency  
> **Status:** Plan updated — Team Allotment is paused for now

---

## 1. Important Plan Change

The earlier plan was to continue with:

```text
Team Allotment / Hierarchy
→ Remaining Admin Modules
→ API Changes
→ Final QA
```

### This plan is now paused.

The current priority is:

> **Do basic UI changes and UI polish first.**

The reason is that API responses are still expected to change. Doing deep module development now can create unnecessary rework.

Therefore:

```text
CURRENT PRIORITY
       ↓
Basic UI Polish
       ↓
Common UI Consistency
       ↓
Responsive / Layout Fixes
       ↓
API Response Changes
       ↓
Final UI Adjustments
       ↓
Feature / Module Completion
       ↓
Final QA
```

---

# 2. Current Progress

The major screens have already received UI/UX work.

| Module | UI Status |
|---|---|
| Splash | ✅ Polished |
| Login | ✅ Polished |
| OTP | ✅ Polished |
| Home Dashboard | ✅ Polished |
| Header / Navigation | ✅ Polished |
| Punch / Attendance | ✅ Polished |
| Attendance List | ✅ Polished |
| Leave List | ✅ Polished |
| Add Leave | ✅ Polished |
| Salary | ✅ Polished |
| Profile | ✅ Polished |
| Profile Quick Access | ✅ Polished |
| Holiday | ✅ Polished |
| Notifications | ✅ Polished |
| Admin Dashboard | ✅ Polished |
| Admin Attendance | ✅ Polished |
| Admin Employee | ✅ Polished |
| Admin Leave | ✅ Polished |
| Admin Salary / Payroll | ✅ Polished |
| Team Allotment | 🟡 Basic UI created, currently paused |
| Final common UI pass | ⏳ Pending |
| API response update | ⏳ Pending |
| Final QA | ⏳ Pending |

### Approximate progress

**Overall UI polish: ~80–90%**

This is a UI/UX estimate only, not a feature/API completion percentage.

---

# 3. What Has Been Done So Far

## Mobile Employee/HRMS UI

The mobile application was moved toward a professional enterprise/industrial design.

Completed areas include:

- Login
- OTP
- Splash
- Home
- Attendance
- Punch
- Leave
- Add Leave
- Salary
- Profile
- Holiday
- Notifications
- Common headers
- Navigation
- Loading states
- Empty states
- Dark mode
- Responsive tablet layouts

---

# 4. Admin UI

The Admin side has also received initial UI polish.

Completed:

### Admin Dashboard

- Workforce overview
- KPI cards
- Attendance summary
- Employee shortcut
- Responsive layout
- JCB Yellow branding
- Loading state
- Empty state
- Dark mode

### Admin Attendance

- Date navigation
- Attendance KPI
- Attendance cards
- Attendance status
- Punch information
- Filters
- Filter chips
- Pull-to-refresh
- Dark mode

### Admin Employee

- Employee Management
- Search
- Employee ID
- Branch
- Department
- Designation
- Contact details
- Active/inactive status
- Employee cards
- Dashboard → Employee navigation
- Bottom navigation → Employee navigation
- Tablet layout

### Admin Leave

- Total / Pending / Approved / Rejected
- Search
- Filters
- Leave cards
- Approve / Reject actions
- Date range
- Duration
- Empty/loading states
- Dark mode

### Admin Salary / Payroll

- Payroll Control Center
- Month/year context
- Employee count
- Paid / Pending
- Search
- Filters
- Salary cards
- Salary details
- Working days
- Leave
- Holiday
- Additional amount
- Paid amount
- Dark mode

### Team Allotment

A basic UI was created for:

- Employee
- Role
- Effective dates
- Multiple Branch + Department scopes
- Add scope
- Remove scope
- Save

However:

> **Team Allotment is currently NOT the next priority.**

It will be revisited after the basic UI polish/API changes.

---

# 5. Design System Already Used

The current UI uses the following visual direction.

## Brand

### Primary

```text
JCB Yellow
#F9C900
```

### Dark

```text
Black
#111111

Charcoal
#1C1C1C

Ink
#171717
```

### Neutral

```text
Background
#F5F6F7

Surface
#FFFFFF

Border
#E4E6E8

Slate
#5F6368

Muted
#8A8F98
```

### Semantic

```text
Success
#16803C

Danger
#C62828

Info
#1F5EFF
```

---

# 6. UI Philosophy

The target is:

> **Professional Industrial ERP UI**

Not:

- Generic template
- Gaming UI
- Excessive gradients
- Overly colorful dashboard
- Excessively rounded cards

The visual language should feel:

```text
Enterprise
+
Industrial
+
Workforce
+
Field Operations
+
ERP
```

---

# 7. Primary CTA Rule

The primary action is now:

```text
JCB Yellow
#F9C900
```

Example:

```text
[ Save ]

[ Apply Leave ]

[ Punch In ]

[ Submit ]

[ Calculate Salary ]
```

These should use yellow with dark/black text.

### Blue

Blue is not the primary brand CTA anymore.

Blue can still be used for:

- Information
- Links
- Supporting analytics
- Informational status

---

# 8. Card Design

Cards follow a common enterprise pattern:

```text
White Surface
Light Border
Medium Radius
Subtle Shadow
Clear Heading
Supporting Information
Status
Optional Action
```

Avoid:

```text
Heavy shadow
Huge radius
Strong gradient
Too many colors
```

---

# 9. KPI Design

KPI cards use:

```text
Icon
↓
Value
↓
Label
↓
Optional supporting information
```

Example:

```text
┌──────────────────────┐
│  👥                  │
│                      │
│  148                 │
│  Total Employees     │
└──────────────────────┘
```

Do not make every KPI yellow.

Use semantic colors where appropriate.

---

# 10. Status Design

Common status colors:

| Status | Color |
|---|---|
| Approved | Green |
| Present | Green |
| Pending | Yellow/Amber |
| Rejected | Red |
| Absent | Red |
| Information | Blue |
| Neutral | Gray |

Prefer soft badges:

```text
[ ● Approved ]
[ ● Pending ]
[ ● Rejected ]
```

rather than fully saturated backgrounds.

---

# 11. Typography

Current project fonts include:

- Poppins Regular
- Poppins Medium
- Poppins SemiBold
- Poppins Light
- Poppins Italic
- PT Sans Regular
- PT Sans Bold
- PT Sans Italic

Recommended hierarchy:

```text
Screen Title
→ Poppins SemiBold/Bold

Section Title
→ Poppins SemiBold

Card Title
→ Poppins SemiBold

Body
→ Poppins Regular

Metadata
→ Poppins Regular/Medium

Button
→ Poppins SemiBold
```

---

# 12. Responsive UI

The UI has been designed for:

- iPhone
- Android phones
- iPad
- Android tablets

Current approach:

```text
Phone
→ Single column / 2-column KPI

Tablet
→ Wider content / multi-column

Desktop/Web
→ Sidebar + Workspace + Tables
```

Important rule:

> Do not simply stretch the mobile layout onto tablets.

---

# 13. Safe Area / Header

Mobile header improvements include:

- Safe area support
- Dynamic Island awareness
- Status bar spacing
- Better logo placement
- Notification action
- Responsive header
- Reduced unnecessary top whitespace

This should remain consistent throughout the remaining UI polish.

---

# 14. Loading States

Instead of only:

```text
Loading...
```

the UI uses skeleton structures where appropriate.

Examples:

```text
██████████
████████████████
████████
```

This should be standardized across all remaining screens.

---

# 15. Empty States

Important rule:

> Empty API data is not automatically an error.

Use:

```text
[ Icon ]

No records found

There is no data available for the selected filters/date.
```

Use error states only when the API/network actually fails.

---

# 16. Search & Filter

Common pattern:

### Mobile

```text
[ Search................ ]

[ Branch ] [ Department ] [ Status ]
```

### Desktop/Web

```text
[ Search............. ]
[ Branch ▼ ]
[ Department ▼ ]
[ Status ▼ ]
[ Date ▼ ]
```

Active filters:

```text
[ Branch: Ahmedabad × ]
[ Status: Active × ]
```

---

# 17. Current Basic UI Polish Priority

The next work should NOT be large feature development.

Focus on:

### 17.1 Header consistency

Every screen should have:

- Same spacing
- Same title style
- Same back button
- Same notification/profile behavior
- Same safe-area treatment

### 17.2 Button consistency

All primary buttons should use:

```text
JCB Yellow + Black
```

### 17.3 Card consistency

Standardize:

- Border radius
- Padding
- Shadow
- Border
- Typography

### 17.4 Input consistency

Standardize:

- Label
- Placeholder
- Border
- Focus state
- Error state
- Disabled state

### 17.5 Status consistency

Same status = same visual treatment everywhere.

### 17.6 Spacing consistency

Avoid screen-specific random values.

Recommended:

```text
4
8
12
16
20
24
32
40
```

### 17.7 Icon consistency

Use consistent icon family, size, and stroke weight.

### 17.8 Empty/loading consistency

All screens should use the same visual language.

---

# 18. What We Should NOT Do Right Now

Because API responses may change:

❌ Do not deeply redesign backend-dependent workflows  
❌ Do not invent new API response fields  
❌ Do not hard-code API response structures  
❌ Do not change service contracts unnecessarily  
❌ Do not create duplicate business logic  
❌ Do not spend time on complex Team Allotment behavior yet  

Instead:

> **Polish the existing UI around the current service layer.**

---

# 19. API Change Strategy

Once API response changes are finalized:

```text
New API Response
       ↓
Service / Mapper
       ↓
Existing UI Model
       ↓
Existing Components
```

This minimizes UI rework.

The UI should not depend directly on deeply nested backend response structures.

---

# 20. Web Admin Goal

The Web Admin should eventually use the same design language.

### Mobile

```text
JCB Yellow
Black
White
Cards
Bottom Navigation
```

### Web

```text
JCB Yellow
Black Sidebar
White Workspace
Tables
Cards
Filters
Charts
```

The two products should feel like one system.

---

# 21. Web Admin Design Direction

Recommended structure:

```text
┌─────────────────────────────────────────────────────────┐
│ Header / Search / Notification / Profile                │
├───────────────┬─────────────────────────────────────────┤
│               │                                         │
│   Sidebar     │          Main Workspace                 │
│               │                                         │
│ Dashboard     │          Page Header                    │
│ Employees     │                                         │
│ Attendance    │          KPI Cards                      │
│ Leave         │                                         │
│ Payroll       │          Tables / Cards                 │
│ Team          │                                         │
│ Service       │                                         │
│ Reports       │                                         │
└───────────────┴─────────────────────────────────────────┘
```

---

# 22. Web Components To Build Later

When Web Admin work starts, create shared components first:

```text
ERPLayout
ERPSidebar
ERPHeader

PageHeader
SectionHeader

KpiCard
StatCard
ERPCard

SearchInput
FilterBar
FilterSelect
FilterChip

DataTable
Pagination

StatusBadge
Avatar

PrimaryButton
SecondaryButton
DangerButton

ERPInput
ERPSelect
ERPDatePicker
ERPTextarea

ERPModal
ConfirmDialog
Drawer

LoadingSkeleton
EmptyState
Toast
```

Then individual screens become much easier to polish.

---

# 23. Updated Development Plan

## Phase A — Basic UI Polish

**CURRENT**

```text
[✓] Brand colors
[✓] Typography direction
[✓] Dashboard foundation
[✓] Admin foundation
[✓] KPI cards
[✓] Cards
[✓] Status badges
[✓] Search/filter patterns

[ ] Final common header pass
[ ] Final button pass
[ ] Final input pass
[ ] Final spacing pass
[ ] Final icon pass
[ ] Final empty/loading pass
[ ] Final responsive pass
```

---

## Phase B — API Response Changes

After UI foundation is stable:

```text
[ ] Finalize API response structures
[ ] Update service mappings
[ ] Update models/types
[ ] Verify all screens
[ ] Handle missing/null fields
[ ] Handle empty responses
[ ] Handle errors
```

---

## Phase C — UI Adjustment After API Changes

```text
[ ] Update cards where fields changed
[ ] Update tables
[ ] Update filters
[ ] Update detail views
[ ] Update status mappings
[ ] Update loading/empty states
```

---

## Phase D — Feature Completion

Only after API stabilization:

```text
[ ] Team Allotment final
[ ] Remaining Admin modules
[ ] Reports
[ ] Advanced workflows
```

---

## Phase E — Web Admin

Use the same design system:

```text
[ ] Web design tokens
[ ] Web layout
[ ] Sidebar
[ ] Header
[ ] Dashboard
[ ] Employees
[ ] Attendance
[ ] Leave
[ ] Payroll
[ ] Team Allotment
[ ] Service Visit
[ ] Reports
```

---

## Phase F — Final QA

```text
[ ] iPhone
[ ] Android phone
[ ] iPad
[ ] Android tablet
[ ] Desktop Web
[ ] Tablet Web
[ ] Mobile Web
[ ] API regression
[ ] Navigation regression
[ ] Loading states
[ ] Empty states
[ ] Error states
[ ] Dark mode
```

---

# 24. Key Rule Going Forward

> **Abhi feature race nahi karni hai.**

First make the existing UI:

```text
Consistent
Clean
Responsive
Professional
Enterprise-looking
```

Then change the API.

Then make small UI adjustments according to the final response.

This avoids repeatedly redesigning screens every time the API changes.

---

# 25. Current Next Task

### Do NOT continue Team Allotment right now.

The immediate next task should be:

> **Common UI Basic Polish Pass**

Recommended order:

```text
1. Common Header
2. Buttons
3. Cards
4. Inputs
5. Search / Filters
6. Status Badges
7. Loading
8. Empty States
9. Spacing
10. Responsive QA
```

After that:

```text
API Response Changes
        ↓
UI Adjustments
        ↓
Team Allotment / Remaining Modules
        ↓
Web Admin
        ↓
Final QA
```

---

## Final Status

**UI redesign foundation: ~80–90% complete**

**Deep feature/API work: intentionally paused**

**Current priority: Basic UI polish + consistency**

**Team Allotment: created at basic UI level, but paused**

**Next priority: Common UI polish pass**

---

**Document Version:** UI/UX Progress v2.0  
**Status:** Updated plan after Team Allotment pause  
**Project:** SMPL HRMS / Shantinath JCB
