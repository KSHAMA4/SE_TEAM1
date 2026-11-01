const equipmentRepository = require('../repositories/equipmentRepository');

class EquipmentService {
  async getEquipmentList(filters) {
    return await equipmentRepository.findAll(filters);
  }

  async getEquipmentById(equipmentId) {
    const equipment = await equipmentRepository.findById(equipmentId);
    if (!equipment) {
      const error = new Error(`Equipment with ID ${equipmentId} not found.`);
      error.statusCode = 404;
      throw error;
    }
    return equipment;
  }
}

module.exports = new EquipmentService();
