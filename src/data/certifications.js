import bloomTechCertificatePreview from '../assets/certs-and-resume/bloomtech-certificate-preview.webp';

/**
 * Certifications shown on /certifications (AC-13).
 * Dates and issuers align with resumeData.education.
 */
export const certifications = [
  {
    id: 'bloomtech',
    title: 'Full Stack Web Development + Technical Interviewing',
    issuer: 'BloomTech',
    date: 'November 2023 – January 2025',
    credentialPreviewUrl: bloomTechCertificatePreview,
    // Intrinsic size of bloomtech-certificate-preview.webp
    previewWidth: 1056,
    previewHeight: 816,
    credentialUrl:
      'https://drive.google.com/file/d/118YvczGUNXpa1yL06cVlXeEwb6_x8LKU/view?usp=sharing',
    description:
      'A 960+ hour intensive program demonstrating mastery in modern full-stack web development and technical interview proficiency. Built real-world full-stack applications through rigorous technical assessments, BloomTech Labs, and advanced computer science curriculum.',
    skills: [
      'React',
      'Node.js',
      'Express',
      'SQL',
      'RESTful APIs',
      'Data Structures',
      'Algorithms',
      'Testing',
      'Git/GitHub',
      'Technical Communication',
    ],
  },
  {
    id: 'michigan-python',
    title: 'Programming for Everybody (Python Certification)',
    issuer: 'University of Michigan',
    date: 'September 2025',
    credentialPreviewUrl: null,
    previewWidth: null,
    previewHeight: null,
    credentialUrl: null,
    description: 'Python certification from the University of Michigan.',
    skills: ['Python'],
  },
];
