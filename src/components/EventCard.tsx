import React from 'react';
import { EventItem } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { Link } from '../context/RouterContext';
import { Calendar, Clock, MapPin, ArrowRight, CheckCircle2 } from 'lucide-react';
import { getAssetUrl } from '../lib/utils/assetHelper';
import { OptimizedImage } from './OptimizedImage';

interface EventCardProps {
  event: EventItem;
}

export const EventCard: React.FC<EventCardProps> = ({ event }) => {
  const { isBn, tText } = useLanguage();

  return (
    <div className="bg-white rounded-3xl border border-[#EAE3D9] overflow-hidden shadow-warm-sm hover:shadow-warm-lg motion-card-hover transition-all duration-300 flex flex-col md:flex-row group w-full">
      {/* Event Image */}
      <Link
        to="events/detail"
        slug={event.slug}
        className="relative md:w-5/12 aspect-16/9 md:aspect-auto overflow-hidden bg-slate-100 shrink-0 block"
      >
        <OptimizedImage
          src={event.imageUrl}
          alt={tText(event.title)}
          aspectRatio="16/9"
          width={480}
          className="w-full h-full object-cover motion-img-zoom"
        />
        <div className="absolute top-3 left-3 bg-[#006A4E] text-white text-xs font-bold px-3 py-1 rounded-full shadow-xs">
          {event.status === 'upcoming' ? (isBn ? 'আসন্ন ইভেন্ট' : 'Upcoming Event') : event.status}
        </div>
      </Link>

      {/* Content */}
      <div className="p-6 sm:p-7 md:w-7/12 flex flex-col justify-between space-y-4">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2.5 text-xs text-[#006A4E] font-bold">
            <span className="flex items-center gap-1 bg-[#E6F3EF] px-2.5 py-1 rounded-lg border border-[#C2E2D7]">
              <Calendar className="w-3.5 h-3.5 text-[#006A4E]" />
              {event.date}
            </span>
            <span className="flex items-center gap-1 bg-[#FAF7F2] text-slate-700 px-2.5 py-1 rounded-lg border border-[#EAE3D9]">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              {event.time}
            </span>
          </div>

          <Link to="events/detail" slug={event.slug} className="block group/title">
            <h3 className="text-lg sm:text-xl font-bold text-slate-900 group-hover/title:text-[#006A4E] transition-colors font-display">
              {tText(event.title)}
            </h3>
          </Link>

          <div className="flex items-start gap-1.5 text-xs text-slate-600">
            <MapPin className="w-3.5 h-3.5 text-[#D4182E] shrink-0 mt-0.5" />
            <span className="line-clamp-2">{tText(event.location)}</span>
          </div>

          <p className="text-xs sm:text-sm text-slate-600 line-clamp-2 leading-relaxed">
            {tText(event.description)}
          </p>
        </div>

        {/* Action Button */}
        <div className="pt-2 flex items-center justify-between">
          <Link
            to="events/detail"
            slug={event.slug}
            className="text-xs sm:text-sm font-bold text-[#006A4E] hover:text-[#00523C] inline-flex items-center gap-1.5 cursor-pointer"
          >
            <span>{isBn ? 'বিস্তারিত ও অংশগ্রহণ' : 'Event Details & RSVP'}</span>
            <ArrowRight className="w-4 h-4 group-arrow-hover" />
          </Link>

          {event.registrationOpen && (
            <span className="text-xs text-[#006A4E] font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              {isBn ? 'রেজিস্ট্রেশন উন্মুক্ত' : 'Open RSVP'}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

