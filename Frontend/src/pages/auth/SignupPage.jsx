import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../contexts/AuthContext';
import ParticleBackground from '../../components/ui/ParticleBackground';
import { Loader2, ShieldCheck, Mail, Lock, User, Briefcase } from 'lucide-react';

export const SignupPage = () => {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    defaultValues: {
      name: '',
      email: '',
      password: '',
      role: 'Procurement Officer'
    }
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    setErrorMsg('');
    try {
      await signup(data.name, data.email, data.password, data.role);
      navigate('/dashboard');
    } catch (err) {
      setErrorMsg('Account registration failed. Try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-white overflow-hidden px-4">
      {/* Background Particles */}
      <ParticleBackground />

      <div className="relative z-10 w-full max-w-md">
        
        {/* Logo Badge */}
        <div className="flex flex-col items-center mb-6">
          <Link to="/" className="flex items-center space-x-2.5 mb-2">
            <div className="w-10 h-10 rounded-xl bg-[#1591DC] flex items-center justify-center text-slate-800 shadow-sm">
              <ShieldCheck className="w-5.5 h-5.5" />
            </div>
            <span className="font-extrabold text-2xl tracking-wider text-slate-900">
              Vendor<span className="text-[#1591DC] font-black">Bridge</span>
            </span>
          </Link>
          <p className="text-slate-500 text-xs">Create your enterprise access profile</p>
        </div>

        {/* Signup Form Box */}
        <div className="bg-white border border-[#E4EFE7] rounded-2xl p-8 shadow-md relative overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-[#99BC85] via-[#1591DC] to-[#1591DC]" />

          {errorMsg && (
            <div className="mb-5 p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-xs font-semibold">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            
            {/* Full Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 block">Full Name</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                  <User className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  placeholder="John Doe"
                  className={`w-full pl-10 pr-4 py-3 rounded-xl bg-[#F4F7FB] border border-transparent focus:border-[#1591DC] focus:bg-white focus:ring-2 focus:ring-[#1591DC]/20 text-slate-800 text-sm outline-none transition ${
                    errors.name ? 'border-red-500/50 focus:border-red-500' : ''
                  }`}
                  {...register('name', { required: 'Name is required' })}
                />
              </div>
              {errors.name && (
                <p className="text-[10px] text-red-500 font-semibold">{errors.name.message}</p>
              )}
            </div>

            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 block">Work Email</label>
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
              <label className="text-xs font-semibold text-slate-700 block">Security Password</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  type="password"
                  placeholder="••••••••"
                  className={`w-full pl-10 pr-4 py-3 rounded-xl bg-[#F4F7FB] border border-transparent focus:border-[#1591DC] focus:bg-white focus:ring-2 focus:ring-[#1591DC]/20 text-slate-800 text-sm outline-none transition ${
                    errors.password ? 'border-red-500/50 focus:border-red-500' : ''
                  }`}
                  {...register('password', {
                    required: 'Password is required',
                    minLength: { value: 6, message: 'Password must be at least 6 characters' }
                  })}
                />
              </div>
              {errors.password && (
                <p className="text-[10px] text-red-500 font-semibold">{errors.password.message}</p>
              )}
            </div>

            {/* Role Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 block">Organizational Role</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500 z-10">
                  <Briefcase className="w-4 h-4" />
                </span>
                <select
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#F4F7FB] border border-transparent focus:border-[#1591DC] focus:bg-white focus:ring-2 focus:ring-[#1591DC]/20 text-slate-800 text-sm appearance-none outline-none transition cursor-pointer relative"
                  {...register('role', { required: 'Role selection is required' })}
                >
                  <option value="Procurement Officer">Procurement Officer (Creates RFQs, POs)</option>
                  <option value="Manager">Finance Manager (Approves / Rejects bids)</option>
                  <option value="Admin">Administrator (Complete System Access)</option>
                  <option value="Vendor">Supplier / Vendor Partner (Submits quotations)</option>
                </select>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 bg-[#1591DC] hover:bg-[#1281c4] disabled:opacity-50 text-slate-800 rounded-xl font-bold text-sm shadow-lg shadow-[#1591DC]/20 transition flex items-center justify-center space-x-2 pt-2.5 mt-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4.5 h-4.5 animate-spin" />
                  <span>Registering...</span>
                </>
              ) : (
                <span>Register Account</span>
              )}
            </button>
          </form>

          {/* Direct Sign In option */}
          <div className="text-center mt-6 text-xs text-slate-500">
            Already have an account?{' '}
            <Link to="/login" className="font-bold text-[#1591DC] hover:underline">
              Sign In
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};
export default SignupPage;
