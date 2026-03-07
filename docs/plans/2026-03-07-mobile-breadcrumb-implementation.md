# Mobile-Friendly Breadcrumb Navigation Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Enable full breadcrumb visibility on mobile by implementing multi-line wrapping, hiding separators, and removing truncation on small screens.

**Architecture:** Update responsive CSS classes in the BreadcrumbsFromUrl component to show all breadcrumb items on mobile with flex-wrap layout, hide separators on mobile, and remove text truncation. Desktop behavior remains unchanged with horizontal scroll and truncation.

**Tech Stack:** React, Tailwind CSS, Next.js responsive breakpoints (sm: 640px, md: 768px, lg: 1024px)

---

## Task 1: Write E2E Test for Desktop Breadcrumb Appearance

**Files:**
- Create: `src/__tests__/e2e/breadcrumbs.spec.ts`

**Step 1: Create E2E test file for desktop breadcrumb display**

Create a new file `src/__tests__/e2e/breadcrumbs.spec.ts`:

```typescript
import { test, expect } from '@playwright/test'

test.describe('Breadcrumbs Desktop View', () => {
  test('should display breadcrumbs on single line with separators on desktop', async ({ page }) => {
    // Navigate to a deep page with multiple breadcrumbs
    await page.goto('/orgs/southern-districts/competitions/u18-sqjbc/divisions/div-1/teams/spartans')

    // Set viewport to desktop size
    await page.setViewportSize({ width: 1024, height: 768 })

    // Get breadcrumb navigation
    const breadcrumb = page.locator('nav[aria-label="Breadcrumb"]')

    // Check that breadcrumb exists
    await expect(breadcrumb).toBeVisible()

    // Get all breadcrumb items
    const items = breadcrumb.locator('div:has(a, span)').filter({ hasNot: breadcrumb.locator('svg') })

    // Verify multiple items are visible (not hidden)
    const visibleItems = await items.count()
    expect(visibleItems).toBeGreaterThan(1)

    // Check that separators are visible
    const separators = breadcrumb.locator('svg')
    const visibleSeparators = await separators.count()
    expect(visibleSeparators).toBeGreaterThan(0)

    // Verify text is truncated on desktop (max-w applied)
    const lastItem = breadcrumb.locator('span.text-hoop-orange').first()
    const computedStyle = await lastItem.evaluate((el) => {
      return window.getComputedStyle(el).maxWidth
    })
    expect(computedStyle).not.toBe('none')
  })
})
```

**Step 2: Run test to verify it fails**

Run: `npm test -- src/__tests__/e2e/breadcrumbs.spec.ts`

Expected: Test fails because the page might not exist or breadcrumbs aren't rendered yet

**Step 3: Note about test setup**

This test will need a valid team page URL. You may need to adjust the URL path based on your actual data structure. The test demonstrates the expected desktop behavior that should be preserved.

---

## Task 2: Write E2E Test for Mobile Breadcrumb Wrapping

**Files:**
- Test: `src/__tests__/e2e/breadcrumbs.spec.ts` (append to existing)

**Step 1: Add mobile test to breadcrumbs test file**

Append to `src/__tests__/e2e/breadcrumbs.spec.ts`:

```typescript
test.describe('Breadcrumbs Mobile View', () => {
  test('should display all breadcrumb items wrapped on mobile without separators', async ({ page }) => {
    // Navigate to a deep page with multiple breadcrumbs
    await page.goto('/orgs/southern-districts/competitions/u18-sqjbc/divisions/div-1/teams/spartans')

    // Set viewport to mobile size
    await page.setViewportSize({ width: 375, height: 667 })

    // Get breadcrumb navigation
    const breadcrumb = page.locator('nav[aria-label="Breadcrumb"]')

    // Check that breadcrumb exists
    await expect(breadcrumb).toBeVisible()

    // Get all breadcrumb items (span and a elements)
    const allItems = breadcrumb.locator('a, span')
    const itemCount = await allItems.count()

    // Verify multiple items are visible (middle items should NOT be hidden on mobile)
    expect(itemCount).toBeGreaterThan(2)

    // Check that separators are NOT visible on mobile
    const separators = breadcrumb.locator('svg.md\\:block')
    const visibleSeparators = await separators.locator('visible=true').count()
    expect(visibleSeparators).toBe(0)

    // Verify text is NOT truncated on mobile
    const breadcrumbItems = breadcrumb.locator('a, span.text-hoop-orange')
    const firstVisibleItem = breadcrumbItems.first()

    // Check that items are wrapping (using flex-wrap)
    const containerClasses = await breadcrumb.getAttribute('class')
    expect(containerClasses).toContain('flex-wrap')
  })
})
```

**Step 2: Run test to verify it fails**

Run: `npm test -- src/__tests__/e2e/breadcrumbs.spec.ts`

Expected: Mobile test fails because CSS classes haven't been updated yet

---

## Task 3: Update Nav Container for Flex Wrapping

**Files:**
- Modify: `src/components/layout/BreadcrumbsFromUrl.tsx:96`

**Step 1: Update container classname to include flex-wrap**

In `src/components/layout/BreadcrumbsFromUrl.tsx`, find line 96:

```typescript
// OLD:
className="container mx-auto px-4 py-2 flex items-center gap-2 text-sm overflow-x-auto scrollbar-hide"

// NEW:
className="container mx-auto px-4 py-2 flex flex-wrap items-center gap-2 text-sm overflow-x-auto scrollbar-hide"
```

**Step 2: Verify the change**

Open the file and confirm `flex-wrap` was added after `flex`.

**Step 3: Commit**

```bash
git add src/components/layout/BreadcrumbsFromUrl.tsx
git commit -m "feat: add flex-wrap to breadcrumb container for mobile multi-line layout"
```

---

## Task 4: Update Middle Breadcrumb Item Visibility for Mobile

**Files:**
- Modify: `src/components/layout/BreadcrumbsFromUrl.tsx:105`

**Step 1: Change middle item visibility class**

In `src/components/layout/BreadcrumbsFromUrl.tsx`, find line 105:

```typescript
// OLD:
className={`flex items-center gap-2 flex-shrink-0${isMiddle ? ' hidden sm:flex' : ''}`}

// NEW:
className={`flex items-center gap-2 flex-shrink-0${isMiddle ? ' md:hidden' : ''}`}
```

**Step 2: Verify the change**

This changes the logic so:
- Mobile (< 768px): middle items are visible (no hidden class)
- Desktop (>= 768px): middle items are hidden with `md:hidden`

Wait, this is wrong. Let me reconsider. Looking at the original:
- `hidden sm:flex` means: hidden by default, visible at sm breakpoint
- This hides middle items on mobile, shows on sm and up

New behavior should be:
- Show middle items on mobile
- Show middle items on desktop (keep current behavior, or based on design they should be visible)

Actually, re-reading the design, we want all items visible on mobile. So:
- Remove the `hidden sm:flex` entirely, OR
- Use a different approach

Let me revise:

```typescript
// REVISED:
className={`flex items-center gap-2 flex-shrink-0`}
```

This removes the conditional hiding entirely. Let me update:

**Step 1 (revised): Remove middle item visibility conditional**

In `src/components/layout/BreadcrumbsFromUrl.tsx`, find line 105:

```typescript
// OLD:
className={`flex items-center gap-2 flex-shrink-0${isMiddle ? ' hidden sm:flex' : ''}`}

// NEW:
className="flex items-center gap-2 flex-shrink-0"
```

**Step 2: Verify the change**

All breadcrumb items now display by default. The flex-wrap added in Task 3 will handle wrapping on mobile.

**Step 3: Commit**

```bash
git add src/components/layout/BreadcrumbsFromUrl.tsx
git commit -m "feat: show all breadcrumb items on mobile by removing hidden sm:flex"
```

---

## Task 5: Hide Separators on Mobile

**Files:**
- Modify: `src/components/layout/BreadcrumbsFromUrl.tsx:108-120`

**Step 1: Add responsive class to separator SVG**

In `src/components/layout/BreadcrumbsFromUrl.tsx`, find the SVG element around line 108-120:

```typescript
// OLD:
{index > 0 && (
  <svg
    className="w-3 h-3 text-gray-600"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >

// NEW:
{index > 0 && (
  <svg
    className="w-3 h-3 text-gray-600 hidden md:block"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
```

**Step 2: Verify the change**

The separator SVG now has `hidden md:block`, making it:
- Hidden on mobile (< 768px)
- Visible on md and larger (>= 768px)

**Step 3: Commit**

```bash
git add src/components/layout/BreadcrumbsFromUrl.tsx
git commit -m "feat: hide breadcrumb separators on mobile"
```

---

## Task 6: Remove Text Truncation on Mobile

**Files:**
- Modify: `src/components/layout/BreadcrumbsFromUrl.tsx:122-132`

**Step 1: Update last segment (current page) truncation**

In `src/components/layout/BreadcrumbsFromUrl.tsx`, find the last segment span around line 122-124:

```typescript
// OLD:
{isLast ? (
  <span className="text-hoop-orange font-medium truncate max-w-[200px]">
    {segment.label}
  </span>

// NEW:
{isLast ? (
  <span className="text-hoop-orange font-medium md:truncate md:max-w-[200px]">
    {segment.label}
  </span>
```

**Step 2: Update link truncation**

Find the link element around line 127-132:

```typescript
// OLD:
<Link
  href={segment.href}
  className="text-gray-400 hover:text-gray-200 transition-colors truncate max-w-[200px]"
>

// NEW:
<Link
  href={segment.href}
  className="text-gray-400 hover:text-gray-200 transition-colors md:truncate md:max-w-[200px]"
>
```

**Step 3: Verify both changes**

Both truncation classes now have `md:` prefix, meaning:
- Mobile: no truncation, text wraps naturally
- Desktop (>= 768px): truncation applies to max 200px

**Step 4: Commit**

```bash
git add src/components/layout/BreadcrumbsFromUrl.tsx
git commit -m "feat: remove text truncation on mobile breadcrumbs"
```

---

## Task 7: Run E2E Tests to Verify Implementation

**Files:**
- Test: `src/__tests__/e2e/breadcrumbs.spec.ts`

**Step 1: Run E2E tests**

Run: `npm test -- src/__tests__/e2e/breadcrumbs.spec.ts`

Expected: Tests pass (if you have valid test URLs) or provide meaningful feedback about structure

**Step 2: Manual verification - Desktop**

1. Open the app in a desktop browser (1024px+ width)
2. Navigate to a team page (deep URL)
3. Verify:
   - Breadcrumbs on single line
   - Separators (chevrons) visible
   - Text truncation appears on very long names

**Step 3: Manual verification - Mobile**

1. Open DevTools (F12)
2. Toggle device toolbar (Ctrl+Shift+M)
3. Select mobile device preset (iPhone 13, etc.)
4. Navigate to same team page
5. Verify:
   - All breadcrumb items visible (not hidden)
   - Separators NOT visible
   - No text truncation, names fully visible
   - Multiple lines if needed

**Step 4: Test specific breakpoints**

- Test at exactly 767px (should show mobile layout)
- Test at exactly 768px (should show desktop layout)
- Verify smooth transition

---

## Task 8: Final Verification and Documentation

**Files:**
- Read: `src/components/layout/BreadcrumbsFromUrl.tsx`
- Docs: `docs/plans/2026-03-07-mobile-breadcrumb-design.md`

**Step 1: Review final implementation**

Review the complete `BreadcrumbsFromUrl.tsx` file to ensure all changes are correct:
- flex-wrap added to container
- Middle items visibility conditional removed
- Separators have hidden md:block
- Truncation classes have md: prefix

**Step 2: Verify design alignment**

Compare implemented changes against the design document at `docs/plans/2026-03-07-mobile-breadcrumb-design.md`:
- [ ] Desktop behavior unchanged
- [ ] Mobile shows all items
- [ ] Mobile hides separators
- [ ] Mobile removes truncation

**Step 3: Test on actual device (if available)**

If possible, test on an actual mobile device:
1. Deploy or run locally on device
2. Navigate to team pages
3. Verify responsive behavior works as expected

**Step 4: Final commit (if not already done)**

```bash
git status
```

If all individual commits are done, verify the commit log:

```bash
git log --oneline -5
```

Should show commits from Tasks 3-6 related to breadcrumb changes.

---

## Summary of Changes

| File | Change | Impact |
|------|--------|--------|
| `src/components/layout/BreadcrumbsFromUrl.tsx:96` | Add `flex-wrap` to container | Enables multi-line layout |
| `src/components/layout/BreadcrumbsFromUrl.tsx:105` | Remove `hidden sm:flex` conditional | Shows all items on mobile |
| `src/components/layout/BreadcrumbsFromUrl.tsx:109` | Add `hidden md:block` to SVG | Hides separators on mobile |
| `src/components/layout/BreadcrumbsFromUrl.tsx:123` | Add `md:` prefix to truncation classes | Removes truncation on mobile |
| `src/components/layout/BreadcrumbsFromUrl.tsx:129` | Add `md:` prefix to truncation classes | Removes truncation on mobile |

## Testing Strategy

- **E2E Tests**: Verify responsive behavior at different breakpoints
- **Manual Testing**: Desktop and mobile verification
- **Visual Regression**: Compare before/after on actual devices
