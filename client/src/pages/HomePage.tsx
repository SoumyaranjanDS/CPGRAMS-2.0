import React from 'react';
import { Department } from '../types/index.js';
import { HeroSection } from '../components/home/HeroSection.js';
import { AboutSection } from '../components/home/AboutSection.js';
import { EmailWarningBanner } from '../components/home/EmailWarningBanner.js';
import { ExclusionsAndNoticeSection } from '../components/home/ExclusionsAndNoticeSection.js';
import { ProcessFlowSection } from '../components/home/ProcessFlowSection.js';
import { MinistriesSection } from '../components/home/MinistriesSection.js';
import { PinDirectoryLookupSection } from '../components/home/PinDirectoryLookupSection.js';
import { CitizenCharterSection } from '../components/home/CitizenCharterSection.js';
import { FaqSection } from '../components/home/FaqSection.js';

export interface HomePageProps {
  departments: Department[];
  deptLoading: boolean;
  onStartComplaint: (initialText?: string) => void;
  onTrackComplaint: () => void;
  onOpenVoiceModal: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  departments,
  deptLoading,
  onStartComplaint,
  onTrackComplaint,
  onOpenVoiceModal,
}) => {
  return (
    <div className="space-y-16 w-full max-w-full">
      {/* Hero Section: White and Blue Theme, Large Hero Image Sitting on Bottom */}
      <HeroSection
        onStartComplaint={onStartComplaint}
        onTrackComplaint={onTrackComplaint}
        onOpenVoiceModal={onOpenVoiceModal}
      />

      {/* About CPGRAMS Section */}
      <AboutSection />

      {/* Official Email Grievance Warning Banner (#6F0047 background) */}
      <EmailWarningBanner />

      {/* Issues Not Taken Up for Redress & Statutory Notice Section */}
      <ExclusionsAndNoticeSection />

      {/* Connected Timeline Process Flow */}
      <ProcessFlowSection />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16 text-left w-full max-w-full">
        {/* Integrated Ministries & State Departments Directory */}
        <MinistriesSection
          departments={departments}
          isLoading={deptLoading}
          onStartComplaint={onStartComplaint}
        />

        {/* Postal PIN Code Hierarchy Lookup */}
        <PinDirectoryLookupSection />

        {/* Citizen Charter & Statutory Standards */}
        <CitizenCharterSection />

        {/* Frequently Asked Questions (All 18 Official DARPG Questions) */}
        <FaqSection />
      </div>
    </div>
  );
};
