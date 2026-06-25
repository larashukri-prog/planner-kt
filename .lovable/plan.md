## Plan: Rest Day Button Day-Based Visibility

### Objective
Modify the "Rest Day" button on the "Workout" task card so it only renders on designated recovery days (Tue/Thu/Sat) and is completely hidden on gym days (Mon/Wed/Fri/Sun).

### Changes

**File: `src/components/quest-app.tsx`**

Inside the `<TaskCard>` component, update the Rest Day button rendering condition.

- **Current condition (line ~724):**
  ```tsx
  {isWorkout && task.status === "now" && !completing && (
  ```

- **New condition:**
  Add a client-side `Date` evaluation to determine if today is a rest day.
  ```tsx
  const todayDay = new Date().getDay();
  const isRestDayToday = todayDay === 2 || todayDay === 4 || todayDay === 6;
  ```
  Then update the JSX guard to:
  ```tsx
  {isWorkout && task.status === "now" && !completing && isRestDayToday && (
  ```

### Schedule Reference
| Day | `getDay()` | Type | Button Visible |
|-----|------------|------|----------------|
| Sunday | 0 | Gym | No |
| Monday | 1 | Gym | No |
| Tuesday | 2 | Rest | **Yes** |
| Wednesday | 3 | Gym | No |
| Thursday | 4 | Rest | **Yes** |
| Friday | 5 | Gym | No |
| Saturday | 6 | Rest | **Yes** |

### Why This Approach
- Uses standard `new Date().getDay()` evaluated client-side; the UI updates naturally when the day changes without requiring a page refresh (the 60-second spawn tick interval and React re-renders keep it current).
- Leaves the existing `isWorkout`, `status === "now"`, and `!completing` guards untouched.
- No backend or schema changes required.
- PostHog tracking (`rest_day_logged`) remains bound to the click handler and only fires when the button is actually visible and clicked.