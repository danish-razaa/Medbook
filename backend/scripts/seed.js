require('dotenv').config();
const bcrypt = require('bcryptjs');
const { connectDB, sequelize } = require('../src/config/db.config');
require('../src/models/index');
const { User, Doctor, AvailabilitySlot } = require('../src/models');

const seed = async () => {
  await connectDB();
  console.log('🌱 Seeding database...');

  // Create super admin
  const superAdminPassword = await bcrypt.hash('SuperAdmin@123', 12);
  const [superAdmin] = await User.findOrCreate({
    where: { email: 'superadmin@clinic.com' },
    defaults: { name: 'Super Admin', email: 'superadmin@clinic.com', password: superAdminPassword, role: 'SUPER_ADMIN' },
  });
  console.log('✅ Super admin created:', superAdmin.email);

  // Create admin
  const adminPassword = await bcrypt.hash('Admin@123', 12);
  const [admin] = await User.findOrCreate({
    where: { email: 'admin@clinic.com' },
    defaults: { name: 'Admin User', email: 'admin@clinic.com', password: adminPassword, role: 'ADMIN' },
  });
  console.log('✅ Admin created:', admin.email);

  // Create doctors
  const doctorPassword = await bcrypt.hash('Doctor@123', 12);
  const doctorData = [
    { name: 'Dr. Sarah Johnson', email: 'sarah@clinic.com', specialty: 'General Practice', bio: 'Board-certified GP with 10 years experience.', license_number: 'GP-100245' },
    { name: 'Dr. Raj Patel', email: 'raj@clinic.com', specialty: 'Cardiology', bio: 'Specialist in cardiovascular health.', license_number: 'CARD-204813' },
    { name: 'Dr. Emily Chen', email: 'emily@clinic.com', specialty: 'Dermatology', bio: 'Expert in skin conditions and cosmetic dermatology.', license_number: 'DERM-330917' },
  ];

  for (const d of doctorData) {
    const [user] = await User.findOrCreate({
      where: { email: d.email },
      defaults: { name: d.name, email: d.email, password: doctorPassword, role: 'DOCTOR' },
    });

    const [doctor] = await Doctor.findOrCreate({
      where: { user_id: user.id },
      defaults: {
        user_id: user.id,
        specialty: d.specialty,
        bio: d.bio,
        license_number: d.license_number,
        approval_status: 'APPROVED',
      },
    });

    // Create slots for next 7 days
    const times = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'];
    for (let dayOffset = 1; dayOffset <= 7; dayOffset++) {
      const date = new Date();
      date.setDate(date.getDate() + dayOffset);
      const dateStr = date.toISOString().split('T')[0];

      for (const time of times) {
        const endHour = parseInt(time.split(':')[0]) + 1;
        const endTime = `${String(endHour).padStart(2, '0')}:00`;
        await AvailabilitySlot.findOrCreate({
          where: { doctor_id: doctor.id, slot_date: dateStr, start_time: time },
          defaults: { doctor_id: doctor.id, slot_date: dateStr, start_time: time, end_time: endTime },
        });
      }
    }
    console.log(`✅ Doctor created with slots: ${d.name}`);
  }

  // Create customers
  const customerPassword = await bcrypt.hash('Customer@123', 12);
  const customers = [
    { name: 'Alice Smith', email: 'alice@example.com' },
    { name: 'Bob Johnson', email: 'bob@example.com' },
  ];

  for (const c of customers) {
    await User.findOrCreate({
      where: { email: c.email },
      defaults: { ...c, password: customerPassword, role: 'CUSTOMER' },
    });
    console.log(`✅ Customer created: ${c.name}`);
  }

  console.log('\n🎉 Seeding complete!');
  console.log('\nLogin credentials:');
  console.log('  Super Admin: superadmin@clinic.com / SuperAdmin@123');
  console.log('  Admin:       admin@clinic.com      / Admin@123');
  console.log('  Doctor:      sarah@clinic.com      / Doctor@123');
  console.log('  Doctor:      raj@clinic.com        / Doctor@123');
  console.log('  Customer:    alice@example.com     / Customer@123');

  await sequelize.close();
  process.exit(0);
};

seed().catch((e) => { console.error(e); process.exit(1); });
