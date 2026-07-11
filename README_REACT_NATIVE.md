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

### 6. Design & UI Specifications
- Theme: Premium corporate look matching a professional ERP dashboard. White cards with crisp gray borders, subtle shadows, and colored icon tags.
- Use a clean scrollable layout.
- Include validation alerts for required fields (Branch, Visit Date, Visiting Employee, Location, KM).
- Use smooth loading spinners for machine lookup and DA calculation API calls.
```
