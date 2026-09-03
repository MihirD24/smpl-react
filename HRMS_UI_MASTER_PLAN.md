# HRMS Enterprise App: UI/UX Master Plan & Architecture

This document serves as the master blueprint for refactoring and standardizing the UI/UX across the SMPL-React HRMS application. Authored from the perspective of an Enterprise Mobile App Developer, the goal is to build a highly polished, responsive, and performant React Native application that feels native on both iOS and Android platforms.

## 🎯 1. Core Engineering & UI Philosophy

To achieve an enterprise-grade feel, we adhere to the following principles:

- **Cross-Platform Consistency:** Use abstract components (`SafeAreaView`, `KeyboardAvoidingView`) ensuring seamless layout on iOS notches and Android status bars.
- **Responsive Scaling:** Hardcoded pixels (e.g., `width: 200`) break on different screen sizes. We will strictly enforce `react-native-size-matters` (`scale`, `verticalScale`, `moderateScale`) for all padding, margins, and typography.
- **Fluid Interactions:** Utilize `react-native-reanimated` for 60fps smooth transitions, and `@gorhom/bottom-sheet` for native-like modal experiences.
- **State Feedback:** Every interactive element must provide feedback (e.g., active states for inputs, ripple effects for Android, opacity changes for iOS, skeleton loaders for data fetching).

## 🎨 2. Master Design System (Tokens)

Centralize these tokens via a Theme Provider or inside `src/constant/theme.ts`.

### Semantic Colors
| Role | Light Theme | Dark Theme | Usage |
| :--- | :--- | :--- | :--- |
| **Brand Primary** | `#2563EB` (Blue 600) | `#3B82F6` (Blue 500) | Main buttons, active tabs, highlights |
| **Brand Secondary** | `#1D4ED8` (Blue 700) | `#60A5FA` (Blue 400) | Gradients, hover states |
| **Background (App)**| `#F8FAFC` (Slate 50) | `#0F172A` (Slate 900) | Main wrapper background |
| **Surface (Card)** | `#FFFFFF` (White) | `#1E293B` (Slate 800) | Cards, modals, bottom sheets |
| **Text Primary** | `#0F172A` (Slate 900) | `#F8FAFC` (Slate 50) | Headings, main text |
| **Text Muted** | `#64748B` (Slate 500) | `#94A3B8` (Slate 400) | Subtitles, labels, placeholders |
| **Border/Divider** | `#E2E8F0` (Slate 200) | `#334155` (Slate 700) | Input borders, list separators |
| **Success (Present)**| `#10B981` (Emerald 500)| `#059669` (Emerald 600)| Attendance, approvals |
| **Danger (Absent)** | `#EF4444` (Red 500) | `#DC2626` (Red 600) | Leaves, rejections, errors |
| **Warning (Late)** | `#F59E0B` (Amber 500) | `#D97706` (Amber 600) | Pending states, warnings |

### Typography & Spacing Scale (using `moderateScale`)
- **Headers:** `24px`, Bold (700)
- **Subheaders:** `18px`, SemiBold (600)
- **Body:** `14px` & `16px`, Regular (400)
- **Labels/Tiny:** `12px`, Medium (500)
- **Global Padding:** `16px` to `20px` edge padding for all screens.
- **Border Radius:** `12px` (Inputs/Buttons) to `16px` (Cards).

## 📱 3. Actionable Screen-by-Screen Checklist

The following is our execution plan to refactor all screens in `src/screens/`. 

### 🔐 1. Authentication (`src/screens/signIn`)
- [x] **SignIn Screen:** Implement a soft gradient background. Update inputs to use floating labels or clear icons (`lucide-react-native`). Ensure `<KeyboardAvoidingView>` works flawlessly on smaller Androids.
- [x] **OTP Screen:** Convert standard inputs to a polished split-box OTP UI. Add a countdown timer for resend with subtle text colors.

### 🏠 2. Dashboard (`src/screens/home`)
- [x] **Home Feed:** Create a "Welcome Hero" section with user avatar and date. Add quick action FABs or a horizontal scrollable quick-action menu (Punch In/Out, Apply Leave).
- [x] **Stats Grid:** Convert metric lists into a responsive 2-column grid card system displaying attendance stats and pending leaves.

### 📅 3. Attendance & Punching (`src/screens/attandance`)
- [x] **Punching Screen:** Implement a large, satisfying circular button for Check-In/Out. Integrate Map view with rounded corners and a subtle shadow. Add real-time clock text.
- [x] **Attendance History:** Convert standard lists to a "Timeline" view or a clean Calendar layout. Use color-coded dots (Green=Present, Red=Absent).

### 🏖️ 4. Leave Management (`src/screens/leave`)
- [x] **Leave List:** Implement a segmented control (Pending, Approved, Rejected) at the top. Use cards with status badges.
- [x] **Apply Leave Form:** Upgrade DatePicker UI (native bottom sheet for iOS, standard for Android). Make reason text-area expandable and responsive.

### 💼 5. Profile & Accounts (`src/screens/profile`, `src/screens/accounts`)
- [x] **Profile View:** Implement a collapsing header (parallax effect) with the user's avatar. Use list items with right-chevrons for settings.
- [x] **Salary/Payslip:** Use standard data-table styling with clear typography for currency. Include a polished "Download PDF" action button.

### 🔔 6. Notifications & Extras (`src/screens/notification`, `src/screens/serviceVisit`)
- [x] **Notifications:** Add swipe-to-delete functionality using `react-native-gesture-handler`. Implement unread dot indicators.
- [x] **Service Visits:** For field workers, create clean form interfaces with image upload UI (skeleton placeholders while loading).

## 🛠️ 4. Standardized Components to Build First

Before diving into screens, we must finalize these shared components in `src/components/`:
1. [x] `AppScreen.tsx`: A wrapper combining `SafeAreaView`, `StatusBar` (dark/light content), and base background color.
2. [x] `AppButton.tsx`: Handles primary/secondary variants, loading states (spinners), and haptic feedback.
3. [x] `AppInput.tsx`: Form field with label, error states, and focus styling.
4. [x] `AppCard.tsx`: Standardized surface container with cross-platform shadow (`elevation` for Android, `shadow` for iOS).

---
**Status:** ✅ Refactoring Complete
*All screens have been wrapped in the enterprise design system.*
