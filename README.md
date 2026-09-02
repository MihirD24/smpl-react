# Smpl — Workforce Management App

> A modern, enterprise-grade HRMS (Human Resource Management System) mobile application built with **React Native**, designed for **Shantinath Motors Pvt Ltd**.

---

## 📱 App Overview

Smpl is a full-featured workforce management platform featuring:
- **Employee attendance** tracking with GPS punch-in/out
- **Leave management** with approval workflows
- **Service visit** management
- **Dashboard** with real-time HR metrics
- **Profile** management with salary & holiday views
- **Notifications** system
- **Admin & Employee** dual-role support

---

## 🎨 UI/UX Design System

This app follows a strict, modern design system inspired by enterprise HRMS apps like **Darwinbox, Keka, and Workday**.

### Color Palette

| Role | Light Mode | Dark Mode |
|---|---|---|
| **Primary Brand** | `#2563EB` | `#3B82F6` |
| **Screen Background** | `#F8FAFC` | `#0F172A` |
| **Surface / Card** | `#FFFFFF` | `#1E293B` |
| **Text Primary** | `#0F172A` | `#F8FAFC` |
| **Text Secondary** | `#64748B` | `#94A3B8` |
| **Border** | `#E2E8F0` | `#334155` |
| **Success** | `#10B981` | `#10B981` |
| **Error** | `#EF4444` | `#F87171` |
| **Warning** | `#F59E0B` | `#FBBF24` |

### Typography Scale
All font sizes use `moderateScale()` from `react-native-size-matters` to ensure consistent rendering across all screen densities.

| Element | Size | Weight |
|---|---|---|
| Hero Title | `moderateScale(24)` | 800 |
| Section Title | `moderateScale(20)` | 700 |
| Card Value | `moderateScale(22–24)` | 800 |
| Body | `moderateScale(14)` | 400 |
| Label (uppercase) | `moderateScale(11)` | 600, letterSpacing: 1.2 |
| Caption | `moderateScale(12)` | 400 |

### Spacing & Sizing
All spacing uses `verticalScale()` and `moderateScale()`:

| Component | Spec |
|---|---|
| Card border radius | `moderateScale(16–18)` |
| Input height | `verticalScale(52)` |
| Button height | `verticalScale(50–52)` |
| Button radius | `moderateScale(12–14)` |
| Icon container | `moderateScale(36–44)` |
| Screen H-padding | `moderateScale(16)` |

---

## 🏗 Architecture

```
src/
├── assets/
│   ├── images/          # Logo, profile placeholder
│   └── style/
│       ├── maincss.tsx       # Global shared styles (MainStyle hook)
│       ├── cardStyles.tsx    # Shared card styles + getCardTheme()
│       ├── formStyles.tsx    # Form field shared styles
│       └── commonFilter.tsx  # Filter bar shared styles
├── components/          # Reusable UI components
│   ├── appIcon.tsx          # Lucide icon wrapper
│   ├── screenWrapper.tsx    # Screen layout with header/safe area
│   ├── searchBarComponent.tsx
│   ├── button/addButton.tsx # FAB add button
│   └── filterBottomSheet/  # Reusable filter bottom sheet
├── context/
│   └── authContext.tsx  # Auth state & token management
├── navigation/          # React Navigation stacks & tab navigators
├── screens/
│   ├── signIn/          # Login & OTP verification
│   ├── home/            # Dashboard with metric cards
│   ├── attandance/      # Attendance list, punch, card, filters
│   ├── leave/           # Leave requests, add leave, card
│   ├── notification/    # Notification feed
│   ├── profile/         # User profile, quick access, settings
│   └── serviceVisit/   # Service visit management
├── services/            # API service layer
├── skeletonview/        # Skeleton loading placeholders
├── types/               # TypeScript type definitions
└── utils/               # Helpers (date, toast, etc.)
```

---

## 📐 Responsive Design Principles

### 1. React Native Size Matters
Every dimension in the app uses scaling functions:

```ts
import { moderateScale, verticalScale, scale } from 'react-native-size-matters';

// Use moderateScale for font sizes & horizontal dimensions (less aggressive scaling)
fontSize: moderateScale(14)
borderRadius: moderateScale(16)
paddingHorizontal: moderateScale(16)

// Use verticalScale for heights and vertical spacing
height: verticalScale(52)
paddingTop: verticalScale(20)
marginBottom: verticalScale(12)

// Use scale only when you want 1:1 width-based scaling
width: scale(40)
```

### 2. Safe Area Handling
All screens use `<SafeAreaView>` from `react-native-safe-area-context` to properly handle notches, status bars, and home indicators across iOS and Android devices.

### 3. Keyboard Handling
Login and form screens use `<KeyboardAvoidingView>` from `react-native-keyboard-controller` to push content above the keyboard, preventing input fields from being obscured.

### 4. Flex-based Layouts
Avoid fixed widths/heights for containers. Use `flex: 1`, `flexDirection`, `justifyContent`, and `alignItems` for fluid, screen-size-agnostic layouts.

---

## 🌓 Dark Mode

The app uses `useColorScheme()` from React Native to automatically detect the system theme. A `theme` or `t` object is computed at the top of each screen:

```ts
const isDarkMode = useColorScheme() === 'dark';
const t = {
  bg:     isDarkMode ? '#0F172A' : '#F8FAFC',
  card:   isDarkMode ? '#1E293B' : '#FFFFFF',
  text:   isDarkMode ? '#F8FAFC' : '#0F172A',
  sub:    isDarkMode ? '#94A3B8' : '#64748B',
  border: isDarkMode ? '#334155' : '#E2E8F0',
  primary: '#2563EB',
};
```

---

## 🔧 Running the App

### Prerequisites
- Node.js 18+
- React Native CLI
- Android Studio (for Android) / Xcode (for iOS)
- CocoaPods (for iOS)

### Install

```bash
yarn install
# or
npm install
```

### iOS
```bash
cd ios && pod install && cd ..
yarn ios
# or for production
yarn ios:prod
```

### Android
```bash
yarn android
# or for production APK
yarn android:release:apk
```

### Start Metro Bundler
```bash
yarn start
```

---

## 📦 Key Dependencies

| Package | Purpose |
|---|---|
| `react-native` | Core framework |
| `@react-navigation/native` | Navigation |
| `@gorhom/bottom-sheet` | Bottom sheets |
| `react-native-size-matters` | Responsive scaling |
| `react-native-safe-area-context` | Safe area handling |
| `react-native-keyboard-controller` | Keyboard avoidance |
| `lucide-react-native` | Icon library |
| `moment` | Date formatting |
| `@react-native-async-storage/async-storage` | Local storage |
| `react-native-gesture-handler` | Touch gestures |
| `react-native-maps` | Location/map features |
| `react-native-version-check` | App version display |

---

## 🖼 Screen Descriptions

| Screen | Path | Description |
|---|---|---|
| **Sign In** | `screens/signIn/signIn.tsx` | Login with mobile + password, hero banner design |
| **OTP** | `screens/signIn/OtpScreen.tsx` | 6-digit OTP verification with countdown |
| **Home** | `screens/home/home.tsx` | Dashboard with greeting, metric cards, quick actions |
| **Attendance List** | `screens/attandance/attendanceList.tsx` | Full attendance history with date filter |
| **Punch** | `screens/attandance/punch.tsx` | GPS-based punch in/out |
| **Attendance Card** | `screens/attandance/attendanceCard.tsx` | Single day attendance detail card |
| **Leave List** | `screens/leave/leaveList.tsx` | Leave requests with search & filter |
| **Add Leave** | `screens/leave/addLeave.tsx` | Leave application form |
| **Leave Card** | `screens/leave/leaveRquestCard.tsx` | Leave request card with approval actions |
| **Profile** | `screens/profile/profile.tsx` | User profile with hero banner, quick access, menu |
| **Notifications** | `screens/notification/notificationScreen.tsx` | Notification feed |
| **Service Visits** | `screens/serviceVisit/` | Service visit tracking |

---

## 👨‍💻 Code Style Guidelines

1. **TypeScript** — All components are typed with proper interfaces/types
2. **Functional Components** — Use React hooks, no class components
3. **No hardcoded colors** — Always use the `theme`/`t` object or named constants
4. **No hardcoded sizes** — Always use `moderateScale`, `verticalScale`, or `scale`
5. **Consistent naming** — camelCase for variables/functions, PascalCase for components
6. **Comments** — Section separators use `// ─── Section Name ──────` format
7. **StyleSheet** — Always define styles in `StyleSheet.create({})` at the bottom of the file

---

## 📄 License

Private — Shantinath Motors Pvt Ltd. All rights reserved.
