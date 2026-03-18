# Ultracoustics Technologies Ltd. — Website

Marketing website for **Ultracoustics Technologies Ltd.**, an Edmonton-based deep tech company that builds the **BROADSONIC** optical ultrasonic sensor.

**Live site:** [https://ultracoustics.ca](https://ultracoustics.ca)

---

## What This Is

A fully static website (HTML / CSS / vanilla JS) with no frameworks, build tools, or static site generators. Every page is a standalone `.html` file that can be opened directly in a browser or served by any web server.

## How It's Hosted

| Concern | Provider |
|---|---|
| **Domain registrar** | GoDaddy (`ultracoustics.ca`) |
| **DNS, CDN & hosting** | Cloudflare Pages |

The repository is connected to Cloudflare Pages, which builds and deploys automatically on push to `main`. Since the site is purely static, no build step is required — Cloudflare serves the files directly.

## Repository Structure

```
/
├── index.html                  # Homepage / landing page
├── broadsonic.html             # BROADSONIC product page
├── leak-detection.html         # Application: leak detection
├── partial-discharge.html      # Application: partial discharge
├── ultrasonic-cleaning.html    # Application: ultrasonic cleaning
├── ndt.html                    # Application: non-destructive testing
├── transducer-characterization.html  # Transducer characterization service
├── research.html               # Publications & whitepapers
├── team.html                   # Team & partners
├── media.html                  # Videos & press
├── contact.html                # Contact form & info
├── privacy-policy.html         # Privacy policy
├── 404.html                    # Custom 404 page
├── robots.txt
├── sitemap.xml
│
├── css/
│   └── style.css               # Single shared stylesheet
│
├── js/
│   ├── main.js                 # Shared JS (mobile nav, scroll animations, counters)
│   ├── fpi-animation.js        # Fabry-Perot interferometry animation (product page)
│   └── thickness-map.js        # Interactive thickness map demo
│
└── assets/
    ├── images/                 # Product photos, headshots, logos, promotional images
    ├── Videos/                 # Demo & promotional videos
    ├── demos/                  # Interactive HTML demos (transducer scan reports, etc.)
    ├── docs/                   # PDFs (papers, whitepapers)
    ├── Data/                   # Raw scan data & analysis scripts (Python, MATLAB)
    └── ULTRACOUSTICS_WEBSITE_README.md  # Original design brief / content spec
```

## Local Development

Open `index.html` in a browser, or serve the directory with any static server:

```bash
# Python
python -m http.server 8000

# Node
npx serve .
```

No dependencies to install. No build step.

## Design

- **Dark theme** — black/charcoal backgrounds, white text
- **Accent colour:** `#FF4FC9` (magenta/hot pink)
- **Font:** Inter (loaded from Google Fonts)
- **Audience:** Engineers evaluating sensors for industrial applications
- **Desktop-first**, fully responsive

The full design brief and page-by-page content spec lives in [assets/ULTRACOUSTICS_WEBSITE_README.md](assets/ULTRACOUSTICS_WEBSITE_README.md).
