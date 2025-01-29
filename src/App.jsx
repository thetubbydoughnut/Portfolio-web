import React from 'react'
import Header from './components/Header'
import HeroSection from './components/HeroSection'
import './App.css'

function App() {
  return (
    <div className="app">
      <Header />
      <HeroSection />
      <main>
        <section id="projects" className="section">
          <h2>Projects</h2>
        </section>
        <section id="skills" className="section">
          <h2>Skills</h2>
        </section>
        <section id="contact" className="section">
          <h2>Contact</h2>
        </section>
      </main>
    </div>
  )
}

export default App
