# Label Changes: "Entertainer" to "Act"

## Overview
Changed all user-facing labels from "entertainer/Entertainer" to "act/Act" and "entertainers" to "acts" across the frontend. Backend code (database values, variable names, API parameters) remains unchanged to minimize refactoring effort.

## Frontend Label Changes

### Views Modified

#### 1. ScheduleCalendar.vue
**File:** `frontend/src/components/schedule/ScheduleCalendar.vue`

Changes made:
- Line 89: `<!-- Entertainers Sidebar -->` → `<!-- Acts Sidebar -->`
- Line 408: `'Failed to load entertainers:'` → `'Failed to load acts:'`
- Line 327: Comment `// Show warnings (e.g., entertainer unavailable)` → `// Show warnings (e.g., act unavailable)`
- Line 675: CSS comment `/* Entertainers Sidebar */` → `/* Acts Sidebar */`

**Note:** Variable names like `entertainer`, `entertainerId`, `draggedEntertainer`, `getEntertainerName()`, `loadEntertainers()`, etc. remain unchanged as they are code identifiers, not user-facing labels.

#### 2. AdminUsersView.vue
**File:** `frontend/src/views/AdminUsersView.vue`

Changes made:
- Lines 17, 136: Dropdown option label `<option value="entertainer">Entertainer</option>` → `<option value="entertainer">Act</option>` (2 occurrences)
- Line 47: Table role display changed to show "Act" instead of raw database value:
  ```vue
  <!-- Before -->
  {{ user.role }}
  
  <!-- After -->
  {{ user.role === 'entertainer' ? 'Act' : user.role === 'admin' ? 'Admin' : user.role }}
  ```

**Note:** The `value="entertainer"` attribute remains unchanged because it's the database value.

#### 3. DashboardView.vue
**File:** `frontend/src/views/DashboardView.vue`

Changes made:
- Line 24: Stat card label `<div class="stat-label">Act</div>` → `<div class="stat-label">Acts</div>`

**Note:** Variable name `totalEntertainers` remains unchanged.

#### 4. LoginView.vue
**File:** `frontend/src/views/LoginView.vue`

Changes made:
- Line 42: Demo credentials label `<p>Entertainer: entertainer@scheduleapp.com / admin123</p>` → `<p>Act: entertainer@scheduleapp.com / admin123</p>`

#### 5. AvailabilityView.vue
**File:** `frontend/src/views/AvailabilityView.vue`

Changes made:
- Line 48: Comment `// Check if user is entertainer` → `// Check if user is act`
- Line 50: Error message `'Only entertainers can manage availability'` → `'Only acts can manage availability'`

**Note:** The actual role check `authStore.user?.role !== 'entertainer'` remains unchanged as it checks the database value.

### CSS Classes Unchanged
The following CSS classes were intentionally kept as-is to avoid breaking styles:
- `.role-entertainer` (AppHeader.vue, ProfileView.vue)
- `.badge-entertainer` (AdminUsersView.vue, ProfileView.vue)
- `.entertainer-card`, `.entertainer-name`, `.entertainers-sidebar`, `.entertainers-list` (ScheduleCalendar.vue)

## Admin Availability Management Feature

### New Feature Added
Admins can now manage availability on behalf of acts directly from the Users table.

### Frontend Changes

#### 1. Router
**File:** `frontend/src/router/index.js`

Added new route:
```javascript
{
  path: '/admin/availability/:userId',
  name: 'admin-manage-availability',
  component: () => import('@/views/AdminManageAvailabilityView.vue'),
  meta: { requiresAuth: true, requiresAdmin: true }
}
```

#### 2. AdminUsersView.vue
**File:** `frontend/src/views/AdminUsersView.vue`

Changes:
- Added calendar icon button (📅) in actions column that only shows for acts:
  ```vue
  <button
    v-if="user.role === 'entertainer'"
    class="btn-icon"
    @click="manageAvailability(user)"
    title="Manage Availability"
  >
    📅
  </button>
  ```
- Added `useRouter` import
- Added `manageAvailability(user)` function to navigate to admin availability view

#### 3. AdminManageAvailabilityView.vue (NEW)
**File:** `frontend/src/views/AdminManageAvailabilityView.vue`

New view component that:
- Displays act's name in header
- Shows availability calendar for the selected act
- Includes "Back to Users" button
- Uses `AdminAvailabilityCalendar` component with userId prop
- Loads user data from users store

#### 4. AdminAvailabilityCalendar.vue (NEW)
**File:** `frontend/src/components/availability/AdminAvailabilityCalendar.vue`

New calendar component that:
- Takes `userId` as a prop
- Displays monthly calendar with availability dates
- Allows selecting multiple dates for bulk add/remove
- Calls admin-specific API endpoints
- Similar functionality to `AvailabilityCalendarFixed.vue` but works with any user ID

#### 5. API Client
**File:** `frontend/src/api/availability.js`

Added two new API methods:
```javascript
/**
 * Admin: Bulk create availability for a specific user
 */
export const bulkCreateAvailabilityForUser = async (userId, data) => {
  const response = await apiClient.post(`/availability/admin/${userId}/bulk`, data);
  return response.data;
};

/**
 * Admin: Bulk delete availability for a specific user
 */
export const bulkDeleteAvailabilityForUser = async (userId, dates) => {
  const response = await apiClient.delete(`/availability/admin/${userId}/bulk`, {
    data: { dates }
  });
  return response.data;
};
```

### Backend Changes

#### 1. Routes
**File:** `backend/src/routes/availability.js`

Added two new admin routes (protected with `isAdmin` middleware):
```javascript
// POST /api/availability/admin/:userId/bulk - Admin bulk create for specific user
router.post('/admin/:userId/bulk', isAdmin, availabilityController.adminBulkCreateAvailability);

// DELETE /api/availability/admin/:userId/bulk - Admin bulk delete for specific user
router.delete('/admin/:userId/bulk', isAdmin, availabilityController.adminBulkDeleteAvailability);
```

#### 2. Controller
**File:** `backend/src/controllers/availabilityController.js`

Added two new controller methods:

**`adminBulkCreateAvailability(req, res, next)`**
- Extracts `userId` from route params instead of `req.user.id`
- Validates `dates` array in request body
- Calls existing `availabilityService.bulkCreateAvailability(userId, parsedDates, notes)`
- Returns 201 status on success

**`adminBulkDeleteAvailability(req, res, next)`**
- Extracts `userId` from route params instead of `req.user.id`
- Validates `dates` array in request body
- Calls existing `availabilityService.bulkDeleteAvailability(userId, parsedDates)`
- Returns 200 status on success

**Note:** Both methods reuse existing service layer logic, just passing the `userId` parameter instead of using the authenticated user's ID.

## What Remains Unchanged

### Backend (Intentionally Unchanged)
- Database schema: `role = 'entertainer'` value remains
- All model definitions and associations
- Service layer code and business logic
- Variable names and function parameters
- API request/response data structures

### Frontend Code (Intentionally Unchanged)
- Variable names (e.g., `entertainer`, `entertainerId`, `isEntertainer`)
- Function names (e.g., `getEntertainerName()`, `loadEntertainers()`)
- Store property names
- CSS class names
- Route param names
- API parameter names
- Any `role === 'entertainer'` checks (checking database values)

## Testing Recommendations

1. **Label Display**: Verify all user-facing text shows "Act/Acts" instead of "Entertainer/Entertainers"
2. **User Table**: Confirm role column displays "Act" for users with `role='entertainer'`
3. **Admin Availability Management**:
   - Click calendar icon (📅) next to an act in Users table
   - Verify navigation to act's availability calendar
   - Test bulk add/remove dates
   - Confirm changes persist
   - Test back button navigation
4. **Dropdown Filters**: Ensure role filters still work correctly
5. **CSS Styles**: Verify no styling issues with unchanged class names

## Migration Notes

If future refactoring is needed to change backend code:
1. Database migration would be needed to rename role value or add new column
2. All API endpoints would need updates
3. Service layer code would require changes
4. Frontend variable names could be refactored
5. Consider backward compatibility if external systems integrate with API
