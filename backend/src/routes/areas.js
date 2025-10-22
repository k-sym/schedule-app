const express = require('express');
const router = express.Router();
const areaController = require('../controllers/areaController');
const { authenticate } = require('../middleware/auth');
const { isAdmin } = require('../middleware/authorize');
const { validate } = require('../middleware/validate');
const { areaSchemas } = require('../utils/validators');

// All routes require authentication
router.use(authenticate);

// GET /api/areas - Get all areas (all authenticated users)
router.get('/', areaController.getAllAreas);

// GET /api/areas/:id - Get area by ID (all authenticated users)
router.get('/:id', validate(areaSchemas.getById), areaController.getAreaById);

// POST /api/areas - Create new area (admin only)
router.post(
  '/',
  isAdmin,
  validate(areaSchemas.create),
  areaController.createArea
);

// PUT /api/areas/reorder - Reorder areas (admin only)
router.put(
  '/reorder',
  isAdmin,
  validate(areaSchemas.reorder),
  areaController.reorderAreas
);

// PUT /api/areas/:id - Update area (admin only)
router.put(
  '/:id',
  isAdmin,
  validate(areaSchemas.update),
  areaController.updateArea
);

// DELETE /api/areas/:id - Delete area (admin only)
router.delete('/:id', isAdmin, validate(areaSchemas.getById), areaController.deleteArea);

module.exports = router;
