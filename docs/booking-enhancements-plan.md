# Implementation Plan: Booking Emojis, Notes, and Area-Specific Rules

**Date**: 2025-10-23
**Status**: Planning

---

## **Overview**

Adding three new features to bookings:
1. **Emoji attribute** - Optional emoji prefix for each booking
2. **Display note** - Optional note that replaces the act name when populated (display-only)
3. **Area rules** - Day-of-week based default emoji rules per area

---

## **Database Changes**

### **1. New Booking Fields** (Migration)
Add to `bookings` table:
- `emoji` (VARCHAR(10), nullable) - Stores single emoji character
- `display_note` (VARCHAR(255), nullable) - Short text to display instead of act name

### **2. New AreaRule Model & Table**
Create `area_rules` table:
- `id` (UUID, primary key)
- `area_id` (UUID, foreign key to areas)
- `day_of_week` (INTEGER, 0=Sunday to 6=Saturday)
- `default_emoji` (VARCHAR(10), nullable)
- Unique constraint on `(area_id, day_of_week)`
- Timestamps

---

## **Backend Implementation**

### **1. Models**
- Update `backend/src/models/booking.js` - Add `emoji` and `display_note` fields
- Create `backend/src/models/areaRule.js` - New model with association to Area

### **2. Migrations**
- `add-booking-emoji-and-note.js` - Add columns to bookings table
- `create-area-rules.js` - Create area_rules table

### **3. Controllers**
- Update `backend/src/controllers/availabilityController.js`:
  - Modify booking creation to accept `emoji` and `display_note`
  - Apply area rule defaults when creating bookings
  - Add endpoints for CRUD on area rules

### **4. Routes**
- Update `backend/src/routes/availability.js`:
  - Modify POST `/bookings` to accept new fields
  - Add GET `/area-rules` - Fetch all rules
  - Add GET `/area-rules/:areaId` - Get rules for specific area
  - Add POST `/area-rules` - Create/update rule (admin only)
  - Add DELETE `/area-rules/:id` - Delete rule (admin only)

### **5. Services**
- Create `backend/src/services/areaRuleService.js`:
  - `getDefaultEmojiForAreaAndDate(areaId, date)` - Returns emoji based on day-of-week
  - `getAllRules()`, `getRulesByArea()`, `createOrUpdateRule()`, `deleteRule()`

---

## **Frontend Implementation**

### **0. Shared Constants**
- Create `frontend/src/constants/emojis.js`:
  - Export `PRESET_EMOJIS` array with objects: `{ emoji: '🎧', label: 'Headphones' }`
  - Used by both BookingEditModal and AreaRulesModal for consistency

### **1. Pinia Store**
- Create `frontend/src/stores/areaRules.js`:
  - State: `rules` array
  - Actions: `fetchRules()`, `createRule()`, `deleteRule()`
  - Getters: `getRulesByArea(areaId)`, `getDefaultEmoji(areaId, date)`

### **2. API Client**
- Create `frontend/src/api/areaRules.js` with axios calls for all endpoints

### **3. ScheduleCalendar.vue Updates**
Update `frontend/src/components/schedule/ScheduleCalendar.vue`:

**Display Logic**:
- In booking cells, show: `[emoji] display_note` OR `[emoji] act_name`
- If `display_note` exists, show that instead of act name
- If `emoji` exists, show it before the text
- Add visual indicator (icon/color) when note is present

**Interaction**:
- Click booking → Open edit modal with:
  - Emoji selector (preset bank of emojis)
  - Display note text input
  - Act name (read-only for reference)
  - Delete booking button
  - Save/Cancel buttons

**New Modal Component**: `frontend/src/components/schedule/BookingEditModal.vue`
- **Emoji selector**: Button grid with preset emojis:
  - 🎧 Headphones
  - 🎸 Guitar
  - 🎤 Microphone
  - ☂️ Umbrella
  - 🍻 Two Beers
  - 🤘 Rock Hand Sign
  - 🎭 Performing Arts (Emo/Theater)
  - 🎛️ Mixer
  - 🤔 Thinking Face
  - Plus a "Clear" option to remove emoji
- Display note textarea
- Preview of how booking will appear in calendar
- Save calls updated booking API
- Delete option integrated into modal

### **4. Admin Area Rules Management**
Integrated into existing Areas admin view via modal.

**Implementation**:
- Add "Rules" button/icon to each area in `frontend/src/views/AdminAreasView.vue`
- Create modal component: `frontend/src/components/admin/AreaRulesModal.vue`
- Modal shows rules for selected area
- Interface:
  - List of existing rules (one per day of week)
  - Day of week selector (dropdown: Monday-Sunday)
  - Emoji selector (same preset bank as BookingEditModal)
  - Add/Update/Delete rule buttons
  - Mobile-friendly touch targets

---

## **Implementation Order**

1. **Backend Database** (30 min)
   - Create migrations for bookings table (add emoji, display_note)
   - Create migration for area_rules table
   - Update Booking model
   - Create AreaRule model with associations
   - Run migrations

2. **Backend API** (45 min)
   - Create AreaRule service
   - Create AreaRule controller
   - Add area-rules routes (admin-protected)
   - Update booking controller to accept emoji/display_note
   - Update booking creation to apply default emoji from rules
   - Test with Postman/curl

3. **Frontend Constants & Stores** (25 min)
   - Create `constants/emojis.js` with PRESET_EMOJIS
   - Create areaRules store
   - Create areaRules API client
   - Update bookings store/API to include emoji/note in create/update

4. **ScheduleCalendar Display Updates** (30 min)
   - Update booking cell template to show emoji + note/name
   - Add visual indicator when display_note is used
   - Change click handler to open modal (remove inline delete button)
   - Load area rules on mount

5. **Booking Edit Modal** (50 min)
   - Create BookingEditModal component
   - Build emoji selector grid (using PRESET_EMOJIS)
   - Add display note textarea
   - Add preview section
   - Add delete button
   - Wire up save/cancel/delete handlers
   - Integrate with ScheduleCalendar

6. **Admin Area Rules Management** (50 min)
   - Check if AdminAreasView exists, or use appropriate admin view
   - Add "Rules" button/icon to each area
   - Create AreaRulesModal component
   - Build emoji selector (using PRESET_EMOJIS)
   - Build day-of-week selector
   - Build rules list/CRUD interface
   - Integrate modal with areas view

7. **Default Rule Application** (15 min)
   - Verify backend applies default emoji on booking creation
   - Test that emoji appears in modal on new bookings
   - Test override functionality

8. **Testing & Polish** (30 min)
   - Test full booking lifecycle (create with emoji, edit, delete)
   - Test area rules CRUD
   - Test default emoji application
   - Test display_note vs act name display
   - Mobile responsiveness testing
   - Edge cases (no rule, clear emoji, long notes, etc.)
   - UI polish and styling refinements

**Total Estimate**: ~4.5 hours

---

## **Key Design Decisions**

1. **`display_note` vs actual booking notes**: The existing `notes` field in bookings is for internal notes. The new `display_note` is specifically for calendar display and takes precedence over act name.

2. **Emoji storage**: Store as VARCHAR to allow multi-character emojis (👨‍🎤, etc.)

3. **Rule priority**: Area rules provide defaults only on creation. Once set, emoji/note on booking can be freely edited.

4. **Day-of-week matching**: Use JavaScript `Date.getDay()` (0-6) to match rule `day_of_week` field.

5. **Backwards compatibility**: All new fields are nullable. Existing bookings display normally without emoji/note.

6. **Preset emoji bank**: Hardcoded list of 8 emojis for consistency across booking edit and area rules. Defined as a constant in shared frontend code for reusability.

7. **Mobile-first design**: All modals and emoji selectors designed with touch-friendly targets and simplified interfaces for mobile admin use.

---

## **Example Use Cases**

### **Scenario 1**: Every Friday in Cellar gets 🎤
- Admin creates area rule: `{area: "Cellar", day: 5 (Friday), emoji: "🎤"}`
- When dragging act to Cellar on any Friday → emoji auto-fills with 🎤
- Admin can click to change emoji for specific booking if needed

### **Scenario 2**: Private event replaces act name
- Booking exists: `{act: "DJ Mike", emoji: "🎸", display_note: null}`
- Shows as: "🎸 DJ Mike"
- Admin clicks, sets `display_note: "Private Event"`
- Now shows as: "🎸 Private Event"
- Act "DJ Mike" is still booked in the system (for their records)

### **Scenario 3**: Override default
- Rule: Pub Fridays = 🎸
- Admin drags act to Pub on Friday → 🎸 auto-populates
- Admin clicks edit, changes to 🎹 → saves
- That specific booking now shows 🎹 instead

---

## **Design Decisions (Resolved)**

1. **Emoji input method**: ✅ **Preset emoji bank** - Fixed set of 8 emojis for easy selection:
   - 🎧 Headphones
   - 🎸 Guitar
   - 🎤 Microphone
   - ☂️ Umbrella
   - 🍻 Two Beers
   - 🤘 Rock Hand Sign
   - 🎭 Performing Arts (Emo/Theater)
   - 🎛️ Mixer
   - Rationale: Mobile-friendly, consistent UI, quick selection

2. **Edit trigger**: ✅ **Click booking opens modal** directly
   - Modal includes emoji selector, display note input, and delete button
   - Removes need for separate edit/delete buttons in calendar cell
   - Cleaner UI, better mobile experience

3. **Area rules UI location**: ✅ **Integrated into Areas admin view via modal**
   - "Rules" button on each area row
   - Opens modal showing rules for that specific area
   - Keeps related functionality together
   - No new menu items needed

4. **Mobile considerations**: ✅ **Yes, mobile support is critical**
   - Preset emoji bank (no need to type/search)
   - Large touch targets for emoji selection
   - Modal-based UI works well on mobile
   - Simplified interface for on-the-go admin tasks

---

## **Progress Tracking**

- [ ] Backend Database (Step 1)
- [ ] Backend API (Step 2)
- [ ] Frontend Stores & API (Step 3)
- [ ] ScheduleCalendar Display (Step 4)
- [ ] Booking Edit Modal (Step 5)
- [ ] Admin Area Rules View (Step 6)
- [ ] Default Rule Application (Step 7)
- [ ] Testing & Polish (Step 8)

---

## **Notes**

- This feature is purely for display/reference purposes in the availability calendar
- Does not change underlying booking logic or conflict detection
- Maintains backward compatibility with existing bookings
