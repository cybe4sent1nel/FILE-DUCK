import axios from 'axios';

/**
 * Verify Google reCAPTCHA token
 * @param token - The reCAPTCHA token from the client
 * @returns true if valid, false otherwise
 */
export async function verifyCaptcha(token: string): Promise<boolean> {
  const secretKey = process.env.RECAPTCHA_SECRET_KEY;
  
  if (!secretKey) {
    console.warn('⚠️ RECAPTCHA_SECRET_KEY not configured');
    return true; // Allow in development if not configured
  }

  try {
    const response = await axios.post(
      'https://www.google.com/recaptcha/api/siteverify',
      null,
      {
        params: {
          secret: secretKey,
          response: token,
        },
      }
    );

    if (response.data.success) {
      console.log('✓ reCAPTCHA verified successfully');
      return true;
    } else {
      console.warn('❌ reCAPTCHA verification failed:', response.data['error-codes']);
      return false;
    }
  } catch (error) {
    console.error('❌ reCAPTCHA verification error:', error);
    return false;
  }
}

export default verifyCaptcha;
