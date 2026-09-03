# SMPL HRMS — Modern ERP Mobile UI

This rebuild keeps the current service/API/navigation layer while replacing the presentation shell with a consistent ERP design.

### Shell
- One safe-area aware native React Navigation header style for stack screens.
- One native bottom tab bar for employee/admin navigation.
- Short tab labels: Home, Punch, Visits, Profile.
- No absolute-position custom top headers over the iOS status bar.
- FAB is raised above the bottom navigation.

### Splash
`appNav.tsx` includes a full-screen branded splash using the supplied `bootsplash_logo.png`. It uses React Native Animated (not Worklets) to avoid UI-runtime callback issues. The construction loader is a lightweight JCB-inspired animated field-machine visual built with native Views, so no extra dependency is required.

### Dashboard
The Home screen now has a dark industrial ERP hero, live-status chip, quick access actions, operational snapshot cards and a workday-status panel.

### Punch
Punch screen keeps location/camera/punch APIs but uses a structured location map card, work-status card, real-time clock, shift information, and a large slide-to-punch action.

### Integration
Replace the project's `src/` with this folder. Native iOS/Android BootSplash assets remain compatible; native project files were not rewritten because the supplied artifact was `src`-only.
