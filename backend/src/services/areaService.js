const { Area } = require('../models');

class AreaService {
  /**
   * Get all areas
   * @param {Object} options - Query options
   * @param {Boolean} options.includeInactive - Include inactive areas
   * @returns {Promise<Array>}
   */
  async getAllAreas(options = {}) {
    const { includeInactive = false } = options;

    const where = {};
    if (!includeInactive) {
      where.is_active = true;
    }

    const areas = await Area.findAll({
      where,
      order: [['display_order', 'ASC'], ['name', 'ASC']]
    });

    return areas;
  }

  /**
   * Get area by ID
   * @param {String} areaId - Area UUID
   * @returns {Promise<Object>}
   */
  async getAreaById(areaId) {
    const area = await Area.findByPk(areaId);

    if (!area) {
      throw new Error('Area not found');
    }

    return area;
  }

  /**
   * Create a new area
   * @param {Object} areaData - Area data
   * @returns {Promise<Object>}
   */
  async createArea(areaData) {
    // Check if area with same name already exists
    const existingArea = await Area.findOne({
      where: { name: areaData.name }
    });

    if (existingArea) {
      throw new Error('Area with this name already exists');
    }

    const area = await Area.create(areaData);
    return area;
  }

  /**
   * Update an area
   * @param {String} areaId - Area UUID
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object>}
   */
  async updateArea(areaId, updateData) {
    const area = await this.getAreaById(areaId);

    // Check if name is being changed and already exists
    if (updateData.name && updateData.name !== area.name) {
      const existingArea = await Area.findOne({
        where: { name: updateData.name }
      });

      if (existingArea) {
        throw new Error('Area with this name already exists');
      }
    }

    await area.update(updateData);
    return area;
  }

  /**
   * Delete an area (soft delete by setting is_active to false)
   * @param {String} areaId - Area UUID
   * @returns {Promise<void>}
   */
  async deleteArea(areaId) {
    const area = await this.getAreaById(areaId);

    // Soft delete by setting is_active to false
    await area.update({ is_active: false });
  }

  /**
   * Reorder areas
   * @param {Array} areaOrders - Array of {id, display_order} objects
   * @returns {Promise<void>}
   */
  async reorderAreas(areaOrders) {
    // Update display_order for each area
    const updatePromises = areaOrders.map(({ id, display_order }) =>
      Area.update(
        { display_order },
        { where: { id } }
      )
    );

    await Promise.all(updatePromises);
  }
}

module.exports = new AreaService();
