## Objective
Add "Deodorant" and "Perfume" to the Morning Routine ("Morning Armor") 1-Click Quest Template subtasks, positioned after "Skincare" in the existing flat subtasks list.

## Change
In `src/components/quest-app.tsx`, update the `QUEST_TEMPLATES` array entry for "Morning Armor":

**Before:**
`subtasks: ["Shower", "Brush Teeth", "Wash Face", "Skincare"]`

**After:**
`subtasks: ["Shower", "Brush Teeth", "Wash Face", "Skincare", "Deodorant", "Perfume"]`

No structural or UI changes needed — the flat subtasks array will render these as new micro-steps in the TaskCard automatically.

## Files touched
- `src/components/quest-app.tsx` (1-line data edit in `QUEST_TEMPLATES`)