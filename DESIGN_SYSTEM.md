# MGate HRMS — Enterprise Design System (v1.0)

Premium enterprise SaaS standard for the whole app. Quality bar: **Microsoft Fluent · Apple HIG · Google Material 3 · Stripe · Linear · Notion**. Every screen must feel luxurious, minimal, information-rich, and production-ready — never a generic admin template.

**Stack (do not deviate):** React + **Mantine v8** + **Recharts** + React Query. No Tailwind, no Shadcn, no Framer Motion. Achieve the premium look *within Mantine* using its props, theme tokens, and small CSS transitions. One consistent design system — never introduce a second UI framework.

Precedence: user's explicit request → this doc → your own taste.

---

## 1. Color

Use the **violet** primary (premium, distinctive). Semantic colors are separate from the accent and only signal state.

| Token | Hex | Use |
|-------|-----|-----|
| Primary `violet` | `#6D28D9` | primary actions, active nav, key accents, root org node |
| Primary light | `#8B5CF6` | gradients, hover, secondary accent |
| Blue | `#2563EB` | informational charts/badges |
| Green (success) | `#16A34A` | success, positive trend, "active" |
| Orange (warning) | `#F59E0B` | warning, pending, "on leave" |
| Red (danger) | `#EF4444` | danger, negative trend, "rejected" |
| Background | `#F8FAFC` | page ground (`--mantine-color-body` light) |
| Card | `#FFFFFF` | surfaces |
| Border | `#E2E8F0` | hairline borders only |
| Text | `#0F172A` | primary text |
| Muted | `#64748B` | secondary text, captions |

- **Neutrals are chosen, not default:** slate greys (slightly cool), not pure grey.
- **Gradients** (use sparingly, for hero/icon tiles): `linear-gradient(135deg,#6D28D9,#8B5CF6)`.
- Chart palette: `["#6D28D9","#2563EB","#16A34A","#F59E0B","#EF4444","#06B6D4","#EC4899","#14B8A6"]`.

---

## 2. Typography

- **Font: Inter** (already the app font). Tabular-nums (`fontVariantNumeric:"tabular-nums"`) on every figure that lines up — KPIs, tables, money.
- Scale: Page title 28–32 / Section 20–22 / Card title 16–18 / Body 14 / Caption 12.
- KPI numbers: weight 800, `letter-spacing:-0.02em`, tabular.
- Section/eyebrow labels: 11px, uppercase, `letter-spacing:0.07em`, muted, weight 600.
- `text-wrap: balance` on headings; body line length ≤ ~70ch.

---

## 3. Spacing & Radius (8px system)

- **Spacing scale:** 4, 8, 12, 16, 24, 32, 48. Never random values. Lay out with `gap` (flex/grid), not per-element margins.
- **Card padding:** `lg` (24px) for content cards; `md` for compact.
- **Section gaps:** 16–24px between cards (`spacing="md"` SimpleGrid).
- **Radius:** Cards **20px** · inputs/buttons 12px (`md`) · icon tiles 14px · pills `sm`.
- Generous white space. Minimal borders — prefer shadow + spacing to separate, not lines.

---

## 4. Elevation (shadows)

Layered, soft — never harsh.

```
card:    0 1px 2px rgba(16,24,40,.04), 0 1px 3px rgba(16,24,40,.06)
hover:   0 12px 28px rgba(16,24,40,.10)
popover: 0 4px 12px rgba(0,0,0,.08)
hero:    0 8px 24px <accent>22
```

---

## 5. Core component patterns

Reuse the shared kit — **`src/screens/dashboard/components/DashboardKit.jsx`**: `KpiCard`, `PanelCard`, `ChartTooltip`, `topSlices`, `fmtMoney`, `initials`, `SPARK_HEX`. Extend it rather than re-inventing.

**KPI card** (`KpiCard`): colored/gradient icon tile (46px, radius 14) · label (12px muted) · big tabular number (28px/800) · trend badge (green ↑ / red ↓) · **mini sparkline** (gradient area) · **hover lift** (translateY -3px + shadow grow) · 20px radius.

**Panel / section card** (`PanelCard`): 20px radius, soft shadow, title + optional sub + right-aligned action ("View all"). Wrap every chart/list block in one.

**Table** (premium): rounded container, **sticky header**, search + filters + sort + pagination, **status badges** (semantic color, `variant="light"`), avatars, row hover, right-aligned action menu, bulk-select where useful. Always `striped highlightOnHover`.

**Forms:** labels above inputs, required `*` in red, **inline validation**, 12px radius. **Pickers over free-text** for any known entity (see §8). 2-col on desktop, 1-col mobile.

**Empty states:** always `AppEmptyState` (related icon + bold heading + helper + optional CTA). Never bare dim text. (See [[ui_empty_states]].)

**Modals:** 20px radius, max-width ~700, header/body/footer, close top-right, fade.

**Buttons:** Primary = filled violet · Secondary = `variant="default"` (outlined) · Danger = red · Success = green. Height ~40–44, radius 12.

**Badges/pills:** `variant="light"`, semantic color, radius `sm`, small. State always encoded in color + label.

---

## 6. Charts (Recharts)

Give charts the same care as type.

- **Line → smooth gradient Area**: `type="monotone"`, `<defs><linearGradient>` fill (stopOpacity 0.3→0), strokeWidth 2–2.5, `axisLine={false} tickLine={false}`, faint grid (`vertical={false}`), `<Tooltip content={<ChartTooltip/>}/>`.
- **Bar:** rounded (`radius={[4,4,0,0]}` vertical / `[0,4,4,0]` horizontal), `barSize` 14–18.
- **Pie → Donut:** `innerRadius`, `paddingAngle={3}`, center total. **Cap slices with `topSlices(data,key,5)`** → top 5 + "Others". Never a pie with many slices.
- Progress **rings** for single percentages.
- Custom tooltip (`ChartTooltip`), interactive legend (circle icons), animated, beautiful empty state.

---

## 7. Layout & navigation

- **Page structure (every screen):** Breadcrumb → Page header (title + sub + actions) → filters → content. (`ScreenWrapper` provides breadcrumb + error boundary.)
- **Sidebar:** grouped sections (Organization, Workforce, Talent, Payroll & Finance, Workplace, Compliance, Analytics, Administration, Platform) with uppercase headers; collapsible; active = violet bg + left accent; hover; bottom profile. (See `SIDEBAR_SECTIONS` in permissions.js.)
- **Header:** global search (⌘K target), notifications, profile, theme switch.
- **Dashboard:** welcome → KPI row (sparkline cards) → charts (area/donut) → quick actions → recent/birthdays/announcements.
- **Responsive:** desktop full sidebar · tablet collapsible · mobile drawer · cards stack · tables scroll-x in their own container (page never scrolls sideways).

---

## 8. Behaviour rules (from project memory)

- **User-friendly forms:** any known entity → searchable `<Select>` (employee picker = name + ID), never free-text. Fall back to employee-derived options when a reference list is empty. (See [[ui_user_friendly_forms]].)
- **Empty states:** `AppEmptyState` everywhere. (See [[ui_empty_states]].)
- **Role-aware:** every screen respects ROLE_ROUTES; sensitive data (salary, audit) gated to the right roles.
- **No-hardcode:** colors/spacing/fonts come from theme tokens, not literals scattered in JSX.

---

## 9. Micro-interactions & motion

- Card hover lift, button press, animated number/chart transitions, loading **skeletons** (not just spinners), sidebar collapse, modal fade.
- Duration ~150–200ms, ease. Respect `prefers-reduced-motion`.
- Restraint: motion should feel intentional, not busy. Over-animation reads as cheap.

---

## 10. Dark mode

Every screen must work in light **and** dark. Use Mantine `dark`/`light` tokens (`var(--mantine-color-*)`, `c="dimmed"`) — never hardcoded `#fff`/`#000`. Body: `#F8FAFC` light / `#0F172A` dark.

---

## Acceptance checklist (per screen)

- [ ] 20px cards, soft shadow, generous spacing, minimal borders
- [ ] KPIs use `KpiCard` (sparkline + trend + hover)
- [ ] Charts: gradient area / rounded bars / donut(topSlices) + `ChartTooltip`
- [ ] Tables: sticky header, search/filter/sort/paginate, status badges, hover
- [ ] Forms: pickers not free-text, inline validation, labels above
- [ ] `AppEmptyState` for every empty list
- [ ] Works in dark mode; tabular-nums on figures; Inter type scale
- [ ] Role-aware; build passes; nothing broken
