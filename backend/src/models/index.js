const User = require('./user.model');
const Doctor = require('./doctor.model');
const AvailabilitySlot = require('./availability_slot.model');
const Appointment = require('./appointment.model');

// User <-> Doctor (one-to-one)
User.hasOne(Doctor, { foreignKey: 'user_id', as: 'doctorProfile' });
Doctor.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// Doctor <-> AvailabilitySlot (one-to-many)
Doctor.hasMany(AvailabilitySlot, { foreignKey: 'doctor_id', as: 'slots' });
AvailabilitySlot.belongsTo(Doctor, { foreignKey: 'doctor_id', as: 'doctor' });

// Doctor <-> Appointment (one-to-many)
Doctor.hasMany(Appointment, { foreignKey: 'doctor_id', as: 'appointments' });
Appointment.belongsTo(Doctor, { foreignKey: 'doctor_id', as: 'doctor' });

// User (Customer) <-> Appointment (one-to-many)
User.hasMany(Appointment, { foreignKey: 'customer_id', as: 'appointments' });
Appointment.belongsTo(User, { foreignKey: 'customer_id', as: 'customer' });

module.exports = { User, Doctor, AvailabilitySlot, Appointment };
