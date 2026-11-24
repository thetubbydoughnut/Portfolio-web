import { Routes, Route, useLocation } from 'react-router-dom';
import { Suspense, lazy, useEffect, useState } from 'react';
import Layout from './components/Layout';
import Header from './components/Header';
import PageTransition from './components/PageTransition';
import ErrorBoundary from './components/ErrorBoundary';
import HeroSection from './components/HeroSection';
import { useMotionBudget } from './motion/useMotionBudget';
import './App.css';

// Home hero is eager so LCP text is in the first paint graph (AC-18 / F1).
// Other routes stay lazy.
const Projects = lazy(() => import('./pages/Projects'));
const Skills = lazy(() => import('./pages/Skills'));
const Certifications = lazy(() => import('./pages/Certifications'));
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
  const budget = useMotionBudget();
  const effectsOn = budget === 'effects-on';
  const [Presence, setPresence] = useState(null);

  useEffect(() => {
    if (!effectsOn) {
      setPresence(null);
      return undefined;
    }
    let cancelled = false;
    import('./components/MotionPresence.jsx').then((mod) => {
      if (!cancelled) setPresence(() => mod.default);
    });
    return () => {
      cancelled = true;
    };
  }, [effectsOn]);

  const routes = (
    <Routes location={location} key={location.pathname}>
      <Route
        path="/"
        element={
          <PageTransition>
            <HeroSection />
          </PageTransition>
        }
      />
      <Route
        path="/projects"
        element={
          <PageTransition>
            <Projects />
          </PageTransition>
        }
      />
      <Route
        path="/skills"
        element={
          <PageTransition>
            <Skills />
          </PageTransition>
        }
      />
      <Route
        path="/experience"
        element={
          <PageTransition>
            <Experience />
          </PageTransition>
        }
      />
      <Route
        path="/certifications"
        element={
          <PageTransition>
            <Certifications />
          </PageTransition>
        }
      />
      <Route
        path="/contact"
        element={
          <PageTransition>
            <Contact />
          </PageTransition>
        }
      />
      <Route
        path="*"
        element={
          <PageTransition>
            <NotFound />
          </PageTransition>
        }
      />
    </Routes>
  );

  return (
    <ErrorBoundary>
      <Layout>
        <Header />
        <Suspense fallback={<Loading />}>
          {Presence ? <Presence>{routes}</Presence> : routes}
        </Suspense>
      </Layout>
    </ErrorBoundary>
  );
}

export default App;
