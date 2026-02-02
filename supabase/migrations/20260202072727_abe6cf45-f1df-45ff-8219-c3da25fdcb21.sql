-- Create saved_lists table for cloud sync
CREATE TABLE public.saved_lists (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  store TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create shopping_history table for cloud sync
CREATE TABLE public.shopping_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  store TEXT,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  total_items INTEGER NOT NULL DEFAULT 0,
  checked_items INTEGER NOT NULL DEFAULT 0,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.saved_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shopping_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies for saved_lists - users can only access their own data
CREATE POLICY "Users can view their own saved lists" 
ON public.saved_lists 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own saved lists" 
ON public.saved_lists 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own saved lists" 
ON public.saved_lists 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own saved lists" 
ON public.saved_lists 
FOR DELETE 
USING (auth.uid() = user_id);

-- RLS Policies for shopping_history - users can only access their own data
CREATE POLICY "Users can view their own shopping history" 
ON public.shopping_history 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own shopping history" 
ON public.shopping_history 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own shopping history" 
ON public.shopping_history 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own shopping history" 
ON public.shopping_history 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_saved_lists_user_id ON public.saved_lists(user_id);
CREATE INDEX idx_shopping_history_user_id ON public.shopping_history(user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_saved_lists_updated_at
BEFORE UPDATE ON public.saved_lists
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();