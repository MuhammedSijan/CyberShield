import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSecurity } from '../context/SecurityContext';
import { useToast } from '../hooks/useToast';
import { useNavigate } from 'react-router-dom';
import { db, auth } from '../firebase/firebase';
import { doc, deleteDoc, collection, getDocs, setDoc } from 'firebase/firestore';
import { 
  Sun, Lock, Trash2, Download, LogOut, ShieldAlert, Sliders, Bell
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

  // Sync React states with changes from Firestore settings reloaders
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
    // Write configs to localStorage
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

    // Update preferences in Firestore (for registered user sessions only)
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
      // System Theme Sync
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
    showToast('Data Cleared', 'Active session diagnostic audits have been wiped.', 'info');
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

        // 1. Delete scan history subcollection documents
        const historyColRef = collection(db, 'users', uid, 'history');
        const snapshot = await getDocs(historyColRef);
        const deletePromises = snapshot.docs.map(docSnap => deleteDoc(docSnap.ref));
        await Promise.all(deletePromises);

        // 2. Delete user subcollection documents
        await deleteDoc(doc(db, 'users', uid, 'profile', 'details'));
        await deleteDoc(doc(db, 'users', uid, 'settings', 'preferences'));
        await deleteDoc(doc(db, 'users', uid, 'stats', 'securityScore'));

        // 3. Delete Firebase Auth user credentials
        await currentUser.delete();

        // 4. Log out and clear local caches
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
          showToast('Deletion Failed', 'Failed to permanently purge account database details.', 'danger');
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
      <div>
        <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white tracking-tight">Configuration Settings</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Manage local sandboxing rules, interface styling, and user privacy toggles.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* LEFT COLUMN: NAVIGATION SHORTCUTS */}
        <div className="md:col-span-1 space-y-4">
          <div className="glass-panel p-4 rounded-xl border-slate-200 dark:border-slate-800 bg-[#0d1424]/30 space-y-1">
            <p className="text-[10px] text-slate-450 uppercase font-extrabold tracking-wider px-2.5 pb-2">Category Tabs</p>
            {[
              "Appearance & Animations",
              "Diagnostics Security",
              "Data Privacy & Storage",
              "Access Account Actions"
            ].map((tab, idx) => (
              <div 
                key={idx}
                className="w-full px-3 py-2 text-xs font-semibold text-slate-650 dark:text-slate-350 hover:bg-slate-100 dark:hover:bg-slate-850 rounded-lg cursor-pointer transition-colors"
              >
                {tab}
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT COLUMN: PREFERENCES OPTIONS */}
        <div className="md:col-span-2 space-y-6">
          {/* SECTION 1: APPEARANCE & ANIMATIONS */}
          <div className="glass-panel p-6 rounded-2xl border-slate-205 dark:border-slate-800 space-y-5">
            <h3 className="font-extrabold text-slate-800 dark:text-white text-sm flex items-center gap-2">
              <Sun className="h-4.5 w-4.5 text-primary" /> Appearance & Styling Mode
            </h3>
            
            <div className="space-y-4">
              <div className="flex gap-2">
                {['light', 'dark', 'system'].map((mode) => (
                  <button
                    key={mode}
                    onClick={() => applyTheme(mode)}
                    className={`flex-1 py-2 px-3 text-xs font-bold rounded-xl border transition-all uppercase tracking-wider ${
                      themeMode === mode 
                        ? 'border-primary bg-primary/10 text-primary' 
                        : 'border-slate-205 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-850 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>

              {/* Toggles */}
              <div className="space-y-3.5 pt-2 border-t border-slate-100 dark:border-slate-850">
                <label className="flex items-center justify-between cursor-pointer">
                  <div className="space-y-0.5 text-left">
                    <p className="text-xs font-bold text-slate-805 dark:text-slate-250">Enable Motion Effects</p>
                    <p className="text-[10px] text-slate-450 dark:text-slate-500">Allow smooth loading states and dialog entrances.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={enableAnimations}
                    onChange={(e) => setEnableAnimations(e.target.checked)}
                    className="rounded text-primary focus:ring-primary h-4.5 w-4.5 bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800"
                  />
                </label>

                <label className="flex items-center justify-between cursor-pointer">
                  <div className="space-y-0.5 text-left">
                    <p className="text-xs font-bold text-slate-805 dark:text-slate-250">Reduce System Motion</p>
                    <p className="text-[10px] text-slate-450 dark:text-slate-500">Force static frames to minimize GPU and rendering overhead.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={reduceMotion}
                    onChange={(e) => setReduceMotion(e.target.checked)}
                    className="rounded text-primary focus:ring-primary h-4.5 w-4.5 bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800"
                  />
                </label>

                <label className="flex items-center justify-between cursor-pointer">
                  <div className="space-y-0.5 text-left">
                    <p className="text-xs font-bold text-slate-805 dark:text-slate-250">Network Particles Overlay</p>
                    <p className="text-[10px] text-slate-450 dark:text-slate-500">Draw slow-moving connection links on the background canvas.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={animatedBg}
                    onChange={(e) => setAnimatedBg(e.target.checked)}
                    className="rounded text-primary focus:ring-primary h-4.5 w-4.5 bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800"
                  />
                </label>

                <label className="flex items-center justify-between cursor-pointer">
                  <div className="space-y-0.5 text-left">
                    <p className="text-xs font-bold text-slate-805 dark:text-slate-250">Security Backdrop Grid</p>
                    <p className="text-[10px] text-slate-450 dark:text-slate-500">Render cybersecurity grid pattern graphics.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={gridLines}
                    onChange={(e) => setGridLines(e.target.checked)}
                    className="rounded text-primary focus:ring-primary h-4.5 w-4.5 bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800"
                  />
                </label>
              </div>
            </div>
          </div>

          {/* SECTION 2: NOTIFICATIONS & PERMISSIONS */}
          <div className="glass-panel p-6 rounded-2xl border-slate-205 dark:border-slate-800 space-y-5">
            <h3 className="font-extrabold text-slate-800 dark:text-white text-sm flex items-center gap-2">
              <Bell className="h-4.5 w-4.5 text-primary" /> Notifications & Interface Rules
            </h3>
            
            <div className="space-y-3.5">
              <label className="flex items-center justify-between cursor-pointer">
                <div className="space-y-0.5 text-left">
                  <p className="text-xs font-bold text-slate-805 dark:text-slate-250">Enable Slide Toasts</p>
                  <p className="text-[10px] text-slate-450 dark:text-slate-500">Display instant status indicators at the top-right.</p>
                </div>
                <input
                  type="checkbox"
                  checked={enableNotifications}
                  onChange={(e) => setEnableNotifications(e.target.checked)}
                  className="rounded text-primary focus:ring-primary h-4.5 w-4.5 bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer">
                <div className="space-y-0.5 text-left">
                  <p className="text-xs font-bold text-slate-805 dark:text-slate-250">Play Warning Sounds</p>
                  <p className="text-[10px] text-slate-450 dark:text-slate-500">Trigger warnings for dangerous URL scans.</p>
                </div>
                <input
                  type="checkbox"
                  checked={playSounds}
                  onChange={(e) => setPlaySounds(e.target.checked)}
                  className="rounded text-primary focus:ring-primary h-4.5 w-4.5 bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer">
                <div className="space-y-0.5 text-left">
                  <p className="text-xs font-bold text-slate-805 dark:text-slate-250">High Performance Canvas</p>
                  <p className="text-[10px] text-slate-450 dark:text-slate-500">Increase node animation render frequency parameters.</p>
                </div>
                <input
                  type="checkbox"
                  checked={performanceMode}
                  onChange={(e) => setPerformanceMode(e.target.checked)}
                  className="rounded text-primary focus:ring-primary h-4.5 w-4.5 bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer">
                <div className="space-y-0.5 text-left">
                  <p className="text-xs font-bold text-slate-805 dark:text-slate-250">Auto Request Camera</p>
                  <p className="text-[10px] text-slate-450 dark:text-slate-500">Automatically launch capture permission triggers during QR audits.</p>
                </div>
                <input
                  type="checkbox"
                  checked={cameraPermission}
                  onChange={(e) => setCameraPermission(e.target.checked)}
                  className="rounded text-primary focus:ring-primary h-4.5 w-4.5 bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800"
                />
              </label>
            </div>
          </div>

          {/* SECTION 3: DIAGNOSTICS SECURITY */}
          <div className="glass-panel p-6 rounded-2xl border-slate-205 dark:border-slate-800 space-y-5">
            <h3 className="font-extrabold text-slate-800 dark:text-white text-sm flex items-center gap-2">
              <Lock className="h-4.5 w-4.5 text-primary" /> Active Diagnostics Security
            </h3>

            <div className="space-y-3.5">
              <label className="flex items-center justify-between cursor-pointer">
                <div className="space-y-0.5 text-left">
                  <p className="text-xs font-bold text-slate-805 dark:text-slate-250">Save Scan History Logs</p>
                  <p className="text-[10px] text-slate-450 dark:text-slate-500">Record check items to compute session threat scores.</p>
                </div>
                <input
                  type="checkbox"
                  checked={saveHistory}
                  onChange={(e) => setSaveHistory(e.target.checked)}
                  className="rounded text-primary focus:ring-primary h-4.5 w-4.5 bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer">
                <div className="space-y-0.5 text-left">
                  <p className="text-xs font-bold text-slate-805 dark:text-slate-250">Auto Generate reports</p>
                  <p className="text-[10px] text-slate-450 dark:text-slate-500">Compile dashboard summaries automatically on first hazard logs.</p>
                </div>
                <input
                  type="checkbox"
                  checked={autoReports}
                  onChange={(e) => setAutoReports(e.target.checked)}
                  className="rounded text-primary focus:ring-primary h-4.5 w-4.5 bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer">
                <div className="space-y-0.5 text-left">
                  <p className="text-xs font-bold text-slate-805 dark:text-slate-250">Remember Active Login Session</p>
                  <p className="text-[10px] text-slate-450 dark:text-slate-500">Store tokens inside browser persistent memory files.</p>
                </div>
                <input
                  type="checkbox"
                  checked={rememberLogin}
                  onChange={(e) => setRememberLogin(e.target.checked)}
                  className="rounded text-primary focus:ring-primary h-4.5 w-4.5 bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800"
                />
              </label>
            </div>
          </div>

          {/* SECTION 4: DATA PRIVACY & STORAGE */}
          <div className="glass-panel p-6 rounded-2xl border-slate-205 dark:border-slate-800 space-y-5">
            <h3 className="font-extrabold text-slate-800 dark:text-white text-sm flex items-center gap-2">
              <Sliders className="h-4.5 w-4.5 text-primary" /> Data Privacy & Storage
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <button
                onClick={handleExportData}
                className="p-3.5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c1221] hover:bg-slate-100 dark:hover:bg-slate-850 rounded-xl text-left transition-all"
              >
                <div className="p-2 bg-primary/10 rounded-lg text-primary w-fit mb-3">
                  <Download className="h-4.5 w-4.5" />
                </div>
                <h4 className="font-bold text-xs text-slate-800 dark:text-slate-200">Export Scan Logs</h4>
                <p className="text-[10px] text-slate-500 dark:text-slate-450 mt-1">Download scan JSON data files locally.</p>
              </button>

              <button
                onClick={handleClearReports}
                className="p-3.5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c1221] hover:bg-slate-100 dark:hover:bg-slate-850 rounded-xl text-left transition-all"
              >
                <div className="p-2 bg-amber-500/10 rounded-lg text-amber-500 w-fit mb-3">
                  <Trash2 className="h-4.5 w-4.5" />
                </div>
                <h4 className="font-bold text-xs text-slate-800 dark:text-slate-200">Clear Scan History</h4>
                <p className="text-[10px] text-slate-500 dark:text-slate-455 mt-1">Wipe active diagnostics context files.</p>
              </button>

              <button
                onClick={handleDeleteLocalData}
                className="p-3.5 border border-rose-500/20 hover:bg-rose-500/5 rounded-xl text-left transition-all col-span-1 sm:col-span-2"
              >
                <div className="p-2 bg-rose-500/10 rounded-lg text-rose-500 w-fit mb-3">
                  <ShieldAlert className="h-4.5 w-4.5" />
                </div>
                <h4 className="font-bold text-xs text-rose-500">Purge Local Configuration Cache</h4>
                <p className="text-[10px] text-slate-500 dark:text-slate-450 mt-1">Delete all browser cache files and restore defaults.</p>
              </button>
            </div>
          </div>

          {/* SECTION 5: ACCOUNT SETTINGS ACTIONS */}
          <div className="glass-panel p-6 rounded-2xl border-slate-205 dark:border-slate-800 space-y-5">
            <h3 className="font-extrabold text-slate-800 dark:text-white text-sm flex items-center gap-2">
              <LogOut className="h-4.5 w-4.5 text-primary" /> Profile Authorization Toggles
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={handleLogoutAction}
                className="py-3 px-4 bg-primary hover:bg-primary-dark text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-primary/10 flex items-center justify-center gap-1.5"
              >
                <LogOut className="h-4.5 w-4.5" /> Log Out Session
              </button>

              <button
                onClick={handleDeleteAccount}
                className="py-3 px-4 border border-rose-500/30 hover:bg-rose-500/10 text-rose-500 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5"
              >
                <Trash2 className="h-4.5 w-4.5" /> Delete Account Profile
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Settings;
