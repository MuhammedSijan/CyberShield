import { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastProvider } from './hooks/useToast';
import { SecurityProvider } from './context/SecurityContext';
import { AuthProvider } from './context/AuthContext';
import { AuthGuard } from './components/common/AuthGuard';
import { MainLayout } from './layouts/MainLayout';

// Eagerly loaded entry views
import { Splash } from './pages/Splash';
import { Auth } from './pages/Auth';

// Lazy loaded page components for optimal bundle splitting
const Home = lazy(() => import('./pages/Home').then(m => ({ default: m.Home })));
const Dashboard = lazy(() => import('./pages/Dashboard').then(m => ({ default: m.Dashboard })));
const SecurityHub = lazy(() => import('./pages/SecurityHub').then(m => ({ default: m.SecurityHub })));
const PhishingDetector = lazy(() => import('./pages/PhishingDetector').then(m => ({ default: m.PhishingDetector })));
const UrlAnalyzer = lazy(() => import('./pages/UrlAnalyzer').then(m => ({ default: m.UrlAnalyzer })));
const PasswordChecker = lazy(() => import('./pages/PasswordChecker').then(m => ({ default: m.PasswordChecker })));
const PasswordGenerator = lazy(() => import('./pages/PasswordGenerator').then(m => ({ default: m.PasswordGenerator })));
const FileSafetyAnalyzer = lazy(() => import('./pages/FileSafetyAnalyzer').then(m => ({ default: m.FileSafetyAnalyzer })));
const QrScanner = lazy(() => import('./pages/QrScanner').then(m => ({ default: m.QrScanner })));
const Quiz = lazy(() => import('./pages/Quiz').then(m => ({ default: m.Quiz })));
const About = lazy(() => import('./pages/About').then(m => ({ default: m.About })));
const Contact = lazy(() => import('./pages/Contact').then(m => ({ default: m.Contact })));
const Profile = lazy(() => import('./pages/Profile').then(m => ({ default: m.Profile })));
const Settings = lazy(() => import('./pages/Settings').then(m => ({ default: m.Settings })));
const NotFound = lazy(() => import('./pages/NotFound').then(m => ({ default: m.NotFound })));
const TestFirebase = lazy(() => import('./pages/TestFirebase'));

// Minimal loading indicator during route chunks
const PageLoader = () => (
  <div className="flex-1 flex items-center justify-center min-h-[50vh]">
    <div className="flex flex-col items-center gap-3">
      <div className="h-7 w-7 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Loading module...</span>
    </div>
  </div>
);

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
              <Route 
                path="/test" 
                element={
                  <Suspense fallback={<PageLoader />}>
                    <TestFirebase />
                  </Suspense>
                } 
              />

              {/* Protected app routes - inside main layout */}
              <Route
                path="/*"
                element={
                  <AuthGuard>
                    <MainLayout>
                      <Suspense fallback={<PageLoader />}>
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
                      </Suspense>
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
