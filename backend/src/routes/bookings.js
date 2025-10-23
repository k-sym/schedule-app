const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const { authenticate } = require('../middleware/auth');
const { isAdmin } = require('../middleware/authorize');

// All routes require authentication
router.use(authenticate);

// Get own bookings (entertainers can access)
router.get('/me', bookingController.getMyBookings);

// Get bookings for a specific month
router.get('/month/:year/:month', bookingController.getBookingsForMonth);

// Validate booking (admin only)
router.post('/validate', isAdmin, bookingController.validateBooking);

// Get all bookings with filters
router.get('/', bookingController.getBookings);

// Get single booking by ID
router.get('/:id', bookingController.getBookingById);

// Create booking (admin only)
router.post('/', isAdmin, bookingController.createBooking);

// Update booking (admin only)
router.put('/:id', isAdmin, bookingController.updateBooking);

// Delete (cancel) booking (admin only)
router.delete('/:id', isAdmin, bookingController.deleteBooking);

module.exports = router;
