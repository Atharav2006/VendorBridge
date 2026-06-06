import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../contexts/AuthContext';
import ParticleBackground from '../../components/ui/ParticleBackground';
import { Eye, EyeOff, Loader2, ShieldCheck, Mail, Lock } from 'lucide-react';

export const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors }
  } = useForm({
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false
    }
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    setErrorMsg('');
    try {
      await login(data.email, data.password);
      navigate('/dashboard');
    } catch (err) {
      setErrorMsg('Invalid credentials. Please verify details.');
    } finally {
      setIsLoading(false);
    }
  };

  // Quick credentials injector for evaluation
  const handleQuickFill = (email, pass) => {
    setValue('email', email);
    setValue('password', pass);
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-white overflow-hidden px-4">
      {/* Background Effect */}
      <ParticleBackground />

      <div className="relative z-10 w-full max-w-md">
        
        {/* Logo Badge */}
        <div className="flex flex-col items-center mb-8">
          <Link to="/" className="flex items-center space-x-2.5 mb-2">
            <div className="w-10 h-10 rounded-xl bg-[#1591DC] flex items-center justify-center text-slate-800 shadow-sm">
              <ShieldCheck className="w-5.5 h-5.5" />
            </div>
            <span className="font-extrabold text-2xl tracking-wider text-slate-900">
              Vendor<span className="text-[#1591DC] font-black">Bridge</span>
            </span>
          </Link>
          <p className="text-slate-500 text-xs">Enter your authorization credentials below</p>
        </div>

        {/* Login Form Box */}
        <div className="bg-white border border-[#E4EFE7] rounded-2xl p-8 shadow-md relative overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-[#99BC85] via-[#1591DC] to-[#1591DC]" />

          {errorMsg && (
            <div className="mb-5 p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-xs font-semibold">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 block">Work Email Address</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                  <Mail className="w-4 h-4" />
                </span>
                <input
                  type="email"
                  placeholder="name@company.com"
                  className={`w-full pl-10 pr-4 py-3 rounded-xl bg-[#F4F7FB] border border-transparent focus:border-[#1591DC] focus:bg-white focus:ring-2 focus:ring-[#1591DC]/20 text-slate-800 text-sm outline-none transition ${
                    errors.email ? 'border-red-500/50 focus:border-red-500' : ''
                  }`}
                  {...register('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address'
                    }
                  })}
                />
              </div>
              {errors.email && (
                <p className="text-[10px] text-red-500 font-semibold">{errors.email.message}</p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-xs font-semibold text-slate-700 block">Security Password</label>
                <a href="#" className="text-[10px] font-bold text-[#1591DC] hover:underline">Forgot password?</a>
              </div>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className={`w-full pl-10 pr-10 py-3 rounded-xl bg-[#F4F7FB] border border-transparent focus:border-[#1591DC] focus:bg-white focus:ring-2 focus:ring-[#1591DC]/20 text-slate-800 text-sm outline-none transition ${
                    errors.password ? 'border-red-500/50 focus:border-red-500' : ''
                  }`}
                  {...register('password', {
                    required: 'Password is required',
                    minLength: { value: 4, message: 'Password must be at least 4 characters' }
                  })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-[10px] text-red-500 font-semibold">{errors.password.message}</p>
              )}
            </div>

            {/* Remember Me */}
            <div className="flex items-center">
              <input
                id="rememberMe"
                type="checkbox"
                className="w-4 h-4 rounded border-slate-300 bg-white text-[#1591DC] focus:ring-[#1591DC] cursor-pointer"
                {...register('rememberMe')}
              />
              <label htmlFor="rememberMe" className="ml-2 text-xs font-medium text-slate-600 select-none cursor-pointer">
                Remember my session credentials
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 bg-[#1591DC] hover:bg-[#1281c4] disabled:opacity-50 text-slate-800 rounded-xl font-bold text-sm shadow-lg shadow-[#1591DC]/20 transition flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4.5 h-4.5 animate-spin" />
                  <span>Signing In...</span>
                </>
              ) : (
                <span>Sign In to System</span>
              )}
            </button>
          </form>

          {/* Direct Sign Up option */}
          <div className="text-center mt-6 text-xs text-slate-500">
            Don't have an enterprise account?{' '}
            <Link to="/signup" className="font-bold text-[#1591DC] hover:underline">
              Create Account
            </Link>
          </div>
        </div>

        {/* DEMO ACCOUNTS DRAWER */}
        <div className="mt-6 bg-[#FDFAF6] border border-[#E4EFE7] rounded-xl p-4 shadow-sm">
          <p className="text-slate-500 font-bold text-xs mb-3 text-center uppercase tracking-wider">
            Review Credentials Fast-Fill
          </p>
          <div className="grid grid-cols-2 gap-2 text-[10px]">
            {[
              { role: 'Admin', email: 'admin@vendorbridge.com' },
              { role: 'Procurement Officer', email: 'officer@vendorbridge.com' },
              { role: 'Manager', email: 'manager@vendorbridge.com' },
              { role: 'Vendor', email: 'vendor@vendorbridge.com' }
            ].map(cred => (
              <button
                key={cred.role}
                onClick={() => handleQuickFill(cred.email, 'pass123')}
                className="bg-white border border-[#E4EFE7] hover:border-[#1591DC]/30 text-slate-700 hover:text-slate-900 px-2 py-1.5 rounded-lg text-left transition font-medium flex flex-col shadow-sm"
              >
                <span className="text-[#99BC85] font-bold text-[9px]">{cred.role}</span>
                <span className="truncate opacity-80">{cred.email}</span>
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
export default LoginPage;
