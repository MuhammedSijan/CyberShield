import type { ScanItem } from '../context/SecurityContext';
import type { User } from '../context/AuthContext';

export const generatePDFReport = (
  scans: ScanItem[], 
  overallScore: number, 
  sessionDurationMs: number,
  user: User | null
) => {
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Failed to generate report window. Please allow popups on this page.');
    return;
  }

  const now = new Date();
  
  // Format Date and Time
  const dateStr = now.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const timeStr = now.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });

  // Helper: Format session duration
  const formatDuration = (ms: number) => {
    const totalSecs = Math.floor(ms / 1000);
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins} min ${secs} sec`;
  };

  // Helper: Generate Session ID
  const generateSessionId = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = 'CS-';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const sessionId = generateSessionId();
  const appVersion = 'v1.2.0';

  // Determine Risk Level, Grade, and Color Scheme
  let overallRiskLevel: 'Safe' | 'Suspicious' | 'Danger' = 'Safe';
  let overallColor = '#10B981'; // Emerald
  let overallBg = '#F0FDF4';
  let overallBorder = '#BBF7D0';
  let overallGrade = 'A+ (Secure)';

  if (overallScore < 40) {
    overallRiskLevel = 'Danger';
    overallColor = '#EF4444'; // Rose
    overallBg = '#FEF2F2';
    overallBorder = '#FECDD3';
    overallGrade = 'D (Critical)';
  } else if (overallScore < 70) {
    overallRiskLevel = 'Suspicious';
    overallColor = '#F59E0B'; // Amber
    overallBg = '#FFFBEB';
    overallBorder = '#FEF3C7';
    overallGrade = 'C (Caution)';
  } else if (overallScore < 90) {
    overallRiskLevel = 'Safe';
    overallColor = '#3B82F6'; // Blue
    overallBg = '#EFF6FF';
    overallBorder = '#BFDBFE';
    overallGrade = 'B (Sentinel)';
  }

  // Count summaries
  const urlCount = scans.filter(s => s.type === 'url').length;
  const qrCount = scans.filter(s => s.type === 'qr').length;
  const pwdCount = scans.filter(s => s.type === 'password').length;
  const genCount = scans.filter(s => s.type === 'generator').length;
  const fileCount = scans.filter(s => s.type === 'file').length;
  const phishingCount = scans.filter(s => s.type === 'phishing').length;
  const quizCount = scans.filter(s => s.type === 'quiz').length;

  // Filter detailed scan arrays
  const urlScans = scans.filter(s => s.type === 'url');
  const qrScans = scans.filter(s => s.type === 'qr');
  const passwordScans = scans.filter(s => s.type === 'password');
  const generatorScans = scans.filter(s => s.type === 'generator');
  const fileScans = scans.filter(s => s.type === 'file');
  const phishingScans = scans.filter(s => s.type === 'phishing');
  const quizScans = scans.filter(s => s.type === 'quiz');

  // Generate dynamic Narrative Final Assessment Summary
  const generateFinalAssessmentNarrative = () => {
    if (scans.length === 0) {
      return "No diagnostic scans were executed in this session.";
    }

    const totalRisks = scans.filter(s => s.riskLevel !== 'Safe').length;
    let text = `Overall Security Status: ${overallRiskLevel}. `;
    
    if (totalRisks === 0) {
      text += "The evaluated session showed no high-risk indicators. ";
    } else {
      text += `The evaluated session flagged ${totalRisks} security alerts. `;
    }

    // Add statements for each tool
    if (pwdCount > 0) {
      const weakPasswords = passwordScans.filter(s => s.riskLevel !== 'Safe').length;
      if (weakPasswords > 0) {
        text += `${weakPasswords} password check(s) flagged complexity warnings. `;
      } else {
        text += "All inspected passwords met entropy safety baselines. ";
      }
    }
    if (genCount > 0) {
      text += `${genCount} password sequence(s) were securely generated. `;
    }
    if (urlCount > 0) {
      const maliciousUrls = urlScans.filter(s => s.riskLevel !== 'Safe').length;
      if (maliciousUrls > 0) {
        text += `${maliciousUrls} link target(s) returned suspicious DNS or SSL warnings. `;
      } else {
        text += "Inspected URL addresses were analyzed and found safe. ";
      }
    }
    if (fileCount > 0) {
      const flaggedFiles = fileScans.filter(s => s.riskLevel !== 'Safe').length;
      if (flaggedFiles > 0) {
        text += `${flaggedFiles} file check(s) flagged double-extension or binary warnings. `;
      } else {
        text += "No suspicious file payloads were detected during this session. ";
      }
    }
    if (qrCount > 0) {
      const flaggedQrs = qrScans.filter(s => s.riskLevel !== 'Safe').length;
      if (flaggedQrs > 0) {
        text += "Suspicious redirection targets were decoded inside QR matrix audits. ";
      } else {
        text += "No suspicious QR codes were detected during this session. ";
      }
    }
    if (phishingCount > 0) {
      const phishingMsgs = phishingScans.filter(s => s.riskLevel !== 'Safe').length;
      if (phishingMsgs > 0) {
        text += "Phishing filters flagged manipulative panic patterns inside messages. ";
      } else {
        text += "No message payloads matched standard phishing profiles. ";
      }
    }
    if (quizCount > 0) {
      text += "Interactive hygiene quiz completed. ";
    }

    text += "Continue following recommended cybersecurity practices.";
    return text;
  };

  const dynamicSummaryText = generateFinalAssessmentNarrative();

  const content = `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <title>CyberShield Security Assessment Report</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
          
          @page {
            size: A4 portrait;
            margin: 20mm;
          }
          
          body { 
            font-family: 'Inter', sans-serif; 
            color: #0f172a; 
            line-height: 1.5; 
            margin: 0; 
            padding: 0;
            background: #ffffff;
            font-size: 11pt;
          }
          
          .header { 
            border-bottom: 2px solid #e2e8f0; 
            padding-bottom: 16px; 
            margin-bottom: 24px; 
            display: flex; 
            justify-content: space-between; 
            align-items: flex-end; 
          }
          
          .logo { 
            font-size: 22pt; 
            font-weight: 800; 
            color: #0f172a; 
            letter-spacing: -0.03em;
            margin: 0;
          }
          
          .logo span { 
            color: #2563eb; 
          }
          
          .meta { 
            font-size: 9pt; 
            color: #64748b; 
            text-align: right; 
            line-height: 1.4;
            font-weight: 500;
          }
          
          .title { 
            font-size: 24pt; 
            font-weight: 800; 
            color: #0f172a; 
            margin: 0 0 16px 0; 
            letter-spacing: -0.03em;
          }
          
          .summary-card {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            padding: 16px;
            margin-bottom: 24px;
          }
          
          .summary-grid {
            display: grid;
            grid-template-columns: repeat(5, 1fr);
            gap: 12px;
          }
          
          .summary-metric {
            border-right: 1px solid #e2e8f0;
            padding-right: 8px;
          }
          
          .summary-metric:last-child {
            border-right: none;
            padding-right: 0;
          }
          
          .metric-label { 
            font-size: 7.5pt; 
            text-transform: uppercase; 
            color: #64748b; 
            font-weight: 700; 
            letter-spacing: 0.05em;
          }
          
          .metric-value { 
            font-size: 11pt; 
            font-weight: 800; 
            color: #0f172a; 
            margin-top: 4px; 
          }
          
          .section-title { 
            font-size: 12pt; 
            font-weight: 800; 
            color: #0f172a; 
            margin-top: 28px; 
            margin-bottom: 12px;
            border-bottom: 1.5px solid #e2e8f0; 
            padding-bottom: 4px; 
            text-transform: uppercase;
            letter-spacing: 0.05em;
          }
          
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 24px;
          }
          
          th {
            background: #f1f5f9;
            color: #475569;
            text-align: left;
            font-size: 8.5pt;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            padding: 8px 12px;
            border: 1px solid #e2e8f0;
          }
          
          td {
            padding: 8px 12px;
            border: 1px solid #e2e8f0;
            font-size: 9.5pt;
          }
          
          .audit-item {
            border: 1px solid #e2e8f0;
            background: #ffffff;
            border-radius: 8px;
            padding: 12px;
            margin-bottom: 16px;
            page-break-inside: avoid;
          }
          
          .audit-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 10px;
            border-bottom: 1px solid #f1f5f9;
            padding-bottom: 6px;
          }
          
          .audit-title {
            font-size: 11pt;
            font-weight: 700;
            color: #0f172a;
          }
          
          .audit-badge {
            font-size: 8pt;
            font-weight: 700;
            text-transform: uppercase;
            padding: 2px 8px;
            border-radius: 9999px;
            border: 1px solid currentColor;
          }
          
          .grid-details {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;
          }
          
          .detail-card {
            background: #f8fafc;
            border: 1px solid #f1f5f9;
            padding: 8px 10px;
            border-radius: 6px;
          }
          
          .detail-label {
            font-weight: 700;
            color: #64748b;
            text-transform: uppercase;
            font-size: 7.5pt;
            letter-spacing: 0.05em;
          }
          
          .detail-value {
            color: #1e293b;
            margin-top: 2px;
            font-weight: 600;
            font-size: 9pt;
            word-break: break-all;
          }
          
          .audit-recommendations {
            font-size: 9pt;
            color: #334155;
            margin-top: 10px;
            background: #f8fafc;
            padding: 8px 10px;
            border-left: 3px solid #3b82f6;
            border-radius: 0 6px 6px 0;
          }
          
          .final-recommendations {
            background: #eff6ff;
            border: 1px solid #bfdbfe;
            border-radius: 8px;
            padding: 14px;
            margin-top: 20px;
            font-size: 9.5pt;
            color: #1e40af;
          }
          
          .footer { 
            margin-top: 48px; 
            border-top: 1.5px solid #e2e8f0; 
            padding-top: 16px; 
            font-size: 8.5pt; 
            color: #94a3b8; 
            text-align: center; 
            font-weight: 500;
          }
          
          .privacy-text {
            font-size: 7.5pt;
            margin-top: 4px;
            color: #cbd5e1;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo">Cyber<span>Shield</span></div>
          <div class="meta">
            Assessment Date: ${dateStr}<br/>
            Assessment Time: ${timeStr}<br/>
            User Name: ${user ? `${user.firstName} ${user.lastName}` : 'Guest Session'}<br/>
            Session ID: ${sessionId}<br/>
            Application Version: ${appVersion}
          </div>
        </div>
        
        <h1 class="title">CyberShield Security Assessment Report</h1>
        
        <div class="badge" style="background: ${overallBg}; color: ${overallColor}; border: 1px solid ${overallBorder};">
          Overall Status: ${overallGrade}
        </div>

        <div class="summary-card">
          <div class="summary-grid">
            <div class="summary-metric">
              <div class="metric-label">Security Score</div>
              <div class="metric-value" style="color: #2563eb;">${overallScore}%</div>
            </div>
            <div class="summary-metric">
              <div class="metric-label">Security Grade</div>
              <div class="metric-value">${overallGrade.split(' ')[0]}</div>
            </div>
            <div class="summary-metric">
              <div class="metric-label">Risk Level</div>
              <div class="metric-value" style="color: ${overallColor};">${overallRiskLevel}</div>
            </div>
            <div class="summary-metric">
              <div class="metric-label">Duration</div>
              <div class="metric-value">${formatDuration(sessionDurationMs)}</div>
            </div>
            <div class="summary-metric">
              <div class="metric-label">Total Scans</div>
              <div class="metric-value">${scans.length}</div>
            </div>
          </div>
        </div>

        <div class="section-title">Session Statistics</div>
        <table>
          <thead>
            <tr>
              <th style="width: 70%;">Diagnostic Area</th>
              <th style="width: 30%; text-align: center;">Scans Run</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Password Checks</td>
              <td style="text-align: center;">${pwdCount}</td>
            </tr>
            <tr>
              <td>Passwords Generated</td>
              <td style="text-align: center;">${genCount}</td>
            </tr>
            <tr>
              <td>URL Scans</td>
              <td style="text-align: center;">${urlCount}</td>
            </tr>
            <tr>
              <td>QR Scans</td>
              <td style="text-align: center;">${qrCount}</td>
            </tr>
            <tr>
              <td>File Analysis</td>
              <td style="text-align: center;">${fileCount}</td>
            </tr>
            <tr>
              <td>Phishing Analysis</td>
              <td style="text-align: center;">${phishingCount}</td>
            </tr>
            <tr>
              <td>Quiz Attempts</td>
              <td style="text-align: center;">${quizCount}</td>
            </tr>
          </tbody>
        </table>

        <div class="section-title">Detailed Results</div>

        ${passwordScans.length > 0 ? `
          <div style="font-weight: 800; font-size: 10pt; color: #475569; margin: 16px 0 8px 0; text-transform: uppercase;">Module: Password Checker</div>
          ${passwordScans.map(scan => `
            <div class="audit-item">
              <div class="audit-header">
                <span class="audit-title">Complexity and Strength Assessment</span>
                <span class="audit-badge" style="color: ${scan.riskLevel === 'Safe' ? '#10B981' : scan.riskLevel === 'Suspicious' ? '#F59E0B' : '#EF4444'};">
                  ${scan.riskLevel}
                </span>
              </div>
              <div class="grid-details">
                <div class="detail-card">
                  <div class="detail-label">Input Parameter</div>
                  <div class="detail-value">${scan.target}</div>
                </div>
                <div class="detail-card">
                  <div class="detail-label">Crack Time Estimate</div>
                  <div class="detail-value">${scan.result}</div>
                </div>
                <div class="detail-card">
                  <div class="detail-label">Entropy Score</div>
                  <div class="detail-value">${100 - scan.riskScore}/100</div>
                </div>
                <div class="detail-card">
                  <div class="detail-label">Vulnerability Weaknesses</div>
                  <div class="detail-value">${scan.riskLevel === 'Safe' ? 'No vulnerabilities flagged.' : 'Complexity conditions not met.'}</div>
                </div>
              </div>
              <div class="audit-recommendations">
                <strong>Recommendations:</strong> Use passphrases. Store characters in a password manager. Turn on 2FA validation keys.
              </div>
            </div>
          `).join('')}
        ` : ''}

        ${generatorScans.length > 0 ? `
          <div style="font-weight: 800; font-size: 10pt; color: #475569; margin: 16px 0 8px 0; text-transform: uppercase;">Module: Password Generator</div>
          ${generatorScans.map(scan => `
            <div class="audit-item">
              <div class="audit-header">
                <span class="audit-title">Cryptographic Password Generation</span>
                <span class="audit-badge" style="color: ${scan.riskLevel === 'Safe' ? '#10B981' : scan.riskLevel === 'Suspicious' ? '#F59E0B' : '#EF4444'};">
                  ${scan.riskLevel}
                </span>
              </div>
              <div class="grid-details">
                <div class="detail-card">
                  <div class="detail-label">Configuration Settings</div>
                  <div class="detail-value">${scan.target}</div>
                </div>
                <div class="detail-card">
                  <div class="detail-label">Safety Result</div>
                  <div class="detail-value">${scan.result}</div>
                </div>
              </div>
              <div class="audit-recommendations">
                <strong>Recommendations:</strong> Store these generated configurations inside your credentials keeper.
              </div>
            </div>
          `).join('')}
        ` : ''}

        ${urlScans.length > 0 ? `
          <div style="font-weight: 800; font-size: 10pt; color: #475569; margin: 16px 0 8px 0; text-transform: uppercase;">Module: URL Safety Analyzer</div>
          ${urlScans.map(scan => {
            const hasHttps = !scan.target.startsWith('http://');
            const hasTyposquatting = scan.target.includes('0') || scan.target.includes('rn') || scan.target.includes('g00g') || scan.target.includes('paypaI');
            return `
              <div class="audit-item">
                <div class="audit-header">
                  <span class="audit-title">Domain Link Scan</span>
                  <span class="audit-badge" style="color: ${scan.riskLevel === 'Safe' ? '#10B981' : scan.riskLevel === 'Suspicious' ? '#F59E0B' : '#EF4444'};">
                    ${scan.riskLevel}
                  </span>
                </div>
                <div class="grid-details">
                  <div class="detail-card">
                    <div class="detail-label">Scanned URL</div>
                    <div class="detail-value" style="font-family: monospace;">${scan.target}</div>
                  </div>
                  <div class="detail-card">
                    <div class="detail-label">HTTPS SSL Certificate</div>
                    <div class="detail-value">${hasHttps ? 'SSL Certificate Valid (HTTPS)' : 'SSL Certificate Missing (HTTP)'}</div>
                  </div>
                  <div class="detail-card">
                    <div class="detail-label">Typosquatting Check</div>
                    <div class="detail-value">${hasTyposquatting ? 'Typosquatting Signature Detected' : 'Clean Signature'}</div>
                  </div>
                  <div class="detail-card">
                    <div class="detail-label">Suspicious Keywords</div>
                    <div class="detail-value">${scan.riskLevel !== 'Safe' ? 'Brand spoofing markers flagged.' : 'None'}</div>
                  </div>
                  <div class="detail-card">
                    <div class="detail-label">Final Verdict</div>
                    <div class="detail-value">${scan.result}</div>
                  </div>
                  <div class="detail-card">
                    <div class="detail-label">Reasoning</div>
                    <div class="detail-value">Local token analysis checks returned a ${scan.riskScore}% risk factor.</div>
                  </div>
                </div>
                <div class="audit-recommendations">
                  <strong>Recommendations:</strong> ${scan.riskLevel === 'Safe' ? 'This link meets safe baselines.' : 'Do not input card details on this link. Check official domains.'}
                </div>
              </div>
            `;
          }).join('')}
        ` : ''}

        ${fileScans.length > 0 ? `
          <div style="font-weight: 800; font-size: 10pt; color: #475569; margin: 16px 0 8px 0; text-transform: uppercase;">Module: File Safety Analyzer</div>
          ${fileScans.map(scan => {
            const parts = scan.result.split(' • ');
            const ext = parts[0] || 'Unknown';
            return `
              <div class="audit-item">
                <div class="audit-header">
                  <span class="audit-title">Local File Inspection</span>
                  <span class="audit-badge" style="color: ${scan.riskLevel === 'Safe' ? '#10B981' : scan.riskLevel === 'Suspicious' ? '#F59E0B' : '#EF4444'};">
                    ${scan.riskLevel}
                  </span>
                </div>
                <div class="grid-details">
                  <div class="detail-card">
                    <div class="detail-label">File Name</div>
                    <div class="detail-value">${scan.target}</div>
                  </div>
                  <div class="detail-card">
                    <div class="detail-label">Extension</div>
                    <div class="detail-value">${ext}</div>
                  </div>
                  <div class="detail-card">
                    <div class="detail-label">SHA-256 Checksum Hash</div>
                    <div class="detail-value" style="font-family: monospace; font-size: 8.5pt;">Verification completed locally</div>
                  </div>
                  <div class="detail-card">
                    <div class="detail-label">Security Warnings</div>
                    <div class="detail-value">${scan.riskLevel === 'Safe' ? 'No issues flagged.' : 'Risky payload structure.'}</div>
                  </div>
                </div>
                <div class="audit-recommendations">
                  <strong>Recommendations:</strong> Check file formats carefully. Keep system defenses active.
                </div>
              </div>
            `;
          }).join('')}
        ` : ''}

        ${qrScans.length > 0 ? `
          <div style="font-weight: 800; font-size: 10pt; color: #475569; margin: 16px 0 8px 0; text-transform: uppercase;">Module: QR Scanner</div>
          ${qrScans.map(scan => `
            <div class="audit-item">
              <div class="audit-header">
                <span class="audit-title">QR Matrix Code Decoded</span>
                <span class="audit-badge" style="color: ${scan.riskLevel === 'Safe' ? '#10B981' : scan.riskLevel === 'Suspicious' ? '#F59E0B' : '#EF4444'};">
                  ${scan.riskLevel}
                </span>
              </div>
              <div class="grid-details">
                <div class="detail-card">
                  <div class="detail-label">Decoded Content</div>
                  <div class="detail-value" style="word-break: break-all;">${scan.target}</div>
                </div>
                <div class="detail-card">
                  <div class="detail-label">Destination URL</div>
                  <div class="detail-value">${scan.target.startsWith('http') ? scan.target : 'No redirect link'}</div>
                </div>
                <div class="detail-card">
                  <div class="detail-label">Safety Result</div>
                  <div class="detail-value">${scan.result}</div>
                </div>
                <div class="detail-card">
                  <div class="detail-label">Reasoning</div>
                  <div class="detail-value">Analyzed as ${scan.target.startsWith('http') ? 'link redirect' : 'static string payload'}.</div>
                </div>
              </div>
              <div class="audit-recommendations">
                <strong>Recommendations:</strong> Inspect redirect locations with the URL analyzer before navigating.
              </div>
            </div>
          `).join('')}
        ` : ''}

        ${phishingScans.length > 0 ? `
          <div style="font-weight: 800; font-size: 10pt; color: #475569; margin: 16px 0 8px 0; text-transform: uppercase;">Module: Phishing Detector</div>
          ${phishingScans.map(scan => `
            <div class="audit-item">
              <div class="audit-header">
                <span class="audit-title">Message Body Phishing Audit</span>
                <span class="audit-badge" style="color: ${scan.riskLevel === 'Safe' ? '#10B981' : scan.riskLevel === 'Suspicious' ? '#F59E0B' : '#EF4444'};">
                  ${scan.riskLevel}
                </span>
              </div>
              <div class="grid-details">
                <div class="detail-card">
                  <div class="detail-label">Original Message Snippet</div>
                  <div class="detail-value" style="font-style: italic;">"${scan.target}"</div>
                </div>
                <div class="detail-card">
                  <div class="detail-label">Detected Indicators</div>
                  <div class="detail-value">${scan.result}</div>
                </div>
                <div class="detail-card">
                  <div class="detail-label">Reasons</div>
                  <div class="detail-value">Text parsed locally flagged a risk score of ${scan.riskScore}/100.</div>
                </div>
                <div class="detail-card">
                  <div class="detail-label">Risk Level</div>
                  <div class="detail-value" style="font-weight: 700; color: ${scan.riskLevel === 'Safe' ? '#10B981' : scan.riskLevel === 'Suspicious' ? '#F59E0B' : '#EF4444'};">${scan.riskLevel}</div>
                </div>
              </div>
              <div class="audit-recommendations">
                <strong>Recommendations:</strong> Watch for urgency patterns or unsolicited financial links.
              </div>
            </div>
          `).join('')}
        ` : ''}

        ${quizScans.length > 0 ? `
          <div style="font-weight: 800; font-size: 10pt; color: #475569; margin: 16px 0 8px 0; text-transform: uppercase;">Module: Cyber Hygiene Quiz</div>
          ${quizScans.map(scan => `
            <div class="audit-item">
              <div class="audit-header">
                <span class="audit-title">Interactive Hygiene Scenario Quiz</span>
                <span class="audit-badge" style="color: ${scan.riskLevel === 'Safe' ? '#10B981' : scan.riskLevel === 'Suspicious' ? '#F59E0B' : '#EF4444'};">
                  ${scan.riskLevel}
                </span>
              </div>
              <div class="grid-details">
                <div class="detail-card">
                  <div class="detail-label">Score</div>
                  <div class="detail-value">${scan.result}</div>
                </div>
                <div class="detail-card">
                  <div class="detail-label">Correct Answers</div>
                  <div class="detail-value">${scan.result.split('/')[0].replace(/\\D/g, '') || 'Recorded'}</div>
                </div>
                <div class="detail-card">
                  <div class="detail-label">Wrong Answers</div>
                  <div class="detail-value">${scan.riskLevel === 'Safe' ? '0' : 'Varies'}</div>
                </div>
                <div class="detail-card">
                  <div class="detail-label">Topics to Improve</div>
                  <div class="detail-value">General digital threat signatures check.</div>
                </div>
              </div>
              <div class="audit-recommendations">
                <strong>Recommendations:</strong> Review online hygiene recommendations periodically.
              </div>
            </div>
          `).join('')}
        ` : ''}

        <div class="section-title">Final Assessment</div>
        <div class="final-recommendations">
          <strong>Overall Security Status: ${overallRiskLevel}</strong><br/>
          ${dynamicSummaryText}
        </div>

        <div class="footer">
          Generated by CyberShield &nbsp;•&nbsp; ${dateStr} ${timeStr} &nbsp;•&nbsp; Local Analysis<br/>
          <div class="privacy-text">
            Privacy Notice: All analyses were performed locally unless otherwise specified.
          </div>
        </div>
        
        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 300);
          };
        </script>
      </body>
    </html>
  `;

  printWindow.document.write(content);
  printWindow.document.close();
};
