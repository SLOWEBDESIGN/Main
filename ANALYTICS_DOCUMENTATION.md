# Analytics Documentation

Setup and usage of Google Analytics for SLO Web Design website.

## Google Analytics Setup

### Current Configuration

- **Tracking ID**: G-3SD2928MVG
- **Property**: SLO Web Design
- **Measurement ID**: G-3SD2928MVG

### Verify Analytics is Working

1. Go to https://analytics.google.com
2. Sign in with Google account
3. Select "SLO Web Design" property
4. Go to **Real-time** tab
5. Open website in another tab
6. You should see traffic appear in real-time within seconds

### Environment Variable

Analytics is configured via environment variable:

```env
NEXT_PUBLIC_GA_ID=G-3SD2928MVG
```

This is loaded in:
- `src/pages/_document.tsx` - Loads GA script globally
- `src/lib/analytics.ts` - Provides tracking functions

## Tracking Implementation

### Page Views

Automatically tracked via Next.js Router:

```typescript
// src/pages/_app.tsx
router.events.on('routeChangeComplete', handleRouteChange);
```

### Custom Events

The site includes built-in analytics functions in `src/lib/analytics.ts`:

```typescript
import * as gtag from '@/src/lib/analytics';

// Track page view
gtag.pageview(url);

// Track custom event
gtag.event('button_click', 'engagement', 'CTA Button');
```

### Add Event Tracking

Example: Track "Schedule Consultation" clicks

```typescript
// In src/components/Header.tsx
const handleConsultationClick = () => {
  gtag.event('consultation_scheduled', 'button_click', 'Header');
  scrollToSection('calendly');
};
```

## Analytics Metrics

### Key Metrics to Monitor

1. **Users**: Unique visitors to your site
2. **Sessions**: Individual visits (includes returning users)
3. **Pageviews**: Total page views
4. **Bounce Rate**: % of sessions with single pageview
5. **Avg. Session Duration**: Average time per session
6. **Conversion Rate**: % of sessions that complete goal

### Goals

Set up goals to track important actions:

1. Go to **Admin** → **Goals**
2. Create goal for:
   - Form submissions
   - Calendly bookings
   - Stripe link clicks
   - Newsletter signups

### Conversions Setup

Example: Track contact form submissions

1. Go to **Admin** → **Goals**
2. Click **+ Create Goal**
3. Select **Event** as goal type
4. Set event name: `contact_form_submitted`
5. Click Create

Then track the event in `ContactForm.tsx`:

```typescript
const handleFormSubmit = async (e) => {
  // ... submit form
  gtag.event('contact_form_submitted', 'form', 'Contact Form');
};
```

## Dashboard & Reports

### Pre-built Reports

1. **Real-time**: Live traffic
2. **User Summary**: Overview of users and sessions
3. **Acquisition**: Where users come from (organic, direct, referral)
4. **Engagement**: How users interact with site
5. **Monetization**: Revenue data (if applicable)
6. **Retention**: Returning user patterns

### Custom Reports

Create custom reports:

1. Go to **Reports** (left sidebar)
2. Click **Create** button
3. Add dimensions and metrics
4. Save report

### Segments

Analyze specific user groups:

1. Go to **Segments** (left sidebar)
2. Create segment:
   - Desktop vs. mobile users
   - Direct vs. organic traffic
   - New vs. returning users

## Traffic Analysis

### Understand Your Traffic

1. **Organic Search**: Users from Google search
   - See Google Search Console data here
   - Monitor rankings and keywords

2. **Direct**: Users who typed URL or used bookmarks
   - Indicates brand awareness
   - High direct = good sign

3. **Referral**: Users from other websites
   - Track which sites refer traffic
   - Build more backlinks from referrers

4. **Social**: Users from social media (if shared)

5. **Email**: Users from email campaigns

### Top Pages

See which pages get most traffic:

1. Go to **Pages and Screens**
2. Sort by **Users** or **Sessions**
3. Analyze:
   - Which pages attract visitors?
   - Which pages have high bounce rate?
   - Which pages drive conversions?

### User Behavior

Understand how users navigate:

1. Go to **Pages and Screens**
2. Select page
3. View:
   - Where users came from
   - Where they went next
   - Time on page
   - Scroll depth (if configured)

## Conversion Tracking

### Setup Conversion Events

Track important actions:

1. **Form Submission**
   ```typescript
   gtag.event('form_submission', 'form', 'contact_form');
   ```

2. **Calendly Booking**
   ```typescript
   gtag.event('calendly_booking', 'engagement', 'booking');
   ```

3. **Stripe Link Click**
   ```typescript
   gtag.event('stripe_link_clicked', 'transaction', 'pricing');
   ```

4. **CTA Click**
   ```typescript
   gtag.event('cta_clicked', 'engagement', 'schedule_consultation');
   ```

### Monitor Conversions

1. Go to **Conversions** → **Conversion Events**
2. View event count and conversion rate
3. Drill down to understand:
   - Which pages drive conversions?
   - Which traffic sources convert best?
   - What's your conversion rate?

### Calculate ROI

If you have Stripe integration:

1. Track Stripe link clicks
2. Correlate with Stripe reports
3. Calculate ROI on marketing efforts

## Mobile vs. Desktop

Analyze performance by device:

1. Go to **Reports** → **Device**
2. Compare:
   - Users by device type
   - Bounce rate
   - Avg. session duration
   - Conversion rate

### Mobile Optimization

If bounce rate is high on mobile:
- Check Lighthouse mobile score
- Test on actual devices
- Review mobile usability in Google Search Console
- Optimize images and fonts for mobile

## Geographic Analysis

Understand where your users are:

1. Go to **Location**
2. Filter by:
   - Country
   - Region (State)
   - City

## Audience Insights

### Demographics

See information about:
- Age groups
- Gender
- Interest categories

Note: Limited unless you've enabled demographic and interest reports.

### New vs. Returning

Compare behavior:

1. **New Users**: First-time visitors
   - Higher bounce rate (normal)
   - Shorter session duration
   - Lower conversion rate

2. **Returning Users**: Repeat visitors
   - Lower bounce rate
   - Longer sessions
   - Higher conversion rate

## Alerts & Notifications

### Set Up Alerts

1. Go to **Admin** → **Alerts**
2. Create alert for:
   - Sudden traffic spike/drop
   - Low conversion rate
   - High bounce rate

3. Get notified via email

## Troubleshooting Analytics

### No Data Showing

1. Check tracking ID is correct
2. Verify `NEXT_PUBLIC_GA_ID` in .env.local
3. Open DevTools (F12) → Console
4. Type: `gtag` and press Enter
5. Should see gtag function
6. Open Network tab and look for `collect` requests to Google
7. Wait 24-48 hours for data to appear

### Events Not Tracking

1. Verify event code is in place
2. Check event name matches in Analytics
3. Test in DevTools Console:
   ```javascript
   gtag('event', 'test_event');
   ```
4. Check Real-time reports
5. Wait 24 hours for events to appear in reports

### Conversion Rate is 0%

1. Ensure goals/events are set up correctly
2. Verify events are firing (check Real-time)
3. Give it 24-48 hours for data to populate
4. Check event name matches exactly

## Best Practices

1. **Track Important Actions**: Form submissions, CTA clicks, bookings
2. **Use Consistent Naming**: Name events consistently (snake_case)
3. **Test Before Launch**: Verify tracking works before deployment
4. **Review Monthly**: Check analytics monthly
5. **Set Goals**: Define what success looks like
6. **Use Segments**: Analyze specific user groups
7. **Monitor Core Metrics**: Focus on key performance indicators
8. **Privacy**: Ensure compliance with GDPR, CCPA, etc.

## Privacy & Compliance

### GDPR Compliance

If targeting EU users:
1. Disable data collection before consent
2. Add cookie consent banner
3. Allow users to opt-out

### CCPA Compliance

If targeting California users:
1. Privacy policy mentioning Google Analytics
2. Allow users to opt-out
3. Don't track if user opts out

### Privacy Policy

Include Google Analytics in privacy policy:

> "We use Google Analytics to understand how users interact with our website. Google Analytics sets cookies and collects device identifiers. For more information, see [Google Analytics Privacy](https://policies.google.com/privacy)."

## Resources

- Google Analytics Help: https://support.google.com/analytics
- Google Analytics Docs: https://developers.google.com/analytics/devguides/collection/ga4
- Conversion Tracking: https://support.google.com/google-ads/answer/3438521
- Google Search Console: https://search.google.com/search-console

---

Last updated: 2024
