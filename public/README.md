# Next.js Public Assets

This folder contains static assets served by the Next.js application.

## Folder Structure

```
public/
├── comparison/
│   ├── before.svg          # Placeholder: outdated website design
│   └── after.svg           # Placeholder: modernized website design
├── favicon.ico             # Favicon (32x32)
├── apple-touch-icon.png    # Apple touch icon (180x180)
└── site.webmanifest        # PWA manifest
```

## Asset Guidelines

### Images

- **Format**: PNG, JPG, WEBP
- **Compression**: Optimize with TinyPNG or similar
- **Dimensions**: 
  - Favicon: 32x32px
  - Apple touch icon: 180x180px
  - Comparison images: 1200x800px (recommended)

### Comparison Images

Replace the placeholder SVG files with your own images:

1. Delete `public/comparison/before.svg` and `public/comparison/after.svg`
2. Add `public/comparison/before.png` (or .jpg)
3. Add `public/comparison/after.png` (or .jpg)

Images are referenced in `src/components/ImageComparison.tsx`:

```jsx
<img src="/comparison/before.png" alt="Outdated website" />
<img src="/comparison/after.png" alt="Modernized website" />
```

### Naming Conventions

- Use lowercase for file names
- Use hyphens instead of spaces: `my-image.png`
- Use descriptive names: `before.png`, `after.png`
- Avoid special characters

### Caching

All assets in `/public` are cached with long-term cache headers (1 year):

```
Cache-Control: public, max-age=31536000, immutable
```

This means:
- Updated assets need new file names
- Old files can be safely removed
- CDN will cache aggressively

### Performance Tips

1. **Compress images**: Use TinyPNG, ImageOptim, or Squoosh
2. **Use modern formats**: WebP provides better compression
3. **Right-size images**: Don't upload oversized images
4. **Lazy load**: Images use `loading="lazy"` in HTML
5. **Responsive**: Images scale based on viewport

## Manifest File

`site.webmanifest` configures PWA settings:

- App name and icon
- Theme colors
- Display mode

Edit to match your branding.

## Icons

Create these icons for your site:

- `favicon.ico` - 32x32 (tab icon)
- `apple-touch-icon.png` - 180x180 (iPhone/iPad home screen)
- `android-chrome-192x192.png` - 192x192 (Android home screen)

Services to generate icons:
- https://realfavicongenerator.net
- https://favicon.io
- https://www.favicon-generator.org

---

Last updated: 2024
