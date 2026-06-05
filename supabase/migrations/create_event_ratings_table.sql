-- ============================================================
-- Migration: Buat tabel event_ratings
-- Jalankan script ini di Supabase Dashboard → SQL Editor
-- ============================================================

-- Buat tabel event_ratings
CREATE TABLE IF NOT EXISTS public.event_ratings (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id    UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating_value SMALLINT NOT NULL CHECK (rating_value BETWEEN 1 AND 5),
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now(),

  -- Constraint: satu user hanya bisa memberi satu rating per event
  CONSTRAINT unique_event_user_rating UNIQUE (event_id, user_id)
);

-- RLS Policies
ALTER TABLE public.event_ratings ENABLE ROW LEVEL SECURITY;

-- Semua user yang sudah login bisa membaca rating
CREATE POLICY "event_ratings_select" ON public.event_ratings
  FOR SELECT USING (true);

-- User hanya bisa insert rating mereka sendiri
CREATE POLICY "event_ratings_insert" ON public.event_ratings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- User hanya bisa update rating mereka sendiri
CREATE POLICY "event_ratings_update" ON public.event_ratings
  FOR UPDATE USING (auth.uid() = user_id);

-- ============================================================
-- RPC Function: Hitung rata-rata rating per event (server-side aggregation)
-- Sangat ringan: hanya mengembalikan 1 baris hasil aggregate,
-- tidak menarik semua baris ke frontend.
-- ============================================================

CREATE OR REPLACE FUNCTION get_event_rating_stats(p_event_id UUID)
RETURNS TABLE (
  average_rating NUMERIC,
  total_ratings  BIGINT,
  star_counts    JSON
)
LANGUAGE sql
STABLE
AS $$
  SELECT
    ROUND(AVG(rating_value)::NUMERIC, 1) AS average_rating,
    COUNT(*)                              AS total_ratings,
    json_build_object(
      '5', COUNT(*) FILTER (WHERE rating_value = 5),
      '4', COUNT(*) FILTER (WHERE rating_value = 4),
      '3', COUNT(*) FILTER (WHERE rating_value = 3),
      '2', COUNT(*) FILTER (WHERE rating_value = 2),
      '1', COUNT(*) FILTER (WHERE rating_value = 1)
    ) AS star_counts
  FROM public.event_ratings
  WHERE event_id = p_event_id;
$$;

-- Grant execute ke authenticated users
GRANT EXECUTE ON FUNCTION get_event_rating_stats(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_event_rating_stats(UUID) TO anon;
