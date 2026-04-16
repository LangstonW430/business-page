import { useEffect, useRef, useState } from 'react';
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
function BizCard({ icon, title, desc }: { icon: string; title: string; desc: string }) {
  const ref = useReveal();
  return (
    <div ref={ref as React.RefObject<HTMLDivElement>} className="biz-card reveal">
      <div className="biz-icon">{icon}</div>
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
            <p className="modal-sub">Free 20-minute call — no pressure, no sales pitch.</p>

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
                    <option value="">— Select a plan —</option>
                    <option value="Managed Plan ($399 + $30/mo)">Managed Plan — $399 + $30/mo</option>
                    <option value="Handoff Plan ($599 one-time)">Handoff Plan — $599 one-time</option>
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

// ── GreenEdge preview (your real project) ─────────────────────────────────
function GreenEdgePreview() {
  return (
    <div className="ge-site">
      {/* nav */}
      <div className="ge-nav">
        <div className="ge-logo">
          <span className="ge-logo-name">GreenEdge</span>
          <span className="ge-logo-sub">Landscape &amp; Design</span>
        </div>
        <div className="ge-nav-links">
          <span>Services</span>
          <span>About</span>
          <span>Portfolio</span>
          <span>Contact</span>
        </div>
        <span className="ge-consult-btn">Consultation</span>
      </div>

      {/* hero */}
      <div className="ge-hero">
        <div className="ge-hero-inner">
          <p className="ge-eyebrow">Landscape &amp; Design</p>
          <h2 className="ge-h1">
            <em>Crafted</em> for the<br />discerning property
          </h2>
          <p className="ge-desc">
            GreenEdge designs and maintains landscapes that reflect
            the quality of your property.
          </p>
          <div className="ge-hero-btns">
            <span className="ge-btn-gold">Request a Consultation →</span>
            <span className="ge-btn-outline">☏ (555) 123-4567</span>
          </div>
          <div className="ge-creds">
            <span>NALP Certified</span>
            <span className="ge-cred-div">|</span>
            <span>Licensed &amp; Bonded</span>
            <span className="ge-cred-div">|</span>
            <span>Est. 2009</span>
          </div>
        </div>
      </div>

      {/* services strip */}
      <div className="ge-services">
        {[
          { n: '01', t: 'Lawn Maintenance',  d: 'Precision mowing, edging & seasonal fertilisation' },
          { n: '02', t: 'Hardscaping',        d: 'Natural stone terraces & bluestone walkways' },
          { n: '03', t: 'Planting Design',    d: 'Curated seasonal planting programmes' },
        ].map(({ n, t, d }) => (
          <div key={n} className="ge-service-card">
            <span className="ge-service-num">{n}</span>
            <span className="ge-service-title">{t}</span>
            <span className="ge-service-desc">{d}</span>
            <span className="ge-enquire">Enquire →</span>
          </div>
        ))}
      </div>
    </div>
  );
}

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
          <li><a href="#work">Work</a></li>
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
        <a href="#services"  onClick={() => setMenuOpen(false)}>Services</a>
        <a href="#work"      onClick={() => setMenuOpen(false)}>Work</a>
        <a href="#pricing"   onClick={() => setMenuOpen(false)}>Pricing</a>
        <a href="#process"   onClick={() => setMenuOpen(false)}>Process</a>
        <button onClick={openContact}>Get a Website →</button>
      </div>

      {/* ── HERO ───────────────────────────────────────────────────────── */}
      <header className="fs-hero">
        <div className="hero-left">
          <p className="hero-eyebrow">Web Design · Local Businesses</p>
          <h1 className="hero-heading">
            More customers,<br />
            <em>better website.</em>
          </h1>
          <p className="hero-desc">
            I build clean, professional websites for local service businesses —
            landscapers, cleaners, contractors, and more. You focus on the work.
            I'll handle everything online.
          </p>
          <div className="hero-actions">
            <button className="btn btn-filled" onClick={openContact}>
              <span>Get a Website</span>
            </button>
            <a href="#work" className="btn">
              <span>See Example Work</span>
            </a>
          </div>
          <p className="hero-note">Free 20-min consultation &nbsp;·&nbsp; No commitment</p>
        </div>

        <div className="hero-right">
          <div className="hero-preview-wrap">
            <div className="browser">
              <div className="browser-bar">
                <span className="browser-dot red" />
                <span className="browser-dot yel" />
                <span className="browser-dot grn" />
                <span className="browser-url">mock-landscaper.vercel.app</span>
              </div>
              <div className="browser-content">
                <GreenEdgePreview />
              </div>
            </div>
          </div>
          <div className="deco-letter">W</div>
        </div>
      </header>

      {/* ── WHO THIS IS FOR ────────────────────────────────────────────── */}
      <section id="services" className="fs-section fs-section-alt">
        <div className="section-label">Who it's for</div>
        <div className="biz-grid">
          <BizCard icon="🌿" title="Landscapers & Lawn Care"
            desc="Show off your work, post seasonal packages, and make it effortless for homeowners to request a quote." />
          <BizCard icon="🧹" title="Cleaning Services"
            desc="Build trust with a polished presence that makes booking a recurring clean feel simple and reliable." />
          <BizCard icon="🔨" title="Contractors & Handymen"
            desc="Highlight past projects and trade skills — and give clients one clear way to reach you." />
          <BizCard icon="🪟" title="Pressure Washing"
            desc="Before-and-after galleries that do the selling for you, paired with a fast contact form." />
          <BizCard icon="🐾" title="Pet Grooming & Dog Walking"
            desc="Approachable sites with easy scheduling and service menus that pet owners love." />
          <BizCard icon="🚗" title="Auto Detailing"
            desc="Showcase your packages and pull in new customers actively searching for detailers nearby." />
        </div>
      </section>

      {/* ── PROBLEM ────────────────────────────────────────────────────── */}
      <section className="fs-section">
        <div className="problem-layout">
          <R className="problem-intro">
            <div className="section-label">The problem</div>
            <h2>Most local businesses are<br /><em>invisible online.</em></h2>
            <p>
              Your work speaks for itself — but if customers can't find you,
              or land on a site that breaks on their phone, they're going
              straight to your competitor.
            </p>
          </R>
          <div className="problem-list">
            {[
              { n: '01', t: 'No website at all',
                d: 'Over a third of local service businesses have zero web presence — invisible to anyone searching Google.' },
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
                d: 'Every site loads instantly and looks sharp on any device — especially the phones your customers are using.' },
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
              I handle everything — design, development, and launch.
              You stay focused on your business while I build the digital
              storefront that brings new customers to your door.
            </p>
            <button className="btn btn-filled" onClick={openContact}>
              <span>Start a Project</span>
            </button>
          </R>
        </div>
      </section>

      {/* ── EXAMPLE WORK ───────────────────────────────────────────────── */}
      <section id="work" className="fs-section">
        <div className="work-header">
          <div>
            <div className="section-label">Real work</div>
            <h2 className="reveal work-heading">
              GreenEdge Landscape<br /><em>&amp; Design.</em>
            </h2>
          </div>
          <div className="work-meta reveal">
            <span><strong>Type</strong> Landscaping &amp; Design</span>
            <span><strong>Stack</strong> React · TypeScript · Tailwind</span>
            <span><strong>Status</strong> Live on Vercel</span>
          </div>
        </div>
        <R>
          <div className="browser">
            <div className="browser-bar">
              <span className="browser-dot red" />
              <span className="browser-dot yel" />
              <span className="browser-dot grn" />
              <span className="browser-url">mock-landscaper.vercel.app</span>
            </div>
            <div className="browser-content">
              <GreenEdgePreview />
            </div>
          </div>
        </R>
        <div className="work-links reveal">
          <a href="https://mock-landscaper.vercel.app/" target="_blank" rel="noopener noreferrer" className="btn btn-filled">
            <span>View Live Site</span>
          </a>
          <a href="https://github.com/LangstonW430/mock-landscaper" target="_blank" rel="noopener noreferrer" className="btn">
            <span>View Code</span>
          </a>
        </div>
      </section>

      {/* ── PRICING ────────────────────────────────────────────────────── */}
      <section id="pricing" className="fs-section fs-section-alt">
        <div className="section-label">Pricing</div>
        <div className="pricing-grid">

          <div className="pricing-card featured reveal">
            <div className="pricing-label featured-tag">Managed</div>
            <div className="pricing-name">Managed Plan</div>
            <div className="pricing-price-row">
              <span className="pricing-price">$399</span>
              <span className="pricing-price-sub">upfront</span>
            </div>
            <div className="pricing-price-then">then $30 / month</div>
            <div className="pricing-price-note">I handle all hosting &amp; maintenance</div>
            <ul className="pricing-features">
              <li>Custom designed &amp; built website</li>
              <li>Mobile-responsive on all devices</li>
              <li>Hosting fully managed by me</li>
              <li>Updates &amp; edits whenever you need</li>
              <li>Security &amp; uptime monitoring</li>
              <li>Cancel anytime — no contracts</li>
            </ul>
            <button className="btn btn-filled" onClick={openContact}><span>Get Started</span></button>
            <div className="pricing-ghost">M</div>
          </div>

          <div className="pricing-card reveal">
            <div className="pricing-label">Self-Hosted</div>
            <div className="pricing-name">Handoff Plan</div>
            <div className="pricing-price-row">
              <span className="pricing-price">$599</span>
              <span className="pricing-price-sub">one-time</span>
            </div>
            <div className="pricing-price-then">&nbsp;</div>
            <div className="pricing-price-note">Everything handed over — it's fully yours</div>
            <ul className="pricing-features">
              <li>Custom designed &amp; built website</li>
              <li>Mobile-responsive on all devices</li>
              <li>Full source code &amp; assets delivered</li>
              <li>Domain &amp; hosting setup walkthrough</li>
              <li>30-day support window after launch</li>
              <li>Own your site outright, no ongoing fees</li>
            </ul>
            <button className="btn" onClick={openContact}><span>Get Started</span></button>
            <div className="pricing-ghost">H</div>
          </div>

        </div>
        <R className="pricing-footnote">
          <p className="pricing-footnote-text">
            Not sure which plan is right for you? &nbsp;
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
              d: 'I create a custom mockup tailored to your brand — layout, colors, copy, and structure. You review and give feedback.' },
            { n: 'Step 03', time: '3–5 days',        t: 'Build',
              d: 'I code and test the full site. Revisions included. No tech speak — just clear updates at every stage.' },
            { n: 'Step 04', time: 'Day 5–7',         t: 'Launch',
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
