/**
 * @jest-environment node
 */

const { sendSampleRequestEmail } = require('../supabase/functions/_shared/email.ts');

// Mock environment variables
process.env.RESEND_API_KEY = 'test_key';
process.env.APP_URL = 'https://test.maryadha.com';

// Mock fetch
global.fetch = jest.fn();

describe('Email Notification System', () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  describe('sendSampleRequestEmail', () => {
    it('should send email successfully with valid data', async () => {
      // Mock successful response
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 'test_email_id' }),
      });

      const sampleData = {
        brandName: 'Test Brand',
        factoryName: 'Test Factory',
        productName: 'Leather Wallet',
        quantity: 10,
        preferredMoq: 100,
        deliveryAddress: '123 Test St, Test City',
        comments: 'Test comments',
        finishNotes: 'Test finish notes',
        sampleId: 'test-sample-id',
        appUrl: 'https://test.maryadha.com',
      };

      const result = await sendSampleRequestEmail('test@example.com', sampleData);

      expect(result).toBe(true);
      expect(fetch).toHaveBeenCalledWith('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer test_key',
          'Content-Type': 'application/json',
        },
        body: expect.stringContaining('Test Brand'),
      });
    });

    it('should handle missing API key gracefully', async () => {
      // Temporarily remove API key
      const originalKey = process.env.RESEND_API_KEY;
      delete process.env.RESEND_API_KEY;

      const result = await sendSampleRequestEmail('test@example.com', {
        brandName: 'Test Brand',
        factoryName: 'Test Factory',
        sampleId: 'test-id',
      });

      expect(result).toBe(false);
      expect(fetch).not.toHaveBeenCalled();

      // Restore API key
      process.env.RESEND_API_KEY = originalKey;
    });

    it('should handle API errors gracefully', async () => {
      // Mock error response
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        text: async () => 'Bad Request',
      });

      const result = await sendSampleRequestEmail('test@example.com', {
        brandName: 'Test Brand',
        factoryName: 'Test Factory',
        sampleId: 'test-id',
      });

      expect(result).toBe(false);
      expect(fetch).toHaveBeenCalled();
    });

    it('should handle network errors gracefully', async () => {
      // Mock network error
      fetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await sendSampleRequestEmail('test@example.com', {
        brandName: 'Test Brand',
        factoryName: 'Test Factory',
        sampleId: 'test-id',
      });

      expect(result).toBe(false);
      expect(fetch).toHaveBeenCalled();
    });

    it('should generate email HTML with all sample data', async () => {
      const sampleData = {
        brandName: 'Premium Brand',
        factoryName: 'Quality Factory',
        productName: 'Leather Bag',
        quantity: 5,
        preferredMoq: 50,
        deliveryAddress: '456 Premium Ave, Luxury City',
        comments: 'Please ensure high quality',
        finishNotes: 'Matte finish preferred',
        sampleId: 'premium-sample-123',
        appUrl: 'https://premium.maryadha.com',
      };

      // Mock successful response
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 'email_123' }),
      });

      const result = await sendSampleRequestEmail('rep@maryadha.com', sampleData);

      expect(result).toBe(true);
      
      // Verify the email payload contains all the data
      const callArgs = fetch.mock.calls[0];
      const body = JSON.parse(callArgs[1].body);
      
      expect(body.to).toEqual(['rep@maryadha.com']);
      expect(body.subject).toBe('New Sample Request from Premium Brand');
      expect(body.html).toContain('Premium Brand');
      expect(body.html).toContain('Quality Factory');
      expect(body.html).toContain('Leather Bag');
      expect(body.html).toContain('5');
      expect(body.html).toContain('50');
      expect(body.html).toContain('456 Premium Ave, Luxury City');
      expect(body.html).toContain('Please ensure high quality');
      expect(body.html).toContain('Matte finish preferred');
      expect(body.html).toContain('premium-sample-123');
      expect(body.html).toContain('https://premium.maryadha.com/rep/tabs/samples');
    });

    it('should handle missing optional fields gracefully', async () => {
      // Mock successful response
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 'email_456' }),
      });

      const sampleData = {
        brandName: 'Simple Brand',
        factoryName: 'Simple Factory',
        sampleId: 'simple-sample-456',
      };

      const result = await sendSampleRequestEmail('rep@maryadha.com', sampleData);

      expect(result).toBe(true);
      
      // Verify the email payload handles missing fields
      const callArgs = fetch.mock.calls[0];
      const body = JSON.parse(callArgs[1].body);
      
      expect(body.html).toContain('Simple Brand');
      expect(body.html).toContain('Simple Factory');
      expect(body.html).toContain('Not specified'); // For missing fields
    });
  });
}); 