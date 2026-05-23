const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db.config');
const { DOCTOR_STATUS } = require('../utils/constants');

const Doctor = sequelize.define(
  'Doctor',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'users', key: 'id' },
    },
    specialty: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    bio: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    license_number: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    license_document: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    approval_status: {
      type: DataTypes.ENUM(...Object.values(DOCTOR_STATUS)),
      allowNull: false,
      defaultValue: DOCTOR_STATUS.PENDING,
    },
    rejection_reason: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    tableName: 'doctors',
    timestamps: true,
    underscored: true,
  }
);

module.exports = Doctor;
