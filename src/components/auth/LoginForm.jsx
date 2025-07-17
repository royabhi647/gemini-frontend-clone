import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Phone, Search, Loader2 } from 'lucide-react';
import { fetchCountries, sendOTP } from '../../store/slices/authSlice';
import toast from 'react-hot-toast';

const loginSchema = z.object({
  countryCode: z.string().min(1, 'Please select a country'),
  phoneNumber: z.string()
    .min(10, 'Phone number must be at least 10 digits')
    .max(15, 'Phone number cannot exceed 15 digits')
    .regex(/^\d+$/, 'Phone number can only contain digits'),
});

const LoginForm = ({ onSuccess }) => {
  const dispatch = useDispatch();
  const { countries, isLoading, error } = useSelector((state) => state.auth);
  const [searchCountry, setSearchCountry] = useState('');
  const [showCountries, setShowCountries] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      countryCode: '+91', 
      phoneNumber: '',
    },
  });

  const selectedCountryCode = watch('countryCode');

  useEffect(() => {
    dispatch(fetchCountries());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const filteredCountries = countries.filter(country =>
    country.name.toLowerCase().includes(searchCountry.toLowerCase()) ||
    country.code.includes(searchCountry)
  );

  const selectedCountry = countries.find(country => country.code === selectedCountryCode);

  const onSubmit = async (data) => {
    try {
      const fullPhoneNumber = `${data.countryCode}${data.phoneNumber}`;
      await dispatch(sendOTP({ phoneNumber: fullPhoneNumber })).unwrap();
      toast.success('OTP sent successfully!');
      onSuccess();
    } catch (err) {
      toast.error(err.message || 'Failed to send OTP');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-indigo-600 rounded-full flex items-center justify-center">
            <Phone className="h-6 w-6 text-white" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white">
            Welcome to Gemini
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Enter your phone number to get started
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6">
            {/* Country Code Selection */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Country
              </label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowCountries(!showCountries)}
                  className="w-full flex items-center justify-between px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <div className="flex items-center space-x-2">
                    <span>{selectedCountry?.flag}</span>
                    <span>{selectedCountry?.name || 'Select Country'}</span>
                    <span className="text-gray-500">{selectedCountryCode}</span>
                  </div>
                  <Search className="h-4 w-4 text-gray-400" />
                </button>

                {showCountries && (
                  <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg max-h-60 overflow-auto">
                    <div className="p-2">
                      <input
                        type="text"
                        placeholder="Search countries..."
                        value={searchCountry}
                        onChange={(e) => setSearchCountry(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div className="max-h-40 overflow-auto">
                      {filteredCountries.map((country) => (
                        <button
                          key={country.code}
                          type="button"
                          onClick={() => {
                            setValue('countryCode', country.code);
                            setShowCountries(false);
                            setSearchCountry('');
                          }}
                          className="w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 flex items-center space-x-2"
                        >
                          <span>{country.flag}</span>
                          <span className="flex-1">{country.name}</span>
                          <span className="text-gray-500">{country.code}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              {errors.countryCode && (
                <p className="mt-1 text-sm text-red-600">{errors.countryCode.message}</p>
              )}
            </div>

            {/* Phone Number Input */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Phone Number
              </label>
              <div className="flex">
                <div className="flex items-center px-3 py-2 bg-gray-50 dark:bg-gray-600 border border-r-0 border-gray-300 dark:border-gray-600 rounded-l-md">
                  <span className="text-gray-500 dark:text-gray-400">{selectedCountryCode}</span>
                </div>
                <input
                  {...register('phoneNumber')}
                  type="tel"
                  placeholder="Enter phone number"
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-r-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              {errors.phoneNumber && (
                <p className="mt-1 text-sm text-red-600">{errors.phoneNumber.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                  Sending OTP...
                </>
              ) : (
                'Send OTP'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginForm;