import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import projectsData from './data/projects.json';
import content from './data/content.json';
import './FreelanceServices.css';
import './Portfolio.css';

const C = content;

type Project = {
  name: string;
  type: string;
  badge: 'Real Client' | 'Mock Project';
  desc: string;
  url: string;
  img: string;
  ghost: string;
  domain: string;
};

function useReveal() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry, i) => {
          if (entry.isIntersecting) {
            setTimeout(() => entry.target.classList.add('visible'), i * 80);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return ref;
}

function ProjectCard({ project }: { project: Project }) {
  const ref = useReveal();
  const { name, type, badge, desc, url, img, ghost, domain } = project;
  return (
    <div ref={ref as React.RefObject<HTMLDivElement>} className="portfolio-card reveal">
      <div className="portfolio-card-img">
        <div className="port-chrome">
          <div className="port-chrome-bar">
            <span className="port-dot port-dot-red" />
            <span className="port-dot port-dot-yel" />
            <span className="port-dot port-dot-grn" />
            <span className="port-chrome-url">{domain}</span>
          </div>
          <div className="port-chrome-viewport">
            <img
              src={img}
              alt={`${name} website screenshot`}
              width={1440}
              height={900}
              loading="lazy"
              className="port-chrome-img"
            />
          </div>
        </div>
      </div>
      <div className="portfolio-card-top">
        <span className={`portfolio-badge ${badge === 'Real Client' ? 'badge-real' : 'badge-mock'}`}>
          {badge}
        </span>
        <span className="portfolio-type">{type}</span>
      </div>
      <div className="portfolio-name">{name}</div>
      <p className="portfolio-desc">{desc}</p>
      <a href={url} target="_blank" rel="noopener noreferrer" className="btn btn-filled portfolio-btn">
        <span>View Live Site →</span>
      </a>
      <div className="portfolio-ghost">{ghost}</div>
    </div>
  );
}

export default function Portfolio() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [filter, setFilter] = useState<'All' | 'Real Client' | 'Mock Project'>('All');

  const projects: Project[] = projectsData.projects as Project[];
  const filtered = filter === 'All' ? projects : projects.filter(p => p.badge === filter);

  useEffect(() => {
    const reveals = document.querySelectorAll('.reveal');
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry, i) => {
          if (entry.isIntersecting) {
            setTimeout(() => entry.target.classList.add('visible'), i * 80);
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );
    reveals.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, [filtered]);

  return (
    <div className="fs-root">

      {/* ── NAV ─────────────────────────────────────────────────────────── */}
      <nav className="fs-nav">
        <Link to="/" className="fs-nav-logo">
          {C.nav.logoLead}<span>.</span>{C.nav.logoTail}
        </Link>
        <ul className="fs-nav-links">
          <li><Link to="/#services">{C.nav.linkServices}</Link></li>
          <li><Link to="/portfolio" className="nav-active">{C.nav.linkPortfolio}</Link></li>
          <li><Link to="/#pricing">{C.nav.linkPricing}</Link></li>
          <li><Link to="/#process">{C.nav.linkProcess}</Link></li>
          <li>
            <Link to="/" className="btn btn-filled">
              <span>{C.nav.ctaLabel}</span>
            </Link>
          </li>
        </ul>
        <button
          className="nav-toggle"
          aria-label="Toggle menu"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <span /><span /><span />
        </button>
      </nav>

      {/* mobile drawer */}
      <div className={`mobile-menu ${menuOpen ? 'mobile-menu-open' : ''}`}>
        <Link to="/#services"  onClick={() => setMenuOpen(false)}>{C.nav.linkServices}</Link>
        <Link to="/portfolio"  onClick={() => setMenuOpen(false)}>{C.nav.linkPortfolio}</Link>
        <Link to="/#pricing"   onClick={() => setMenuOpen(false)}>{C.nav.linkPricing}</Link>
        <Link to="/#process"   onClick={() => setMenuOpen(false)}>{C.nav.linkProcess}</Link>
        <Link to="/"           onClick={() => setMenuOpen(false)}>{C.nav.ctaLabel} →</Link>
      </div>

      {/* ── HERO ────────────────────────────────────────────────────────── */}
      <header className="portfolio-hero">
        <div className="section-label">{C.portfolioPage.label}</div>
        <h1 className="portfolio-page-heading">
          {C.portfolioPage.headingLead}<br /><em>{C.portfolioPage.headingEm}</em>
        </h1>
        <p className="portfolio-page-sub">
          {C.portfolioPage.sub}
        </p>

        <div className="portfolio-filters">
          {(['All', 'Real Client', 'Mock Project'] as const).map(f => (
            <button
              key={f}
              className={`filter-btn ${filter === f ? 'filter-active' : ''}`}
              onClick={() => setFilter(f)}
            >
              {f}
            </button>
          ))}
        </div>
      </header>

      {/* ── GRID ────────────────────────────────────────────────────────── */}
      <section className="fs-section portfolio-page-grid">
        <div className="portfolio-grid">
          {filtered.map(project => (
            <ProjectCard key={project.name} project={project} />
          ))}
        </div>
        {filtered.length === 0 && (
          <p className="portfolio-empty">{C.portfolioPage.emptyText}</p>
        )}
      </section>

      {/* ── CTA ─────────────────────────────────────────────────────────── */}
      <section className="fs-cta">
        <div className="section-label center">{C.portfolioPage.ctaLabel}</div>
        <h2 className="cta-heading reveal">
          {C.portfolioPage.ctaHeadingLead}<br /><em>{C.portfolioPage.ctaHeadingEm}</em>
        </h2>
        <p className="cta-sub reveal">
          {C.portfolioPage.ctaSub}
        </p>
        <div className="cta-actions reveal">
          <Link to="/" className="btn btn-filled">
            <span>{C.portfolioPage.ctaButtonLabel}</span>
          </Link>
        </div>
        <a href={`mailto:${C.portfolioPage.ctaEmail}`} className="cta-email">
          {C.portfolioPage.ctaEmail}
        </a>
      </section>

      {/* ── FOOTER ──────────────────────────────────────────────────────── */}
      <footer className="fs-footer">
        <p>© {new Date().getFullYear()} {C.footer.businessName}</p>
        <p>{C.footer.tagline}</p>
      </footer>

    </div>
  );
}
