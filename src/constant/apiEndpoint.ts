export const API_ENDPOINTS = {
  // ================= ATTENDANCE =================
  AUTH: {
    AUTHENTICATE_USER: '/authenticate-user',
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

  // ================= PERFORMANCE =================
  STAFF_PERFORMANCE_REPORT: 'get-staff-performance-report',
  TODAY_STAFF_PERFORMANCE: 'get-today-staff-performance',
  PROJECT_PERFORMANCE: 'get-project-performance',

  // ================= PROJECT & MODULE =================
  ALLOTED_PROJECT_LIST: 'alloted-projects-list',
  PROJECT_MODULE_LIST: 'get-project-by-work-module-name',
  ADD_PROJECT_MODULE: 'add-project-module',

  // ================= ACCOUNT =================
  ACCOUNT_BOOK_LIST: 'account-book-list',
  PARTY_LIST: 'party-list',
  ACCOUNT_BOOK_ADD: 'account-book-add',
  TRANSACTION_HEAD_BY_ACCOUNT_BOOK: 'transaction-head-get-by-account-book',

  // ================= SALARY =================
  SALARY_LIST: 'salary-list',
  PRINT_SALARY_SLIP: 'print-salary-slip',
  // ================= PROJECT REMAINING =================
  GET_PROJECT_REMAINING_POINT: 'get-project-remain-point',
  ADD_PROJECT_REMAINING_POINT: 'add-project-remain-point',
  GET_PROJECT_BY_EMPLOYEE: 'get-project-by-employee',

  //=================PROJECT REMINDER=================
  ADD_REMINDER: 'add-reminder',
  GET_REMINDER_TYPE: 'get-reminder-type',
  GET_REMINDER: 'get-reminder',
  UPDATE_STATUS_BY_TYPE: 'update-status-by-type',

  // ================= Developers list =================

  DEVELOPERS_LIST: 'developers-list',

  USERS_LIST: 'users-list',

  HOLIDAY_LIST: 'holiday-list',

  //============Admin Dashboard================
  ATTENDANCE_DATA: 'attendance-data',
  DASHBOARD_SALES: 'dashboard-sales',
  DASHBOARD_PURCHASE: 'dashboard-purchases',
  GET_DASHBOARD_COUNT: 'get-dashboard-count',

  //============Service Visit================
  BRANCH_LIST: 'branch-list',
  EMPLOYEE_LIST: 'employee-list',
  MACHINE_MODEL_LIST: 'machine-model-list',
  SERVICE_VISIT_GET_PARTY_BY_MACHINE: 'service-visit-get-party-by-machine',
  SERVICE_VISIT_STORE_MACHINE: 'service-visit-store-machine',
  SERVICE_VISIT_GET_DA_AMOUNT: 'service-visit-get-da-amount',
  SERVICE_VISIT_ADD: 'service-visit-add',
  SERVICE_VISITS_LIST: 'service-visits-list',
};
