import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Shield, Loader2, ArrowLeft } from 'lucide-react';
import { verifyOTP, sendOTP, clearError } from '../../store/slices/authSlice';
import toast from 'react-hot-toast';

const otpSchema = z.object({
  otp: z.string().length(6, 'OTP must be 6 digits'),
});

const OTPForm = ({ onBack }) => {
  const dispatch = useDispatch();
  const { phoneNumber, isLoading, error } = useSelector((state) => state.auth);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [countdown, setCountdown] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef([]);

  const {
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(otpSchema),
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const submitOTP = async (otpString) => {
    if (otpString.length !== 6) {
      toast.error('Please enter complete OTP');
      return;
    }

    try {
      await dispatch(verifyOTP({ phoneNumber, otp: otpString })).unwrap();
      toast.success('Login successful!');
    } catch (err) {
      toast.error(err.message || 'Invalid OTP');
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    }
  };

  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    const otpString = newOtp.join('');
    setValue('otp', otpString);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    if (otpString.length === 6) {
      submitOTP(otpString);
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const onSubmit = async () => {
    const otpString = otp.join('');
    submitOTP(otpString);
  };

  const handleResendOTP = async () => {
    if (!canResend) return;

    try {
      await dispatch(sendOTP({ phoneNumber })).unwrap();
      toast.success('OTP resent successfully!');
      setCountdown(30);
      setCanResend(false);
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } catch (err) {
      toast.error(err.message || 'Failed to resend OTP');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-indigo-600 rounded-full flex items-center justify-center">
            <Shield className="h-6 w-6 text-white" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white">
            Verify OTP
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Enter the 6-digit code sent to
          </p>
          <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400">
            {phoneNumber}
          </p>
          <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            For demo purposes, use: <span className="font-mono font-bold">123456</span>
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="flex justify-center space-x-3">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="w-12 h-12 text-center text-xl font-bold border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-indigo-500 focus:outline-none"
                  autoFocus={index === 0}
                />
              ))}
            </div>

            {errors.otp && (
              <p className="text-center text-sm text-red-600">{errors.otp.message}</p>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                  Verifying...
                </>
              ) : (
                'Verify OTP'
              )}
            </button>

            <div className="text-center">
              {canResend ? (
                <button
                  type="button"
                  onClick={handleResendOTP}
                  className="text-indigo-600 hover:text-indigo-500 font-medium"
                  disabled={isLoading}
                >
                  Resend OTP
                </button>
              ) : (
                <p className="text-gray-500 dark:text-gray-400">
                  Resend OTP in {countdown}s
                </p>
              )}
            </div>

            <button
              type="button"
              onClick={onBack}
              className="w-full flex items-center justify-center py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Phone Number
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default OTPForm;