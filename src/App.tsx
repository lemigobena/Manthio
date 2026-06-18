import React, { useState } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { XPProvider } from './context/XPContext';
import { AppLayout } from './components/layout/AppLayout';
import { ModalProvider, useModal } from './context/ModalContext';
import ModalManager from './components/modal/ModalManager';
// import { HelpCenter } from './features/info/HelpCenter';
// import { PrivacyPolicy } from './features/info/PrivacyPolicy';
// import { TermsOfUse } from './features/info/TermsOfUse';
// import { CookieSettings } from './features/info/CookieSettings';
// import { Imprint } from './features/info/Imprint';

// Page Views
import { Dashboard } from './features/dashboard/Dashboard';
import { Catalog } from './features/catalog/Catalog';
import { CourseDetail } from './features/course-detail/CourseDetail';
import { LearningPath } from './features/learning-path/LearningPath';
import { ContentPlayer } from './features/content-player/ContentPlayer';
import { AITutorPage } from './features/ai-tutor/AITutorPage';
import { Analytics } from './features/analytics/Analytics';
import { Resources } from './features/resources/Resources';
import { Community } from './features/community/Community';
import { Settings } from './features/settings/Settings';
import { Onboarding } from './features/onboarding/Onboarding';
import { SignIn } from './features/auth/SignIn';
import { SignUp } from './features/auth/SignUp';
import { AuthLayout } from './features/auth/AuthLayout';

const MainApp: React.FC = () => {
  const { isAuthenticated, isOnboardingCompleted } = useAuth();
  const [currentPage, setCurrentPage] = useState<string>(() => {
    if (!isAuthenticated) return 'signin';
    return isOnboardingCompleted ? 'dashboard' : 'onboarding';
  });

  const [page, tab] = currentPage.split(':');

  const renderPage = () => {
    switch (page) {
      case 'signin':
        return <SignIn onNavigate={setCurrentPage} />;
      case 'signup':
        return <SignUp onNavigate={setCurrentPage} />;
      case 'onboarding':
        return <Onboarding onNavigate={setCurrentPage} />;
      case 'dashboard':
        return <Dashboard onNavigate={setCurrentPage} />;
      case 'catalog':
        return <Catalog onNavigate={setCurrentPage} />;
      case 'course-detail':
        return <CourseDetail onNavigate={setCurrentPage} />;
      case 'learning-path':
        return <LearningPath onNavigate={setCurrentPage} />;
      case 'content-player':
        return <ContentPlayer onNavigate={setCurrentPage} />;
      case 'ai-tutor':
        return <AITutorPage onNavigate={setCurrentPage} />;
      case 'analytics':
        return <Analytics onNavigate={setCurrentPage} />;
      case 'resources':
        return <Resources onNavigate={setCurrentPage} />;
      case 'community':
        return <Community onNavigate={setCurrentPage} />;
      case 'settings':
        return <Settings initialTab={tab as 'profile' | 'account' | 'billing' | 'preferences'} />;
      // case 'help-center':
      //   return <HelpCenter onNavigate={setCurrentPage} />;
      // case 'privacy':
      //   return <PrivacyPolicy onNavigate={setCurrentPage} />;
      // case 'terms':
      //   return <TermsOfUse onNavigate={setCurrentPage} />;
      // case 'cookies':
      //   return <CookieSettings onNavigate={setCurrentPage} />;
      // case 'imprint':
      //   return <Imprint onNavigate={setCurrentPage} />;
      default:
        return <Dashboard onNavigate={setCurrentPage} />;
    }
  };

  if (!isAuthenticated) {
    return (
      <AuthLayout onNavigate={setCurrentPage}>
        {page === 'signup' ? <SignUp onNavigate={setCurrentPage} /> : <SignIn onNavigate={setCurrentPage} />}
      </AuthLayout>
    );
  }

  if (page === 'onboarding') {
    return <Onboarding onNavigate={setCurrentPage} />;
  }

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { activeModal } = useModal();

  return (
    <>
      <div className={`transition-all duration-300 ${activeModal ? 'blur-sm pointer-events-none select-none' : ''}`}>
        <AppLayout activePage={page} onNavigate={setCurrentPage}>
          {renderPage()}
        </AppLayout>
      </div>
      <ModalManager />
    </>
  );
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <XPProvider>
          <ModalProvider>
            <MainApp />
          </ModalProvider>
        </XPProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
