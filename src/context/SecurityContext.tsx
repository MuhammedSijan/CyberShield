import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { db, auth } from '../firebase/firebase';
import { 
  collection, 
  doc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  onSnapshot, 
  query, 
  orderBy, 
  increment 
} from 'firebase/firestore';

export interface ScanItem {
  id: string;
  type: 'password' | 'url' | 'phishing' | 'qr' | 'quiz' | 'generator' | 'file';
  target: string;
  result: string;
  riskScore: number;
  riskLevel: 'Safe' | 'Suspicious' | 'Danger';
  timestamp: string;
}

interface SecurityContextType {
  scans: ScanItem[];
  addScan: (type: ScanItem['type'], target: string, result: string, riskScore: number, riskLevel: ScanItem['riskLevel']) => void;
  clearScans: () => void;
  getSafetyScore: () => number;
}

const SecurityContext = createContext<SecurityContextType | undefined>(undefined);

export const useSecurity = () => {
  const context = useContext(SecurityContext);
  if (!context) {
    throw new Error('useSecurity must be used within a SecurityProvider');
  }
  return context;
};

const getRecommendationsFor = (type: string, riskLevel: string): string[] => {
  switch (type) {
    case 'url':
      if (riskLevel === 'Safe') return ['The domain displays valid SSL/TLS certificates and has no flagged phishing history.', 'Continue to verify domains before clicking.'];
      if (riskLevel === 'Suspicious') return ['This URL has subdomains or styling that could indicate typosquatting.', 'Double check the domain address characters.', 'Do not enter passwords on this site.'];
      return ['Malicious redirects or phishing triggers detected!', 'Close this tab immediately.', 'Run a security scan on your browser/system.'];
    case 'password':
      if (riskLevel === 'Safe') return ['High entropy password verified. Keep using unique passwords for all accounts.', 'Store this password in a secure password manager.'];
      if (riskLevel === 'Suspicious') return ['Moderate complexity. Consider adding symbols or capital letters.', 'Avoid repeating numbers or words.'];
      return ['Weak password detected! It can be cracked in seconds.', 'Change this password immediately across all services.'];
    case 'qr':
      if (riskLevel === 'Safe') return ['The QR link is clean and safe to visit.'];
      if (riskLevel === 'Suspicious') return ['Verify the landing page domain is official before logging in.'];
      return ['Decoded QR link contains threat markers! Do not open the URL on your device.'];
    case 'file':
      if (riskLevel === 'Safe') return ['No file double extensions or dangerous MIME signatures found.'];
      if (riskLevel === 'Suspicious') return ['Review file details. An unusual extension prefix could indicate hidden payloads.'];
      return ['Danger! Dangerous script execution markers or known malware signatures detected.', 'Delete this file immediately from your filesystem.'];
    case 'phishing':
      if (riskLevel === 'Safe') return ['No standard text patterns indicating social engineering or urgency details found.'];
      if (riskLevel === 'Suspicious') return ['Watch out for social engineering headers or generic banking validation templates.'];
      return ['Critical! Phishing indicators detected (financial threats, urgent links, false panic prompts).', 'Do not reply, click links, or wire details.', 'Report and mark this email/SMS as spam.'];
    case 'quiz':
      if (riskLevel === 'Safe') return ['Excellent cybersecurity hygiene awareness! Keep up the good work.'];
      if (riskLevel === 'Suspicious') return ['Solid awareness score, but some weak areas identified.', 'Review the questions you missed.'];
      return ['Low security awareness. Read the safety guide to learn about basic online protection rules.'];
    default:
      return ['Standard security sandboxing completed. Keep scanning check items regularly.'];
  }
};

export const SecurityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, guestMode } = useAuth();
  const [scans, setScans] = useState<ScanItem[]>([]);

  // Listen to Firestore history collection reactively
  useEffect(() => {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      setScans([]);
      return;
    }

    const historyColRef = collection(db, 'users', currentUser.uid, 'history');
    const q = query(historyColRef, orderBy('timestamp', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const mapped = snapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        let type: ScanItem['type'] = 'url';
        const scanTypeLower = (data.scanType || '').toLowerCase();
        
        if (scanTypeLower === 'password' || scanTypeLower === 'generator') {
          type = 'password';
        } else if (scanTypeLower === 'url') {
          type = 'url';
        } else if (scanTypeLower === 'phishing') {
          type = 'phishing';
        } else if (scanTypeLower === 'qr') {
          type = 'qr';
        } else if (scanTypeLower === 'file') {
          type = 'file';
        } else if (scanTypeLower === 'quiz') {
          type = 'quiz';
        }

        return {
          id: data.reportId || docSnap.id,
          type: type,
          target: data.input || '',
          result: data.result || '',
          riskScore: data.riskScore ?? (data.riskLevel === 'Danger' ? 100 : data.riskLevel === 'Suspicious' ? 50 : 0),
          riskLevel: (data.riskLevel || 'Safe') as ScanItem['riskLevel'],
          timestamp: data.timestamp || new Date().toISOString()
        };
      });
      setScans(mapped);
    }, (error) => {
      console.error("Firestore scans listener error:", error);
    });

    return () => unsubscribe();
  }, [user?.uid, guestMode]);

  const addScan = async (
    type: ScanItem['type'],
    target: string,
    result: string,
    riskScore: number,
    riskLevel: ScanItem['riskLevel']
  ) => {
    const currentUser = auth.currentUser;
    if (!currentUser) return;

    try {
      const uid = currentUser.uid;
      const historyColRef = collection(db, 'users', uid, 'history');
      const docRef = doc(historyColRef);
      const reportId = docRef.id;

      const typeMap: Record<string, string> = {
        'url': 'URL',
        'password': 'Password',
        'qr': 'QR',
        'file': 'File',
        'phishing': 'Phishing',
        'quiz': 'Quiz',
        'generator': 'Password'
      };

      const scanType = typeMap[type] || 'URL';
      const timestamp = new Date().toISOString();

      const newScanDoc = {
        scanType,
        timestamp,
        input: target,
        result,
        riskLevel,
        riskScore,
        recommendations: getRecommendationsFor(type, riskLevel),
        reportId
      };

      await setDoc(docRef, newScanDoc);

      if (!currentUser.isAnonymous) {
        const userRef = doc(db, 'users', uid);
        
        // Re-calculate local safety score synchronously to update user profile doc immediately
        const currentScans = [
          { id: reportId, type, target, result, riskScore, riskLevel, timestamp },
          ...scans.filter(s => !(s.type === type && s.target === target))
        ].slice(0, 10);
        
        const totalSafety = currentScans.reduce((acc, scan) => acc + (100 - scan.riskScore), 0);
        const newSafetyScore = currentScans.length > 0 ? Math.round(totalSafety / currentScans.length) : 100;

        await updateDoc(userRef, {
          totalScans: increment(1),
          securityScore: newSafetyScore
        });
      }
    } catch (err) {
      console.error("Failed to write scan to Firestore:", err);
    }
  };

  const clearScans = async () => {
    const currentUser = auth.currentUser;
    if (!currentUser) return;

    try {
      const uid = currentUser.uid;
      const historyColRef = collection(db, 'users', uid, 'history');
      const snapshot = await getDocs(historyColRef);
      const deletePromises = snapshot.docs.map(docSnap => deleteDoc(docSnap.ref));
      await Promise.all(deletePromises);

      if (!currentUser.isAnonymous) {
        const userRef = doc(db, 'users', uid);
        await updateDoc(userRef, {
          securityScore: 100,
          totalScans: 0
        });
      }
    } catch (err) {
      console.error("Failed to clear scans from Firestore:", err);
    }
  };

  const getSafetyScore = () => {
    if (scans.length === 0) return 0;
    const totalSafety = scans.reduce((acc, scan) => acc + (100 - scan.riskScore), 0);
    return Math.round(totalSafety / scans.length);
  };

  return (
    <SecurityContext.Provider value={{ scans, addScan, clearScans, getSafetyScore }}>
      {children}
    </SecurityContext.Provider>
  );
};
