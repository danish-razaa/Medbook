const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db.config');

const AvailabilitySlot = sequelize.define(
  'AvailabilitySlot',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    doctor_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'doctors', key: 'id' },
    },
    slot_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    start_time: {
      type: DataTypes.TIME,
      allowNull: false,
    },
    end_time: {
      type: DataTypes.TIME,
      allowNull: false,
    },
    is_blocked: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    tableName: 'availability_slots',
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ['doctor_id', 'slot_date'] },
    ],
  }
);

module.exports = AvailabilitySlot;
