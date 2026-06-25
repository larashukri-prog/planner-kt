## Separate "Wash Face" and "Skincare" in Morning Routine

In `src/lib/use-daily-spawn.ts`, change the Morning Routine `subtasks` array from:

`["Shower", "Brush Teeth", "Wash Face & Skincare", "Hair"]`

to:

`["Shower", "Brush Teeth", "Wash Face", "Skincare", "Hair"]`

The existing backfill/dedupe logic will automatically append the new "Skincare" subtask to any existing Morning Routine tasks in storage the next time the spawn engine runs.