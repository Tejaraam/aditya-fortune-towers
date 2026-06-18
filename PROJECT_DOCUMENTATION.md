# COMPLETE PROJECT WALKTHROUGH DOCUMENT

## 1. Project Overview

**Project Name:** AFTOWA Digital Portal (Aditya Fortune Towers Welfare Association)
**Problem Statement:** Managing a large residential society (Tower A, B, C) requires immense coordination for notices, events, financial transparency, and complaint tracking. Previously, these were handled via disjointed WhatsApp groups, physical notice boards, and manual ledger books, leading to information loss, lack of transparency, and delayed grievance resolution.
**Objectives:** To create a centralized, secure, and transparent digital hub exclusively for AFTOWA residents and the Executive Committee.
**Target Users:** 
- **Residents (Members):** Flat owners who need to view notices, RSVP to events, raise complaints, and view society financials.
- **Executive Committee & Admins:** Association members who need to manage finances, broadcast notices, organize events, and resolve complaints.

**Key Features:**
- Role-Based Access Control (Admin, Committee, Member, Visitor)
- Real-time Notice and Communication Board
- Transparent Financial Ledger with Receipt Uploads
- Community Members Directory with Access Management
- Event Management & RSVPs
- Ticket-based Complaint Tracking

**Technology Stack & Justification:**
- **React (Frontend):** Chosen for its component-based architecture, enabling highly reusable UI elements (like cards, modals, and lists) and smooth Single Page Application (SPA) navigation.
- **Vite:** Chosen as the build tool for its lightning-fast Hot Module Replacement (HMR) and optimized production builds.
- **TypeScript:** Adds static typing, significantly reducing runtime errors and improving code maintainability for complex data structures (like Supabase database rows).
- **Tailwind CSS:** Allows rapid, utility-first styling without leaving the component files, ensuring a modern, responsive, and consistent design system.
- **Supabase (Backend-as-a-Service):** Provides a PostgreSQL database, real-time subscriptions, secure authentication, and edge storage out-of-the-box. It drastically reduces backend boilerplate while providing enterprise-grade security via Row Level Security (RLS).

---

## 2. System Architecture

The project follows a modern **Client-Serverless Architecture** where a static frontend communicates directly with a managed database service via secure APIs.

### Architecture Components
- **Frontend (Presentation Layer):** React handles the UI state and routing. State management is handled natively via React Hooks (`useState`, `useEffect`, `useContext`).
- **Backend (Data Layer - Supabase):** 
  - **Auth:** Manages user registration, JWT minting, and sessions.
  - **Database:** PostgreSQL stores relational data.
  - **Storage:** S3-compatible buckets store images and documents.

### ASCII Architecture Diagram

```text
+---------------------+       HTTP / WebSockets       +------------------------+
|    Client Browser   | <===========================> |     Supabase Cloud     |
|                     |                               |                        |
|  +---------------+  |      1. JWT Auth Token        |  +------------------+  |
|  | React SPA UI  |  | ----------------------------> |  | Supabase Auth    |  |
|  | (Tailwind CSS)|  |                               |  | (GoTrue)         |  |
|  +---------------+  |      2. REST API Queries      |  +------------------+  |
|          |          | ----------------------------> |            |           |
|  +---------------+  |                               |  +------------------+  |
|  | AuthContext   |  |      3. File Uploads          |  | PostgreSQL DB    |  |
|  | SupabaseClient|  | ----------------------------> |  | (PostgREST + RLS)|  |
|  +---------------+  |                               |  +------------------+  |
|                     |                               |            |           |
|                     |                               |  +------------------+  |
|                     |                               |  | Storage Buckets  |  |
+---------------------+                               +------------------------+
```

### Data Flow Example (Adding a Transaction)
1. **User Action:** Admin manually enters the transaction amount and details, and uploads a bill image for transparency.
2. **React:** File object is prepared and local state is updated.
3. **User Action:** Admin clicks "Save".
4. **React -> Supabase Storage:** Image is uploaded to the `receipts` bucket; a Public URL is returned.
5. **React -> Supabase DB:** A SQL `INSERT` is triggered via the Supabase JS Client with the transaction details and receipt URL.
6. **Supabase DB:** PostgREST evaluates RLS policies. If authorized, the row is inserted.
7. **React:** The UI re-fetches the transactions and updates the view.

---

## 3. Project Structure

```text
c:/Projects/aditya-fortune-towers-community-website
├── index.html               # Entry point of the web application
├── package.json             # Project dependencies and npm scripts
├── vite.config.ts           # Vite bundler configuration
├── tailwind.config.js       # Tailwind CSS design tokens and theme settings
├── src/
│   ├── main.tsx             # React DOM rendering and Context Provider wrapper
│   ├── index.css            # Global CSS, Tailwind directives, and custom fonts
│   ├── App.tsx              # Root component, routing logic, and layout wrapper
│   ├── types/
│   │   └── database.types.ts# Auto-generated TypeScript definitions for Supabase schema
│   ├── lib/
│   │   └── supabase.ts      # Supabase client initialization
│   ├── utils/
│   │   └── pdf.ts           # Utility for generating PDF financial reports
│   └── components/
│       ├── common/          # Shared layout components
│       │   ├── Navbar.tsx   # Top navigation, role display, section switching
│       │   ├── Footer.tsx   # Bottom footer
│       │   └── AuthContext.tsx # React Context for global user session and role state
│       ├── landing/         # Public-facing pages
│       │   ├── Hero.tsx     # Welcome banner
│       │   ├── About.tsx    # Society information and statistics
│       │   ├── Amenities.tsx# Showcase of facilities
│       │   └── Gallery.tsx  # Public picture viewer
│       └── community/       # Protected, authenticated modules
│           ├── CommunityPortal.tsx  # Main dashboard switching between modules
│           ├── OwnersDirectory.tsx  # Member list, role assignment (Admin only)
│           ├── Events.tsx           # Event creation, RSVP management
│           ├── Notices.tsx          # Notice board
│           ├── Communications.tsx   # Document sharing
│           ├── Complaints.tsx       # Grievance ticketing
│           └── Accounts.tsx         # Financial ledger, Receipt upload, PDF export
└── supabase/
    ├── master_schema.sql    # Combined database structure
    └── migrations/          # SQL files containing schema, policies, and triggers
```

---

## 4. Application Walkthrough

### Home Page (Landing)
- **Purpose:** To welcome visitors and showcase the society.
- **User Actions:** Scroll, view amenities, click "AFTOWA Registered Society" to enter the portal.
- **Data Flow:** Static content rendering.

### About AFTOWA
- **Purpose:** Display the history and committee structure.
- **User Actions:** Read about the society.
- **Data Flow:** Dynamic counter pulls the number of Executive Members directly from the `profiles` table.

### Members Directory
- **Purpose:** Connect flat owners.
- **User Actions:** View members, search by name/flat, filter by role. Admins can assign roles.
- **Data Flow:** React fetches `profiles`. If Admin changes a role, a Supabase `UPDATE` query modifies the user's role.
- **Tables:** `profiles`

### Events
- **Purpose:** Manage community gatherings.
- **User Actions:** Members can RSVP. Committee can create/delete events.
- **Data Flow:** Fetches `events` and joined `event_attendees`.
- **Tables:** `events`, `event_attendees`

### Notices & Communications
- **Purpose:** Official broadcasts and document sharing.
- **User Actions:** Read notices. Download documents. Committee can post new items.
- **Data Flow:** Fetches from `notices` and `communications`.
- **Tables:** `notices`, `communications`

### Complaints & Contact
- **Purpose:** Grievance redressal.
- **User Actions:** Members submit tickets. Committee updates status (Open/Resolved).
- **Data Flow:** Members `INSERT` to `complaints`. Committee `UPDATE` complaints.
- **Tables:** `complaints`

### Gallery
- **Purpose:** Visual archive of society life.
- **User Actions:** View pictures. Committee can upload new images.
- **Data Flow:** Images uploaded to Supabase Storage; metadata inserted into `pictures` table.
- **Tables:** `pictures`
- **Buckets:** `gallery`

### Accounts
- **Purpose:** Financial transparency.
- **User Actions:** View income/expense ledger, download PDF report. Committee adds transactions and manually uploads supporting receipt images.
- **Data Flow:** Supabase stores receipts. React fetches `financial_transactions` and calculates dynamic totals.
- **Tables:** `financial_transactions`
- **Buckets:** `receipts`

---

## 5. Database Design

The database is built on PostgreSQL via Supabase.

### ER Diagram

```text
[auth.users] (Supabase Auth)
    | 1
    |
    | 1
[profiles] -------------+-----------------------+
(id, name, role, flat)  | 1                     | 1
    | 1                 |                       |
    | ∞                 | ∞                     | ∞
[complaints]        [events]                [notices]
(id, user_id,       (id, title, date,       (id, title, content)
 subject, status)    created_by)
                        | 1
                        |
                        | ∞
                    [event_attendees]
                    (id, event_id, user_id, status)
```

### Tables
1. **profiles:** Stores user metadata (Name, Tower, Flat, Role). `id` is a foreign key referencing `auth.users(id)`.
2. **events:** Stores event details. `created_by` references `profiles(id)`.
3. **event_attendees:** Tracks RSVPs. Junction table linking `events` and `profiles`.
4. **notices & communications:** Stores text announcements and file links.
5. **pictures:** Stores gallery metadata and image URLs.
6. **complaints:** Stores grievances. `user_id` references `profiles`.
7. **financial_transactions:** Stores ledgers. Includes `type` (Income/Expense), `amount`, and `receipt_url`.

**Design Justification:** The schema is highly normalized. All user actions are tied to the `profiles` table, which acts as the central hub linking Supabase Authentication with application logic.

---

## 6. Authentication & Authorization

### Supabase Auth Flow
1. User enters email/password.
2. Supabase GoTrue authenticates the credentials.
3. Supabase issues a JWT containing the `user.id`.
4. React's `AuthContext` decodes the session and fetches the user's `role` from the `profiles` table.

### Roles & Permissions Matrix

| Feature | Visitor | Member | Committee Member | Admin |
| :--- | :---: | :---: | :---: | :---: |
| View Landing Page | ✅ | ✅ | ✅ | ✅ |
| View Members Directory | ❌ | ✅ | ✅ | ✅ |
| Change User Roles | ❌ | ❌ | ❌ | ✅ |
| RSVP to Events | ❌ | ✅ | ✅ | ✅ |
| Create Events/Notices | ❌ | ❌ | ✅ | ✅ |
| Create Complaints | ❌ | ✅ | ✅ | ✅ |
| View ALL Complaints | ❌ | ❌ | ✅ | ✅ |
| View Accounts Ledger| ❌ | ✅ | ✅ | ✅ |
| Add/Edit Transactions | ❌ | ❌ | ✅ | ✅ |

---

## 7. CRUD Operations

- **Create:** 
  - `Accounts.tsx`: Inserts into `financial_transactions`.
  - `Complaints.tsx`: Inserts into `complaints`.
  - `Events.tsx`: Inserts into `events` and `event_attendees`.
- **Read:** 
  - All protected components run `select()` queries inside `useEffect` hooks upon mounting.
- **Update:** 
  - `OwnersDirectory.tsx`: Updates user `role` in `profiles`.
  - `Accounts.tsx`: Updates existing `financial_transactions`.
  - `Complaints.tsx`: Updates `status` from 'Open' to 'Resolved'.
- **Delete:** 
  - `Events.tsx`: Deletes from `events` (cascading deletes attendees).

---

## 8. Storage System

Supabase Storage is utilized for handling binary files.
- **`gallery` Bucket:** Stores event photos and amenity images. Publicly readable. Only Committee can insert.
- **`documents` Bucket:** Stores PDFs and circulars linked in the Communications module.
- **`receipts` Bucket:** Stores images of physical bills uploaded via the Accounts module. Publicly readable for transparency.

**Upload Flow:** `File input -> File Object -> supabase.storage.from('bucket').upload() -> getPublicUrl() -> Save URL to Database.`

---

## 9. Security Features

- **Row Level Security (RLS):** The most critical security feature. Even if a malicious user bypasses the React frontend and queries the Supabase API directly, the PostgreSQL database blocks the request at the row level.
  - *Example:* `CREATE POLICY "Complaints view" ON public.complaints FOR SELECT USING (auth.uid() = user_id OR is_committee());` ensures members can mathematically never query other people's complaints.
- **Role-Based Access Control (RBAC):** UI elements (like "Edit" buttons) are conditionally hidden in React based on the user's role, preventing unauthorized intent.
- **SQL Triggers:** When a new user signs up in `auth.users`, a secure Postgres Trigger automatically creates their `profiles` row. The very first user is auto-assigned the 'Admin' role; subsequent users default to 'Member'. This prevents manual database tampering.

---

## 10. Implementation Journey

- **Stage 1: Frontend Prototype:** Initial landing page with hardcoded data.
- **Stage 2: Database Architecture:** Designing the relational schema in SQL.
- **Stage 3: Supabase Integration:** Connecting React to Supabase, replacing hardcoded data with live queries.
- **Stage 4: Authentication:** Implementing Signup/Login and the `AuthContext` to protect routes.
- **Stage 5: RBAC & Profiles:** Adding the Role management UI so Admins can elevate Members to Committee status.
- **Stage 6: Triggers & RLS:** Securing the backend using Postgres triggers and rigorous Row Level Security policies.
- **Stage 7: Accounts Module:** Building the complex financial ledger and integrating public receipt uploading for trust.
- **Stage 8: UI Polish:** Centering navbars, fixing z-indexes, and ensuring a premium, responsive Tailwind design.

---

## 11. Future Enhancements (Version 2)

- **Email/WhatsApp Notifications:** Integrating Edge Functions with SendGrid/Twilio to alert members of new notices or pending maintenance dues.
- **Payment Gateway Integration:** Adding Razorpay/Stripe so members can pay their monthly maintenance directly through the portal.
- **Visitor & Security Management:** A dedicated module for the security gate to log visitors, delivery personnel, and generate entry OTPs.
- **Mobile Application:** Wrapping the responsive web app using React Native or Capacitor for native iOS and Android experiences.

---

## 12. Executive Summary

The AFTOWA Digital Portal is a secure, full-stack web application designed to digitize the operations of a large residential society. Built with a modern stack consisting of React, TypeScript, Tailwind CSS, and Supabase, it provides enterprise-grade Row Level Security and Real-Time capabilities. 

The system completely modernizes society management by offering a transparent financial ledger with verifiable receipt uploads, an interactive members directory with Role-Based Access Control, and streamlined modules for event management, document broadcasting, and grievance redressal. By centralizing operations into a single, beautifully designed interface, AFTOWA drastically reduces administrative overhead, ensures absolute financial transparency, and fosters a connected and informed community.