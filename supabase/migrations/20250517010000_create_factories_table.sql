-- Create missing tables that are referenced by other migrations

-- Create factories table
CREATE TABLE IF NOT EXISTS public.factories (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    location text,
    description text,
    minimum_order_quantity integer,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    verified boolean DEFAULT false,
    leather_types public.leather_type[] DEFAULT ARRAY[]::public.leather_type[],
    tanning_types public.tanning_type[] DEFAULT ARRAY[]::public.tanning_type[],
    finishes public.finish_type[] DEFAULT ARRAY[]::public.finish_type[],
    video_url text,
    featured_image text,
    gallery text[],
    instagram text,
    website text
);

-- Create orders table
CREATE TABLE IF NOT EXISTS public.orders (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    brand_id uuid,
    factory_id uuid,
    rep_id uuid,
    status public.order_status DEFAULT 'pending'::public.order_status,
    quantity integer NOT NULL,
    total_amount numeric(10,2),
    currency text DEFAULT 'USD'::text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    sample_id uuid,
    stripe_payment_intent_id text,
    notes text,
    delivery_date timestamp with time zone,
    quality_check_status text DEFAULT 'pending'::text
);

-- Create messages table
CREATE TABLE IF NOT EXISTS public.messages (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    chat_id uuid,
    sender_id uuid,
    receiver_id uuid,
    text text NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Create stripe_payment_intents table
CREATE TABLE IF NOT EXISTS public.stripe_payment_intents (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    stripe_payment_intent_id text NOT NULL,
    order_id uuid,
    customer_id uuid,
    amount bigint NOT NULL,
    currency text NOT NULL,
    status text NOT NULL,
    payment_method text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Add primary keys (with error handling)
DO $$ BEGIN
    ALTER TABLE ONLY public.factories ADD CONSTRAINT factories_pkey PRIMARY KEY (id);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE ONLY public.orders ADD CONSTRAINT orders_pkey PRIMARY KEY (id);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE ONLY public.messages ADD CONSTRAINT messages_pkey PRIMARY KEY (id);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE ONLY public.stripe_payment_intents ADD CONSTRAINT stripe_payment_intents_pkey PRIMARY KEY (id);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Add unique constraint for stripe_payment_intent_id
DO $$ BEGIN
    ALTER TABLE ONLY public.stripe_payment_intents ADD CONSTRAINT stripe_payment_intents_stripe_payment_intent_id_key UNIQUE (stripe_payment_intent_id);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Add foreign key constraints (with error handling)
DO $$ BEGIN
    ALTER TABLE ONLY public.orders ADD CONSTRAINT orders_brand_id_fkey FOREIGN KEY (brand_id) REFERENCES public.brands(id) ON DELETE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE ONLY public.orders ADD CONSTRAINT orders_factory_id_fkey FOREIGN KEY (factory_id) REFERENCES public.factories(id);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE ONLY public.orders ADD CONSTRAINT orders_rep_id_fkey FOREIGN KEY (rep_id) REFERENCES public.reps(id);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Enable RLS
ALTER TABLE public.factories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stripe_payment_intents ENABLE ROW LEVEL SECURITY;

-- Grant privileges
GRANT ALL ON TABLE public.factories TO anon;
GRANT ALL ON TABLE public.factories TO authenticated;
GRANT ALL ON TABLE public.factories TO service_role;
GRANT ALL ON TABLE public.orders TO anon;
GRANT ALL ON TABLE public.orders TO authenticated;
GRANT ALL ON TABLE public.orders TO service_role;
GRANT ALL ON TABLE public.messages TO anon;
GRANT ALL ON TABLE public.messages TO authenticated;
GRANT ALL ON TABLE public.messages TO service_role;
GRANT ALL ON TABLE public.stripe_payment_intents TO anon;
GRANT ALL ON TABLE public.stripe_payment_intents TO authenticated;
GRANT ALL ON TABLE public.stripe_payment_intents TO service_role; 