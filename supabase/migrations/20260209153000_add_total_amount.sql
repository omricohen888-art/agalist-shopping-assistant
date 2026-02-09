-- Add total_amount column to shopping_history table
ALTER TABLE public.shopping_history 
ADD COLUMN total_amount NUMERIC DEFAULT 0;

-- Comment on column
COMMENT ON COLUMN public.shopping_history.total_amount IS 'Total cost of the shopping trip';
