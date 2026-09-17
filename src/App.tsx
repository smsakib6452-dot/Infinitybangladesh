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

// Eager Core Home Page (fast First Contentful Paint)
import { HomePage } from './pages/HomePage';

// Lazy Loaded Pages
const AboutPage = React.lazy(() => import('./pages/AboutPage').then(m => ({ default: m.AboutPage })));
const TeamOverviewPage = React.lazy(() => import('./pages/TeamOverviewPage').then(m => ({ default: m.TeamOverviewPage })));
const ExecutiveCommitteePage = React.lazy(() => import('./pages/ExecutiveCommitteePage').then(m => ({ default: m.ExecutiveCommitteePage })));
const StandingCommitteesPage = React.lazy(() => import('./pages/StandingCommitteesPage').then(m => ({ default: m.StandingCommitteesPage })));
const PastCommitteesPage = React.lazy(() => import('./pages/PastCommitteesPage').then(m => ({ default: m.PastCommitteesPage })));
const ProgramsPage = React.lazy(() => import('./pages/ProgramsPage').then(m => ({ default: m.ProgramsPage })));
const ProgramDetailPage = React.lazy(() => import('./pages/ProgramDetailPage').then(m => ({ default: m.ProgramDetailPage })));
const ProgramEventDetailPage = React.lazy(() => import('./pages/ProgramEventDetailPage').then(m => ({ default: m.ProgramEventDetailPage })));
const CampaignsPage = React.lazy(() => import('./pages/CampaignsPage').then(m => ({ default: m.CampaignsPage })));
const CampaignDetailPage = React.lazy(() => import('./pages/CampaignDetailPage').then(m => ({ default: m.CampaignDetailPage })));
const ImpactPage = React.lazy(() => import('./pages/ImpactPage').then(m => ({ default: m.ImpactPage })));
const StoryDetailPage = React.lazy(() => import('./pages/ImpactPage').then(m => ({ default: m.StoryDetailPage })));
const StoriesPage = React.lazy(() => import('./pages/StoriesPage').then(m => ({ default: m.StoriesPage })));
const VolunteerPage = React.lazy(() => import('./pages/VolunteerPage').then(m => ({ default: m.VolunteerPage })));
const DonatePage = React.lazy(() => import('./pages/DonatePage').then(m => ({ default: m.DonatePage })));
const TransparencyPage = React.lazy(() => import('./pages/TransparencyPage').then(m => ({ default: m.TransparencyPage })));
const GalleryPage = React.lazy(() => import('./pages/GalleryPage').then(m => ({ default: m.GalleryPage })));
const VideosPage = React.lazy(() => import('./pages/VideosPage').then(m => ({ default: m.VideosPage })));
const MediaCoveragePage = React.lazy(() => import('./pages/MediaCoveragePage').then(m => ({ default: m.MediaCoveragePage })));
const PartnersPage = React.lazy(() => import('./pages/PartnersPage').then(m => ({ default: m.PartnersPage })));
const PrivacyPage = React.lazy(() => import('./pages/PrivacyPage').then(m => ({ default: m.PrivacyPage })));
const TermsPage = React.lazy(() => import('./pages/TermsPage').then(m => ({ default: m.TermsPage })));
const NewsPage = React.lazy(() => import('./pages/NewsPage').then(m => ({ default: m.NewsPage })));
const NewsDetailPage = React.lazy(() => import('./pages/NewsPage').then(m => ({ default: m.NewsDetailPage })));
const EventsPage = React.lazy(() => import('./pages/EventsPage').then(m => ({ default: m.EventsPage })));
const EventDetailPage = React.lazy(() => import('./pages/EventsPage').then(m => ({ default: m.EventDetailPage })));
const ContactPage = React.lazy(() => import('./pages/ContactPage').then(m => ({ default: m.ContactPage })));
const FAQPage = React.lazy(() => import('./pages/FAQPage').then(m => ({ default: m.FAQPage })));
const BloodDonationPage = React.lazy(() => import('./pages/BloodDonationPage').then(m => ({ default: m.BloodDonationPage })));
const AdminPage = React.lazy(() => import('./pages/AdminPage').then(m => ({ default: m.AdminPage })));
const NotFoundPage = React.lazy(() => import('./pages/NotFoundPage').then(m => ({ default: m.NotFoundPage })));

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
