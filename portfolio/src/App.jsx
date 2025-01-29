import { useState } from 'react'
import './App.css'
import Header from './components/Header'
import HeroSection from './components/HeroSection'
import Projects from './components/Projects'
import Skills from './components/Skills'
import Experience from './components/Experience'
import Contact from './components/Contact'

function App() {
  return (
    <>
      <Header />
      <main>
        <HeroSection />
        <Projects />
        <Skills />
        <Experience />
        <Contact />
      </main>
    </>
  )
}

export default App
