# Sample Tracking Fix - ETA and Tracking Number Visibility

## Issue Description

The Manual Order Tracking Panel allowed reps to update key delivery metadata for sample orders requests, but the Estimated Delivery Date and Tracking Number entered by reps were not showing up on the brand-facing timeline, which broke the intended visibility and communication flow.

## Root Cause

The issue was caused by a missing database table and improper data mapping:

1. **Missing Database Table**: The `sample_status_history` table didn't exist in the database, but the code was trying to insert and query from it.

2. **Missing Columns**: The table schema didn't include `eta` and `tracking_number` columns that were needed to store the delivery information.

3. **Data Mapping Issue**: When loading history data from the database, the field names weren't properly mapped from the database schema (`eta`, `tracking_number`) to the TypeScript interface (`eta`, `trackingNumber`).

## Solution Implemented

### 1. Database Migration

Created migration `20250703000000_create_sample_status_history.sql` that:

- Creates the `sample_status_history` table with required columns:
  - `id` (uuid, primary key)
  - `sample_id` (uuid, foreign key to samples)
  - `status` (text)
  - `notes` (text, nullable)
  - `eta` (date, nullable)
  - `tracking_number` (text, nullable)
  - `created_at` (timestamptz)

- Adds proper foreign key constraints and indexes
- Enables Row Level Security (RLS) with appropriate policies for brands and reps

### 2. TypeScript Type Updates

Updated `types/supabase.ts` to include the new columns in the `sample_status_history` table schema:

```typescript
sample_status_history: {
  Row: {
    // ... existing fields
    eta: string | null;
    tracking_number: string | null;
  };
  Insert: {
    // ... existing fields
    eta?: string | null;
    tracking_number?: string | null;
  };
  Update: {
    // ... existing fields
    eta?: string | null;
    tracking_number?: string | null;
  };
}
```

### 3. Data Mapping Fix

Fixed the data loading functions in both rep and brand sample detail screens to properly map database fields to the `SampleStatusUpdate` interface:

```typescript
// Map database fields to SampleStatusUpdate interface
const mappedHistory = (historyData || []).map((item: any) => ({
  id: item.id,
  sampleId: item.sample_id,
  status: item.status as SampleStatusUpdate['status'],
  notes: item.notes,
  eta: item.eta,
  trackingNumber: item.tracking_number, // Map from snake_case to camelCase
  createdAt: item.created_at,
}));
```

### 4. Component Verification

The `SampleTimeline` component already had the correct logic to display ETA and tracking information:

```typescript
{update?.eta && (
  <Text style={[Typography.caption, styles.dateText]}>
    ETA: {new Date(update.eta).toLocaleDateString()}
  </Text>
)}
{update?.trackingNumber && (
  <Text style={[Typography.caption, styles.noteText]}>
    Tracking: {update.trackingNumber}
  </Text>
)}
```

## Files Modified

### Database Migrations
- `Maryadha-app/supabase/migrations/20250703000000_create_sample_status_history.sql`
- `Maryadha-app-no-web/supabase/migrations/20250703000000_create_sample_status_history.sql`

### TypeScript Types
- `Maryadha-app/types/supabase.ts`
- `Maryadha-app-no-web/types/supabase.ts`

### Sample Detail Screens
- `Maryadha-app/app/rep/tabs/samples/[id]/index.tsx`
- `Maryadha-app/app/brand/tabs/samples/[id]/index.tsx`
- `Maryadha-app-no-web/app/rep/tabs/samples/[id]/index.tsx`
- `Maryadha-app-no-web/app/brand/tabs/samples/[id]/index.tsx`

### Tests
- `Maryadha-app/tests/sample-timeline.test.tsx`

## Testing

Created comprehensive tests to verify:

1. Timeline displays all stages correctly
2. ETA information is shown when provided
3. Tracking number is displayed when provided
4. Notes are shown correctly
5. Creation dates are displayed
6. Handles empty updates gracefully
7. Handles updates without ETA/tracking gracefully

## Deployment Steps

1. Run the database migration:
   ```bash
   supabase db push
   ```

2. Deploy the updated application code

3. Verify that reps can now enter ETA and tracking numbers in the sample status update form

4. Verify that brands can see the ETA and tracking information in the sample timeline

## Acceptance Criteria Met

✅ Estimated Delivery Date entered by rep is visible to the brand  
✅ Tracking Number entered by rep is also visible to the brand  
✅ Both fields appear in the correct stage of the sample timeline  
✅ Information persists and is accessible across sessions/devices  
✅ Fields are displayed in a clear, readable format for the brand  

## Future Improvements

1. Add validation for ETA date format
2. Add clickable tracking numbers that open shipping carrier websites
3. Add email notifications when tracking information is updated
4. Add bulk status update functionality for reps 