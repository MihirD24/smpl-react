export const API_ENDPOINTS = {
  // ================= ATTENDANCE =================
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

  // ================= LEAVE =================
  LEAVE_BY_USER: 'leave-by-user',
  ADD_LEAVE: 'add-leave',
  LEAVE_ACCEPT_REJECT: 'leave-accept-reject',

  // ================= NOTIFICATION =================
  GET_NOTIFICATION_LIST: 'get-notification-list',

  // ================= USER =================
  USER_DETAILS: 'user-details',



  // ================= SALARY =================
  SALARY_LIST: 'salary-list',
  SALARY_CALCULATE: 'salary-calculate',
  PRINT_SALARY_SLIP: 'print-salary-slip',
  


  // ================= Developers list =================


  HOLIDAY_LIST: 'holiday-list',

  //============Admin Dashboard================
  ATTENDANCE_DATA: 'attendance-data',
  DASHBOARD_SALES: 'dashboard-sales',
  DASHBOARD_PURCHASE: 'dashboard-purchases',
  GET_DASHBOARD_COUNT: 'get-dashboard-count',

  //============Service Visit================
  BRANCH_LIST: 'branch-list',
  EMPLOYEE_LIST: 'employee-list',
  SERVICE_VISIT_GET_EMPLOYEES_BY_BRANCH: 'service-visit-get-employees-by-branch',
  MACHINE_MODEL_LIST: 'machine-model-list',
  SERVICE_VISIT_GET_PARTY_BY_MACHINE: 'service-visit-get-party-by-machine',
  SERVICE_VISIT_STORE_MACHINE: 'service-visit-store-machine',
  SERVICE_VISIT_GET_DA_AMOUNT: 'service-visit-get-da-amount',
  SERVICE_VISIT_ADD: 'service-visit-add',
  SERVICE_VISITS_LIST: 'service-visits-list',
  SERVICE_VISITS_BULK_APPROVE: 'service-visits-bulk-approve',
};
