import React, { useState, useEffect } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { analyticsService } from './services/analyticsService';
import { AuthProvider, useAuth } from './context/AuthContext';
import { XPProvider } from './context/XPContext';
import { AppLayout } from './components/layout/AppLayout';
import { ModalProvider, useModal } from './context/ModalContext';
import ModalManager from './components/modal/ModalManager';
import { HelpCenter } from './features/info/HelpCenter';
import { PrivacyPolicy } from './features/info/PrivacyPolicy';
import { TermsOfUse } from './features/info/TermsOfUse';
import { CookieSettings } from './features/info/CookieSettings';
import { Imprint } from './features/info/Imprint';
import { LiveSession } from './features/live-session/LiveSession';
// Page Views
import { Dashboard } from './features/dashboard/Dashboard';
import { Catalog } from './features/catalog/Catalog';
import { CourseDetail } from './features/course-detail/CourseDetail';
import { LearningPath } from './features/learning-path/LearningPath';
import { ModuleDetail } from './features/learning-path/ModuleDetail';
import { ContentPlayer } from './features/content-player/ContentPlayer';
import { AITutorPage } from './features/ai-tutor/AITutorPage';
import { Analytics } from './features/analytics/Analytics';
import { CompetenceProfile } from './features/analytics/CompetenceProfile';
import { Resources } from './features/resources/Resources';
import { Community } from './features/community/Community';
import { Settings } from './features/settings/Settings';
import { Onboarding } from './features/onboarding/Onboarding';
import { SignIn } from './features/auth/SignIn';
import { SignUp } from './features/auth/SignUp';
import { AuthLayout } from './features/auth/AuthLayout';
import { Checkout } from './features/checkout/Checkout';
import { PublicProfile } from './features/profile/PublicProfile';

const MainApp: React.FC = () => {
  const { isAuthenticated, isOnboardingCompleted } = useAuth();
  const [currentPage, setCurrentPage] = useState<string>(() => {
    if (!isAuthenticated) return 'signin';
    return isOnboardingCompleted ? 'dashboard' : 'onboarding';
  });

  useEffect(() => {
    if (!isAuthenticated) return;
    const interval = setInterval(() => {
      analyticsService.incrementStudyTime(1);
    }, 60000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  const handleNavigate = (target: string) => {
    console.log("App Navigation Triggered:", target);
    setCurrentPage(target);
  };

  const [page, tab] = currentPage.split(':');

  const renderPage = () => {
    switch (page) {
      case 'signin':
        return <SignIn onNavigate={handleNavigate} />;
      case 'signup':
        return <SignUp onNavigate={handleNavigate} />;
      case 'onboarding':
        return <Onboarding onNavigate={handleNavigate} />;
      case 'dashboard':
        return <Dashboard onNavigate={handleNavigate} />;
      case 'catalog':
        return <Catalog onNavigate={handleNavigate} />;
      case 'course-detail':
        return <CourseDetail onNavigate={handleNavigate} />;
      case 'learning-path':
        return <LearningPath onNavigate={handleNavigate} />;
      case 'module-detail':
        return <ModuleDetail moduleId={tab} onNavigate={handleNavigate} />;
      case 'content-player':
        return <ContentPlayer onNavigate={handleNavigate} />;
      case 'ai-tutor':
        return <AITutorPage onNavigate={handleNavigate} initialTab={tab} />;
      case 'analytics':
        return <Analytics onNavigate={handleNavigate} />;
      case 'competence-profile':
        return <CompetenceProfile onNavigate={handleNavigate} />;
      case 'resources':
        return <Resources onNavigate={handleNavigate} />;
      case 'community':
        return <Community onNavigate={handleNavigate} />;
      case 'settings':
        return <Settings initialTab={tab as 'account' | 'billing' | 'preferences' | 'privacy'} onNavigate={handleNavigate} />;
      case 'profile':
        return <PublicProfile onNavigate={handleNavigate} />;
      case 'help-center':
        return <HelpCenter onNavigate={handleNavigate} />;
      case 'privacy':
        return <PrivacyPolicy onNavigate={handleNavigate} />;
      case 'terms':
        return <TermsOfUse onNavigate={handleNavigate} />;
      case 'cookies':
        return <CookieSettings onNavigate={handleNavigate} />;
      case 'imprint':
        return <Imprint onNavigate={handleNavigate} />;
      case 'checkout':
        return <Checkout onNavigate={handleNavigate} />;
      case 'live-session':
        return <LiveSession onNavigate={handleNavigate} />;
      default:
        return <Dashboard onNavigate={handleNavigate} />;
    }
  };

  const publicPages = ['signin', 'signup', 'onboarding', 'privacy', 'terms', 'cookies', 'imprint', 'help-center', 'checkout'];
  const isPublicPage = publicPages.includes(page);

  if (!isAuthenticated && !isPublicPage) {
    return (
      <AuthLayout onNavigate={handleNavigate}>
        {page === 'signup' ? <SignUp onNavigate={handleNavigate} /> : <SignIn onNavigate={handleNavigate} />}
      </AuthLayout>
    );
  }

  // If public page but not signed in, we might still want the layout (except for signin/signup/onboarding)
  const needsAuthLayout = !isAuthenticated && ['signin', 'signup'].includes(page);
  const needsNoLayout = page === 'onboarding';

  if (needsAuthLayout) {
    return (
      <AuthLayout onNavigate={handleNavigate}>
        {page === 'signup' ? <SignUp onNavigate={handleNavigate} /> : <SignIn onNavigate={handleNavigate} />}
      </AuthLayout>
    );
  }

  if (needsNoLayout) {
    return <Onboarding onNavigate={handleNavigate} />;
  }

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { activeModal } = useModal();

  return (
    <>
      <div className={`transition-all duration-300 ${activeModal ? 'blur-sm pointer-events-none select-none' : ''}`}>
        <AppLayout activePage={page} onNavigate={handleNavigate}>
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