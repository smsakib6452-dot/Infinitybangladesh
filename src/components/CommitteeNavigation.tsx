import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Link } from './Link';
import { LayoutGrid, Award, Layers, History } from 'lucide-react';

interface CommitteeNavigationProps {
  activeTab: 'overview' | 'executive' | 'standing' | 'past';
  year?: string;
  className?: string;
}

export const CommitteeNavigation: React.FC<CommitteeNavigationProps> = ({
  activeTab,
  year = '2026',
  className = ''
}) => {
  const { isBn } = useLanguage();

  const navItems = [
    {
      id: 'overview',
      path: 'team',
      icon: LayoutGrid,
      label: { bn: 'টিম ওভারভিউ', en: 'Team Overview' }
    },
    {
      id: 'executive',
      path: 'team/executive-committee',
      icon: Award,
      label: {
        bn: `কার্যনির্বাহী পরিষদ (${year === '2026' ? '২০২৬' : year})`,
        en: `Executive Committee (${year})`
      }
    },
    {
      id: 'standing',
      path: 'team/standing-committee',
      icon: Layers,
      label: { bn: 'স্থায়ী কমিটি', en: 'Standing Committee' }
    },
    {
      id: 'past',
      path: 'team/past-committees',
      icon: History,
      label: { bn: 'প্রাক্তন আর্কাইভ', en: 'Past Archive' }
    }
  ];

  return (
    <nav
      aria-label="Committee Navigation"
      className={`pt-2 flex flex-wrap justify-center items-center gap-2 sm:gap-2.5 ${className}`}
    >
      <div className="bg-white/80 backdrop-blur-md p-1.5 rounded-2xl sm:rounded-3xl border border-[#EAE3D9] shadow-warm-xs inline-flex flex-wrap items-center justify-center gap-1 sm:gap-1.5 max-w-full">
        {navItems.map(item => {
          const isActive = activeTab === item.id;
          const IconComp = item.icon;

          if (isActive) {
            return (
              <span
                key={item.id}
                className="px-3.5 sm:px-4 py-2 rounded-xl sm:rounded-2xl bg-gradient-to-r from-[#006A4E] to-[#004835] text-white text-xs sm:text-sm font-extrabold shadow-warm-xs border border-[#008765]/40 flex items-center gap-1.5 select-none"
              >
                <IconComp className="w-3.5 h-3.5 text-emerald-200" />
                <span>{isBn ? item.label.bn : item.label.en}</span>
              </span>
            );
          }

          return (
            <Link
              key={item.id}
              to={item.path}
              className="px-3.5 sm:px-4 py-2 rounded-xl sm:rounded-2xl text-slate-700 hover:text-[#006A4E] hover:bg-[#FAF7F2] text-xs sm:text-sm font-bold border border-transparent hover:border-[#EAE3D9] transition-all cursor-pointer flex items-center gap-1.5"
            >
              <IconComp className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#006A4E]" />
              <span>{isBn ? item.label.bn : item.label.en}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
