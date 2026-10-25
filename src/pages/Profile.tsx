import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSecurity } from '../context/SecurityContext';
import { useToast } from '../hooks/useToast';
import { generatePDFReport } from '../utils/pdfReport';
import { db, auth } from '../firebase/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { EmailAuthProvider, reauthenticateWithCredential, updatePassword } from 'firebase/auth';
import {
  User as UserIcon, Shield, Mail, Phone, Calendar,
  Award, Download, Lock, Edit3, CheckCircle, Key, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const Profile: React.FC = () => {
  const { user, guestMode, sessionStartTime } = useAuth();
  const { scans, getSafetyScore } = useSecurity();
  const { showToast } = useToast();

  const [showEditModal, setShowEditModal] = useState(false);
  const [showPwdModal, setShowPwdModal] = useState(false);

  // Profile edit fields
  const [firstName, setFirstName] = useState(user?.firstName || 'Guest');
  const [lastName, setLastName] = useState(user?.lastName || 'User');
  const [phone, setPhone] = useState(user?.phone || '');
  const [gender, setGender] = useState(user?.gender || 'Prefer not to say');
  const [age, setAge] = useState(user?.age?.toString() || '');

  // Pwd change fields
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const safetyScore = getSafetyScore();
  const totalScans = scans.length;

  const urlCount = scans.filter(s => s.type === 'url').length;
  const pwdCount = scans.filter(s => s.type === 'password').length;
  const fileCount = scans.filter(s => s.type === 'file').length;

  const loginMethod = guestMode
    ? 'Guest Session'
    : user?.provider === 'google.com'
      ? 'Google Account'
      : 'Email Authentication';

  const joinedDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
    : 'August 1, 2026';

  useEffect(() => {
    if (user) {
      setFirstName(user.firstName || '');
      setLastName(user.lastName || '');
      setPhone(user.phone || '');
      setGender(user.gender || 'Prefer not to say');
      setAge(user.age?.toString() || '');
    }
  }, [user]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (guestMode || !user?.uid) {
      showToast('Profile Updated', 'Your profile details have been updated.', 'success');
      setShowEditModal(false);
      return;
    }

    try {
      const userRef = doc(db, 'users', user.uid, 'profile', 'details');
      await updateDoc(userRef, {
        firstName,
        lastName,
        phone,
        gender,
        age: parseInt(age) || null
      });
      showToast('Profile Updated', 'Your profile details have been saved.', 'success');
      setShowEditModal(false);
    } catch (err: any) {
      console.error(err);
      showToast('Update Failed', 'Failed to save updates to database.', 'danger');
    }
  };

  const handlePwdSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      showToast('Validation Error', 'New passwords do not match.', 'warning');
      return;
    }

    const currentUser = auth.currentUser;
    if (!currentUser || !currentUser.email) {
      showToast('Authentication Error', 'You must be signed in to perform this action.', 'danger');
      return;
    }

    try {
      const credential = EmailAuthProvider.credential(currentUser.email, oldPassword);
      await reauthenticateWithCredential(currentUser, credential);
      await updatePassword(currentUser, newPassword);

      showToast('Password Changed', 'Your password has been updated.', 'success');
      setShowPwdModal(false);
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      console.error(err);
      let errMsg = 'Failed to update credentials. Check your current password.';
      if (err.code === 'auth/weak-password') {
        errMsg = 'The password is too weak. Please use at least 6 characters.';
      } else if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        errMsg = 'Your current password is incorrect.';
      } else if (err.code === 'auth/network-request-failed') {
        errMsg = 'A network error occurred. Check your connection.';
      }
      showToast('Password Change Failed', errMsg, 'danger');
    }
  };

  const triggerPDFDownload = () => {
    const elapsed = sessionStartTime ? Date.now() - sessionStartTime : 0;
    generatePDFReport(scans, safetyScore, elapsed, user);
    showToast('PDF Export', 'Your security audit report has been compiled and downloaded.', 'success');
  };

  const achievements = [
    {
      id: 'sec_novice',
      title: 'First Shield Audit',
      desc: 'Completed your first browser sandbox threat diagnostic check.',
      unlocked: totalScans > 0,
      icon: <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400" />
    },
    {
      id: 'sec_sentinel',
      title: 'SaaS Sentinel',
      desc: 'Completed 5 or more local diagnostic audits in this session.',
      unlocked: totalScans >= 5,
      icon: <Award className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
    },
    {
      id: 'pwd_expert',
      title: 'Passphrase Master',
      desc: 'Verified or generated secure high-entropy passwords.',
      unlocked: pwdCount > 0 || scans.some(s => s.type === 'generator'),
      icon: <Key className="h-5 w-5 text-amber-600 dark:text-amber-400" />
    },
    {
      id: 'local_patriot',
      title: '100% Zero Trust',
      desc: 'Verified that all threat diagnostics run entirely inside your browser.',
      unlocked: true,
      icon: <CheckCircle className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
    }
  ];

  return (
    <div className="space-y-8 py-4 text-left max-w-7xl mx-auto">
      {/* HEADER SECTION */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-6 space-y-1.5">
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Profile & Security Identity
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
          Review your security standing, authenticated identity parameters, and session audit history.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* COLUMN 1: USER DETAILS (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs flex flex-col items-center text-center">
            <div className="relative mb-4">
              <div className="h-20 w-20 rounded-2xl bg-gradient-to-tr from-primary to-indigo-600 text-white flex items-center justify-center text-2xl font-bold shadow-md">
                {guestMode ? 'G' : (firstName ? firstName.substring(0, 1).toUpperCase() : 'U')}
              </div>
              <button
                onClick={() => setShowEditModal(true)}
                className="absolute -bottom-1 -right-1 p-1.5 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm transition-colors cursor-pointer"
                title="Edit Details"
              >
                <Edit3 className="h-3.5 w-3.5" />
              </button>
            </div>

            <h2 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">
              {guestMode ? 'Guest User' : `${firstName} ${lastName}`}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {guestMode ? 'Local browser session' : user?.email}
            </p>

            <div className="w-full border-t border-slate-100 dark:border-slate-800 my-5" />

            <div className="w-full space-y-3 text-left text-xs text-slate-700 dark:text-slate-300">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5 text-primary" /> Email
                </span>
                <span className="font-medium truncate max-w-[170px]">{guestMode ? 'None (Guest)' : user?.email}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5 text-primary" /> Phone
                </span>
                <span className="font-medium">{guestMode ? 'N/A' : phone || 'Not provided'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <UserIcon className="h-3.5 w-3.5 text-primary" /> Profile
                </span>
                <span className="font-medium">{guestMode ? 'Guest' : `${gender} • ${age || 'N/A'}`}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <Lock className="h-3.5 w-3.5 text-primary" /> Auth Mode
                </span>
                <span className="px-2 py-0.5 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900/60 text-[10px] rounded-md font-medium">
                  {loginMethod}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-primary" /> Member Since
                </span>
                <span className="font-medium">{joinedDate}</span>
              </div>
            </div>

            <div className="w-full grid grid-cols-2 gap-2 mt-6">
              <button
                onClick={triggerPDFDownload}
                disabled={totalScans === 0}
                className="py-2.5 bg-primary hover:bg-primary-dark disabled:bg-slate-200 dark:disabled:bg-slate-800 disabled:text-slate-400 text-white text-xs font-semibold rounded-xl transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:cursor-not-allowed"
              >
                <Download className="h-3.5 w-3.5" /> PDF Report
              </button>
              {!guestMode && (
                <button
                  onClick={() => setShowPwdModal(true)}
                  className="py-2.5 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Lock className="h-3.5 w-3.5" /> Password
                </button>
              )}
            </div>
          </div>
        </div>

        {/* COLUMN 2: METRICS & ACHIEVEMENTS (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* STATS COUNT GRID */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 text-center shadow-xs">
              <p className="text-2xl font-extrabold text-primary">{safetyScore}%</p>
              <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-1">Safety Index</p>
            </div>
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 text-center shadow-xs">
              <p className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">{urlCount}</p>
              <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-1">URLs Checked</p>
            </div>
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 text-center shadow-xs">
              <p className="text-2xl font-extrabold text-amber-600 dark:text-amber-400">{pwdCount}</p>
              <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-1">Password Tests</p>
            </div>
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 text-center shadow-xs">
              <p className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400">{fileCount}</p>
              <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-1">Files Audited</p>
            </div>
          </div>

          {/* ACTIVE ACHIEVEMENTS BLOCK */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm">Security Achievements</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {achievements.map((ach) => (
                <div
                  key={ach.id}
                  className={`p-4 rounded-xl border flex gap-3.5 items-start transition-all ${
                    ach.unlocked
                      ? 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40'
                      : 'border-slate-100 dark:border-slate-800/50 opacity-40 bg-slate-50/20'
                  }`}
                >
                  <div className={`p-2 rounded-xl border ${ach.unlocked ? 'bg-primary/10 border-primary/20' : 'bg-slate-100 dark:bg-slate-800 border-transparent'}`}>
                    {ach.icon}
                  </div>
                  <div className="space-y-0.5 text-left flex-1 min-w-0">
                    <h4 className="font-bold text-xs text-slate-900 dark:text-white">
                      {ach.title} {ach.unlocked ? '✓' : ''}
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">{ach.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* TIMELINE OF RECENT SCAN ACTIVITIES */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm">Recent Audit Stream</h3>

            {scans.length === 0 ? (
              <div className="py-8 text-center text-slate-500 dark:text-slate-400 text-xs">
                No active session logs recorded yet. Execute audits in the Security Hub to populate your stream.
              </div>
            ) : (
              <div className="space-y-3">
                {scans.slice(0, 5).map((scan) => (
                  <div key={scan.id} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex justify-between items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-primary uppercase bg-primary/10 px-2 py-0.5 rounded">
                          {scan.type}
                        </span>
                        <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                          {scan.target}
                        </p>
                      </div>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-1">
                        Result: {scan.result} • {new Date(scan.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border ${
                      scan.riskLevel === 'Safe' 
                        ? 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200' 
                        : scan.riskLevel === 'Suspicious'
                          ? 'text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border-amber-200'
                          : 'text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border-rose-200'
                    }`}>
                      {scan.riskLevel}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* EDIT PROFILE MODAL */}
      <AnimatePresence>
        {showEditModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden p-6 space-y-4"
            >
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Edit Profile Details</h3>
                <button onClick={() => setShowEditModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={handleEditSubmit} className="space-y-3.5">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-slate-500">First Name</label>
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full px-3 py-2 border rounded-xl bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-xs focus:ring-2 focus:ring-primary/20 focus:border-primary text-slate-900 dark:text-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-slate-500">Last Name</label>
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="w-full px-3 py-2 border rounded-xl bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-xs focus:ring-2 focus:ring-primary/20 focus:border-primary text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-500">Phone Number</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    className="w-full px-3 py-2 border rounded-xl bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-xs focus:ring-2 focus:ring-primary/20 focus:border-primary text-slate-900 dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-slate-500">Gender</label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      className="w-full px-3 py-2 border rounded-xl bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-xs focus:ring-2 focus:ring-primary/20 focus:border-primary text-slate-900 dark:text-white"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                      <option value="Prefer not to say">Prefer not to say</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-slate-500">Age</label>
                    <input
                      type="number"
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      className="w-full px-3 py-2 border rounded-xl bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-xs focus:ring-2 focus:ring-primary/20 focus:border-primary text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-primary hover:bg-primary-dark text-white text-xs font-semibold rounded-xl"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CHANGE PASSWORD MODAL */}
      <AnimatePresence>
        {showPwdModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl p-6 space-y-4"
            >
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Change Account Password</h3>
                <button onClick={() => setShowPwdModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={handlePwdSubmit} className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-500">Current Password</label>
                  <input
                    type="password"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    required
                    className="w-full px-3 py-2 border rounded-xl bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-xs focus:ring-2 focus:ring-primary/20 focus:border-primary text-slate-900 dark:text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-500">New Password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    className="w-full px-3 py-2 border rounded-xl bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-xs focus:ring-2 focus:ring-primary/20 focus:border-primary text-slate-900 dark:text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-500">Confirm New Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="w-full px-3 py-2 border rounded-xl bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-xs focus:ring-2 focus:ring-primary/20 focus:border-primary text-slate-900 dark:text-white"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setShowPwdModal(false)}
                    className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-primary hover:bg-primary-dark text-white text-xs font-semibold rounded-xl"
                  >
                    Update Password
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Profile;
