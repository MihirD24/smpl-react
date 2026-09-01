# Development Process Plan

## 1. Analysis of `README_REACT_NATIVE.md`
The `README_REACT_NATIVE.md` file serves as a collection of System Prompts / Specifications for generating React Native screens using an LLM. It contains detailed requirements for building various features of an ERP mobile application.

### Key Screens Identified:
1. **Service Visit Screen:**
   - Dynamic form with multiple visibility rules based on the employee's department (ADMIN, SERVICE, Sales).
   - Live auto-calculations for Travel Allowance (TA), Daily Allowance (DA), and Night Stay.
   - Dynamic additional employee selections and branch filtering.
   - Comprehensive API integrations for lookups (Branches, Employees, Machines, Parties) and submission.
2. **Dashboard / Home Screen:**
   - Summary count cards (Pending Visits, Departments, Designations, Total Employees).
   - Role-based visibility (Owners see all, Employees see fewer metrics).
3. **Service Visits List & Approval Screen:**
   - List view with conditional rendering based on user role (Admin/Owner vs Employee).
   - Bulk approval functionality for Owners with dynamic deduction amount and remarks.
4. **Leave Form Screen (New Addition):**
   - Simple form to apply for leave with fields: `employee_id`, `type`, `mode`, `from_date`, `to_date`.
   - API endpoints: Employee list lookup and Leave submission.
5. **Salary Calculation Screen (New Addition):**
   - Input form for `employee_id`, `entry_date`, `additional_amt` (and optional filters).
   - Real-time preview of salary calculations (Gross, Net, Deductions, Leaves, Working Days).

## 2. Planned Process
To successfully implement these screens into the `smpl-react` application, the following process should be followed:

### Phase 1: Setup & Architecture
- Ensure React Native, TypeScript, and NativeWind (Tailwind CSS) are properly configured.
- Set up an API service layer (using Axios) with Sanctum authentication interceptors.
- Prepare a global state management solution or Context for the logged-in user's session (to handle Role/Department based visibility).

### Phase 2: Building Core Features
- **Task A: Service Visit Screen**
  - Implement form state using `React Hook Form` (or similar).
  - Create reusable UI components: Dropdowns, DatePickers, Radio Groups.
  - Implement complex side-effects for TA/DA/Stay calculations.
- **Task B: Service Visits List & Approval**
  - Build List UI with Pull-to-Refresh.
  - Implement bulk selection state and Approval Modal.
- **Task C: Dashboard**
  - Create the dashboard layout and map the summary cards to the API data.
- **Task D: Leave Form & Salary Calculation (Recently Added)**
  - Scaffold the Leave Form screen and its submission logic.
  - Scaffold the Salary Calculation screen and its real-time preview API integration.

### Phase 3: Integration & Testing
- Connect all screens to navigation (e.g., React Navigation).
- Test role-based visibility across all screens.
- Validate form validations and edge cases (e.g., API loading states, error handling).
