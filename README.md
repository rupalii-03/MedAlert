# MedAlert Grid — Real-Time Hospital Bed & Doctor Availability Platform

Built by **Team Codec**.

MedAlert Grid is a digital health platform that shows patients and families which nearby hospitals have free beds (General, ICU, Emergency, Oxygen) and on-duty specialists right now, and connects them to the best-matched hospital the moment they register.

## Key Features
- **Home**: Hospital network utility bar (`Emergency: 108`), search bar, quick-action availability search card, 6 service tiles, live-updating nearby hospital cards, 3-step care coordination guide, on-duty doctor directory, partner hospital trust section, sample testimonials, and FAQ accordion.
- **Live Availability**: Filter by city, bed type, medical specialty, and distance (`km`), toggle between the **Card List** and **Interactive Leaflet Map**, and see real-time Socket.IO updates without refreshing.
- **Patient Registration**: 3-step validated registration form (Personal Details, Symptoms & Urgency, Location & Hospital Preference) with instant hospital matching, pre-arrival notification, Reference ID generation, and an interactive 4-stage **Live Patient Readiness Tracker** (*Registered* → *Hospital notified* → *Bed ready* → *Arrived*).
- **Hospital Staff Dashboard**: Update bed counts by ward (`General`, `ICU`, `Emergency`, `Oxygen`), toggle doctors on or off duty, monitor ward occupancy via Recharts, view automatic **>85% High Occupancy Alerts**, and manage incoming pre-registered patients. Changes broadcast immediately over WebSockets (`Socket.IO`).
- **For Hospitals & About/Contact**: Onboarding steps, HMS integration overview, hospital demo request form, mission statement, and 24/7 helpline details.

## Tech Stack
- **Frontend**: React 19, TypeScript, Tailwind CSS, Motion, Recharts, Leaflet (`OpenStreetMap`), Lucide Icons
- **Real-Time Backend**: Node.js, Express, Socket.IO (`server.ts`) + client `useHospitalFeed()` hook

## Setup & Run Instructions

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start the development server (Express + Vite + Socket.IO on port 3000)**:
   ```bash
   npm run dev
   ```

3. **Build for production**:
   ```bash
   npm run build
   npm start
   ```

> **Demo Data Notice**: All hospitals, doctor profiles, and patient records are simulated demo data for evaluation purposes. No real patient health information (PHI) is collected or stored.
