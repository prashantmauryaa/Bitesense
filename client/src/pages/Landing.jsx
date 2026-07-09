import React from 'react';
import StepCard from '../components/StepCard.jsx';

function IconRankings() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 3v3M12 18v3M3 12h3M18 12h3" /><circle cx="12" cy="12" r="5.5" /><path d="M12 9.5v2.5l1.8 1.8" />
    </svg>
  );
}
function IconShield() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6l7-3z" /><path d="M9.5 12l1.8 1.8L15 10" />
    </svg>
  );
}
function IconSpeech() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M8 9h8M8 13h5" /><path d="M21 12c0 4.4-4 8-9 8-1.1 0-2.2-.2-3.2-.5L3 21l1.6-4.2C3.6 15.5 3 13.8 3 12c0-4.4 4-8 9-8s9 3.6 9 8z" />
    </svg>
  );
}
function IconProfile() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="8.5" r="3.5" /><path d="M4.5 20c1.4-4.2 4.6-6.5 7.5-6.5s6.1 2.3 7.5 6.5" />
    </svg>
  );
}
function IconScan() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 8V5.5a1 1 0 0 1 1-1H8" /><path d="M16 4.5h3a1 1 0 0 1 1 1V8" />
      <path d="M20 16v2.5a1 1 0 0 1-1 1h-3" /><path d="M8 19.5H5a1 1 0 0 1-1-1V16" />
      <rect x="8.25" y="9.5" width="7.5" height="5" rx="1" />
    </svg>
  );
}
function IconCheck() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="9" /><path d="M7.75 12.5l2.75 2.75L16.25 9" />
    </svg>
  );
}

export default function Landing({ onOpenAuth }) {
  return (
    <div id="view-auth" className="view">
      <header className="site-nav">
        <div className="site-nav-inner">
          <a className="brand-mark small" href="#top">Bite Sense</a>
          <nav className="site-links">
            <a href="#what-we-do">What we do</a>
            <a href="#how-it-works">How it works</a>
            <a href="#why-bitesense">Why Bite Sense</a>
          </nav>
          <div className="site-nav-auth">
            <button className="btn btn-ghost btn-sm" onClick={() => onOpenAuth('login')}>Sign in</button>
            <button className="btn btn-primary btn-sm" onClick={() => onOpenAuth('register')}>Create account</button>
          </div>
        </div>
      </header>

      <main id="top">
        {/* ============ HERO ============ */}
        <section className="hero">
          <div className="hero-inner">
            <div className="hero-copy">
              <p className="eyebrow">AI nutrition assistant for eating out</p>
              <h1 className="hero-title">The menu knows the price.<br /><em>We know the cost.</em></h1>
              <p className="hero-sub">
                Scan any restaurant menu and Bite Sense ranks every dish for <strong>your</strong> body — your
                goals, allergies, and health conditions — with a plain-English reason for every score. No more
                guessing at the table.
              </p>
              <div className="hero-cta">
                <button className="btn btn-primary btn-lg" onClick={() => onOpenAuth('register')}>Scan your first menu — it's free</button>
                <a className="btn btn-ghost btn-lg" href="#how-it-works">See how it works</a>
              </div>
              <p className="hero-trust">Runs on your machine · your health data never leaves it · no card required</p>
            </div>

            <div className="hero-demo" aria-label="Example of a menu scored by Bite Sense">
              <div className="demo-card">
                <div className="demo-card-head">
                  <span className="demo-restaurant">The Green Table</span>
                  <span className="demo-scored">scored for you</span>
                </div>
                <div className="demo-dish">
                  <span className="demo-name">Grilled Salmon Bowl</span>
                  <span className="demo-leader" />
                  <span className="demo-chip v-great">Great match</span>
                  <span className="demo-score s-great">92</span>
                </div>
                <div className="demo-dish">
                  <span className="demo-name">Quinoa Buddha Bowl</span>
                  <span className="demo-leader" />
                  <span className="demo-chip v-great">Great match</span>
                  <span className="demo-score s-great">88</span>
                </div>
                <div className="demo-dish">
                  <span className="demo-name">Chicken Caesar Salad</span>
                  <span className="demo-leader" />
                  <span className="demo-chip v-good">Good choice</span>
                  <span className="demo-score s-good">71</span>
                </div>
                <div className="demo-dish">
                  <span className="demo-name">Butter Chicken + Naan</span>
                  <span className="demo-leader" />
                  <span className="demo-chip v-ok">In moderation</span>
                  <span className="demo-score s-ok">48</span>
                </div>
                <div className="demo-dish demo-dish-avoid">
                  <span className="demo-name">Double Cheese Burger</span>
                  <span className="demo-leader" />
                  <span className="demo-chip v-avoid">Avoid</span>
                  <span className="demo-score s-avoid">18</span>
                </div>
                <div className="demo-warning">⚠ Contains dairy — listed in your allergies</div>
                <div className="demo-card-foot">Scored for: <strong>Priya</strong> · weight loss · dairy allergy · 720 kcal meal budget</div>
              </div>
            </div>
          </div>
        </section>

        {/* ============ STAT STRIP ============ */}
        <section className="stat-strip">
          <div className="stat-strip-inner">
            <div className="stat"><span className="stat-v">0–100</span><span className="stat-l">personal score on every dish</span></div>
            <div className="stat"><span className="stat-v">7</span><span className="stat-l">nutrition estimates per dish</span></div>
            <div className="stat"><span className="stat-v">6</span><span className="stat-l">allergens checked automatically</span></div>
            <div className="stat"><span className="stat-v">1 min</span><span className="stat-l">to set up your health profile</span></div>
          </div>
        </section>

        {/* ============ WHAT WE DO ============ */}
        <section className="section" id="what-we-do">
          <div className="section-inner">
            <p className="eyebrow">What we do</p>
            <h2 className="section-title">Calorie counts tell you a number.<br />We tell you <em>your</em> answer.</h2>
            <p className="section-lead">
              Most menus have no nutrition info at all. Even when they do, a calorie count can't tell you
              whether that dish fits your goals, your allergies, or your blood pressure. Bite Sense closes
              that gap.
            </p>
            <div className="feature-grid">
              <div className="feature-card">
                <div className="feature-icon"><IconRankings /></div>
                <h3>Personal dish rankings</h3>
                <p>Every dish on the menu gets a 0–100 match score computed from your age, size, activity, and fitness goal — not a one-size-fits-all label. The best choices rise to the top.</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon"><IconShield /></div>
                <h3>Allergy &amp; condition guard</h3>
                <p>Nuts, dairy, gluten, shellfish, soy, egg — flagged before you order. Diabetes, hypertension, heart disease? Sugar, sodium, and fried dishes get called out for you specifically.</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon"><IconSpeech /></div>
                <h3>The "why", in plain English</h3>
                <p>No cryptic grades. Every score comes with the reason — "runs 40% over your meal budget", "fiber helps your glucose control" — plus a healthier swap from the same menu.</p>
              </div>
            </div>
          </div>
        </section>

        {/* ============ HOW IT WORKS ============ */}
        <section className="section section-alt" id="how-it-works">
          <div className="section-inner">
            <p className="eyebrow">How it works</p>
            <h2 className="section-title">From menu to decision in under a minute</h2>
            <div className="steps">
              <StepCard num="01" icon={<IconProfile />} title="Build your health profile" tag="⏱ ~1 minute">
                Age, height, weight, activity level, fitness goal, dietary preference, allergies, and any
                medical conditions. One minute, once — edit it whenever life changes.
              </StepCard>
              <StepCard num="02" icon={<IconScan />} title="Scan any menu" tag="⏱ ~10 seconds">
                Paste the menu text, upload a PDF, or snap a photo. Our AI reads the dishes and estimates
                calories, protein, carbs, fat, fiber, sodium, and sugar for each one.
              </StepCard>
              <StepCard num="03" icon={<IconCheck />} title="Order with confidence" tag="⏱ instant results">
                Dishes arrive ranked best-first for you, with warnings, explanations, and smarter swaps.
                Save the winners — they're waiting in your history next time.
              </StepCard>
            </div>
            <div className="steps-cta">
              <button className="btn btn-primary" onClick={() => onOpenAuth('register')}>Try it on tonight's menu</button>
            </div>
          </div>
        </section>

        {/* ============ WHY BITE SENSE ============ */}
        <section className="section" id="why-bitesense">
          <div className="section-inner why-grid">
            <div className="why-copy">
              <p className="eyebrow">Why Bite Sense</p>
              <h2 className="section-title">Built for the moment the waiter is standing there</h2>
              <p>Eating out shouldn't mean abandoning your goals — or gambling with an allergy. But that's exactly what happens when the only information on the table is a dish name and a price.</p>
              <p>Bite Sense was built for that moment: quick enough to use before you order, personal enough to actually mean something, and honest enough to tell you <em>why</em> — so over time you get better at reading menus yourself.</p>
              <ul className="why-list">
                <li>Nutrition estimates for every dish, even when the menu has none</li>
                <li>Health suitability scores tuned to your goal — cutting, maintaining, or building</li>
                <li>Hard warnings for your allergies, gentle cautions for your conditions</li>
                <li>Healthier alternatives suggested from the same menu, not a lecture</li>
                <li>Saved meals and scan history, so favorite restaurants get faster every visit</li>
              </ul>
            </div>
            <aside className="honesty-card">
              <h3>Our honesty policy</h3>
              <p>Bite Sense estimates nutrition with AI — figures are informed approximations, not lab measurements. We show our reasoning so you can judge it.</p>
              <p>We're a decision aid, not a doctor: always confirm allergens with the restaurant, and follow your clinician's advice over ours.</p>
              <p>Your profile and history stay on this server. No ads, no data selling, no tracking.</p>
            </aside>
          </div>
        </section>

        {/* ============ FINAL CTA ============ */}
        <section className="cta-band">
          <div className="cta-band-inner">
            <h2>Your next meal out can be your best one.</h2>
            <p>Create a free account, build your profile, and scan a menu — all in the next two minutes.</p>
            <button className="btn btn-cream btn-lg" onClick={() => onOpenAuth('register')}>Get started free</button>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="site-footer-inner">
          <span className="brand-mark small">Bite Sense</span>
          <p>AI-estimated nutrition · not medical advice · always confirm allergens with the restaurant</p>
        </div>
      </footer>
    </div>
  );
}
