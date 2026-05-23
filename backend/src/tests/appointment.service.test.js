// Mock db.config BEFORE any other imports so models don't call sequelize.define
jest.mock('../../src/config/db.config', () => ({
  sequelize: {
    transaction: jest.fn((cb) => cb({ lock: true })),
    define: jest.fn(),
  },
}), { virtual: false });

jest.mock('../../src/models/user.model', () => ({
  findByPk: jest.fn(), findOne: jest.fn(), create: jest.fn(), update: jest.fn(), findAll: jest.fn(),
  hasOne: jest.fn(), hasMany: jest.fn(), belongsTo: jest.fn(),
}));
jest.mock('../../src/models/doctor.model', () => ({
  findByPk: jest.fn(), findOne: jest.fn(), create: jest.fn(), update: jest.fn(), findAll: jest.fn(),
  hasMany: jest.fn(), belongsTo: jest.fn(),
}));
jest.mock('../../src/models/appointment.model', () => ({
  findByPk: jest.fn(), findOne: jest.fn(), create: jest.fn(), update: jest.fn(), findAll: jest.fn(),
  hasMany: jest.fn(), belongsTo: jest.fn(),
}));
jest.mock('../../src/models/availability_slot.model', () => ({
  findByPk: jest.fn(), findOne: jest.fn(), create: jest.fn(), update: jest.fn(), findAll: jest.fn(),
  hasMany: jest.fn(), belongsTo: jest.fn(),
}));
jest.mock('../../src/models/index', () => ({
  User: require('../../src/models/user.model'),
  Doctor: require('../../src/models/doctor.model'),
  Appointment: require('../../src/models/appointment.model'),
  AvailabilitySlot: require('../../src/models/availability_slot.model'),
}));

jest.mock('../../src/repositories/appointment.repository');
jest.mock('../../src/repositories/doctor.repository');
jest.mock('../../src/repositories/user.repository');
jest.mock('../../src/utils/logger', () => ({ info: jest.fn(), warn: jest.fn(), error: jest.fn() }));
jest.mock('../../src/utils/notifier', () => ({ emit: jest.fn() }));

const appointmentService = require('../../src/services/appointment.service');
const appointmentRepo = require('../../src/repositories/appointment.repository');
const doctorRepo = require('../../src/repositories/doctor.repository');
const userRepo = require('../../src/repositories/user.repository');

describe('Appointment Service', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('bookAppointment', () => {
    it('should throw 400 for past dates', async () => {
      await expect(
        appointmentService.bookAppointment({ appointment_date: '2020-01-01', doctor_id: 'd1', time_slot: '09:00' }, 'u1')
      ).rejects.toMatchObject({ statusCode: 400 });
    });

    it('should throw 409 on double booking', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 5);
      doctorRepo.findById.mockResolvedValue({ id: 'd1', is_active: true });
      doctorRepo.findAvailableSlot.mockResolvedValue({ id: 's1', is_blocked: false });
      appointmentRepo.checkConflict.mockResolvedValue({ id: 'existing-appt' });

      await expect(
        appointmentService.bookAppointment({
          appointment_date: futureDate.toISOString().split('T')[0],
          doctor_id: 'd1', time_slot: '09:00',
        }, 'u1')
      ).rejects.toMatchObject({ statusCode: 409 });
    });

    it('should book successfully when slot is free', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 5);
      const dateStr = futureDate.toISOString().split('T')[0];

      doctorRepo.findById.mockResolvedValue({ id: 'd1', is_active: true });
      doctorRepo.findAvailableSlot.mockResolvedValue({ id: 's1', is_blocked: false });
      appointmentRepo.checkConflict.mockResolvedValue(null);
      appointmentRepo.create.mockResolvedValue({ id: 'appt1', appointment_date: dateStr, time_slot: '09:00' });
      userRepo.findById.mockResolvedValue({ id: 'u1', email: 'test@test.com' });

      const result = await appointmentService.bookAppointment({
        appointment_date: dateStr, doctor_id: 'd1', time_slot: '09:00',
      }, 'u1');
      expect(result).toHaveProperty('id', 'appt1');
    });
  });

  describe('updateStatus', () => {
    it('should throw if customer tries to confirm', async () => {
      appointmentRepo.findById.mockResolvedValue({ id: 'a1', customer_id: 'u1', status: 'BOOKED' });
      await expect(
        appointmentService.updateStatus('a1', 'CONFIRMED', 'u1', 'CUSTOMER')
      ).rejects.toMatchObject({ statusCode: 403 });
    });

    it('should throw on invalid status transition', async () => {
      appointmentRepo.findById.mockResolvedValue({ id: 'a1', customer_id: 'u1', status: 'COMPLETED' });
      await expect(
        appointmentService.updateStatus('a1', 'CANCELLED', 'u1', 'ADMIN')
      ).rejects.toMatchObject({ statusCode: 400 });
    });
  });
});
