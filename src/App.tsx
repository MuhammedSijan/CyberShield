import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastProvider } from './hooks/useToast';
import { SecurityProvider } from './context/SecurityContext';
import { AuthProvider } from './context/AuthContext';
import { AuthGuard } from './components/common/AuthGuard';
import { MainLayout } from './layouts/MainLayout';
import { Splash } from './pages/Splash';
import { Auth } from './pages/Auth';
import { Home } from './pages/Home';
import { Dashboard } from './pages/Dashboard';
import { SecurityHub } from './pages/SecurityHub';
import { PhishingDetector } from './pages/PhishingDetector';
import { UrlAnalyzer } from './pages/UrlAnalyzer';
import { PasswordChecker } from './pages/PasswordChecker';
import { PasswordGenerator } from './pages/PasswordGenerator';
import { FileSafetyAnalyzer } from './pages/FileSafetyAnalyzer';
import { QrScanner } from './pages/QrScanner';
import { Quiz } from './pages/Quiz';
import { About } from './pages/About';
import { Contact } from './pages/Contact';
import { Profile } from './pages/Profile';
import { Settings } from './pages/Settings';
import { NotFound } from './pages/NotFound';
import TestFirebase from "./pages/TestFirebase";

function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <SecurityProvider>
          <Router>
            <Routes>
              {/* Splash and Auth routes - outside main layout */}
              <Route path="/" element={<Splash />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/test" element={<TestFirebase />} />

              {/* Protected app routes - inside main layout */}
              <Route
                path="/*"
                element={
                  <AuthGuard>
                    <MainLayout>
                      <Routes>
                        <Route path="/home" element={<Home />} />
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/hub" element={<SecurityHub />} />
                        <Route path="/phishing-detector" element={<PhishingDetector />} />
                        <Route path="/url-analyzer" element={<UrlAnalyzer />} />
                        <Route path="/password-checker" element={<PasswordChecker />} />
                        <Route path="/password-generator" element={<PasswordGenerator />} />
                        <Route path="/file-analyzer" element={<FileSafetyAnalyzer />} />
                        <Route path="/qr-scanner" element={<QrScanner />} />
                        <Route path="/quiz" element={<Quiz />} />
                        <Route path="/about" element={<About />} />
                        <Route path="/contact" element={<Contact />} />
                        <Route path="/profile" element={<Profile />} />
                        <Route path="/settings" element={<Settings />} />
                        <Route path="*" element={<NotFound />} />
                      </Routes>
                    </MainLayout>
                  </AuthGuard>
                }
              />
            </Routes>
          </Router>
        </SecurityProvider>
      </AuthProvider>
    </ToastProvider>
  );
}

export default App;
