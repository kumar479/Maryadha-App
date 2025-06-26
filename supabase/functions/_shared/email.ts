export interface EmailData {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

export interface SampleRequestEmailData {
  brandName: string;
  factoryName: string;
  productName?: string;
  quantity?: number;
  preferredMoq?: number;
  deliveryAddress?: string;
  comments?: string;
  finishNotes?: string;
  sampleId: string;
  appUrl?: string;
}

export const sendEmail = async (emailData: EmailData): Promise<boolean> => {
  const resendApiKey = Deno.env.get('RESEND_API_KEY');
  
  if (!resendApiKey) {
    console.warn('RESEND_API_KEY not configured, skipping email notification');
    return false;
  }

  const payload = {
    from: emailData.from || 'Maryadha <notifications@maryadha.com>',
    to: [emailData.to],
    subject: emailData.subject,
    html: emailData.html,
  };

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Email sending failed:', response.status, errorText);
      return false;
    }

    const result = await response.json();
    console.log('Email sent successfully:', result.id);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
};

export const generateSampleRequestEmailHtml = (data: SampleRequestEmailData): string => {
  const appUrl = data.appUrl || Deno.env.get('APP_URL') || 'https://maryadha.com';
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>New Sample Request</title>
      <style>
        body { 
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
          line-height: 1.6; 
          color: #333; 
          margin: 0; 
          padding: 0; 
          background-color: #f8f9fa; 
        }
        .container { 
          max-width: 600px; 
          margin: 0 auto; 
          background-color: #ffffff; 
          box-shadow: 0 2px 10px rgba(0,0,0,0.1); 
        }
        .header { 
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
          color: white; 
          padding: 30px 20px; 
          text-align: center; 
        }
        .header h1 { 
          margin: 0; 
          font-size: 24px; 
          font-weight: 600; 
        }
        .header p { 
          margin: 10px 0 0 0; 
          opacity: 0.9; 
        }
        .content { 
          padding: 30px 20px; 
        }
        .details { 
          background: #f8f9fa; 
          border-radius: 8px; 
          padding: 20px; 
          margin: 20px 0; 
        }
        .detail-row { 
          display: flex; 
          margin-bottom: 12px; 
          align-items: flex-start; 
        }
        .detail-row:last-child { 
          margin-bottom: 0; 
        }
        .label { 
          font-weight: 600; 
          color: #495057; 
          min-width: 140px; 
          flex-shrink: 0; 
        }
        .value { 
          color: #212529; 
          flex: 1; 
        }
        .cta-container { 
          text-align: center; 
          margin: 30px 0; 
        }
        .cta { 
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
          color: white; 
          padding: 15px 30px; 
          text-decoration: none; 
          border-radius: 8px; 
          display: inline-block; 
          font-weight: 600; 
          transition: transform 0.2s ease; 
        }
        .cta:hover { 
          transform: translateY(-2px); 
        }
        .footer { 
          background: #f8f9fa; 
          padding: 20px; 
          text-align: center; 
          border-top: 1px solid #e9ecef; 
        }
        .footer p { 
          margin: 5px 0; 
          font-size: 14px; 
          color: #6c757d; 
        }
        .highlight { 
          background: #fff3cd; 
          border: 1px solid #ffeaa7; 
          border-radius: 4px; 
          padding: 10px; 
          margin: 15px 0; 
        }
        @media (max-width: 600px) {
          .detail-row { 
            flex-direction: column; 
            margin-bottom: 15px; 
          }
          .label { 
            min-width: auto; 
            margin-bottom: 5px; 
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎯 New Sample Request</h1>
          <p>A brand has submitted a new sample request for your factory</p>
        </div>
        
        <div class="content">
          <div class="highlight">
            <strong>Action Required:</strong> Please review this sample request and take appropriate action.
          </div>
          
          <div class="details">
            <div class="detail-row">
              <span class="label">Brand:</span>
              <span class="value">${data.brandName}</span>
            </div>
            <div class="detail-row">
              <span class="label">Factory:</span>
              <span class="value">${data.factoryName}</span>
            </div>
            <div class="detail-row">
              <span class="label">Product Name:</span>
              <span class="value">${data.productName || 'Not specified'}</span>
            </div>
            <div class="detail-row">
              <span class="label">Quantity:</span>
              <span class="value">${data.quantity || 'Not specified'}</span>
            </div>
            <div class="detail-row">
              <span class="label">Preferred MOQ:</span>
              <span class="value">${data.preferredMoq || 'Not specified'}</span>
            </div>
            <div class="detail-row">
              <span class="label">Delivery Address:</span>
              <span class="value">${data.deliveryAddress || 'Not specified'}</span>
            </div>
            ${data.comments ? `
            <div class="detail-row">
              <span class="label">Comments:</span>
              <span class="value">${data.comments}</span>
            </div>
            ` : ''}
            ${data.finishNotes ? `
            <div class="detail-row">
              <span class="label">Finish Notes:</span>
              <span class="value">${data.finishNotes}</span>
            </div>
            ` : ''}
          </div>
          
          <div class="cta-container">
            <a href="${appUrl}/rep/tabs/samples" class="cta">
              View Sample Request
            </a>
          </div>
        </div>
        
        <div class="footer">
          <p>This notification was sent automatically by the Maryadha platform.</p>
          <p>Sample Request ID: ${data.sampleId}</p>
          <p>If you have any questions, please contact support.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

export const sendSampleRequestEmail = async (
  to: string, 
  sampleData: SampleRequestEmailData
): Promise<boolean> => {
  const html = generateSampleRequestEmailHtml(sampleData);
  
  return await sendEmail({
    to,
    subject: `New Sample Request from ${sampleData.brandName}`,
    html,
  });
}; 