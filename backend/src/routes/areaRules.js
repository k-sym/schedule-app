const express = require('express');
const router = express.Router();
const areaRuleController = require('../controllers/areaRuleController');
const { authenticate } = require('../middleware/auth');
const { isAdmin } = require('../middleware/authorize');

// All routes require authentication and admin role
router.use(authenticate);
router.use(isAdmin);

/**
 * @route   GET /api/area-rules
 * @desc    Get all area rules
 * @access  Private (Admin only)
 */
router.get('/', areaRuleController.getAllRules);

/**
 * @route   GET /api/area-rules/area/:areaId
 * @desc    Get rules for specific area
 * @access  Private (Admin only)
 */
router.get('/area/:areaId', areaRuleController.getRulesByArea);

/**
 * @route   POST /api/area-rules
 * @desc    Create or update an area rule
 * @access  Private (Admin only)
 */
router.post('/', areaRuleController.createOrUpdateRule);

/**
 * @route   DELETE /api/area-rules/:id
 * @desc    Delete an area rule
 * @access  Private (Admin only)
 */
router.delete('/:id', areaRuleController.deleteRule);

module.exports = router;
