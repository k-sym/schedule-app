const { Booking, User, Area } = require('../models');
const conflictService = require('./conflictService');
const { Op } = require('sequelize');

/**
 * Booking Service
 * Handles all booking-related business logic
 */

/**
 * Get all bookings with optional filters
 * @param {Object} filters - { startDate, endDate, areaId, entertainerId, status }
 * @returns {Promise<Array>} Array of bookings
 */
async function getAllBookings(filters = {}) {
  const where = {};

  if (filters.startDate && filters.endDate) {
    where.booking_date = {
      [Op.between]: [filters.startDate, filters.endDate]
    };
  } else if (filters.startDate) {
    where.booking_date = { [Op.gte]: filters.startDate };
  } else if (filters.endDate) {
    where.booking_date = { [Op.lte]: filters.endDate };
  }

  if (filters.areaId) {
    where.area_id = filters.areaId;
  }

  if (filters.entertainerId) {
    where.entertainer_id = filters.entertainerId;
  }

  if (filters.status) {
    where.status = filters.status;
  } else {
    // By default, exclude cancelled bookings
    where.status = { [Op.ne]: 'cancelled' };
  }

  const bookings = await Booking.findAll({
    where,
    include: [
      {
        association: 'entertainer',
        attributes: ['id', 'name', 'email']
      },
      {
        association: 'area',
        attributes: ['id', 'name']
      },
      {
        association: 'creator',
        attributes: ['id', 'name']
      }
    ],
    order: [['booking_date', 'ASC']]
  });

  return bookings;
}

/**
 * Get bookings for a specific month
 * @param {number} year
 * @param {number} month - 1-12
 * @returns {Promise<Array>} Array of bookings
 */
async function getBookingsForMonth(year, month) {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0);

  const startDateStr = startDate.toISOString().split('T')[0];
  const endDateStr = endDate.toISOString().split('T')[0];

  return await getAllBookings({
    startDate: startDateStr,
    endDate: endDateStr
  });
}

/**
 * Get bookings for a specific entertainer
 * @param {string} entertainerId
 * @param {Object} filters - { startDate, endDate }
 * @returns {Promise<Array>} Array of bookings
 */
async function getBookingsByEntertainer(entertainerId, filters = {}) {
  return await getAllBookings({
    ...filters,
    entertainerId
  });
}

/**
 * Get a single booking by ID
 * @param {string} bookingId
 * @returns {Promise<Object|null>} Booking or null
 */
async function getBookingById(bookingId) {
  const booking = await Booking.findByPk(bookingId, {
    include: [
      {
        association: 'entertainer',
        attributes: ['id', 'name', 'email']
      },
      {
        association: 'area',
        attributes: ['id', 'name']
      },
      {
        association: 'creator',
        attributes: ['id', 'name']
      }
    ]
  });

  return booking;
}

/**
 * Create a new booking
 * @param {Object} bookingData
 * @param {string} bookingData.entertainerId
 * @param {string} bookingData.areaId
 * @param {string} bookingData.bookingDate
 * @param {string} bookingData.notes
 * @param {string} createdBy - User ID who is creating the booking
 * @returns {Promise<Object>} { success, booking, conflicts, warnings }
 */
async function createBooking(bookingData, createdBy) {
  const { entertainerId, areaId, bookingDate, notes, emoji, display_note } = bookingData;

  // Validate booking for conflicts
  const validation = await conflictService.validateBooking({
    entertainerId,
    areaId,
    bookingDate
  });

  if (!validation.valid) {
    return {
      success: false,
      conflicts: validation.conflicts,
      warnings: validation.warnings,
      booking: null
    };
  }

  try {
    // Create the booking
    const booking = await Booking.create({
      entertainer_id: entertainerId,
      area_id: areaId,
      booking_date: bookingDate,
      notes: notes || null,
      emoji: emoji || null,
      display_note: display_note || null,
      status: 'confirmed',
      created_by: createdBy
    });

    // Fetch the created booking with associations
    const createdBooking = await getBookingById(booking.id);

    return {
      success: true,
      booking: createdBooking,
      conflicts: [],
      warnings: validation.warnings
    };
  } catch (error) {
    // Handle database constraint violations
    if (error.name === 'SequelizeUniqueConstraintError') {
      // Check which constraint was violated
      if (error.fields?.area_id && error.fields?.booking_date) {
        return {
          success: false,
          conflicts: [{
            type: 'area_already_booked',
            message: 'This area is already booked on this date'
          }],
          warnings: validation.warnings,
          booking: null
        };
      }
    }
    // Re-throw other errors
    throw error;
  }
}

/**
 * Update an existing booking
 * @param {string} bookingId
 * @param {Object} updates - { entertainerId, areaId, bookingDate, notes, status }
 * @returns {Promise<Object>} { success, booking, conflicts, warnings }
 */
async function updateBooking(bookingId, updates) {
  const booking = await Booking.findByPk(bookingId);

  if (!booking) {
    throw new Error('Booking not found');
  }

  // If updating entertainer, area, or date, validate for conflicts
  if (updates.entertainerId || updates.areaId || updates.bookingDate) {
    const validation = await conflictService.validateBooking({
      entertainerId: updates.entertainerId || booking.entertainer_id,
      areaId: updates.areaId || booking.area_id,
      bookingDate: updates.bookingDate || booking.booking_date,
      excludeBookingId: bookingId
    });

    if (!validation.valid) {
      return {
        success: false,
        conflicts: validation.conflicts,
        warnings: validation.warnings,
        booking: null
      };
    }
  }

  // Update the booking
  if (updates.entertainerId) booking.entertainer_id = updates.entertainerId;
  if (updates.areaId) booking.area_id = updates.areaId;
  if (updates.bookingDate) booking.booking_date = updates.bookingDate;
  if (updates.notes !== undefined) booking.notes = updates.notes;
  if (updates.emoji !== undefined) booking.emoji = updates.emoji;
  if (updates.display_note !== undefined) booking.display_note = updates.display_note;
  if (updates.status) booking.status = updates.status;

  await booking.save();

  // Fetch updated booking with associations
  const updatedBooking = await getBookingById(booking.id);

  return {
    success: true,
    booking: updatedBooking,
    conflicts: [],
    warnings: []
  };
}

/**
 * Delete (cancel) a booking
 * @param {string} bookingId
 * @returns {Promise<boolean>} Success status
 */
async function deleteBooking(bookingId) {
  const booking = await Booking.findByPk(bookingId);

  if (!booking) {
    throw new Error('Booking not found');
  }

  // Hard delete the booking
  // Note: We use hard delete instead of soft delete because the unique constraint
  // on (area_id, booking_date) prevents creating new bookings in the same slot
  await booking.destroy();

  return true;
}

/**
 * Validate booking without creating it
 * @param {Object} bookingData
 * @returns {Promise<Object>} { valid, conflicts, warnings }
 */
async function validateBookingOnly(bookingData) {
  return await conflictService.validateBooking(bookingData);
}

module.exports = {
  getAllBookings,
  getBookingsForMonth,
  getBookingsByEntertainer,
  getBookingById,
  createBooking,
  updateBooking,
  deleteBooking,
  validateBookingOnly
};
