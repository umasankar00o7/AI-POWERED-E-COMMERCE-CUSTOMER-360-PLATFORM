# 💎 AI-Driven Luxury E-Commerce & Customer 360 Intelligence Platform

[![Firebase](https://img.shields.io/badge/Backend-Firebase%20Firestore-orange?style=flat&logo=firebase)](https://firebase.google.com/)
[![JavaScript](https://img.shields.io/badge/Language-ES6%2B%20JavaScript-yellow?style=flat&logo=javascript)](https://developer.mozilla.org/)
[![Bootstrap 5](https://img.shields.io/badge/Styling-Bootstrap%205%20%26%20CSS3-blue?style=flat&logo=bootstrap)](https://getbootstrap.com/)
[![Architecture](https://img.shields.io/badge/Development-AI--Native%20Engineering-purple?style=flat)](#-engineering-breakthroughs--challenges-overcome)

> An end-to-end, production-ready luxury jewelry retail ecosystem and real-time CRM platform. Conceptualized, architected, and built entirely from scratch by leveraging **Generative AI as an engineering accelerator** to bridge the gap between user behavior tracking, real-time analytics, and clienteling sales workflows.

---

## 📖 Executive Summary

This project is a high-performance, mobile-first web application designed for a bespoke jewelry and luxury apparel boutique. While traditional e-commerce platforms rely on disconnected third-party analytics and generic checkout loops, this platform unifies:
1. **Interactive Clienteling:** Direct WhatsApp-based customer negotiations and personalized curation.
2. **Behavioral Telemetry Pipeline:** Real-time event and dwell-time tracking to capture intent signals.
3. **Admin Mission Control:** A real-time data cockpit featuring instant customer segmentation, KPI tracking, and transaction verification.

The entire frontend, backend security rules, and data pipelines were developed **independently using generative AI engineering practices**, optimizing architecture, debugging edge-case DOM cycles, and maintaining modularity without third-party frameworks.

---

## 🌟 Core System Features

### 1. 🛍️ Customer Experience (Shop Front)
* **Neural Network Constellation Canvas:** A high-DPI HTML5 Canvas animation featuring an interactive particle network behind the hero section that reacts to mouse movements and mobile touch with proximity repulsion.
* **Style Spotlight (Interactive Hotspots):** A "Shop the Look" multi-look carousel. Users click image pins (price tags) placed via percentage-based coordinates that dynamically adapt to any screen size without distortion.
* **Bespoke Lookbook Concierge:** A personalized styling assistant triggered 30 seconds into browsing. Features a multi-step visual preference quiz with custom input notes.
* **Curated VIP Reveal Modal:** Dedicated luxury modal that displays hand-picked recommendations from the designer with cinematic snap-scrolling, floating designer commentary, and shimmer gold pricing.
* **High-Trust Returns Portal (`returns.html`):** A self-contained RMA (Return Merchandise Authorization) portal allowing customers to file claims, upload photographic proof directly to Cloudinary without database bloat, and receive instant tracking IDs.
* **Dynamic Stock Urgency Bar & Live Review Count:** Real-time stock counters that switch states between "High Confidence" and "Low Stock Alerts" (<5 items) alongside real-time rating aggregators.
* **Adaptive Light/Dark Theme Engine:** High-contrast palette toggling built on CSS Custom Properties (`--bg-primary`, `--accent`, `--text-primary`).

---

### 2. 🎛️ Customer 360 Intelligence & Admin CRM
* **Real-Time Behavioral Timeline:** Translates raw URLs into actionable human stories (e.g., *Explored "Emerald Choker"*, *Loved "Kada Bangle"*), color-coding actions into **Discovery**, **Desire**, **Interest**, and **High-Intent (🔥)** categories with automated session date breaks.
* **Live Ticking Dwell-Time Engine:** Tracks how long a customer stays on site down to the second (`HH:MM:SS`). Timers update across active sessions without resetting on sorts or filters.
* **"Golden Leads" Segmentation (15m+):** Algorithmic identification of high-intent shoppers who spend more than 15 minutes browsing, highlighting them with pulsing gold borders.
* **Metadata & Device Fingerprinting:** Identifies user device types (iPhone vs. Android vs. Desktop) and browser platforms to assist the admin in tailoring quotes.
* **Direct Smart-Reach WhatsApp Engine:** One-click WhatsApp action cards pre-filled with contextually tailored messages referencing the exact item the customer was last looking at.
* **Retention Command Center:** Categorizes users into **Currently Live**, **Inactive 1 Week+**, and **Inactive 1 Month+** with pre-configured re-engagement message templates.

---

### 3. 📊 Mission Control Dashboard & Administration
* **Multi-KPI Goal Engine:** Allows the business owner to define mutable monthly revenue targets, user acquisition quotas, and review thresholds saved in isolated configuration docs.
* **Real-Time Work Queue:** Real-time collection counts for new inquiries, pending stylist reviews, low stock alerts, and unread contacts with dedicated visual status colors.
* **Automated Invoice & Certificate of Authenticity (CoA) System:** 
  * Generates clean, print-ready documents that fit standard pages without margins clipping.
  * Produces an invoice breakdown on Page 1 and an official **Certificate of Authenticity** with digital seal and care instructions on Page 2.
  * Direct client-side PDF export via `html2pdf.js` with cross-origin image support (`useCORS`).
* **Standalone Styling Administration:** Complete control over category feature banners, announcement tickers, and customer reviews.
* ┌────────────────────────────────────────────────────────────────────────┐
│ CLIENT LAYER (Web & Mobile) │
├───────────────────────────────┬────────────────────────────────────────┤
│ shop.html │ admin.html │
│ - Neural Canvas Engine │ - Mission Control Dashboard (Live) │
│ - Style Spotlight Lookbooks │ - Customer 360 Behavioral CRM │
│ - Lookbook Concierge Modal │ - RMA Returns Management Console │
│ - VIP Private Offer Mailbox │ - Multi-KPI Performance Progress │
│ - Standalone Event Trackers │ - Invoice & Dispatch Management │
├───────────────────────────────┴────────────────────────────────────────┤
│ SECURITY & TRANSPORT │
├────────────────────────────────────────────────────────────────────────┤
│ Firestore Rules Engine: Role-Based Authorization + UID Matching │
├────────────────────────────────────────────────────────────────────────┤
│ DATABASE & STORAGE LAYER │
├────────────────────────────────┬───────────────────────────────────────┤
│ Google Firebase Firestore │ Cloudinary Media CDN │
│ - /users │ - Direct Client Proof Uploads │
│ - /user_intelligence │ - Dynamic Image Optimization │
│ - /style_lookbooks │ - Zero-Cost Static Media Storage │
│ - /invoices │ │
│ - /rma_requests │ │
│ - /products & /site_config │ │
└────────────────────────────────┴───────────────────────────────────────┘
---

## 🛠️ Technology Stack

| Layer | Technologies / Tools |
| :--- | :--- |
| **Frontend Core** | Vanilla JavaScript (ES6+), HTML5 Canvas API, CSS3 (Custom Variables, Keyframe Animations) |
| **UI Framework** | Bootstrap 5, Bootstrap Icons, Google Fonts (*Playfair Display*, *Inter*) |
| **Database & Cloud** | Google Firebase Firestore, Firebase Authentication (Google Auth Provider) |
| **Media & PDF Processing**| Cloudinary Upload API (Unsigned Presets), `html2pdf.js`, `html2canvas` |
| **Analytics & Data Science**| Behavioral Telemetry Tracking, Predictive Purchase Intent Scoring, Dwell Time Algorithms |
| **Methodology** | AI-Native Architecture, Modular Decoupled Scripts, Component-Driven Isolation |

---

## 💡 Engineering Breakthroughs & Challenges Overcome

Building this system required solving complex edge cases across asynchronous states, DOM boundaries, and security architectures:

### 1. Eliminating "Missing or Insufficient Permissions" in Firestore
* **Challenge:** Conventional collection scans throw permission errors when regular users query data containing other customers' transactions.
* **Breakthrough:** Designed a **1-to-1 Document Pathing Strategy** (`/collection/{userId}`). By naming documents identically to authenticated UIDs, security rules authenticate access directly against the document key path, enabling zero-error isolated access without collection-wide queries.

### 2. Real-Time Dwell-Time Math & Session Expiry
* **Challenge:** Tracking actual time spent across page reloads without persistent timers resetting or growing indefinitely when tabs are left open.
* **Breakthrough:** Built a hybrid **Heartbeat + Session-Storage Pipeline**. The client validates last-active timestamps; if idle for >1 hour, the session resets automatically. Meanwhile, an administrative polling engine runs continuous delta calculations (`Now - sessionStart`) formatted into live-ticking tabular `HH:MM:SS` strings without DOM flickering.

### 3. Responsive Hotspot Coordinates (Style Spotlight)
* **Challenge:** Image pins placed via pixels broke across different screen resolutions and mobile viewports.
* **Breakthrough:** Implemented **Percentage-Based Relative Vector Mapping** (`(Click Pos / Natural Dimension) * 100`). Pins are placed via percentage-based absolute positioning, keeping pins pinned to the exact model feature across mobile, tablet, and 4K displays.

### 4. Zero-Cost Client-Side Media Upload Pipeline
* **Challenge:** Firebase Storage rules can incur high costs or require tier upgrades for handling customer photo returns.
* **Breakthrough:** Bypassed database storage entirely by routing customer photo proofs through a direct-to-cloud **Cloudinary REST pipeline using unsigned upload presets**. Only the clean public secure URL string is persisted to the database.

### 5. Automated Multi-Page Document Rendering (Invoice & CoA)
* **Challenge:** External stylesheets and canvas components generated blank boxes, cropped headers, and broken layout lines during HTML-to-PDF serialization.
* **Breakthrough:** Engineered print-specific isolation CSS combining `page-break-after: always`, `useCORS: true`, and fixed-width canvas captures (`width: 794px` A4 standards) to output a formatted tax invoice on Page 1 and an official Certificate of Authenticity on Page 2.

---

## 👤 Author & Contact

**Uma Sankar Rao**  
*Aspiring Data Scientist & Analytics Developer*  
*EPGC in Data Science — IIT Roorkee & Intellipaat*  

- **LinkedIn:** [linkedin.com/in/uma-sankara-rao-kontyana-a97a3a243](https://www.linkedin.com/in/uma-sankara-rao-kontyana-a97a3a243)
- **GitHub:** [@umasankar00o7](https://github.com/umasankar00o7)
- **Email:** [uma131482@gmail.com](mailto:uma131482@gmail.com)
- **Phone / WhatsApp:** +91 6304431108

---

## 📐 System Architecture
