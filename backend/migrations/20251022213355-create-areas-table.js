'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('areas', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: false,
        unique: true
      },
      display_order: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      operating_hours: {
        type: Sequelize.JSONB,
        allowNull: true,
        comment: 'JSON object with day-specific hours, e.g. {"monday": {"open": "18:00", "close": "02:00"}}'
      },
      capacity: {
        type: Sequelize.INTEGER,
        allowNull: true,
        comment: 'Maximum capacity for the area'
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Add indexes
    await queryInterface.addIndex('areas', ['display_order']);
    await queryInterface.addIndex('areas', ['is_active']);
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('areas');
  }
};
