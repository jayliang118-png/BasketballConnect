# Mobile-Friendly Breadcrumb Navigation Design

**Date:** 2026-03-07
**Status:** Approved

## Overview

Adapt the breadcrumb component to show the full navigation hierarchy on mobile by allowing multi-line wrapping, removing truncation, and hiding separators to save space.

## Current Issues

- Long breadcrumb names truncate with ellipsis on mobile (e.g., "Southern Districts Basketball...")
- Middle breadcrumb items are hidden on mobile (`hidden sm:flex`)
- No way to see full navigation hierarchy on small screens

## Design Solution

### Desktop Behavior (Unchanged)
- Single horizontal line with scroll capability
- All items visible with separators
- Current truncation limits (200px max-width) maintained
- Hover effects on links

### Mobile Behavior (New)
- **Layout**: Breadcrumbs wrap to multiple lines using flexbox
- **Visibility**: All breadcrumb items visible (no hidden middle items)
- **Separators**: Hidden on mobile to reduce visual clutter
- **Text**: No truncation - items display at full width with word wrapping if needed
- **Scroll**: Vertical scroll if needed, but typically won't be needed with multi-line layout

## Implementation Details

### CSS Changes

1. **Middle breadcrumb items**
   - Change: `flex-shrink-0${isMiddle ? ' hidden sm:flex' : ''}`
   - To: `flex-shrink-0${isMiddle ? ' md:flex' : 'flex'}`
   - Effect: Show middle items on mobile, hide on md and up is reconsidered - actually show on mobile, standard behavior

2. **Separators (chevron icons)**
   - Add: `hidden md:block` class to separator SVG
   - Effect: Chevrons only visible on desktop

3. **Container layout**
   - Change: `overflow-x-auto` → `flex-wrap`
   - Keep: `overflow-x-auto scrollbar-hide` for desktop compatibility

4. **Text truncation**
   - Last segment: Remove `max-w-[200px]` truncation on mobile, keep on desktop
   - Links: Remove `max-w-[200px]` truncation on mobile, keep on desktop

### Responsive Breakpoints

- **Mobile (< 768px)**: Multi-line, no separators, full-width text
- **Desktop (≥ 768px)**: Single line, separators visible, current truncation

## Visual Result

**Mobile View:**
```
Home
Southern Districts Spartans
U18 SQJBC > Boys Premier League
Southern Districts Spartans
```

**Desktop View:**
```
Home > Southern Districts Spartans > U18 SQJBC > Boys Premier League > Southern Districts Spartans
```

## Files to Modify

- `src/components/layout/BreadcrumbsFromUrl.tsx`

## Testing

- Test on mobile device (< 768px width)
- Test on tablet (768px - 1024px)
- Test on desktop (> 1024px)
- Verify all breadcrumb items are visible and readable on mobile
- Verify desktop appearance unchanged
- Verify truncation still works on desktop for very long names
