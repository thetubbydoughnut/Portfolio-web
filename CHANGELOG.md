# Changelog

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