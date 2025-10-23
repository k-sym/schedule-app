const areaRuleService = require('../services/areaRuleService');

/**
 * Get all area rules
 */
const getAllRules = async (req, res) => {
  try {
    const rules = await areaRuleService.getAllRules();
    res.json(rules);
  } catch (error) {
    console.error('Error fetching area rules:', error);
    res.status(500).json({ error: 'Failed to fetch area rules' });
  }
};

/**
 * Get rules for a specific area
 */
const getRulesByArea = async (req, res) => {
  try {
    const { areaId } = req.params;
    const rules = await areaRuleService.getRulesByArea(areaId);
    res.json(rules);
  } catch (error) {
    console.error('Error fetching area rules:', error);
    res.status(500).json({ error: 'Failed to fetch area rules' });
  }
};

/**
 * Create or update an area rule
 */
const createOrUpdateRule = async (req, res) => {
  try {
    const { area_id, day_of_week, default_emoji } = req.body;

    // Validation
    if (!area_id || day_of_week === undefined || !default_emoji) {
      return res.status(400).json({
        error: 'Missing required fields: area_id, day_of_week, default_emoji'
      });
    }

    if (day_of_week < 0 || day_of_week > 6) {
      return res.status(400).json({
        error: 'day_of_week must be between 0 (Sunday) and 6 (Saturday)'
      });
    }

    const rule = await areaRuleService.createOrUpdateRule(
      area_id,
      day_of_week,
      default_emoji
    );

    res.status(201).json(rule);
  } catch (error) {
    console.error('Error creating/updating area rule:', error);
    if (error.message === 'Area not found') {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: 'Failed to create/update area rule' });
  }
};

/**
 * Delete an area rule
 */
const deleteRule = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await areaRuleService.deleteRule(id);

    if (!deleted) {
      return res.status(404).json({ error: 'Area rule not found' });
    }

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting area rule:', error);
    res.status(500).json({ error: 'Failed to delete area rule' });
  }
};

module.exports = {
  getAllRules,
  getRulesByArea,
  createOrUpdateRule,
  deleteRule
};
