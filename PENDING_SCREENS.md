# UI Refactoring Status: Screens

This document tracks the progress of the modern HRMS UI/UX refactoring across all application screens located in `src/screens/`.

> **Design System Quick Reference**
> - Background: `#0F172A` (dark) / `#F8FAFC` (light)
> - Cards: `#1E293B` (dark) / `#FFFFFF` (light)
> - Primary: `#2563EB` | Border: `#334155` / `#E2E8F0`
> - Text: `#F8FAFC` / `#0F172A` | Muted: `#94A3B8` / `#64748B`

---

## ✅ Fully Refactored (Layout + Theme + Sizing)

These screens have been completely overhauled with new layout structure, hero sections, responsive sizing, and the full design system:

| Screen | File | Changes |
|---|---|---|
| **Sign In** | `screens/signIn/signIn.tsx` | Hero banner, floating card, responsive layout |
| **OTP** | `screens/signIn/OtpScreen.tsx` | Hero banner matching SignIn, styled OTP boxes |
| **Home** | `screens/home/home.tsx` | Welcome header with greeting, name, date + Plus button |
| **Notifications** | `screens/notification/notificationScreen.tsx` | Accent bar cards, modern empty state |
| **Leave List** | `screens/leave/leaveList.tsx` | Modern search bar, improved empty state, FAB |
| **Add Leave** | `screens/leave/addLeave.tsx` | Premium form layout, attachment UI |
| **Attendance List** | `screens/attandance/attendanceList.tsx` | Modern list styling, empty state |

---

## 🎨 Theme-Aligned (Colors + Tokens Updated)

These screens already had good structure. Their theme tokens, background colors, and primary brand colors have been updated to match the design system exactly:

| Screen | File | What was updated |
|---|---|---|
| **Attendance Filter** | `screens/attandance/attendanceFilter.tsx` | Replaced custom scale functions with `react-native-size-matters`, updated `screenBg`, `sectionBg`, calendar tokens |
| **Punch** | `screens/attandance/punch.tsx` | Rewrote `PunchStyle()` hook + inline StyleSheet with design system colors |
| **Profile** | `screens/profile/profile.tsx` | Updated theme: heroBg → `#1D4ED8`, cardBg → `#1E293B`, screenBg → `#0F172A` |
| **Service Visit List** | `screens/serviceVisit/serviceVisitList.tsx` | Theme: primary `#2563EB`, correct dark/light bgs |
| **Staff Salary** | `screens/accounts/staffSalary.tsx` | ScreenWrapper bg, text colors |
| **Calculate Salary** | `screens/accounts/calculateSalary.tsx` | ScreenWrapper bg |
| **Salary** | `screens/profile/salary/salary.tsx` | ScreenWrapper bg, hardcoded text colors |
| **Holiday List** | `screens/profile/holiday/holidayList.tsx` | ScreenWrapper bg |
| **Admin Dashboard** | `screens/attandance/admin/adminDashboard.tsx` | Primary → `#2563EB`, bgs |
| **Admin Attendance** | `screens/attandance/admin/adminAttendance.tsx` | Legacy colors updated |
| **Admin Attendance Card** | `screens/attandance/admin/adminAttendanceCard.tsx` | Legacy colors updated |
| **Add Service Visit** | `screens/serviceVisit/addServiceVisit.tsx` | Legacy colors updated |
| **Project List** | `screens/profile/project/projectList.tsx` | Legacy colors updated |
| **Project Remaining** | `screens/profile/projectRemain/projectRemainingScreen.tsx` | Legacy colors updated |
| **Project Reminder** | `screens/profile/projectRemain/projectReminder.tsx` | Legacy colors updated |
| **Performance Report** | `screens/home/performanceReport.tsx` | Legacy colors updated |

### Shared Style Files Updated
| File | Changes |
|---|---|
| `src/assets/style/cardStyles.tsx` | Dark card bg `#1E1E1E` → `#1E293B`, border `#2E2E2E` → `#334155` |
| `src/assets/style/maincss.tsx` | Button colors: `#0eaa6e` → `#10B981`, `#4169E1` → `#2563EB`, `#232323` → `#0F172A` |
| `src/assets/style/punch.tsx` | Complete rewrite with design system tokens + `react-native-size-matters` |

---

## 🚧 Minor Screens (Low Priority — Not Yet Touched)

These are small utility/card components that inherit styles from parent screens or `cardStyles`. They mostly need visual spot-checks only:

- `src/screens/attandance/customMarker.tsx` — Map marker component, minimal styling
- `src/screens/profile/holiday/holidayCard.tsx` — Card uses shared cardStyles
- `src/screens/profile/project/projectCard.tsx` — Card uses shared cardStyles
- `src/screens/profile/project/module/moduleList.tsx`
- `src/screens/profile/project/module/moduleCard.tsx`
- `src/screens/profile/project/module/addModule.tsx`
- `src/screens/profile/projectRemain/projectRemainingCard.tsx`
- `src/screens/profile/projectRemain/reminderCard.tsx`
- `src/screens/profile/projectRemain/addProjectRemainingScreen.tsx`
- `src/screens/profile/projectRemain/addProjectReminder.tsx`
- `src/screens/imageMap/showMap.tsx` — Full-screen map, minimal UI
- `src/screens/imageMap/showImage.tsx` — Full-screen image viewer
