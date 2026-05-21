-- Stripe webhook idempotency table.
--
-- Stripe burst-retries webhooks on non-2xx responses and is allowed to deliver
-- the same event.id more than once or out of order. The webhook handler at
-- backend/server.js:/stripe-webhook inserts into this table BEFORE any
-- side-effect; a unique-violation (23505) on event_id means we've already
-- handled the event and the handler short-circuits with a 200 no-op so Stripe
-- stops retrying.
--
-- Audit 2026-05-21 §MED-02 (CWE-345).
--
-- Apply locally:   supabase db push
-- Apply remotely:  paste this SQL into Supabase dashboard → SQL editor, then run.
--                  Verify table exists in dashboard → Table Editor.

CREATE TABLE IF NOT EXISTS public.processed_stripe_events (
  event_id    text PRIMARY KEY,
  type        text NOT NULL,
  received_at timestamptz NOT NULL DEFAULT now()
);

-- Used by an opt-in periodic cleanup (e.g. cron job or pg_cron) to delete
-- rows older than 30 days. Dedup horizon only needs to outlive Stripe's
-- maximum retry window (3 days) by a comfortable margin.
CREATE INDEX IF NOT EXISTS processed_stripe_events_received_at_idx
  ON public.processed_stripe_events (received_at);

-- Service-role only. Anon and authenticated users must never read or write
-- this table — it's webhook bookkeeping, not user data.
ALTER TABLE public.processed_stripe_events ENABLE ROW LEVEL SECURITY;

-- RLS is enabled but no policies are created → all access from anon and
-- authenticated roles is denied by default. The service role bypasses RLS
-- and is the only path the webhook handler uses.
