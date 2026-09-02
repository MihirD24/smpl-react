# UI/UX Design System & Responsive Styling Guide

This document outlines the modern UI/UX design system for the HRMS Application.

## 1. Design Philosophy
Our goal is to create a sleek, enterprise-grade application akin to modern HRMS apps. The UI should be:
- **Clean & Minimal:** Reduce clutter, use ample whitespace.
- **Consistent:** Uniform colors, typography, and corner radiuses.
- **Accessible:** High contrast ratios, readable font sizes, and dark mode support.
- **Responsive:** Adapt seamlessly across various mobile screen sizes (using `react-native-size-matters`).

## 2. Color Palette
We use a semantic color palette that adapts to Light and Dark modes.

| Color Role | Light Mode | Dark Mode | Usage |
|---|---|---|---|
| **Primary (Brand)** | `#2563EB` (Blue-600) | `#3B82F6` (Blue-500) | Buttons, active states, key highlights |
| **Background (Screen)** | `#F8FAFC` (Slate-50) | `#0F172A` (Slate-900) | Main app background |
| **Surface (Card)** | `#FFFFFF` | `#1E293B` (Slate-800) | Cards, modals, bottom sheets |
| **Text Primary** | `#0F172A` (Slate-900) | `#F8FAFC` (Slate-50) | Headings, main body text |
| **Text Secondary** | `#64748B` (Slate-500) | `#94A3B8` (Slate-400) | Subtitles, labels, placeholders |
| **Border** | `#E2E8F0` (Slate-200) | `#334155` (Slate-700) | Dividers, input borders |
| **Success** | `#10B981` (Emerald-500) | `#10B981` | Success states, attendance markers |
| **Danger/Error** | `#EF4444` (Red-500) | `#F87171` (Red-400) | Error messages, destructive actions |

## 3. Typography
- Use system fonts (San Francisco on iOS, Roboto on Android) for native feel and performance.
- Font weights: Regular (400), Medium (500), SemiBold (600), Bold (700).
- Scale fonts using `moderateScale()` to ensure they aren't too small on dense screens or too large on tablets.

## 4. Responsive Design Strategy
To ensure the app looks perfect on every phone screen (from iPhone SE to Pro Max, and varied Android devices):
1. **`react-native-size-matters`**: Use `scale()`, `verticalScale()`, and `moderateScale()` instead of hardcoded numbers for padding, margins, and font sizes.
2. **Flexbox**: Rely on Flexbox (`flex: 1`, `justifyContent`, `alignItems`) rather than fixed heights/widths.
3. **Safe Area**: Always wrap screens in `<SafeAreaView>` to avoid notches and navigation bars.
4. **Keyboard Handling**: Use `<KeyboardAvoidingView>` (or `react-native-keyboard-controller`) to prevent the keyboard from obscuring inputs.

## 5. UI Component Guidelines

### Cards
Cards should have subtle shadows in light mode and borders in dark mode.
```javascript
card: {
  backgroundColor: theme.card,
  borderRadius: 16,
  padding: moderateScale(16),
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.05,
  shadowRadius: 10,
  elevation: 2, // Android
  borderWidth: isDarkMode ? 1 : 0,
  borderColor: theme.border,
}
```

### Buttons
Primary buttons should be tall enough for easy tapping (min 48px), with rounded corners.
```javascript
button: {
  height: verticalScale(50),
  borderRadius: moderateScale(12),
  backgroundColor: theme.primary,
  justifyContent: 'center',
  alignItems: 'center',
}
```

### Inputs
Inputs should have clear labels, spacious padding, and distinct focus states.
```javascript
input: {
  height: verticalScale(50),
  borderRadius: moderateScale(10),
  backgroundColor: theme.inputBg,
  paddingHorizontal: moderateScale(16),
  color: theme.textPrimary,
  borderWidth: 1,
  borderColor: theme.border,
}
```

## 6. Implementation Process
1. **Theme Context:** Ensure a global theme context or hook (like `useColorScheme`) is used across all components in `src/screens`.
2. **Refactor Hardcoded Styles:** Identify all screens in `src/screens` (e.g., `home`, `attandance`, `profile`) and replace fixed pixels with `moderateScale` and theme colors.
3. **Iconography:** Use modern vector icons (e.g., `lucide-react-native`) consistently with matching stroke widths and sizes.
4. **Loading States:** Replace generic spinners with Skeleton loaders for a premium feel.
