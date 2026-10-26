# Quieter 1-Click Quests under the Brain Dump bar

## What changes
1. **Move** the 1-Click Quests row from above the Brain Dump bar to directly below it.
2. **Mute** them: grayscale icons (no colored tint circles), muted gray text, small size. On hover/focus the text brightens to normal foreground so they still feel clickable.
3. **Remove the pill shapes**: no border, no background, no rounded capsule — they read as plain text links (icon + label) separated by spacing, so only the Brain Dump bar has a pill shape.
4. Keep the "Created!" confirmation and the tap animation, but drop the colored glow on click.

## Accessibility
- Muted text uses `text-muted-foreground` (already AA in both themes).
- Each item keeps a 44px tall tap target and the global focus ring.
- Small "1-Click Quests" label stays, muted.

## Technical details
- `src/components/quest-app.tsx`: swap order of `<TemplateChips />` and `<QuickAddBar />`; in `TemplateChips`, replace the button classes with `flex items-center gap-1.5 px-1 min-h-11 text-sm text-muted-foreground hover:text-foreground`, remove the tint background span styling and add `grayscale opacity-70` to the emoji, remove the boxShadow style.
