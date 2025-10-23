const bookingService = require('../services/bookingService');

/**
 * Get all bookings with optional filters
 * Query params: startDate, endDate, areaId, entertainerId, status
 */
async function getBookings(req, res) {
  try {
    const filters = {
      startDate: req.query.startDate,
      endDate: req.query.endDate,
      areaId: req.query.areaId,
      entertainerId: req.query.entertainerId,
      status: req.query.status
    };

    const bookings = await bookingService.getAllBookings(filters);

    res.json({
      success: true,
      data: bookings
    });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch bookings'
    });
  }
}

/**
 * Get bookings for a specific month
 * Params: year, month (1-12)
 */
async function getBookingsForMonth(req, res) {
  try {
    const year = parseInt(req.params.year);
    const month = parseInt(req.params.month);

    if (!year || !month || month < 1 || month > 12) {
      return res.status(400).json({
        success: false,
        error: 'Invalid year or month'
      });
    }

    const bookings = await bookingService.getBookingsForMonth(year, month);

    res.json({
      success: true,
      data: bookings
    });
  } catch (error) {
    console.error('Error fetching bookings for month:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch bookings for month'
    });
  }
}

/**
 * Get own bookings (for entertainers)
 */
async function getMyBookings(req, res) {
  try {
    const entertainerId = req.user.id;

    const filters = {
      startDate: req.query.startDate,
      endDate: req.query.endDate
    };

    const bookings = await bookingService.getBookingsByEntertainer(entertainerId, filters);

    res.json({
      success: true,
      data: bookings
    });
  } catch (error) {
    console.error('Error fetching my bookings:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch your bookings'
    });
  }
}

/**
 * Get a single booking by ID
 */
async function getBookingById(req, res) {
  try {
    const booking = await bookingService.getBookingById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        error: 'Booking not found'
      });
    }

    res.json({
      success: true,
      data: booking
    });
  } catch (error) {
    console.error('Error fetching booking:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch booking'
    });
  }
}

/**
 * Create a new booking (admin only)
 */
async function createBooking(req, res) {
  try {
    const { entertainerId, areaId, bookingDate, notes, emoji, display_note } = req.body;

    if (!entertainerId || !areaId || !bookingDate) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: entertainerId, areaId, bookingDate'
      });
    }

    const result = await bookingService.createBooking(
      { entertainerId, areaId, bookingDate, notes, emoji, display_note },
      req.user.id
    );

    if (!result.success) {
      return res.status(409).json({
        success: false,
        error: 'Booking conflicts detected',
        conflicts: result.conflicts,
        warnings: result.warnings
      });
    }

    res.status(201).json({
      success: true,
      data: result.booking,
      warnings: result.warnings
    });
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to create booking'
    });
  }
}

/**
 * Update an existing booking (admin only)
 */
async function updateBooking(req, res) {
  try {
    const { entertainerId, areaId, bookingDate, notes, status, emoji, display_note } = req.body;

    const result = await bookingService.updateBooking(req.params.id, {
      entertainerId,
      areaId,
      bookingDate,
      notes,
      status,
      emoji,
      display_note
    });

    if (!result.success) {
      return res.status(409).json({
        success: false,
        error: 'Booking conflicts detected',
        conflicts: result.conflicts,
        warnings: result.warnings
      });
    }

    res.json({
      success: true,
      data: result.booking,
      warnings: result.warnings
    });
  } catch (error) {
    console.error('Error updating booking:', error);
    if (error.message === 'Booking not found') {
      return res.status(404).json({
        success: false,
        error: error.message
      });
    }
    res.status(500).json({
      success: false,
      error: 'Failed to update booking'
    });
  }
}

/**
 * Delete (cancel) a booking (admin only)
 */
async function deleteBooking(req, res) {
  try {
    await bookingService.deleteBooking(req.params.id);

    res.json({
      success: true,
      message: 'Booking cancelled successfully'
    });
  } catch (error) {
    console.error('Error deleting booking:', error);
    if (error.message === 'Booking not found') {
      return res.status(404).json({
        success: false,
        error: error.message
      });
    }
    res.status(500).json({
      success: false,
      error: 'Failed to cancel booking'
    });
  }
}

/**
 * Validate a booking without creating it (admin only)
 */
async function validateBooking(req, res) {
  try {
    const { entertainerId, areaId, bookingDate, excludeBookingId } = req.body;

    if (!entertainerId || !areaId || !bookingDate) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: entertainerId, areaId, bookingDate'
      });
    }

    const result = await bookingService.validateBookingOnly({
      entertainerId,
      areaId,
      bookingDate,
      excludeBookingId
    });

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error validating booking:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to validate booking'
    });
  }
}

module.exports = {
  getBookings,
  getBookingsForMonth,
  getMyBookings,
  getBookingById,
  createBooking,
  updateBooking,
  deleteBooking,
  validateBooking
};
