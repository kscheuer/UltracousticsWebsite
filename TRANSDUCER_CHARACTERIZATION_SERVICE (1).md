# BROADSONIC Transducer Characterization Service

## Service Overview

Ultracoustics offers non-contact spatial characterization of ultrasonic transducers using the BROADSONIC optical ultrasonic sensor. A single scan captures the full broadband acoustic response (0-5 MHz) at every spatial point, at sub-millimeter resolution, within minutes. There is no need to select a frequency before scanning -- the complete spectrum is acquired at each pixel in one pass, and spatial maps can be reconstructed at any frequency of interest in post-processing. No other commercially available service can provide non-contact broadband spatial acoustic mapping at these frequencies, resolutions, and speeds.

## What the Customer Gets

### Spatial Vibration Maps
- 2D amplitude maps at any frequency of interest across the 0-5 MHz band
- Each scan pixel contains a full frequency spectrum, so maps can be reconstructed at any frequency in post-processing
- Delivered as an interactive HTML report (browser-based, no software required) plus raw data files

### Measurement Capabilities
- **Broadband capture in a single pass:** Full 0-5 MHz spectrum acquired at every pixel simultaneously. No frequency pre-selection, no repeat scans at different frequencies. One scan gives you everything.
- Scan area: up to 20 x 20 cm
- Spatial resolution: down to 0.1 mm (100 um, matching the BROADSONIC active sensor area)
- Scan speed: on the order of minutes per square centimeter at fine resolution
- Non-contact: no couplant, no loading effects on the transducer under test

### Supported Transducer Types
- Single-element piezoelectric transducers
- Phased arrays and multi-element transducers
- CMUTs and PMUTs
- Focused transducers

### Phase Mapping (Coming Soon)
- Spatial phase maps showing wavefront shape, focal accuracy, and element-to-element phase uniformity
- Currently in development, expected to be available as an add-on in the near future

### 3D Beam Volume Mapping (Future)
- By scanning at multiple standoff distances from the transducer face, the full 3D beam volume can be reconstructed
- This would show beam convergence, focal depth, divergence, and sidelobe structure in three dimensions
- Currently a single-plane (2D) service; 3D capability is a planned upgrade

## How It Works

1. Customer ships their transducer to Ultracoustics in Edmonton, Alberta
2. Ultracoustics performs the spatial scan using BROADSONIC and a precision translation stage
3. Results are delivered within 1 week of receiving the transducer
4. Customer receives an interactive HTML report and raw data
5. Transducer is returned to the customer

## Pricing

Per-scan pricing. Contact kyle@ultracoustics.ca for a quote.

### Potential Service Tiers (internal consideration, not for public listing yet)
- **Survey scan:** Coarser resolution (e.g. 0.5 mm), faster, lower cost. Good for quick pass/fail verification or incoming QC.
- **Standard scan:** 0.1 mm resolution, full broadband. The core offering.
- **Premium scan:** Multiple standoff distances for 3D beam reconstruction, or repeat scans over time for aging/degradation studies.
- **Volume pricing:** Discounted per-scan rate for customers sending multiple transducers (e.g. production batch QC).

## Why This Service Exists

Conventional transducer characterization methods face fundamental limitations:

- **Hydrophone scanning** requires water immersion, couplant, and careful alignment. It works but is slow, messy, and limited to labs equipped for it. Critically, hydrophone scans are typically performed at a single frequency per pass -- characterizing a transducer across its full bandwidth requires many separate scans.
- **Laser vibrometry** can achieve high resolution but requires direct optical access to the transducer face, is extremely expensive ($100K+ systems), and measures surface velocity rather than radiated acoustic pressure.
- **Conventional air-coupled microphones** top out around 100 kHz. They simply cannot characterize MHz-range transducers.

BROADSONIC eliminates these tradeoffs. A single continuous scan captures the full broadband acoustic response (0-5 MHz) at sub-mm resolution, in air, in minutes per square centimeter. One scan replaces dozens of single-frequency hydrophone passes and requires no couplant, no water tank, and no specialized optical alignment.

## Comparison Table (for website)

| | BROADSONIC Scan Service | Hydrophone Scanning (water tank) | Laser Vibrometry | Conventional Air-Coupled Microphone |
|---|---|---|---|---|
| **Medium** | Air (non-contact) | Water (immersion) | Direct surface access | Air (non-contact) |
| **Frequency Range** | 0-5 MHz | Depends on hydrophone, typically up to ~20 MHz | Broadband | ~100 kHz max |
| **Broadband in Single Pass?** | Yes, full spectrum at every pixel | No, typically single-frequency per scan | Yes | N/A (bandwidth too low) |
| **Spatial Resolution** | 100 um | ~200 um (hydrophone dependent) | ~1 um (laser spot) | mm-scale |
| **Couplant Required?** | No | Yes (water) | No | No |
| **Equipment Cost** | Service-based, no capital outlay | $100K+ system | $100K+ system | N/A |
| **Measures** | Radiated acoustic pressure in air | Acoustic pressure in water | Surface velocity | Acoustic pressure in air |

Note: Do not name specific competitor products in this table. Use generic method descriptions only.

## Use Cases

### Production QC / Incoming Inspection
Companies that buy transducers in volume (NDT shops, medical device manufacturers, cleaning equipment integrators) have no practical way to verify that each incoming unit meets its published specifications. A quick BROADSONIC scan provides an objective, quantitative record of beam uniformity and performance at receiving. This is a recurring revenue opportunity, not just one-off characterization.

### Failure Analysis
When a transducer underperforms in the field, the first question is always: is it the transducer or the system? A BROADSONIC scan can answer that definitively by comparing the current beam profile against a known-good baseline. Before/after scan comparisons isolate the root cause without disassembling the system.

### R&D / Design Validation
Research groups and transducer designers developing new devices (CMUTs, PMUTs, phased arrays, focused transducers) need rapid feedback on beam shape and uniformity during the design iteration cycle. BROADSONIC's broadband single-pass approach means a full characterization in minutes rather than days, accelerating the design loop.

### Regulatory Submissions
Medical ultrasound transducer manufacturers require beam profile data for FDA and IEC 60601 submissions. While BROADSONIC characterization is not currently performed to these formal standards, the data quality and resolution may support or supplement regulatory testing workflows. This is a future expansion path.

## Example Deliverable: Interactive HTML Report

Each scan produces an interactive HTML report that opens in any web browser with no software installation. The report includes:

- **Spatial amplitude maps** at any user-selected frequency across the 0-5 MHz band, with a frequency slider for real-time exploration
- **Per-pixel spectrum viewer:** click any point on the spatial map to see its full frequency spectrum
- **Color scale controls** for adjusting dynamic range and visualization
- **Exportable raw data** in standard formats for further analysis

This is a significant differentiator over traditional characterization services that deliver static PDF reports or require proprietary software to view results. The interactive format means the report can be shared with non-technical stakeholders (management, customers, regulators) who can explore the data themselves.

## Target Customers

- **Transducer manufacturers** needing QA/QC beam profile verification on production units
- **NDT equipment companies** validating transducer performance and uniformity
- **Research groups** characterizing custom or prototype transducers (CMUTs, PMUTs, phased arrays)
- **Medical ultrasound companies** needing beam profile data for regulatory submissions or design validation
- **Ultrasonic cleaning equipment manufacturers** verifying transducer output uniformity

## Key Differentiators

- **Broadband, single-pass acquisition:** One scan captures the complete 0-5 MHz spectrum at every spatial point. Conventional approaches require separate scans at each frequency of interest. This means a single BROADSONIC scan replaces what would otherwise be dozens of individual measurements.
- **Bandwidth:** Full 0-5 MHz coverage in air. Conventional air-coupled ultrasonic microphones stop at ~100 kHz. BROADSONIC offers 50x the bandwidth.
- **Resolution:** 100 um spatial resolution from a single-point optical sensor. No other air-coupled sensor offers this.
- **Speed:** Minutes per square centimeter at sub-mm resolution. Fast enough for production-scale QA, not just one-off lab measurements.
- **Non-contact:** No couplant, no water tank, no loading of the transducer. Measures the actual radiated acoustic field in air.
- **Interactive reports:** Results delivered as browser-based interactive reports that non-technical stakeholders can explore without specialized software.

## Existing Proof Points

- Interactive scan report of a 1.5 MHz transducer at 0.1 mm resolution (available as demo on website)
- Formal proposal delivered to AIMS/PIP360 (UTL-2026-001) for transducer beam characterization across three phases at $16K CAD
- Published research: "Non-Contact Characterization of Plates Using a Turbulent Air-Jet Source and an Ultrasound Microphone" (MDPI NDT, February 2026)
- Published research: "Resonant Ultrasound Spectroscopy Detection Using a Non-Contact Ultrasound Microphone" (MDPI Sensors, October 2025)

## For Website and Marketing

### Suggested Application Page Title
"Transducer Characterization" or "Beam Profile Mapping"

### Suggested Headline
"Full Broadband Beam Profiles in a Single Scan -- 0 to 5 MHz at 0.1 mm Resolution"

### Key Visuals
- Screenshot/thumbnail of the interactive transducer scan report, linking to the full interactive demo
- Comparison table (see above) showing BROADSONIC scan service vs. hydrophone scanning, laser vibrometry, and conventional air-coupled microphones
- If possible, a before/after example: two scans of the same transducer type, one healthy and one degraded, showing how the beam profile reveals the defect

### Supporting Research Links
- MDPI NDT paper (February 2026): air-jet source + BROADSONIC for plate characterization
- MDPI Sensors paper (October 2025): resonant ultrasound spectroscopy with BROADSONIC
- APL paper (August 2024): broadband shock wave ultrasound with BROADSONIC

### Suggested CTA
"Request a Scan" or "Get a Quote for Transducer Characterization"

## Notes

- Do NOT use the term "laser microphone" in any marketing materials
- Do NOT claim "intrinsically safe" -- the sensor head is purely optical (no electrical elements) but ATEX/IECEx certification has not been obtained
- Do NOT name specific competitor products (e.g. Xarion, Onda AIMS III) on public-facing materials. Use generic method descriptions (hydrophone scanning, laser vibrometry, conventional optical microphone) instead.
- The AIMS proposal and pricing details are confidential and should not appear on public-facing materials
- Phase mapping capability should not be advertised until validated and ready for customer delivery
- Service tier pricing is internal strategy only; public pricing is "contact us for a quote"
