import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Shield, Mail, Phone, Lock, Eye, EyeOff, CheckCircle2, ChevronRight
} from 'lucide-react';
import { useToast } from '../hooks/useToast';
import { useAuth } from '../context/AuthContext';

export const Auth: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // Forms state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [gender, setGender] = useState('Prefer not to say');
  const [age, setAge] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);

  const { showToast } = useToast();
  const { login, signup, googleLogin, continueAsGuest } = useAuth();
  const navigate = useNavigate();

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      showToast('Validation Error', 'Please fill in all email and password fields.', 'warning');
      return;
    }

    try {
      await login(email, password, rememberMe);
      showToast('Logged In Successfully', `Welcome back to CyberShield!`, 'success');
      navigate('/home');
    } catch (err) {
      showToast('Authentication Failed', 'Invalid email or password combination.', 'danger');
    }
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
      showToast('Validation Error', 'Please fill in all required fields marked with *.', 'warning');
      return;
    }
    if (password !== confirmPassword) {
      showToast('Validation Error', 'Passwords do not match.', 'warning');
      return;
    }
    if (!acceptTerms) {
      showToast('Validation Error', 'You must accept the Terms and Privacy Policy.', 'warning');
      return;
    }

    const parsedAge = parseInt(age);
    if (isNaN(parsedAge) || parsedAge < 13) {
      showToast('Validation Error', 'You must be at least 13 years old to register.', 'warning');
      return;
    }

    try {
      await signup({
        firstName,
        lastName,
        email,
        phone,
        gender,
        age: parsedAge
      });
      showToast('Account Created', `Welcome to CyberShield, ${firstName}!`, 'success');
      navigate('/home');
    } catch (err) {
      showToast('Sign Up Failed', 'Could not register account. Please try again.', 'danger');
    }
  };

  const handleGoogleAuth = async () => {
    try {
      await googleLogin();
      showToast('Google Sign-In Success', 'Authenticated successfully with Google.', 'success');
      navigate('/home');
    } catch (err) {
      showToast('Sign-In Failed', 'Google login authentication aborted.', 'danger');
    }
  };

  const handleGuestMode = () => {
    continueAsGuest();
    showToast('Guest Session Activated', 'Operating locally. Session audits will not persist online.', 'info');
    navigate('/home');
  };

  return (
    <div className="fixed inset-0 grid grid-cols-1 lg:grid-cols-2 bg-[#0F172A] z-40 overflow-y-auto">
      {/* LEFT SIDE: SaaS Brand Pitch (Desktop Only) */}
      <div className="hidden lg:flex flex-col justify-between p-12 bg-gradient-to-b from-[#141E33] to-[#0A0F1D] border-r border-slate-800 relative overflow-hidden">
        {/* Glowing backgrounds */}
        <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

        <div className="flex items-center gap-2 relative z-10">
          <div className="p-2 bg-primary/10 rounded-xl border border-primary/25 text-primary">
            <Shield className="h-6 w-6" />
          </div>
          <span className="font-extrabold text-xl tracking-tight text-white">
            Cyber<span className="text-primary">Shield</span>
          </span>
        </div>

        <div className="space-y-6 relative z-10 max-w-lg">
          <span className="px-3 py-1 rounded-full border border-primary/20 bg-primary/5 text-primary text-xs font-semibold uppercase tracking-wider">
            SaaS Threat Shield
          </span>
          <h2 className="text-4xl font-extrabold text-white tracking-tight leading-tight">
            Comprehensive client-side <br />
            cyber threat diagnostics.
          </h2>
          <p className="text-slate-400 text-sm leading-relaxed">
            CyberShield performs cryptographic assessments, analyzes malicious redirects, verifies password complexities, and flags phishing parameters entirely inside your browser. Your data never leaves your device.
          </p>

          <div className="space-y-3.5 pt-4">
            {[
              "100% Secure offline diagnostic engines",
              "Local SHA-256 binary validation checks",
              "SaaS-style PDF report exports"
            ].map((benefit, idx) => (
              <div key={idx} className="flex items-center gap-2 text-xs font-medium text-slate-350">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                <span>{benefit}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="text-[10px] text-slate-500 font-semibold relative z-10">
          © 2026 CyberShield. Bank-grade local browser protection.
        </div>
      </div>

      {/* RIGHT SIDE: Authentication Forms */}
      <div className="flex flex-col justify-center items-center p-6 sm:p-12 relative overflow-y-auto min-h-screen">
        {/* Glow ambient background mobile */}
        <div className="absolute lg:hidden w-[250px] h-[250px] bg-primary/5 rounded-full blur-[90px] pointer-events-none" />

        <div className="w-full max-w-md space-y-6 relative z-10">
          {/* Logo header (Mobile Only) */}
          <div className="flex lg:hidden flex-col items-center text-center space-y-2 mb-4">
            <div className="p-3 bg-primary/10 rounded-2xl border border-primary/25 text-primary">
              <Shield className="h-8 w-8" />
            </div>
            <h1 className="text-2xl font-extrabold text-white">
              Cyber<span className="text-primary">Shield</span>
            </h1>
            <p className="text-xs text-slate-400">Protect Before You Click.</p>
          </div>

          {/* SaaS Container Card */}
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border-slate-205 dark:border-slate-800 space-y-6 bg-slate-900/40">
            {/* Header Tabs */}
            <div className="flex border-b border-slate-800 pb-1">
              <button
                onClick={() => setIsLogin(true)}
                className={`flex-1 pb-3 text-sm font-bold border-b-2 transition-all ${isLogin
                    ? 'text-primary border-primary'
                    : 'text-slate-450 border-transparent hover:text-slate-300'
                  }`}
              >
                Sign In
              </button>
              <button
                onClick={() => setIsLogin(false)}
                className={`flex-1 pb-3 text-sm font-bold border-b-2 transition-all ${!isLogin
                    ? 'text-primary border-primary'
                    : 'text-slate-450 border-transparent hover:text-slate-300'
                  }`}
              >
                Create Account
              </button>
            </div>

            {/* Forms rendering */}
            {isLogin ? (
              /* LOGIN FORM */
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold text-slate-450 dark:text-slate-500 tracking-wider">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-slate-500" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@company.com"
                      required
                      className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100/30 dark:bg-slate-900/50 text-slate-800 dark:text-slate-200 text-sm focus:outline-none focus:border-primary transition-colors placeholder-slate-550"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] uppercase font-bold text-slate-450 dark:text-slate-500 tracking-wider">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => showToast('Reset Required', 'Password recovery links will be wired dynamically with Firebase.', 'info')}
                      className="text-[10px] font-bold text-primary hover:text-primary-light transition-colors"
                    >
                      Forgot Password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-slate-500" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="w-full pl-11 pr-11 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100/30 dark:bg-slate-900/50 text-slate-800 dark:text-slate-200 text-sm focus:outline-none focus:border-primary transition-colors placeholder-slate-550"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-3.5 text-slate-500 hover:text-slate-300"
                    >
                      {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                    </button>
                  </div>
                </div>

                <label className="flex items-center gap-2.5 cursor-pointer text-xs pt-1">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-slate-300 text-primary focus:ring-primary h-4 w-4 bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800"
                  />
                  <span className="text-slate-700 dark:text-slate-400 font-medium">Remember me on this browser</span>
                </label>

                <button
                  type="submit"
                  className="w-full py-3 bg-primary hover:bg-primary-dark text-white text-xs font-bold rounded-xl transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-1"
                >
                  Sign In to Dashboard <ChevronRight className="h-4 w-4" />
                </button>
              </form>
            ) : (
              /* SIGNUP FORM */
              <form onSubmit={handleSignupSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-[9px] uppercase font-bold text-slate-450 dark:text-slate-500">First Name *</label>
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="Jane"
                      required
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100/30 dark:bg-slate-900/50 text-slate-800 dark:text-slate-200 text-xs focus:outline-none focus:border-primary placeholder-slate-550"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] uppercase font-bold text-slate-450 dark:text-slate-500">Last Name *</label>
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Doe"
                      required
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100/30 dark:bg-slate-900/50 text-slate-800 dark:text-slate-200 text-xs focus:outline-none focus:border-primary placeholder-slate-550"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[9px] uppercase font-bold text-slate-450 dark:text-slate-500">Email Address *</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="jane.doe@company.com"
                      required
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100/30 dark:bg-slate-900/50 text-slate-800 dark:text-slate-200 text-xs focus:outline-none focus:border-primary placeholder-slate-550"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[9px] uppercase font-bold text-slate-450 dark:text-slate-500">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+1 (555) 000-0000"
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100/30 dark:bg-slate-900/50 text-slate-800 dark:text-slate-200 text-xs focus:outline-none focus:border-primary placeholder-slate-550"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-[9px] uppercase font-bold text-slate-450 dark:text-slate-500">Gender</label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100/35 dark:bg-slate-900 text-slate-800 dark:text-slate-200 text-xs focus:outline-none focus:border-primary appearance-none cursor-pointer"
                    >
                      <option value="Male" className="bg-[#0F172A] text-slate-200">Male</option>
                      <option value="Female" className="bg-[#0F172A] text-slate-200">Female</option>
                      <option value="Other" className="bg-[#0F172A] text-slate-200">Other</option>
                      <option value="Prefer not to say" className="bg-[#0F172A] text-slate-200">Prefer not to say</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] uppercase font-bold text-slate-450 dark:text-slate-500">Age *</label>
                    <input
                      type="number"
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      placeholder="21"
                      required
                      min="13"
                      max="120"
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100/30 dark:bg-slate-900/50 text-slate-800 dark:text-slate-200 text-xs focus:outline-none focus:border-primary placeholder-slate-550"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-[9px] uppercase font-bold text-slate-450 dark:text-slate-500">Password *</label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100/30 dark:bg-slate-900/50 text-slate-800 dark:text-slate-200 text-xs focus:outline-none focus:border-primary placeholder-slate-550"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] uppercase font-bold text-slate-450 dark:text-slate-500">Confirm Password *</label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100/30 dark:bg-slate-900/50 text-slate-800 dark:text-slate-200 text-xs focus:outline-none focus:border-primary placeholder-slate-550"
                    />
                  </div>
                </div>

                <label className="flex items-start gap-2.5 cursor-pointer text-xs pt-1">
                  <input
                    type="checkbox"
                    checked={acceptTerms}
                    onChange={(e) => setAcceptTerms(e.target.checked)}
                    required
                    className="rounded border-slate-300 text-primary focus:ring-primary h-4 w-4 bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 mt-0.5"
                  />
                  <span className="text-slate-700 dark:text-slate-400 font-medium">
                    I accept the <span className="text-primary hover:underline">Terms of Service</span> and <span className="text-primary hover:underline">Privacy Policy</span>.
                  </span>
                </label>

                <button
                  type="submit"
                  className="w-full py-3 bg-primary hover:bg-primary-dark text-white text-xs font-bold rounded-xl transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-1"
                >
                  Create Secure Account <ChevronRight className="h-4 w-4" />
                </button>
              </form>
            )}

            {/* Divider */}
            <div className="flex items-center gap-3 py-1">
              <div className="flex-1 border-t border-slate-800" />
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Or</span>
              <div className="flex-1 border-t border-slate-800" />
            </div>

            {/* Google Authentication */}
            <button
              onClick={handleGoogleAuth}
              className="w-full py-2.5 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              {/* Inline raw Google SVG icon */}
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.85z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.85c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Continue with Google
            </button>

            {/* Guest Launcher (Login Only) */}
            {isLogin && (
              <button
                onClick={handleGuestMode}
                className="w-full py-2.5 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5"
              >
                Continue as Guest
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
export default Auth;
