# Email Notification Setup Guide

This guide will help you set up email notifications for the Maryadha app using Resend.

## Why Resend?

- **Developer-friendly**: Simple API and great documentation
- **Free tier**: 3,000 emails/month free
- **Reliable delivery**: Excellent deliverability rates
- **TypeScript support**: Native TypeScript support
- **Simple integration**: Works well with Supabase Edge Functions

## Step 1: Create a Resend Account

1. Go to [resend.com](https://resend.com)
2. Sign up for a free account
3. Verify your email address

## Step 2: Get Your API Key

1. After logging in, go to the **API Keys** section
2. Click **Create API Key**
3. Give it a name (e.g., "Maryadha Production")
4. Copy the API key (it starts with `re_`)

## Step 3: Verify Your Domain (Optional but Recommended)

For production use, you should verify your domain:

1. Go to **Domains** in your Resend dashboard
2. Click **Add Domain**
3. Add your domain (e.g., `maryadha.com`)
4. Follow the DNS verification steps
5. Wait for verification (usually takes a few minutes)

## Step 4: Configure Supabase Environment Variables

### For Local Development

Create a `.env` file in your project root:

```bash
# Supabase Configuration
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Email Configuration
RESEND_API_KEY=re_your_api_key_here
APP_URL=https://your-app-domain.com

# Optional: Stripe Configuration
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
```

**Note**: The scripts will automatically load from `.env` first, then fall back to `.env.local` if needed.

### For Production (Supabase Dashboard)

1. Go to your Supabase project dashboard
2. Navigate to **Settings** > **Edge Functions**
3. Add the following environment variables:

```
RESEND_API_KEY=re_your_api_key_here
APP_URL=https://your-app-domain.com
```

## Step 5: Verify Environment Setup

Before proceeding, verify that your environment variables are loaded correctly:

```bash
node scripts/check-env.js
```

This script will:
- Check if your `.env` file exists
- Verify all required variables are set
- Display the current values (masking sensitive data)
- Provide next steps

## Step 6: Test the Email Function

### Option 1: Test via Supabase Dashboard

1. Go to **Edge Functions** in your Supabase dashboard
2. Find the `sample-request-notification` function
3. Click **Invoke**
4. Use this test payload:

```json
{
  "sampleId": "your-sample-id-here"
}
```

### Option 2: Test via API

```bash
curl -X POST 'https://your-project.supabase.co/functions/v1/sample-request-notification' \
  -H 'Authorization: Bearer your-anon-key' \
  -H 'Content-Type: application/json' \
  -d '{"sampleId": "your-sample-id-here"}'
```

## Step 7: Monitor Email Delivery

1. Go to your Resend dashboard
2. Check the **Activity** section to see sent emails
3. Monitor delivery rates and bounces

## Email Templates

The app includes a professional email template for sample request notifications. The template includes:

- **Brand and factory information**
- **Product details** (name, quantity, MOQ)
- **Delivery information**
- **Comments and finish notes**
- **Direct link to view the sample request**
- **Responsive design** for mobile and desktop

## Troubleshooting

### Common Issues

1. **"RESEND_API_KEY not configured"**
   - Make sure you've set the environment variable correctly
   - Check that the variable name is exactly `RESEND_API_KEY`

2. **"Email sending failed"**
   - Verify your API key is correct
   - Check that your domain is verified (if using a custom domain)
   - Ensure the recipient email is valid

3. **Emails going to spam**
   - Verify your domain with Resend
   - Set up proper SPF and DKIM records
   - Use a consistent "from" address

### Debugging

Check the Supabase Edge Function logs:

1. Go to **Edge Functions** in your Supabase dashboard
2. Click on the function name
3. Check the **Logs** tab for error messages

## Security Best Practices

1. **Never commit API keys to version control**
2. **Use environment variables** for all sensitive data
3. **Rotate API keys** regularly
4. **Monitor usage** to detect unusual activity
5. **Set up rate limiting** if needed

## Cost Considerations

- **Free tier**: 3,000 emails/month
- **Paid plans**: Start at $20/month for 50,000 emails
- **Monitor usage** in your Resend dashboard

## Alternative Email Providers

If you prefer a different email provider:

### SendGrid
- More features but more complex setup
- Good for high-volume sending
- More expensive for small volumes

### Mailgun
- Good for developers
- Competitive pricing
- Requires more setup

### AWS SES
- Very cost-effective
- Requires AWS setup
- More complex configuration

## Support

- **Resend Documentation**: [docs.resend.com](https://docs.resend.com)
- **Resend Support**: [support.resend.com](https://support.resend.com)
- **Supabase Edge Functions**: [supabase.com/docs/guides/functions](https://supabase.com/docs/guides/functions) 