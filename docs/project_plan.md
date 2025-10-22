# Schedule App - Project Plan

## Technology Stack

### Backend
- **Runtime**: Node.js (v18 LTS or later)
- **Framework**: Express.js
- **Database**: PostgreSQL 15+
- **ORM**: Sequelize or Prisma (recommend Prisma for type safety)
- **Authentication**: JWT (Access + Refresh tokens)
- **Validation**: Joi or Zod
- **Real-time**: Socket.io for WebSocket connections
- **API Documentation**: Swagger/OpenAPI

### Frontend
- **Framework**: Vue 3 (Composition API)
- **Build Tool**: Vite
- **State Management**: Pinia
- **Routing**: Vue Router
- **UI Library**: Consider Vuetify or PrimeVue for calendar/drag-drop components
- **Drag & Drop**: Vue Draggable Next (Vue 3 compatible)
- **HTTP Client**: Axios
- **Real-time**: Socket.io Client

### Development Environment
- **Containerization**: Docker & Docker Compose
- **Local Database**: PostgreSQL in Docker
- **Local Development**: Hot reload for both frontend and backend
- **Version Control**: Git

### Production Environment
- **Platform**: AWS
- **Database**: AWS RDS (PostgreSQL)
- **Web Server**: Nginx (reverse proxy + static file serving)
- **Backend Hosting**: EC2 or ECS
- **SSL**: AWS Certificate Manager + HTTPS
- **Environment Management**: AWS Systems Manager Parameter Store or .env files

## Database Schema

### Users Table
```sql
- id (UUID, primary key)
- email (string, unique, required)
- password_hash (string, required)
- role (enum: 'admin', 'entertainer')
- first_name (string, required)
- last_name (string, required)
- phone (string, optional)
- is_active (boolean, default true)
- created_at (timestamp)
- updated_at (timestamp)
```

### Areas Table
```sql
- id (UUID, primary key)
- name (string, required, unique)
- display_order (integer)
- operating_hours_start (time, optional, for future)
- operating_hours_end (time, optional, for future)
- capacity (integer, optional, for future)
- notes (text, optional)
- is_active (boolean, default true)
- created_at (timestamp)
- updated_at (timestamp)
```

### Availability Table
```sql
- id (UUID, primary key)
- entertainer_id (UUID, foreign key -> users.id)
- available_date (date, required)
- notes (text, optional)
- created_at (timestamp)
- updated_at (timestamp)
- UNIQUE constraint on (entertainer_id, available_date)
```

### Bookings Table
```sql
- id (UUID, primary key)
- entertainer_id (UUID, foreign key -> users.id)
- area_id (UUID, foreign key -> areas.id)
- booking_date (date, required)
- recurring_pattern_id (UUID, foreign key -> recurring_patterns.id, nullable)
- is_override (boolean, default false) - for recurring booking modifications
- status (enum: 'confirmed', 'cancelled', 'pending')
- notes (text, optional)
- created_by (UUID, foreign key -> users.id)
- created_at (timestamp)
- updated_at (timestamp)
- UNIQUE constraint on (area_id, booking_date) - one entertainer per area per day
```

### Recurring Patterns Table (for future recurring bookings)
```sql
- id (UUID, primary key)
- entertainer_id (UUID, foreign key -> users.id)
- area_id (UUID, foreign key -> areas.id)
- day_of_week (integer, 0-6, where 0=Sunday)
- start_date (date, required)
- end_date (date, nullable) - null means ongoing
- is_active (boolean, default true)
- created_by (UUID, foreign key -> users.id)
- created_at (timestamp)
- updated_at (timestamp)
```

### Audit Log Table (for tracking changes)
```sql
- id (UUID, primary key)
- user_id (UUID, foreign key -> users.id)
- action (string: 'create', 'update', 'delete')
- entity_type (string: 'booking', 'availability', 'user')
- entity_id (UUID)
- changes (jsonb) - stores before/after values
- created_at (timestamp)
```

## API Endpoints

### Authentication
```
POST   /api/auth/login                 - Login (returns access + refresh tokens)
POST   /api/auth/refresh               - Refresh access token
POST   /api/auth/logout                - Logout (invalidate refresh token)
POST   /api/auth/change-password       - Change own password
```

### Users (Admin only, except GET own profile)
```
GET    /api/users                      - List all users (admin)
GET    /api/users/:id                  - Get user by ID
POST   /api/users                      - Create user (admin)
PUT    /api/users/:id                  - Update user
DELETE /api/users/:id                  - Deactivate user (admin)
GET    /api/users/me                   - Get own profile
PUT    /api/users/me                   - Update own profile
```

### Areas (Admin only for CUD, everyone can read)
```
GET    /api/areas                      - List all active areas
GET    /api/areas/:id                  - Get area by ID
POST   /api/areas                      - Create area (admin)
PUT    /api/areas/:id                  - Update area (admin)
DELETE /api/areas/:id                  - Deactivate area (admin)
```

### Availability (Entertainers can manage own, admins can view all)
```
GET    /api/availability               - Get availability (query by date range, entertainer)
GET    /api/availability/me            - Get own availability (entertainer)
POST   /api/availability               - Mark days as available
DELETE /api/availability/:id           - Remove availability
POST   /api/availability/bulk          - Bulk create/delete availability
GET    /api/availability/month/:year/:month - Get all availability for a month
```

### Bookings (Admin only for CUD, everyone can read)
```
GET    /api/bookings                   - List bookings (query by date range, area, entertainer)
GET    /api/bookings/:id               - Get booking by ID
POST   /api/bookings                   - Create booking (admin)
PUT    /api/bookings/:id               - Update booking (admin)
DELETE /api/bookings/:id               - Cancel booking (admin)
GET    /api/bookings/month/:year/:month - Get schedule for entire month
GET    /api/bookings/me                - Get own bookings (entertainer)
POST   /api/bookings/validate          - Check for conflicts before creating
```

### Recurring Patterns (Future - Admin only)
```
GET    /api/recurring-patterns         - List all patterns
POST   /api/recurring-patterns         - Create recurring pattern
PUT    /api/recurring-patterns/:id     - Update pattern
DELETE /api/recurring-patterns/:id     - Delete pattern
POST   /api/recurring-patterns/:id/override - Override specific instance
```

### Public (No authentication required)
```
GET    /api/public/schedule/:year/:month - Get published schedule for month
GET    /api/public/schedule/current      - Get current month schedule
```

### WebSocket Events
```
EMIT   booking:created                 - New booking created
EMIT   booking:updated                 - Booking modified
EMIT   booking:deleted                 - Booking cancelled
EMIT   availability:updated            - Availability changed
```

## Project Structure

```
schedule-app/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── database.js           # Database connection config
│   │   │   ├── jwt.js                # JWT configuration
│   │   │   └── websocket.js          # Socket.io setup
│   │   ├── models/
│   │   │   ├── User.js
│   │   │   ├── Area.js
│   │   │   ├── Availability.js
│   │   │   ├── Booking.js
│   │   │   ├── RecurringPattern.js
│   │   │   └── AuditLog.js
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── userController.js
│   │   │   ├── areaController.js
│   │   │   ├── availabilityController.js
│   │   │   ├── bookingController.js
│   │   │   └── publicController.js
│   │   ├── middleware/
│   │   │   ├── auth.js               # JWT verification
│   │   │   ├── authorize.js          # Role-based access control
│   │   │   ├── validate.js           # Request validation
│   │   │   └── errorHandler.js       # Global error handling
│   │   ├── routes/
│   │   │   ├── auth.js
│   │   │   ├── users.js
│   │   │   ├── areas.js
│   │   │   ├── availability.js
│   │   │   ├── bookings.js
│   │   │   └── public.js
│   │   ├── services/
│   │   │   ├── authService.js        # Authentication logic
│   │   │   ├── bookingService.js     # Booking business logic
│   │   │   ├── conflictService.js    # Conflict detection
│   │   │   └── notificationService.js # Future notifications
│   │   ├── utils/
│   │   │   ├── logger.js
│   │   │   ├── validators.js
│   │   │   └── dateHelpers.js
│   │   ├── websocket/
│   │   │   ├── handlers.js           # WebSocket event handlers
│   │   │   └── events.js             # Event definitions
│   │   ├── app.js                    # Express app setup
│   │   └── server.js                 # Server entry point
│   ├── tests/
│   │   ├── unit/
│   │   ├── integration/
│   │   └── fixtures/
│   ├── migrations/                   # Database migrations
│   ├── seeders/                      # Initial data (4 areas, demo users)
│   ├── .env.example
│   ├── Dockerfile
│   ├── package.json
│   └── README.md
│
├── frontend/
│   ├── src/
│   │   ├── assets/                   # Images, styles, fonts
│   │   ├── components/
│   │   │   ├── common/
│   │   │   │   ├── AppHeader.vue
│   │   │   │   ├── AppSidebar.vue
│   │   │   │   └── LoadingSpinner.vue
│   │   │   ├── auth/
│   │   │   │   ├── LoginForm.vue
│   │   │   │   └── ChangePasswordForm.vue
│   │   │   ├── availability/
│   │   │   │   ├── AvailabilityCalendar.vue
│   │   │   │   └── DaySelector.vue
│   │   │   ├── schedule/
│   │   │   │   ├── ScheduleGrid.vue
│   │   │   │   ├── DraggableEntertainer.vue
│   │   │   │   ├── ScheduleCell.vue
│   │   │   │   └── MonthNavigation.vue
│   │   │   └── admin/
│   │   │       ├── UserManagement.vue
│   │   │       ├── CreateUserModal.vue
│   │   │       └── AreaManagement.vue
│   │   ├── views/
│   │   │   ├── LoginView.vue
│   │   │   ├── DashboardView.vue
│   │   │   ├── AvailabilityView.vue       # Entertainer availability
│   │   │   ├── ScheduleView.vue            # Admin scheduling
│   │   │   ├── PublicScheduleView.vue      # Public calendar
│   │   │   ├── AdminUsersView.vue
│   │   │   └── ProfileView.vue
│   │   ├── stores/
│   │   │   ├── auth.js               # Pinia store for auth
│   │   │   ├── bookings.js           # Bookings state
│   │   │   ├── availability.js       # Availability state
│   │   │   ├── areas.js              # Areas state
│   │   │   └── users.js              # Users state
│   │   ├── composables/
│   │   │   ├── useAuth.js
│   │   │   ├── useWebSocket.js       # WebSocket connection
│   │   │   ├── useDragDrop.js
│   │   │   └── useConflictDetection.js
│   │   ├── api/
│   │   │   ├── client.js             # Axios instance with interceptors
│   │   │   ├── auth.js
│   │   │   ├── users.js
│   │   │   ├── areas.js
│   │   │   ├── availability.js
│   │   │   ├── bookings.js
│   │   │   └── public.js
│   │   ├── router/
│   │   │   └── index.js              # Vue Router config with guards
│   │   ├── utils/
│   │   │   ├── dateFormatters.js
│   │   │   ├── validators.js
│   │   │   └── constants.js
│   │   ├── App.vue
│   │   └── main.js
│   ├── public/
│   ├── .env.example
│   ├── Dockerfile
│   ├── nginx.conf                    # Nginx config for production
│   ├── package.json
│   ├── vite.config.js
│   └── README.md
│
├── docs/
│   ├── project_ideas.md              # This document
│   ├── project_plan.md               # This document
│   ├── api_documentation.md          # Detailed API specs
│   └── deployment_guide.md           # AWS deployment instructions
│
├── docker-compose.yml                # Local development setup
├── .gitignore
├── LICENSE
└── README.md
```

## Development Phases

### Phase 1: Foundation (Week 1-2)
**Goal**: Set up project infrastructure and basic authentication

#### Backend Tasks
1. Initialize Node.js project with Express
2. Set up PostgreSQL database with Docker Compose
3. Create database schema and migrations
4. Implement User model and authentication
5. Set up JWT token generation and verification
6. Create auth middleware for route protection
7. Implement role-based authorization
8. Basic error handling and logging

#### Frontend Tasks
1. Initialize Vue 3 project with Vite
2. Set up Pinia stores
3. Configure Vue Router with auth guards
4. Create login page and form
5. Implement API client with Axios interceptors
6. Set up token storage and refresh logic
7. Create basic layout (header, sidebar)
8. Implement logout functionality

#### Testing
- Authentication flow (login, token refresh, logout)
- Role-based access control
- Token expiration handling

#### Deliverables
- Working authentication system
- Protected API routes
- Login/logout functionality
- Docker Compose environment running

---

### Phase 2: User & Area Management (Week 2-3)
**Goal**: Admin can manage users and venue areas

#### Backend Tasks
1. Implement Area model and CRUD operations
2. Create area management endpoints
3. Implement User management endpoints
4. Add validation for user creation
5. Seed database with 4 initial areas
6. Create admin-only middleware
7. Implement password change functionality

#### Frontend Tasks
1. Create admin dashboard layout
2. Build user management interface
   - List all users
   - Create new user modal
   - Edit user details
   - Deactivate users
3. Build area management interface
   - List areas
   - Edit area details (name, operating hours)
4. Create form validation
5. Add success/error notifications
6. Implement user profile page
7. Add password change form

#### Testing
- User CRUD operations
- Area CRUD operations
- Admin vs entertainer permissions
- Form validations

#### Deliverables
- Admin can create entertainer accounts
- Entertainers can log in and change password
- 4 areas configured in database
- User management interface complete

---

### Phase 3: Availability System (Week 3-4)
**Goal**: Entertainers can mark their availability

#### Backend Tasks
1. Implement Availability model
2. Create availability endpoints
3. Add bulk availability operations
4. Implement date range queries
5. Add availability validation (no past dates)
6. Create monthly availability summary endpoint

#### Frontend Tasks
1. Create availability view for entertainers
2. Build monthly calendar component
3. Implement day selection (click to toggle)
4. Add visual indicators (tick/check for available days)
5. Create save/cancel functionality
6. Add month navigation
7. Show loading states
8. Display availability summary (e.g., "15 days marked available")

#### Testing
- Marking days as available/unavailable
- Bulk availability operations
- Date range filtering
- Calendar navigation

#### Deliverables
- Entertainers can mark availability
- Monthly calendar view working
- Visual feedback for available days
- Availability data stored correctly

---

### Phase 4: Admin Scheduling Interface (Week 4-6)
**Goal**: Admins can create schedules with drag-and-drop

#### Backend Tasks
1. Implement Booking model
2. Create booking endpoints (CRUD)
3. Implement conflict detection logic
   - Check if entertainer already booked that day
   - Check if area already has booking
4. Add booking validation endpoint
5. Create monthly schedule endpoint
6. Implement booking status management
7. Add audit logging for bookings

#### Frontend Tasks
1. Create admin scheduling view
2. Build monthly calendar grid
   - Rows = days of month
   - Columns = areas (4 columns)
3. Implement drag-and-drop
   - Draggable entertainer list (show availability status)
   - Droppable calendar cells
   - Visual feedback during drag
4. Display existing bookings in calendar
5. Implement conflict warnings
   - Show modal if entertainer unavailable
   - Show error if already booked elsewhere
6. Add booking confirmation dialogs
7. Allow removing/editing bookings
8. Show entertainer availability overlay
9. Add filters (by area, entertainer, date range)

#### Testing
- Drag and drop functionality
- Conflict detection (double-booking, unavailability)
- Booking creation and deletion
- Calendar rendering with multiple bookings
- Edge cases (month boundaries, invalid drags)

#### Deliverables
- Functional drag-and-drop scheduling
- Conflict warnings working
- Monthly schedule view complete
- Bookings stored correctly in database

---

### Phase 5: Real-time Updates (Week 6)
**Goal**: Multiple admins can work simultaneously with live updates

#### Backend Tasks
1. Set up Socket.io server
2. Implement WebSocket authentication
3. Create event emitters for:
   - Booking created
   - Booking updated
   - Booking deleted
   - Availability changed
4. Broadcast events to connected clients
5. Add room-based events (per month view)

#### Frontend Tasks
1. Set up Socket.io client
2. Create WebSocket composable
3. Connect to WebSocket on login
4. Listen for booking events
5. Update calendar in real-time
6. Show notifications for updates
7. Handle connection/disconnection gracefully
8. Add "Someone else is editing" indicators

#### Testing
- Real-time updates with multiple browsers
- Event broadcasting
- Reconnection handling
- Performance with multiple connections

#### Deliverables
- Live updates when bookings change
- Multiple admins can work simultaneously
- Real-time availability updates
- Smooth user experience

---

### Phase 6: Public Schedule View (Week 7)
**Goal**: Public can view schedule without authentication

#### Backend Tasks
1. Create public schedule endpoints (no auth required)
2. Optimize queries for public view
3. Add caching for public schedule (consider Redis future)
4. Implement CORS for public access

#### Frontend Tasks
1. Create public schedule view
2. Build read-only monthly calendar
3. Display entertainer names and areas
4. Add month navigation
5. Create shareable URL structure
6. Make responsive for mobile/tablet
7. Add simple, clean styling
8. Remove admin controls from public view

#### Testing
- Access without authentication
- Calendar rendering
- Month navigation
- Mobile responsiveness
- Performance with large datasets

#### Deliverables
- Public URL accessible to anyone
- Monthly schedule visible
- Clean, simple interface
- Mobile-friendly design

---

### Phase 7: Polish & Testing (Week 8)
**Goal**: Refinement, bug fixes, and comprehensive testing

#### Tasks
1. **Code Quality**
   - Refactor complex components
   - Add JSDoc/TSDoc comments
   - Clean up unused code
   - Improve error messages

2. **UI/UX Improvements**
   - Consistent styling
   - Better loading states
   - Improved error messages
   - Accessibility improvements (ARIA labels, keyboard nav)

3. **Testing**
   - Unit tests for critical functions
   - Integration tests for API endpoints
   - E2E tests for main user flows
   - Load testing for concurrent users

4. **Documentation**
   - API documentation (Swagger)
   - Developer setup guide
   - User manual for admins
   - Deployment documentation

5. **Security Audit**
   - SQL injection prevention
   - XSS protection
   - CSRF tokens
   - Rate limiting
   - Input sanitization

6. **Performance Optimization**
   - Database query optimization
   - Frontend bundle size
   - Lazy loading components
   - Image optimization

#### Deliverables
- Production-ready MVP
- Comprehensive documentation
- Test coverage >70%
- Security review complete

---

### Phase 8: Deployment (Week 8-9)
**Goal**: Deploy to AWS production environment

#### Infrastructure Setup
1. **AWS RDS PostgreSQL**
   - Create RDS instance
   - Configure security groups
   - Set up automated backups
   - Configure parameter groups

2. **EC2/ECS for Backend**
   - Set up EC2 instance or ECS cluster
   - Configure security groups
   - Install Node.js and dependencies
   - Set up process manager (PM2 or Docker)

3. **S3 + CloudFront (Optional)**
   - Host frontend static files in S3
   - Configure CloudFront for CDN
   - Set up SSL certificate

4. **Nginx Configuration**
   - Set up reverse proxy
   - Configure SSL/TLS
   - Set up gzip compression
   - Configure caching headers

5. **Domain & DNS**
   - Configure domain name
   - Set up Route 53 or DNS provider
   - Configure SSL certificate (AWS ACM)

#### Deployment Tasks
1. Create production environment variables
2. Run database migrations on RDS
3. Seed initial data (areas, admin user)
4. Deploy backend to EC2/ECS
5. Build and deploy frontend
6. Configure Nginx
7. Set up SSL certificates
8. Configure environment variables
9. Test production environment
10. Set up monitoring (CloudWatch)

#### Post-Deployment
1. Set up automated backups
2. Configure log aggregation
3. Set up error tracking (Sentry optional)
4. Create deployment pipeline (CI/CD optional)
5. Document deployment process

#### Deliverables
- Application running on AWS
- HTTPS enabled
- Automated backups configured
- Monitoring in place
- Deployment documentation

---

## Future Enhancements (Post-MVP)

### Phase 9: Recurring Bookings (Future)
- Implement recurring pattern model
- Create UI for setting recurring bookings
- Allow overrides for individual instances
- Show recurring indicators in calendar

### Phase 10: Enhanced Features (Future)
- Email notification system
- Entertainer profiles with photos
- Historical reporting and analytics
- iCal export per area
- Search and advanced filtering
- Bulk operations for bookings

### Phase 11: Mobile App (Future)
- React Native or Flutter app
- Push notification support
- Offline availability marking
- Mobile-optimized schedule view
- Calendar integration

---

## Key Technical Decisions

### 1. Database Choice: PostgreSQL
**Reasoning**:
- Excellent for relational data (users, bookings, availability)
- ACID compliance for booking integrity
- Good performance for date-based queries
- Strong AWS RDS support
- JSON support for future flexibility

### 2. JWT Authentication
**Reasoning**:
- Stateless authentication (scalable)
- Works well with API-first architecture
- Mobile-friendly for future app
- Refresh token pattern for security

### 3. Vue 3 Composition API
**Reasoning**:
- Modern, performant framework
- Excellent developer experience
- Good ecosystem for calendars and drag-drop
- Smaller bundle size than React
- Easy to learn for team

### 4. Real-time with Socket.io
**Reasoning**:
- Proven technology for real-time updates
- Works well with Express
- Automatic reconnection handling
- Room-based events for scalability

### 5. Monorepo Structure
**Reasoning**:
- Easier to manage related code
- Shared TypeScript types (future)
- Simplified deployment
- Single git repository

---

## Risk Mitigation

### Risk 1: Concurrent Editing Conflicts
**Mitigation**:
- Real-time updates via WebSocket
- Optimistic locking on bookings
- Show "someone else editing" indicators
- Last-write-wins with notification

### Risk 2: Database Performance
**Mitigation**:
- Proper indexing (date, entertainer_id, area_id)
- Query optimization
- Pagination for large date ranges
- Caching for public view

### Risk 3: Security Vulnerabilities
**Mitigation**:
- Input validation on all endpoints
- Parameterized queries (SQL injection prevention)
- Rate limiting on auth endpoints
- HTTPS in production
- Regular security audits

### Risk 4: Availability Accuracy
**Mitigation**:
- Clear UI for marking availability
- Confirmation dialogs for bulk operations
- Ability to review before saving
- Audit log for tracking changes

### Risk 5: Deployment Complexity
**Mitigation**:
- Comprehensive deployment documentation
- Docker for consistency
- Infrastructure as code (future Terraform)
- Staging environment for testing

---

## Success Metrics

### MVP Launch Criteria
- [ ] 4 venue areas configured
- [ ] Admin can create entertainer accounts
- [ ] Entertainers can mark day-by-day availability
- [ ] Admin drag-and-drop scheduling works
- [ ] Conflict detection prevents double-booking
- [ ] Public schedule URL accessible
- [ ] All users can authenticate
- [ ] Application deployed to AWS
- [ ] SSL/HTTPS enabled
- [ ] Basic error handling in place

### Performance Targets
- Page load time: < 2 seconds
- API response time: < 500ms (95th percentile)
- Real-time update latency: < 1 second
- Support 10+ concurrent admin users
- Calendar rendering: < 1 second for monthly view

### User Experience Goals
- Intuitive drag-and-drop (no training needed)
- Clear visual feedback for all actions
- Mobile-responsive public view
- Graceful error handling
- Fast, snappy interface

---

## Timeline Summary

| Phase | Duration | Key Deliverables |
|-------|----------|------------------|
| Phase 1: Foundation | 1-2 weeks | Authentication working |
| Phase 2: User & Area Management | 1 week | Admin can manage users/areas |
| Phase 3: Availability System | 1 week | Entertainers can mark availability |
| Phase 4: Admin Scheduling | 2 weeks | Drag-and-drop scheduling |
| Phase 5: Real-time Updates | 1 week | Live collaborative editing |
| Phase 6: Public View | 1 week | Public schedule accessible |
| Phase 7: Polish & Testing | 1 week | Production-ready code |
| Phase 8: Deployment | 1-2 weeks | Live on AWS |
| **Total Estimated Time** | **8-10 weeks** | **MVP Complete** |

---

## Next Steps

1. **Review this plan** - Confirm approach and technology choices
2. **Set up development environment** - Install tools, clone repo
3. **Create initial Docker Compose setup** - PostgreSQL, backend, frontend
4. **Begin Phase 1** - Authentication and project foundation
5. **Weekly check-ins** - Review progress and adjust timeline

---

## Questions & Clarifications Needed

Before starting implementation, please confirm:

1. ✅ PostgreSQL as database choice
2. ✅ Vue 3 for frontend
3. ✅ Express.js for backend
4. ✅ 4 fixed areas initially
5. ✅ Day-level availability (no time slots)
6. ✅ Drag-and-drop for admin scheduling
7. ✅ Public URL for schedule viewing
8. ✅ AWS for production hosting

Any changes to these decisions should be discussed before starting development.
