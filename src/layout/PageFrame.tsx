import type { ReactNode } from 'react';
import { AnimatedHeading } from '../components/AnimatedHeading';
import './PageFrame.css';

export type PageFrameProps = {
  /** Geist Mono eyebrow above the H1 (inner routes). */
  eyebrow?: string;
  /** Instrument Serif page title. */
  title?: string;
  /** Optional one-line dek under the H1. */
  dek?: string;
  /** When true, skip the sticky intro rail (home hero uses its own band). */
  home?: boolean;
  children: ReactNode;
};

/**
 * Shared page frame (AC-25). Inner routes: sticky left intro + content.
 * Home: shell + children only (hero band provided by the page).
 * AC-22: page titles use AnimatedHeading (SplitText / plain fallback).
 */
export function PageFrame({
  eyebrow,
  title,
  dek,
  home = false,
  children,
}: PageFrameProps) {
  if (home) {
    return (
      <main id="main-content" className="page-frame page-frame--home">
        {children}
      </main>
    );
  }

  return (
    <main id="main-content" className="page-frame page-frame--inner">
      <div className="page-frame__grid">
        <header className="page-frame__intro">
          {eyebrow ? <p className="page-frame__eyebrow">{eyebrow}</p> : null}
          {title ? (
            <AnimatedHeading text={title} as="h1" className="page-frame__title" />
          ) : null}
          {dek ? <p className="page-frame__dek">{dek}</p> : null}
        </header>
        <div className="page-frame__content">{children}</div>
      </div>
    </main>
  );
}

export default PageFrame;
