export interface PhishingMockSample {
  id: string;
  label: string;
  source: string; // WhatsApp, SMS, Email
  text: string;
  evaluation: {
    riskScore: number; // 0 to 100
    riskLevel: 'Safe' | 'Suspicious' | 'Danger';
    indicators: string[];
    recommendations: string[];
    explanation: string;
  };
}

export interface UrlMockSample {
  url: string;
  evaluation: {
    riskScore: number;
    riskLevel: 'Safe' | 'Suspicious' | 'Danger';
    hasHttps: boolean;
    domainLength: number;
    suspiciousKeywords: string[];
    isIpAddress: boolean;
    typosquattingDetected: boolean;
    subdomainCount: number;
    explanation: string;
  };
}

export const phishingSamples: PhishingMockSample[] = [
  {
    id: 'p1',
    label: 'Netflix Payment Decline (SMS)',
    source: 'SMS',
    text: "NETFLIX: Your subscription payment failed. To avoid immediate suspension of service, update your billing details here: http://netflix-billing-resolve.info/update",
    evaluation: {
      riskScore: 92,
      riskLevel: 'Danger',
      indicators: [
        "Urgent or threatening language ('immediate suspension')",
        "Suspicious non-official URL domain ('netflix-billing-resolve.info')",
        "Sender masking as a corporate service via standard mobile gateway"
      ],
      recommendations: [
        "Do not click the link or provide any login credentials.",
        "Delete the message and block the sender.",
        "Go directly to netflix.com in your web browser to check your account status."
      ],
      explanation: "This is a classic credential harvesting scam. Netflix will never text you billing links from non-official domains. They use secure billing gateways directly managed on Netflix.com."
    }
  },
  {
    id: 'p2',
    label: 'Chase Bank Suspicious Activity (Email)',
    source: 'Email',
    text: "From: alerts-security@chase-banking-support.com\nSubject: URGENT: Fraud Alert on Account X-8932\n\nDear Chase customer,\n\nWe detected a login attempt from an unknown device in Moscow, Russia. If this was not you, please secure your account immediately by verifying your details: https://chase.online-security-update.com/signin\n\nFailure to verify within 12 hours will result in permanent account locking.",
    evaluation: {
      riskScore: 98,
      riskLevel: 'Danger',
      indicators: [
        "Incorrect sender domain ('chase-banking-support.com' instead of 'chase.com')",
        "Fake threat warnings ('login attempt from Moscow') to induce panic",
        "Short deadlines ('12 hours')",
        "Suspicious external sign-in URL"
      ],
      recommendations: [
        "Do not click the link or reply to the email.",
        "Forward the email to abuse@chase.com to report the attack.",
        "Check your Chase App or sign in directly to Chase.com to verify activity logs."
      ],
      explanation: "Chase and other retail banks will never send security alerts from domain variations. They communicate through official Chase.com alerts or in-app secured mail boxes."
    }
  },
  {
    id: 'p3',
    label: 'WhatsApp Prize Draw (WhatsApp)',
    source: 'WhatsApp',
    text: "CONGRATULATIONS! 🎉 You have been selected as the winner of the Coca-Cola 125th Anniversary Lucky Draw! You won a brand new iPhone 15 Pro and $5,000 cash! Click this link to register and claim your prize: http://coca-cola-rewards2026.online/claim. Share this message with 5 group chats to speed up delivery!",
    evaluation: {
      riskScore: 88,
      riskLevel: 'Suspicious',
      indicators: [
        "Unbelievable offers ('free iPhone 15 Pro and cash')",
        "Requests to forward to other chats (viral distribution mechanism)",
        "Insecure HTTP link on a newly registered generic domain"
      ],
      recommendations: [
        "Do not share this link with anyone else; doing so spreads the scam.",
        "Block the sender on WhatsApp.",
        "Remember that real companies do not run lottery distributions over WhatsApp chat shares."
      ],
      explanation: "This is a referral-based advertising scam or malware distribution vector. The goal is to collect personal information under the guise of shipping fees, or to infect devices with spyware."
    }
  },
  {
    id: 'p4',
    label: 'Standard Work Email (Safe)',
    source: 'Email',
    text: "From: manager.jennifer@company.com\nSubject: Notes for Monday's Sync Meeting\n\nHi team,\n\nI've uploaded the notes for Monday morning's sync to our team Google Drive folder. Please review them before the call. Let me know if you want to add any items to the agenda.\n\nBest,\nJennifer",
    evaluation: {
      riskScore: 5,
      riskLevel: 'Safe',
      indicators: [
        "Sender address matches expected internal company domain",
        "No urgent deadlines or panic triggers",
        "No direct high-risk inputs requested"
      ],
      recommendations: [
        "Normal email message. Safe to read.",
        "Verify document access in your company-configured Drive account directly if you suspect any change in Jennifer's tone."
      ],
      explanation: "This email exhibits typical business communication style, does not create psychological panic or greed triggers, and links to official standard shared locations."
    }
  }
];

export const urlSamples: Record<string, UrlMockSample> = {
  'google.com': {
    url: 'google.com',
    evaluation: {
      riskScore: 0,
      riskLevel: 'Safe',
      hasHttps: true,
      domainLength: 10,
      suspiciousKeywords: [],
      isIpAddress: false,
      typosquattingDetected: false,
      subdomainCount: 1,
      explanation: "This is a well-established, highly verified domain. Fully encrypted and authenticated."
    }
  },
  'http://secure-paypal-login-update.com': {
    url: 'http://secure-paypal-login-update.com',
    evaluation: {
      riskScore: 89,
      riskLevel: 'Danger',
      hasHttps: false,
      domainLength: 32,
      suspiciousKeywords: ['paypal', 'login', 'secure', 'update'],
      isIpAddress: false,
      typosquattingDetected: true,
      subdomainCount: 0,
      explanation: "This domain contains multiple high-risk brand names ('paypal') and security action terms. It does not use secure HTTPS encryption, representing a critical security threat."
    }
  },
  'https://g00gle-security-alert.net/auth': {
    url: 'https://g00gle-security-alert.net/auth',
    evaluation: {
      riskScore: 94,
      riskLevel: 'Danger',
      hasHttps: true,
      domainLength: 30,
      suspiciousKeywords: ['security', 'alert', 'auth'],
      isIpAddress: false,
      typosquattingDetected: true,
      subdomainCount: 0,
      explanation: "Typosquatting detected (g00gle instead of google). Attackers replace letters with numbers (e.g. '0' for 'o') to trick eyes. The domain redirects to an unauthorized server despite having an HTTPS certificate."
    }
  },
  'http://192.168.1.154/login.php': {
    url: 'http://192.168.1.154/login.php',
    evaluation: {
      riskScore: 75,
      riskLevel: 'Suspicious',
      hasHttps: false,
      domainLength: 13,
      suspiciousKeywords: ['login'],
      isIpAddress: true,
      typosquattingDetected: false,
      subdomainCount: 0,
      explanation: "IP addresses are highly suspicious for public websites, as legitimate companies use DNS domains. This suggests a local phishing page or raw router exploit."
    }
  },
  'https://mail.sub.dev.support.microsoft.updates-security-system.com/status': {
    url: 'https://mail.sub.dev.support.microsoft.updates-security-system.com/status',
    evaluation: {
      riskScore: 85,
      riskLevel: 'Danger',
      hasHttps: true,
      domainLength: 72,
      suspiciousKeywords: ['support', 'microsoft', 'updates', 'security', 'system'],
      isIpAddress: false,
      typosquattingDetected: true,
      subdomainCount: 6,
      explanation: "Extremely long domain with too many subdomains (6) designed to confuse users. The root domain is actually 'updates-security-system.com', NOT 'microsoft.com'. This is a subdomain spoofing technique."
    }
  }
};
