import type { Metadata } from "next"
import { prisma } from "@/lib/prisma"

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://jeffandsasha.com"

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: "Jeffery & Sasha's Wedding — Join Us Virtually",
  description:
    "Join our wedding live on Zoom, June 26, 2026 at 3:00 PM ET. View our registry.",
  openGraph: {
    title: "Jeffery & Sasha's Wedding — Join Us Virtually",
    description:
      "Join our wedding live on Zoom, June 26, 2026 at 3:00 PM ET. View our registry.",
    url: "/virtual",
    type: "website",
    siteName: "Jeffery & Sasha's Wedding",
  },
  twitter: {
    card: "summary_large_image",
    title: "Jeffery & Sasha's Wedding — Join Us Virtually",
    description:
      "Join our wedding live on Zoom, June 26, 2026 at 3:00 PM ET. View our registry.",
  },
}

const ZOOM_JOIN_URL =
  "https://us05web.zoom.us/j/86746164396?pwd=jBbAvbRnIPnyxXC3ks7Hpk7RrBfISg.1"
const ZOOM_MEETING_ID = "867 4616 4396"
const ZOOM_PASSCODE = "7wfMyh"
const DEFAULT_REGISTRY_URL =
  "https://www.amazon.com/wedding/guest-view/1JFLEJMAOAH27"

const CSS = `
  .virtual-page {
    background: #1a1a1a;
    display: flex;
    justify-content: center;
    align-items: flex-start;
    min-height: 100vh;
    padding: 40px 20px;
    font-family: var(--font-cormorant), 'Cormorant Garamond', Georgia, serif;
    color: #e8d9b0;
  }
  .virtual-page *,
  .virtual-page *::before,
  .virtual-page *::after {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  .virtual-page .flyer {
    background-color: #1e3a2f;
    background-image:
      radial-gradient(ellipse at 20% 20%, rgba(255,255,255,0.03) 0%, transparent 60%),
      radial-gradient(ellipse at 80% 80%, rgba(0,0,0,0.2) 0%, transparent 60%);
    width: 100%;
    max-width: 680px;
    padding: 40px 24px 45px;
    position: relative;
    color: #e8d9b0;
  }

  @media (min-width: 640px) {
    .virtual-page .flyer {
      padding: 50px 60px 55px;
    }
  }

  .virtual-page .flyer::before {
    content: '';
    position: absolute;
    inset: 14px;
    border: 1px solid rgba(210, 185, 120, 0.5);
    pointer-events: none;
  }
  .virtual-page .flyer::after {
    content: '';
    position: absolute;
    inset: 20px;
    border: 1px solid rgba(210, 185, 120, 0.25);
    pointer-events: none;
  }

  .virtual-page .ornament {
    text-align: center;
    margin-bottom: 28px;
    font-size: 28px;
    color: #c9a84c;
    line-height: 1;
  }

  .virtual-page .preamble {
    text-align: center;
    font-size: 11px;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    color: #c9b890;
    line-height: 1.9;
    margin-bottom: 28px;
  }

  .virtual-page .names {
    text-align: center;
    margin-bottom: 22px;
  }
  .virtual-page .names .name {
    font-size: clamp(36px, 8vw, 52px);
    font-weight: 300;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: #e8d9b0;
    line-height: 1.1;
  }
  .virtual-page .names .ampersand {
    font-family: 'Great Vibes', cursive;
    font-size: clamp(36px, 7vw, 46px);
    color: #c9a84c;
    display: block;
    line-height: 1.3;
  }

  .virtual-page .date {
    text-align: center;
    font-size: 22px;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: #e8d9b0;
    margin-bottom: 34px;
  }

  .virtual-page .divider {
    display: flex;
    align-items: center;
    gap: 14px;
    margin: 0 auto 30px;
    width: 80%;
  }
  .virtual-page .divider::before,
  .virtual-page .divider::after {
    content: '';
    flex: 1;
    height: 1px;
    background: linear-gradient(to right, transparent, rgba(201,168,76,0.6), transparent);
  }
  .virtual-page .divider span {
    color: #c9a84c;
    font-size: 16px;
  }

  .virtual-page .section {
    background: rgba(0,0,0,0.2);
    border: 1px solid rgba(201,168,76,0.25);
    border-radius: 2px;
    padding: 28px 32px;
    margin-bottom: 18px;
    text-align: center;
  }

  .virtual-page .section-label {
    font-size: 10px;
    letter-spacing: 0.28em;
    text-transform: uppercase;
    color: #c9a84c;
    margin-bottom: 14px;
  }

  .virtual-page .zoom-time {
    font-size: 18px;
    letter-spacing: 0.1em;
    color: #e8d9b0;
    margin-bottom: 6px;
  }
  .virtual-page .zoom-sub {
    font-size: 12px;
    letter-spacing: 0.12em;
    color: #c9b890;
    margin-bottom: 20px;
    text-transform: uppercase;
  }
  .virtual-page .zoom-meta {
    font-size: 13px;
    color: #c9b890;
    margin-bottom: 16px;
    line-height: 1.8;
    letter-spacing: 0.04em;
  }
  .virtual-page .zoom-meta span {
    color: #e8d9b0;
  }

  .virtual-page .btn {
    display: inline-block;
    padding: 11px 30px;
    font-family: var(--font-cormorant), 'Cormorant Garamond', serif;
    font-size: 12px;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    text-decoration: none;
    border: 1px solid rgba(201,168,76,0.7);
    color: #1e3a2f;
    background: #c9a84c;
    transition: background 0.2s, color 0.2s;
    margin-top: 4px;
  }
  .virtual-page .btn:hover {
    background: #e0c070;
  }
  .virtual-page .btn.outline {
    background: transparent;
    color: #c9a84c;
  }
  .virtual-page .btn.outline:hover {
    background: rgba(201,168,76,0.12);
  }

  .virtual-page .registry-text {
    font-size: 15px;
    color: #c9b890;
    line-height: 1.7;
    margin-bottom: 18px;
    font-style: italic;
  }

  .virtual-page .footer {
    text-align: center;
    margin-top: 30px;
  }
  .virtual-page .footer .script {
    font-family: 'Great Vibes', cursive;
    font-size: 32px;
    color: #c9b890;
    display: block;
    margin-bottom: 10px;
  }
  .virtual-page .footer .fine {
    font-size: 10px;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: rgba(200,185,144,0.5);
  }
`

async function getRegistryUrl(): Promise<string> {
  try {
    const wedding = await prisma.couple.findFirst({
      where: { isPublished: true },
      orderBy: { createdAt: "asc" },
      include: {
        registryLinks: {
          orderBy: { order: "asc" },
        },
      },
    })

    if (wedding && wedding.registryLinks.length > 0) {
      return wedding.registryLinks[0].url
    }
  } catch {
    // Fall back to hardcoded URL if DB is unavailable
  }

  return DEFAULT_REGISTRY_URL
}

export default async function VirtualAttendancePage() {
  const registryUrl = await getRegistryUrl()

  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=Great+Vibes&display=swap"
        rel="stylesheet"
      />
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="virtual-page">
        <div className="flyer">
          <div className="ornament">✦ ❧ ✦</div>

          <div className="preamble">
            The honour of your presence is requested
            <br />
            at the wedding of
          </div>

          <div className="names">
            <div className="name">Sasha Contreras</div>
            <span className="ampersand">and</span>
            <div className="name">Jeffery Erhunse</div>
          </div>

          <div className="date">26 &nbsp; June &nbsp; 2026</div>

          <div className="divider"><span>✦</span></div>

          <div className="section">
            <div className="section-label">📹 &nbsp; Join Us Virtually</div>
            <div className="zoom-time">Friday, June 26, 2026</div>
            <div className="zoom-sub">3:00 PM &nbsp;·&nbsp; Eastern Time</div>
            <div className="zoom-meta">
              Meeting ID: <span>{ZOOM_MEETING_ID}</span>
              <br />
              Passcode: <span>{ZOOM_PASSCODE}</span>
            </div>
            <a
              className="btn"
              href={ZOOM_JOIN_URL}
              target="_blank"
              rel="noopener noreferrer"
            >
              Join Zoom Meeting
            </a>
          </div>

          <div className="section">
            <div className="section-label">🎁 &nbsp; Wedding Registry</div>
            <div className="registry-text">
              Your love and presence is the greatest gift.
              <br />
              For those who wish to celebrate us further,
              <br />
              our registry is available below.
            </div>
            <a
              className="btn outline"
              href={registryUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              View Our Registry
            </a>
          </div>

          <div className="footer">
            <span className="script">We hope to see you there</span>
            <div className="fine">Jeffery &amp; Sasha · June 2026</div>
          </div>
        </div>
      </div>
    </>
  )
}
