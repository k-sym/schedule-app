const { Booking, Availability } = require('../models');
const { Op } = require('sequelize');

/**
 * Conflict Detection Service
 * Checks for booking conflicts:
 * 1. Entertainer already booked on same day (different area)
 * 2. Area already has a booking on that day
 * 3. Entertainer marked unavailable for that day (warning, not error)
 */

/**
 * Check if entertainer is already booked on a specific date
 * @param {string} entertainerId - UUID of entertainer
 * @param {string} bookingDate - Date in YYYY-MM-DD format
 * @param {string|null} excludeBookingId - Optional booking ID to exclude (for updates)
 * @returns {Promise<Object|null>} Existing booking or null
 */
async function checkEntertainerConflict(entertainerId, bookingDate, excludeBookingId = null) {
  const where = {
    entertainer_id: entertainerId,
    booking_date: bookingDate,
    status: { [Op.ne]: 'cancelled' }
  };

  if (excludeBookingId) {
    where.id = { [Op.ne]: excludeBookingId };
  }

  const existingBooking = await Booking.findOne({
    where,
    include: [
      { association: 'area', attributes: ['id', 'name'] }
    ]
  });

  return existingBooking;
}

/**
 * Check if area already has a booking on a specific date
 * @param {string} areaId - UUID of area
 * @param {string} bookingDate - Date in YYYY-MM-DD format
 * @param {string|null} excludeBookingId - Optional booking ID to exclude (for updates)
 * @returns {Promise<Object|null>} Existing booking or null
 */
async function checkAreaConflict(areaId, bookingDate, excludeBookingId = null) {
  const where = {
    area_id: areaId,
    booking_date: bookingDate,
    status: { [Op.ne]: 'cancelled' }
  };

  if (excludeBookingId) {
    where.id = { [Op.ne]: excludeBookingId };
  }

  const existingBooking = await Booking.findOne({
    where,
    include: [
      { association: 'entertainer', attributes: ['id', 'name'] }
    ]
  });

  return existingBooking;
}

/**
 * Check if entertainer is available on a specific date
 * @param {string} entertainerId - UUID of entertainer
 * @param {string} bookingDate - Date in YYYY-MM-DD format
 * @returns {Promise<boolean>} True if available, false if not
 */
async function checkEntertainerAvailability(entertainerId, bookingDate) {
  const availability = await Availability.findOne({
    where: {
      entertainer_id: entertainerId,
      available_date: bookingDate
    }
  });

  return !!availability;
}

/**
 * Validate booking for conflicts (comprehensive check)
 * @param {Object} bookingData
 * @param {string} bookingData.entertainerId
 * @param {string} bookingData.areaId
 * @param {string} bookingData.bookingDate
 * @param {string|null} bookingData.excludeBookingId - For updates
 * @returns {Promise<Object>} { valid, conflicts: [], warnings: [] }
 */
async function validateBooking(bookingData) {
  const { entertainerId, areaId, bookingDate, excludeBookingId = null } = bookingData;

  const conflicts = [];
  const warnings = [];

  // Check if entertainer is already booked elsewhere
  const entertainerConflict = await checkEntertainerConflict(
    entertainerId,
    bookingDate,
    excludeBookingId
  );

  if (entertainerConflict) {
    conflicts.push({
      type: 'entertainer_double_booking',
      message: `Entertainer is already booked in ${entertainerConflict.area.name} on this date`,
      conflictingBooking: {
        id: entertainerConflict.id,
        areaName: entertainerConflict.area.name,
        date: entertainerConflict.booking_date
      }
    });
  }

  // Check if area already has a booking
  const areaConflict = await checkAreaConflict(areaId, bookingDate, excludeBookingId);

  if (areaConflict) {
    conflicts.push({
      type: 'area_already_booked',
      message: `This area is already booked by ${areaConflict.entertainer.name} on this date`,
      conflictingBooking: {
        id: areaConflict.id,
        entertainerName: areaConflict.entertainer.name,
        date: areaConflict.booking_date
      }
    });
  }

  // Check availability (warning only, not blocking)
  const isAvailable = await checkEntertainerAvailability(entertainerId, bookingDate);

  if (!isAvailable) {
    warnings.push({
      type: 'entertainer_unavailable',
      message: 'Entertainer has not marked this date as available',
      canOverride: true
    });
  }

  return {
    valid: conflicts.length === 0,
    conflicts,
    warnings
  };
}

/**
 * Get all bookings for a specific date range
 * @param {string} startDate - YYYY-MM-DD
 * @param {string} endDate - YYYY-MM-DD
 * @returns {Promise<Array>} Array of bookings
 */
async function getBookingsInRange(startDate, endDate) {
  return await Booking.findAll({
    where: {
      booking_date: {
        [Op.between]: [startDate, endDate]
      },
      status: { [Op.ne]: 'cancelled' }
    },
    include: [
      { association: 'entertainer', attributes: ['id', 'name'] },
      { association: 'area', attributes: ['id', 'name'] }
    ],
    order: [['booking_date', 'ASC']]
  });
}

module.exports = {
  checkEntertainerConflict,
  checkAreaConflict,
  checkEntertainerAvailability,
  validateBooking,
  getBookingsInRange
};
