import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import projectsData from './data/projects.json';
import './FreelanceServices.css';

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
            <div className="modal-sent-label">Message sent</div>
            <h3 className="modal-sent-heading">You'll hear back<br /><em>within 24 hours.</em></h3>
            <p className="modal-sent-sub">
              In the meantime, feel free to email directly at{' '}
              <a href="mailto:langstonw430@gmail.com" className="modal-email-link">
                langstonw430@gmail.com
              </a>
            </p>
            <button className="btn btn-filled" onClick={handleClose}><span>Close</span></button>
          </div>
        ) : (
          <>
            <div className="modal-label">Let's talk</div>
            <h3 className="modal-heading">Tell me about<br /><em>your business.</em></h3>
            <p className="modal-sub">Free 20-minute call, no pressure, no sales pitch.</p>

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
                    <option value="Simple Website ($400)">Simple Website ($400 one-time)</option>
                    <option value="Business Website ($1,000)">Business Website ($1,000 one-time)</option>
                    <option value="Business Website + Care Plan ($1,000 + $75/mo)">Business Website + Care Plan ($1,000 + $75/mo)</option>
                    <option value="Not sure yet">Not sure yet</option>
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
                  Email me directly at <a href="mailto:langstonw430@gmail.com" className="modal-email-link">langstonw430@gmail.com</a>
                </p>
              )}
              <button type="submit" className="btn btn-filled modal-submit" disabled={status === 'sending'}>
                <span>{status === 'sending' ? 'Sending...' : 'Send Message'}</span>
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
          L<span>.</span>Woods
        </a>
        <ul className="fs-nav-links">
          <li><a href="#services">Services</a></li>
          <li><Link to="/portfolio">Portfolio</Link></li>
          <li><a href="#pricing">Pricing</a></li>
          <li><a href="#process">Process</a></li>
          <li>
            <button className="btn btn-filled" onClick={openContact}>
              <span>Get a Website</span>
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
        <a href="#services"   onClick={() => setMenuOpen(false)}>Services</a>
        <Link to="/portfolio" onClick={() => setMenuOpen(false)}>Portfolio</Link>
        <a href="#pricing"    onClick={() => setMenuOpen(false)}>Pricing</a>
        <a href="#process"   onClick={() => setMenuOpen(false)}>Process</a>
        <button onClick={openContact}>Get a Website →</button>
      </div>

      {/* ── HERO ───────────────────────────────────────────────────────── */}
      <header className="fs-hero">
        <div className="hero-left">
          <p className="hero-eyebrow">Web Design for Local Service Businesses</p>
          <h1 className="hero-heading">
            More customers,<br />
            <em>better website.</em>
          </h1>
          <p className="hero-desc">
            I build clean, professional websites for local service businesses:
            landscapers, cleaners, contractors, pressure washers, auto detailers,
            pet groomers, and more. You focus on the work. I'll handle everything online.
          </p>
          <div className="hero-actions">
            <button className="btn btn-filled" onClick={openContact}>
              <span>Get a Website</span>
            </button>
            <a href="#pricing" className="btn">
              <span>See Pricing</span>
            </a>
          </div>
          <p className="hero-note">Free 20-min consultation &nbsp;·&nbsp; No commitment</p>
        </div>

        <div className="hero-right" aria-hidden="true">
          <div className="hero-composition">
            <div className="hc-glow" />
            <div className="hc-dots" />
            <div className="deco-letter">W</div>

            <div className="hc-phone">
              <div className="hc-phone-inner">
                <div className="phone-frame">
                  <div className="phone-island" />
                  <div className="phone-screen">
                    <img src="/screenshots/mock-bakery-mobile.webp" alt="" />
                  </div>
                </div>
              </div>
            </div>

            <div className="stat-card sc-features">
              <p className="sc-eyebrow">Every site includes</p>
              {['Mobile-responsive design', 'On-page SEO included', 'Contact form built in', 'Full source code yours'].map(item => (
                <div key={item} className="sc-row">
                  <span className="sc-arrow">→</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>

            <div className="stat-card sc-number">
              <p className="sc-num-label">avg. days to launch</p>
              <div className="sc-num-big">14</div>
            </div>

            <div className="stat-card sc-status">
              <span className="sc-dot" />
              <span className="sc-status-text">Accepting new projects</span>
            </div>
          </div>

        </div>

      </header>

      {/* ── WHO THIS IS FOR ────────────────────────────────────────────── */}
      <section id="services" className="fs-section fs-section-alt">
        <div className="section-label">Who it's for</div>
        <R>
          <h2 className="services-heading">
            Any local business that wants<br /><em>to be found online.</em>
          </h2>
          <p className="services-sub">
            If you run a local service business, I offer custom web design no matter the industry.
            Here are a few examples, but the list doesn't stop here.
          </p>
        </R>
        <div className="biz-grid">
          <BizCard title="Landscapers & Lawn Care"
            desc="Show off your work, post seasonal packages, and make it effortless for homeowners to request a quote." />
          <BizCard title="Cleaning Services"
            desc="Build trust with a polished presence that makes booking a recurring clean feel simple and reliable." />
          <BizCard title="Contractors & Handymen"
            desc="Highlight past projects and trade skills and give clients one clear way to reach you." />
          <BizCard title="Pressure Washing"
            desc="Before-and-after galleries that do the selling for you, paired with a fast contact form." />
          <BizCard title="Pet Grooming & Dog Walking"
            desc="Approachable sites with easy scheduling and service menus that pet owners love." />
          <BizCard title="Auto Detailing"
            desc="Showcase your packages and pull in new customers actively searching for detailers nearby." />
        </div>
        <R className="services-footer">
          <p className="services-footer-text">
            Don't see your industry?&nbsp;
            <button className="pricing-footnote-link" onClick={openContact}>
              Reach out anyway. If you have a business, I can build your site.
            </button>
          </p>
        </R>
      </section>

      {/* ── PROBLEM ────────────────────────────────────────────────────── */}
      <section className="fs-section">
        <div className="problem-layout">
          <R className="problem-intro">
            <div className="section-label">The problem</div>
            <h2>Most local businesses are<br /><em>invisible online.</em></h2>
            <p>
              Your work speaks for itself, but if customers can't find you,
              or land on a site that breaks on their phone, they're going
              straight to your competitor.
            </p>
          </R>
          <div className="problem-list">
            {[
              { n: '01', t: 'No website at all',
                d: 'Over a third of local service businesses have zero web presence, invisible to anyone searching Google.' },
              { n: '02', t: 'Outdated or broken site',
                d: 'A site that looks old, loads slow, or breaks on mobile sends customers running before they even read a word.' },
              { n: '03', t: 'No clear way to contact you',
                d: 'If a potential client has to hunt for your phone number, they won\'t bother. You lose the job.' },
              { n: '04', t: 'Nothing to build trust',
                d: 'Without photos, reviews, or a professional look, new customers have no reason to choose you over the next result.' },
            ].map(({ n, t, d }) => (
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
            {[
              { n: '01', t: 'Fast, mobile-first design',
                d: 'Every site loads instantly and looks sharp on any device, especially the phones your customers are using.' },
              { n: '02', t: 'Professional, trust-building aesthetic',
                d: 'Clean, modern designs that make your business look established and credible from the first second.' },
              { n: '03', t: 'Easy contact options everywhere',
                d: 'Click-to-call, contact forms, and Google Maps integration. All the friction removed for your customers.' },
              { n: '04', t: 'Found on Google',
                d: 'Basic on-page SEO built in from day one so local customers searching for your services can actually find you.' },
            ].map(({ n, t, d }) => (
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
            <div className="section-label">What I build</div>
            <h2>A website that works as<br /><em>hard as you do.</em></h2>
            <p>
              I handle everything: design, development, and launch.
              You stay focused on your business while I build the digital
              storefront that brings new customers to your door.
            </p>
            <button className="btn btn-filled" onClick={openContact}>
              <span>Start a Project</span>
            </button>
          </R>
        </div>
      </section>

      {/* ── PORTFOLIO ──────────────────────────────────────────────────── */}
      <section id="portfolio" className="fs-section">
        <div className="section-label">Portfolio</div>
        <R>
          <h2 className="portfolio-heading">
            Real sites,<br /><em>real results.</em>
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
            <span>View All Projects →</span>
          </Link>
        </div>
      </section>

      {/* ── PRICING ────────────────────────────────────────────────────── */}
      <section id="pricing" className="fs-section fs-section-alt">
        <div className="section-label">Pricing</div>
        <div className="pricing-grid">

          <div className="pricing-card reveal">
            <div className="pricing-label">Simple</div>
            <div className="pricing-name">Simple Website</div>
            <div className="pricing-price-row">
              <span className="pricing-price">$400</span>
              <span className="pricing-price-sub">one-time</span>
            </div>
            <div className="pricing-price-then">&nbsp;</div>
            <div className="pricing-price-note">Perfect for personal pages &amp; simple needs</div>
            <ul className="pricing-features">
              <li>1–2 page clean design</li>
              <li>Mobile-responsive layout</li>
              <li>Contact form or click-to-call</li>
              <li>Domain &amp; hosting setup walkthrough</li>
              <li>30-day support window after launch</li>
            </ul>
            <button className="btn" onClick={openContact}><span>Get Started</span></button>
            <div className="pricing-ghost">S</div>
          </div>

          <div className="pricing-card featured reveal">
            <div className="pricing-label featured-tag">Standard</div>
            <div className="pricing-name">Business Website</div>
            <div className="pricing-price-row">
              <span className="pricing-price">$1,000</span>
              <span className="pricing-price-sub">one-time</span>
            </div>
            <div className="pricing-price-then">&nbsp;</div>
            <div className="pricing-price-note">Everything you need to get online</div>
            <ul className="pricing-features">
              <li>Custom designed &amp; built website</li>
              <li>Mobile-responsive on all devices</li>
              <li>Full source code &amp; assets delivered</li>
              <li>Domain &amp; hosting setup walkthrough</li>
              <li>Basic on-page SEO built in</li>
              <li>30-day support window after launch</li>
            </ul>
            <button className="btn btn-filled" onClick={openContact}><span>Get Started</span></button>
            <div className="pricing-ghost">B</div>
          </div>

          <div className="pricing-card reveal">
            <div className="pricing-label">Optional Add-on</div>
            <div className="pricing-name">Monthly Care Plan</div>
            <div className="pricing-price-row">
              <span className="pricing-price">$75</span>
              <span className="pricing-price-sub">/ month</span>
            </div>
            <div className="pricing-price-then">&nbsp;</div>
            <div className="pricing-price-note">I keep your site running &amp; up to date</div>
            <ul className="pricing-features">
              <li>Hosting fully managed by me</li>
              <li>Updates &amp; edits whenever you need</li>
              <li>Security &amp; uptime monitoring</li>
              <li>Priority support response</li>
              <li>Cancel anytime, no contracts</li>
            </ul>
            <button className="btn" onClick={openContact}><span>Add to My Website</span></button>
            <div className="pricing-ghost">C</div>
          </div>

        </div>
        <R className="pricing-footnote">
          <p className="pricing-footnote-text">
            Questions about what's included? &nbsp;
            <button className="pricing-footnote-link" onClick={openContact}>
              Let's talk it through.
            </button>
          </p>
        </R>
      </section>

      {/* ── PROCESS ────────────────────────────────────────────────────── */}
      <section id="process" className="fs-section">
        <div className="section-label">How it works</div>
        <div className="process-list">
          {[
            { n: 'Step 01', time: '20 minutes',      t: 'Discuss',
              d: 'A free, no-pressure call to understand your business, your customers, and exactly what you\'re looking for.' },
            { n: 'Step 02', time: '24–48 hours',     t: 'Design',
              d: 'I create a custom mockup tailored to your brand: layout, colors, copy, and structure. You review and give feedback.' },
            { n: 'Step 03', time: '3–5 days',        t: 'Build',
              d: 'I code and test the full site. No tech speak, just clear updates at every stage.' },
            { n: 'Step 04', time: '10–14 days',      t: 'Revisions',
              d: 'Two dedicated rounds of revisions based on your feedback. You review, I refine until it feels exactly right.' },
            { n: 'Step 05', time: 'Day 14–21',       t: 'Launch',
              d: 'Your site goes live on your domain. I walk you through the basics and you start getting found.' },
          ].map(({ n, time, t, d }) => (
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
        <div className="section-label center">Ready to grow</div>
        <h2 className="cta-heading reveal">
          Let's build<br /><em>something great.</em>
        </h2>
        <p className="cta-sub reveal">
          A professional website is the single best investment you can make for
          your local business. Let's start with a free conversation.
        </p>
        <div className="cta-actions reveal">
          <button className="btn btn-filled" onClick={openContact}>
            <span>Get a Free Consultation</span>
          </button>
          <a href="https://langstonwoods.com" className="btn" target="_blank" rel="noopener noreferrer">
            <span>View Full Portfolio</span>
          </a>
        </div>
        <button onClick={openContact} className="cta-email">
          langstonw430@gmail.com
        </button>
      </section>

      {/* ── FOOTER ─────────────────────────────────────────────────────── */}
      <footer className="fs-footer">
        <p>© {new Date().getFullYear()} Langston Woods</p>
        <p>Web Design for Local Businesses</p>
      </footer>

    </div>
  );
}
