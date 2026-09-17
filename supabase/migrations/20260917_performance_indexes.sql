-- ==============================================================================
-- INFINITY BANGLADESH — PRODUCTION PERFORMANCE INDEXES MIGRATION
-- Organization: Infinity Bangladesh (Team Infinity — United for Humanity)
-- Safe, non-breaking indexes for public queries and frequent filters
-- ==============================================================================

DO $$
BEGIN
  -- Campaigns: status and featured filtering
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'campaigns') THEN
    CREATE INDEX IF NOT EXISTS idx_campaigns_status_featured ON public.campaigns (status, is_featured);
    CREATE INDEX IF NOT EXISTS idx_campaigns_created_at ON public.campaigns (created_at DESC);
  END IF;

  -- Committee Members: committee lookup and ordering
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'committee_members') THEN
    CREATE INDEX IF NOT EXISTS idx_committee_members_lookup ON public.committee_members (committee_id, sort_order);
  END IF;

  -- Gallery Photos: album lookup and featured filtering
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'gallery_photos') THEN
    CREATE INDEX IF NOT EXISTS idx_gallery_photos_lookup ON public.gallery_photos (album_id, is_featured);
  END IF;

  -- Events: status and date ordering
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'event_items') THEN
    CREATE INDEX IF NOT EXISTS idx_event_items_status_date ON public.event_items (status, date);
  END IF;

  -- News Articles: status and published date ordering
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'news_articles') THEN
    CREATE INDEX IF NOT EXISTS idx_news_articles_status_pub ON public.news_articles (status, published_at DESC);
  END IF;

  -- Videos: status and featured ordering
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'video_items') THEN
    CREATE INDEX IF NOT EXISTS idx_video_items_status_featured ON public.video_items (status, is_featured);
  END IF;
END $$;
