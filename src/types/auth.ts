// OTP Response Types for Laravel API

export interface OtpVerifyRequest {
  mobile_no: string | number;
  otp: string;
}

export interface OtpResendRequest {
  mobile_no: string | number;
}

export interface OtpVerifyResponse {
  success: boolean;
  message: string;
  data?: {
    api_token: string;
    name: string | null;
    profile_pic: string;
    email: string | null;
    role: string;
    mobile_no: number;
    staff_time_diff: number;
  };
}

export interface OtpResendResponse {
  success: boolean;
  message: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: Record<string, string[]>;
}
