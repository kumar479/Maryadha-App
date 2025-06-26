-- Create custom types needed by other tables

-- Create attachment_type enum
DO $$ BEGIN
    CREATE TYPE "public"."attachment_type" AS ENUM (
        'image',
        'document'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create finish_type enum
DO $$ BEGIN
    CREATE TYPE "public"."finish_type" AS ENUM (
        'Distressed',
        'Matte',
        'Pebbled',
        'Polished',
        'Suede'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create issue_status enum
DO $$ BEGIN
    CREATE TYPE "public"."issue_status" AS ENUM (
        'open',
        'investigating',
        'resolved'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create issue_type enum
DO $$ BEGIN
    CREATE TYPE "public"."issue_type" AS ENUM (
        'quality',
        'delivery',
        'communication'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create leather_type enum
DO $$ BEGIN
    CREATE TYPE "public"."leather_type" AS ENUM (
        'CowHide',
        'LambSkin',
        'GoatSkin'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create order_status enum
DO $$ BEGIN
    CREATE TYPE "public"."order_status" AS ENUM (
        'draft',
        'pending',
        'confirmed',
        'in_production',
        'quality_check',
        'completed',
        'cancelled'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create payment_status enum
DO $$ BEGIN
    CREATE TYPE "public"."payment_status" AS ENUM (
        'pending',
        'partial',
        'paid'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create sample_status enum
DO $$ BEGIN
    CREATE TYPE "public"."sample_status" AS ENUM (
        'requested',
        'in_review',
        'approved',
        'in_production',
        'shipped',
        'delivered',
        'rejected'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create tanning_type enum
DO $$ BEGIN
    CREATE TYPE "public"."tanning_type" AS ENUM (
        'Chrome',
        'Vegetable'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$; 