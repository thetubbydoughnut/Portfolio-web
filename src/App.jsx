import { Routes, Route, useLocation } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { AnimatePresence } from 'framer-motion';
import Layout from './components/Layout';
import Header from './components/Header';
import PageTransition from './components/PageTransition';
import ErrorBoundary from './components/ErrorBoundary';
import './App.css';

// Lazy load pages
const HeroSection = lazy(() => import('./components/HeroSection'));
const Projects = lazy(() => import('./pages/Projects'));
const Skills = lazy(() => import('./pages/Skills'));
const Certifications = lazy(() => import('./pages/Certifications'));
const Freelancing = lazy(() => import('./pages/Freelancing'));
const Experience = lazy(() => import('./pages/Experience'));
const Contact = lazy(() => import('./pages/Contact'));
const NotFound = lazy(() => import('./pages/NotFound'));

// Loading component
const Loading = () => (
  <div className="loading">
    <div className="loading-spinner"></div>
  </div>
);

function App() {
  const location = useLocation();

  return (
    <ErrorBoundary>
      <Layout>
        <Header />
        <Suspense fallback={<Loading />}>
          <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
              <Route path="/" element={
                <PageTransition>
                  <HeroSection />
                </PageTransition>
              } />
              <Route path="/projects" element={
                <PageTransition>
                  <Projects />
                </PageTransition>
              } />
              <Route path="/skills" element={
                <PageTransition>
                  <Skills />
                </PageTransition>
              } />
              <Route path="/experience" element={
                <PageTransition>
                  <Experience />
                </PageTransition>
              } />
              <Route path="/certifications" element={
                <PageTransition>
                  <Certifications />
                </PageTransition>
              } />
              <Route path="/contact" element={
                <PageTransition>
                  <Contact />
                </PageTransition>
              } />
              <Route path="/freelancing" element={
                <PageTransition>
                  <Freelancing />
                </PageTransition>
              } />
              <Route path="*" element={
                <PageTransition>
                  <NotFound />
                </PageTransition>
              } />
            </Routes>
          </AnimatePresence>
        </Suspense>
      </Layout>
    </ErrorBoundary>
  );
}

export default App;
