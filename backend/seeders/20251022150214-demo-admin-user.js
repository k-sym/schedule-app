'use strict';

const bcrypt = require('bcryptjs');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const hashedPassword = await bcrypt.hash('admin123', 10);

    await queryInterface.bulkInsert('users', [
      {
        id: Sequelize.literal('gen_random_uuid()'),
        email: 'admin@scheduleapp.com',
        password_hash: hashedPassword,
        role: 'admin',
        name: 'Admin User',
        phone: null,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: Sequelize.literal('gen_random_uuid()'),
        email: 'entertainer@scheduleapp.com',
        password_hash: hashedPassword,
        role: 'entertainer',
        name: 'Demo Entertainer',
        phone: '+1234567890',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      }
    ], {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('users', {
      email: ['admin@scheduleapp.com', 'entertainer@scheduleapp.com']
    }, {});
  }
};
