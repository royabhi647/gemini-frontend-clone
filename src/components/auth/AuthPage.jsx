import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import LoginForm from './LoginForm';
import OTPForm from './OTPForm';

const AuthPage = () => {
  const { otpSent } = useSelector((state) => state.auth);
  const [currentStep, setCurrentStep] = useState(otpSent ? 'otp' : 'login');

  const handleLoginSuccess = () => {
    setCurrentStep('otp');
  };

  const handleBack = () => {
    setCurrentStep('login');
  };

  return (
    <>
      {currentStep === 'login' && <LoginForm onSuccess={handleLoginSuccess} />}
      {currentStep === 'otp' && <OTPForm onBack={handleBack} />}
    </>
  );
};

export default AuthPage;