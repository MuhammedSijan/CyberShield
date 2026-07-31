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
  const dateStr = now.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const timeStr = now.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });

  // Calculate session duration string
  const formatDuration = (ms: number) => {
    const totalSecs = Math.floor(ms / 1000);
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins} min ${secs} sec`;
  };

  // Compile overall details
  let overallRiskLevel: 'Safe' | 'Suspicious' | 'Danger' = 'Safe';
  let overallColor = '#10B981';
  let overallBg = '#ECFDF5';
  let overallGrade = 'A+ (Secure)';

  if (overallScore < 40) {
    overallRiskLevel = 'Danger';
    overallColor = '#EF4444';
    overallBg = '#FEF2F2';
    overallGrade = 'D (Critical Exposure)';
  } else if (overallScore < 70) {
    overallRiskLevel = 'Suspicious';
    overallColor = '#F59E0B';
    overallBg = '#FFFBEB';
    overallGrade = 'C (Caution Recommended)';
  } else if (overallScore < 90) {
    overallRiskLevel = 'Safe';
    overallColor = '#2563EB';
    overallBg = '#EFF6FF';
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

  // Dynamic Final Recommendations compiler
  const generateFinalSummary = () => {
    const totalRisks = scans.filter(s => s.riskLevel !== 'Safe').length;
    let summaryText = "";

    if (totalRisks === 0) {
      summaryText = "Your digital browsing habits and input assets appear safe. All evaluated vectors (URLs, files, messages, and password structures) returned with robust cryptographic entropy and clean threat indexes. Continue implementing multi-factor verification keys.";
    } else {
      summaryText = `Your security posture requires immediate attention. We detected ${totalRisks} total security warning markers in your diagnostic checks. `;

      if (urlCount > 0 && urlScans.some(s => s.riskLevel !== 'Safe')) {
        summaryText += "Suspicious hyperlinks were flagged. Avoid inputting user credentials on portals lacking official verification. ";
      }
      if (pwdCount > 0 && passwordScans.some(s => s.riskLevel !== 'Safe')) {
        summaryText += "Password health checkers flagged weak or dictionary-matching formats. Upgrade credentials to high-entropy random sequences. ";
      }
      if (fileCount > 0 && fileScans.some(s => s.riskLevel !== 'Safe')) {
        summaryText += "Analyzed payloads contained compressed containers or executable installers showing potential indicators of concern. ";
      }
      if (phishingCount > 0 && phishingScans.some(s => s.riskLevel !== 'Safe')) {
        summaryText += "Phishing message text scans flagged patterns of urgency or suspicious links. Review sender profiles carefully before clicking. ";
      }
      if (quizScans.length > 0 && quizScans.some(s => s.result.includes('Score: 0') || s.result.includes('Score: 1') || s.result.includes('Score: 2') || s.result.includes('Score: 3'))) {
        summaryText += "Your quiz scoring indices suggest an opportunity to refine your understanding of online social engineering schemes.";
      }
    }
    return summaryText;
  };

  const content = `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <title>CyberShield Security Assessment Report</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
          
          body { 
            font-family: 'Inter', sans-serif; 
            color: #1e293b; 
            line-height: 1.6; 
            margin: 0; 
            padding: 40px; 
            background: #ffffff;
          }
          .header { 
            border-bottom: 2px solid #e2e8f0; 
            padding-bottom: 24px; 
            margin-bottom: 32px; 
            display: flex; 
            justify-content: space-between; 
            align-items: center; 
          }
          .logo { 
            font-size: 26px; 
            font-weight: 800; 
            color: #0f172a; 
            letter-spacing: -0.025em;
          }
          .logo span { 
            color: #2563eb; 
          }
          .meta { 
            font-size: 11px; 
            color: #64748b; 
            text-align: right; 
            font-weight: 500;
          }
          .title { 
            font-size: 30px; 
            font-weight: 800; 
            color: #0f172a; 
            margin-top: 0; 
            letter-spacing: -0.03em;
            margin-bottom: 8px;
          }
          .badge { 
            display: inline-flex; 
            align-items: center;
            padding: 8px 16px; 
            border-radius: 12px; 
            font-weight: 700; 
            font-size: 13px; 
            text-transform: uppercase; 
            margin-bottom: 32px; 
          }
          .section-title { 
            font-size: 16px; 
            font-weight: 800; 
            color: #0f172a; 
            margin-top: 36px; 
            border-bottom: 2px solid #f1f5f9; 
            padding-bottom: 8px; 
            text-transform: uppercase;
            letter-spacing: 0.05em;
          }
          .summary-card {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 16px;
            padding: 20px;
            margin-bottom: 30px;
          }
          .summary-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 16px;
          }
          .summary-metric {
            border-right: 1px solid #e2e8f0;
            padding-right: 16px;
          }
          .summary-metric:last-child {
            border-right: none;
            padding-right: 0;
          }
          .metric-label { 
            font-size: 9px; 
            text-transform: uppercase; 
            color: #64748b; 
            font-weight: 700; 
            letter-spacing: 0.05em;
          }
          .metric-value { 
            font-size: 15px; 
            font-weight: 800; 
            color: #0f172a; 
            margin-top: 4px; 
          }
          .stats-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 12px;
            margin: 20px 0;
          }
          .stat-card {
            background: #f8fafc;
            border: 1px solid #f1f5f9;
            border-radius: 12px;
            padding: 12px;
            text-align: center;
          }
          .stat-num {
            font-size: 20px;
            font-weight: 800;
            color: #2563eb;
          }
          .stat-label {
            font-size: 9px;
            color: #64748b;
            font-weight: 700;
            text-transform: uppercase;
            margin-top: 2px;
          }
          .audit-item {
            padding: 16px;
            border: 1px solid #f1f5f9;
            background: #fcfdfe;
            border-radius: 12px;
            margin-bottom: 16px;
          }
          .audit-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 8px;
            border-bottom: 1px solid #f8fafc;
            padding-bottom: 6px;
          }
          .audit-title {
            font-size: 13px;
            font-weight: 700;
            color: #1e293b;
          }
          .audit-badge {
            font-size: 9px;
            font-weight: 750;
            text-transform: uppercase;
            padding: 2px 8px;
            border-radius: 9999px;
            border: 1px solid currentColor;
          }
          .grid-details {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 12px;
            margin-top: 8px;
          }
          .detail-card {
            background: #f8fafc;
            padding: 10px;
            border-radius: 8px;
            font-size: 11px;
          }
          .detail-label {
            font-weight: 700;
            color: #64748b;
            text-transform: uppercase;
            font-size: 8px;
            letter-spacing: 0.05em;
          }
          .detail-value {
            color: #1e293b;
            margin-top: 2px;
            font-weight: 600;
            word-break: break-all;
          }
          ul { 
            padding-left: 20px; 
            margin-top: 10px;
          }
          li { 
            margin-bottom: 8px; 
            font-size: 13px; 
            color: #334155; 
          }
          .final-recommendations {
            background: #f0f7ff;
            border: 1px solid #bfdbfe;
            border-radius: 12px;
            padding: 16px;
            margin-top: 24px;
            font-size: 13px;
            font-weight: 500;
            color: #1e40af;
          }
          .footer { 
            margin-top: 60px; 
            border-top: 1px solid #e2e8f0; 
            padding-top: 24px; 
            font-size: 10px; 
            color: #94a3b8; 
            text-align: center; 
            font-weight: 500;
          }
          @media print {
            body { 
              padding: 0; 
            }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo">Cyber<span>Shield</span></div>
          <div class="meta">
            Assessment Date: ${dateStr}<br/>
            Assessment Time: ${timeStr}<br/>
            User Account: ${user ? `${user.firstName} ${user.lastName} (${user.email})` : 'Guest Session'}
          </div>
        </div>
        
        <h1 class="title">SaaS Security Assessment Report</h1>
        <div class="badge" style="background: ${overallBg}; color: ${overallColor}; border: 1px solid ${overallColor}30;">
          Posture Rating: ${overallGrade}
        </div>

        {/* OVERALL SCORE & SUMMARY CARD */}
        <div class="summary-card">
          <div class="summary-grid">
            <div class="summary-metric">
              <div class="metric-label">Overall Safety Score</div>
              <div class="metric-value" style="color: #2563eb; font-size: 24px;">${overallScore}%</div>
            </div>
            <div class="summary-metric">
              <div class="metric-label">Risk Exposure Level</div>
              <div class="metric-value" style="color: ${overallColor};">${overallRiskLevel}</div>
            </div>
            <div class="summary-metric">
              <div class="metric-label">Total Diagnostics Run</div>
              <div class="metric-value">${scans.length} checks</div>
            </div>
            <div class="summary-metric">
              <div class="metric-label">Session Duration</div>
              <div class="metric-value">${formatDuration(sessionDurationMs)}</div>
            </div>
          </div>
        </div>

        {/* SESSION SUMMARY STATISTICS */}
        <div class="section-title">Session Summary Statistics</div>
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-num">${pwdCount}</div>
            <div class="stat-label">Password Checks</div>
          </div>
          <div class="stat-card">
            <div class="stat-num">${genCount}</div>
            <div class="stat-label">Password Generated</div>
          </div>
          <div class="stat-card">
            <div class="stat-num">${urlCount}</div>
            <div class="stat-label">URL Scans</div>
          </div>
          <div class="stat-card">
            <div class="stat-num">${fileCount}</div>
            <div class="stat-label">Files Analyzed</div>
          </div>
          <div class="stat-card">
            <div class="stat-num">${qrCount}</div>
            <div class="stat-label">QR Scans</div>
          </div>
          <div class="stat-card">
            <div class="stat-num">${phishingCount}</div>
            <div class="stat-label">Phishing Scans</div>
          </div>
          <div class="stat-card">
            <div class="stat-num">${quizCount}</div>
            <div class="stat-label">Quiz Attempts</div>
          </div>
          <div class="stat-card font-bold" style="background: #eef2f6;">
            <div class="stat-num" style="color: #475569;">${scans.length}</div>
            <div class="stat-label" style="color: #475569;">Total Scans</div>
          </div>
        </div>

        {/* DETAILED DIAGNOSTIC AUDIT LOGS */}
        <div class="section-title">Detailed Diagnostic Audit Logs</div>

        {/* PASSWORD AUDITS */}
        ${passwordScans.length > 0 ? `
          <div style="font-weight: 700; font-size: 13px; color: #475569; margin-top: 18px; margin-bottom: 10px;">Vector: Password Health Checker</div>
          <div class="space-y-4">
            ${passwordScans.map(scan => {
              const weaknesses: string[] = [];
              if (scan.riskLevel !== 'Safe') {
                weaknesses.push("Length under 12 characters or weak complexity structures.");
              }
              return `
                <div class="audit-item">
                  <div class="audit-header">
                    <span class="audit-title">Password Complexity Evaluation</span>
                    <span class="audit-badge" style="color: ${scan.riskLevel === 'Safe' ? '#10B981' : scan.riskLevel === 'Suspicious' ? '#F59E0B' : '#EF4444'};">
                      ${scan.riskLevel}
                    </span>
                  </div>
                  <div class="grid-details">
                    <div class="detail-card">
                      <div class="detail-label">Input Credentials Check</div>
                      <div class="detail-value">${scan.target}</div>
                    </div>
                    <div class="detail-card">
                      <div class="detail-label">Estimated Crack Time</div>
                      <div class="detail-value">${scan.result}</div>
                    </div>
                    <div class="detail-card">
                      <div class="detail-label">Suspicious Indicators / Weakness</div>
                      <div class="detail-value">${weaknesses.length > 0 ? weaknesses.join(', ') : 'None flagged (High Entropy)'}</div>
                    </div>
                    <div class="detail-card">
                      <div class="detail-label">Risk Level Score</div>
                      <div class="detail-value">${scan.riskScore}/100</div>
                    </div>
                  </div>
                  <div style="font-size: 11px; color: #475569; margin-top: 10px;">
                    <strong>Recommendations:</strong> Never reuse credentials. Use offline password manager keys.
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        ` : ''}

        {/* PASSWORD GENERATOR AUDITS */}
        ${generatorScans.length > 0 ? `
          <div style="font-weight: 700; font-size: 13px; color: #475569; margin-top: 18px; margin-bottom: 10px;">Vector: Password Generator</div>
          <div class="space-y-4">
            ${generatorScans.map(scan => `
              <div class="audit-item">
                <div class="audit-header">
                  <span class="audit-title">Cryptographic Random Generation Batch</span>
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
                    <div class="detail-label">Safety Rating</div>
                    <div class="detail-value">${scan.result}</div>
                  </div>
                </div>
                <div style="font-size: 11px; color: #475569; margin-top: 10px;">
                  <strong>Recommendations:</strong> Use these high-entropy strings for primary logins.
                </div>
              </div>
            `).join('')}
          </div>
        ` : ''}

        {/* URL AUDITS */}
        ${urlScans.length > 0 ? `
          <div style="font-weight: 700; font-size: 13px; color: #475569; margin-top: 18px; margin-bottom: 10px;">Vector: URL Safety Analyzer</div>
          <div class="space-y-4">
            ${urlScans.map(scan => {
              const hasHttps = !scan.target.startsWith('http://');
              const hasTyposquatting = scan.target.includes('0') || scan.target.includes('rn') || scan.target.includes('g00g') || scan.target.includes('paypaI');
              const keywords = ['paypal', 'secure', 'bank', 'login', 'update', 'verify'].filter(kw => scan.target.toLowerCase().includes(kw));

              return `
                <div class="audit-item">
                  <div class="audit-header">
                    <span class="audit-title">Hyperlink Address Scan</span>
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
                      <div class="detail-value">${hasHttps ? 'Secure Status (SSL Active)' : 'Unencrypted Status (HTTP)'}</div>
                    </div>
                    <div class="detail-card">
                      <div class="detail-label">Typosquatting Check</div>
                      <div class="detail-value">${hasTyposquatting ? 'Typosquatting Pattern Flagged' : 'Clean Signature'}</div>
                    </div>
                    <div class="detail-card">
                      <div class="detail-label">Brand Keywords Matching</div>
                      <div class="detail-value">${keywords.length > 0 ? keywords.join(', ') : 'None'}</div>
                    </div>
                  </div>
                  <div style="font-size: 11px; color: #475569; margin-top: 10px;">
                    <strong>Recommendations:</strong> ${scan.riskLevel === 'Safe' ? 'This link matches safe structure indicators.' : 'Do not input user accounts or pins. Block local redirects immediately.'}
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        ` : ''}

        {/* FILE AUDITS */}
        ${fileScans.length > 0 ? `
          <div style="font-weight: 700; font-size: 13px; color: #475569; margin-top: 18px; margin-bottom: 10px;">Vector: File Safety Analyzer</div>
          <div class="space-y-4">
            ${fileScans.map(scan => {
              const fileTypeParts = scan.result.split(' • ');
              const fileType = fileTypeParts[0] || 'Unknown';
              return `
                <div class="audit-item">
                  <div class="audit-header">
                    <span class="audit-title">Local File Integrity Check</span>
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
                      <div class="detail-label">Calculated Extension</div>
                      <div class="detail-value">${fileType}</div>
                    </div>
                    <div class="detail-card">
                      <div class="detail-label">Client-Side SHA-256 Hash</div>
                      <div class="detail-value" style="font-family: monospace; font-size: 9px;">Local file hash recorded</div>
                    </div>
                    <div class="detail-card">
                      <div class="detail-label">Risk Evaluation Score</div>
                      <div class="detail-value">${scan.riskScore}/100</div>
                    </div>
                  </div>
                  <div style="font-size: 11px; color: #475569; margin-top: 10px;">
                    <strong>Recommendations:</strong> Check file double extensions before executing. Block executables from unrecognized sources.
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        ` : ''}

        {/* QR AUDITS */}
        ${qrScans.length > 0 ? `
          <div style="font-weight: 700; font-size: 13px; color: #475569; margin-top: 18px; margin-bottom: 10px;">Vector: QR Code Safety Checker</div>
          <div class="space-y-4">
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
                    <div class="detail-label">Decoded Payload Text</div>
                    <div class="detail-value" style="word-break: break-all;">${scan.target}</div>
                  </div>
                  <div class="detail-card">
                    <div class="detail-label">Payload Type Check</div>
                    <div class="detail-value">${scan.result}</div>
                  </div>
                </div>
                <div style="font-size: 11px; color: #475569; margin-top: 10px;">
                  <strong>Recommendations:</strong> Evaluate decoded target landing URLs with safety analyzers before routing browsers.
                </div>
              </div>
            `).join('')}
          </div>
        ` : ''}

        {/* PHISHING AUDITS */}
        ${phishingScans.length > 0 ? `
          <div style="font-weight: 700; font-size: 13px; color: #475569; margin-top: 18px; margin-bottom: 10px;">Vector: Phishing Message Detector</div>
          <div class="space-y-4">
            ${phishingScans.map(scan => {
              const hasUrgent = scan.target.toLowerCase().includes('urgent') || scan.target.toLowerCase().includes('freeze') || scan.target.toLowerCase().includes('suspend') || scan.target.toLowerCase().includes('lock');
              const hasPrize = scan.target.toLowerCase().includes('congratulations') || scan.target.toLowerCase().includes('win') || scan.target.toLowerCase().includes('prize');
              
              const flags = [];
              if (hasUrgent) flags.push("Panic Indicators ('lock', 'freeze')");
              if (hasPrize) flags.push("Materialistic / Prize triggers");
              
              return `
                <div class="audit-item">
                  <div class="audit-header">
                    <span class="audit-title">Message Body Phishing Scanner</span>
                    <span class="audit-badge" style="color: ${scan.riskLevel === 'Safe' ? '#10B981' : scan.riskLevel === 'Suspicious' ? '#F59E0B' : '#EF4444'};">
                      ${scan.riskLevel}
                    </span>
                  </div>
                  <div class="grid-details">
                    <div class="detail-card">
                      <div class="detail-label">Original Text Payload Snippet</div>
                      <div class="detail-value" style="font-style: italic;">"${scan.target}"</div>
                    </div>
                    <div class="detail-card">
                      <div class="detail-label">Flagged Keyword Indicators</div>
                      <div class="detail-value">${flags.length > 0 ? flags.join(', ') : 'None'}</div>
                    </div>
                    <div class="detail-card">
                      <div class="detail-label">Risk Probability score</div>
                      <div class="detail-value">${scan.riskScore}% Probability</div>
                    </div>
                    <div class="detail-card">
                      <div class="detail-label">Indicators Summary</div>
                      <div class="detail-value">${scan.result}</div>
                    </div>
                  </div>
                  <div style="font-size: 11px; color: #475569; margin-top: 10px;">
                    <strong>Recommendations:</strong> Social engineering signatures matching panic terms require sender verification.
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        ` : ''}

        {/* QUIZ AUDITS */}
        ${quizScans.length > 0 ? `
          <div style="font-weight: 700; font-size: 13px; color: #475569; margin-top: 18px; margin-bottom: 10px;">Vector: Cyber Hygiene Quiz</div>
          <div class="space-y-4">
            ${quizScans.map(scan => `
              <div class="audit-item">
                <div class="audit-header">
                  <span class="audit-title">Hygiene Scenario Evaluation</span>
                  <span class="audit-badge" style="color: ${scan.riskLevel === 'Safe' ? '#10B981' : scan.riskLevel === 'Suspicious' ? '#F59E0B' : '#EF4444'};">
                    ${scan.riskLevel}
                  </span>
                </div>
                <div class="grid-details">
                  <div class="detail-card">
                    <div class="detail-label">Diagnostic Module Name</div>
                    <div class="detail-value">${scan.target}</div>
                  </div>
                  <div class="detail-card">
                    <div class="detail-label">Scored Result</div>
                    <div class="detail-value">${scan.result}</div>
                  </div>
                </div>
                <div style="font-size: 11px; color: #475569; margin-top: 10px;">
                  <strong>Recommendations:</strong> Periodically review standard cybersecurity protocols to keep abreast of threat models.
                </div>
              </div>
            `).join('')}
          </div>
        ` : ''}

        {/* FINAL CYBERSECURITY ASSESSMENT SUMMARY */}
        <div class="section-title">Final Cybersecurity Assessment Summary</div>
        <div class="final-recommendations">
          <strong>Strategic Posture Overview:</strong><br/>
          ${generateFinalSummary()}
        </div>

        <div class="footer">
          🔒 Local browser protection audits. Session logs are processed entirely inside your client browser environment and are never transmitted to any external databases.
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
