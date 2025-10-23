const express = require('express');
const router = express.Router();
const availabilityController = require('../controllers/availabilityController');
const { authenticate } = require('../middleware/auth');
const { isAdmin } = require('../middleware/authorize');

// All routes require authentication
router.use(authenticate);

// GET /api/availability/me - Get current user's availability
router.get('/me', availabilityController.getMyAvailability);

// GET /api/availability/month/:year/:month - Get availability for a month (all users can view)
router.get('/month/:year/:month', availabilityController.getAvailabilityForMonth);

// GET /api/availability - Get availability with filters (all users can view)
router.get('/', availabilityController.getAvailability);

// POST /api/availability/bulk - Bulk create availability (entertainers only)
router.post('/bulk', availabilityController.bulkCreateAvailability);

// DELETE /api/availability/bulk - Bulk delete availability (entertainers only)
router.delete('/bulk', availabilityController.bulkDeleteAvailability);

// Admin routes for managing other users' availability
// POST /api/availability/admin/:userId/bulk - Admin bulk create for specific user
router.post('/admin/:userId/bulk', isAdmin, availabilityController.adminBulkCreateAvailability);

// DELETE /api/availability/admin/:userId/bulk - Admin bulk delete for specific user
router.delete('/admin/:userId/bulk', isAdmin, availabilityController.adminBulkDeleteAvailability);

// POST /api/availability - Create single availability entry (entertainers only)
router.post('/', availabilityController.createAvailability);

// PUT /api/availability/:id - Update availability (owner or admin)
router.put('/:id', availabilityController.updateAvailability);

// DELETE /api/availability/:id - Delete availability (owner or admin)
router.delete('/:id', availabilityController.deleteAvailability);

module.exports = router;
