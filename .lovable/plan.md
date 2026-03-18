

## Bug: VideoPlayer wrapper div breaking HeroSection z-order

### Problem
The `VideoPlayer` component wraps the `<video>` in a `<div className="relative" style={{ width: '100%', height: '100%' }}>`. In the HeroSection, the `<video>` was previously a direct child with `absolute inset-0`, but now this wrapper `div` with `position: relative` creates a new stacking context that sits on top of the text content (z-[2]) and overlays.

### Fix

**File**: `src/components/ui/VideoPlayer.tsx` (line 52)

Change the wrapper div from `className="relative"` to accept and forward positioning classes. Specifically, when used in HeroSection the wrapper needs `absolute inset-0` instead of `relative`.

The simplest approach: make the wrapper inherit positioning by changing it to use `absolute inset-0` by default (since every usage of VideoPlayer positions it absolutely), or better — just pass through the outer positioning to the wrapper and keep the video unstyled for position.

**Concrete change**: Move the `className` and positional styles from the `<video>` to the wrapper `<div>`, and let the `<video>` just fill its parent with `w-full h-full object-cover`. This way the wrapper takes the intended position and the overlays (tap-to-play, loading) stay correctly scoped inside it without breaking the parent's stacking order.

In `VideoPlayer.tsx`:
- Line 52: Change wrapper to `<div className={className} style={{ ...style, position: 'relative' as any }}>` — forwarding className/style to the wrapper
- The `<video>` inside gets simplified classes: just `w-full h-full object-cover` plus the visual filter styles
- Separate positional props from visual props, or simply split: the wrapper gets position/size classes, the video gets visual filter styles

**Simplest safe fix**: Just add `absolute inset-0` to the wrapper div so it doesn't disrupt flow:
```tsx
<div className="absolute inset-0" style={{ width: '100%', height: '100%' }}>
```
And keep everything else the same. This matches the original behavior where the video was `absolute inset-0`.

