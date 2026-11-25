/**
 * AC-23: Shader Lab–authored atmosphere on /projects.
 * Ships muted looping WebM + poster when assets exist under public/images/projects/.
 * When assets are absent, uses darkened CSS fallback only (no fabricated video).
 */
import { useEffect, useRef, useState } from 'react';
import { useMotionBudget } from '../motion/useMotionBudget';

const VIDEO_SRC = '/images/projects/shader-lab-atmosphere.webm';
const POSTER_SRC = '/images/projects/shader-lab-atmosphere-poster.webp';

function assetsPresent(): boolean {
  // Build-time presence is asserted by tests via fs; runtime uses data attributes.
  return typeof document !== 'undefined';
}

export function ProjectsAtmosphere() {
  const budget = useMotionBudget();
  const effectsOn = budget === 'effects-on';
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [hasAsset, setHasAsset] = useState(false);
  const [inView, setInView] = useState(true);

  useEffect(() => {
    let cancelled = false;
    // Probe poster; if missing, stay on CSS fallback (AC-23 asset gate).
    const img = new Image();
    img.onload = () => {
      if (!cancelled) setHasAsset(true);
    };
    img.onerror = () => {
      if (!cancelled) setHasAsset(false);
    };
    img.src = POSTER_SRC;
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const root = document.querySelector('[data-projects-atmosphere]');
    if (!root || typeof IntersectionObserver === 'undefined') return undefined;
    const io = new IntersectionObserver(
      (entries) => {
        setInView(entries.some((e) => e.isIntersecting));
      },
      { threshold: 0.05 }
    );
    io.observe(root);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (!effectsOn || !inView || !hasAsset) {
      video.pause();
      return;
    }
    const play = video.play();
    if (play && typeof play.catch === 'function') {
      play.catch(() => {
        /* autoplay may be blocked; poster remains */
      });
    }
  }, [effectsOn, inView, hasAsset]);

  void assetsPresent;

  const showVideo = effectsOn && hasAsset;

  return (
    <div
      className="projects-atmosphere"
      data-projects-atmosphere
      data-atmosphere-mode={showVideo ? 'video' : 'fallback'}
      data-atmosphere-asset={hasAsset ? 'present' : 'absent'}
      aria-hidden="true"
    >
      <div className="projects-atmosphere__fallback" data-atmosphere-fallback />
      {hasAsset ? (
        // eslint-disable-next-line jsx-a11y/alt-text -- decorative; parent is aria-hidden
        <img
          className="projects-atmosphere__poster"
          src={POSTER_SRC}
          alt=""
          width={1280}
          height={720}
          decoding="async"
          data-atmosphere-poster
        />
      ) : null}
      {showVideo ? (
        <video
          ref={videoRef}
          className="projects-atmosphere__video"
          src={VIDEO_SRC}
          poster={POSTER_SRC}
          muted
          loop
          playsInline
          preload="none"
          data-atmosphere-video
        />
      ) : null}
    </div>
  );
}

export default ProjectsAtmosphere;
