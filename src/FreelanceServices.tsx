import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import projectsData from './data/projects.json';
import content from './data/content.json';
import './FreelanceServices.css';

const C = content;

// ── scroll reveal ──────────────────────────────────────────────────────────
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

// ── RevealDiv convenience wrapper ─────────────────────────────────────────
function R({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const ref = useReveal();
  return (
    <div ref={ref} className={`reveal ${className}`}>
      {children}
    </div>
  );
}

// ── Business type card ─────────────────────────────────────────────────────
function BizCard({ title, desc }: { title: string; desc: string }) {
  const ref = useReveal();
  return (
    <div ref={ref as React.RefObject<HTMLDivElement>} className="biz-card reveal">
      <h3>{title}</h3>
      <p>{desc}</p>
    </div>
  );
}

// ── Contact modal ──────────────────────────────────────────────────────────
function ContactModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [form, setForm] = useState({ name: '', email: '', business: '', plan: '', message: '' });

  function set(field: string, value: string) {
    setForm(f => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('sending');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
        signal: AbortSignal.timeout(8000),
      });
      if (res.ok) {
        setStatus('sent');
      } else {
        const data = await res.json().catch(() => ({})) as { error?: string };
        setErrorMsg(data.error ?? `Server error ${res.status}`);
        setStatus('error');
      }
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Request failed');
      setStatus('error');
    }
  }

  function handleClose() {
    onClose();
    setTimeout(() => { setStatus('idle'); setErrorMsg(''); setForm({ name: '', email: '', business: '', plan: '', message: '' }); }, 300);
  }

  if (!open) return null;

  return (
    <div className="modal-backdrop" onClick={handleClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={handleClose} aria-label="Close">✕</button>

        {status === 'sent' ? (
          <div className="modal-sent">
            <div className="modal-sent-label">{C.contact.sentLabel}</div>
            <h3 className="modal-sent-heading">{C.contact.sentHeadingLead}<br /><em>{C.contact.sentHeadingEm}</em></h3>
            <p className="modal-sent-sub">
              {C.contact.sentSub}{' '}
              <a href={`mailto:${C.contact.email}`} className="modal-email-link">
                {C.contact.email}
              </a>
            </p>
            <button className="btn btn-filled" onClick={handleClose}><span>Close</span></button>
          </div>
        ) : (
          <>
            <div className="modal-label">{C.contact.label}</div>
            <h3 className="modal-heading">{C.contact.headingLead}<br /><em>{C.contact.headingEm}</em></h3>
            <p className="modal-sub">{C.contact.sub}</p>

            <form onSubmit={handleSubmit} className="modal-form">
              <div className="modal-row">
                <div className="modal-field">
                  <label>Your Name</label>
                  <input type="text" required placeholder="Jane Smith"
                    value={form.name} onChange={e => set('name', e.target.value)} />
                </div>
                <div className="modal-field">
                  <label>Email</label>
                  <input type="email" required placeholder="jane@example.com"
                    value={form.email} onChange={e => set('email', e.target.value)} />
                </div>
              </div>
              <div className="modal-row">
                <div className="modal-field">
                  <label>Business Name <span className="modal-optional">(optional)</span></label>
                  <input type="text" placeholder="Smith Landscaping LLC"
                    value={form.business} onChange={e => set('business', e.target.value)} />
                </div>
                <div className="modal-field">
                  <label>Interested in</label>
                  <select value={form.plan} onChange={e => set('plan', e.target.value)}>
                    <option value="">Select a plan</option>
                    {C.contact.planOptions.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="modal-field">
                <label>Tell me about your business <span className="modal-optional">(optional)</span></label>
                <textarea rows={3} placeholder="What services you offer, who your customers are, what you're looking for..."
                  value={form.message} onChange={e => set('message', e.target.value)} />
              </div>
              {status === 'error' && (
                <p className="modal-error">
                  {errorMsg && <><strong>Error:</strong> {errorMsg}<br /></>}
                  Email me directly at <a href={`mailto:${C.contact.email}`} className="modal-email-link">{C.contact.email}</a>
                </p>
              )}
              <button type="submit" className="btn btn-filled modal-submit" disabled={status === 'sending'}>
                <span>{status === 'sending' ? 'Sending...' : C.contact.submitLabel}</span>
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

// ── Portfolio data (sourced from CMS-managed JSON) ─────────────────────────
type Project = {
  name: string; type: string; badge: 'Real Client' | 'Mock Project';
  desc: string; url: string; img: string; ghost: string; domain: string;
};
const PORTFOLIO: Project[] = projectsData.projects as Project[];

// ── Main component ─────────────────────────────────────────────────────────
export default function FreelanceServices() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  function openContact() {
    setModalOpen(true);
    setMenuOpen(false);
  }

  useEffect(() => {
    // global reveal observer for all .reveal elements not handled by useReveal()
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
  }, []);

  return (
    <div className="fs-root">

      <ContactModal open={modalOpen} onClose={() => setModalOpen(false)} />

      {/* ── NAV ────────────────────────────────────────────────────────── */}
      <nav className="fs-nav">
        <a href="https://langstonwoods.com" className="fs-nav-logo">
          {C.nav.logoLead}<span>.</span>{C.nav.logoTail}
        </a>
        <ul className="fs-nav-links">
          <li><a href="#services">{C.nav.linkServices}</a></li>
          <li><Link to="/portfolio">{C.nav.linkPortfolio}</Link></li>
          <li><a href="#pricing">{C.nav.linkPricing}</a></li>
          <li><a href="#process">{C.nav.linkProcess}</a></li>
          <li>
            <button className="btn btn-filled" onClick={openContact}>
              <span>{C.nav.ctaLabel}</span>
            </button>
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
        <a href="#services"   onClick={() => setMenuOpen(false)}>{C.nav.linkServices}</a>
        <Link to="/portfolio" onClick={() => setMenuOpen(false)}>{C.nav.linkPortfolio}</Link>
        <a href="#pricing"    onClick={() => setMenuOpen(false)}>{C.nav.linkPricing}</a>
        <a href="#process"   onClick={() => setMenuOpen(false)}>{C.nav.linkProcess}</a>
        <button onClick={openContact}>{C.nav.ctaLabel} →</button>
      </div>

      {/* ── HERO ───────────────────────────────────────────────────────── */}
      <header className="fs-hero">
        <div className="hero-left">
          <p className="hero-eyebrow">{C.hero.eyebrow}</p>
          <h1 className="hero-heading">
            {C.hero.headingLead}<br />
            <em>{C.hero.headingEm}</em>
          </h1>
          <p className="hero-desc">
            {C.hero.desc}
          </p>
          <div className="hero-actions">
            <button className="btn btn-filled" onClick={openContact}>
              <span>{C.hero.primaryLabel}</span>
            </button>
            <a href="#pricing" className="btn">
              <span>{C.hero.secondaryLabel}</span>
            </a>
          </div>
          <p className="hero-note">{C.hero.note}</p>
        </div>

        <div className="hero-right" aria-hidden="true">
          <div className="hero-composition">
            <div className="hc-glow" />
            <div className="hc-dots" />
            <div className="deco-letter">{C.hero.decoLetter}</div>

            <div className="hc-phone">
              <div className="hc-phone-inner">
                <div className="phone-frame">
                  <div className="phone-island" />
                  <div className="phone-screen">
                    <img src={C.hero.phoneImage} alt="" />
                  </div>
                </div>
              </div>
            </div>

            <div className="stat-card sc-features">
              <p className="sc-eyebrow">{C.hero.includesLabel}</p>
              {C.hero.includes.map(item => (
                <div key={item} className="sc-row">
                  <span className="sc-arrow">→</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>

            <div className="stat-card sc-number">
              <p className="sc-num-label">{C.hero.daysLabel}</p>
              <div className="sc-num-big">{C.hero.daysNumber}</div>
            </div>

            <div className="stat-card sc-status">
              <span className="sc-dot" />
              <span className="sc-status-text">{C.hero.statusText}</span>
            </div>
          </div>

        </div>

      </header>

      {/* ── WHO THIS IS FOR ────────────────────────────────────────────── */}
      <section id="services" className="fs-section fs-section-alt">
        <div className="section-label">{C.services.label}</div>
        <R>
          <h2 className="services-heading">
            {C.services.headingLead}<br /><em>{C.services.headingEm}</em>
          </h2>
          <p className="services-sub">
            {C.services.sub}
          </p>
        </R>
        <div className="biz-grid">
          {C.services.cards.map(card => (
            <BizCard key={card.title} title={card.title} desc={card.desc} />
          ))}
        </div>
        <R className="services-footer">
          <p className="services-footer-text">
            {C.services.footerText}&nbsp;
            <button className="pricing-footnote-link" onClick={openContact}>
              {C.services.footerLinkText}
            </button>
          </p>
        </R>
      </section>

      {/* ── PROBLEM ────────────────────────────────────────────────────── */}
      <section className="fs-section">
        <div className="problem-layout">
          <R className="problem-intro">
            <div className="section-label">{C.problem.label}</div>
            <h2>{C.problem.headingLead}<br /><em>{C.problem.headingEm}</em></h2>
            <p>
              {C.problem.intro}
            </p>
          </R>
          <div className="problem-list">
            {C.problem.items.map(({ n, t, d }) => (
              <div key={n} className="problem-item reveal">
                <div className="problem-num">{n}</div>
                <div className="problem-body">
                  <h4>{t}</h4>
                  <p>{d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SOLUTION ───────────────────────────────────────────────────── */}
      <section className="fs-section fs-section-alt">
        <div className="solution-layout">
          <div className="service-list">
            {C.solution.items.map(({ n, t, d }) => (
              <div key={n} className="service-item reveal">
                <div className="service-num">{n}</div>
                <div className="service-body">
                  <h4>{t}</h4>
                  <p>{d}</p>
                </div>
              </div>
            ))}
          </div>
          <R className="solution-intro">
            <div className="section-label">{C.solution.label}</div>
            <h2>{C.solution.headingLead}<br /><em>{C.solution.headingEm}</em></h2>
            <p>
              {C.solution.intro}
            </p>
            <button className="btn btn-filled" onClick={openContact}>
              <span>{C.solution.ctaLabel}</span>
            </button>
          </R>
        </div>
      </section>

      {/* ── PORTFOLIO ──────────────────────────────────────────────────── */}
      <section id="portfolio" className="fs-section">
        <div className="section-label">{C.portfolioSection.label}</div>
        <R>
          <h2 className="portfolio-heading">
            {C.portfolioSection.headingLead}<br /><em>{C.portfolioSection.headingEm}</em>
          </h2>
        </R>
        <div className="portfolio-grid">
          {PORTFOLIO.map(({ name, type, badge, desc, url, img, ghost, domain }) => (
            <div key={name} className="portfolio-card reveal">
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
          ))}
        </div>
        <div style={{ textAlign: 'center', marginTop: '2.5rem' }}>
          <Link to="/portfolio" className="btn btn-filled">
            <span>{C.portfolioSection.viewAllLabel}</span>
          </Link>
        </div>
      </section>

      {/* ── PRICING ────────────────────────────────────────────────────── */}
      <section id="pricing" className="fs-section fs-section-alt">
        <div className="section-label">{C.pricing.label}</div>
        <div className="pricing-grid">

          {C.pricing.cards.map(card => (
            <div key={card.name} className={`pricing-card${card.featured ? ' featured' : ''} reveal`}>
              <div className={`pricing-label${card.featured ? ' featured-tag' : ''}`}>{card.label}</div>
              <div className="pricing-name">{card.name}</div>
              <div className="pricing-price-row">
                <span className="pricing-price">{card.price}</span>
                <span className="pricing-price-sub">{card.priceSub}</span>
              </div>
              <div className="pricing-price-then">&nbsp;</div>
              <div className="pricing-price-note">{card.note}</div>
              <ul className="pricing-features">
                {card.features.map(f => <li key={f}>{f}</li>)}
              </ul>
              <button className={card.featured ? 'btn btn-filled' : 'btn'} onClick={openContact}>
                <span>{card.ctaLabel}</span>
              </button>
              <div className="pricing-ghost">{card.ghost}</div>
            </div>
          ))}

        </div>
        <R className="pricing-footnote">
          <p className="pricing-footnote-text">
            {C.pricing.footnoteText} &nbsp;
            <button className="pricing-footnote-link" onClick={openContact}>
              {C.pricing.footnoteLinkText}
            </button>
          </p>
        </R>
      </section>

      {/* ── PROCESS ────────────────────────────────────────────────────── */}
      <section id="process" className="fs-section">
        <div className="section-label">{C.process.label}</div>
        <div className="process-list">
          {C.process.steps.map(({ n, time, t, d }) => (
            <div key={n} className="process-item reveal">
              <div className="process-step-meta">
                <span className="process-step-num">{n}</span>
                <span className="process-step-time">{time}</span>
              </div>
              <div className="process-content">
                <h3>{t}</h3>
                <p>{d}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ────────────────────────────────────────────────────────── */}
      <section className="fs-cta">
        <div className="section-label center">{C.cta.label}</div>
        <h2 className="cta-heading reveal">
          {C.cta.headingLead}<br /><em>{C.cta.headingEm}</em>
        </h2>
        <p className="cta-sub reveal">
          {C.cta.sub}
        </p>
        <div className="cta-actions reveal">
          <button className="btn btn-filled" onClick={openContact}>
            <span>{C.cta.primaryLabel}</span>
          </button>
          <a href={C.cta.secondaryUrl} className="btn" target="_blank" rel="noopener noreferrer">
            <span>{C.cta.secondaryLabel}</span>
          </a>
        </div>
        <button onClick={openContact} className="cta-email">
          {C.cta.email}
        </button>
      </section>

      {/* ── FOOTER ─────────────────────────────────────────────────────── */}
      <footer className="fs-footer">
        <p>© {new Date().getFullYear()} {C.footer.businessName}</p>
        <p>{C.footer.tagline}</p>
      </footer>

    </div>
  );
}
