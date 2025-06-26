# Factory Navigation Fix

## Issue Description
The rep side was unable to access factory details pages. When clicking on a factory card, it would redirect to the Dashboard page instead of navigating to the factory details page.

## Root Cause
The `FactoryCard` component had a hardcoded navigation path that always directed to the brand route (`/brand/tabs/factories/${factory.id}`), regardless of whether it was being used in the brand or rep context.

## Fixes Implemented

### 1. Updated FactoryCard Component
**File:** `components/factory/FactoryCard.tsx`

- Added an optional `onPress` prop to the `FactoryCardProps` interface
- Modified the `handlePress` function to use the custom `onPress` handler when provided, otherwise fall back to the default brand navigation
- Added `testID` for testing purposes
- Fixed linter error with ImageError component

### 2. Updated Rep Factory Profiles Page
**File:** `app/rep/tabs/factoryProfiles/index.tsx`

- Modified the `FactoryCard` usage to pass the `handleFactoryPress` function as the `onPress` prop
- Removed the `TouchableOpacity` wrapper since the `FactoryCard` now handles its own navigation
- Added debugging console.log to track navigation calls

### 3. Improved Error Handling in Factory Details Page
**File:** `app/rep/tabs/factoryProfiles/[id].tsx`

- Enhanced error handling in the `loadFactory` function
- Removed automatic redirects on database errors to allow the UI to show error states
- Added debugging console.log statements to track factory loading
- Added null check for factory data

### 4. Fixed Tab Index Redirect
**File:** `app/rep/tabs/index.tsx`

- Updated the redirect path from `/rep/tabs/home/index` to `/rep/tabs/home` to match the tab layout configuration

## Testing
Created a test file `tests/factory-navigation.test.tsx` to verify:
- Default navigation to brand route when no custom handler is provided
- Custom navigation handler is called when provided

## How It Works Now

### For Brand Users
- FactoryCard components work as before, navigating to `/brand/tabs/factories/${factory.id}`
- No changes to existing brand functionality

### For Rep Users
- FactoryCard components in rep context receive a custom `onPress` handler
- Clicking on a factory card navigates to `/rep/tabs/factoryProfiles/${factory.id}`
- Factory details page loads and displays factory information
- Reps can edit factory information and navigate back to the factory list

## Files Modified
1. `components/factory/FactoryCard.tsx` - Added custom navigation support
2. `app/rep/tabs/factoryProfiles/index.tsx` - Updated to use custom navigation
3. `app/rep/tabs/factoryProfiles/[id].tsx` - Improved error handling
4. `app/rep/tabs/index.tsx` - Fixed redirect path
5. `tests/factory-navigation.test.tsx` - Added navigation tests

## Verification Steps
1. Log in as a rep user
2. Navigate to the Factories tab
3. Click on any factory card
4. Verify that the factory details page loads correctly
5. Verify that the back button returns to the factory list
6. Verify that editing functionality works correctly 