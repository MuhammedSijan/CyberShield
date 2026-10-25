import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSecurity } from '../context/SecurityContext';
import { useToast } from '../hooks/useToast';
import { useNavigate } from 'react-router-dom';
import { db, auth } from '../firebase/firebase';
import { doc, deleteDoc, collection, getDocs, setDoc } from 'firebase/firestore';
import {
  Sun, Moon, Monitor, Lock, Trash2, Download, LogOut, ShieldAlert, Sliders, Bell
} from 'lucide-react';

export const Settings: React.FC = () => {
  const { logout } = useAuth();
  const { scans, clearScans } = useSecurity();
  const { showToast } = useToast();
  const navigate = useNavigate();

  // Persistent settings state hooks (backing up to localStorage)
  const [themeMode, setThemeMode] = useState(() => localStorage.getItem('theme') || 'dark');
  const [enableAnimations, setEnableAnimations] = useState(() => localStorage.getItem('cfg_anim') !== 'false');
  const [reduceMotion, setReduceMotion] = useState(() => localStorage.getItem('cfg_motion') === 'true');
  const [animatedBg, setAnimatedBg] = useState(() => localStorage.getItem('cfg_bg_particle') !== 'false');
  const [gridLines, setGridLines] = useState(() => localStorage.getItem('cfg_bg_grid') !== 'false');
  const [saveHistory, setSaveHistory] = useState(() => localStorage.getItem('cfg_save_history') !== 'false');
  const [autoReports, setAutoReports] = useState(() => localStorage.getItem('cfg_auto_reports') === 'true');
  const [rememberLogin, setRememberLogin] = useState(() => localStorage.getItem('cfg_remember_login') !== 'false');
  const [enableNotifications, setEnableNotifications] = useState(() => localStorage.getItem('cfg_notify') !== 'false');
  const [playSounds, setPlaySounds] = useState(() => localStorage.getItem('cfg_sounds') === 'true');
  const [performanceMode, setPerformanceMode] = useState(() => localStorage.getItem('cfg_perf') === 'true');
  const [cameraPermission, setCameraPermission] = useState(() => localStorage.getItem('cfg_camera') === 'true');

  useEffect(() => {
    const syncStates = () => {
      setThemeMode(localStorage.getItem('theme') || 'dark');
      setEnableAnimations(localStorage.getItem('cfg_anim') !== 'false');
      setReduceMotion(localStorage.getItem('cfg_motion') === 'true');
      setAnimatedBg(localStorage.getItem('cfg_bg_particle') !== 'false');
      setGridLines(localStorage.getItem('cfg_bg_grid') !== 'false');
      setRememberLogin(localStorage.getItem('cfg_remember_login') !== 'false');
    };
    window.addEventListener('settings-update', syncStates);
    return () => window.removeEventListener('settings-update', syncStates);
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  useEffect(() => {
    localStorage.setItem('cfg_anim', enableAnimations.toString());
    localStorage.setItem('cfg_motion', reduceMotion.toString());
    localStorage.setItem('cfg_bg_particle', animatedBg.toString());
    localStorage.setItem('cfg_bg_grid', gridLines.toString());
    localStorage.setItem('cfg_save_history', saveHistory.toString());
    localStorage.setItem('cfg_auto_reports', autoReports.toString());
    localStorage.setItem('cfg_remember_login', rememberLogin.toString());
    localStorage.setItem('cfg_notify', enableNotifications.toString());
    localStorage.setItem('cfg_sounds', playSounds.toString());
    localStorage.setItem('cfg_perf', performanceMode.toString());
    localStorage.setItem('cfg_camera', cameraPermission.toString());
    window.dispatchEvent(new Event('settings-update'));

    const currentUser = auth.currentUser;
    if (currentUser && !currentUser.isAnonymous) {
      const settingsRef = doc(db, 'users', currentUser.uid, 'settings', 'preferences');
      setDoc(settingsRef, {
        theme: themeMode,
        animations: enableAnimations,
        backgroundEffects: gridLines,
        particles: animatedBg,
        reducedMotion: reduceMotion,
        rememberLogin: rememberLogin
      }, { merge: true }).catch((err) => console.error("Failed to sync preferences to Firestore:", err));
    }
  }, [
    themeMode, enableAnimations, reduceMotion, animatedBg, gridLines,
    saveHistory, autoReports, rememberLogin, enableNotifications,
    playSounds, performanceMode, cameraPermission
  ]);

  const applyTheme = (mode: string) => {
    setThemeMode(mode);
    const root = document.documentElement;
    if (mode === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
      localStorage.setItem('theme', 'dark');
    } else if (mode === 'light') {
      root.classList.add('light');
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    } else {
      const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (systemDark) {
        root.classList.add('dark');
        root.classList.remove('light');
      } else {
        root.classList.add('light');
        root.classList.remove('dark');
      }
      localStorage.setItem('theme', 'system');
    }
    showToast('Theme Updated', `Interface set to ${mode} mode.`, 'success');
  };

  const handleExportData = () => {
    if (scans.length === 0) {
      showToast('Export Cancelled', 'No scanning records found to export.', 'warning');
      return;
    }
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(scans, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `cybershield_history_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('Backup Completed', 'Security logs exported successfully.', 'success');
  };

  const handleClearReports = () => {
    clearScans();
    showToast('Data Cleared', 'Active session diagnostic audits have been cleared.', 'info');
  };

  const handleDeleteLocalData = () => {
    if (window.confirm("This action will wipe all local storage and configurations. Do you want to proceed?")) {
      localStorage.clear();
      sessionStorage.clear();
      showToast('Local Data Purged', 'All CyberShield cache files deleted.', 'danger');
      setTimeout(() => {
        window.location.reload();
      }, 500);
    }
  };

  const handleDeleteAccount = async () => {
    if (window.confirm("Are you sure you want to permanently delete your CyberShield profile?")) {
      const currentUser = auth.currentUser;
      if (!currentUser) return;

      try {
        const uid = currentUser.uid;

        const historyColRef = collection(db, 'users', uid, 'history');
        const snapshot = await getDocs(historyColRef);
        const deletePromises = snapshot.docs.map(docSnap => deleteDoc(docSnap.ref));
        await Promise.all(deletePromises);

        await deleteDoc(doc(db, 'users', uid, 'profile', 'details'));
        await deleteDoc(doc(db, 'users', uid, 'settings', 'preferences'));
        await deleteDoc(doc(db, 'users', uid, 'stats', 'securityScore'));

        await currentUser.delete();
        await logout();
        localStorage.clear();
        sessionStorage.clear();
        showToast('Profile Deleted', 'Your security profile was permanently wiped.', 'danger');
        navigate('/auth');
      } catch (err: any) {
        console.error("Account deletion failed:", err);
        if (err.code === 'auth/requires-recent-login') {
          showToast('Reauthentication Required', 'Please log in again before deleting your account.', 'warning');
        } else {
          showToast('Deletion Failed', 'Failed to permanently delete account details.', 'danger');
        }
      }
    }
  };

  const handleLogoutAction = () => {
    logout();
    showToast('Session Ended', 'Your session has been securely closed.', 'info');
    navigate('/auth');
  };

  return (
    <div className="space-y-8 py-4 text-left max-w-4xl mx-auto">
      {/* HEADER SECTION */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-6 space-y-1.5">
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          System Preferences
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
          Manage interface theme, sandboxing telemetry, and local storage retention rules.
        </p>
      </div>

      <div className="space-y-6">
        {/* SECTION 1: APPEARANCE */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-5">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
            <Sun className="h-4 w-4 text-primary" /> Appearance & Theme Mode
          </h2>

          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: 'light', label: 'Light', icon: <Sun className="h-4 w-4" /> },
                { id: 'dark', label: 'Dark', icon: <Moon className="h-4 w-4" /> },
                { id: 'system', label: 'System', icon: <Monitor className="h-4 w-4" /> }
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => applyTheme(item.id)}
                  className={`py-3 px-4 rounded-xl border flex items-center justify-center gap-2 text-xs font-semibold transition-all cursor-pointer ${
                    themeMode === item.id
                      ? 'border-primary bg-primary/10 text-primary shadow-xs'
                      : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              ))}
            </div>

            {/* Motion & rendering toggles */}
            <div className="space-y-3.5 pt-2 border-t border-slate-100 dark:border-slate-800">
              <label className="flex items-center justify-between cursor-pointer">
                <div className="space-y-0.5 text-left">
                  <p className="text-xs font-semibold text-slate-900 dark:text-white">Smooth Transitions</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Enable subtle view transitions and status animations.</p>
                </div>
                <input
                  type="checkbox"
                  checked={enableAnimations}
                  onChange={(e) => setEnableAnimations(e.target.checked)}
                  className="rounded text-primary focus:ring-primary h-4.5 w-4.5"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer">
                <div className="space-y-0.5 text-left">
                  <p className="text-xs font-semibold text-slate-900 dark:text-white">Respect Reduced Motion</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Disable non-essential animation frames automatically.</p>
                </div>
                <input
                  type="checkbox"
                  checked={reduceMotion}
                  onChange={(e) => setReduceMotion(e.target.checked)}
                  className="rounded text-primary focus:ring-primary h-4.5 w-4.5"
                />
              </label>
            </div>
          </div>
        </div>

        {/* SECTION 2: NOTIFICATIONS & BEHAVIOR */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-5">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
            <Bell className="h-4 w-4 text-primary" /> Notifications & Security Alerts
          </h2>

          <div className="space-y-3.5">
            <label className="flex items-center justify-between cursor-pointer">
              <div className="space-y-0.5 text-left">
                <p className="text-xs font-semibold text-slate-900 dark:text-white">Status Toasts</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Display instant non-blocking notification banners on audit completion.</p>
              </div>
              <input
                type="checkbox"
                checked={enableNotifications}
                onChange={(e) => setEnableNotifications(e.target.checked)}
                className="rounded text-primary focus:ring-primary h-4.5 w-4.5"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer">
              <div className="space-y-0.5 text-left">
                <p className="text-xs font-semibold text-slate-900 dark:text-white">Save Audit History</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Log client checks in session state to compute overall exposure ratings.</p>
              </div>
              <input
                type="checkbox"
                checked={saveHistory}
                onChange={(e) => setSaveHistory(e.target.checked)}
                className="rounded text-primary focus:ring-primary h-4.5 w-4.5"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer">
              <div className="space-y-0.5 text-left">
                <p className="text-xs font-semibold text-slate-900 dark:text-white">Remember Active Session</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Preserve login credentials across browser restarts.</p>
              </div>
              <input
                type="checkbox"
                checked={rememberLogin}
                onChange={(e) => setRememberLogin(e.target.checked)}
                className="rounded text-primary focus:ring-primary h-4.5 w-4.5"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer">
              <div className="space-y-0.5 text-left">
                <p className="text-xs font-semibold text-slate-900 dark:text-white">Auto-generate Threat Reports</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Compile aggregated security logs upon completing multi-vector audits.</p>
              </div>
              <input
                type="checkbox"
                checked={autoReports}
                onChange={(e) => setAutoReports(e.target.checked)}
                className="rounded text-primary focus:ring-primary h-4.5 w-4.5"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer">
              <div className="space-y-0.5 text-left">
                <p className="text-xs font-semibold text-slate-900 dark:text-white">Security Audio Cues</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Play subtle auditory signals when severe vulnerabilities are detected.</p>
              </div>
              <input
                type="checkbox"
                checked={playSounds}
                onChange={(e) => setPlaySounds(e.target.checked)}
                className="rounded text-primary focus:ring-primary h-4.5 w-4.5"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer">
              <div className="space-y-0.5 text-left">
                <p className="text-xs font-semibold text-slate-900 dark:text-white">High-Performance Mode</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Throttle background hash computations on lower-power devices.</p>
              </div>
              <input
                type="checkbox"
                checked={performanceMode}
                onChange={(e) => setPerformanceMode(e.target.checked)}
                className="rounded text-primary focus:ring-primary h-4.5 w-4.5"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer">
              <div className="space-y-0.5 text-left">
                <p className="text-xs font-semibold text-slate-900 dark:text-white">Camera Scanner Access</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Allow direct optical feed for the QR code threat inspector.</p>
              </div>
              <input
                type="checkbox"
                checked={cameraPermission}
                onChange={(e) => setCameraPermission(e.target.checked)}
                className="rounded text-primary focus:ring-primary h-4.5 w-4.5"
              />
            </label>
          </div>
        </div>

        {/* SECTION 3: DATA PRIVACY & STORAGE */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-5">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
            <Sliders className="h-4 w-4 text-primary" /> Data Management & Storage
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <button
              onClick={handleExportData}
              className="p-4 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl text-left transition-all cursor-pointer"
            >
              <div className="p-2 bg-primary/10 rounded-lg text-primary w-fit mb-3">
                <Download className="h-4 w-4" />
              </div>
              <h3 className="font-bold text-xs text-slate-900 dark:text-white">Export Audit History</h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Download scan telemetry as a formatted JSON document.</p>
            </button>

            <button
              onClick={handleClearReports}
              className="p-4 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl text-left transition-all cursor-pointer"
            >
              <div className="p-2 bg-amber-500/10 rounded-lg text-amber-600 dark:text-amber-400 w-fit mb-3">
                <Trash2 className="h-4 w-4" />
              </div>
              <h3 className="font-bold text-xs text-slate-900 dark:text-white">Clear Active Scans</h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Reset your session audit log without clearing account preferences.</p>
            </button>

            <button
              onClick={handleDeleteLocalData}
              className="p-4 border border-rose-200 dark:border-rose-900/40 hover:bg-rose-50/50 dark:hover:bg-rose-950/20 rounded-xl text-left transition-all col-span-1 sm:col-span-2 cursor-pointer"
            >
              <div className="p-2 bg-rose-500/10 rounded-lg text-rose-600 dark:text-rose-400 w-fit mb-3">
                <ShieldAlert className="h-4 w-4" />
              </div>
              <h3 className="font-bold text-xs text-rose-600 dark:text-rose-400">Purge Local Browser Cache</h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Wipe all client configuration and cached variables to restore default state.</p>
            </button>
          </div>
        </div>

        {/* SECTION 4: ACCOUNT ACTIONS */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
            <Lock className="h-4 w-4 text-primary" /> Session Authorization
          </h2>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleLogoutAction}
              className="px-5 py-2.5 bg-primary hover:bg-primary-dark text-white text-xs font-semibold rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <LogOut className="h-4 w-4" />
              <span>Log Out Session</span>
            </button>

            <button
              onClick={handleDeleteAccount}
              className="px-5 py-2.5 border border-rose-200 dark:border-rose-900/60 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-rose-600 dark:text-rose-400 text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Trash2 className="h-4 w-4" />
              <span>Delete Account Profile</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
