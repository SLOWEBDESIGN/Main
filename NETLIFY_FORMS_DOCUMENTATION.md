# Netlify Forms Documentation

Setup and integration of Netlify Forms for the contact form.

## Overview

The website uses Netlify Forms to handle contact form submissions without a backend.

- **Form name**: `contact`
- **Fields**: 10 (Name, Business, Email, Phone, Website, Type, Budget, Services, Description, Contact Method)
- **Spam protection**: Built-in CAPTCHA and rate limiting
- **Notifications**: Email to contact@slowebdesign.com

## How It Works

### Form Detection

Netlify automatically detects forms with the `netlify` attribute:

```jsx
<form name="contact" method="POST" netlify>
  {/* Form fields */}
</form>
```

### Form Submission Flow

1. User fills form on website
2. Form submits via HTTP POST
3. Netlify intercepts and stores submission
4. Success/error message shows to user
5. Email notification sent to you

## Setup Steps

### Step 1: Deploy to Netlify

Forms only work on deployed sites, not localhost.

```bash
# Build locally first
npm run build

# Then deploy to Netlify
netlify deploy --prod
```

### Step 2: Wait for Detection

After first deployment:
1. Netlify scans for forms with `netlify` attribute
2. Forms appear in Netlify dashboard within 5 minutes
3. Go to **Site Settings** → **Forms**

### Step 3: Verify Form Appears

1. Open Netlify dashboard
2. Click on your site
3. Go to **Forms** tab
4. You should see "contact" form listed

If form doesn't appear:
- Ensure form has `name="contact"` attribute
- Ensure form has `netlify` attribute  
- Redeploy: `git push origin main`
- Wait 5 minutes

### Step 4: Set Up Email Notifications

1. Go to **Forms** tab
2. Click on "contact" form
3. Scroll to "Form notifications"
4. Add recipient email: contact@slowebdesign.com
5. Choose notification format (plaintext or HTML)
6. Save

### Step 5: Test Form

1. Go to website
2. Fill out contact form with test data
3. Click "Send Message"
4. You should see success message
5. Check **Submissions** tab in Netlify Forms
6. Check email for notification

## Form Fields

The contact form includes these fields:

| Field | Type | Required |
|-------|------|----------|
| Full Name | Text | Yes |
| Business Name | Text | Yes |
| Email | Email | Yes |
| Phone Number | Tel | Yes |
| Website URL | URL | No |
| Business Type | Select | Yes |
| Budget Range | Select | Yes |
| Services Needed | Select | Yes |
| Project Description | Textarea | Yes |
| Contact Method | Radio | Yes |

### Business Type Options
- Retail
- Service
- Professional Services
- E-commerce
- Non-profit
- Other

### Budget Range Options
- Under $1,500
- $1,500 - $2,500
- $2,500 - $5,000
- $5,000 - $10,000
- $10,000+

### Services Needed Options
- Website Modernization
- Custom Website Development
- Landing Page
- Website Maintenance
- Multiple Services
- Not Sure Yet

### Contact Method Options
- Email
- Phone
- Both

## View Submissions

### In Netlify Dashboard

1. Go to your site dashboard
2. Click **Forms** tab
3. Click "contact" form name
4. View all submissions with:
   - Submission date/time
   - All field values
   - User agent (browser/device info)

### Export Submissions

1. Click "contact" form
2. Look for export option (CSV, JSON)
3. Download submissions data

## Spam Protection

### Built-in Protection

Netlify provides:
- CAPTCHA challenges (when needed)
- Rate limiting
- Bot detection
- Honeypot field

### Add Honeypot Field

Honeypot is a hidden field that catches bots:

```jsx
<input
  type="hidden"
  name="bot-field"
  style={{ display: 'none' }}
/>
```

To add to contact form, update `src/components/ContactForm.tsx`:

```jsx
<form name="contact" method="POST" netlify>
  <input type="hidden" name="bot-field" />
  {/* ... other fields */}
</form>
```

### Enable CAPTCHA

1. In **Forms** tab
2. Click "contact" form
3. Click **Settings**
4. Toggle "Spam Filtering"
5. Choose challenge type

## Advanced Configuration

### Custom Success Page

After form submission, redirect to success page:

```jsx
<form name="contact" action="/success" netlify>
```

Create `src/pages/success.tsx`:

```typescript
export default function SuccessPage() {
  return (
    <div>
      <h1>Thank You!</h1>
      <p>We'll get back to you within 24 hours.</p>
    </div>
  );
}
```

### reCAPTCHA Integration

Enable reCAPTCHA for extra protection:

1. Get reCAPTCHA key from https://www.google.com/recaptcha/admin
2. In Netlify Forms settings, add reCAPTCHA key
3. Add to form:

```jsx
<div
  className="g-recaptcha"
  data-sitekey="YOUR_RECAPTCHA_KEY"
></div>
```

## Troubleshooting

### Form Not Appearing in Dashboard

**Issue**: Form doesn't appear in Netlify Forms tab

**Solutions**:
- [ ] Verify form has `name="contact"` attribute
- [ ] Verify form has `netlify` attribute
- [ ] Redeploy to Netlify: `git push origin main`
- [ ] Wait 5 minutes
- [ ] Clear browser cache
- [ ] Check form in deployed site (not localhost)

### Form Submissions Not Working

**Issue**: Form submits but no success message

**Solutions**:
- [ ] Check form submission in Network tab (F12)
- [ ] Look for 200 status response from Netlify
- [ ] Check browser console for errors
- [ ] Verify HTTPS is enabled (https://yoursite.com)
- [ ] Check form method is POST
- [ ] Verify form fields have `name` attributes

### Not Receiving Email Notifications

**Issue**: Form submits but no email received

**Solutions**:
- [ ] Check email address is correct in Netlify Forms settings
- [ ] Check spam folder
- [ ] Verify notifications are enabled for form
- [ ] Create test submission manually in Netlify dashboard
- [ ] Check email filtering rules

### Getting Spam Submissions

**Issue**: Too many bot submissions

**Solutions**:
- [ ] Add honeypot field (see above)
- [ ] Enable CAPTCHA in Netlify Forms settings
- [ ] Enable reCAPTCHA integration
- [ ] Add rate limiting rules
- [ ] Monitor and block suspicious patterns

## Advanced Features

### Form Analytics

Netlify automatically tracks:
- Submission count
- Spam blocked
- Submission rate
- Field completion rates

View in **Submissions** tab:
1. Click form
2. Scroll to analytics section
3. View charts and statistics

### Webhooks

Set up webhooks to trigger actions when form submits:

1. Go to **Site Settings** → **Functions**
2. Create Netlify Function
3. Configure to trigger on form submission

Example: Send Slack notification

```javascript
// netlify/functions/contact-form.js
export const handler = async (event) => {
  const payload = JSON.parse(event.body).payload;
  
  // Send to Slack, email service, etc.
  
  return { statusCode: 200 };
};
```

### Netlify Functions

Create backend functions for form processing:

```javascript
// netlify/functions/submit-form.js
export const handler = async (event, context) => {
  const formData = JSON.parse(event.body);
  
  // Process form data
  // Send to external service
  // Store in database
  
  return {
    statusCode: 200,
    body: JSON.stringify({ success: true }),
  };
};
```

## Alternatives & Integrations

### Connect to CRM

Send form submissions to:
- Salesforce
- HubSpot
- Mailchimp
- Zapier

### Email Services

Integrate with:
- SendGrid
- Mailgun
- AWS SES
- Nodemailer

### SMS Notifications

Send SMS to your phone:
- Use Zapier + SMS service
- Create Netlify Function with Twilio

## Best Practices

1. **Keep it Simple**: Don't ask for too many fields
2. **Progressive Profiling**: Ask for data gradually
3. **Clear Labels**: Make field labels clear and concise
4. **Validation**: Validate on front-end and back-end
5. **Accessibility**: Label all form fields properly
6. **Error Messages**: Provide clear error feedback
7. **Success Message**: Confirm submission was successful
8. **Privacy**: Link to privacy policy on form

## Form Optimization

### Increase Completion Rate

- Minimize required fields
- Use single-column layout
- Large clickable buttons
- Clear success messages
- Estimated time to complete

### Mobile Optimization

- Responsive form layout
- Large input fields (48px minimum)
- Mobile-friendly validation
- Mobile number input (tel type)
- Avoid dropdown fields if possible

### Accessibility

```jsx
<label htmlFor="name">Full Name *</label>
<input
  id="name"
  type="text"
  name="name"
  required
  aria-required="true"
  aria-describedby="name-help"
/>
```

## Monitoring & Maintenance

### Weekly
- [ ] Check for new submissions
- [ ] Review submission data
- [ ] Look for patterns in questions

### Monthly
- [ ] Export submissions as backup
- [ ] Review spam/blocked submissions
- [ ] Check email notification delivery

### Quarterly
- [ ] Update form fields if needed
- [ ] Review form questions
- [ ] A/B test form copy

## Resources

- Netlify Forms Documentation: https://docs.netlify.com/forms/setup
- Form Best Practices: https://www.smashingmagazine.com/2022/09/inline-validation-web-forms-ux
- Accessibility: https://www.w3.org/WAI/tutorials/forms

---

Last updated: 2024
