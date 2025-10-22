const areaService = require('../services/areaService');
const logger = require('../utils/logger');

class AreaController {
  /**
   * Get all areas
   * GET /api/areas
   */
  async getAllAreas(req, res, next) {
    try {
      const includeInactive = req.query.includeInactive === 'true';
      const areas = await areaService.getAllAreas({ includeInactive });

      res.json({
        success: true,
        data: areas
      });
    } catch (error) {
      logger.error('Error getting areas:', error);
      next(error);
    }
  }

  /**
   * Get area by ID
   * GET /api/areas/:id
   */
  async getAreaById(req, res, next) {
    try {
      const area = await areaService.getAreaById(req.params.id);

      res.json({
        success: true,
        data: area
      });
    } catch (error) {
      if (error.message === 'Area not found') {
        return res.status(404).json({
          success: false,
          error: error.message
        });
      }

      logger.error('Error getting area by ID:', error);
      next(error);
    }
  }

  /**
   * Create a new area
   * POST /api/areas
   */
  async createArea(req, res, next) {
    try {
      const area = await areaService.createArea(req.body);

      res.status(201).json({
        success: true,
        data: area
      });
    } catch (error) {
      if (error.message === 'Area with this name already exists') {
        return res.status(400).json({
          success: false,
          error: error.message
        });
      }

      logger.error('Error creating area:', error);
      next(error);
    }
  }

  /**
   * Update an area
   * PUT /api/areas/:id
   */
  async updateArea(req, res, next) {
    try {
      const area = await areaService.updateArea(req.params.id, req.body);

      res.json({
        success: true,
        data: area
      });
    } catch (error) {
      if (error.message === 'Area not found') {
        return res.status(404).json({
          success: false,
          error: error.message
        });
      }

      if (error.message === 'Area with this name already exists') {
        return res.status(400).json({
          success: false,
          error: error.message
        });
      }

      logger.error('Error updating area:', error);
      next(error);
    }
  }

  /**
   * Delete an area (soft delete)
   * DELETE /api/areas/:id
   */
  async deleteArea(req, res, next) {
    try {
      await areaService.deleteArea(req.params.id);

      res.json({
        success: true,
        message: 'Area deleted successfully'
      });
    } catch (error) {
      if (error.message === 'Area not found') {
        return res.status(404).json({
          success: false,
          error: error.message
        });
      }

      logger.error('Error deleting area:', error);
      next(error);
    }
  }

  /**
   * Reorder areas
   * PUT /api/areas/reorder
   */
  async reorderAreas(req, res, next) {
    try {
      await areaService.reorderAreas(req.body.areas);

      res.json({
        success: true,
        message: 'Areas reordered successfully'
      });
    } catch (error) {
      logger.error('Error reordering areas:', error);
      next(error);
    }
  }
}

module.exports = new AreaController();
