# Prompt for React Native - Service Visit Screen

Copy and paste the prompt below into an LLM (e.g. Claude or Gemini) to generate a fully functional React Native screen for the **Service Visit Form** with complete business logic, dynamic UI visibility, auto-calculations, and API integrations.

---

## LLM System Prompt: React Native Service Visit Screen

```text
You are an expert React Native developer. Build a premium, high-fidelity, clean "Service Visit Form" screen using React Native, TypeScript, and Tailwind CSS (via NativeWind) or standard StyleSheet.

The form must replicate the exact business logic, visibility toggles, and calculations of our Laravel ERP system.

### 1. Form Fields & State Variables
Initialize state for the following fields:
- branch_id (Select/Dropdown)
- visit_date (Datepicker - Default: Today)
- company_vehicle (Radio: 'yes' / 'no' - Default: 'no')
- no_of_employe (Numeric Input - Default: 1, visible only in create mode)
- employee_id (Select/Dropdown - Default: Current logged-in user)
- is_engineer (Radio: 'Yes' / 'No' - Default: 'No')
- additional_employee_ids (Array of Dropdowns - populated dynamically based on no_of_employe count)
- engineer_id (Select/Dropdown)
- party_id_driver (Select/Dropdown)
- sales_party_name (Text Input)
- machine_number (Text Input with Search & Add buttons)
- machine_id (Hidden/Internal State)
- party_id (Hidden/Internal State)
- party_name (Readonly Text Input)
- visit_category (Select/Dropdown: 'ASC', 'U/W', 'B/W', 'Gw', 'V/Extended', 'Warranty')
- work_description (Text Input)
- location (Text Input - Required)
- complain (Textarea)
- remarks (Textarea)
- hmr (Numeric Input - Default 0)
- svr (Numeric Input - Default 0)
- svr_file (File attachment picker - supports PDF, JPG, PNG)
- call_count (Numeric Input - Default 0)
- km (Numeric Input - Required, Default 0)
- night_stay (Radio: 'None' / 'Late night' / 'Full night' - Default: 'None')
- ta_amount (Readonly Numeric Input - Default 0)
- stay_amount (Readonly Numeric Input - Default 0)
- da_amount (Numeric Input - Readonly for Service/Driver, Editable for Sales)
- total_amount (Readonly Numeric Input - Default 0)

### 2. Dynamic UI Visibility Logic
Depending on the selected `employee_id`'s department/role, determine the `type` ('SERVICE', 'Sales', or 'ADMIN'):
- If employee department is 5 (Driver) -> type = 'ADMIN'
- If employee department is 6 (Sales) -> type = 'Sales'
- Else -> type = 'SERVICE'

Apply visibility rules:
- **SERVICE Type:**
  - Show: Customer (Party Name), Machine No, Search/Add Machine buttons, Visit Category, Complain, HMR, Call, SVR, SVR File, Stay Amount, Work Description, Night Stay radio group.
  - Hide: Engineer dropdown, Customer (for Driver), Sales Party Name.
  - DA Amount: Readonly.
- **Sales Type:**
  - Show: Sales Party Name, Expense (DA Amount - editable).
  - Hide: Customer (Party Name), Machine No, Visit Category, Complain, HMR, Call, SVR, SVR File, Stay Amount, Work Description, Night Stay radio group.
- **ADMIN (Driver) Type:**
  - Show: "Engineer Required" radio buttons ('Yes' / 'No').
  - **If Engineer Required == 'Yes':**
    - Show: Engineer dropdown, Customer (for Driver), Location, Night Stay radio, Stay Amount.
    - Hide: Work Description, Visit Category, Complain, HMR, Call, SVR, SVR File.
    - DA Amount: Readonly.
  - **If Engineer Required == 'No':**
    - Show: Location, Work Description.
    - Hide: Engineer dropdown, Customer (for Driver), Visit Category, Complain, HMR, Call, SVR, SVR File, Night Stay radio, Stay Amount.
    - DA Amount: Readonly.

### 3. Live Auto-Calculations
Trigger these calculations when inputs change:
1. **TA (Travel Allowance):**
   - If `company_vehicle` == 'no' AND employee is NOT Sales (6) AND employee is NOT Driver (5) AND branch is NOT 'Khavda':
     - `ta_amount = km * 3.50`
   - Else: `ta_amount = 0`
2. **Night Stay Amount:**
   - If `night_stay` == 'Late night' -> `stay_amount = 350`
   - Else if `night_stay` == 'Full night' -> `stay_amount = 450`
   - Else -> `stay_amount = 0`
3. **DA (Daily Allowance):**
   - If employee is Sales (6): Users enters manually.
   - If employee is Driver (5): `da_amount = 50`
   - For Service: Call API `/get-da-amount` (params: `km`, `employee_id`, `visit_date`, `branch_id`, `visit_id`).
4. **Total Amount:**
   - `total_amount = ta_amount + stay_amount + da_amount`

### 4. Dynamic Additional Employee Dropdowns
- If `no_of_employe` is updated (e.g. to 3), dynamically render `(no_of_employe - 1)` employee selection dropdowns under the "Visiting Employee 2", "Visiting Employee 3", etc. labels.

### 5. API Endpoints Integration
Define Axios helper functions to interact with our backend APIs (all URLs require Sanctum Auth Headers):
1. **Branch List:**
   - `POST /api/branch-list`
2. **Employee List:**
   - `POST /api/employee-list`
3. **Machine Models List:**
   - `POST /api/machine-model-list`
4. **Customer Parties List:**
   - `POST /api/party-list`
5. **Machine Search:**
   - `POST /api/service-visit-get-party-by-machine` (body: `machine_no`)
   - Returns: `{ found: boolean, machine: { id, name }, party: { id, name }, message }`
6. **Add New Machine Modal:**
   - `POST /api/service-visit-store-machine` (body: `name`, `machine_model_id`, `party_id`)
7. **Get DA Rate:**
   - `POST /api/service-visit-get-da-amount` (body: `km`, `employee_id`, `visit_date`, `visit_id`, `branch_id`)
   - Returns: `{ rate }`
8. **Submit Form:**
   - `POST /api/service-visit-add` (Multipart/form-data containing all fields + `svr_file` binary)
9. **Service Visits List:**
   - `POST /api/service-visits-list`
10. **Bulk Approve Service Visits (Owner Only):**
    - `POST /api/service-visits-bulk-approve` (body: `{ updates: [ { id: number, status: 0|1, deduction_amount?: number, approval_remarks?: string } ] }`)

### 6. Design & UI Specifications
- Theme: Premium corporate look matching a professional ERP dashboard. White cards with crisp gray borders, subtle shadows, and colored icon tags.
- Use a clean scrollable layout.
- Include validation alerts for required fields (Branch, Visit Date, Visiting Employee, Location, KM).
- Use smooth loading spinners for machine lookup and DA calculation API calls.
```

---

## LLM System Prompt: React Native Dashboard / Home Screen with Count Cards

```text
You are an expert React Native developer. Build a premium, high-fidelity, clean "Dashboard / Home Screen" using React Native, TypeScript, and Tailwind CSS (via NativeWind) or standard StyleSheet.

The dashboard must display summary count cards fetched from our Laravel ERP API.

### 1. API Endpoints Integration
Define Axios helper functions to interact with our backend APIs (all URLs require Sanctum Auth Headers):
1. **Get Dashboard Count:**
   - `POST /api/get-dashboard-count`
   - Response:
     ```json
     {
       "success": true,
       "data": {
         "pendingServiceVisits": 5,
         "departmentsCount": 12,
         "designationsCount": 15,
         "employeesCount": 42
       },
       "message": "Data found!"
     }
     ```

### 2. Dashboard Layout & Cards UI
Implement a clean, modern layout:
1. **Header Section:** Shows a welcoming message (e.g., "Hello!" or dynamic username) and the current date.
2. **Summary Count Cards Grid:** Display a 2x2 grid (or responsive vertical list) of cards with role-based visibility:
   - **Pending Visits Card (Visible for both Employees & Owners):**
     - Value: `pendingServiceVisits`
     - Icon: `time` or `timer-outline` (Red theme background & text)
     - Action: Navigates to the Service Visits List screen.
   - **Departments Card (Visible ONLY for Owners/Admin):**
     - Value: `departmentsCount`
     - Icon: `git-network-outline` (Blue theme background & text)
   - **Designations Card (Visible ONLY for Owners/Admin):**
     - Value: `designationsCount`
     - Icon: `briefcase-outline` (Green theme background & text)
   - **Total Employees Card (Visible ONLY for Owners/Admin):**
     - Value: `employeesCount`
     - Icon: `people-outline` (Indigo theme background & text)

   *Note: If the logged-in user is an Employee, hide/do not render the Departments, Designations, and Total Employees cards.*

### 3. Design & UI Specifications
- Theme: Premium look matching a professional ERP dashboard. White cards with crisp borders, subtle shadows, and colored icon tags.
- Support Pull-to-Refresh to reload the counts from the API.
- Use smooth loading skeletons or a standard spinner while loading the statistics.
```

---

## LLM System Prompt: React Native Service Visits List & Approval Screen

```text
You are an expert React Native developer. Build a premium, high-fidelity, clean "Service Visits List & Approval" screen using React Native, TypeScript, and Tailwind CSS (via NativeWind) or standard StyleSheet.

The screen displays a list of logged service visits and must support role-based approval options (Owner vs. Employee).

### 1. State Variables & Initial Logic
- `visits` (Array of Service Visit objects fetched from `/api/service-visits-list`)
- `selectedVisitIds` (Set/Array of visit IDs currently selected via checkboxes for bulk action - Owner/Admin only)
- `searchQuery` (Text filter to search by Employee Name or Party Name)
- `statusFilter` (Select/Dropdown: 'All', 'Pending' [status = 0], 'Approved' [status = 1])
- `isApprovalModalVisible` (Boolean: to show/hide the Bulk Approval form modal)
- `deductionAmount` (Numeric Input: dynamic deduction amount to apply to selected visits)
- `approvalRemarks` (Textarea: approval comments to apply to selected visits)

### 2. Role-Based List UI (Checkboxes & Selection)
Identify the logged-in user's role (Owner or Employee):
- **Owner / Admin Role:**
  - Show a "Select All" checkbox in the header to select all visible Pending (status = 0) visits.
  - Show a checkbox next to each Pending visit card.
  - Show a sticky bottom **Action Bar** when 1 or more visits are selected.
  - The Action Bar must show:
    - Text: "{count} visits selected"
    - "Approve Selected" Button: Opens the Approval Modal.
    - "Deselect All" Button.
- **Employee Role:**
  - Do NOT render any checkboxes (hide list-level checkboxes and the select-all header).
  - Do NOT show the bottom Action Bar.

### 3. Approval Modal (Owner / Admin Only)
Clicking "Approve Selected" shows a modal containing:
- Summary of visits being approved.
- **Deduction Amount:** Number Input (Default: 0).
- **Approval Remarks:** Text Input / Textarea (Optional).
- **Submit Button:** Sends the payload to the API. Shows a loading indicator during submission. Upon success, clears selected checkboxes and reloads the visit list.

### 4. Card Layout & Columns
Replicate the columns specified in `config/modules/serviceVisit.php`:
- Each service visit card displays:
  - **Date:** `visit_date` (formatted DD/MM/YYYY)
  - **Employee:** `employee.name`
  - **Customer/Party:** `party.name` or `sales_party_name`
  - **Category:** `visit_category`
  - **KM:** `km`
  - **Net Amount:** Gross amount (`total_amount`) minus deduction (`deduction_amount` ?? 0).
  - **Remarks:** `approval_remarks` (if present)
  - **Status Badge:**
    - If status is 1 -> Approved (Green badge/text)
    - If status is 0 -> Pending (Yellow/Orange badge/text)
  - **SVR File Button:** If `svr_file` is present, render a small icon/button to open/download the attachment URL.

### 5. API Endpoints Integration
Define Axios helper functions to interact with our backend APIs (all URLs require Sanctum Auth Headers):
1. **Get Service Visits List:**
   - `POST /api/service-visits-list`
   - Returns: `{ success: true, data: [...] }`
2. **Bulk Approve/Update Status (Owner only):**
   - `POST /api/service-visits-bulk-approve`
   - Body format:
     ```json
     {
       "updates": [
         {
           "id": 12,
           "status": 1,s
           "deduction_amount": 50,
           "approval_remarks": "Approved with minor deductions"
         }
       ]
     }
   - Returns: `{ success: true, message: "Service visits status updated successfully." }`

### 6. Design & UI Specifications
- Theme: Premium corporate look matching a professional ERP dashboard. White cards with crisp gray borders, subtle shadows, and colored status/icon tags.
- Support Pull-to-Refresh to reload the visits list.
- Show a message (e.g. "No service visits found") if the list is empty.
- Show a skeleton loader or spinner while fetching from the API.
```
