exports.handler = async (event) => {
  // Only accept POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    // Parse form data from URL-encoded body
    const params = new URLSearchParams(event.body || '');

    // Honeypot spam protection - if filled, silently accept (don't submit)
    if (params.get('bot-field')) {
      return {
        statusCode: 200,
        body: JSON.stringify({ success: true }),
      };
    }

    // Extract and validate required fields
    const formData = {
      'form-name': 'contact',
      name: params.get('name') || '',
      business: params.get('business') || '',
      email: params.get('email') || '',
      phone: params.get('phone') || '',
      website: params.get('website') || '',
      businessType: params.get('businessType') || '',
      budget: params.get('budget') || '',
      services: params.get('services') || '',
      description: params.get('description') || '',
      contactMethod: params.get('contactMethod') || '',
    };

    // Validate required fields
    const required = ['name', 'business', 'email', 'phone', 'businessType', 'budget', 'services', 'description', 'contactMethod'];
    const missing = required.filter(field => !formData[field]);

    if (missing.length > 0) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: 'Missing required fields',
          missing
        }),
      };
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Invalid email address' }),
      };
    }

    // Log submission for debugging
    console.log('Contact form submission received:', {
      timestamp: new Date().toISOString(),
      form: 'contact',
      email: formData.email,
      business: formData.business,
      name: formData.name,
    });

    // Return success response to frontend
    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        message: 'Thank you! We received your message and will respond within 24 hours.',
      }),
    };
  } catch (error) {
    console.error('Form submission error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Failed to submit form. Please try again.'
      }),
    };
  }
};
