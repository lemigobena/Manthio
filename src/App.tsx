import React, { useState } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { XPProvider } from './context/XPContext';
import { AppLayout } from './components/layout/AppLayout';
import { ModalProvider } from './context/ModalContext';
import ModalManager from './components/modal/ModalManager';

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

const MainApp: React.FC = () => {
  const { isOnboardingCompleted } = useAuth();
  const [currentPage, setCurrentPage] = useState<string>(() => {
    return isOnboardingCompleted ? 'dashboard' : 'onboarding';
  });

  const [page, tab] = currentPage.split(':');

  const renderPage = () => {
    switch (page) {
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
      default:
        return <Dashboard onNavigate={setCurrentPage} />;
    }
  };

  if (page === 'onboarding') {
    return <Onboarding onNavigate={setCurrentPage} />;
  }

  return (
    <AppLayout activePage={page} onNavigate={setCurrentPage}>
      {renderPage()}
      <ModalManager />
    </AppLayout>
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
