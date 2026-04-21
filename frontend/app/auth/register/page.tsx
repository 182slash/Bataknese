'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Crown, Mail, Lock, User, Calendar, Phone, MapPin, ChevronRight, ChevronLeft, Loader2 } from 'lucide-react';
import { useAuthStore } from '@/lib/store/authStore';
import { MargaReference } from '@/lib/types';
import apiClient from '@/lib/api/client';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const router = useRouter();
  const { register, isLoading, isAuthenticated } = useAuthStore();
  const [step, setStep] = useState(1);
  const [margaList, setMargaList] = useState<MargaReference>({});
  const [formData, setFormData] = useState({
    // Step 1: Account
    email: '',
    password: '',
    confirmPassword: '',
    full_name: '',
    
    // Step 2: Personal/Marga
    marga: '',
    gender: 'Male' as 'Male' | 'Female' | 'Other',
    date_of_birth: '',
    phone: '',
    address: '',
    city: '',
    province: '',
  });

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    }

    // Fetch marga list
    const fetchMargaList = async () => {
      try {
        const response = await apiClient.get('/auth/marga-list');
        if (response.data.success) {
          setMargaList(response.data.data);
        }
      } catch (error) {
        console.error('Failed to fetch marga list:', error);
      }
    };
    fetchMargaList();
  }, [isAuthenticated, router]);

  const validateStep1 = () => {
    if (!formData.email || !formData.password || !formData.full_name) {
      toast.error('Please fill in all required fields');
      return false;
    }
    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (!formData.marga || !formData.date_of_birth) {
      toast.error('Please fill in all required fields');
      return false;
    }
    return true;
  };

  const handleNextStep = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    }
  };

  const handlePrevStep = () => {
    setStep(1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateStep2()) return;

    const submitData = {
      full_name: formData.full_name,
      marga: formData.marga,
      email: formData.email,
      password: formData.password,
      gender: formData.gender,
      date_of_birth: formData.date_of_birth,
      phone: formData.phone,
      address: formData.address,
      city: formData.city,
      province: formData.province,
    };

    const success = await register(submitData);
    if (success) {
      router.push('/dashboard');
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-dark via-primary to-gold relative overflow-hidden">
        <div className="absolute inset-0 ulos-pattern opacity-20"></div>
        
        <div className="relative z-10 flex flex-col justify-center items-center text-center p-12 text-white">
          <div className="mb-8">
            <div className="w-24 h-24 bg-white/10 backdrop-blur-lg rounded-2xl flex items-center justify-center mb-6 mx-auto shadow-2xl">
              <Crown className="w-14 h-14 text-gold" />
            </div>
            <h1 className="font-cinzel text-6xl font-bold mb-4">Join Bataknese</h1>
            <p className="text-2xl font-cinzel text-gold-light">Step {step} of 2</p>
          </div>

          <div className="max-w-md space-y-6">
            <p className="text-xl leading-relaxed">
              {step === 1 
                ? "Create your account and get your exclusive Batak ID Card"
                : "Tell us more about your Batak heritage and personal details"
              }
            </p>
            
            <div className="flex items-center justify-center space-x-4 pt-6">
              <div className={`flex items-center justify-center w-12 h-12 rounded-full border-2 ${step >= 1 ? 'bg-white text-primary border-white' : 'border-white/50 text-white'}`}>
                <span className="font-bold">1</span>
              </div>
              <div className="w-16 h-1 bg-white/30">
                <div className={`h-full bg-white transition-all duration-300 ${step >= 2 ? 'w-full' : 'w-0'}`}></div>
              </div>
              <div className={`flex items-center justify-center w-12 h-12 rounded-full border-2 ${step >= 2 ? 'bg-white text-primary border-white' : 'border-white/50 text-white'}`}>
                <span className="font-bold">2</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Registration Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-dark overflow-y-auto">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden mb-8 text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-primary to-gold rounded-xl flex items-center justify-center mx-auto mb-4">
              <Crown className="w-10 h-10 text-white" />
            </div>
            <h1 className="font-cinzel text-3xl font-bold text-white">Bataknese</h1>
            <p className="text-gray-400">Step {step} of 2</p>
          </div>

          <div className="ulos-border-card mb-8">
            <div className="ulos-border-card-inner p-8">
              <div className="text-center mb-8">
                <h2 className="font-cinzel text-3xl font-bold text-white mb-2">
                  {step === 1 ? 'Create Account' : 'Personal Details'}
                </h2>
                <p className="text-gray-400">
                  {step === 1 ? 'Set up your credentials' : 'Complete your profile'}
                </p>
              </div>

              <form onSubmit={step === 2 ? handleSubmit : (e) => { e.preventDefault(); handleNextStep(); }} className="space-y-6">
                {step === 1 ? (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Full Name *
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
                        <input
                          type="text"
                          value={formData.full_name}
                          onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                          className="input-primary pl-12"
                          placeholder="John Siregar"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Email Address *
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="input-primary pl-12"
                          placeholder="your.email@example.com"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Password *
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
                        <input
                          type="password"
                          value={formData.password}
                          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                          className="input-primary pl-12"
                          placeholder="Minimum 6 characters"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Confirm Password *
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
                        <input
                          type="password"
                          value={formData.confirmPassword}
                          onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                          className="input-primary pl-12"
                          placeholder="Confirm your password"
                          required
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="btn-primary w-full !py-4 text-lg font-semibold flex items-center justify-center"
                    >
                      Continue to Personal Details
                      <ChevronRight className="w-5 h-5 ml-2" />
                    </button>
                  </>
                ) : (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Marga (Clan) *
                      </label>
                      <select
                        value={formData.marga}
                        onChange={(e) => setFormData({ ...formData, marga: e.target.value })}
                        className="input-primary"
                        required
                      >
                        <option value="">Select your marga</option>
                        {Object.entries(margaList).map(([subEthnic, margas]) => (
                          <optgroup key={subEthnic} label={subEthnic}>
                            {margas.map((marga) => (
                              <option key={marga.id} value={marga.marga_name}>
                                {marga.marga_name}
                              </option>
                            ))}
                          </optgroup>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Gender *
                      </label>
                      <div className="grid grid-cols-3 gap-3">
                        {(['Male', 'Female', 'Other'] as const).map((gender) => (
                          <button
                            key={gender}
                            type="button"
                            onClick={() => setFormData({ ...formData, gender })}
                            className={`px-4 py-3 rounded-lg border transition-all ${
                              formData.gender === gender
                                ? 'border-primary bg-primary/20 text-white'
                                : 'border-gray-700 bg-dark-lighter text-gray-400 hover:border-primary/50'
                            }`}
                          >
                            {gender}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Date of Birth *
                      </label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
                        <input
                          type="date"
                          value={formData.date_of_birth}
                          onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                          className="input-primary pl-12"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Phone Number
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
                        <input
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          className="input-primary pl-12"
                          placeholder="+62 812 3456 7890"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        City
                      </label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
                        <input
                          type="text"
                          value={formData.city}
                          onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                          className="input-primary pl-12"
                          placeholder="Jakarta"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Province
                      </label>
                      <input
                        type="text"
                        value={formData.province}
                        onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                        className="input-primary"
                        placeholder="DKI Jakarta"
                      />
                    </div>

                    <div className="flex space-x-3">
                      <button
                        type="button"
                        onClick={handlePrevStep}
                        className="btn-secondary flex-1 !py-4 text-lg font-semibold flex items-center justify-center"
                      >
                        <ChevronLeft className="w-5 h-5 mr-2" />
                        Back
                      </button>
                      
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="btn-primary flex-1 !py-4 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                            Creating...
                          </>
                        ) : (
                          'Create Account'
                        )}
                      </button>
                    </div>
                  </>
                )}
              </form>
            </div>
          </div>

          <div className="text-center">
            <p className="text-gray-400">
              Already have an account?{' '}
              <Link href="/auth/login" className="text-gold hover:text-gold-light font-semibold transition-colors">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
