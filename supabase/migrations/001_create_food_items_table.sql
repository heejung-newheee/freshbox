-- Create food_items table
CREATE TABLE IF NOT EXISTS public.food_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(50) NOT NULL CHECK (category IN ('채소', '육류', '해산물', '유제품', '가공식품', '기타')),
  location VARCHAR(50) NOT NULL CHECK (location IN ('냉장칸', '냉동칸', '야채칸','김치냉장고','실온','기타')),
  bought DATE DEFAULT CURRENT_DATE,
  expiry DATE NOT NULL,
  quantity INTEGER DEFAULT 1,
  unit VARCHAR(20) DEFAULT '개',
  consumed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_food_items_consumed ON public.food_items(consumed);
CREATE INDEX IF NOT EXISTS idx_food_items_expiry ON public.food_items(expiry);
CREATE INDEX IF NOT EXISTS idx_food_items_location ON public.food_items(location);
CREATE INDEX IF NOT EXISTS idx_food_items_created_at ON public.food_items(created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE public.food_items ENABLE ROW LEVEL SECURITY;

-- Create policies (if you want to make it public for now)
CREATE POLICY "Allow all access" ON public.food_items
  FOR ALL
  USING (true)
  WITH CHECK (true);
