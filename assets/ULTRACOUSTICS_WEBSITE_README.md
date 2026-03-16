# Ultracoustics Technologies Ltd. - Website Rebuild

## Overview

Rebuild the Ultracoustics website (currently at https://ultracoustics.ca) as a static site to be hosted on Cloudflare Pages. The current site is a managed WordPress site on GoDaddy that is overpriced and restrictive. The new site should be clean HTML/CSS/JS with no frameworks or static site generators -- just well-organized files.

The company is **Ultracoustics Technologies Ltd.**, an Edmonton-based deep tech startup that makes the **BROADSONIC** -- an optical ultrasonic sensor (microphone) with 5 MHz bandwidth that works non-contact in air. The core value proposition is: **conventional air-coupled ultrasonic microphones top out around 100 kHz. BROADSONIC extends that to 5 MHz -- 50x the bandwidth -- enabling access to acoustic information that previously required contact transducers or expensive lab setups.**

The audience is primarily engineers evaluating sensors for industrial applications: NDT, partial discharge monitoring, ultrasonic cleaning QA, and gas leak detection.

---

## Brand / Design Direction

### Current brand elements (keep these):
- **Primary accent color:** #FF4FC9 (hot pink/magenta)
- **Background:** Dark/black
- **Text:** White (#FFFFFF)
- **Font:** Inter (sans-serif)
- **Logo:** Ultracoustics wordmark with magenta triangle -- currently at `https://ultracoustics.ca/wp-content/uploads/2025/06/Untitled-LinkedIn-Post-6-4-e1749240510288.png`

### Design goals:
- Clean, dark, technical aesthetic. Think high-end instrumentation company, not SaaS startup.
- Minimal and direct. Engineers are the audience -- no fluff, no stock photos, no marketing-speak.
- Mobile responsive but desktop-first (most traffic will be LinkedIn clicks on desktop).
- Fast loading. No heavy JS frameworks. Minimal dependencies.
- Avoid generic "AI startup" aesthetics (gradient blobs, glassmorphism, etc.).
- Do NOT use em-dashes anywhere in copy. Use commas, periods, or rewrite.

---

## Site Structure

```
/
├── index.html              # Homepage
├── broadsonic.html         # Product page
├── leak-detection.html     # Application page
├── partial-discharge.html  # Application page
├── ultrasonic-cleaning.html # Application page
├── research.html           # Publications + Whitepapers
├── team.html               # Team + Partners
├── media.html              # Videos + Press
├── contact.html            # Contact form + info
├── privacy-policy.html     # Privacy policy
├── css/
│   └── style.css           # Shared stylesheet
├── js/
│   └── main.js             # Minimal shared JS (mobile nav, counters, etc.)
├── assets/
│   ├── images/             # Product photos, team photos, partner logos
│   ├── docs/               # PDFs (datasheet, app notes, papers)
│   └── demos/              # Interactive HTML demos (transducer scan report, etc.)
└── README.md
```

### Navigation structure:
- Home
- BROADSONIC (product page)
- Applications (dropdown: Leak Detection, Partial Discharge, Ultrasonic Cleaning)
- Research
- About Us (dropdown: Team, Media)
- Contact Us (button-styled, stands out from nav)

---

## Page-by-Page Content Specification

### 1. HOMEPAGE (index.html)

**Hero section:**
- Headline: "The World's Most Advanced Ultrasonic Microphone"
- Subheadlines: "Non-Contact. Unparalleled Bandwidth. Ultra-Sensitive."
- CTA: "Contact Us" button
- Product image (the current dark BROADSONIC unit photo from the datasheet)

**Value proposition section:**
- Headline: "Hear the Full Picture"
- Body: "From 20 Hz up to 5 MHz, BROADSONIC captures signals that human ears and standard sensors miss. It delivers real-time data for acoustic analysis, gas leak detection, ultrasonic cleaning monitoring, and partial discharge detection."
- Animated counter: "150x the frequency range of human hearing" (counter animates from 0 to 150)
- Link to product page

**Application cards (3 cards linking to application pages):**

Card 1 - Leak Detection:
- Short description: "Omnidirectional, gas-agnostic detection of micro-scale leaks through broadband ultrasonic sensing -- even in high-noise industrial environments."
- Link: "Learn More"

Card 2 - Partial Discharge:
- Short description: "Detect discharge events with >103 dB SNR at 1 meter. Captures the full PD acoustic spectrum up to 5 MHz, with complete immunity to electromagnetic interference."
- Link: "Learn More"

Card 3 - Ultrasonic Cleaning:
- Short description: "Real-time, non-contact cavitation monitoring from above the tank. Detect transducer drift, degradation, and process anomalies before they affect part quality."
- Link: "Learn More"

**Interactive demo section (NEW -- not on current site):**
- Headline: "See It In Action"
- A clickable screenshot/thumbnail of the interactive transducer scan report that links to the full-page demo (opens `/assets/demos/transducer-scan.html` in a new tab). Do NOT use an iframe. Use a placeholder image box labeled "[SCREENSHOT: Interactive transducer scan report]" until the real screenshot is provided.
- Brief description below the thumbnail: "Spatial vibration scan of a 1.5 MHz transducer at 0.1 mm resolution. Each pixel contains a full frequency spectrum across the 0-5 MHz band. Click to explore."
- The demo HTML file will be placed in `/assets/demos/` and served as a standalone page.

**Research/credibility section:**
- Headline: "Backed by Peer-Reviewed Research"
- Brief text + links to Publications and Whitepapers on the Research page
- Mention: "10+ peer-reviewed publications in JASA, Applied Physics Letters, Nature Microsystems & Nanoengineering, Optica, and more."

**Footer:**
- Logo
- Email: kyle@ultracoustics.ca
- Address: Suite 4-263, 103 St NW, Edmonton, AB T5J 0B2
- Social links: LinkedIn, Instagram
- Privacy Policy link

---

### 2. BROADSONIC PRODUCT PAGE (broadsonic.html)

This is the most important page on the site. It needs to convert an interested engineer into a quote request.

**Hero:**
- Product name: BROADSONIC
- Subtitle: "Optical Ultrasonic Sensor"
- Product photo (updated unit from datasheet)
- Counter: "150x the frequency range of human hearing"

**How It Works (condensed -- 1 paragraph, not 5):**

"Conventional air-coupled microphones are limited to frequencies below ~100 kHz. BROADSONIC extends that range to 5 MHz, opening access to acoustic information that has historically required physical contact with the source or expensive laboratory setups. It achieves this using Fabry-Perot interferometry: a fiber-coupled optical membrane captures the full acoustic band with exceptional sensitivity. The sensor head contains no electrical elements, making it inherently immune to electromagnetic interference. The result is 50x the bandwidth of the best conventional ultrasonic microphones -- non-contact, in air."

**Section title for above:** "50x Beyond Conventional Ultrasonic Microphones"

**Specifications (two columns or side-by-side layout):**

Left column - Sensor Performance:
- Acoustic Bandwidth: 5 MHz (note: Sensitivity below 50 kHz is reduced due to 1/f noise)
- Self-Noise: ~100 μPa/√Hz at 1 MHz
- Active Sensor Area: 100 μm diameter
- Omnidirectionality: > ±60 degrees
- Dynamic Range: >80 dB

Left column - Optical:
- Wavelengths: 1550 nm, 638 nm
- Optical Power (fiber end): <1 mW
- Fiber Connector: SC/APC
- Fiber Type: SMF-28
- Standard Fiber Length: 3 m

Right column - Control Unit:
- Data Interface: USB 2.0 High-Speed
- Sampling Rate: 10 MS/s
- ADC Resolution: 14 bit
- Data Throughput: ~20 MB/s (160 Mbps)
- Power Input: 9 VDC (5.5 x 2.1 mm barrel)
- Power Consumption: 8.1 W typical
- System Compatibility: Windows 11

Right column - Physical:
- Control Unit Dimensions: 17 x 12 x 9 cm (L x W x H)
- Control Unit Material: CFRP composite
- Sensor Head Dimensions: 28 mm x 8 mm (L x D)
- Sensor Head Material: Anodized Aluminum
- Sensor Head Weight: 3 g

Right column - Environmental:
- Operating Temperature: 15°C to 40°C
- Storage Temperature: 0°C to 50°C

**Included Accessories:**
- 9 VDC power supply
- Probe with 3 m SMF-28 fiber patch cable (SC/APC)
- Drivers and example software

**Safety Information:**
- WARNING: This product emits laser radiation at 1550 nm and 638 nm wavelengths with <1 mW total optical power at the fiber output (Class 1 per IEC 60825-1). While classified as safe under normal operating conditions, avoid direct eye exposure to the fiber end as a precaution. The 638 nm wavelength produces visible red light.

**Downloads section:**
- "Download Datasheet" (PDF link)
- Link to interactive transducer scan demo

**CTA:** "Get a Quote" button linking to contact page

---

### 3. LEAK DETECTION (leak-detection.html)

**Current content problems:**
- Claims like "pinpoint leaks smaller than the width of a human hair" are unsupported on the page
- "Gas-agnostic" is stated but not explained
- No links to the published research that validates the claims
- Generic benefit sections that repeat product-level info (EMI immunity, USB readout)

**Content guidance:**
- Keep the core messaging about omnidirectional, gas-agnostic detection in noisy environments
- Add a 1-sentence explanation of WHY it's gas-agnostic: acoustic detection doesn't depend on molecular absorption like IR/OGI methods, so it works regardless of gas composition
- Cross-link the relevant research:
  - Whitepaper: "Ultrasonic Gas Leak Detection Using BROADSONIC Optical Ultrasonic Sensing" (PDF on research page)
  - Paper: "Characterization and Localization of Micro-Scale Gas Leaks" (JASA, July 2025)
  - Paper: "All-Optical, Air-Coupled Ultrasonic Detection of Low-Pressure Gas Leaks" (MDPI Sensors, June 2023)
- Include a "Supporting Research" section at the bottom with these links
- Replace generic CTAs ("Book a Demo") with "See Leak Detection Data" or "Request a Consultation"
- Remove the partner logos from this page (they belong on the Team page)

---

### 4. PARTIAL DISCHARGE (partial-discharge.html)

**Current content problems:**
- The best proof point (103 dB SNR at 1 meter) is buried at the bottom
- The page says "captures discharge signatures up to ~1 MHz" without explaining that PD signatures don't typically extend above that -- making it sound like a limitation
- SNR counter appears to show "0:1" (may be rendering issue)

**Content guidance:**
- Lead with the 103 dB SNR at 1 meter stat. This is the headline.
- Embed the arc lighter demo video near the top of the page. The video IS the proof.
- Reframe the ~1 MHz point: "PD acoustic signatures typically concentrate below 1 MHz. BROADSONIC captures the full spectrum with significant margin, ensuring no diagnostic information is missed."
- Cross-link:
  - Paper: "Air-Coupled Ultrasound Using Broadband Shock Waves from Piezoelectric Spark Igniters" (APL, August 2024) -- this is the academic basis for the arc lighter demo
  - Whitepaper: "Non-Contact Acoustic Characterization of Magnetic Components" (March 2026) -- related electrical infrastructure application
- Remove repeated product-level info (EMI immunity, USB readout -- this belongs on the product page)
- Replace CTAs with "Request a PD Monitoring Consultation"

---

### 5. ULTRASONIC CLEANING (ultrasonic-cleaning.html)

**Current content problems:**
- Hero image is AI-generated. This undermines credibility for a hardware company.
- Most generic of the three application pages
- No supporting data or research linked
- "How It Compares to Traditional Monitoring" section would be much stronger as a comparison table

**Content guidance:**
- Replace AI image with a real photo (placeholder for now -- owner will provide)
- Add a comparison table: BROADSONIC vs hydrophones vs foil erosion tests vs calorimetric methods. Columns: frequency range, contact required?, real-time?, spatial info?
- Cross-link:
  - Paper: "Coupling the Thermal Acoustic Modes of a Bubble to an Optomechanical Sensor" (Nature Microsystems, December 2024) -- cavitation monitoring is fundamentally about bubble dynamics
- Add a "Supporting Research" section
- Replace CTAs with "Discuss Cleaning Monitoring" or similar

---

### 6. RESEARCH (research.html)

This page is well-organized on the current site. Maintain the same structure:

**Publications section:** List of 10 peer-reviewed papers, each with:
- Title
- Journal + date
- Brief description (2-3 sentences)
- "Download PDF" link

**Whitepapers section:** List of 3 application notes/whitepapers, same format.

(See the current site at https://ultracoustics.ca/more-information/ for full content -- it was recently updated and is current.)

---

### 7. TEAM (team.html)

**Team members:**
- Kyle Scheuer, MSc, EIT -- CEO | Optical & Electronics Lead
- Dr. Ray DeCorby, PhD, P.Eng -- CTO | Professor, University of Alberta
- Ayden Chen, BSc, EIT -- COO | Mechanical & Software Lead
- Brad Spencer, BSc, P.Eng -- Retired TELUS VP of Mission Critical Environments | Business Advisor
- Ali Iqbal -- Software Co-op Student, University of Alberta, Computer Engineering
- Marco Rizzuto -- Co-op Student, University of Alberta, Marketing

**Partner logos section** (only on this page):
ERA, Alberta Government, Technology Alberta, Alberta Innovates, University of Alberta, Faculty of Engineering UAlberta, RU-IBZ, ECO Canada, NRC, nanoFAB, Lab2Market, Mitacs

---

### 8. MEDIA (media.html)

- YouTube video embeds (currently 2 videos + ERA project link)
- Arc lighter demo video (recently added)
- The 60-second BROADSONIC promo video

---

### 9. CONTACT (contact.html)

- Contact form (Name, Email, Message). Note: for a static site, use Formspree (free tier, no backend needed) or Cloudflare Workers for form handling.
- Contact info: address, phone (780-232-8721), email (kyle@ultracoustics.ca)
- "Who You'll Be Talking To" section with Kyle's photo and brief intro

---

## Technical Notes

### Hosting & Deployment
- Will be hosted on **Cloudflare Pages**, deployed from a GitHub repo.
- **Cost: $0.** Cloudflare Pages free tier includes unlimited bandwidth, unlimited requests, and 500 deploys/month. The only cost is domain registration (~$20/year).
- Static files only. No server, no backend, no database. The entire site is a folder of files served from Cloudflare's global CDN.
- Forms: use Formspree.io (free tier handles contact form, 50 submissions/month, no backend needed).

### Interactive demos
- The transducer scan demo is a self-contained HTML file. Place it in `/assets/demos/` and link to it directly as a standalone page (opens in new tab). Do NOT iframe it.
- On the homepage and product page, display a placeholder thumbnail that links to the demo page. Use a styled placeholder box labeled "[SCREENSHOT: Interactive transducer scan report]".
- The owner will provide the actual demo HTML file and a screenshot image for the thumbnail.

### Images & assets -- PLACEHOLDER APPROACH
- **Use placeholder image boxes everywhere.** Do not reference any external URLs or attempt to download images from the current WordPress site. Every image on the site should be a styled placeholder `<div>` with a visible descriptive label, correct aspect ratio, and the site's dark/magenta color scheme.
- Placeholder format: a dark gray (#1a1a1a) box with a 1px #FF4FC9 border, centered label text in #999, and appropriate dimensions for the context. Example: `[PRODUCT PHOTO: BROADSONIC control unit]`, `[TEAM PHOTO: Kyle Scheuer]`, `[PARTNER LOGO: Alberta Innovates]`, `[SCREENSHOT: Interactive transducer scan report]`.
- The owner will replace all placeholders with real images after the initial build.
- For PDFs: create working link elements pointing to `/assets/docs/filename.pdf`. The owner will place the actual PDF files there. Links won't work until the files are added, and that's fine.
- All image, doc, and demo files will live inside the `/assets/` directory (see site structure above). No external hosting, no CDN, no separate media server. Everything is served as static files from the same repo.

### Performance
- No jQuery, no Bootstrap, no heavy frameworks.
- CSS should be a single shared stylesheet.
- JS should be minimal: mobile nav toggle, scroll animations if any, and the "150x" counter animation.
- Optimize for fast first contentful paint. These pages are mostly text and a few images.

### SEO basics
- Proper meta titles and descriptions on each page
- Open Graph tags for LinkedIn sharing (this is a primary traffic source)
- Semantic HTML (header, nav, main, section, footer)

---

## Key Improvement Suggestions (vs. current site)

1. **Add the interactive demo prominently.** This is the single most compelling piece of content Ultracoustics has. It should be on the homepage and product page.

2. **Add "Download Datasheet" prominently on the product page.** Engineers expect this. It's the standard way to evaluate instrumentation.

3. **Cross-link research to application pages.** The current site has 10 published papers and 3 whitepapers but none are referenced from the application pages where buyers land. Each application page should have a "Supporting Research" section linking to 2-3 relevant papers/whitepapers.

4. **Condense the "How It Works" section.** The current product page has 5 paragraphs explaining Fabry-Perot interferometry. Replace with the condensed version (see BROADSONIC page spec above). Detailed physics belongs in whitepapers, not the product page.

5. **Lead application pages with proof points, not generic benefits.** Partial discharge page should lead with "103 dB SNR at 1 meter" and the arc lighter video. Leak detection should link to the JASA paper validating 5 μm leak detection. Show the data first, explain the benefits second.

6. **Replace AI-generated images.** The ultrasonic cleaning page has an obviously AI-generated tank illustration. Use real photos or clean diagrams.

7. **Specs must match the March 2026 datasheet.** The current site has outdated specs (FC/APC should be SC/APC, 12V should be 9V, 6W should be 8.1W, missing sampling rate/ADC/throughput specs).

8. **Application-specific CTAs.** Replace generic "Book a Demo" with targeted calls to action per application.

9. **Add an NDT / Transducer Characterization application page (future).** This is the company's most demo-ready capability (the interactive scan report). Not required for initial build but should be easy to add later.

10. **Do not use the phrase "intrinsically safe"** anywhere on the site. The sensor head is purely optical (no electrical elements), which provides inherent safety advantages, but the company does not yet hold ATEX/IECEx certification. Say "the sensor head contains no electrical elements" instead.

11. **Do not use the term "laser microphone."** It has surveillance/spy-gadget connotations. Use "optical ultrasonic sensor" or "optical microphone" or just "BROADSONIC."

---

## Content that the owner will provide after initial build:
All of these are represented by placeholders in the initial build. The site should look complete and navigable with placeholders in place -- the owner will swap in real assets.

- Product photos (BROADSONIC control unit and sensor head, matching March 2026 datasheet)
- Screenshot of the interactive transducer scan demo (for homepage/product page thumbnails)
- Team member headshots
- Partner organization logos (12 logos, see Team page spec)
- PDF files: datasheet, 3 whitepapers, 10 papers (place in `/assets/docs/`)
- Interactive HTML demo file (place in `/assets/demos/`)
- YouTube embed URLs for: arc lighter demo video, BROADSONIC promo video, and any other videos on the Media page
- Privacy policy text

---

## Current site for reference:
- Homepage: https://ultracoustics.ca/
- Product: https://ultracoustics.ca/broadsonic/
- Leak Detection: https://ultracoustics.ca/leak-detection/
- Partial Discharge: https://ultracoustics.ca/partial-discharge/
- Ultrasonic Cleaning: https://ultracoustics.ca/ultrasonic-cleaning/
- Research: https://ultracoustics.ca/more-information/
- Team: https://ultracoustics.ca/team/
- Media: https://ultracoustics.ca/media/
- Contact: https://ultracoustics.ca/contact/
