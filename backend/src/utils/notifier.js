const EventEmitter = require('events');
const logger = require('./logger');

class NotificationEmitter extends EventEmitter {}
const notifier = new NotificationEmitter();

notifier.on('booking.confirmed', ({ appointment, user }) => {
  logger.info(`[NOTIFICATION] Booking confirmed — Appointment ID: ${appointment.id}, User: ${user.email}, Date: ${appointment.appointment_date} at ${appointment.time_slot}`);
});

notifier.on('booking.cancelled', ({ appointment, user }) => {
  logger.warn(`[NOTIFICATION] Booking cancelled — Appointment ID: ${appointment.id}, User: ${user.email}`);
});

notifier.on('booking.rescheduled', ({ appointment, user }) => {
  logger.info(`[NOTIFICATION] Booking rescheduled — Appointment ID: ${appointment.id}, User: ${user.email}, New date: ${appointment.appointment_date}`);
});

notifier.on('booking.completed', ({ appointment }) => {
  logger.info(`[NOTIFICATION] Appointment completed — ID: ${appointment.id}`);
});

module.exports = notifier;
