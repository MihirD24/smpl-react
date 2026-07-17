# OTP Screen - Quick Setup Guide

## 🚀 Quick Start

The OTP screen has been fully implemented and integrated. Follow these steps to get it working with your Laravel backend.

## Step 1: Update Laravel Backend

Add these endpoints to your Laravel API:

### Route Definition (routes/api.php)
```php
Route::post('/verify-otp', [AuthController::class, 'verifyOtp']);
Route::post('/resend-otp', [AuthController::class, 'resendOtp']);
```

### Controller Methods (AuthController.php)

```php
public function verifyOtp(Request $request)
{
    $request->validate([
        'mobile_no' => 'required|numeric',
        'otp' => 'required|string|size:6'
    ]);

    $mobileNo = $request->input('mobile_no');
    $otp = $request->input('otp');

    // Verify OTP from your storage (cache, database, etc.)
    $storedOtp = Cache::get('otp_' . $mobileNo);

    if (!$storedOtp || $storedOtp !== $otp) {
        return response()->json([
            'success' => false,
            'message' => 'Invalid OTP'
        ], 401);
    }

    // Get user by phone
    $user = User::where('mobile_no', $mobileNo)->first();

    if (!$user) {
        return response()->json([
            'success' => false,
            'message' => 'User not found'
        ], 404);
    }

    // Clear used OTP
    Cache::forget('otp_' . $mobileNo);

    // Return user data with token
    return response()->json([
        'success' => true,
        'message' => 'OTP verified successfully',
        'data' => [
            'api_token' => $user->api_token,
            'name' => $user->name,
            'profile_pic' => $user->profile_pic,
            'email' => $user->email,
            'role' => $user->role,
            'mobile_no' => $user->mobile_no,
            'staff_time_diff' => 0
        ]
    ]);
}

public function resendOtp(Request $request)
{
    $request->validate([
        'mobile_no' => 'required|numeric'
    ]);

    $mobileNo = $request->input('mobile_no');

    // Check if user exists
    $user = User::where('mobile_no', $mobileNo)->first();

    if (!$user) {
        return response()->json([
            'success' => false,
            'message' => 'User not found'
        ], 404);
    }

    // Generate and send new OTP
    $otp = rand(100000, 999999);
    
    // Store OTP in cache for 5 minutes
    Cache::put('otp_' . $mobileNo, $otp, now()->addMinutes(5));

    // Send OTP via SMS
    // $this->sendSms($mobileNo, "Your OTP is: $otp");

    return response()->json([
        'success' => true,
        'message' => 'OTP sent successfully'
    ]);
}
```

## Step 2: Update API Endpoints (Optional)

The endpoints are already configured in your project:

```typescript
// src/constant/apiEndpoint.ts
AUTH: {
  AUTHENTICATE_USER: '/authenticate-user',
  VERIFY_OTP: '/verify-otp',
  RESEND_OTP: '/resend-otp',
}
```

Change endpoint paths if needed to match your Laravel routes.

## Step 3: Integrate SMS/WhatsApp OTP Sending

Option A: Using Twilio
```php
use Twilio\Rest\Client;

protected function sendOtp($mobileNo, $otp)
{
    $sid = env('TWILIO_ACCOUNT_SID');
    $token = env('TWILIO_AUTH_TOKEN');
    $from = env('TWILIO_PHONE_NUMBER');
    
    $client = new Client($sid, $token);
    $client->messages->create(
        '+91' . $mobileNo,
        [
            'from' => $from,
            'body' => "Your OTP is: $otp. Valid for 5 minutes."
        ]
    );
}
```

Option B: Using AWS SNS
```php
use Aws\Sns\SnsClient;

protected function sendOtp($mobileNo, $otp)
{
    $client = new SnsClient([
        'version' => 'latest',
        'region'  => env('AWS_DEFAULT_REGION')
    ]);
    
    $client->publish([
        'Message' => "Your OTP is: $otp. Valid for 5 minutes.",
        'PhoneNumber' => '+91' . $mobileNo
    ]);
}
```

## Step 4: Database Changes (Optional)

If storing OTP in database instead of cache:

```php
Schema::create('otp_verifications', function (Blueprint $table) {
    $table->id();
    $table->string('mobile_no');
    $table->string('otp');
    $table->timestamp('expires_at');
    $table->integer('attempts')->default(0);
    $table->timestamps();
    $table->index('mobile_no');
});
```

## Step 5: Test the Flow

### Manual Testing Steps:

1. **Launch App**
   - Run your React Native app
   - See SignIn screen

2. **Login**
   - Enter mobile number: `1234567890`
   - Enter password: `password`
   - Click "Sign In"

3. **OTP Screen**
   - You should see OTP screen
   - Notice timer counting down
   - Mobile number masked as: `****7890`

4. **Verify OTP**
   - Enter OTP code sent to phone
   - Or use test code: `123456` (for demo only)
   - Click "Verify OTP"

5. **Success**
   - Should navigate to Home screen
   - User token and info stored

### Troubleshooting:

```
❌ "OTP verification failed"
→ Check Laravel endpoint returns correct response format
→ Verify OTP was correctly stored and sent
→ Check API_ENDPOINTS configuration

❌ "User not found"
→ Ensure user exists in database with that mobile number
→ Check mobile number format matches

❌ "Cannot navigate to Home"
→ Ensure "Home" screen exists in app stack
→ Check navigation setup
→ Verify authContext is properly configured

❌ "OTP expires too quickly"
→ Increase cache duration in Laravel
→ Adjust timeLeft value in OtpScreen.tsx
```

## Step 6: Production Checklist

- [ ] Replace test OTP `123456` with real validation
- [ ] Enable SMS/WhatsApp OTP sending
- [ ] Set rate limiting on OTP requests (e.g., 3 attempts)
- [ ] Add OTP verification attempts tracking
- [ ] Implement OTP audit logging
- [ ] Add phone number verification on signup
- [ ] Test on real devices
- [ ] Load testing with high OTP volume
- [ ] Security review with team

## Step 7: Customize (Optional)

### Change OTP Length
```typescript
// src/screens/signIn/OtpScreen.tsx
const otpLength = 6; // Change to 4, 5, or 6
```

### Change Timer Duration
```typescript
const [timeLeft, setTimeLeft] = useState<number>(300); // 5 minutes
// 3 minutes = 180
// 10 minutes = 600
```

### Change Colors
Update the theme object in OtpScreen.tsx:
```typescript
const theme = {
  button: '#2563EB',           // Change verify button color
  success: '#10B981',          // Success message color
  warning: '#F59E0B',          // Warning when OTP expiring
  error: '#EF4444',            // Error message color
};
```

## Files Reference

| File | Purpose |
|------|---------|
| `src/screens/signIn/OtpScreen.tsx` | Main OTP screen component |
| `src/services/otpService.ts` | OTP API service calls |
| `src/types/auth.ts` | TypeScript type definitions |
| `src/navigation/authStack.tsx` | Navigation setup |
| `src/screens/signIn/signIn.tsx` | Login screen (updated) |
| `OTP_SCREEN_README.md` | Full implementation details |

## Support

For issues or questions:
1. Check the OTP_SCREEN_README.md for detailed documentation
2. Review TypeScript types in `src/types/auth.ts`
3. Check Laravel backend implementation
4. Verify API_ENDPOINTS configuration

---

**Ready to go!** 🎉 Your OTP authentication flow is set up and ready to integrate with your Laravel backend.
