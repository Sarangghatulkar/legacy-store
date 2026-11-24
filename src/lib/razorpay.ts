import Razorpay from 'razorpay';

export const getRazorpayInstance = () => {
  const key_id = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || '';
  const key_secret = process.env.RAZORPAY_KEY_SECRET || '';

  if (!key_id || !key_secret || key_id.includes('your_key') || key_secret.includes('your_razorpay') || key_id === 'rzp_test_placeholder') {
    return null;
  }

  try {
    return new Razorpay({
      key_id,
      key_secret,
    });
  } catch (err) {
    console.warn('Razorpay initialization bypassed:', err);
    return null;
  }
};

