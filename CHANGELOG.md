# Changelog

All notable changes to this project will be documented in this file.

## 2025-05-12

- Ensured full-page Vanta canvas:
  - Set `.hero-section` height to `100vh` in `HeroSection.css`.
  - Added `height: 100%` to `html` rule in `App.css`.
- Corrected Vanta canvas positioning:
  - Removed global `padding-top` from `body` in `App.css`.
  - Re-applied `padding-top: calc(var(--header-height) + 4rem)` to `.hero-content` in `HeroSection.css`.
  - Ensures Vanta canvas fills the viewport behind the header, while hero content starts below it.
- Fixed Hero section alignment gap:
  - Removed `var(--header-height)` from `.hero-content` top padding in `HeroSection.css`.
  - Relied on body padding for header offset and used standard `4rem` top padding for `.hero-content` internal spacing.
- Adjusted Hero section alignment:
  - Corrected `--header-height` variable in `App.css` to `60px`.
  - Modified `.hero-content` top padding in `HeroSection.css` to use only `var(--header-height)` to align it directly below the fixed header.
- Corrected text visibility in `HeroSection.css`:
  - Set `color: #FFFFFF` for `.hero-name`, `.hero-title`, and `.hero-summary` to ensure pure white text.
  - Increased `font-weight` for `.hero-title` for better prominence.
- Updated `HeroSection.css`:
  - Changed `.hero-summary` text color to `var(--color-off-white)` for better contrast.
  - Added a translucent background, `backdrop-filter: blur()`, padding, and border-radius to `.hero-text` to enhance text legibility over the animated background.
- Consolidated `NEXT_STEPS.md` into `TODO.md` for a single task tracking file.
- Adjusted `HeroSection.css`: Removed CSS `background-color` from `.hero-section` to ensure the Vanta.js animated background is displayed correctly.
- Refactored Vanta.js initialization:

## 2025-05-12 - Fixes, Refactoring, and Styling

- **Style**: Improved text contrast in `HeroSection.css` by changing colors for `.hero-title` and `.hero-summary`.
- **Style**: Refactored `HeroSection.css` to remove fixed positioning and implement a side-by-side layout for image and text, making it part of the normal page flow.
- **Style**: Simplified text and button styles within `HeroSection.css` and removed unused complex animations/effects.
- **Fix**: Removed unused icon imports in `HeroSection.jsx` to resolve linter warnings.
- **Fix**: Corrected image import path in `src/components/HeroSection.jsx` to resolve Vite server error.
- **Fix**: Created `NotFound.jsx` component and `NotFound.css` styles to resolve Vite import error.
- **Refactor**: Removed `HireMe` page and integrated its content (Professional Summary, Call to Action) into `HeroSection.jsx` and `Header.jsx` respectively for a more streamlined user experience.
- **Refactor**: Deleted `HireMe.jsx`, `HireMe.css`, and associated routes/links.
- **SEO**: Updated meta tags in `index.html` to reflect the consolidated site structure and focus on overall professional portfolio and services.
- **Content**: Updated `HireMe.jsx` content (Professional Summary, Technical Skills) based on provided resume details. (Superseded by refactor)
- **Style**: Fixed `HireMe` page appearance by removing conflicting `:root` variables from `HireMe.css` and ensuring subtitle uses theme colors. (Superseded by refactor)
- **Style**: Added hover effects to buttons on `HireMe` page for consistency. (Superseded by refactor)
- **Style**: Updated `HireMe.jsx` page styling (`HireMe.css`) to be consistent with the application's dark theme and card-based layout, replacing previous light-theme styles. (Superseded by refactor)
- **Fixed**: Added missing dependencies (`framer-motion`, `react-intersection-observer`) to `package.json` and ran `npm install` to resolve import errors in `Certifications.jsx`.
- **Fixed**: Updated the import path for `bloomtech-certificate-preview.webp` in `src/pages/Certifications.jsx` to resolve an import error.
- **Investigated**: Looked into the `[vite:css] @import must precede all other statements` warning. The import in `src/styles/Contact.css` is correctly placed; the warning might be a build process nuance. The build currently completes successfully.
- **Investigated**: Examined the `THREE.Material: parameter 'vertexColors' has value of undefined` error originating from `Layout.jsx`. Confirmed that `vertexColors: false` is already correctly set in the Vanta NET configuration, aligning with Three.js best practices. The error might stem from the Vanta library itself or its internal Three.js interaction.
- **Next Steps**: Verify Hero section layout and responsiveness. Then proceed with general codebase review, responsiveness enhancements, and test implementation. Monitor the `vertexColors` console error.
- **Fix:** Resolved certificate display issue on `Certifications`