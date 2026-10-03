import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useRouter } from '../context/RouterContext';
import { Link } from './Link';
import { useData } from '../context/DataContext';
import { BrandLogo } from './BrandLogo';
import {
  Search,
  Heart,
  Menu,
  X,
  ChevronDown,
  Globe,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Droplet
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { language, toggleLanguage, isBn, tText } = useLanguage();
  const { currentPage, setIsSearchOpen } = useRouter();
  const { headerSettings, navigationItems, committees } = useData();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null);
  const [activeNestedDropdownId, setActiveNestedDropdownId] = useState<string | null>(null);
  const [mobilePastCommitteesOpen, setMobilePastCommitteesOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const dropdownTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const nestedDropdownTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Dynamic Past Committees sorted descending by year
  const pastCommittees = committees
    .filter(c => c.type === 'PAST' || c.status === 'ARCHIVED')
    .sort((a, b) => {
      const yearA = parseInt(a.year || '0', 10);
      const yearB = parseInt(b.year || '0', 10);
      return yearB - yearA;
    });

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 15);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.nav-dropdown-container')) {
        setActiveDropdownId(null);
        setActiveNestedDropdownId(null);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  const handleMouseEnterDropdown = (itemId: string) => {
    if (dropdownTimeoutRef.current) {
      clearTimeout(dropdownTimeoutRef.current);
      dropdownTimeoutRef.current = null;
    }
    setActiveDropdownId(itemId);
  };

  const handleMouseLeaveDropdown = () => {
    if (dropdownTimeoutRef.current) {
      clearTimeout(dropdownTimeoutRef.current);
    }
    dropdownTimeoutRef.current = setTimeout(() => {
      setActiveDropdownId(null);
      setActiveNestedDropdownId(null);
    }, 220);
  };

  const handleMouseEnterNested = (subId: string) => {
    if (nestedDropdownTimeoutRef.current) {
      clearTimeout(nestedDropdownTimeoutRef.current);
      nestedDropdownTimeoutRef.current = null;
    }
    setActiveNestedDropdownId(subId);
  };

  const handleMouseLeaveNested = () => {
    if (nestedDropdownTimeoutRef.current) {
      clearTimeout(nestedDropdownTimeoutRef.current);
    }
    nestedDropdownTimeoutRef.current = setTimeout(() => {
      setActiveNestedDropdownId(null);
    }, 180);
  };

  const isItemActive = (path: string) => {
    if (path === 'home' && currentPage === 'home') return true;
    if (path === currentPage) return true;
    if (currentPage.startsWith(path + '/')) return true;
    if (path === 'team' && (
      currentPage === 'team' ||
      currentPage === 'team/executive-committee' ||
      currentPage === 'about/executive-committee' ||
      currentPage === 'team/standing-committee' ||
      currentPage === 'about/standing-committees' ||
      currentPage === 'team/past-committees' ||
      currentPage === 'about/past-committees'
    )) return true;
    if (path === 'gallery' && (currentPage === 'gallery' || currentPage === 'videos' || currentPage === 'media-coverage')) return true;
    if (path === 'about' && (currentPage === 'about' || currentPage === 'about/story' || currentPage === 'about/mission-vision' || currentPage === 'about/team')) return true;
    if (path === 'blood-donation' && currentPage.startsWith('blood-donation')) return true;
    return false;
  };

  const activeNavItems = navigationItems
    .filter(item => item.active)
    .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));

  return (
    <header className="sticky top-0 z-40 w-full transition-all duration-300">
      {/* 1. Official Top Notice Bar */}
      {headerSettings.showNoticeBar && (
        <div className="bg-[#11241E] text-emerald-100 text-xs py-1.5 px-3 sm:px-4 border-b border-emerald-900/60">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 truncate">
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-[#006A4E] text-white shrink-0 tracking-wider shadow-sm">
                OFFICIAL
              </span>
              <span className="truncate text-emerald-200/95 text-xs font-medium">
                {tText(headerSettings.noticeBarText)}
              </span>
            </div>

            <div className="flex items-center gap-3 shrink-0 text-emerald-200">
              {headerSettings.showNoticeBarButton !== false && (
                <Link
                  to={headerSettings.noticeBarLink || 'transparency'}
                  className="hover:text-white hidden sm:inline-flex items-center gap-1.5 transition-colors text-xs font-semibold cursor-pointer"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{tText(headerSettings.noticeBarButtonText) || (isBn ? 'স্বচ্ছতা ও অডিট' : 'Transparency')}</span>
                </Link>
              )}

              {headerSettings.showLanguageSwitcher && (
                <>
                  <span className="hidden sm:inline text-emerald-800/80">|</span>
                  <button
                    type="button"
                    onClick={toggleLanguage}
                    className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-950/80 hover:bg-emerald-900 text-emerald-200 hover:text-white text-xs font-bold border border-emerald-700/50 transition-colors cursor-pointer"
                    title="Switch Language (English / বাংলা)"
                  >
                    <Globe className="w-3 h-3 text-emerald-400" />
                    <span>{language === 'en' ? 'বাংলা' : 'English'}</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 2. Main Editorial Navigation Bar */}
      <nav
        className={`w-full transition-all duration-300 ${
          isScrolled
            ? 'bg-white/95 backdrop-blur-md shadow-warm-sm py-2.5 border-b border-[#EAE3D9]'
            : 'bg-white py-3.5 border-b border-[#EAE3D9]/60'
        }`}
      >
        <div className="max-w-[1440px] mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 flex items-center justify-between gap-2 xl:gap-4">
          {/* Official Brand Logo */}
          <Link to="home" className="shrink-0 block focus:outline-none group">
            <BrandLogo size="md" />
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center justify-center gap-0.5 xl:gap-1 2xl:gap-2 text-[13px] xl:text-[13.5px] 2xl:text-sm font-bold text-slate-700 whitespace-nowrap flex-1 min-w-0 px-1">
            {activeNavItems.map(item => {
              if (item.isDropdown && item.children && item.children.length > 0) {
                const isDropdownOpen = activeDropdownId === item.id;
                const isChildActive = item.children.some(c => isItemActive(c.path));
                const isTeamMenu = item.path === 'team' || item.id === 'nav-5';
                const isLifeLine = item.path === 'blood-donation' || item.id === 'nav-blood';

                return (
                  <div
                    key={item.id}
                    className="relative nav-dropdown-container shrink-0"
                    onMouseEnter={() => handleMouseEnterDropdown(item.id)}
                    onMouseLeave={handleMouseLeaveDropdown}
                  >
                    <div className="flex items-center">
                      <Link
                        to={item.path}
                        isExternal={item.isExternal}
                        onClick={() => setActiveDropdownId(null)}
                        className={`px-2 xl:px-2.5 py-1.5 xl:py-2 rounded-l-xl flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                          isChildActive || isItemActive(item.path)
                            ? isLifeLine
                              ? 'text-rose-700 bg-rose-50 font-extrabold'
                              : 'text-[#006A4E] bg-[#E6F3EF] font-extrabold'
                            : isLifeLine
                            ? 'hover:text-rose-700 hover:bg-rose-50/60 text-slate-700'
                            : 'hover:text-[#006A4E] hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        {isLifeLine && (
                          <Droplet className="w-3.5 h-3.5 text-rose-600 fill-rose-600 animate-heartbeat shrink-0" />
                        )}
                        <span className="whitespace-nowrap">{tText(item.label)}</span>
                      </Link>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveDropdownId(prev => (prev === item.id ? null : item.id));
                        }}
                        className={`py-1.5 xl:py-2 pr-1.5 xl:pr-2 pl-0.5 rounded-r-xl transition-colors cursor-pointer shrink-0 ${
                          isChildActive || isItemActive(item.path)
                            ? isLifeLine
                              ? 'text-rose-700 bg-rose-50'
                              : 'text-[#006A4E] bg-[#E6F3EF]'
                            : isLifeLine
                            ? 'hover:text-rose-700 hover:bg-rose-50/60 text-rose-400'
                            : 'hover:text-[#006A4E] hover:bg-slate-50 text-slate-400'
                        }`}
                        aria-label="Toggle Submenu"
                      >
                        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180 text-[#006A4E]' : ''}`} />
                      </button>
                    </div>

                    {/* Submenu Dropdown Card */}
                    {isDropdownOpen && (
                      <div className="absolute top-full left-0 pt-1.5 w-64 z-50 animate-in fade-in zoom-in-95 duration-150">
                        <div className="bg-white rounded-2xl shadow-warm-lg border border-[#EAE3D9] p-2 space-y-1">
                          {item.children.filter(c => c.active !== false).map(subItem => {
                            const isPastCommitteeSub = subItem.isNestedDropdown || subItem.id === 'sub-past' || subItem.path.includes('past-committees');

                            if (isPastCommitteeSub && isTeamMenu) {
                              const isNestedOpen = activeNestedDropdownId === subItem.id;
                              return (
                                <div
                                  key={subItem.id}
                                  className="relative group/nested"
                                  onMouseEnter={() => handleMouseEnterNested(subItem.id)}
                                  onMouseLeave={handleMouseLeaveNested}
                                >
                                  <Link
                                    to="team/past-committees"
                                    onClick={() => {
                                      setActiveDropdownId(null);
                                      setActiveNestedDropdownId(null);
                                    }}
                                    className={`w-full px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-colors cursor-pointer ${
                                      isItemActive('team/past-committees')
                                        ? 'bg-[#E6F3EF] text-[#006A4E] font-bold'
                                        : 'hover:bg-slate-50 text-slate-700'
                                    }`}
                                  >
                                    <span>{tText(subItem.label)}</span>
                                    <ChevronDown className="-rotate-90 w-3 h-3 text-slate-400" />
                                  </Link>

                                  {isNestedOpen && (
                                    <div className="absolute top-0 left-full pl-1.5 w-56 z-50 animate-in fade-in zoom-in-95 duration-150">
                                      <div className="bg-white rounded-2xl shadow-warm-lg border border-[#EAE3D9] p-2 space-y-1 max-h-72 overflow-y-auto">
                                        <Link
                                          to="team/past-committees"
                                          onClick={() => {
                                            setActiveDropdownId(null);
                                            setActiveNestedDropdownId(null);
                                          }}
                                          className="w-full px-3 py-2 rounded-xl text-xs font-bold text-[#006A4E] bg-emerald-50/60 hover:bg-[#E6F3EF] flex items-center gap-1.5 transition-colors cursor-pointer border-b border-emerald-100/60 mb-1"
                                        >
                                          <span>{isBn ? 'সবগুলো প্রাক্তন কমিটি' : 'All Past Committees'}</span>
                                          <ArrowRight className="w-3 h-3" />
                                        </Link>

                                        {pastCommittees.length > 0 ? (
                                          pastCommittees.map(pc => (
                                            <Link
                                              key={pc.id}
                                              to="team/past-committees"
                                              slug={pc.slug}
                                              onClick={() => {
                                                setActiveDropdownId(null);
                                                setActiveNestedDropdownId(null);
                                              }}
                                              className="w-full px-3 py-1.5 rounded-xl text-xs hover:bg-slate-50 text-slate-600 hover:text-[#006A4E] transition-colors cursor-pointer flex items-center justify-between"
                                            >
                                              <span className="truncate">{tText(pc.name)}</span>
                                              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 shrink-0">
                                                {pc.year}
                                              </span>
                                            </Link>
                                          ))
                                        ) : (
                                          <span className="text-[11px] text-slate-400 italic px-3 py-1 block">
                                            {isBn ? 'কোন আর্কাইভ পাওয়া যায়নি' : 'No archives found'}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              );
                            }

                            return (
                              <Link
                                key={subItem.id}
                                to={subItem.path}
                                isExternal={subItem.isExternal}
                                onClick={() => setActiveDropdownId(null)}
                                className={`w-full px-3 py-2 rounded-xl text-xs flex items-center gap-2 transition-colors cursor-pointer ${
                                  isItemActive(subItem.path)
                                    ? isLifeLine
                                      ? 'bg-rose-50 text-rose-700 font-bold'
                                      : 'bg-[#E6F3EF] text-[#006A4E] font-bold'
                                    : isLifeLine
                                    ? 'hover:bg-rose-50/60 hover:text-rose-700 text-slate-700'
                                    : 'hover:bg-slate-50 hover:text-[#006A4E] text-slate-700'
                                }`}
                              >
                                {isLifeLine && (
                                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
                                )}
                                <span>{tText(subItem.label)}</span>
                              </Link>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              }

              // Normal Link item
              const isActive = isItemActive(item.path);
              return (
                <Link
                  key={item.id}
                  to={item.path}
                  isExternal={item.isExternal}
                  className={`px-2.5 xl:px-3 py-1.5 xl:py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                    isActive
                      ? 'text-[#006A4E] bg-[#E6F3EF] font-extrabold'
                      : 'hover:text-[#006A4E] hover:bg-slate-50'
                  }`}
                >
                  {tText(item.label)}
                </Link>
              );
            })}
          </div>

          {/* Right Action Controls: Search & Join Us */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            {headerSettings.showSearch && (
              <button
                type="button"
                onClick={() => setIsSearchOpen(true)}
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-[#006A4E] border border-slate-200/80 flex items-center justify-center transition-colors cursor-pointer"
                title={isBn ? 'অনুসন্ধান করুন (Ctrl + K)' : 'Search (Ctrl + K)'}
                aria-label="Search"
              >
                <Search className="w-4 h-4" />
              </button>
            )}

            {headerSettings.showSupportButton && (
              <Link
                to={headerSettings.supportButtonUrl || 'volunteer'}
                className="hidden sm:inline-flex items-center gap-2 px-4 xl:px-5 py-2 sm:py-2.5 rounded-xl btn-primary-green text-xs sm:text-sm font-bold shadow-warm-sm cursor-pointer whitespace-nowrap"
              >
                <Heart className="w-4 h-4 text-rose-300 fill-rose-300" />
                <span>{tText(headerSettings.supportButtonText) || (isBn ? 'আমাদের সাথে যোগ দিন' : 'Join Us')}</span>
              </Link>
            )}

            {/* Mobile Menu Toggle Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(prev => !prev)}
              className="lg:hidden w-10 h-10 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 flex items-center justify-center cursor-pointer transition-colors"
              aria-label="Toggle Mobile Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </nav>

      {/* 3. Mobile Navigation Drawer (Editorial & Accessible) */}
      {mobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div 
            className="fixed inset-y-0 right-0 w-full max-w-sm bg-white shadow-2xl flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-250 z-[101]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Header */}
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/90">
              <BrandLogo size="sm" />
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="w-10 h-10 rounded-xl bg-white border border-slate-200 text-slate-600 flex items-center justify-center cursor-pointer hover:bg-slate-100 active:scale-95 transition-all touch-manipulation"
                aria-label="Close Mobile Navigation"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Menu Items */}
            <div className="p-4 space-y-1.5 flex-1 overflow-y-auto">
              {activeNavItems.map(item => {
                const isDropdown = item.isDropdown && item.children && item.children.length > 0;
                const isExpanded = activeDropdownId === item.id;
                const isActive = isItemActive(item.path);
                const isLifeLine = item.path === 'blood-donation' || item.id === 'nav-blood';

                if (isDropdown) {
                  return (
                    <div key={item.id} className="space-y-1">
                      {/* Split Dual-Action Row: Left side navigates, Right chevron expands */}
                      <div
                        className={`w-full rounded-xl flex items-center justify-between transition-all ${
                          isActive
                            ? isLifeLine
                              ? 'bg-rose-50 text-rose-700 font-bold border border-rose-100'
                              : 'bg-[#E6F3EF] text-[#006A4E] font-bold border border-emerald-100'
                            : 'text-slate-700 hover:bg-slate-50 border border-transparent'
                        }`}
                      >
                        <Link
                          to={item.path}
                          isExternal={item.isExternal}
                          onClick={() => {
                            setMobileMenuOpen(false);
                            if (isActive) window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                          className="flex-1 px-3.5 py-3 text-sm font-bold flex items-center gap-2 cursor-pointer touch-manipulation active:opacity-75"
                        >
                          {isLifeLine && <Droplet className="w-4 h-4 text-rose-600 fill-rose-600 shrink-0" />}
                          <span className="truncate">{tText(item.label)}</span>
                        </Link>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveDropdownId(prev => (prev === item.id ? null : item.id));
                          }}
                          className="w-12 h-12 flex items-center justify-center text-slate-400 hover:text-[#006A4E] hover:bg-black/5 rounded-r-xl transition-colors cursor-pointer touch-manipulation shrink-0"
                          aria-label={isExpanded ? 'Submenu collapse' : 'Submenu expand'}
                        >
                          <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? 'rotate-180 text-[#006A4E]' : ''}`} />
                        </button>
                      </div>

                      {/* Dropdown Children */}
                      {isExpanded && (
                        <div className="pl-3 pr-1 py-1.5 space-y-1 border-l-2 border-emerald-300 ml-3.5 animate-in slide-in-from-top-1 duration-150">
                          <Link
                            to={item.path}
                            onClick={() => {
                              setMobileMenuOpen(false);
                              if (isActive) window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                            className="w-full px-3 py-2 rounded-lg text-xs font-bold text-[#006A4E] bg-emerald-50/70 hover:bg-[#E6F3EF] flex items-center justify-between transition-colors cursor-pointer touch-manipulation active:scale-[0.98]"
                          >
                            <span>{isBn ? `${tText(item.label)} - মূল পাতা` : `${tText(item.label)} - Overview`}</span>
                            <ArrowRight className="w-3.5 h-3.5 text-[#006A4E]" />
                          </Link>

                          {item.children?.filter(c => c.active !== false).map(subItem => {
                            const isPastCommitteeSub = subItem.isNestedDropdown || subItem.id === 'sub-past' || subItem.path.includes('past-committees');

                            if (isPastCommitteeSub && (item.path === 'team' || item.id === 'nav-5')) {
                              return (
                                <div key={subItem.id} className="space-y-1">
                                  <div className="flex items-center justify-between rounded-lg hover:bg-slate-50 border border-transparent">
                                    <Link
                                      to={subItem.path}
                                      onClick={() => {
                                        setMobileMenuOpen(false);
                                        if (isItemActive(subItem.path)) window.scrollTo({ top: 0, behavior: 'smooth' });
                                      }}
                                      className="flex-1 px-3 py-2 text-xs font-medium text-slate-700 hover:text-[#006A4E] cursor-pointer touch-manipulation"
                                    >
                                      {tText(subItem.label)}
                                    </Link>
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setMobilePastCommitteesOpen(prev => !prev);
                                      }}
                                      className="w-10 h-8 flex items-center justify-center text-slate-400 hover:text-[#006A4E] cursor-pointer touch-manipulation shrink-0"
                                      aria-label="Toggle past committees"
                                    >
                                      <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${mobilePastCommitteesOpen ? 'rotate-180 text-[#006A4E]' : ''}`} />
                                    </button>
                                  </div>

                                  {mobilePastCommitteesOpen && (
                                    <div className="pl-3 py-1 space-y-1 border-l border-emerald-200 ml-2.5 animate-in slide-in-from-top-1 duration-150">
                                      <Link
                                        to="team/past-committees"
                                        onClick={() => {
                                          setMobileMenuOpen(false);
                                          window.scrollTo({ top: 0, behavior: 'smooth' });
                                        }}
                                        className="w-full px-2.5 py-1.5 rounded-md text-[11px] font-bold text-[#006A4E] bg-emerald-50 block cursor-pointer touch-manipulation"
                                      >
                                        {isBn ? 'সকল প্রাক্তন কমিটি' : 'All Past Committees'}
                                      </Link>
                                      {pastCommittees.map(pc => (
                                        <Link
                                          key={pc.id}
                                          to="team/past-committees"
                                          slug={pc.slug}
                                          onClick={() => {
                                            setMobileMenuOpen(false);
                                            window.scrollTo({ top: 0, behavior: 'smooth' });
                                          }}
                                          className="w-full px-2.5 py-1.5 rounded-md text-[11px] text-slate-600 hover:text-[#006A4E] hover:bg-slate-50 flex items-center justify-between cursor-pointer touch-manipulation"
                                        >
                                          <span className="truncate">{tText(pc.name)}</span>
                                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-500">
                                            {pc.year}
                                          </span>
                                        </Link>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              );
                            }

                            const isSubActive = isItemActive(subItem.path);
                            return (
                              <Link
                                key={subItem.id}
                                to={subItem.path}
                                onClick={() => {
                                  setMobileMenuOpen(false);
                                  if (isSubActive) window.scrollTo({ top: 0, behavior: 'smooth' });
                                }}
                                className={`w-full px-3 py-2 rounded-lg text-xs transition-colors block cursor-pointer touch-manipulation active:scale-[0.98] ${
                                  isSubActive
                                    ? 'bg-[#E6F3EF] text-[#006A4E] font-bold'
                                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-medium'
                                }`}
                              >
                                {tText(subItem.label)}
                              </Link>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                }

                // Normal standalone Nav Item (Home, Our Work, Contact, etc.)
                return (
                  <Link
                    key={item.id}
                    to={item.path}
                    isExternal={item.isExternal}
                    onClick={() => {
                      setMobileMenuOpen(false);
                      if (isActive) window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className={`w-full px-3.5 py-3 rounded-xl text-sm font-bold flex items-center gap-2 transition-all cursor-pointer touch-manipulation active:scale-[0.98] ${
                      isActive
                        ? 'bg-[#E6F3EF] text-[#006A4E] border border-emerald-100'
                        : 'text-slate-700 hover:bg-slate-50 border border-transparent'
                    }`}
                  >
                    <span className="truncate">{tText(item.label)}</span>
                  </Link>
                );
              })}
            </div>

            {/* Drawer Footer Actions */}
            <div className="p-4 border-t border-slate-100 bg-slate-50/90 space-y-2.5">
              {headerSettings.showLanguageSwitcher && (
                <button
                  type="button"
                  onClick={() => {
                    toggleLanguage();
                  }}
                  className="w-full py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-sm hover:bg-slate-50 active:scale-95 transition-all touch-manipulation"
                >
                  <Globe className="w-4 h-4 text-[#006A4E]" />
                  <span>{language === 'en' ? 'বাংলা সংস্করণ দেখুন' : 'Switch to English Version'}</span>
                </button>
              )}

              {headerSettings.showSupportButton && (
                <Link
                  to={headerSettings.supportButtonUrl || 'volunteer'}
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-3 rounded-xl btn-primary-green text-xs font-bold text-center flex items-center justify-center gap-2 shadow-warm-sm cursor-pointer active:scale-95 transition-all touch-manipulation"
                >
                  <Heart className="w-4 h-4 text-rose-300 fill-rose-300" />
                  <span>{tText(headerSettings.supportButtonText) || (isBn ? 'আমাদের সাথে যোগ দিন' : 'Join Us')}</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
