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
  const { login, signup, googleLogin, continueAsGuest, sendPasswordReset, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (!loading && isAuthenticated) {
      navigate('/home');
    }
  }, [isAuthenticated, loading, navigate]);

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
    } catch (err: any) {
      showToast('Authentication Failed', err.message || 'Invalid email or password combination.', 'danger');
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
        age: parsedAge,
        password: password
      });
      showToast('Account Created', `Welcome to CyberShield, ${firstName}!`, 'success');
      navigate('/home');
    } catch (err: any) {
      showToast('Sign Up Failed', err.message || 'Could not register account. Please try again.', 'danger');
    }
  };

  const handleGoogleAuth = async () => {
    try {
      await googleLogin();
      showToast('Google Sign-In Success', 'Authenticated successfully with Google.', 'success');
      navigate('/home');
    } catch (err: any) {
      showToast('Sign-In Failed', err.message || 'Google login authentication aborted.', 'danger');
    }
  };

  const handleGuestMode = async () => {
    try {
      await continueAsGuest();
      showToast('Guest Session Activated', 'Operating locally. Session audits will not persist online.', 'info');
      navigate('/home');
    } catch (err: any) {
      showToast('Guest Session Failed', err.message || 'Could not start guest session.', 'danger');
    }
  };

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      showToast('Validation Error', 'Please enter your email address in the email field first.', 'warning');
      return;
    }
    try {
      await sendPasswordReset(email);
      showToast('Recovery Email Sent', `Password reset instructions have been dispatched to ${email}.`, 'success');
    } catch (err: any) {
      showToast('Recovery Failed', err.message || 'Could not send recovery email.', 'danger');
    }
  };

  return (
    <div className="fixed inset-0 grid grid-cols-1 lg:grid-cols-2 bg-slate-50 dark:bg-[#0b0f19] z-40 overflow-y-auto">
      {/* LEFT SIDE: Editorial Brand Pitch (Desktop Only) */}
      <div className="hidden lg:flex flex-col justify-between p-12 bg-slate-900 text-white border-r border-slate-800 relative overflow-hidden">
        <div className="flex items-center gap-2.5 relative z-10">
          <div className="p-2 bg-primary/20 rounded-xl border border-primary/30 text-primary">
            <Shield className="h-6 w-6" />
          </div>
          <span className="font-bold text-xl tracking-tight text-white">
            Cyber<span className="text-primary font-extrabold">Shield</span>
          </span>
        </div>

        <div className="space-y-6 relative z-10 max-w-lg">
          <span className="px-3 py-1 rounded-full border border-blue-800 bg-blue-950/60 text-blue-300 text-xs font-semibold uppercase tracking-wider">
            Zero-Trust Sandbox
          </span>
          <h2 className="text-4xl font-extrabold text-white tracking-tight leading-tight">
            Comprehensive client-side <br />
            cyber threat diagnostics.
          </h2>
          <p className="text-slate-400 text-sm leading-relaxed">
            CyberShield runs cryptographic assessments, evaluates malicious redirects, checks credential entropy, and detects phishing indicators entirely inside your browser. Your data never leaves your workstation.
          </p>

          <div className="space-y-3 pt-2">
            {[
              "100% Client-side sandbox compute",
              "Local SHA-256 checksum validation",
              "Instant printable compliance PDF reports"
            ].map((benefit, idx) => (
              <div key={idx} className="flex items-center gap-2.5 text-xs font-medium text-slate-300">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>{benefit}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="text-xs text-slate-500 font-medium relative z-10">
          © 2026 CyberShield. Local browser security utility.
        </div>
      </div>

      {/* RIGHT SIDE: Authentication Forms */}
      <div className="flex flex-col justify-center items-center p-6 sm:p-12 relative overflow-y-auto min-h-screen">
        <div className="w-full max-w-md space-y-6 relative z-10">
          {/* Logo header (Mobile Only) */}
          <div className="flex lg:hidden flex-col items-center text-center space-y-2 mb-2">
            <div className="p-2.5 bg-primary/10 rounded-2xl border border-primary/20 text-primary">
              <Shield className="h-7 w-7" />
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
              Cyber<span className="text-primary">Shield</span>
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">Inspect threats before you click.</p>
          </div>

          {/* Form Container Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
            {/* Header Tabs */}
            <div className="flex border-b border-slate-200 dark:border-slate-800 pb-1">
              <button
                onClick={() => setIsLogin(true)}
                className={`flex-1 pb-3 text-sm font-bold border-b-2 transition-all cursor-pointer ${
                  isLogin
                    ? 'text-primary border-primary'
                    : 'text-slate-500 border-transparent hover:text-slate-800 dark:hover:text-slate-300'
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => setIsLogin(false)}
                className={`flex-1 pb-3 text-sm font-bold border-b-2 transition-all cursor-pointer ${
                  !isLogin
                    ? 'text-primary border-primary'
                    : 'text-slate-500 border-transparent hover:text-slate-800 dark:hover:text-slate-300'
                }`}
              >
                Create Account
              </button>
            </div>

            {/* Forms */}
            {isLogin ? (
              /* LOGIN FORM */
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@company.com"
                      required
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary placeholder-slate-400"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={handleForgotPassword}
                      className="text-xs font-semibold text-primary hover:text-primary-dark transition-colors"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary placeholder-slate-400"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <label className="flex items-center gap-2.5 cursor-pointer text-xs pt-1">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-slate-300 text-primary focus:ring-primary h-4 w-4"
                  />
                  <span className="text-slate-600 dark:text-slate-400 font-medium">Remember me on this workstation</span>
                </label>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-primary hover:bg-primary-dark text-white text-xs font-semibold rounded-xl transition-all shadow-xs flex items-center justify-center gap-1 cursor-pointer"
                >
                  Sign In to Dashboard <ChevronRight className="h-4 w-4" />
                </button>
              </form>
            ) : (
              /* SIGNUP FORM */
              <form onSubmit={handleSignupSubmit} className="space-y-3.5">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">First Name *</label>
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="Jane"
                      required
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary placeholder-slate-400"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">Last Name *</label>
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Doe"
                      required
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary placeholder-slate-400"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">Email Address *</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="jane@company.com"
                      required
                      className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary placeholder-slate-400"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+1 (555) 000-0000"
                      className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary placeholder-slate-400"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">Gender</label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary cursor-pointer"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                      <option value="Prefer not to say">Prefer not to say</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">Age *</label>
                    <input
                      type="number"
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      placeholder="21"
                      required
                      min="13"
                      max="120"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary placeholder-slate-400"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">Password *</label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary placeholder-slate-400"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">Confirm *</label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary placeholder-slate-400"
                    />
                  </div>
                </div>

                <label className="flex items-start gap-2.5 cursor-pointer text-xs pt-1">
                  <input
                    type="checkbox"
                    checked={acceptTerms}
                    onChange={(e) => setAcceptTerms(e.target.checked)}
                    required
                    className="rounded border-slate-300 text-primary focus:ring-primary h-4 w-4 mt-0.5"
                  />
                  <span className="text-slate-600 dark:text-slate-400">
                    I accept the Terms of Service and Privacy Policy.
                  </span>
                </label>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-primary hover:bg-primary-dark text-white text-xs font-semibold rounded-xl transition-all shadow-xs flex items-center justify-center gap-1 cursor-pointer"
                >
                  Create Account <ChevronRight className="h-4 w-4" />
                </button>
              </form>
            )}

            {/* Divider */}
            <div className="flex items-center gap-3 py-1">
              <div className="flex-1 border-t border-slate-200 dark:border-slate-800" />
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Or</span>
              <div className="flex-1 border-t border-slate-200 dark:border-slate-800" />
            </div>

            {/* Google Authentication */}
            <button
              onClick={handleGoogleAuth}
              className="w-full py-2.5 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
            >
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
                className="w-full py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                Continue as Guest (No Registration)
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
