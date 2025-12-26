
-- Force schema cache reload by adding a comment (DDL trigger)
COMMENT ON TABLE public.teams IS 'Teams table';

-- Explicitly notify PostgREST to reload schema
NOTIFY pgrst, 'reload schema';
