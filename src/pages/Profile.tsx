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
  Award, Download, Lock, Edit3, CheckCircle, Key
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
    ? 'Guest Local Session' 
    : user?.provider === 'google.com' 
    ? 'Google Authentication' 
    : 'Email Authentication';

  const joinedDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    : 'August 1, 2026';

  // Sync state with loaded user data reactively
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
      showToast('Profile Updated', 'Your profile details have been saved locally.', 'success');
      setShowEditModal(false);
      return;
    }

    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        firstName,
        lastName,
        phone,
        gender,
        age: parseInt(age) || null
      });
      showToast('Profile Updated', 'Your profile details have been saved to Firestore.', 'success');
      setShowEditModal(false);
    } catch (err: any) {
      console.error(err);
      showToast('Update Failed', 'Failed to save updates to the database.', 'danger');
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
      // Reauthenticate user before credential update
      const credential = EmailAuthProvider.credential(currentUser.email, oldPassword);
      await reauthenticateWithCredential(currentUser, credential);

      // Update password
      await updatePassword(currentUser, newPassword);

      showToast('Password Changed', 'Your security password has been updated in Firebase.', 'success');
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

  // Determine dynamic achievements
  const achievements = [
    {
      id: 'sec_novice',
      title: 'First Shield Audit',
      desc: 'Completed your first browser sandbox threat diagnostic check.',
      unlocked: totalScans > 0,
      icon: <Shield className="h-5 w-5 text-blue-500" />
    },
    {
      id: 'sec_sentinel',
      title: 'SaaS Sentinel',
      desc: 'Completed 5 or more local diagnostic audits in this session.',
      unlocked: totalScans >= 5,
      icon: <Award className="h-5 w-5 text-emerald-500" />
    },
    {
      id: 'pwd_expert',
      title: 'Passphrase Master',
      desc: 'Verified or generated secure high-entropy passwords.',
      unlocked: pwdCount > 0 || scans.some(s => s.type === 'generator'),
      icon: <Key className="h-5 w-5 text-amber-500" />
    },
    {
      id: 'local_patriot',
      title: '100% Zero Trust',
      desc: 'Verified that all threat diagnostics run entirely inside your browser.',
      unlocked: true,
      icon: <CheckCircle className="h-5 w-5 text-indigo-500" />
    }
  ];

  return (
    <div className="space-y-8 py-4 text-left max-w-7xl mx-auto">
      {/* HEADER SECTION */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white tracking-tight">Profile Dashboard</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Manage credentials, audit ratings, and active security achievements.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* COLUMN 1: USER DETAILS */}
        <div className="space-y-6 lg:col-span-1">
          <div className="glass-panel p-6 rounded-2xl border-slate-200 dark:border-slate-800 bg-[#0d1424]/30 relative overflow-hidden flex flex-col items-center text-center">
            {/* Glowing ring behind avatar */}
            <div className="absolute top-12 w-28 h-28 bg-primary/10 rounded-full blur-xl pointer-events-none" />

            <div className="relative mb-4">
              <div className="h-20 w-20 rounded-2xl bg-gradient-to-tr from-primary to-indigo-500 text-white flex items-center justify-center text-2xl font-black shadow-xl shadow-primary/20 border border-primary/25">
                {guestMode ? 'G' : firstName.substring(0, 1)}
              </div>
              <button 
                onClick={() => setShowEditModal(true)}
                className="absolute -bottom-1 -right-1 p-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-750 text-slate-600 dark:text-slate-300 rounded-lg border border-slate-200 dark:border-slate-700 shadow-md transition-colors"
                title="Edit Details"
              >
                <Edit3 className="h-3.5 w-3.5" />
              </button>
            </div>

            <h2 className="text-lg font-black text-slate-850 dark:text-white leading-tight">
              {guestMode ? 'Guest User' : `${firstName} ${lastName}`}
            </h2>
            <p className="text-xs text-slate-450 dark:text-slate-500 mt-1">{guestMode ? 'Local browser session' : user?.email}</p>

            <div className="w-full border-t border-slate-200 dark:border-slate-850 my-6" />

            <div className="w-full space-y-3.5 text-left text-xs font-semibold text-slate-600 dark:text-slate-350">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5 text-primary" /> Email
                </span>
                <span>{guestMode ? 'N/A' : user?.email}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5 text-primary" /> Phone
                </span>
                <span>{guestMode ? 'N/A' : phone || 'Not provided'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
                  <UserIcon className="h-3.5 w-3.5 text-primary" /> Gender / Age
                </span>
                <span>{guestMode ? 'N/A' : `${gender} • ${age || 'N/A'}`}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
                  <Lock className="h-3.5 w-3.5 text-primary" /> Login Method
                </span>
                <span className="px-2 py-0.5 bg-primary/10 border border-primary/20 text-primary text-[10px] rounded-lg">
                  {loginMethod}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-primary" /> Joined Date
                </span>
                <span>{joinedDate}</span>
              </div>
            </div>

            <div className="w-full grid grid-cols-2 gap-2 mt-6">
              <button
                onClick={triggerPDFDownload}
                disabled={totalScans === 0}
                className="py-2.5 bg-primary hover:bg-primary-dark disabled:bg-primary/50 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-primary/10 flex items-center justify-center gap-1"
              >
                <Download className="h-3.5 w-3.5" /> PDF Audit
              </button>
              {!guestMode && (
                <button
                  onClick={() => setShowPwdModal(true)}
                  className="py-2.5 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-850 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1"
                >
                  <Lock className="h-3.5 w-3.5" /> Password
                </button>
              )}
            </div>
          </div>
        </div>

        {/* COLUMN 2: SECURITY STATS & AUDITS */}
        <div className="space-y-6 lg:col-span-2">
          {/* STATS COUNT GRID */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            <div className="glass-panel p-4 rounded-xl border-slate-200 dark:border-slate-800 text-center">
              <p className="text-2xl font-black text-primary">{safetyScore}%</p>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-450 dark:text-slate-500 mt-1">Safety Index</p>
            </div>
            <div className="glass-panel p-4 rounded-xl border-slate-200 dark:border-slate-800 text-center">
              <p className="text-2xl font-black text-emerald-500">{urlCount}</p>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-455 dark:text-slate-500 mt-1">Links Checked</p>
            </div>
            <div className="glass-panel p-4 rounded-xl border-slate-200 dark:border-slate-800 text-center">
              <p className="text-2xl font-black text-amber-500">{pwdCount}</p>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-455 dark:text-slate-500 mt-1">Passwords Audit</p>
            </div>
            <div className="glass-panel p-4 rounded-xl border-slate-200 dark:border-slate-800 text-center">
              <p className="text-2xl font-black text-indigo-500">{fileCount}</p>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-455 dark:text-slate-500 mt-1">Files Scanned</p>
            </div>
          </div>

          {/* ACTIVE ACHIEVEMENTS BLOCK */}
          <div className="glass-panel p-6 rounded-2xl border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="font-extrabold text-slate-850 dark:text-white text-base">Security Badges & Achievements</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {achievements.map((ach) => (
                <div 
                  key={ach.id} 
                  className={`p-4 rounded-xl border flex gap-3 items-start transition-all duration-300 ${
                    ach.unlocked 
                      ? 'border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c1221]/50' 
                      : 'border-slate-100 dark:border-slate-850 opacity-40 select-none bg-slate-50/10'
                  }`}
                >
                  <div className={`p-2.5 rounded-xl border ${ach.unlocked ? 'bg-primary/5 border-primary/20' : 'bg-slate-100 dark:bg-slate-900 border-transparent'}`}>
                    {ach.icon}
                  </div>
                  <div className="space-y-0.5 text-left">
                    <h4 className="font-extrabold text-xs text-slate-800 dark:text-slate-200">
                      {ach.title} {ach.unlocked ? '🔓' : '🔒'}
                    </h4>
                    <p className="text-[10px] text-slate-450 dark:text-slate-500 leading-normal">{ach.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* TIMELINE OF RECENT SCAN ACTIVITIES */}
          <div className="glass-panel p-6 rounded-2xl border-slate-200 dark:border-slate-800 space-y-5">
            <h3 className="font-extrabold text-slate-850 dark:text-white text-base">Recent Scan Activity Track</h3>
            
            {scans.length === 0 ? (
              <div className="py-8 text-center text-slate-450 dark:text-slate-500 text-xs">
                No active session logs recorded. Launch tools inside the Security Hub to populate parameters.
              </div>
            ) : (
              <div className="relative border-l border-slate-200 dark:border-slate-800 pl-4 space-y-5 ml-1.5">
                {scans.slice(0, 5).map((scan) => (
                  <div key={scan.id} className="relative space-y-1">
                    {/* Bullet marker */}
                    <div className={`absolute -left-[21.5px] top-1.5 h-3 w-3 rounded-full border bg-white dark:bg-[#090d16] ${
                      scan.riskLevel === 'Safe' 
                        ? 'border-emerald-500 text-emerald-500' 
                        : scan.riskLevel === 'Suspicious' 
                        ? 'border-amber-500 text-amber-500' 
                        : 'border-rose-500 text-rose-500'
                    }`} />
                    
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-slate-800 dark:text-slate-200 uppercase text-[10px] tracking-wider bg-slate-100 dark:bg-slate-850 px-2 py-0.5 rounded">
                        {scan.type} Check
                      </span>
                      <span className="text-[9px] text-slate-450 dark:text-slate-500">{new Date(scan.timestamp).toLocaleTimeString()}</span>
                    </div>
                    <p className="text-xs font-mono font-bold text-primary truncate max-w-lg">{scan.target}</p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">Result: {scan.result} • Risk: {scan.riskScore}%</p>
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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md bg-white dark:bg-[#0c1221] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden p-6 space-y-4"
            >
              <h3 className="text-base font-extrabold text-slate-800 dark:text-white">Edit Profile Details</h3>
              <form onSubmit={handleEditSubmit} className="space-y-3.5">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase font-bold text-slate-450 dark:text-slate-550">First Name</label>
                    <input 
                      type="text" 
                      value={firstName} 
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full px-3 py-2 border rounded-xl dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-xs focus:ring-1 focus:ring-primary"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase font-bold text-slate-450 dark:text-slate-550">Last Name</label>
                    <input 
                      type="text" 
                      value={lastName} 
                      onChange={(e) => setLastName(e.target.value)}
                      className="w-full px-3 py-2 border rounded-xl dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-xs focus:ring-1 focus:ring-primary"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] uppercase font-bold text-slate-450 dark:text-slate-550">Phone Number</label>
                  <input 
                    type="tel" 
                    value={phone} 
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    className="w-full px-3 py-2 border rounded-xl dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-xs focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase font-bold text-slate-450 dark:text-slate-550">Gender</label>
                    <select 
                      value={gender} 
                      onChange={(e) => setGender(e.target.value)}
                      className="w-full px-3 py-2 border rounded-xl dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-xs focus:ring-1 focus:ring-primary text-slate-200"
                    >
                      <option value="Male" className="bg-[#0f172a] text-slate-200">Male</option>
                      <option value="Female" className="bg-[#0f172a] text-slate-200">Female</option>
                      <option value="Other" className="bg-[#0f172a] text-slate-200">Other</option>
                      <option value="Prefer not to say" className="bg-[#0f172a] text-slate-200">Prefer not to say</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase font-bold text-slate-450 dark:text-slate-550">Age</label>
                    <input 
                      type="number" 
                      value={age} 
                      onChange={(e) => setAge(e.target.value)}
                      className="w-full px-3 py-2 border rounded-xl dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-xs focus:ring-1 focus:ring-primary"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-850">
                  <button 
                    type="button" 
                    onClick={() => setShowEditModal(false)}
                    className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-350"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="px-4 py-2 bg-primary hover:bg-primary-dark text-white text-xs font-bold rounded-xl"
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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md bg-white dark:bg-[#0c1221] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl p-6 space-y-4"
            >
              <h3 className="text-base font-extrabold text-slate-800 dark:text-white">Change Credentials Password</h3>
              <form onSubmit={handlePwdSubmit} className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[9px] uppercase font-bold text-slate-450 dark:text-slate-550">Current Password</label>
                  <input 
                    type="password" 
                    value={oldPassword} 
                    onChange={(e) => setOldPassword(e.target.value)}
                    required
                    className="w-full px-3 py-2 border rounded-xl dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-xs focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] uppercase font-bold text-slate-450 dark:text-slate-550">New Password</label>
                  <input 
                    type="password" 
                    value={newPassword} 
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    className="w-full px-3 py-2 border rounded-xl dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-xs focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] uppercase font-bold text-slate-450 dark:text-slate-550">Confirm New Password</label>
                  <input 
                    type="password" 
                    value={confirmPassword} 
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="w-full px-3 py-2 border rounded-xl dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-xs focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-850">
                  <button 
                    type="button" 
                    onClick={() => setShowPwdModal(false)}
                    className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-350"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="px-4 py-2 bg-primary hover:bg-primary-dark text-white text-xs font-bold rounded-xl"
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
