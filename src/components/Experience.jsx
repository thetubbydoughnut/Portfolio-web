import React from 'react';
import { resumeData } from '../data/resume';
import { motion } from 'framer-motion';
import '../styles/Experience.css'; // We'll need to ensure this exists or create it

const Experience = () => {
  return (
    <section id="experience" className="experience-section">
      <div className="experience-container">
        <h2 className="section-title">Professional Experience</h2>
        <div className="experience-timeline">
          {resumeData.experience.map((job, index) => (
            <motion.div
              key={index}
              className="experience-card"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <div className="experience-header">
                <div className="role-company">
                  <h3>{job.role}</h3>
                  {job.url ? (
                    <a href={job.url} target="_blank" rel="noopener noreferrer" className="company-name company-link">
                      {job.company}
                    </a>
                  ) : (
                    <span className="company-name">{job.company}</span>
                  )}
                </div>
                <div className="meta-info">
                  <span className="period">{job.period}</span>
                  <span className="location">{job.location}</span>
                </div>
              </div>
              <ul className="experience-points">
                {job.description.map((point, i) => (
                  <li key={i}>{point}</li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Experience;
