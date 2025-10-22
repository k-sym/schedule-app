'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const { v4: uuidv4 } = require('uuid');
    const now = new Date();

    await queryInterface.bulkInsert('areas', [
      {
        id: uuidv4(),
        name: 'Pub',
        display_order: 1,
        operating_hours: JSON.stringify({
          monday: { open: '18:00', close: '02:00' },
          tuesday: { open: '18:00', close: '02:00' },
          wednesday: { open: '18:00', close: '02:00' },
          thursday: { open: '18:00', close: '02:00' },
          friday: { open: '18:00', close: '03:00' },
          saturday: { open: '14:00', close: '03:00' },
          sunday: { open: '14:00', close: '02:00' }
        }),
        capacity: 100,
        notes: 'Main pub area with DJ booth',
        is_active: true,
        created_at: now,
        updated_at: now
      },
      {
        id: uuidv4(),
        name: 'Terrace',
        display_order: 2,
        operating_hours: JSON.stringify({
          monday: null,
          tuesday: null,
          wednesday: null,
          thursday: { open: '19:00', close: '01:00' },
          friday: { open: '19:00', close: '02:00' },
          saturday: { open: '15:00', close: '02:00' },
          sunday: { open: '15:00', close: '01:00' }
        }),
        capacity: 75,
        notes: 'Outdoor terrace area, weather dependent',
        is_active: true,
        created_at: now,
        updated_at: now
      },
      {
        id: uuidv4(),
        name: 'Main Stage',
        display_order: 3,
        operating_hours: JSON.stringify({
          monday: null,
          tuesday: null,
          wednesday: null,
          thursday: null,
          friday: { open: '20:00', close: '03:00' },
          saturday: { open: '20:00', close: '04:00' },
          sunday: null
        }),
        capacity: 250,
        notes: 'Large stage for live bands and major DJ events',
        is_active: true,
        created_at: now,
        updated_at: now
      },
      {
        id: uuidv4(),
        name: 'Lounge',
        display_order: 4,
        operating_hours: JSON.stringify({
          monday: { open: '17:00', close: '00:00' },
          tuesday: { open: '17:00', close: '00:00' },
          wednesday: { open: '17:00', close: '00:00' },
          thursday: { open: '17:00', close: '01:00' },
          friday: { open: '17:00', close: '02:00' },
          saturday: { open: '17:00', close: '02:00' },
          sunday: { open: '17:00', close: '00:00' }
        }),
        capacity: 50,
        notes: 'Intimate lounge area for acoustic sets',
        is_active: true,
        created_at: now,
        updated_at: now
      }
    ], {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('areas', null, {});
  }
};
