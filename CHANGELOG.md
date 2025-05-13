# Changelog

## 2025-05-12

- **Fix:** Resolved certificate display issue on `Certifications` page by replacing PDF iframe with an image preview linked to the Google Drive URL (`Certifications.jsx`, `Certifications.css`).
- **Feat:** Created new `Hire Me` page (`HireMe.jsx`, `HireMe.css`) with placeholder content for professional summary, key skills, and call to action.
- **Feat:** Added routing for `/hire-me` page (`App.jsx`).
- **Feat:** Added "Hire Me" link to main navigation (`Header.jsx`).
- **Fix:** Adjusted mobile menu transition delays to accommodate new "Hire Me" link (`Header.css`).
- **Fix:** Removed unused PDF import from `Certifications.jsx` to resolve dynamic import error (500 Internal Server Error).
- **Chore:** Verified `vertexColors: false` setting in Vanta.js configurations (`Layout.jsx`, `HeroSection.jsx`) in response to console warning.
- **FIX**: Resolved CSS build error by moving `@import './VantaBackground.css';` to the top of `src/styles/Contact.css`.
- **FIX**: Corrected import path for `bloomtech-certificate-preview.webp` in `src/pages/Certifications.jsx` after assets were moved to `src/assets/Certs and resume/`.
- **REFACTOR**: Updated `src/pages/Projects.jsx` to use `VITE_GITHUB_USERNAME` environment variable instead of hardcoded username for API calls and links.
- **REFACTOR**: Updated `src/components/Header.jsx` to use `VITE_GITHUB_USERNAME` environment variable for the GitHub social link.
- **FEAT**: Added a "Download Resume" link to `src/components/Header.jsx`, linking to the `.webp` resume file located in `src/assets/Certs and resume/`. 