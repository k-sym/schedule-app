'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('area_rules', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      area_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'areas',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      day_of_week: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: '0=Sunday, 1=Monday, ..., 6=Saturday'
      },
      default_emoji: {
        type: Sequelize.STRING(10),
        allowNull: false
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

    // Add unique constraint on area_id + day_of_week
    await queryInterface.addConstraint('area_rules', {
      fields: ['area_id', 'day_of_week'],
      type: 'unique',
      name: 'area_rules_area_day_unique'
    });

    // Add index on area_id for faster lookups
    await queryInterface.addIndex('area_rules', ['area_id'], {
      name: 'area_rules_area_id_idx'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('area_rules');
  }
};
