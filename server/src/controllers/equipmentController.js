const equipmentService = require('../services/equipmentService');

class EquipmentController {
  async getAll(req, res, next) {
    try {
      const { lab, status, search } = req.query;
      const list = await equipmentService.getEquipmentList({ lab, status, search });
      return res.status(200).json({
        total: list.length,
        equipment: list,
      });
    } catch (err) {
      next(err);
    }
  }

  async getById(req, res, next) {
    try {
      const equipmentId = parseInt(req.params.id, 10);
      const item = await equipmentService.getEquipmentById(equipmentId);
      return res.status(200).json(item);
    } catch (err) {
      next(err);
    }
  }

  // Placeholder for Sprint-2 FR-005 (Technician update) - guarded by role
  async updateStatus(req, res) {
    return res.status(200).json({
      message: 'Technician update endpoint scheduled for Sprint-2.',

  async updateStatus(req, res, next) {
  try {
    const equipmentId = parseInt(req.params.id, 10);
    const { status } = req.body;

    const allowed = [
      'AVAILABLE',
      'MAINTENANCE',
      'OUT_OF_ORDER'
    ];

    if (!status || !allowed.includes(status)) {
      return res.status(400).json({
        error: 'Bad Request',
        message: `Status must be one of: ${allowed.join(', ')}`
      });
    }

    const db = require('../database/db');

    const { rows } = await db.query(
      'UPDATE equipment SET status = $1 WHERE equipment_id = $2 RETURNING *',
      [status, equipmentId]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Equipment not found.'
      });
    }

    return res.status(200).json({
      message: 'Equipment status updated.',
      equipment: rows[0]
    });

  } catch (err) {
    next(err);
  }
}
    });
  }
}

module.exports = new EquipmentController();
