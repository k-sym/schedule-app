const { AreaRule, Area } = require('../models');

/**
 * Get default emoji for a specific area and date
 * @param {string} areaId - UUID of the area
 * @param {Date|string} date - Date to check
 * @returns {Promise<string|null>} - Default emoji or null if no rule exists
 */
const getDefaultEmojiForAreaAndDate = async (areaId, date) => {
  const bookingDate = new Date(date);
  const dayOfWeek = bookingDate.getDay(); // 0=Sunday, 1=Monday, ..., 6=Saturday

  const rule = await AreaRule.findOne({
    where: {
      area_id: areaId,
      day_of_week: dayOfWeek
    }
  });

  return rule ? rule.default_emoji : null;
};

/**
 * Get all area rules
 * @returns {Promise<Array>} - All area rules with area information
 */
const getAllRules = async () => {
  return await AreaRule.findAll({
    include: [
      {
        model: Area,
        as: 'area',
        attributes: ['id', 'name']
      }
    ],
    order: [['area_id', 'ASC'], ['day_of_week', 'ASC']]
  });
};

/**
 * Get rules for a specific area
 * @param {string} areaId - UUID of the area
 * @returns {Promise<Array>} - Rules for the area
 */
const getRulesByArea = async (areaId) => {
  return await AreaRule.findAll({
    where: { area_id: areaId },
    order: [['day_of_week', 'ASC']]
  });
};

/**
 * Create or update an area rule
 * @param {string} areaId - UUID of the area
 * @param {number} dayOfWeek - Day of week (0-6)
 * @param {string} defaultEmoji - Emoji to set as default
 * @returns {Promise<Object>} - Created or updated rule
 */
const createOrUpdateRule = async (areaId, dayOfWeek, defaultEmoji) => {
  // Validate day of week
  if (dayOfWeek < 0 || dayOfWeek > 6) {
    throw new Error('Day of week must be between 0 (Sunday) and 6 (Saturday)');
  }

  // Check if area exists
  const area = await Area.findByPk(areaId);
  if (!area) {
    throw new Error('Area not found');
  }

  // Find existing rule
  const existingRule = await AreaRule.findOne({
    where: {
      area_id: areaId,
      day_of_week: dayOfWeek
    }
  });

  if (existingRule) {
    // Update existing rule
    existingRule.default_emoji = defaultEmoji;
    await existingRule.save();
    return existingRule;
  } else {
    // Create new rule
    return await AreaRule.create({
      area_id: areaId,
      day_of_week: dayOfWeek,
      default_emoji: defaultEmoji
    });
  }
};

/**
 * Delete an area rule
 * @param {string} ruleId - UUID of the rule to delete
 * @returns {Promise<boolean>} - True if deleted, false if not found
 */
const deleteRule = async (ruleId) => {
  const rule = await AreaRule.findByPk(ruleId);
  if (!rule) {
    return false;
  }

  await rule.destroy();
  return true;
};

module.exports = {
  getDefaultEmojiForAreaAndDate,
  getAllRules,
  getRulesByArea,
  createOrUpdateRule,
  deleteRule
};
