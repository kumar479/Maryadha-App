-- Add all missing tables to match the complete schema

-- Create archived_orders table
CREATE TABLE IF NOT EXISTS public.archived_orders (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    order_id uuid,
    archived_at timestamp with time zone DEFAULT now(),
    certificate_url text
);

-- Create chat_participants table
CREATE TABLE IF NOT EXISTS public.chat_participants (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    chat_id uuid,
    user_id uuid,
    created_at timestamp with time zone DEFAULT now()
);

-- Create group_chats table
CREATE TABLE IF NOT EXISTS public.group_chats (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    order_id uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    brand_id uuid,
    factory_id uuid
);

-- Create issue_attachments table
CREATE TABLE IF NOT EXISTS public.issue_attachments (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    issue_id uuid,
    url text NOT NULL,
    type public.attachment_type NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);

-- Create manufacturers table
CREATE TABLE IF NOT EXISTS public.manufacturers (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text,
    story text,
    image_urls text[],
    moq integer,
    leather_types text[],
    certifications text[],
    location text,
    style_tags text[],
    is_verified boolean DEFAULT false
);

-- Create message_notifications table
CREATE TABLE IF NOT EXISTS public.message_notifications (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    message_id uuid,
    recipient_id uuid,
    read boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now()
);

-- Create message_templates table
CREATE TABLE IF NOT EXISTS public.message_templates (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    title text NOT NULL,
    content text NOT NULL,
    category text NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT message_templates_category_check CHECK ((category = ANY (ARRAY['sample_status'::text, 'payment'::text, 'production'::text, 'general'::text])))
);

-- Create notification_preferences table
CREATE TABLE IF NOT EXISTS public.notification_preferences (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    notification_type text NOT NULL,
    email_enabled boolean DEFAULT true,
    push_enabled boolean DEFAULT true,
    whatsapp_enabled boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Create order_assignments table
CREATE TABLE IF NOT EXISTS public.order_assignments (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    order_id uuid,
    rep_id uuid,
    status text NOT NULL,
    notes text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT order_assignments_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'reviewing'::text, 'in_progress'::text, 'completed'::text])))
);

-- Create order_feedback table
CREATE TABLE IF NOT EXISTS public.order_feedback (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    order_id uuid,
    brand_id uuid,
    craftsmanship_rating integer,
    communication_rating integer,
    delivery_rating integer,
    comments text,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT order_feedback_communication_rating_check CHECK (((communication_rating >= 1) AND (communication_rating <= 5))),
    CONSTRAINT order_feedback_craftsmanship_rating_check CHECK (((craftsmanship_rating >= 1) AND (craftsmanship_rating <= 5))),
    CONSTRAINT order_feedback_delivery_rating_check CHECK (((delivery_rating >= 1) AND (delivery_rating <= 5)))
);

-- Create order_followups table
CREATE TABLE IF NOT EXISTS public.order_followups (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    order_id uuid,
    brand_id uuid,
    rep_id uuid,
    status text,
    scheduled_for timestamp with time zone NOT NULL,
    completed_at timestamp with time zone,
    response text,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT order_followups_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'completed'::text, 'no_response'::text])))
);

-- Create order_issues table
CREATE TABLE IF NOT EXISTS public.order_issues (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    order_id uuid,
    brand_id uuid,
    rep_id uuid,
    issue_type public.issue_type NOT NULL,
    status public.issue_status DEFAULT 'open'::public.issue_status,
    description text NOT NULL,
    resolution text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Create order_payments table
CREATE TABLE IF NOT EXISTS public.order_payments (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    order_id uuid,
    amount numeric(10,2) NOT NULL,
    currency text NOT NULL,
    stripe_payment_intent_id text,
    status public.payment_status DEFAULT 'pending'::public.payment_status,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Create order_status_history table
CREATE TABLE IF NOT EXISTS public.order_status_history (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    order_id uuid,
    status public.order_status NOT NULL,
    notes text,
    created_at timestamp with time zone DEFAULT now()
);

-- Create sample_assignments table
CREATE TABLE IF NOT EXISTS public.sample_assignments (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    sample_id uuid,
    rep_id uuid,
    assigned_at timestamp with time zone DEFAULT now()
);

-- Create sample_notifications table
CREATE TABLE IF NOT EXISTS public.sample_notifications (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    sample_id uuid,
    recipient_id uuid,
    notification_type text NOT NULL,
    read boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now()
);

-- Create stripe_customers table
CREATE TABLE IF NOT EXISTS public.stripe_customers (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    stripe_customer_id text NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Create stripe_prices table
CREATE TABLE IF NOT EXISTS public.stripe_prices (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    stripe_price_id text NOT NULL,
    product_id uuid,
    active boolean DEFAULT true,
    currency text NOT NULL,
    unit_amount bigint NOT NULL,
    type text NOT NULL,
    "interval" text,
    interval_count integer,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT stripe_prices_check CHECK (((type = 'recurring'::text) AND ("interval" = ANY (ARRAY['day'::text, 'week'::text, 'month'::text, 'year'::text])))),
    CONSTRAINT stripe_prices_check1 CHECK (((type = 'recurring'::text) AND (interval_count > 0))),
    CONSTRAINT stripe_prices_type_check CHECK ((type = ANY (ARRAY['one_time'::text, 'recurring'::text])))
);

-- Create stripe_products table
CREATE TABLE IF NOT EXISTS public.stripe_products (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    stripe_product_id text NOT NULL,
    name text NOT NULL,
    description text,
    active boolean DEFAULT true,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Create users table
CREATE TABLE IF NOT EXISTS public.users (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    email text NOT NULL,
    raw_app_meta_data jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Add primary keys
DO $$ BEGIN
    ALTER TABLE ONLY public.archived_orders ADD CONSTRAINT archived_orders_pkey PRIMARY KEY (id);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE ONLY public.chat_participants ADD CONSTRAINT chat_participants_pkey PRIMARY KEY (id);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE ONLY public.group_chats ADD CONSTRAINT group_chats_pkey PRIMARY KEY (id);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE ONLY public.issue_attachments ADD CONSTRAINT issue_attachments_pkey PRIMARY KEY (id);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE ONLY public.manufacturers ADD CONSTRAINT manufacturers_pkey PRIMARY KEY (id);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE ONLY public.message_notifications ADD CONSTRAINT message_notifications_pkey PRIMARY KEY (id);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE ONLY public.message_templates ADD CONSTRAINT message_templates_pkey PRIMARY KEY (id);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE ONLY public.notification_preferences ADD CONSTRAINT notification_preferences_pkey PRIMARY KEY (id);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE ONLY public.order_assignments ADD CONSTRAINT order_assignments_pkey PRIMARY KEY (id);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE ONLY public.order_feedback ADD CONSTRAINT order_feedback_pkey PRIMARY KEY (id);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE ONLY public.order_followups ADD CONSTRAINT order_followups_pkey PRIMARY KEY (id);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE ONLY public.order_issues ADD CONSTRAINT order_issues_pkey PRIMARY KEY (id);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE ONLY public.order_payments ADD CONSTRAINT order_payments_pkey PRIMARY KEY (id);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE ONLY public.order_status_history ADD CONSTRAINT order_status_history_pkey PRIMARY KEY (id);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE ONLY public.sample_assignments ADD CONSTRAINT sample_assignments_pkey PRIMARY KEY (id);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE ONLY public.sample_notifications ADD CONSTRAINT sample_notifications_pkey PRIMARY KEY (id);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE ONLY public.stripe_customers ADD CONSTRAINT stripe_customers_pkey PRIMARY KEY (id);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE ONLY public.stripe_prices ADD CONSTRAINT stripe_prices_pkey PRIMARY KEY (id);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE ONLY public.stripe_products ADD CONSTRAINT stripe_products_pkey PRIMARY KEY (id);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE ONLY public.users ADD CONSTRAINT users_pkey PRIMARY KEY (id);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Enable RLS on all tables
ALTER TABLE public.archived_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.issue_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.manufacturers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_followups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sample_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sample_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stripe_customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stripe_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stripe_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Grant privileges on all tables
GRANT ALL ON TABLE public.archived_orders TO anon;
GRANT ALL ON TABLE public.archived_orders TO authenticated;
GRANT ALL ON TABLE public.archived_orders TO service_role;
GRANT ALL ON TABLE public.chat_participants TO anon;
GRANT ALL ON TABLE public.chat_participants TO authenticated;
GRANT ALL ON TABLE public.chat_participants TO service_role;
GRANT ALL ON TABLE public.group_chats TO anon;
GRANT ALL ON TABLE public.group_chats TO authenticated;
GRANT ALL ON TABLE public.group_chats TO service_role;
GRANT ALL ON TABLE public.issue_attachments TO anon;
GRANT ALL ON TABLE public.issue_attachments TO authenticated;
GRANT ALL ON TABLE public.issue_attachments TO service_role;
GRANT ALL ON TABLE public.manufacturers TO anon;
GRANT ALL ON TABLE public.manufacturers TO authenticated;
GRANT ALL ON TABLE public.manufacturers TO service_role;
GRANT ALL ON TABLE public.message_notifications TO anon;
GRANT ALL ON TABLE public.message_notifications TO authenticated;
GRANT ALL ON TABLE public.message_notifications TO service_role;
GRANT ALL ON TABLE public.message_templates TO anon;
GRANT ALL ON TABLE public.message_templates TO authenticated;
GRANT ALL ON TABLE public.message_templates TO service_role;
GRANT ALL ON TABLE public.notification_preferences TO anon;
GRANT ALL ON TABLE public.notification_preferences TO authenticated;
GRANT ALL ON TABLE public.notification_preferences TO service_role;
GRANT ALL ON TABLE public.order_assignments TO anon;
GRANT ALL ON TABLE public.order_assignments TO authenticated;
GRANT ALL ON TABLE public.order_assignments TO service_role;
GRANT ALL ON TABLE public.order_feedback TO anon;
GRANT ALL ON TABLE public.order_feedback TO authenticated;
GRANT ALL ON TABLE public.order_feedback TO service_role;
GRANT ALL ON TABLE public.order_followups TO anon;
GRANT ALL ON TABLE public.order_followups TO authenticated;
GRANT ALL ON TABLE public.order_followups TO service_role;
GRANT ALL ON TABLE public.order_issues TO anon;
GRANT ALL ON TABLE public.order_issues TO authenticated;
GRANT ALL ON TABLE public.order_issues TO service_role;
GRANT ALL ON TABLE public.order_payments TO anon;
GRANT ALL ON TABLE public.order_payments TO authenticated;
GRANT ALL ON TABLE public.order_payments TO service_role;
GRANT ALL ON TABLE public.order_status_history TO anon;
GRANT ALL ON TABLE public.order_status_history TO authenticated;
GRANT ALL ON TABLE public.order_status_history TO service_role;
GRANT ALL ON TABLE public.sample_assignments TO anon;
GRANT ALL ON TABLE public.sample_assignments TO authenticated;
GRANT ALL ON TABLE public.sample_assignments TO service_role;
GRANT ALL ON TABLE public.sample_notifications TO anon;
GRANT ALL ON TABLE public.sample_notifications TO authenticated;
GRANT ALL ON TABLE public.sample_notifications TO service_role;
GRANT ALL ON TABLE public.stripe_customers TO anon;
GRANT ALL ON TABLE public.stripe_customers TO authenticated;
GRANT ALL ON TABLE public.stripe_customers TO service_role;
GRANT ALL ON TABLE public.stripe_prices TO anon;
GRANT ALL ON TABLE public.stripe_prices TO authenticated;
GRANT ALL ON TABLE public.stripe_prices TO service_role;
GRANT ALL ON TABLE public.stripe_products TO anon;
GRANT ALL ON TABLE public.stripe_products TO authenticated;
GRANT ALL ON TABLE public.stripe_products TO service_role;
GRANT ALL ON TABLE public.users TO anon;
GRANT ALL ON TABLE public.users TO authenticated;
GRANT ALL ON TABLE public.users TO service_role; 