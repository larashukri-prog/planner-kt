Make the Daily XP section background blend into the page instead of standing out as a card.

Change:
- In `src/components/quest-app.tsx`, update the `DailyXPBar` container (the `<motion.section>` at line 1238).
- Replace the `quest-card` class with a transparent/background-matched treatment so it visually recedes.
- Keep the progress bar fill, labels, and 100% celebration animation intact.

Technical detail:
- Use `bg-transparent` or `bg-background/0` on the section, remove the border and shadow, and keep `px-4 py-4 md:px-5` for spacing.
- Ensure the progress track remains visible by keeping its `bg-secondary/40` and `border`.
- Verify both light and dark modes look consistent since the section will now inherit the page gradient background.

No other UI or logic changes.