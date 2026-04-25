const StockMovement = require('../models/StockMovement');
const Medicine = require('../models/Medicine');

const recordStockMovement = async (medicineId, type, quantity, reference, referenceId, performedBy, notes = '') => {
  try {
    const medicine = await Medicine.findById(medicineId);
    if (!medicine) throw new Error('Medicine not found');

    const previousStock = medicine.stockQuantity;
    let newStock;

    switch (type) {
      case 'purchase':
        newStock = previousStock + quantity;
        break;
      case 'sale':
      case 'expired':
        newStock = previousStock - quantity;
        break;
      case 'adjustment':
        newStock = quantity;
        break;
      case 'return':
        newStock = previousStock + quantity;
        break;
      default:
        throw new Error('Invalid stock movement type');
    }

    await Medicine.findByIdAndUpdate(medicineId, { stockQuantity: newStock });

    await StockMovement.create({
      medicine: medicineId,
      type,
      quantity: Math.abs(quantity),
      previousStock,
      newStock,
      reference,
      referenceId,
      notes,
      performedBy
    });

    return { previousStock, newStock };
  } catch (error) {
    throw error;
  }
};

module.exports = { recordStockMovement };