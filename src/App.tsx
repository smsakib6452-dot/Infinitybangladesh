import React, { useEffect } from 'react';
import { LanguageProvider } from './context/LanguageContext';
import { DataProvider } from './context/DataContext';
import { RouterProvider, useRouter } from './context/RouterContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { GlobalSearchModal } from './components/GlobalSearchModal';
import { AdminErrorBoundary } from './components/AdminErrorBoundary';

import { ScrollProgressBar } from './components/motion/ScrollProgressBar';
import { BackToTopButton } from './components/motion/BackToTopButton';
import { PageTransition } from './components/motion/PageTransition';
import { CustomCursor } from './components/motion/CustomCursor';

import { lazyWithRetry } from './lib/utils/lazyWithRetry';

// Eager Core Home Page (fast First Contentful Paint)
import { HomePage } from './pages/HomePage';

// Lazy Loaded Pages with automated stale chunk reload recovery
const AboutPage = lazyWithRetry(() => import('./pages/AboutPage'), 'AboutPage');
const TeamOverviewPage = lazyWithRetry(() => import('./pages/TeamOverviewPage'), 'TeamOverviewPage');
const ExecutiveCommitteePage = lazyWithRetry(() => import('./pages/ExecutiveCommitteePage'), 'ExecutiveCommitteePage');
const StandingCommitteesPage = lazyWithRetry(() => import('./pages/StandingCommitteesPage'), 'StandingCommitteesPage');
const PastCommitteesPage = lazyWithRetry(() => import('./pages/PastCommitteesPage'), 'PastCommitteesPage');
const ProgramsPage = lazyWithRetry(() => import('./pages/ProgramsPage'), 'ProgramsPage');
const ProgramDetailPage = lazyWithRetry(() => import('./pages/ProgramDetailPage'), 'ProgramDetailPage');
const ProgramEventDetailPage = lazyWithRetry(() => import('./pages/ProgramEventDetailPage'), 'ProgramEventDetailPage');
const CampaignsPage = lazyWithRetry(() => import('./pages/CampaignsPage'), 'CampaignsPage');
const CampaignDetailPage = lazyWithRetry(() => import('./pages/CampaignDetailPage'), 'CampaignDetailPage');
const ImpactPage = lazyWithRetry(() => import('./pages/ImpactPage'), 'ImpactPage');
const StoryDetailPage = lazyWithRetry(() => import('./pages/ImpactPage'), 'StoryDetailPage');
const StoriesPage = lazyWithRetry(() => import('./pages/StoriesPage'), 'StoriesPage');
const VolunteerPage = lazyWithRetry(() => import('./pages/VolunteerPage'), 'VolunteerPage');
const DonatePage = lazyWithRetry(() => import('./pages/DonatePage'), 'DonatePage');
const TransparencyPage = lazyWithRetry(() => import('./pages/TransparencyPage'), 'TransparencyPage');
const GalleryPage = lazyWithRetry(() => import('./pages/GalleryPage'), 'GalleryPage');
const VideosPage = lazyWithRetry(() => import('./pages/VideosPage'), 'VideosPage');
const MediaCoveragePage = lazyWithRetry(() => import('./pages/MediaCoveragePage'), 'MediaCoveragePage');
const PartnersPage = lazyWithRetry(() => import('./pages/PartnersPage'), 'PartnersPage');
const PrivacyPage = lazyWithRetry(() => import('./pages/PrivacyPage'), 'PrivacyPage');
const TermsPage = lazyWithRetry(() => import('./pages/TermsPage'), 'TermsPage');
const NewsPage = lazyWithRetry(() => import('./pages/NewsPage'), 'NewsPage');
const NewsDetailPage = lazyWithRetry(() => import('./pages/NewsPage'), 'NewsDetailPage');
const EventsPage = lazyWithRetry(() => import('./pages/EventsPage'), 'EventsPage');
const EventDetailPage = lazyWithRetry(() => import('./pages/EventsPage'), 'EventDetailPage');
const ContactPage = lazyWithRetry(() => import('./pages/ContactPage'), 'ContactPage');
const FAQPage = lazyWithRetry(() => import('./pages/FAQPage'), 'FAQPage');
const BloodDonationPage = lazyWithRetry(() => import('./pages/BloodDonationPage'), 'BloodDonationPage');
const AdminPage = lazyWithRetry(() => import('./pages/AdminPage'), 'AdminPage');
const NotFoundPage = lazyWithRetry(() => import('./pages/NotFoundPage'), 'NotFoundPage');

// Lightweight Skeleton for Suspense transitions
const PageSkeleton: React.FC = () => (
  <div className="min-h-[50vh] max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-pulse space-y-6">
    <div className="h-8 bg-[#EAE3D9]/60 rounded-2xl w-48" />
    <div className="h-5 bg-[#EAE3D9]/40 rounded-xl w-80" />
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-6">
      <div className="h-56 bg-[#EAE3D9]/30 rounded-3xl" />
      <div className="h-56 bg-[#EAE3D9]/30 rounded-3xl hidden sm:block" />
      <div className="h-56 bg-[#EAE3D9]/30 rounded-3xl hidden lg:block" />
    </div>
  </div>
);

const AppContent: React.FC = () => {
  const { currentPage } = useRouter();

  // Instant scroll to top on page change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentPage]);

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage />;
      case 'about':
      case 'about/story':
        return <AboutPage initialTab="overview" />;
      case 'about/mission-vision':
        return <AboutPage initialTab="mission-vision" />;
      case 'about/team':
        return <AboutPage initialTab="team" />;
      case 'team':
        return <TeamOverviewPage />;
      case 'team/executive-committee':
      case 'about/executive-committee':
        return <ExecutiveCommitteePage />;
      case 'team/standing-committee':
      case 'about/standing-committees':
        return <StandingCommitteesPage />;
      case 'team/past-committees':
      case 'about/past-committees':
        return <PastCommitteesPage />;
      case 'programs':
        return <ProgramsPage />;
      case 'programs/detail':
        return <ProgramDetailPage />;
      case 'programs/event-detail':
        return <ProgramEventDetailPage />;
      case 'campaigns':
        return <CampaignsPage />;
      case 'campaigns/detail':
        return <CampaignDetailPage />;
      case 'impact':
        return <ImpactPage />;
      case 'stories':
        return <StoriesPage />;
      case 'stories/detail':
        return <StoryDetailPage />;
      case 'volunteer':
        return <VolunteerPage />;
      case 'blood-donation':
      case 'blood-donation/find-donor':
        return <BloodDonationPage initialTab="find-donor" />;
      case 'blood-donation/become-donor':
        return <BloodDonationPage initialTab="become-donor" />;
      case 'blood-donation/update-donor':
        return <BloodDonationPage initialTab="update-donor" />;
      case 'blood-donation/emergency-request':
        return <BloodDonationPage initialTab="emergency-request" />;
      case 'blood-donation/statistics':
        return <BloodDonationPage initialTab="statistics" />;
      case 'donate':
        return <DonatePage />;
      case 'transparency':
      case 'reports':
        return <TransparencyPage />;
      case 'gallery':
        return <GalleryPage />;
      case 'videos':
        return <VideosPage />;
      case 'media-coverage':
        return <MediaCoveragePage />;
      case 'partners':
        return <PartnersPage />;
      case 'privacy':
        return <PrivacyPage />;
      case 'terms':
        return <TermsPage />;
      case 'news':
        return <NewsPage />;
      case 'news/detail':
        return <NewsDetailPage />;
      case 'events':
        return <EventsPage />;
      case 'events/detail':
        return <EventDetailPage />;
      case 'contact':
        return <ContactPage />;
      case 'faq':
        return <FAQPage />;
      case 'admin':
        return <AdminPage />;
      case '404':
        return <NotFoundPage />;
      default:
        return <NotFoundPage />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F2] text-[#0F172A] selection:bg-[#006A4E]/15 selection:text-[#006A4E]">
      {/* Desktop Custom Interactive Cursor (auto-disabled on touch & reduced motion) */}
      <CustomCursor />

      {/* Global Scroll Progress Bar */}
      <ScrollProgressBar />

      {/* Top Navigation */}
      <Navbar />

      {/* Main Routed Content with Smooth Fast Page Transition */}
      <main className="flex-1">
        <AdminErrorBoundary fallbackTitle="Page Load Notice">
          <PageTransition pageKey={currentPage}>
            <React.Suspense fallback={<PageSkeleton />}>
              {renderPage()}
            </React.Suspense>
          </PageTransition>
        </AdminErrorBoundary>
      </main>

      {/* Global Footer (shown on all pages for consistency) */}
      <Footer />

      {/* Global Search Lightbox Modal */}
      <GlobalSearchModal />

      {/* Back To Top Action Button */}
      <BackToTopButton />
    </div>
  );
};

export default function App() {
  return (
    <LanguageProvider>
      <DataProvider>
        <RouterProvider>
          <AppContent />
        </RouterProvider>
      </DataProvider>
    </LanguageProvider>
  );
}
