# Maryadha - Premium Leather Sourcing Platform

A web-based platform connecting fashion brands with premium leather manufacturers in India. Built with React Native Web and Expo, it provides a seamless experience for sourcing high-quality leather materials.

## Features

- Browse and filter verified leather manufacturers
- Request samples and track their status
- Manage production orders
- Real-time messaging with manufacturers
- Secure payment processing with Stripe
- Comprehensive order tracking
- WhatsApp integration for communication
- **Email notifications for sample requests** ✨

## Tech Stack

- React Native Web
- Expo SDK 52
- Expo Router 4
- Supabase (Database & Authentication)
- TypeScript
- Stripe Payments
- WhatsApp Business API
- Resend (Email notifications)

## Prerequisites

Before you begin, ensure you have installed:

- Node.js (v18 or later)
- npm (v9 or later)
- Git

## iOS/macOS Setup Notes

If you are developing or running the app on iOS (simulator or device), please follow these additional steps to avoid common issues:

1. **Install Xcode and Command Line Tools**
   - Download Xcode from the Mac App Store.
   - Open Xcode at least once and accept the license agreement.
   - Install the command line tools (if not already):
     ```sh
     xcode-select --install
     ```
   - Set Xcode as the active developer directory:
     ```sh
     sudo xcode-select -s /Applications/Xcode.app/Contents/Developer
     ```
   - Accept the Xcode license:
     ```sh
     sudo xcodebuild -license accept
     ```
   - Ensure at least one iOS Simulator is installed (Xcode > Preferences > Components).

2. **Verify Simulator Tools**
   - Run the following to check if simulator tools are available:
     ```sh
     xcrun simctl help
     ```
   - If you see help text, the tools are working.

3. **Expo Tunnel Dependency**
   - Expo requires `@expo/ngrok` for tunnel mode. Install it locally in your project:
     ```sh
     npm install --save-dev @expo/ngrok
     ```
   - If you see prompts about installing `@expo/ngrok`, installing it locally (not just globally) resolves most issues.

4. **Running the Dev Server**
   - Start the server as usual:
     ```sh
     npm run dev
     ```
   - If you do not need remote device access, you can use LAN mode to avoid tunnel issues:
     ```sh
     npm run dev -- --lan
     ```

5. **Troubleshooting**
   - If you see errors about `xcrun simctl`, ensure Xcode is fully installed, the license is accepted, and the simulator is available.
   - If Expo keeps prompting for `@expo/ngrok`, make sure it is installed as a local dev dependency.
   - Check your Node/npm environment if you have multiple Node installations (e.g., Homebrew, nvm).

## Environment Setup

1. Clone the repository:
```bash
git clone https://github.com/your-username/maryadha-app.git
cd maryadha-app
```

2. Copy the example environment file and update it with your credentials:
```bash
cp .env.example .env
```
Edit `.env` and provide the following values:
- `EXPO_PUBLIC_SUPABASE_URL`: Your Supabase project URL
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anonymous key
- `FCM_SERVER_KEY`: Your Firebase Cloud Messaging server key for push notifications
- `EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY`: Your Stripe publishable key (required for mobile payments)

3. Install dependencies:
```bash
npm install
```

## Development

Start the development server:

```bash
npm run dev
```

This will start the Expo development server and open the app in your default web browser.

## Project Structure

```
maryadha/
├── app/                    # Application routes
│   ├── _layout.tsx        # Root layout
│   ├── auth/              # Authentication routes
│   ├── brand/             # Brand user routes
│   └── rep/               # Rep user routes
├── components/            # Reusable components
│   ├── factory/          # Factory-related components
│   ├── messages/         # Messaging components
│   ├── orders/           # Order management components
│   ├── samples/          # Sample request components
│   └── shared/           # Shared UI components
├── constants/            # App constants
│   ├── Colors.ts        # Color palette
│   └── Typography.ts    # Typography styles
├── hooks/               # Custom React hooks
├── lib/                 # Utility functions
├── supabase/           # Supabase configurations
│   ├── functions/      # Edge functions
│   └── migrations/     # Database migrations
├── types/              # TypeScript type definitions
└── tests/              # Test files
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build:web` - Build for web deployment
- `npm run lint` - Run ESLint
- `npm test` - Run tests

## Database Setup

1. Create a new Supabase project

2. Run the migrations:
```bash
supabase db push
```

3. Set up the following environment variables in your Supabase project:
   - `STRIPE_SECRET_KEY`
   - `STRIPE_WEBHOOK_SECRET`
   - `WHATSAPP_TOKEN`
   - `TWILIO_ACCOUNT_SID`
   - `TWILIO_AUTH_TOKEN`
   - `TWILIO_WHATSAPP_NUMBER`
   - `FACTORY_WHATSAPP_NUMBER`
   - `RESEND_API_KEY` (for email notifications)
   - `APP_URL` (your app's domain for email links)

4. To show a video on a factory profile, upload the founder story video to the
   `videos` storage bucket under the `videos/` folder. The file name should match
   the factory's name (for example `Acme Factory.mp4`).

## Email Notifications Setup

The app includes automatic email notifications for sample requests. When a brand submits a sample request, the assigned rep receives:

- **In-app notification** in their samples page
- **Push notification** (if configured)
- **Email notification** with detailed sample request information

### Setup Instructions

1. **Set up the database**:
   ```bash
   # Run the new migration to add rep_id to factories
   supabase db push
   
   # Set up rep assignments for factories
   node scripts/setup-rep-assignments.js
   ```

2. **Create a Resend account** at [resend.com](https://resend.com)
3. **Get your API key** from the Resend dashboard
4. **Configure environment variables** in your `.env` file:
   - `RESEND_API_KEY`: Your Resend API key
   - `APP_URL`: Your app's domain (e.g., `https://maryadha.com`)
5. **Verify your setup**:
   ```bash
   node scripts/check-env.js
   ```
6. **Test the functionality**:
   ```bash
   node scripts/test-email-notification.js
   ```

For detailed setup instructions, see [docs/email-setup-guide.md](docs/email-setup-guide.md).

### Troubleshooting

If you encounter database relationship errors:

1. **Check your environment variables**:
   ```bash
   node scripts/check-env.js
   ```

2. **Run the setup script** to ensure proper rep assignments:
   ```bash
   node scripts/setup-rep-assignments.js
   ```

3. **Check the migration** was applied:
   ```bash
   supabase db push
   ```

4. **Verify rep assignments** in the database

5. **Test the notification system**:
   ```bash
   node scripts/test-email-notification.js
   ```

## Restoring Local Supabase from a Backup

If you have a backup file (e.g., from Dart or production), follow these steps to restore your local Supabase environment:

1. **Start your local Supabase stack:**
   ```sh
   supabase start
   ```
   If you get a port error, stop any running containers and try again:
   ```sh
   supabase stop
   supabase start
   ```

2. **Place the backup file** (e.g., `backup.sql` or `.backup`) somewhere accessible, such as your `Documents` folder.

3. **Restore the backup to local Supabase:**
   - For a plain SQL file:
     ```sh
     PGPASSWORD=postgres psql -h localhost -p 54322 -U postgres -d postgres -f /path/to/your/backup.sql
     ```
   - For a custom format backup (created with `pg_dump -Fc`):
     ```sh
     PGPASSWORD=postgres pg_restore -h localhost -p 54322 -U postgres -d postgres -c /path/to/your/backup.backup
     ```
   Use `postgres` as the password if prompted.

4. **Update your `.env` file** to point to your local Supabase instance:
   ```env
   SUPABASE_URL=http://localhost:54321
   SUPABASE_ANON_KEY=<your-local-anon-key>
   SUPABASE_SERVICE_ROLE_KEY=<your-local-service-role-key>
   SUPABASE_DB_URL=postgresql://postgres:postgres@localhost:54322/postgres
   ```
   You can find the anon and service role keys in the output of `supabase start`.

5. **Test your local environment:**
   - Use Supabase Studio (`http://localhost:54323`) to browse tables and data.
   - Run your app and verify it connects to local Supabase.
   - Optionally, test with:
     ```sh
     curl -H "apikey: <anon-key>" -H "Authorization: Bearer <anon-key>" "http://localhost:54321/rest/v1/users?select=*"
     # or
     PGPASSWORD=postgres psql -h localhost -p 54322 -U postgres -d postgres -c 'SELECT * FROM users LIMIT 5;'
     ```

6. **Troubleshooting:**
   - If you get port errors, stop all Docker containers and try again.
   - If you get authentication errors, use the correct password (`postgres` by default).
   - If you see schema or permission errors, check that your backup file is complete and compatible.

## Authentication Flow

The app supports two user types:
- Brands: Fashion brands looking to source leather
- Reps: Sourcing experts who facilitate communication

Authentication is handled through Supabase Auth with email/password:
1. User signs up/logs in
2. Role-based redirect to appropriate dashboard
3. Session management with auto-refresh

## Features Documentation

### Factory Discovery
- Browse verified leather manufacturers
- Filter by:
  - Minimum Order Quantity (MOQ)
  - Leather types
  - Tanning processes
  - Finishes
- View detailed factory profiles with:
  - Image galleries
  - Video presentations
  - Certifications
  - Manufacturing capabilities

### Sample Management
- Request samples from factories
- Track sample status
- Provide feedback
- Convert samples to production orders

### Order Processing
- Create production orders
- Track order status
- Manage payments
- Quality control checkpoints
- Shipping tracking

### Communication
- Real-time chat
- WhatsApp integration
- File sharing
- Automated notifications

## User Journeys

For a step-by-step look at how Brands and Reps move through the platform, see [docs/user-journeys.md](docs/user-journeys.md).

To manage sample requests before internal tooling is complete, use the spreadsheet template in
[docs/templates/sample-request-tracking-template.csv](docs/templates/sample-request-tracking-template.csv).
See [docs/sample-request-tracking-guide.md](docs/sample-request-tracking-guide.md) for usage details.


## Deployment

1. Build the project:
```bash
npm run build:web
```