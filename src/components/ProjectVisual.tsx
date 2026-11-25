/**
 * Illustrative project visuals (AC-15 / AC-28). Abstract/geometric or
 * typographic mockups — never unlabeled product screenshots.
 */
import type { CSSProperties } from 'react';

export type ProjectVisualProps = {
  kind: 'abstract' | 'mockup';
  label: string;
  alt: string;
  title: string;
};

const wrapStyle: CSSProperties = {
  position: 'relative',
  aspectRatio: '16 / 10',
  width: '100%',
  borderRadius: 'var(--radius-control)',
  overflow: 'hidden',
  border: '1px solid var(--glass-border)',
  background: 'var(--color-surface-2)',
};

export function ProjectVisual({ kind, label, alt, title }: ProjectVisualProps) {
  return (
    <figure className="project-visual" data-project-visual data-visual-kind={kind}>
      <div className="project-visual__canvas" style={wrapStyle} role="img" aria-label={alt}>
        {kind === 'abstract' ? <AbstractMark title={title} /> : <MockupMark title={title} />}
      </div>
      <figcaption className="project-visual__label">{label}</figcaption>
    </figure>
  );
}

function AbstractMark({ title }: { title: string }) {
  return (
    <svg viewBox="0 0 320 200" width="100%" height="100%" aria-hidden="true">
      <defs>
        <linearGradient id="pv-abs" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="rgba(212,168,102,0.35)" />
          <stop offset="100%" stopColor="rgba(141,180,204,0.25)" />
        </linearGradient>
      </defs>
      <rect width="320" height="200" fill="url(#pv-abs)" />
      <rect x="28" y="36" width="96" height="96" fill="none" stroke="rgba(242,239,232,0.55)" strokeWidth="2" />
      <circle cx="220" cy="90" r="48" fill="none" stroke="rgba(212,168,102,0.7)" strokeWidth="2" />
      <path d="M48 160 H272" stroke="rgba(242,239,232,0.35)" strokeWidth="2" />
      <text x="48" y="178" fill="rgba(242,239,232,0.7)" fontSize="10" fontFamily="ui-monospace, monospace">
        {title.slice(0, 42)}
      </text>
    </svg>
  );
}

function MockupMark({ title }: { title: string }) {
  return (
    <svg viewBox="0 0 320 200" width="100%" height="100%" aria-hidden="true">
      <rect width="320" height="200" fill="rgba(20,22,27,0.9)" />
      <rect x="40" y="28" width="240" height="144" rx="8" fill="rgba(28,31,38,1)" stroke="rgba(212,168,102,0.35)" />
      <rect x="56" y="48" width="120" height="10" rx="2" fill="rgba(212,168,102,0.55)" />
      <rect x="56" y="70" width="200" height="6" rx="2" fill="rgba(179,173,159,0.45)" />
      <rect x="56" y="84" width="180" height="6" rx="2" fill="rgba(179,173,159,0.3)" />
      <rect x="56" y="110" width="88" height="36" rx="6" fill="rgba(212,168,102,0.2)" stroke="rgba(212,168,102,0.45)" />
      <text x="56" y="168" fill="rgba(242,239,232,0.65)" fontSize="11" fontFamily="ui-sans-serif, system-ui">
        {title.slice(0, 36)}
      </text>
    </svg>
  );
}

export default ProjectVisual;
