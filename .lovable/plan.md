

## Fix: VideoPlayer wrapper overriding position

### Problem
`VideoPlayer.tsx` line 52 forces `position: 'relative'` via inline style, which overrides the `absolute` class passed from HeroSection. The video wrapper becomes `relative`, pushing it into normal flow and covering all content below it.

### Fix

**File**: `src/components/ui/VideoPlayer.tsx` (line 52)

Remove the forced `position: 'relative'` from the inline style. Instead, add `relative` as a fallback CSS class that only applies when no position class is passed:

```tsx
<div className={`${className ?? ''} ${className?.includes('absolute') || className?.includes('fixed') ? '' : 'relative'}`} style={style}>
```

Or simpler — just remove `position: 'relative'` from the inline style entirely since the tap-to-play overlay uses `absolute` which works relative to any positioned ancestor:

```tsx
<div className={className} style={style}>
```

The overlays inside (tap-to-play, loading) use `absolute inset-0` which will work correctly as long as the wrapper has any positioning — and the parent `<section>` in HeroSection already has `relative`, so they'll be scoped correctly.

**Simplest safe approach**: Keep `relative` as a Tailwind class default but let passed `className` override it:

```tsx
<div className={cn('relative', className)} style={style}>
```

This way `absolute` from className overrides the default `relative`, and when no position class is passed (like in LazyVideo), it defaults to `relative` for the overlays.

