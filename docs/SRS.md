# Software Requirements Specification (SRS) for HouseRentLk

## Document Version: 1.1
**Prepared by:** HouseRentLk Technical Team (Updated Feb 24, 2026)
**Status:** Approved / Active

---

## 1. Project Overview

### 1.1 Project Name
HouseRentLk

### 1.2 Purpose
HouseRentLk is a premium, startup-style web platform designed to solve the complexities of the Sri Lankan house rental market. It connects owners, renters, and verified brokers while leveraging AI and Machine Learning to provide cost transparency, market intelligence, and smart budgeting.

### 1.3 Scope
- **Target Market:** Exclusive focus on house rentals in Sri Lanka (no sales, land, or commercial).
- **Core Pillars:** Verified Listings, AI-Driven Financial Planning, and Broker Empowerment.
- **Key Regions:** Deep focus on urban clusters including Colombo, Negombo, Gampaha, Kandy, and Galle.

### 1.4 Technology Stack
| Layer | Technology |
|-------|------------|
| **Frontend** | React (Vite), Tailwind CSS (Rich Aesthetics), Framer Motion (Animations) |
| **Backend** | Node.js + Express.js, MongoDB (Mongoose) |
| **AI/ML Layer** | Python (Pandas, Scikit-learn, NLP libraries) interfaced via `child_process` |
| **Media** | Cloudinary (Image/Video hosting and optimization) |
| **External** | Google Maps API (Geolocation), Axios (Inter-service communication) |

---

## 2. User Roles & Permissions

### 2.1 Admin
- Full moderation of users and listings.
- Access to Scraping Panel (external listing aggregation).
- Market analytics and user growth reports.

### 2.2 Owner
- Post and manage own property listings.
- Lead management via dedicated CRM.
- Access to listing performance insights.

### 2.3 Broker
- Specialized profiles with follower system.
- Professional directory listing.
- Advanced marketing tools for high-volume listings.

### 2.4 Renter
- Smart search (NLP-enabled) and advanced filtering.
- AI Rent Budget Planner tools.
- Saved searches and real-time notifications.

---

## 3. Functional Requirements

### 3.1 AI-Powered Rent Budget Planner (New)
A comprehensive suite of tools for financial transparency:
- **Rent Affordability Calculator:** Uses the 30/40 rule to recommend safe rent based on income and expenses.
- **Rental Deposit Planner:** Calculates the initial cash needed (3–6 months advance + refundable deposit).
- **Rent vs Buy Comparison:** Compares 10-year costs of renting vs. mortgage payments in the SL market.
- **Utility Cost Estimator:** AI-driven monthly estimates for electricity and water based on town and property type.

### 3.2 Property Listing & Management
- Multi-step posting form with mandatory verification fields.
- **AI Title Generator & Auto-Taging:** Automatically optimizes listings for SEO.
- **Image Quality Analysis:** AI checks for blurred or low-quality photos.
- **Price Suggestion Engine:** Suggests fair rent based on local neighborhood data.

### 3.3 Advanced Search & Discovery
- **NLP Search:** Allows natural language queries like "3-bedroom house in Negombo under 60k near a beach".
- **Dynamic Map View:** Real-time clustering of listings on a map.
- **Comparison Tool:** Side-by-side comparison of multiple properties.

### 3.4 Broker Ecosystem
- **Broker Directory:** A verified list of professionals with ratings.
- **Follow System:** Renters can follow brokers to get alerts on new listings.
- **WhatsApp Integration:** Direct click-to-chat with property managers.

### 3.5 External Data Aggregation (Scraping)
- **Admin Scraping Utility:** Scrapes external rental sites to populate the platform with 3rd-party listings (read-only) for better market coverage.

---

## 4. AI & ML Implementation Details

The AI services are centralized in a Python micro-utility layer:
- `budget_planner.py`: Financial calculations and market comparisons.
- `pricing_engine.py`: Multi-factor rent prediction.
- `nlp_search.py`: Query parsing and intent detection.
- `sentiment_analyzer.py`: Automated review moderation and sentiment scoring.
- `fraud_detector.py`: Cross-checks for duplicate listings and scam patterns.

---

## 5. UI/UX & Design Philosophy

### 5.1 Rich Aesthetics
- Modern, premium feel with glassmorphic elements.
- Custom typography (Inter/Outfit) and curated color palettes.
- Micro-animations for button interactions and loading states.
- Full dark/light mode support.

### 5.2 Mobile Excellence
- Optimized for mobile-first usage in Sri Lanka.
- Progressive loading for low-bandwidth environments.

---

## 6. Non-Functional Requirements
- **Scalability:** Built on the MERN stack with modular AI services.
- **Security:** JWT authentication, role-based access control (RBAC), and sanitization of user inputs.
- **Performance:** Sub-2s page load times via code splitting and lazy loading of images.
- **Localization:** Focused specifically on Sri Lankan localization (LKR, local towns, Rent Act nuances).

---

## 7. Roadmap & Future Scope
- **Mobile Apps:** Native iOS/Android versions.
- **Payment Gateway:** In-app rent payments and booking deposits.
- **Neighborhood Safety Scores:** Community-driven safety and amenity ratings.
- **VR/360 Tours:** Immersive property viewings.

---
