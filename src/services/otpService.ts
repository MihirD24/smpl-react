import { apiPost } from './api/apiService';
import { API_ENDPOINTS } from '../constant/apiEndpoint';
import { OtpVerifyRequest, OtpResendRequest, OtpVerifyResponse, OtpResendResponse } from '../types/auth';

/**
 * Verify OTP with Laravel backend
 * @param mobileNo - User's mobile number
 * @param otp - 6-digit OTP code
 * @returns User token and info on success
 */
export const verifyOtp = async (
  mobileNo: string | number,
  otp: string
): Promise<OtpVerifyResponse> => {
  try {
    const formData = new FormData();
    formData.append('mobile_no', mobileNo.toString());
    formData.append('otp', otp);

    const response = await apiPost(
      API_ENDPOINTS.AUTH.VERIFY_OTP,
      formData
    );

    if (!response.success) {
      throw new Error(response.message || 'OTP verification failed');
    }

    return response;
  } catch (error) {
    console.error('OTP Verification Error:', error);
    throw error;
  }
};

/**
 * Resend OTP to user's mobile number
 * @param mobileNo - User's mobile number
 * @returns Success response
 */
export const resendOtp = async (
  mobileNo: string | number
): Promise<OtpResendResponse> => {
  try {
    const formData = new FormData();
    formData.append('mobile_no', mobileNo.toString());

    const response = await apiPost(
      API_ENDPOINTS.AUTH.RESEND_OTP,
      formData
    );

    if (!response.success) {
      throw new Error(response.message || 'Failed to resend OTP');
    }

    return response;
  } catch (error) {
    console.error('Resend OTP Error:', error);
    throw error;
  }
};
