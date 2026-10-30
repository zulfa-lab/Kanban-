# Design Specification & UI/UX Guidelines
## Personal & Collaborative Work Tracker (Jira-Lite)

**Version:** 1.0.0  
**Design Philosophy:** Precision, Minimalism, Tactile Responsiveness, Glassmorphism & High-Contrast Readability.  
**Inspiration:** Jira Software Cloud, Linear App, Raycast, and Apple Human Interface Guidelines.

---

## 1. Brand Identity & Visual Language

Aura Jira-Lite is designed for developers, project leads, and agile collaborators who need an intuitive, high-velocity Kanban workspace without enterprise bloat. The visual direction balances the crisp utility of Jira with the fluid aesthetics of modern dark-mode native desktop tools.

### 1.1 Core Principles
- **Glanceable Information Hierarchy:** Ticket priorities, assignees, and statuses are instantly recognizable through color-coded tokens and badges.
- **Fluid & Tactile Micro-Interactions:** Cards feel physical with subtle lifts, glass highlights, and responsive drag handles.
- **Dual Theme Support:** Deep Onyx Dark Mode (default) with luminous accents and Crisp Studio Light Mode for high-luminance environments.
- **Frictionless Workflow:** Fast keyboard shortcuts (`C` to create, `/` or `Ctrl+K` to search, `Esc` to dismiss modals) and optimistic UI updates for real-time multiplayer feel.

---

## 2. Color Palette & Design Tokens (Solar Orange Theme)

### 2.1 Dark Mode (Primary - Warm Obsidian & Solar Orange)
| Token Name | Hex / RGBA | Role / Usage |
| :--- | :--- | :--- |
| `--bg-base` | `#0c0a09` | Main warm obsidian application background |
| `--bg-surface` | `#14110e` | Kanban columns, navigation bars, modal backgrounds |
| `--bg-card` | `#231d18` | Individual Kanban task cards |
| `--bg-card-hover` | `#2c241e` | Card hover state with warm ember lift |
| `--border-subtle` | `rgba(255, 255, 255, 0.08)` | Column borders, separators, subtle dividers |
| `--border-focus` | `#f97316` | Active input outlines, focus rings |
| `--border-glow` | `rgba(249, 115, 22, 0.4)` | Focus glow and drop-zone halos |
| `--accent-primary` | `#f97316` | Primary action buttons, active tabs, brand accents |
| `--accent-hover` | `#ea580c` | Deep ember button hover state |
| `--text-primary` | `#fafaf9` | Primary titles, modal headers, card titles |
| `--text-secondary` | `#a8a29e` | Metadata, timestamps, descriptions |
| `--text-muted` | `#78716c` | Placeholders, inactive icons, column count chips |

### 2.2 Light Mode (Adaptive - Warm Amber Pearl)
| Token Name | Hex / RGBA | Role / Usage |
| :--- | :--- | :--- |
| `--bg-base` | `#faf8f5` | Main application canvas with warm glow |
| `--bg-surface` | `#ffffff` | Kanban column wrappers and navigation background |
| `--bg-card` | `#ffffff` | Task cards and modal surfaces |
| `--bg-card-hover` | `#fffaf3` | Card hover elevation with soft amber hue |
| `--border-subtle` | `rgba(0, 0, 0, 0.08)` | Crisp warm borders |
| `--border-focus` | `#ea580c` | Active focus rings |
| `--text-primary` | `#1c1917` | Deep espresso primary text |
| `--text-secondary` | `#57534e` | Secondary labels |
| `--text-muted` | `#78716c` | Subdued metadata |

### 2.3 Status Lane Accent Colors
- **To Do:** Amber Coral  
  Accent: `#fb923c` (`rgba(251, 146, 60, 0.12)` chip bg)
- **In Progress:** Radiant Gold / Electric Tangerine  
  Accent: `#f59e0b` (`rgba(245, 158, 11, 0.12)` chip bg)
- **Done:** Mint Emerald  
  Accent: `#10b981` (`rgba(16, 185, 129, 0.12)` chip bg)

### 2.4 Priority Badges
- 🔴 **High Priority:**  
  Badge BG: `rgba(239, 68, 68, 0.14)` | Text & Icon: `#ef4444` | Border: `rgba(239, 68, 68, 0.25)`
- 🟡 **Medium Priority:**  
  Badge BG: `rgba(245, 158, 11, 0.14)` | Text & Icon: `#f59e0b` | Border: `rgba(245, 158, 11, 0.25)`
- 🟢 **Low Priority:**  
  Badge BG: `rgba(16, 185, 129, 0.14)` | Text & Icon: `#10b981` | Border: `rgba(16, 185, 129, 0.25)`

---

## 3. Typography Hierarchy

Primary Font: `Plus Jakarta Sans`, `-apple-system`, `BlinkMacSystemFont`, `Segoe UI`, `Roboto`, `sans-serif`  
Code / Monospace: `JetBrains Mono`, `Fira Code`, `monospace`

| Style | Size | Weight | Line Height | Usage |
| :--- | :--- | :--- | :--- | :--- |
| **Heading 1** | 24px (1.5rem) | 700 SemiBold | 1.25 | App Header / Project Title |
| **Heading 2** | 18px (1.125rem) | 600 SemiBold | 1.3 | Modal Headers, Column Titles |
| **Heading 3** | 15px (0.9375rem) | 600 Medium | 1.4 | Task Card Titles |
| **Body Regular** | 14px (0.875rem) | 400 Regular | 1.5 | Form Inputs, Descriptions |
| **Caption / Badge** | 12px (0.75rem) | 600 SemiBold | 1.2 | Priority Badges, Assignee Chips |
| **Micro** | 11px (0.6875rem) | 500 Medium | 1.2 | Card Timestamps, Issue Key (`JIRA-102`) |

---

## 4. Layout Architecture & Component Structure

```
+-----------------------------------------------------------------------------------------+
| [Logo] Jira-Lite  |  [All Tasks] [My Tasks] [Friend's]  |  [🔍 Search Ctrl+K]  [+ Issue]  [👤] |
+-----------------------------------------------------------------------------------------+
| Project: Sprint MVP  •  Realtime Status: 🟢 Connected (Firebase/Demo)   •  Filter: Active  |
+-----------------------------------------------------------------------------------------+
|                                                                                         |
|  +--------------------+   +--------------------+   +--------------------+               |
|  | 🔵 TO DO       (3) + |   | 🟡 IN PROGRESS (2) + |   | 🟢 DONE        (4) + |               |
|  +--------------------+   +--------------------+   +--------------------+               |
|  | [Card 1]           |   | [Card 4]           |   | [Card 6]           |               |
|  | - Title            |   | - Title            |   | - Title            |               |
|  | - Priority / Date  |   | - Priority / Date  |   | - Priority / Date  |               |
|  | - Assignee Avatar  |   | - Assignee Avatar  |   | - Assignee Avatar  |               |
|  |                    |   |                    |   |                    |               |
|  | [Card 2]           |   | [Card 5]           |   | [Card 7]           |               |
|  |                    |   |                    |   |                    |               |
|  | [+ Add task...]    |   | [+ Add task...]    |   | [+ Add task...]    |               |
|  +--------------------+   +--------------------+   +--------------------+               |
|                                                                                         |
+-----------------------------------------------------------------------------------------+
```

### 4.1 Global Navigation Header
- **Project Brand & Identity:** Jira-style badge with sleek gradient emblem.
- **Collaborator Quick Filters:**
  - `All Tasks` (displays entire sprint board)
  - `My Tasks` (filters items assigned to logged-in user email)
  - `Friend's Tasks` (filters items assigned to collaborator)
- **Live Search Bar:** Real-time fuzzy filtering on task titles, descriptions, and IDs.
- **Global Actions:**
  - `+ Create Issue` button (Primary gradient fill with hover elevate)
  - `Theme Toggle` (Smooth sun/moon morph)
  - `User Profile Dropdown` (shows user avatar, email whitelist badge, and Sign Out)

### 4.2 Kanban Board & Columns
- 3 Dedicated Lanes: `To Do`, `In Progress`, `Done`.
- **Column Header:**
  - Status indicator dot with glow.
  - Column name and task counter badge.
  - Quick `+` button to prepend a new task directly into that lane.
- **Card Anatomy:**
  - **Top Row:** Issue Key (e.g. `JIRA-01`), Priority Badge (`High`, `Medium`, `Low`).
  - **Middle Row:** Task Title (bold, crisp 15px) and optional description preview line.
  - **Bottom Row:** Formatted relative timestamp (e.g. `2h ago`) and Assignee Avatar with initials tooltip.
  - **Card Hover:** Subtle elevation, border glow, and visual drag grip cursor.

### 4.3 Task Modal (Create & Detail/Edit)
- **Full View & Edit Capability:**
  - Editable Task Title with instant autofocus.
  - Markdown-capable Description field with preview toggle.
  - Segmented controls for **Status** (`To Do` | `In Progress` | `Done`).
  - Segmented buttons for **Priority** (`Low` | `Medium` | `High`).
  - **Assignee Selector:** Dropdown showing project members with avatar badges.
  - **Meta Information:** Created at date, Last updated at date, Document ID.
  - **Danger Zone:** Delete button with confirmation modal to prevent accidental data loss.

### 4.4 Whitelist Security & Access Control UI
- In compliance with Section 3.1 & 5.1 of the PRD:
  - When unauthorized email signs in via Google SSO, an elegant **"Access Denied"** screen is rendered.
  - Clear message: *"Email not authorized. Only whitelisted project members have access."*
  - Action buttons: Switch Google Account, Sign Out, or switch to Interactive Demo Mode.

---

## 5. Drag-and-Drop Interaction Design

- **Pointer & HTML5 Drag Integration:**
  - When a user starts dragging a card, the card enters a floating state:
    - `transform: scale(1.03) rotate(1.5deg);`
    - `box-shadow: 0 16px 32px -8px rgba(0, 0, 0, 0.4);`
    - `opacity: 0.85;`
  - Columns highlight when a dragged item hovers over them (`outline: 2px dashed var(--accent-primary)`).
  - Dropping seamlessly transitions the card with CSS ease-out.
  - Real-time Firestore update sends new `status` and `order` properties.

---

## 6. Accessibility & Responsive Breakpoints

- **Responsive Breakpoints:**
  - **Desktop (>= 1024px):** 3-column side-by-side grid with fixed width columns.
  - **Tablet (768px - 1023px):** Compact columns with smooth horizontal board scroll.
  - **Mobile (< 768px):** Snappy horizontal swipe lanes with snap points (`scroll-snap-type: x mandatory`).
- **Accessibility:**
  - Full keyboard accessibility with tab navigation.
  - ARIA attributes on modals (`role="dialog"`), drag items (`aria-grabbed`), and status filters.
  - Minimum contrast ratio 4.5:1 on all text elements against card backgrounds.
