const availabilityService = require('../services/availabilityService');
const logger = require('../utils/logger');

class AvailabilityController {
  /**
   * Get availability with optional filtering
   * GET /api/availability
   * Query params: entertainerId, startDate, endDate
   */
  async getAvailability(req, res, next) {
    try {
      console.log('getMyAvailability', req.user.id);
      const { entertainerId, startDate, endDate } = req.query;

      let availability;

      if (entertainerId) {
        availability = await availabilityService.getAvailabilityByEntertainer(
          entertainerId,
          startDate ? new Date(startDate) : null,
          endDate ? new Date(endDate) : null
        );
      } else if (startDate && endDate) {
        availability = await availabilityService.getAvailabilityByDateRange(
          new Date(startDate),
          new Date(endDate)
        );
      } else {
        return res.status(400).json({
          success: false,
          error: 'Please provide either entertainerId or both startDate and endDate'
        });
      }

      res.json({
        success: true,
        data: availability
      });
    } catch (error) {
      logger.error('Error getting availability:', error);
      next(error);
    }
  }

  /**
   * Get current user's availability (entertainer only)
   * GET /api/availability/me
   * Query params: startDate, endDate
   */
  async getMyAvailability(req, res, next) {
    try {
      const { startDate, endDate } = req.query;

      const availability = await availabilityService.getAvailabilityByEntertainer(
        req.user.id,
        startDate ? new Date(startDate) : null,
        endDate ? new Date(endDate) : null
      );

      res.json({
        success: true,
        data: availability
      });
    } catch (error) {
      logger.error('Error getting my availability:', error);
      next(error);
    }
  }

  /**
   * Get availability for a specific month
   * GET /api/availability/month/:year/:month
   */
  async getAvailabilityForMonth(req, res, next) {
    try {
      const { year, month } = req.params;

      const yearNum = parseInt(year);
      const monthNum = parseInt(month);

      if (isNaN(yearNum) || isNaN(monthNum) || monthNum < 1 || monthNum > 12) {
        return res.status(400).json({
          success: false,
          error: 'Invalid year or month'
        });
      }

      const availability = await availabilityService.getAvailabilityForMonth(
        yearNum,
        monthNum
      );

      res.json({
        success: true,
        data: availability
      });
    } catch (error) {
      logger.error('Error getting monthly availability:', error);
      next(error);
    }
  }

  /**
   * Create a single availability entry
   * POST /api/availability
   * Body: { availableDate, notes }
   */
  async createAvailability(req, res, next) {
    try {
      const { availableDate, notes } = req.body;
      const entertainerId = req.user.id;

      if (!availableDate) {
        return res.status(400).json({
          success: false,
          error: 'availableDate is required'
        });
      }

      const availability = await availabilityService.createAvailability(
        entertainerId,
        new Date(availableDate),
        notes
      );

      res.status(201).json({
        success: true,
        data: availability
      });
    } catch (error) {
      if (error.message === 'Entertainer not found' || 
          error.message === 'User is not an entertainer') {
        return res.status(400).json({
          success: false,
          error: error.message
        });
      }

      if (error.message === 'Availability already exists for this date') {
        return res.status(409).json({
          success: false,
          error: error.message
        });
      }

      if (error.message === 'Cannot set availability for past dates') {
        return res.status(400).json({
          success: false,
          error: error.message
        });
      }

      logger.error('Error creating availability:', error);
      next(error);
    }
  }

  /**
   * Bulk create/update availability
   * POST /api/availability/bulk
   * Body: { dates: [date1, date2, ...], notes }
   */
  async bulkCreateAvailability(req, res, next) {
    try {
      const { dates, notes } = req.body;
      const entertainerId = req.user.id;

      if (!dates || !Array.isArray(dates) || dates.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'dates array is required and must not be empty'
        });
      }

      const parsedDates = dates.map(d => new Date(d));

      const result = await availabilityService.bulkCreateAvailability(
        entertainerId,
        parsedDates,
        notes
      );

      res.status(201).json({
        success: true,
        data: result
      });
    } catch (error) {
      if (error.message === 'Entertainer not found' || 
          error.message === 'User is not an entertainer') {
        return res.status(400).json({
          success: false,
          error: error.message
        });
      }

      logger.error('Error bulk creating availability:', error);
      next(error);
    }
  }

  /**
   * Bulk delete availability
   * DELETE /api/availability/bulk
   * Body: { dates: [date1, date2, ...] }
   */
  async bulkDeleteAvailability(req, res, next) {
    try {
      const { dates } = req.body;
      const entertainerId = req.user.id;

      if (!dates || !Array.isArray(dates) || dates.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'dates array is required and must not be empty'
        });
      }

      const parsedDates = dates.map(d => new Date(d));

      const result = await availabilityService.bulkDeleteAvailability(
        entertainerId,
        parsedDates
      );

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      logger.error('Error bulk deleting availability:', error);
      next(error);
    }
  }

  /**
   * Delete a single availability entry
   * DELETE /api/availability/:id
   */
  async deleteAvailability(req, res, next) {
    try {
      const { id } = req.params;
      const result = await availabilityService.deleteAvailability(id, req.user.id);

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      if (error.message === 'Availability not found') {
        return res.status(404).json({
          success: false,
          error: error.message
        });
      }

      if (error.message === 'Unauthorized to delete this availability') {
        return res.status(403).json({
          success: false,
          error: error.message
        });
      }

      logger.error('Error deleting availability:', error);
      next(error);
    }
  }

  /**
   * Update availability notes
   * PUT /api/availability/:id
   * Body: { notes }
   */
  async updateAvailability(req, res, next) {
    try {
      const { id } = req.params;
      const { notes } = req.body;

      const availability = await availabilityService.updateAvailability(
        id,
        notes,
        req.user.id
      );

      res.json({
        success: true,
        data: availability
      });
    } catch (error) {
      if (error.message === 'Availability not found') {
        return res.status(404).json({
          success: false,
          error: error.message
        });
      }

      if (error.message === 'Unauthorized to update this availability') {
        return res.status(403).json({
          success: false,
          error: error.message
        });
      }

      logger.error('Error updating availability:', error);
      next(error);
    }
  }
}

module.exports = new AvailabilityController();
