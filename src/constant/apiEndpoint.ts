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

  // ================= WORK LOG / TASK =================
  WORK_LOG_ADD: 'work-log-add',
  WORK_LOG_LIST: 'work-logs-list',
  WORK_LOG_SINGLE_DETAIL: 'work-log-single-detail',
  WORK_LOG_STATUS_UPDATE: 'work-log-status-update',
  WORK_LOG_START_STOP: 'work-log-detail-work-start-stop',
  ACTIVE_TASK_DETAIL: 'active-task-detail',
  WORK_LOG_COUNT_BY_STATUS: 'work-log-count-by-status',
  STOP_ALL_STAFF_WORK: 'stop-all-staff-work',

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
  UPDATE_TASK_STOP_PUNCH_OUT_BY_TYPE: 'update-task-stop-and-puch-out-by-type',
  ATTENDANCE_DATA: 'attendance-data',
  GET_RUNNING_TASK: 'get-running-task',
  DASHBOARD_SALES: 'dashboard-sales',
  DASHBOARD_PURCHASE: 'dashboard-purchases',
  GET_DASHBOARD_COUNT: 'get-dashboard-count',
};
