export interface QuizQuestion {
  id: number;
  question: string;
  scenario: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export const quizQuestions: QuizQuestion[] = [
  {
    id: 1,
    question: "You receive an email from 'support@paypaI-security.com' stating your account is locked.",
    scenario: "The email has a big red button saying 'Verify Identity Now' and warns that your funds will be frozen within 24 hours if you don't comply. What is the safest course of action?",
    options: [
      "Click the button and log in to check your account status.",
      "Reply to the email asking for confirmation of the lock.",
      "Ignore the email, navigate to paypal.com in a new tab, and check your status directly.",
      "Forward the email to all your friends to warn them about the freeze."
    ],
    correctAnswer: 2,
    explanation: "This is a phishing attempt. The domain uses a capital 'I' (paypaI) instead of a lowercase 'l' (paypal) to trick you (typosquatting). Official service accounts will never ask you to click a direct link to resolve urgent freezes, and they will never use threat domains. Always log in by typing the official URL manually."
  },
  {
    id: 2,
    question: "Which of the following describes the most secure way to handle passwords?",
    scenario: "You have 30 different online accounts for work, banking, and shopping. How should you store and configure your passwords?",
    options: [
      "Use one very strong, complex password across all accounts so you don't forget it.",
      "Write passwords in a physical notebook kept next to your desk.",
      "Use a reputable password manager that generates and stores unique passwords for each site.",
      "Save your passwords in an unencrypted text file on your desktop labeled 'Important'."
    ],
    correctAnswer: 2,
    explanation: "Password managers generate long, random, and unique passwords for every account. Since they fill them automatically, they also protect against phishing because they won't autofill your credentials on spoofed domains (e.g. g00gle.com). Reusing passwords is high risk: if one site gets breached, attackers will test your password on all other popular platforms (credential stuffing)."
  },
  {
    id: 3,
    question: "You are working at a local coffee shop and need to log into your online banking portal.",
    scenario: "There is an open public Wi-Fi called 'CoffeeShop_Free_Wifi' which doesn't require a password. What should you do before entering your credentials?",
    options: [
      "Connect and log in immediately; public Wi-Fi is safe as long as the banking site uses HTTPS.",
      "Turn on a Virtual Private Network (VPN) before logging in, or use your phone's cellular hotspot.",
      "Ask a stranger nearby if the Wi-Fi connection has been working fine for them.",
      "Wait until the coffee shop is less crowded so fewer people can intercept the signal."
    ],
    correctAnswer: 1,
    explanation: "Public Wi-Fi networks are vulnerable to Man-in-the-Middle (MitM) attacks, where attackers capture unencrypted data or redirect requests. A VPN creates an encrypted tunnel for your data, shielding it from local interceptors. Alternatively, using your mobile hotspot is significantly safer than connecting to public open routers."
  },
  {
    id: 4,
    question: "You find a brand new USB flash drive in the office parking lot.",
    scenario: "The USB has a sticker on it that says 'Q4 Executive Salaries'. What should you do with it?",
    options: [
      "Plug it into your computer to see who it belongs to so you can return it.",
      "Plug it into your personal computer at home instead of your work computer to keep the company safe.",
      "Take it to your internal IT or Security team immediately without plugging it in anywhere.",
      "Format the drive immediately so you can reuse it as a free storage device."
    ],
    correctAnswer: 2,
    explanation: "This is a classic social engineering tactic called 'baiting'. Cybercriminals leave malicious USB drives in public locations hoping curiosity will lead someone to plug them in. Once inserted, these drives can run automated scripts (like rubber ducky payloads) that install ransomware or keyloggers in seconds without your consent."
  },
  {
    id: 5,
    question: "What does Multi-Factor Authentication (MFA) or Two-Factor Authentication (2FA) do?",
    scenario: "You are setting up a new security parameter on your email account. How does 2FA provide protection?",
    options: [
      "It requires you to type your password twice to make sure there are no typos.",
      "It blocks anyone from logging in if they are using a mobile phone.",
      "It adds a secondary layer of verification (like an authenticator app code or security key) that makes passwords alone insufficient for access.",
      "It automatically reports password attempts to local law enforcement."
    ],
    correctAnswer: 2,
    explanation: "2FA ensures that even if an attacker steals your password (via phishing or a database breach), they still cannot access your account because they lack the physical second factor (like your phone or authentication key). Avoid SMS-based 2FA if possible, as it is vulnerable to SIM-swapping; use authenticator apps (TOTP) or hardware keys."
  }
];
