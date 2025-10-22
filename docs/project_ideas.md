# Project Ideas and Requirements

## Overview
A scheduling application for a venue with multiple areas (rooms) to manage entertainment availability and bookings. The system enables admins to create schedules by dragging entertainers onto a calendar, while entertainers can submit their availability.

## Core Concept
- **Venues/Areas**: Multiple rooms within a venue (e.g., Main Room, Terrace, Pub, Lounge)
- **Entertainment**: Predominantly DJs and Bands
- **Workflow**:
  1. Entertainers mark days they're available
  2. Admins drag entertainers onto calendar slots for specific areas
  3. Schedule is published via public URL

## User Roles & Authentication

### Admin
- Create entertainer accounts
- Manage venue areas
- Create schedules by drag-and-drop
- View all availability
- Publish schedules
- Full system access

### Entertainer
- Set their own password (after admin creates account)
- Submit availability (day-by-day)
- View published schedules
- View their own bookings
- Limited to availability and viewing features

## Availability Management

### Entertainer Availability Submission
- Calendar interface with clickable days
- Visual indicator (tick/check) for available days
- Full-day availability only (no time slots)
- No venue/area preferences required
- Simple on/off per day

### Features
- Easy toggle of availability
- Monthly view for submission
- Clear visual feedback
- Ability to mark multiple days quickly

## Scheduling Features

### Admin Drag-and-Drop Interface
- Calendar view split by areas (rooms)
- Each day divided into sections per area
- Drag entertainers from availability list onto calendar slots
- Visual representation of who's available vs. already booked

### Conflict Management
- **Double-booking prevention**: System prevents booking same entertainer in multiple areas on same day
- **Conflict warnings**: Alert if admin tries to book entertainer on unavailable day
- **Override capability**: Admin can override warnings if needed

### Recurring Bookings
- Ability to set recurring patterns (e.g., "Every Tuesday - Pub - Karaoke DJ")
- Patterns can be:
  - Weekly recurring
  - Specific day of week + area + entertainer
- **Override flexibility**: Individual instances can be changed for:
  - Holiday cover
  - Illness
  - Special events
  - One-off replacements

## Calendar & Display Features

### Admin View
- Monthly calendar view
- Grid layout with days as rows, areas as columns (or similar)
- Drag-and-drop functionality
- Real-time updates when multiple admins working
- Filter/search entertainers
- View availability overlay

### Public View
- Read-only monthly calendar
- Display entertainer name against area/day
- No authentication required
- Shareable public URL
- Responsive design for various devices

### MVP Scope (Phase 1)
- Basic entertainer name display
- Simple, clean layout
- Area labels clearly visible
- Date navigation (previous/next month)

### Future Enhancements (Post-MVP)
- Entertainer profiles with photos
- Genre/type indicators
- Social media links
- Equipment/technical requirements
- Set times (if time slots added later)
- Promotional materials

## Data & History

### Historical Data
- Keep all historical schedule data
- No database flushing on month rollover
- Allow viewing past schedules
- Useful for:
  - Reporting
  - Pattern analysis
  - Entertainer history
  - Venue analytics (future)

### No Import Required
- Fresh start from implementation date
- Build history going forward only

## Venue/Area Configuration

### Current Setup
- **Fixed number of areas**: 4 rooms
- Areas managed by admins
- Each area has:
  - Name (e.g., "Pub", "Terrace", "Main Stage", "Lounge")
  - Unique identifier

### Future Considerations
- **Operating hours per area**: Store but don't enforce (e.g., Pub = 8pm-12am, Terrace = 7pm-11pm)
- **Area characteristics**:
  - Capacity
  - Equipment available
  - Music type/genre suitability
  - Technical specifications
- **Shared calendar integration**: Potential iCal export per area
- **Dynamic area management**: Add/remove areas as venue changes

## Notifications (Future Phase)

### Email Notifications
- Booking confirmations to entertainers
- Schedule change alerts
- Availability reminders
- Cancellation notices

### Push Notifications (Mobile App Phase)
- Real-time booking notifications
- Schedule updates
- Availability request reminders
- Last-minute changes

### Admin Notifications
- New availability submissions
- Conflict warnings
- Schedule publication confirmations

## Technical Requirements

### Architecture
- **Backend**: Node.js API-driven architecture
- **Frontend**: Vue.js web application
- **Database**: PostgreSQL
- **API**: RESTful JSON (mobile-ready)
- **Authentication**: JWT tokens

### Development Environment
- **Local**: Docker containers
- **Database**: PostgreSQL in Docker
- **Hot reload**: Development mode for rapid iteration

### Production Environment
- **Platform**: AWS
- **Database**: Separate managed PostgreSQL instance (RDS)
- **Web Server**: Nginx
- **SSL**: HTTPS required for authentication
- **Scalability**: Containerized deployment

### Real-Time Features
- WebSocket or Server-Sent Events for admin interface
- Live updates when multiple admins editing
- Instant availability updates
- Concurrent editing support

## Mobile App (Future Phase 2)

### Primary Use Cases
1. Entertainers submit availability on-the-go
2. View their bookings
3. Receive push notifications
4. Quick access to schedule

### Features
- Native mobile experience (React Native or PWA)
- Push notification support
- Offline availability marking (sync when online)
- Calendar integration
- Quick availability toggle

### Not Initially Required
- Admin features on mobile (web interface sufficient)
- Public view on mobile (responsive web sufficient)

## Success Criteria

### MVP Must-Haves
1. Admins can create entertainer accounts
2. Entertainers can mark day-by-day availability
3. Admin drag-and-drop scheduling interface
4. Conflict detection and double-booking prevention
5. Public schedule view via shareable URL
6. Monthly calendar view
7. Basic authentication and authorization

### Nice-to-Haves (Post-MVP)
1. Recurring booking patterns
2. Real-time collaborative editing
3. Historical schedule viewing
4. Email notifications
5. Enhanced entertainer profiles
6. Mobile app
7. Push notifications
8. iCal integration
9. Reporting and analytics

## Use Cases

### Use Case 1: Entertainer Marks Availability
1. Entertainer logs in
2. Navigates to availability calendar
3. Clicks on available days
4. Sees visual confirmation (tick/check)
5. Saves changes
6. Availability visible to admins immediately

### Use Case 2: Admin Creates Schedule
1. Admin logs in to scheduling interface
2. Views monthly calendar split by 4 areas
3. Sees list of available entertainers
4. Drags entertainer to specific day/area
5. System checks for conflicts
6. If available, booking is created
7. Schedule updates in real-time

### Use Case 3: Public Views Schedule
1. User visits public URL (no login)
2. Views current month schedule
3. Sees which entertainer is in which area each day
4. Navigates to other months
5. Can share URL with others

### Use Case 4: Admin Sets Recurring Booking
1. Admin creates initial booking
2. Selects "make recurring" option
3. Chooses pattern (e.g., every Tuesday)
4. System creates series of bookings
5. Individual instances can be modified later
6. Entertainer sees all recurring dates

### Use Case 5: Handling Conflicts
1. Admin attempts to book entertainer
2. System detects entertainer already booked in different area
3. Warning displayed: "DJ Name already booked in Pub on this day"
4. Admin can:
   - Cancel action
   - Move existing booking
   - Override (if special circumstances)

## Questions for Future Consideration

1. Should entertainers be able to request specific dates/venues?
2. Do we need approval workflow for schedules before publishing?
3. Should there be payment/invoicing integration?
4. Do we need equipment/rider tracking per booking?
5. Should there be a rating/feedback system?
6. Do we want entertainer availability patterns (e.g., "always available Fridays")?
7. Should there be a waitlist/backup entertainer system?
8. Do we need integration with external booking systems?
