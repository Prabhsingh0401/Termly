---
trigger: always_on
---

# Termly — Frontend & UI Requirements

## Design System

| Token | Value |
|---|---|
| Framework | Next.js 14 (App Router) |
| Styling | Tailwind CSS + shadcn/ui |
| Theme | Dual mode — Light default, Dark toggle supported |
| Font | Inter — weights 400 / 600 / 700, `letter-spacing: -0.02em` on headings |
| Min viewport | 1280px desktop-first; Alerts + Notifications pages mobile-responsive |

---

## Wraith Color Palette

| Role | Light Mode | Dark Mode |
|---|---|---|
| Background | `#E5E3E4` | `#1E1702` |
| Surface / Card | `#FFFFFF` | `#342005` |
| Deep surface | `#F0EEEF` | `#2A1E04` |
| Primary accent | `#047C58` | `#047C58` |
| Text primary | `#1E1702` | `#E5E3E4` |
| Text muted | `#8C886B` | `#8C886B` |
| Border | `rgba(142,136,107,0.2)` | `rgba(142,136,107,0.15)` |
| Risk High | `#C0392B` | `#E74C3C` |
| Risk Medium | `#D4821A` | `#F39C12` |
| Risk Low / Success | `#047C58` | `#2ECC71` |

---

## Liquid Glass Card System

Apply to **all** card surfaces, modals, sidebars, drawers, and KPI cards.

**Light mode card:**
```
backdrop-filter: blur(20px) saturate(180%)
background: rgba(255, 255, 255, 0.72)
border: 1px solid rgba(142, 136, 107, 0.18)
box-shadow: 0 4px 24px rgba(30, 23, 2, 0.07)
border-radius: 16px
```

**Dark mode card:**
```
backdrop-filter: blur(20px) saturate(180%)
background: rgba(52, 32, 5, 0.65)
border: 1px solid rgba(142, 136, 107, 0.12)
box-shadow: 0 4px 24px rgba(0, 0, 0, 0.35)
border-radius: 16px
```

**Rules:**
- Minimum 65% opacity fill — background must never bleed through card content
- Border radius: `16px` cards · `12px` inputs and badges · `8px` buttons
- All modals and drawers: fade + slide in at 200ms, backdrop `rgba(30,23,2,0.4)` with blur

---

## Global Components

### Navbar
- Liquid glass: `backdrop-filter: blur(16px)`, semi-transparent background, sticky top
- Layout: Logo left · Nav links center · Right: search icon + bell icon + avatar
- Bell icon: unread count badge in `#047C58` background
- `border-bottom: 1px solid` using border token

### Sidebar
- Liquid glass surface, width 240px · collapsed icon-only 64px
- Section labels: small-caps `#8C886B`
- Active item: `background: rgba(4,124,88,0.12)`, text `#047C58`, `left-border: 3px solid #047C58`

### Micro-interactions
- Button hover: `translateY(-1px)` + deeper shadow · 150ms ease
- Card hover: `translateY(-2px)` + deeper shadow · 200ms ease
- Focus rings: `2px solid #047C58` offset `2px` on all interactive elements
- Skeleton shimmer: gradient sweep from surface to slightly lighter · 1.5s loop

---

## Pages & Components

### 1. Onboarding Flow (3 steps, target ≤5 min to first value)

- Full-screen centered layout, single liquid glass card per step, progress dots at top
- **Step 1 — Create Organisation:** Org name input + plan selector cards (Free / Pro). Selected plan: `border: 2px solid #047C58`
- **Step 2 — Upload First Document:** Drag-and-drop PDF zone. Dashed border `#8C886B`, hover fill `rgba(4,124,88,0.06)`, icon + label centered: "Drop your contract or bill here". Max 50 MB.
- **Step 3 — View Results:** Dashboard preview with skeleton loaders fading into real AI-extracted results
- Navigation: "Back" ghost button + "Continue" filled `#047C58` button, right-aligned per step

---

### 2. Dashboard (Home)

**KPI Card Row — 5 liquid glass cards:**
- Total Active Contracts · Total Contracted Spend · Expiring in 30 days · Expiring in 60/90 days · Upcoming Billing Liabilities
- Metric: weight 700, large type · Label: small-caps `#8C886B` · Positive delta indicator: `#047C58`
- All cards load behind skeleton shimmer; data from Redis cache, target < 2 seconds

**Charts (Recharts) — inside liquid glass card containers:**
- Spend-by-category bar chart: bars in `#047C58`, secondary in `#8C886B`
- Contract & Billing status donut: segments in `#047C58` (Active), `#D4821A` (Expiring), `#C0392B` (Expired), `#8C886B` (Draft)

**Upcoming Obligations & Billing Table:**
- Sorted by `due_date` ascending
- Zebra rows alternating deep surface
- Due date column: amber highlight if within 30 days
- Status badges: pill shape `border-radius: 999px`, 15% opacity fill + matching text color

---

### 3. Contract & Billing List

- Full-width sortable data table inside liquid glass container
- **Columns:** Vendor / Merchant · Value · Expiry / Due Date · Status · Risk Score
- Column headers: small-caps muted text · Active sort column: `↑↓` icon in `#047C58`
- Row hover: `background: rgba(4,124,88,0.05)`
- Status badges: color-coded pill (see risk colors)
- Risk Score badge: Low = green pill · Medium = amber pill · High = red pill

**Filters (slide-in drawer from right, liquid glass surface):**
- Status · Vendor / Merchant · Category · Date range · Value range · Risk Score
- Filter groups separated by muted divider

**Bulk actions:** Export · Archive

---

### 4. Document Upload (Contracts & Bills)

- **Layout:** Two-column — left: drag-drop zone + progress · right: AI-extracted form (appears post-extraction)
- **Drag-drop zone:** Dashed border `#8C886B`, hover fill `rgba(4,124,88,0.06)`, max 50 MB PDF
- **Progress bar:** `#047C58` fill on surface-token track, animated during Textract → Bedrock processing (real-time via SSE or 3s polling)
- **AI-extracted form fields (all pre-filled, editable):**
  - Title · Vendor / Merchant · Document Type (Contract / Invoice) · Value · Currency
  - Start Date · End Date · Notice Period · Auto-Renewal toggle
  - Governing Law · Payment Terms · Billing Cycle
- **Auto-Renewal toggle:** Thumb `#047C58` when ON · `#8C886B` when OFF
- **Risk Score display:** Large pill badge (Low / Medium / High) + AI justification paragraph below in muted italic text, inside a slightly inset liquid glass card

---

### 5. Document Detail Page

- **Header:** Contract title (weight 700, large) + status badge + action buttons (Edit · Export · Archive) right-aligned
- **Key Dates Timeline:** Horizontal scrollable, milestones as dots on `#047C58` line, tooltip on hover with date + label
- **Obligations & Payments list:** Sortable table · Overdue rows: `border-left: 3px solid #C0392B`
- **Extracted Clauses:** Accordion — closed: clause title in muted text · Open: full text in inset liquid glass card
- **Version History:** Paginated list of document versions
- **Linked Documents:** Amendments, addendums, receipts attached inline
- **Approval Workflow Status Bar:** Step indicators — completed `#047C58` filled · pending `#8C886B` outlined · current step: pulsing ring animation (`Step N of N` label in muted text)

---

### 6. Vendor & Merchant Profile

**List view columns:** Name · Category · Country · Risk Score · Active Contract Count

**Profile view:**
- Header card: vendor name (large weight 700) + category tag + country + aggregate risk badge. Liquid glass card with `border-left: 3px solid #047C58`
- **Tabs:** Contracts · Billing · Compliance Docs · Risk History
- Tab indicator: `#047C58` underline, animated slide on switch
- Linked contracts and billing reuse the list component from page 3
- Aggregate stats: total outstanding billing · total spend · compliance doc expiry dates

---

### 7. Search

- **Search bar:** Full-width, large, liquid glass input · `border: 1.5px solid #047C58` on focus · search icon left · keyboard hint `⌘K` right in muted text
- **Results:** Card list — each result shows doc title + vendor + expiry + risk badge + matching keyword highlighted `rgba(4,124,88,0.2)`
- **Filter panel:** Left sidebar, sticky while results scroll
- Results within 2 seconds for up to 10,000 contracts and bills (OpenSearch)
- Debounce: 300ms before query fires

**Empty state:** Centered minimal line-art illustration in `#8C886B` + "No contracts match your search" + clear filters link

---

### 8. Approvals

- **Pending queue:** Card stack — each card shows contract name · requester · date · approval chain progress
- **Actions:** Approve (filled `#047C58`) · Reject (outlined destructive) — both trigger comment textarea expansion on click
- **Approval chain visualisation:** Horizontal stepper matching document detail workflow bar style

---

### 9. Notifications

- **Bell in navbar:** Unread count badge `#047C58` background
- **In-app toast:** Liquid glass, slides in bottom-right, auto-dismiss 5s · icon left (colored per type) · dismiss X right
- **Alert history page:** Paginated table — alert type icon + message + timestamp + read/unread dot. Mobile-responsive.
- **Preferences:** Toggle list per alert type (Email / In-app / SMS) — same toggle style as Auto-Renewal

---

### 10. Audit Log

- Dense paginated table — `font-size: 13px` · monospace font for old → new value diff columns
- **Columns:** Timestamp (muted text) · User · Action (weight 600, primary color) · Entity (link to doc/vendor) · Old value → New value
- Export button top-right: CSV download

---

## Empty States

Every zero-data view must have:
- Centered layout with minimal line-art illustration in `#8C886B` strokes on transparent background
- Heading: weight 600, primary text — e.g. "No contracts yet"
- Subtext: muted, one sentence
- Primary CTA: filled `#047C58` — e.g. "Upload your first contract"

---

## Performance Targets

| Metric | Target |
|---|---|
| Dashboard data load | < 2 seconds (Redis cache) |
| Search results | < 2 seconds (OpenSearch) |
| AI extraction end-to-end | < 60 seconds |
| Non-AI API responses | < 500ms |
| First value after signup | ≤ 5 minutes |