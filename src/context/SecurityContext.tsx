import React, { createContext, useContext, useState, useEffect } from 'react';

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

export const SecurityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [scans, setScans] = useState<ScanItem[]>(() => {
    const saved = localStorage.getItem('security_scans');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('security_scans', JSON.stringify(scans));
  }, [scans]);

  const addScan = (
    type: ScanItem['type'],
    target: string,
    result: string,
    riskScore: number,
    riskLevel: ScanItem['riskLevel']
  ) => {
    const newScan: ScanItem = {
      id: Math.random().toString(36).substring(2, 9),
      type,
      target,
      result,
      riskScore,
      riskLevel,
      timestamp: 'Just now'
    };
    
    // De-duplicate scan entries of the same type/target to avoid cluttering history
    setScans((prev) => {
      const filtered = prev.filter(s => !(s.type === type && s.target === target));
      return [newScan, ...filtered].slice(0, 10); // Keep last 10 entries
    });
  };

  const clearScans = () => {
    setScans([]);
    localStorage.removeItem('security_scans');
  };

  const getSafetyScore = () => {
    if (scans.length === 0) return 0;
    
    // Average secure rating: 100 minus riskScore (so a riskScore of 0 means 100% safety)
    const totalSafety = scans.reduce((acc, scan) => acc + (100 - scan.riskScore), 0);
    return Math.round(totalSafety / scans.length);
  };

  return (
    <SecurityContext.Provider value={{ scans, addScan, clearScans, getSafetyScore }}>
      {children}
    </SecurityContext.Provider>
  );
};
