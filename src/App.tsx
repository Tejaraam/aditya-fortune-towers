import React, { useState } from 'react';
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { Hero } from './components/showcase/Hero';
import { AboutProject } from './components/showcase/AboutProject';
import { FloorPlans } from './components/showcase/FloorPlans';
import { Amenities } from './components/showcase/Amenities';
import { LocationMap } from './components/showcase/LocationMap';
import { CommunityPortal } from './components/community/CommunityPortal';
import { BrochureModal } from './components/modals/BrochureModal';

export const App: React.FC = () => {
  const [activeSection, setActiveSection] = useState<string>('overview');
  const [isBrochureModalOpen, setIsBrochureModalOpen] = useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      const offset = window.innerHeight / 3; // Trigger when section is in top 1/3rd of screen
      const scrollPosition = window.scrollY + offset;

      // Bottom-to-top order for determining the current section
      const sections = [
        { id: 'community', element: document.getElementById('community-portal-section') },
        { id: 'location', element: document.getElementById('location-section') },
        { id: 'amenities', element: document.getElementById('amenities-section') },
        { id: 'floor-plans', element: document.getElementById('floor-plans-section') },
        { id: 'overview', element: document.getElementById('about-section') },
      ];

      for (const section of sections) {
        if (section.element && scrollPosition >= section.element.offsetTop) {
          setActiveSection((prev) => (prev !== section.id ? section.id : prev));
          return;
        }
      }

      // If we are at the very top (Hero section)
      if (window.scrollY < 100) {
        setActiveSection((prev) => (prev !== 'overview' ? 'overview' : prev));
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    // Run once on mount to set initial state
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSectionSwitch = (sectionId: string) => {
    setActiveSection(sectionId);
    if (sectionId === 'community') {
      const el = document.getElementById('community-portal-section');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    } else if (sectionId === 'floor-plans') {
      const el = document.getElementById('floor-plans-section');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    } else if (sectionId === 'amenities') {
      const el = document.getElementById('amenities-section');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    } else if (sectionId === 'location') {
      const el = document.getElementById('location-section');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    } else if (sectionId === 'overview') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen flex flex-col selection:bg-amber-500 selection:text-white">
      {/* Sticky Navigation */}
      <Navbar
        activeSection={activeSection}
        setActiveSection={handleSectionSwitch}
        onOpenBrochure={() => setIsBrochureModalOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1">
        <Hero
          setActiveSection={handleSectionSwitch}
          onOpenBrochure={() => setIsBrochureModalOpen(true)}
        />
        <AboutProject />
        <FloorPlans onOpenBrochure={() => setIsBrochureModalOpen(true)} />
        <Amenities onOpenBrochure={() => setIsBrochureModalOpen(true)} />
        <LocationMap />
        
        {/* Community Portal Section */}
        <div id="community-portal-section" className="border-t-4 border-amber-500">
          <CommunityPortal />
        </div>
      </main>

      {/* Global Footer */}
      <Footer
        setActiveSection={handleSectionSwitch}
        onOpenBrochure={() => setIsBrochureModalOpen(true)}
      />

      {/* Interactive Modals */}
      <BrochureModal
        isOpen={isBrochureModalOpen}
        onClose={() => setIsBrochureModalOpen(false)}
      />
    </div>
  );
};

export default App;
