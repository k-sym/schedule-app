const { Availability, User } = require('../models');
const { Op } = require('sequelize');

class AvailabilityService {
  /**
   * Get availability for a specific entertainer
   * @param {string} entertainerId - User ID
   * @param {Date} startDate - Start of date range
   * @param {Date} endDate - End of date range
   */
  async getAvailabilityByEntertainer(entertainerId, startDate, endDate) {
    const where = { entertainer_id: entertainerId };
    
    if (startDate && endDate) {
      where.available_date = {
        [Op.between]: [startDate, endDate]
      };
    } else if (startDate) {
      where.available_date = {
        [Op.gte]: startDate
      };
    }

    return await Availability.findAll({
      where,
      order: [['available_date', 'ASC']]
    });
  }

  /**
   * Get all availability for a specific month
   * @param {number} year
   * @param {number} month - 1-12
   */
  async getAvailabilityForMonth(year, month) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0); // Last day of month

    return await Availability.findAll({
      where: {
        available_date: {
          [Op.between]: [startDate, endDate]
        }
      },
      include: [{
        model: User,
        as: 'entertainer',
        attributes: ['id', 'name', 'email']
      }],
      order: [['available_date', 'ASC']]
    });
  }

  /**
   * Get all availability within a date range (for all entertainers)
   * @param {Date} startDate
   * @param {Date} endDate
   */
  async getAvailabilityByDateRange(startDate, endDate) {
    return await Availability.findAll({
      where: {
        available_date: {
          [Op.between]: [startDate, endDate]
        }
      },
      include: [{
        model: User,
        as: 'entertainer',
        attributes: ['id', 'name', 'email']
      }],
      order: [['available_date', 'ASC'], ['entertainer_id', 'ASC']]
    });
  }

  /**
   * Create a single availability entry
   * @param {string} entertainerId
   * @param {Date} availableDate
   * @param {string} notes - Optional notes
   */
  async createAvailability(entertainerId, availableDate, notes = null) {
    // Check if entertainer exists and has entertainer role
    const user = await User.findByPk(entertainerId);
    if (!user) {
      throw new Error('Entertainer not found');
    }
    if (user.role !== 'entertainer') {
      throw new Error('User is not an entertainer');
    }

    // Check if already exists
    const existing = await Availability.findOne({
      where: {
        entertainer_id: entertainerId,
        available_date: availableDate
      }
    });

    if (existing) {
      throw new Error('Availability already exists for this date');
    }

    return await Availability.create({
      entertainer_id: entertainerId,
      available_date: availableDate,
      notes
    });
  }

  /**
   * Bulk create availability entries
   * @param {string} entertainerId
   * @param {Array<Date>} dates - Array of dates
   * @param {string} notes - Optional notes for all entries
   */
  async bulkCreateAvailability(entertainerId, dates, notes = null) {
    // Check if entertainer exists
    const user = await User.findByPk(entertainerId);
    if (!user) {
      throw new Error('Entertainer not found');
    }
    if (user.role !== 'entertainer') {
      throw new Error('User is not an entertainer');
    }

    // Get existing availability to avoid duplicates
    const existingAvailability = await Availability.findAll({
      where: {
        entertainer_id: entertainerId,
        available_date: {
          [Op.in]: dates
        }
      }
    });

    const existingDates = new Set(
      existingAvailability.map(a => a.available_date.toISOString().split('T')[0])
    );

    // Filter out existing dates
    const newDates = dates.filter(date => {
      const dateStr = new Date(date).toISOString().split('T')[0];
      return !existingDates.has(dateStr);
    });

    if (newDates.length === 0) {
      return { created: 0, skipped: dates.length };
    }

    // Create availability entries
    const availabilityEntries = newDates.map(date => ({
      entertainer_id: entertainerId,
      available_date: date,
      notes
    }));

    const created = await Availability.bulkCreate(availabilityEntries);

    return {
      created: created.length,
      skipped: dates.length - created.length
    };
  }

  /**
   * Delete a single availability entry
   * @param {string} availabilityId
   * @param {string} requestingUserId - User making the request
   */
  async deleteAvailability(availabilityId, requestingUserId) {
    const availability = await Availability.findByPk(availabilityId);
    
    if (!availability) {
      throw new Error('Availability not found');
    }

    // Check if user is the owner or admin
    const requestingUser = await User.findByPk(requestingUserId);
    if (availability.entertainer_id !== requestingUserId && requestingUser.role !== 'admin') {
      throw new Error('Unauthorized to delete this availability');
    }

    await availability.destroy();
    return { message: 'Availability deleted successfully' };
  }

  /**
   * Bulk delete availability entries
   * @param {string} entertainerId
   * @param {Array<Date>} dates - Array of dates to remove
   */
  async bulkDeleteAvailability(entertainerId, dates) {
    const deleted = await Availability.destroy({
      where: {
        entertainer_id: entertainerId,
        available_date: {
          [Op.in]: dates
        }
      }
    });

    return { deleted };
  }

  /**
   * Update availability notes
   * @param {string} availabilityId
   * @param {string} notes
   * @param {string} requestingUserId
   */
  async updateAvailability(availabilityId, notes, requestingUserId) {
    const availability = await Availability.findByPk(availabilityId);
    
    if (!availability) {
      throw new Error('Availability not found');
    }

    // Check if user is the owner or admin
    const requestingUser = await User.findByPk(requestingUserId);
    if (availability.entertainer_id !== requestingUserId && requestingUser.role !== 'admin') {
      throw new Error('Unauthorized to update this availability');
    }

    availability.notes = notes;
    await availability.save();

    return availability;
  }

  /**
   * Check if entertainer is available on specific date
   * @param {string} entertainerId
   * @param {Date} date
   */
  async isAvailable(entertainerId, date) {
    const availability = await Availability.findOne({
      where: {
        entertainer_id: entertainerId,
        available_date: date
      }
    });

    return availability !== null;
  }
}

module.exports = new AvailabilityService();
