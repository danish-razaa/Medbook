const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db.config');
const { APPOINTMENT_STATUS } = require('../utils/constants');

const Appointment = sequelize.define(
  'Appointment',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    customer_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'users', key: 'id' },
    },
    doctor_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'doctors', key: 'id' },
    },
    appointment_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    time_slot: {
      type: DataTypes.STRING(10),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM(...Object.values(APPOINTMENT_STATUS)),
      defaultValue: APPOINTMENT_STATUS.BOOKED,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    version: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  },
  {
    tableName: 'appointments',
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ['doctor_id'] },
      { fields: ['appointment_date'] },
      { fields: ['customer_id'] },
      {
        unique: true,
        fields: ['doctor_id', 'appointment_date', 'time_slot'],
        where: { status: ['BOOKED', 'CONFIRMED'] },
        name: 'unique_active_appointment',
      },
    ],
  }
);

module.exports = Appointment;
