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
    });
  }
}

module.exports = new EquipmentController();
