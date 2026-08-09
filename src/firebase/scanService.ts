import { db } from './firebase';
import { collection, doc, setDoc, serverTimestamp } from 'firebase/firestore';

export interface ScanData {
  scanType: string;
  toolName: string;
  status: string;
  riskLevel: 'Safe' | 'Suspicious' | 'Danger';
  summary: string;
  inputPreview: string;
  recommendation: string;
  riskScore: number;
}

/**
 * Saves a scanner run record to Firestore under users/{uid}/history/{scanId}.
 * Passwords are masked/excluded at the caller level to maintain absolute privacy.
 */
export const saveScanToFirestore = async (uid: string, scan: ScanData) => {
  if (!uid) throw new Error("User UID is required to save scans.");

  const historyColRef = collection(db, 'users', uid, 'history');
  const docRef = doc(historyColRef);
  const reportId = docRef.id;

  const docData = {
    scanType: scan.scanType,
    toolName: scan.toolName,
    timestamp: serverTimestamp(),
    status: scan.status,
    riskLevel: scan.riskLevel,
    summary: scan.summary,
    inputPreview: scan.inputPreview,
    recommendation: scan.recommendation,
    riskScore: scan.riskScore,
    reportId: reportId,
    uid: uid
  };

  await setDoc(docRef, docData);
  return { reportId };
};
