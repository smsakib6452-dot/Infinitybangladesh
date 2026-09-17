import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useData } from '../context/DataContext';
import { GalleryLightbox } from '../components/GalleryLightbox';
import { VerifiedOrganizationPledge } from '../components/OfficialInfoBadge';
import { ScrollReveal } from '../components/motion/ScrollReveal';

// Modularized Homepage Section Components (Rendering Isolation & Clean Maintenance)
import { HeroSection } from '../components/home/HeroSection';
import { ImpactSection } from '../components/home/ImpactSection';
import { AboutPreviewSection } from '../components/home/AboutPreviewSection';
import { ProgramsSection } from '../components/home/ProgramsSection';
import { CampaignsSection } from '../components/home/CampaignsSection';
import { StoriesSection } from '../components/home/StoriesSection';
import { LifelineSection } from '../components/home/LifelineSection';
import { GalleryPreviewSection } from '../components/home/GalleryPreviewSection';
import { PressSection } from '../components/home/PressSection';
import { VolunteerSection } from '../components/home/VolunteerSection';
import { SupportSection } from '../components/home/SupportSection';

export const HomePage: React.FC = () => {
  const { isBn, tText } = useLanguage();
  const {
    campaigns,
    programs,
    metrics,
    stories,
    gallery,
    pressCoverages,
    homepageConfig,
    aboutSettings,
    bloodDonationSettings,
    bloodDonors,
    emergencyBloodRequests
  } = useData();

  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const hero = homepageConfig.hero;
  const aboutPreview = homepageConfig.aboutPreview;
  const visibility = homepageConfig.sectionVisibility || {};

  const featuredCampaign = campaigns.find(c => c.isFeatured && c.status !== 'archived') || campaigns[0];
  const otherCampaigns = campaigns.filter(c => c.id !== featuredCampaign?.id && c.status !== 'archived').slice(0, 3);
  const featuredStories = stories.filter(s => s.status !== 'archived').slice(0, 2);
  const activeMetrics = metrics.filter(m => m.active !== false).sort((a, b) => (a.order || 0) - (b.order || 0));

  const approvedDonors = bloodDonors.filter(d => d.approvalStatus === 'APPROVED');
  const activeDonors = approvedDonors.filter(d => d.availabilityStatus === 'AVAILABLE_EMERGENCY');
  const totalDonationsCount = approvedDonors.reduce((acc, d) => acc + (d.totalDonations || 0), 0);

  const totalRegisteredDonors = Number(bloodDonationSettings?.statTotalDonorsOverride ?? approvedDonors.length) || 0;
  const totalActiveDonors = Number(bloodDonationSettings?.statActiveDonorsOverride ?? activeDonors.length) || 0;
  const totalLivesImpacted = bloodDonationSettings?.statImpactOverride !== null && bloodDonationSettings?.statImpactOverride !== undefined
    ? Number(bloodDonationSettings.statImpactOverride) || 0
    : totalDonationsCount;
  const pendingBloodRequests = emergencyBloodRequests.filter(r => r.status === 'PENDING' || r.status === 'PROCESSING').length;

  // Robust Section Visibility Evaluator (Guarantees 100% sync with Admin panel toggles)
  const isSectionVisible = (sectionKey: string): boolean => {
    if (!visibility) return true;
    if (visibility[sectionKey] === false) return false;

    // Check alias variations to guarantee 100% sync with Admin
    if (sectionKey === 'about' || sectionKey === 'about_preview') {
      return visibility.about !== false && visibility.about_preview !== false && (visibility as any).aboutPreview !== false;
    }
    if (sectionKey === 'lifeline' || sectionKey === 'blood_donation') {
      return visibility.lifeline !== false && visibility.blood_donation !== false && (visibility as any).lifelineSection !== false;
    }
    if (sectionKey === 'volunteer') {
      return visibility.volunteer !== false && (visibility as any).volunteerBanner !== false && (visibility as any).volunteer_banner !== false;
    }
    if (sectionKey === 'support') {
      return visibility.support !== false && (visibility as any).supportBanner !== false && (visibility as any).support_banner !== false;
    }
    if (sectionKey === 'transparency') {
      return visibility.transparency !== false && (visibility as any).transparencySection !== false && (visibility as any).transparency_section !== false;
    }
    if (sectionKey === 'programs') {
      return visibility.programs !== false && (visibility as any).programsSection !== false;
    }
    if (sectionKey === 'campaigns') {
      return visibility.campaigns !== false && (visibility as any).campaignsSection !== false;
    }
    if (sectionKey === 'stories') {
      return visibility.stories !== false && (visibility as any).storiesSection !== false;
    }
    if (sectionKey === 'gallery') {
      return visibility.gallery !== false && (visibility as any).gallerySection !== false;
    }
    if (sectionKey === 'press') {
      return visibility.press !== false && (visibility as any).pressSection !== false;
    }
    if (sectionKey === 'impact') {
      return visibility.impact !== false && (visibility as any).impactSection !== false;
    }
    if (sectionKey === 'hero') {
      return visibility.hero !== false;
    }
    return true;
  };

  // Section Rendering Function Map
  const renderSection = (sectionKey: string) => {
    if (!isSectionVisible(sectionKey)) return null;

    switch (sectionKey) {
      case 'hero':
        return (
          <HeroSection
            key="hero"
            hero={hero}
            isBn={isBn}
            tText={tText}
          />
        );

      case 'impact':
      case 'impact_section':
        return (
          <ImpactSection
            key="impact"
            metrics={activeMetrics}
            impactSection={homepageConfig.impactSection}
            isBn={isBn}
            tText={tText}
          />
        );

      case 'about':
      case 'about_preview':
        return (
          <AboutPreviewSection
            key="about"
            aboutPreview={aboutPreview}
            aboutSettings={aboutSettings}
            isBn={isBn}
            tText={tText}
          />
        );

      case 'programs':
      case 'programs_section':
        return (
          <ProgramsSection
            key="programs"
            programs={programs}
            programsSection={homepageConfig.programsSection}
            isBn={isBn}
            tText={tText}
          />
        );

      case 'campaigns':
      case 'campaigns_section':
        return (
          <CampaignsSection
            key="campaigns"
            featuredCampaign={featuredCampaign}
            otherCampaigns={otherCampaigns}
            campaignsSection={homepageConfig.campaignsSection}
            isBn={isBn}
            tText={tText}
          />
        );

      case 'stories':
      case 'stories_section':
        return (
          <StoriesSection
            key="stories"
            stories={featuredStories}
            storiesSection={homepageConfig.storiesSection}
            isBn={isBn}
            tText={tText}
          />
        );

      case 'lifeline':
      case 'blood_donation':
      case 'lifeline_section':
        return (
          <LifelineSection
            key="lifeline"
            lifelineSection={homepageConfig.lifelineSection}
            bloodDonationSettings={bloodDonationSettings}
            totalRegisteredDonors={totalRegisteredDonors}
            totalActiveDonors={totalActiveDonors}
            totalLivesImpacted={totalLivesImpacted}
            isBn={isBn}
            tText={tText}
          />
        );

      case 'gallery':
      case 'gallery_section':
        return (
          <React.Fragment key="gallery">
            <GalleryPreviewSection
              gallery={gallery}
              gallerySection={homepageConfig.gallerySection}
              onSelectPhoto={(idx) => setLightboxIndex(idx)}
              isBn={isBn}
              tText={tText}
            />
            {lightboxIndex !== null && (
              <GalleryLightbox
                photos={gallery}
                initialIndex={lightboxIndex}
                onClose={() => setLightboxIndex(null)}
              />
            )}
          </React.Fragment>
        );

      case 'press':
      case 'press_section':
        return (
          <PressSection
            key="press"
            pressCoverages={pressCoverages}
            pressSection={homepageConfig.pressSection}
            isBn={isBn}
            tText={tText}
          />
        );

      case 'volunteer':
      case 'volunteer_banner':
        return (
          <VolunteerSection
            key="volunteer"
            volunteerBanner={homepageConfig.volunteerBanner}
            isBn={isBn}
            tText={tText}
          />
        );

      case 'transparency':
      case 'transparency_section':
        return (
          <ScrollReveal effect="fade-up" key="transparency" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <VerifiedOrganizationPledge config={homepageConfig.transparencySection} />
          </ScrollReveal>
        );

      case 'support':
      case 'support_banner':
        return (
          <SupportSection
            key="support"
            supportBanner={homepageConfig.supportBanner}
            isBn={isBn}
            tText={tText}
          />
        );

      default:
        return null;
    }
  };

  const defaultSectionOrder = [
    'hero',
    'impact',
    'about',
    'programs',
    'campaigns',
    'stories',
    'lifeline',
    'gallery',
    'press',
    'volunteer',
    'transparency',
    'support'
  ];

  const orderedSections = homepageConfig.sectionOrder && homepageConfig.sectionOrder.length > 0
    ? homepageConfig.sectionOrder.includes('lifeline') || homepageConfig.sectionOrder.includes('blood_donation')
      ? homepageConfig.sectionOrder
      : [...homepageConfig.sectionOrder.slice(0, 6), 'lifeline', ...homepageConfig.sectionOrder.slice(6)]
    : defaultSectionOrder;

  const visibleSections = orderedSections.filter(sectionKey => isSectionVisible(sectionKey));

  return (
    <div className="space-y-16 sm:space-y-24 lg:space-y-28 pb-20 overflow-hidden">
      {visibleSections.map(sectionKey => renderSection(sectionKey))}
    </div>
  );
};
