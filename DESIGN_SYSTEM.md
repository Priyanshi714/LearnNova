# LearnNova Premium Design System

Welcome to the **LearnNova Premium Design System**. This centralized system provides beautiful, reusable UI primitives, consistent layout layouts, unified typography, inputs, buttons, and custom motion animations.

This design system is inspired by industry-leading developer tools and dashboards (Linear, Stripe, Vercel, and Raycast) featuring:

- Sleek dark purple glassmorphism
- Extremely clean layouts
- Minimalist typography
- High-contrast accessibility
- Micro-interaction transitions

---

## 🚀 Design Principles

1. **Clean Spacing**: Leverage consistent margins, paddings, and alignment rules to make dashboards breathable.
2. **Typography Hierarchy**: Use font-size contrasts and weights instead of excessive lines or colors to convey content importance.
3. **Glassmorphism Aesthetics**: Combine semi-transparent dark backgrounds (`bg-card/45`), thin high-contrast borders (`border-border/40`), and backdrop filters (`backdrop-blur-md`) for depth.
4. **Snappy Micro-interactions**: Hover events should trigger subtle scaling (`hover:scale-[1.01]`) and brand color glows (`shadow-ds-glow`) rather than heavy page transitions.

---

## 🎨 Color System & Gradients

The application is built on top of dark mode values defined in `src/styles.css`:

| Category         | Tailwind Class          | CSS Variable              | Purpose                           |
| :--------------- | :---------------------- | :------------------------ | :-------------------------------- |
| **Background**   | `bg-background`         | `var(--background)`       | Deep dark canvas background       |
| **Card**         | `bg-card`               | `var(--card)`             | Muted card backdrop               |
| **Primary**      | `bg-primary`            | `var(--primary)`          | Brand purple/indigo               |
| **Primary Glow** | `bg-primary-glow`       | `var(--primary-glow)`     | Vibrant highlight purple          |
| **Muted**        | `text-muted-foreground` | `var(--muted-foreground)` | Secondary supporting text color   |
| **Success**      | `text-success`          | `var(--success)`          | Positive status/Solved badge      |
| **Warning**      | `text-warning`          | `var(--warning)`          | Medium difficulty/Attempted badge |
| **Destructive**  | `text-destructive`      | `var(--destructive)`      | High difficulty/Critical actions  |

---

## 📏 Spacing & Sizing Scale

To ensure visual consistency, always use the defined spacing scale:

- `ds-xs` (4px / `0.25rem`) — Dense padding / small gap
- `ds-sm` (8px / `0.5rem`) — Badge gaps / text padding
- `ds-md` (12px / `0.75rem`) — Small layout gaps
- `ds-lg` (16px / `1rem`) — Default body gaps / card padding
- `ds-xl` (24px / `1.5rem`) — Section padding / page gaps
- `ds-2xl` (32px / `2rem`) — Hero layout gaps
- `ds-3xl` (48px / `3rem`) — Page hero top padding

---

## 🖋️ Typography Scale

Typographic primitives are exported from `@/components/design-system/typography`:

```tsx
import { PageTitle, SectionTitle, CardTitle, Subtitle, MutedText, CodeText } from "@/components/design-system";

// Usage Example
<PageTitle>Algorithms Index</PageTitle>
<Subtitle>Master high-frequency patterns step by step.</Subtitle>
<SectionTitle>Dynamic Programming</SectionTitle>
<CardTitle>Knapsack Problem</CardTitle>
<MutedText>Revision scheduled for tomorrow.</MutedText>
<CodeText>O(N * W)</CodeText>
```

---

## 🎛️ Shared UI Components Catalogue

### 1. Buttons & CTA System

Standardized shapes, padding, click scaling, and focus indicators.

```tsx
import { Button, LoadingButton, IconButton } from "@/components/design-system";
import { Plus } from "lucide-react";

// Variants: primary (default), secondary, outline, ghost, danger, success
<Button variant="primary" onClick={handleClick}>
  Start Session
</Button>

// Support for icons and loading state out of the box
<Button variant="outline" iconLeft={<Plus />}>
  Add Note
</Button>

<LoadingButton loading={true} loadingText="Saving approach...">
  Save
</LoadingButton>

<IconButton>
  <Plus />
</IconButton>
```

### 2. Form Inputs System

Inputs feature standardized padding, borders, inner shadows, and focus states.

```tsx
import { TextInput, SearchInput, Select, SearchBox } from "@/components/design-system";

// Custom standard inputs
<TextInput placeholder="Enter topic name..." />
<SearchInput placeholder="Filter problems..." value={search} onChange={e => setSearch(e.target.value)} onClear={() => setSearch("")} />

// Native dropdown wrapper with chevron arrow
<Select
  options={[
    { value: "easy", label: "Easy" },
    { value: "medium", label: "Medium" }
  ]}
/>

// Interactive Command Palette Style Search Box
<SearchBox placeholder="Search problems (⌘K)..." value={val} onChange={handleChange} shortcut="⌘K" />
```

### 3. Card System

All cards feature subtle shadow depth, glassmorphism filters, and hover transitions.

```tsx
import { GlassCard, StatCard, ProgressCard, ActionCard } from "@/components/design-system";
import { Activity } from "lucide-react";

// Glass Card (Default container)
<GlassCard title="Approach Notes" subtitle="Key trade-offs">
  Compare recursive vs iterative logic...
</GlassCard>

// Stat Card
<StatCard label="Total Problems Solved" value={142} trend={<span className="text-success">+12%</span>} />

// Progress Card
<ProgressCard title="Two Pointers Mastery" value={72} solvedCount={18} totalCount={25} />

// Clickable Interactive Action Card
<ActionCard onClick={() => navigate("/patterns/two-pointers")}>
  View detail statistics
</ActionCard>
```

### 4. Badge & Chip System

Metadata, difficulty, priorities, and topic badges.

```tsx
import { InfoChip, StatusChip, DifficultyBadge, MasteryBadge } from "@/components/design-system";

// Key-value chip
<InfoChip label="Time Complexity" value="O(N log N)" />

// Solved / Attempted / Pending indicator
<StatusChip status="Solved" />
<StatusChip status="Attempted" />

// Difficulty (Easy, Medium, Hard)
<DifficultyBadge difficulty="Medium" />

// Mastery indicator
<MasteryBadge level="Master" />
```

### 5. Skeleton & Loading States

Replaces legacy spinners with responsive placeholder cards.

```tsx
import {
  PageSkeleton,
  CardSkeleton,
  ListSkeleton,
  TableSkeleton,
  CodeSkeleton,
  MarkdownSkeleton,
} from "@/components/design-system";

// In components:
if (isLoading) {
  return <PageSkeleton />;
}
```

### 6. Animation Wrappers

Subtle entry animations implemented using highly-performant Tailwind CSS `@keyframes` animations.

```tsx
import { FadeIn, SlideUp, ScaleOnHover } from "@/components/design-system";

// Fade in block
<FadeIn delay={150}>
  <p>Delayed item content</p>
</FadeIn>

// Slide up list item
<SlideUp delay={200}>
  <GlassCard>Slide up slide entry</GlassCard>
</SlideUp>
```
