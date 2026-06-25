Refactor the `QuickAddBar` component in `src/components/quest-app.tsx` so the input field and "Capture" button sit inside a single cohesive pill-shaped container, similar to the Daily XP pill's rounded-full, bordered, slightly inset look.

### Changes
1. **Input field framing**: Wrap the `<input>` in a `rounded-full` container with a visible border and subtle background (`bg-secondary/60` or similar) so it reads as a clear text-entry surface rather than invisible text on a card.
2. **Capture button integration**: Keep the "Capture" button as a rounded pill inside the same horizontal container, maintaining the existing neon styling.
3. **Overall layout**: The outer `quest-card` can remain, but the internal flex layout should feel like one continuous pill bar (icon → text field → button) rather than a card with loose elements.
4. **Accessibility**: Ensure the `kbd /` shortcut indicator remains visible and the form still submits on Enter.

### Outcome
The "Brain dump a quest. Press Enter. No tags. No deadlines." area looks like a clear, tappable/typable input surface — visually similar to the Daily XP progress pill — with the Capture button sitting at the right end of the same shape.