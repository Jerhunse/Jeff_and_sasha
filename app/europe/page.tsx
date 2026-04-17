import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Spain & Italy 2026 — Full Trip Breakdown | Jeff & Sasha",
  description:
    "Day-by-day Spain & Italy 2026 itinerary — flights, accommodations, day trips, and booking codes.",
}

const CSS = `
  .europe-page {
    --cream: #faf7f2;
    --paper: #f2ede4;
    --ink: #1a1410;
    --warm-gray: #8a7f72;
    --rust: #c8502a;
    --gold: #c9a84c;
    --sage: #5a7a5e;
    --sky: #3a6b8a;
    --italy: #2d6e4e;
    --spain: #c8502a;
    --border: #d4c8b8;
    background: var(--cream);
    color: var(--ink);
    font-family: 'DM Sans', sans-serif;
    font-weight: 300;
    line-height: 1.7;
    min-height: 100vh;
  }
  .europe-page *,
  .europe-page *::before,
  .europe-page *::after { box-sizing: border-box; }
  .europe-page h1,
  .europe-page h2,
  .europe-page h3,
  .europe-page p,
  .europe-page ul { margin: 0; padding: 0; }
  .europe-page ul { list-style: none; }
  .europe-page a { color: inherit; }

  /* HERO */
  .europe-page .hero {
    background: var(--ink);
    color: var(--cream);
    padding: 64px 40px 56px;
    position: relative;
    overflow: hidden;
  }
  .europe-page .hero::before {
    content: '';
    position: absolute;
    inset: 0;
    background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
  }
  .europe-page .hero-inner { max-width: 900px; margin: 0 auto; position: relative; }
  .europe-page .hero-flags { font-size: 32px; letter-spacing: 8px; margin-bottom: 16px; }
  .europe-page .hero h1 {
    font-family: 'Playfair Display', serif;
    font-size: clamp(36px, 6vw, 64px);
    font-weight: 700;
    line-height: 1.1;
    margin-bottom: 12px;
    color: var(--cream);
  }
  .europe-page .hero-sub {
    color: var(--gold);
    font-family: 'DM Mono', monospace;
    font-size: 13px;
    letter-spacing: 3px;
    text-transform: uppercase;
    margin-bottom: 24px;
  }
  .europe-page .hero-travelers { display: flex; gap: 8px; flex-wrap: wrap; }
  .europe-page .traveler-tag {
    background: rgba(255,255,255,0.1);
    border: 1px solid rgba(255,255,255,0.2);
    padding: 4px 14px;
    border-radius: 20px;
    font-size: 13px;
    color: rgba(255,255,255,0.8);
  }

  /* LAYOUT */
  .europe-page .container { max-width: 900px; margin: 0 auto; padding: 0 24px; }

  /* QUICK REF BAR */
  .europe-page .quick-ref { background: var(--gold); padding: 20px 24px; }
  .europe-page .quick-ref-inner {
    max-width: 900px; margin: 0 auto;
    display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
    gap: 16px;
  }
  .europe-page .qr-item { text-align: center; }
  .europe-page .qr-label {
    font-size: 10px; text-transform: uppercase; letter-spacing: 2px;
    opacity: 0.7; font-weight: 600;
  }
  .europe-page .qr-code {
    font-family: 'DM Mono', monospace;
    font-size: 15px;
    font-weight: 500;
    color: var(--ink);
    display: block;
    margin-top: 2px;
  }

  /* SECTION HEADERS */
  .europe-page .section { padding: 48px 0 0; }
  .europe-page .section-title {
    display: flex; align-items: center; gap: 16px;
    margin-bottom: 28px;
  }
  .europe-page .section-title h2 {
    font-family: 'Playfair Display', serif;
    font-size: 26px;
    font-weight: 700;
  }

  /* DAY CARDS */
  .europe-page .day-card {
    border: 1px solid var(--border);
    border-radius: 12px;
    margin-bottom: 16px;
    overflow: hidden;
    background: white;
  }
  .europe-page .day-header {
    display: grid;
    grid-template-columns: 120px 1fr;
    align-items: stretch;
  }
  .europe-page .day-date {
    background: var(--ink);
    color: var(--cream);
    padding: 20px 16px;
    text-align: center;
    display: flex; flex-direction: column; justify-content: center;
  }
  .europe-page .day-dow {
    font-family: 'DM Mono', monospace;
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 2px;
    opacity: 0.5;
  }
  .europe-page .day-dd {
    font-family: 'Playfair Display', serif;
    font-size: 32px;
    line-height: 1;
    font-weight: 700;
    margin: 4px 0;
  }
  .europe-page .day-mon {
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 1px;
    opacity: 0.6;
  }
  .europe-page .day-content { padding: 20px 24px; }
  .europe-page .day-title {
    font-family: 'Playfair Display', serif;
    font-size: 18px;
    font-weight: 700;
    margin-bottom: 6px;
  }
  .europe-page .day-desc { font-size: 14px; color: var(--warm-gray); line-height: 1.6; }
  .europe-page .day-body { padding: 0 24px 24px; }

  /* INFO BLOCKS */
  .europe-page .info-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 12px;
    margin-top: 12px;
  }
  .europe-page .info-block {
    background: var(--paper);
    border-radius: 8px;
    padding: 14px 16px;
  }
  .europe-page .info-block-label {
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 2px;
    color: var(--warm-gray);
    font-weight: 600;
    margin-bottom: 4px;
  }
  .europe-page .info-block-value {
    font-size: 14px;
    font-weight: 500;
    color: var(--ink);
  }
  .europe-page .code {
    font-family: 'DM Mono', monospace;
    background: var(--ink);
    color: var(--gold);
    padding: 2px 8px;
    border-radius: 4px;
    font-size: 14px;
    font-weight: 500;
    display: inline-block;
  }
  .europe-page .code-sm {
    font-family: 'DM Mono', monospace;
    font-size: 13px;
    color: var(--rust);
    font-weight: 500;
  }

  /* SEAT CHART */
  .europe-page .seat-row {
    display: flex; gap: 8px; flex-wrap: wrap; margin-top: 8px;
  }
  .europe-page .seat-tag {
    background: var(--sky);
    color: white;
    font-family: 'DM Mono', monospace;
    font-size: 12px;
    padding: 3px 10px;
    border-radius: 4px;
    display: flex; gap: 6px; align-items: center;
  }
  .europe-page .seat-tag span { opacity: 0.7; font-size: 10px; }

  /* LINK BUTTONS */
  .europe-page a.link-btn {
    display: inline-flex; align-items: center; gap: 6px;
    background: var(--ink);
    color: var(--cream);
    text-decoration: none;
    padding: 8px 16px;
    border-radius: 6px;
    font-size: 13px;
    font-weight: 500;
    margin-top: 12px;
    transition: background 0.2s;
  }
  .europe-page a.link-btn:hover { background: var(--rust); }
  .europe-page a.link-btn.outline {
    background: transparent;
    color: var(--ink);
    border: 1.5px solid var(--border);
  }
  .europe-page a.link-btn.outline:hover { background: var(--paper); }
  .europe-page .link-row { display: flex; gap: 8px; flex-wrap: wrap; }

  /* PIN BOX */
  .europe-page .pin-box {
    display: inline-flex; align-items: center; gap: 8px;
    background: rgba(201,168,76,0.15);
    border: 1px solid rgba(201,168,76,0.4);
    padding: 6px 14px;
    border-radius: 6px;
    font-family: 'DM Mono', monospace;
    font-size: 18px;
    font-weight: 500;
    color: #7a5a0a;
    letter-spacing: 4px;
  }

  /* ATTRACTION LIST */
  .europe-page .attraction-list li {
    display: flex; gap: 12px; align-items: flex-start;
    padding: 10px 0;
    border-bottom: 1px solid var(--border);
    font-size: 14px;
  }
  .europe-page .attraction-list li:last-child { border-bottom: none; }
  .europe-page .attr-emoji {
    font-size: 18px; flex-shrink: 0; width: 28px; text-align: center; margin-top: 1px;
  }
  .europe-page .attr-content strong { display: block; font-weight: 600; margin-bottom: 2px; }
  .europe-page .attr-content p { color: var(--warm-gray); font-size: 13px; line-height: 1.5; }
  .europe-page .attr-tip {
    display: inline-block;
    background: rgba(200,80,42,0.1);
    color: var(--rust);
    font-size: 11px;
    padding: 2px 8px;
    border-radius: 4px;
    margin-top: 4px;
    font-weight: 500;
  }

  /* WARNING / OK CARDS */
  .europe-page .warning-card {
    background: rgba(200,80,42,0.06);
    border: 1px solid rgba(200,80,42,0.25);
    border-radius: 10px;
    padding: 16px 20px;
    margin-bottom: 12px;
    display: flex; gap: 14px;
  }
  .europe-page .warning-icon { font-size: 20px; flex-shrink: 0; }
  .europe-page .warning-text { font-size: 14px; line-height: 1.6; }
  .europe-page .warning-text strong { font-weight: 600; display: block; margin-bottom: 3px; }
  .europe-page .ok-card {
    background: rgba(90,122,94,0.06);
    border: 1px solid rgba(90,122,94,0.25);
    border-radius: 10px;
    padding: 16px 20px;
    margin-bottom: 12px;
    display: flex; gap: 14px;
  }

  /* DIVIDER */
  .europe-page .divider {
    border: none;
    border-top: 1px solid var(--border);
    margin: 48px 0 0;
  }

  /* SUMMARY TABLE */
  .europe-page .summary-table { width: 100%; border-collapse: collapse; margin-top: 12px; }
  .europe-page .summary-table th {
    background: var(--ink); color: var(--cream);
    font-size: 11px; text-transform: uppercase; letter-spacing: 2px;
    padding: 12px 16px; text-align: left; font-weight: 500;
  }
  .europe-page .summary-table td {
    padding: 12px 16px; font-size: 14px; border-bottom: 1px solid var(--border);
  }
  .europe-page .summary-table tr:last-child td { border-bottom: none; }
  .europe-page .summary-table tr:nth-child(even) td { background: var(--paper); }

  /* FOOTER */
  .europe-page .footer {
    background: var(--ink);
    color: rgba(255,255,255,0.5);
    text-align: center;
    padding: 32px;
    font-size: 13px;
    margin-top: 64px;
  }
  .europe-page .footer strong { color: var(--gold); }

  @media (max-width: 600px) {
    .europe-page .day-header { grid-template-columns: 90px 1fr; }
    .europe-page .hero { padding: 40px 20px; }
    .europe-page .quick-ref-inner { grid-template-columns: repeat(2, 1fr); }
  }
`

const HTML_BODY = `
<div class="hero">
  <div class="hero-inner">
    <div class="hero-flags">🇪🇸 🇮🇹</div>
    <div class="hero-sub">April 23 – May 2, 2026 · Full Trip Breakdown</div>
    <h1>Spain &amp; Italy 2026</h1>
    <div class="hero-travelers">
      <span class="traveler-tag">Jeffery Erhunse</span>
      <span class="traveler-tag">Candida Contreras</span>
      <span class="traveler-tag">Elias Contreras</span>
      <span class="traveler-tag">Sasha Contreras</span>
      <span class="traveler-tag">Daniel De Leon</span>
    </div>
  </div>
</div>

<div class="quick-ref">
  <div class="quick-ref-inner">
    <div class="qr-item"><div class="qr-label">British Airways</div><span class="qr-code">Z7QPMO</span></div>
    <div class="qr-item"><div class="qr-label">Wizz Air</div><span class="qr-code">RPDMRQ</span></div>
    <div class="qr-item"><div class="qr-label">Car Rental</div><span class="qr-code">722774999</span></div>
    <div class="qr-item"><div class="qr-label">Burriana Stay 1</div><span class="qr-code">6232644312</span></div>
    <div class="qr-item"><div class="qr-label">Albano Hotel</div><span class="qr-code">1658109125204609</span></div>
    <div class="qr-item"><div class="qr-label">Naples Airbnb</div><span class="qr-code">HMSMDTQXYR</span></div>
    <div class="qr-item"><div class="qr-label">Burriana Stay 2</div><span class="qr-code">5948432910</span></div>
  </div>
</div>

<div class="container">

  <div class="section">
    <div class="section-title"><h2>Day-by-Day Itinerary</h2></div>

    <!-- APR 23 -->
    <div class="day-card">
      <div class="day-header">
        <div class="day-date">
          <div class="day-dow">Thu</div>
          <div class="day-dd">23</div>
          <div class="day-mon">Apr</div>
        </div>
        <div class="day-content">
          <div class="day-title">✈️ Depart Atlanta → London</div>
          <div class="day-desc">Wheels up from ATL at 10:25 PM. Long overnight haul to Heathrow Terminal 3.</div>
        </div>
      </div>
      <div class="day-body">
        <div class="info-grid">
          <div class="info-block"><div class="info-block-label">Flight</div><div class="info-block-value">BA0226 — World Traveller (Economy)</div></div>
          <div class="info-block"><div class="info-block-label">Departs</div><div class="info-block-value">22:25 · ATL Terminal I</div></div>
          <div class="info-block"><div class="info-block-label">Arrives</div><div class="info-block-value">Fri Apr 24 · 11:40 · LHR T3</div></div>
          <div class="info-block"><div class="info-block-label">Duration</div><div class="info-block-value">~9 hrs 15 min</div></div>
          <div class="info-block"><div class="info-block-label">Booking Ref</div><div class="info-block-value"><span class="code">Z7QPMO</span></div></div>
          <div class="info-block"><div class="info-block-label">Seats</div><div class="info-block-value">26D · 26E · 26F · 26G</div></div>
        </div>
        <div class="seat-row" style="margin-top:12px;">
          <div class="seat-tag">26D <span>Jeffery</span></div>
          <div class="seat-tag">26E <span>Sasha</span></div>
          <div class="seat-tag">26F <span>Elias</span></div>
          <div class="seat-tag">26G <span>Candida</span></div>
        </div>
        <div class="link-row">
          <a class="link-btn" href="https://www.britishairways.com/travel/managebooking/public/en_us" target="_blank" rel="noreferrer">↗ Manage BA Booking</a>
        </div>
      </div>
    </div>

    <!-- APR 24 -->
    <div class="day-card">
      <div class="day-header">
        <div class="day-date" style="background:#c8502a;">
          <div class="day-dow">Fri</div>
          <div class="day-dd">24</div>
          <div class="day-mon">Apr</div>
        </div>
        <div class="day-content">
          <div class="day-title">🇪🇸 Arrive Valencia · Pick Up Car · Burriana Check-In</div>
          <div class="day-desc">London to Valencia then straight to your Burriana home base. Car rental from VLC airport at 19:30.</div>
        </div>
      </div>
      <div class="day-body">
        <p style="font-size:13px;color:#8a7f72;margin-bottom:12px;"><strong style="color:#1a1410;">London → Valencia (BA0408)</strong> · Departs LHR T3 at 16:05 · Arrives VLC 19:30 · ~4h 25min layover at Heathrow</p>
        <div class="info-grid">
          <div class="info-block"><div class="info-block-label">Booking Ref</div><div class="info-block-value"><span class="code">Z7QPMO</span></div></div>
          <div class="info-block"><div class="info-block-label">⚠️ Baggage Note</div><div class="info-block-value">Hand baggage ONLY on BA. Pre-purchase bags at ba.com: $70 (1st) / $90 (2nd)</div></div>
        </div>

        <div style="margin-top:20px; padding-top:20px; border-top: 1px solid #d4c8b8;">
          <p style="font-size:13px;font-weight:600;margin-bottom:10px;">🚗 Car Pickup — Centauro Rent a Car</p>
          <div class="info-grid">
            <div class="info-block"><div class="info-block-label">Booking Ref</div><div class="info-block-value"><span class="code">722774999</span></div></div>
            <div class="info-block"><div class="info-block-label">Vehicle</div><div class="info-block-value">Cupra Formentor or similar</div></div>
            <div class="info-block"><div class="info-block-label">Pick-Up</div><div class="info-block-value">19:30 · Valencia Airport (VLC)</div></div>
            <div class="info-block"><div class="info-block-label">Drop-Off</div><div class="info-block-value">May 2 · 10:00 AM · VLC Airport</div></div>
            <div class="info-block"><div class="info-block-label">Insurance</div><div class="info-block-value">RentalCover Full Protection ✓</div></div>
            <div class="info-block"><div class="info-block-label">Cost</div><div class="info-block-value">USD $247.08 (Paid)</div></div>
          </div>
          <div class="link-row">
            <a class="link-btn outline" href="https://www.booking.com/cars.html" target="_blank" rel="noreferrer">↗ Booking.com Cars</a>
            <a class="link-btn outline" href="https://www.centauro.net/" target="_blank" rel="noreferrer">↗ Centauro Rent a Car</a>
          </div>
        </div>

        <div style="margin-top:20px; padding-top:20px; border-top: 1px solid #d4c8b8;">
          <p style="font-size:13px;font-weight:600;margin-bottom:10px;">🏠 Check-In — Burriana Apartment (3 nights)</p>
          <div class="info-grid">
            <div class="info-block"><div class="info-block-label">Confirmation</div><div class="info-block-value"><span class="code">6232644312</span></div></div>
            <div class="info-block"><div class="info-block-label">Door PIN</div><div class="info-block-value"><span class="pin-box">1302</span></div></div>
            <div class="info-block"><div class="info-block-label">Check-In Window</div><div class="info-block-value">16:00 – 20:00</div></div>
            <div class="info-block"><div class="info-block-label">Address</div><div class="info-block-value">Carretera d'Artana, 12530 Burriana, Spain</div></div>
            <div class="info-block"><div class="info-block-label">Host Phone</div><div class="info-block-value">+34 604 16 66 08</div></div>
          </div>
          <div class="link-row">
            <a class="link-btn outline" href="https://www.google.com/maps/search/Carretera+d'Artana,+12530+Burriana,+Spain" target="_blank" rel="noreferrer">📍 Maps</a>
            <a class="link-btn outline" href="https://www.booking.com/myreservations.html" target="_blank" rel="noreferrer">↗ Booking.com Reservations</a>
          </div>
        </div>
      </div>
    </div>

    <!-- APR 25 — VALENCIA -->
    <div class="day-card" style="border-color:#c9a84c; border-width:2px;">
      <div class="day-header">
        <div class="day-date" style="background:#c9a84c;">
          <div class="day-dow" style="color:rgba(0,0,0,0.5);">Sat</div>
          <div class="day-dd" style="color:#1a1410;">25</div>
          <div class="day-mon" style="color:rgba(0,0,0,0.5);">Apr</div>
        </div>
        <div class="day-content">
          <div class="day-title">🍊 Day Trip — Valencia City</div>
          <div class="day-desc">Only 30 min from Burriana. Valencia's historic core, futuristic architecture, and the birthplace of paella.</div>
        </div>
      </div>
      <div class="day-body">
        <ul class="attraction-list">
          <li><div class="attr-emoji">🏛️</div><div class="attr-content"><strong>Ciudad de las Artes y las Ciencias</strong><p>Calatrava's futuristic complex along the old Turia riverbed — includes Europe's largest aquarium. Start here first thing. Open 10 AM – 6 PM.</p><span class="attr-tip">⏱ Allow 2-3 hours</span></div></li>
          <li><div class="attr-emoji">⛪</div><div class="attr-content"><strong>Valencia Cathedral (La Seu)</strong><p>Multi-style Gothic cathedral claiming to house the Holy Grail. €10 entry. Climb the Miguelete Tower (+€2) for city panoramas.</p><span class="attr-tip">Book online to skip queues</span></div></li>
          <li><div class="attr-emoji">🏰</div><div class="attr-content"><strong>La Lonja de la Seda</strong><p>UNESCO Gothic silk exchange with extraordinary twisted columns. Only €2 entry. Right next door to the Cathedral.</p><span class="attr-tip">Open Sat 10 AM – 7 PM</span></div></li>
          <li><div class="attr-emoji">🥘</div><div class="attr-content"><strong>Lunch: Authentic Paella near the Port</strong><p>Valencia is where paella was invented — don't skip it. Head to the Malvarrosa beachfront or El Palmar village for the real deal.</p></div></li>
          <li><div class="attr-emoji">🏖️</div><div class="attr-content"><strong>Malvarrosa Beach (Optional)</strong><p>Valencia's main urban beach is just a few minutes from the port. Good way to end an afternoon before heading back to Burriana.</p></div></li>
        </ul>
        <div class="link-row" style="margin-top:16px;">
          <a class="link-btn" href="https://cac.es/" target="_blank" rel="noreferrer">↗ City of Arts Tickets</a>
          <a class="link-btn outline" href="https://catedraldevalencia.es/" target="_blank" rel="noreferrer">↗ Cathedral Tickets</a>
          <a class="link-btn outline" href="https://www.google.com/maps/dir/Burriana,+Spain/Valencia,+Spain" target="_blank" rel="noreferrer">📍 Directions Burriana → Valencia</a>
        </div>
      </div>
    </div>

    <!-- APR 26 — BARCELONA -->
    <div class="day-card" style="border-color:#3a6b8a; border-width:2px;">
      <div class="day-header">
        <div class="day-date" style="background:#3a6b8a;">
          <div class="day-dow">Sun</div>
          <div class="day-dd">26</div>
          <div class="day-mon">Apr</div>
        </div>
        <div class="day-content">
          <div class="day-title">🎨 Day Trip — Barcelona (Gaudí Day)</div>
          <div class="day-desc">~3 hrs by car or ~1.5 hrs on the AVE high-speed train from Valencia. The train is strongly recommended.</div>
        </div>
      </div>
      <div class="day-body">
        <div class="warning-card" style="background:rgba(58,107,138,0.06);border-color:rgba(58,107,138,0.25);margin-bottom:16px;">
          <div class="warning-icon">🚆</div>
          <div class="warning-text"><strong>Take the AVE Train (Highly Recommended)</strong>Valencia (Joaquín Sorolla) → Barcelona (Sants) · ~1.5 hrs · From ~€20-40. Avoids all Barcelona parking stress. Buy tickets at Renfe.com as early as possible.</div>
        </div>
        <ul class="attraction-list">
          <li><div class="attr-emoji">⛪</div><div class="attr-content"><strong>Sagrada Família</strong><p>Gaudí's still-unfinished masterpiece. Book tickets WELL in advance — they sell out weeks ahead. Sunday opens later at 10:30 AM. Plan 2+ hours inside.</p><span class="attr-tip">🔴 Book ahead — sells out!</span></div></li>
          <li><div class="attr-emoji">🦎</div><div class="attr-content"><strong>Park Güell</strong><p>Mosaic terraces, organic architecture, and sweeping views over Barcelona. The Monumental Zone requires tickets; rest of the park is free. Takes ~20 min from city by bus/taxi.</p><span class="attr-tip">Book timed entry at parkguell.barcelona</span></div></li>
          <li><div class="attr-emoji">🏠</div><div class="attr-content"><strong>Passeig de Gràcia Stroll + Casa Batlló</strong><p>Walk the famous boulevard and marvel at Casa Batlló's surreal dragon-scale facade. Going inside is spectacular but pricey (~€35). Even free from the sidewalk it's unforgettable.</p></div></li>
          <li><div class="attr-emoji">🍢</div><div class="attr-content"><strong>Evening Pintxos in El Born or Gràcia</strong><p>Wind down with pintxos and cañas before your return train. The El Born barrio has excellent bars packed close together.</p></div></li>
        </ul>
        <div class="link-row" style="margin-top:16px;">
          <a class="link-btn" href="https://sagradafamilia.org/" target="_blank" rel="noreferrer">↗ Sagrada Família Tickets</a>
          <a class="link-btn outline" href="https://parkguell.barcelona/" target="_blank" rel="noreferrer">↗ Park Güell Tickets</a>
          <a class="link-btn outline" href="https://www.renfe.com/es/en" target="_blank" rel="noreferrer">🚆 Renfe AVE Tickets</a>
          <a class="link-btn outline" href="https://www.casabatllo.es/" target="_blank" rel="noreferrer">↗ Casa Batlló</a>
        </div>
      </div>
    </div>

    <!-- APR 27 -->
    <div class="day-card">
      <div class="day-header">
        <div class="day-date" style="background:#2d6e4e;">
          <div class="day-dow">Mon</div>
          <div class="day-dd">27</div>
          <div class="day-mon">Apr</div>
        </div>
        <div class="day-content">
          <div class="day-title">✈️ Fly Valencia → Rome · Hotel Villamaria Check-In</div>
          <div class="day-desc">Wizz Air afternoon departure. Check in at Albano Laziale (~30 min from Fiumicino). <strong style="color:#c8502a;">Non-refundable hotel.</strong></div>
        </div>
      </div>
      <div class="day-body">
        <div class="info-grid">
          <div class="info-block"><div class="info-block-label">Flight</div><div class="info-block-value">W4 6028 — Wizz Air</div></div>
          <div class="info-block"><div class="info-block-label">Departs</div><div class="info-block-value">15:25 · Valencia (VLC)</div></div>
          <div class="info-block"><div class="info-block-label">Arrives</div><div class="info-block-value">17:30 · Rome FCO Terminal 1</div></div>
          <div class="info-block"><div class="info-block-label">Wizz Air Ref</div><div class="info-block-value"><span class="code">RPDMRQ</span></div></div>
        </div>
        <div class="seat-row" style="margin-top:12px;">
          <div class="seat-tag" style="background:#2d6e4e;">5B <span>Jeffery</span></div>
          <div class="seat-tag" style="background:#2d6e4e;">5A <span>Sasha</span></div>
          <div class="seat-tag" style="background:#2d6e4e;">1F <span>Elias</span></div>
          <div class="seat-tag" style="background:#2d6e4e;">1E <span>Candida</span></div>
          <div class="seat-tag" style="background:#2d6e4e;">5C <span>Daniel</span></div>
        </div>

        <div style="margin-top:20px;padding-top:20px;border-top:1px solid #d4c8b8;">
          <p style="font-size:13px;font-weight:600;margin-bottom:10px;">🏨 Park Hotel Villamaria — Albano Laziale</p>
          <div class="info-grid">
            <div class="info-block"><div class="info-block-label">Trip.com Booking</div><div class="info-block-value"><span class="code-sm">1658109125204609</span></div></div>
            <div class="info-block"><div class="info-block-label">Hotel Conf.</div><div class="info-block-value">2378795551 / 2378795552</div></div>
            <div class="info-block"><div class="info-block-label">PIN (Do Not Share)</div><div class="info-block-value"><span class="pin-box">4268</span></div></div>
            <div class="info-block"><div class="info-block-label">Address</div><div class="info-block-value">Via del Mare, 263, Albano Laziale, 00041</div></div>
            <div class="info-block"><div class="info-block-label">Hotel Phone</div><div class="info-block-value">+39 389 250 3016</div></div>
            <div class="info-block"><div class="info-block-label">Check-In / Out</div><div class="info-block-value">From 14:30 / Out by 10:30</div></div>
            <div class="info-block"><div class="info-block-label">Cost</div><div class="info-block-value">USD $162.10 (Paid)</div></div>
            <div class="info-block"><div class="info-block-label">⚠️ Policy</div><div class="info-block-value" style="color:#c8502a;font-weight:600;">NON-REFUNDABLE</div></div>
          </div>
          <div class="link-row">
            <a class="link-btn outline" href="https://www.google.com/maps/search/Via+del+Mare+263+Albano+Laziale" target="_blank" rel="noreferrer">📍 Maps</a>
            <a class="link-btn outline" href="https://www.trip.com/mybooking" target="_blank" rel="noreferrer">↗ Trip.com My Booking</a>
            <a class="link-btn outline" href="https://www.wizzair.com" target="_blank" rel="noreferrer">↗ Wizz Air Check-In</a>
          </div>
        </div>
      </div>
    </div>

    <!-- APR 28 -->
    <div class="day-card">
      <div class="day-header">
        <div class="day-date" style="background:#2d6e4e;">
          <div class="day-dow">Tue</div>
          <div class="day-dd">28</div>
          <div class="day-mon">Apr</div>
        </div>
        <div class="day-content">
          <div class="day-title">🍕 Drive to Naples · Airbnb Check-In · 2 Nights</div>
          <div class="day-desc">~1 hr drive from Albano Laziale to Naples. Check out of Villamaria by 10:30 AM.</div>
        </div>
      </div>
      <div class="day-body">
        <div class="info-grid">
          <div class="info-block"><div class="info-block-label">Airbnb Code</div><div class="info-block-value"><span class="code">HMSMDTQXYR</span></div></div>
          <div class="info-block"><div class="info-block-label">Property</div><div class="info-block-value">Napoli Street Chiaia (Entire Home)</div></div>
          <div class="info-block"><div class="info-block-label">Address</div><div class="info-block-value">Vicoletto San Arpino, 6, Naples</div></div>
          <div class="info-block"><div class="info-block-label">Host</div><div class="info-block-value">Valentina</div></div>
          <div class="info-block"><div class="info-block-label">Check-In</div><div class="info-block-value">After 15:00 on Apr 28</div></div>
          <div class="info-block"><div class="info-block-label">Check-Out</div><div class="info-block-value">By 10:00 on Apr 30</div></div>
          <div class="info-block"><div class="info-block-label">Cost</div><div class="info-block-value">USD $327.41 incl. $20 travel insurance</div></div>
          <div class="info-block"><div class="info-block-label">Cancellation</div><div class="info-block-value">Free before Apr 23 15:00</div></div>
        </div>
        <div class="link-row">
          <a class="link-btn outline" href="https://www.airbnb.com/trips" target="_blank" rel="noreferrer">↗ View Airbnb Trip</a>
          <a class="link-btn outline" href="https://www.google.com/maps/search/Vicoletto+San+Arpino+6+Naples" target="_blank" rel="noreferrer">📍 Maps</a>
        </div>
        <p style="margin-top:16px;font-size:13px;color:#8a7f72;">🌋 <strong style="color:#1a1410;">Things to do in Naples:</strong> Pompeii + Vesuvius day trip (40 min by train), the National Archaeological Museum, Spaccanapoli street for street food, and Castel dell'Ovo waterfront at sunset. Book Pompeii tickets in advance.</p>
        <div class="link-row" style="margin-top:8px;">
          <a class="link-btn" href="https://pompeiisites.org/en/" target="_blank" rel="noreferrer">↗ Pompeii Official Tickets</a>
        </div>
      </div>
    </div>

    <!-- APR 30 -->
    <div class="day-card">
      <div class="day-header">
        <div class="day-date" style="background:#c8502a;">
          <div class="day-dow">Thu</div>
          <div class="day-dd">30</div>
          <div class="day-mon">Apr</div>
        </div>
        <div class="day-content">
          <div class="day-title">✈️ Fly Rome → Valencia · Burriana (Same Apt)</div>
          <div class="day-desc">Back to Spain! Afternoon flight then straight to your Burriana apartment for 2 more nights.</div>
        </div>
      </div>
      <div class="day-body">
        <div class="info-grid">
          <div class="info-block"><div class="info-block-label">Flight</div><div class="info-block-value">W4 6027 — Wizz Air</div></div>
          <div class="info-block"><div class="info-block-label">Departs</div><div class="info-block-value">12:35 · Rome FCO Terminal 1</div></div>
          <div class="info-block"><div class="info-block-label">Arrives</div><div class="info-block-value">14:45 · Valencia (VLC)</div></div>
          <div class="info-block"><div class="info-block-label">Wizz Air Ref</div><div class="info-block-value"><span class="code">RPDMRQ</span></div></div>
        </div>
        <div class="seat-row" style="margin-top:12px;">
          <div class="seat-tag" style="background:#2d6e4e;">5F <span>Jeffery</span></div>
          <div class="seat-tag" style="background:#2d6e4e;">5E <span>Sasha</span></div>
          <div class="seat-tag" style="background:#2d6e4e;">1F <span>Elias</span></div>
          <div class="seat-tag" style="background:#2d6e4e;">1E <span>Candida</span></div>
          <div class="seat-tag" style="background:#2d6e4e;">5D <span>Daniel</span></div>
        </div>
        <div style="margin-top:16px;padding-top:16px;border-top:1px solid #d4c8b8;">
          <p style="font-size:13px;font-weight:600;margin-bottom:8px;">🏠 Burriana Apt — Stay 2 (Same Apartment)</p>
          <div class="info-grid">
            <div class="info-block"><div class="info-block-label">Booking No.</div><div class="info-block-value"><span class="code">5948432910</span></div></div>
            <div class="info-block"><div class="info-block-label">Check-Out</div><div class="info-block-value">Sat May 2 by 10:00 AM</div></div>
            <div class="info-block"><div class="info-block-label">Cost</div><div class="info-block-value">EUR €278 (Paid Mar 22)</div></div>
          </div>
        </div>
      </div>
    </div>

    <!-- MAY 1 — MADRID -->
    <div class="day-card" style="border-color:#c8502a; border-width:2px;">
      <div class="day-header">
        <div class="day-date" style="background:#c8502a;">
          <div class="day-dow">Fri</div>
          <div class="day-dd">1</div>
          <div class="day-mon">May</div>
        </div>
        <div class="day-content">
          <div class="day-title">🏰 Day Trip — Madrid (Public Holiday!)</div>
          <div class="day-desc">Día del Trabajador (Labor Day). Madrid is lively but some attractions have reduced hours. Best reached by AVE train from Valencia.</div>
        </div>
      </div>
      <div class="day-body">
        <div class="warning-card" style="margin-bottom:16px;">
          <div class="warning-icon">📅</div>
          <div class="warning-text"><strong>May 1 is a Spanish National Holiday</strong>Expect festive streets but check Royal Palace hours — it may operate on reduced Sunday hours (closes 15:00). Retiro Park and Plaza Mayor are free and always open.</div>
        </div>
        <div class="warning-card" style="background:rgba(58,107,138,0.06);border-color:rgba(58,107,138,0.25);margin-bottom:16px;">
          <div class="warning-icon">🚆</div>
          <div class="warning-text"><strong>AVE Train Strongly Recommended (Same-Day Return!)</strong>Valencia → Madrid is ~1.5 hrs each way on the AVE. This is your last day before the flight home — you don't want to drive 3.5 hrs each way and be exhausted. Buy return tickets now at Renfe.com.</div>
        </div>
        <ul class="attraction-list">
          <li><div class="attr-emoji">☕</div><div class="attr-content"><strong>Plaza Mayor — Morning Coffee</strong><p>Madrid's stunning 17th-century square. Always open, always buzzing. Great spot to orient before heading out.</p></div></li>
          <li><div class="attr-emoji">🏰</div><div class="attr-content"><strong>Royal Palace of Madrid</strong><p>Europe's largest royal palace — 3,000 rooms, lavish state halls, incredible art. Book tickets online in advance. May close early on May 1, so check hours.</p><span class="attr-tip">⚠️ Check May 1 holiday hours before booking</span></div></li>
          <li><div class="attr-emoji">🌳</div><div class="attr-content"><strong>El Retiro Park</strong><p>Perfect May afternoon: rent a rowboat on the lake, stroll through the rose garden, or just sit and people-watch. Free entry, always magical.</p></div></li>
          <li><div class="attr-emoji">🍷</div><div class="attr-content"><strong>Tapas in La Latina</strong><p>The La Latina neighborhood near the palace has some of Madrid's best tapas bars. Calle Cava Baja is the main strip — hop bar to bar for cañas and tostas.</p></div></li>
        </ul>
        <div class="link-row" style="margin-top:16px;">
          <a class="link-btn" href="https://www.renfe.com/es/en" target="_blank" rel="noreferrer">🚆 Book AVE Train</a>
          <a class="link-btn outline" href="https://www.patrimonionacional.es/visita/palacio-real-de-madrid" target="_blank" rel="noreferrer">↗ Royal Palace Tickets</a>
          <a class="link-btn outline" href="https://www.esmadrid.com/" target="_blank" rel="noreferrer">↗ Madrid Tourism</a>
        </div>
      </div>
    </div>

    <!-- MAY 2 -->
    <div class="day-card">
      <div class="day-header">
        <div class="day-date">
          <div class="day-dow">Sat</div>
          <div class="day-dd">2</div>
          <div class="day-mon">May</div>
        </div>
        <div class="day-content">
          <div class="day-title">✈️ Fly Home — Valencia → London → Atlanta</div>
          <div class="day-desc">⚠️ Drop car by 10:00 AM sharp. Very tight morning. Check out of Burriana first, then airport.</div>
        </div>
      </div>
      <div class="day-body">
        <div class="warning-card">
          <div class="warning-icon">⏰</div>
          <div class="warning-text"><strong>Critical Morning Timeline</strong>Check out by 10:00 AM → Drop car at Centauro VLC by 10:00 AM → Check in for BA0407 departing 11:15 AM. Allow extra buffer — this is very tight!</div>
        </div>
        <div class="info-grid" style="margin-top:12px;">
          <div class="info-block"><div class="info-block-label">VLC → LHR</div><div class="info-block-value">BA0407 · Departs 11:15 · Arrives 12:55 LHR T3</div></div>
          <div class="info-block"><div class="info-block-label">LHR → ATL</div><div class="info-block-value">BA0227 · Departs 16:10 · Arrives 20:30 ATL</div></div>
          <div class="info-block"><div class="info-block-label">Booking Ref</div><div class="info-block-value"><span class="code">Z7QPMO</span></div></div>
          <div class="info-block"><div class="info-block-label">Layover</div><div class="info-block-value">~3 hrs 15 min at Heathrow T3</div></div>
        </div>
        <div class="seat-row" style="margin-top:12px;">
          <div class="seat-tag">26D <span>Jeffery</span></div>
          <div class="seat-tag">26E <span>Sasha</span></div>
          <div class="seat-tag">26F <span>Elias</span></div>
          <div class="seat-tag">26G <span>Candida</span></div>
        </div>
        <div class="link-row">
          <a class="link-btn" href="https://www.britishairways.com/travel/managebooking/public/en_us" target="_blank" rel="noreferrer">↗ BA Online Check-In</a>
        </div>
      </div>
    </div>

  </div>

  <hr class="divider" />

  <!-- BOOKING SUMMARY -->
  <div class="section">
    <div class="section-title"><h2>📋 All Booking Codes at a Glance</h2></div>
    <table class="summary-table">
      <thead>
        <tr>
          <th>What</th>
          <th>Code / Reference</th>
          <th>Provider</th>
          <th>Amount</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        <tr><td>✈️ BA Flights ATL ↔ VLC (4 legs)</td><td><span class="code">Z7QPMO</span></td><td>British Airways</td><td>USD $4,208.44</td><td>✅ Paid</td></tr>
        <tr><td>✈️ Wizz Air VLC ↔ FCO (2 legs)</td><td><span class="code">RPDMRQ</span></td><td>Wizz Air</td><td>—</td><td>✅ Confirmed</td></tr>
        <tr><td>🚗 Car Rental (8 days, VLC)</td><td><span class="code">722774999</span></td><td>Booking.com / Centauro</td><td>USD $247.08</td><td>✅ Paid</td></tr>
        <tr><td>🏠 Burriana Apt — Stay 1 (3 nts)</td><td><span class="code">6232644312</span> · PIN: <span class="pin-box" style="font-size:14px;padding:2px 10px;letter-spacing:2px;">1302</span></td><td>Booking.com</td><td>—</td><td>✅ Flexible</td></tr>
        <tr><td>🏨 Park Hotel Villamaria, Albano (1 nt)</td><td><span class="code-sm">1658109125204609</span> · PIN: <span class="pin-box" style="font-size:14px;padding:2px 10px;letter-spacing:2px;">4268</span></td><td>Trip.com</td><td>USD $162.10</td><td><span style="color:#c8502a;font-weight:600;">⚠️ Non-Refundable</span></td></tr>
        <tr><td>🏠 Naples Airbnb — Chiaia (2 nts)</td><td><span class="code">HMSMDTQXYR</span></td><td>Airbnb</td><td>USD $327.41</td><td>✅ Free cancel before Apr 23</td></tr>
        <tr><td>🏠 Burriana Apt — Stay 2 (2 nts)</td><td><span class="code">5948432910</span></td><td>Booking.com</td><td>EUR €278</td><td>✅ Paid</td></tr>
      </tbody>
    </table>
  </div>

  <hr class="divider" />

  <!-- WARNINGS -->
  <div class="section">
    <div class="section-title"><h2>⚠️ Must-Know Reminders</h2></div>

    <div class="warning-card">
      <div class="warning-icon">🧳</div>
      <div class="warning-text"><strong>BA: Hand Baggage ONLY</strong>British Airways flights include no checked bags. Pre-pay extra bags online at ba.com: $70 (1st bag) / $90 (2nd bag) vs $75/$100 at the airport.
        <div class="link-row" style="margin-top:8px;"><a class="link-btn outline" href="https://www.britishairways.com/en-gb/information/baggage-essentials/checked-baggage" target="_blank" rel="noreferrer">↗ BA Baggage Info</a></div>
      </div>
    </div>

    <div class="warning-card">
      <div class="warning-icon">🧳</div>
      <div class="warning-text"><strong>Wizz Air Baggage: Small Bag + Cabin Bag per Person</strong>1 small bag (40×30×20 cm) + 1 cabin bag (55×40×23 cm) per passenger. No checked luggage included.
        <div class="link-row" style="margin-top:8px;"><a class="link-btn outline" href="https://wizzair.com/en-gb/information-and-services/services/baggage" target="_blank" rel="noreferrer">↗ Wizz Air Baggage Policy</a></div>
      </div>
    </div>

    <div class="warning-card">
      <div class="warning-icon">🚗</div>
      <div class="warning-text"><strong>Car on April 27 — Parking Before Wizz Air Departure</strong>You need to park or leave the car before your 15:25 VLC departure. Confirm parking/drop-off arrangements with Centauro in advance. The car is not due back until May 2.</div>
    </div>

    <div class="warning-card">
      <div class="warning-icon">⏰</div>
      <div class="warning-text"><strong>May 2 Morning: Car Drop-Off Before 10:00 AM SHARP</strong>Your flight departs 11:15 AM. Return car to Centauro VLC by 10:00 AM and clear the terminal. This is very tight — pack and check out the night before.</div>
    </div>

    <div class="warning-card">
      <div class="warning-icon">📄</div>
      <div class="warning-text"><strong>Park Hotel Villamaria: Bring Your Voucher</strong>A check-in voucher was attached to your Trip.com confirmation email. Print it or save offline — needed at check-in. Hotel is fully non-refundable.</div>
    </div>

    <div class="ok-card">
      <div class="warning-icon">💳</div>
      <div class="warning-text"><strong>Currency: EUR for Spain &amp; Italy</strong>Notify your bank before traveling. Burriana Stay 2 was charged in EUR (€278). Keep some cash on hand — smaller towns and local restaurants may be cash-preferred.</div>
    </div>

    <div class="ok-card">
      <div class="warning-icon">🛡️</div>
      <div class="warning-text"><strong>Travel Insurance Active (Expedia, purchased Feb 2026)</strong>Review your policy details before you go. The Naples Airbnb also includes $20 Generali travel insurance.</div>
    </div>
  </div>

  <!-- QUICK LINKS -->
  <div class="section" style="padding-bottom:64px;">
    <div class="section-title"><h2>🔗 Quick Links</h2></div>
    <div style="display:flex;flex-wrap:wrap;gap:10px;">
      <a class="link-btn" href="https://www.britishairways.com/travel/managebooking/public/en_us" target="_blank" rel="noreferrer">✈️ Manage BA (Z7QPMO)</a>
      <a class="link-btn" href="https://wizzair.com/en-gb/check-in/flight-check-in" target="_blank" rel="noreferrer">✈️ Wizz Air Check-In (RPDMRQ)</a>
      <a class="link-btn outline" href="https://www.booking.com/myreservations.html" target="_blank" rel="noreferrer">🏠 Booking.com Reservations</a>
      <a class="link-btn outline" href="https://www.airbnb.com/trips" target="_blank" rel="noreferrer">🏠 Airbnb Trips (HMSMDTQXYR)</a>
      <a class="link-btn outline" href="https://www.trip.com/mybooking" target="_blank" rel="noreferrer">🏨 Trip.com Booking</a>
      <a class="link-btn outline" href="https://www.centauro.net/" target="_blank" rel="noreferrer">🚗 Centauro Car Rental</a>
      <a class="link-btn outline" href="https://www.renfe.com/es/en" target="_blank" rel="noreferrer">🚆 Renfe AVE Trains</a>
      <a class="link-btn outline" href="https://sagradafamilia.org/" target="_blank" rel="noreferrer">⛪ Sagrada Família Tickets</a>
      <a class="link-btn outline" href="https://cac.es/" target="_blank" rel="noreferrer">🏛️ Valencia City of Arts</a>
      <a class="link-btn outline" href="https://pompeiisites.org/en/" target="_blank" rel="noreferrer">🌋 Pompeii Tickets</a>
      <a class="link-btn outline" href="https://www.patrimonionacional.es/visita/palacio-real-de-madrid" target="_blank" rel="noreferrer">🏰 Madrid Royal Palace</a>
    </div>
  </div>
</div>

<div class="footer">
  <strong>Spain &amp; Italy 2026</strong> · April 23 – May 2 · Jeffery Erhunse &amp; Family<br />
  <span style="opacity:0.5;font-size:11px;margin-top:4px;display:block;">Generated from your uploaded itinerary · Keep this page saved for offline access</span>
</div>
`

export default function EuropePage() {
  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap"
        rel="stylesheet"
      />
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div
        className="europe-page"
        dangerouslySetInnerHTML={{ __html: HTML_BODY }}
      />
    </>
  )
}
