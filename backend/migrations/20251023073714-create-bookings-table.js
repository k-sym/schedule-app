'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('bookings', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      entertainer_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      area_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'areas',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      booking_date: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },
      recurring_pattern_id: {
        type: Sequelize.UUID,
        allowNull: true
        // Future: Add foreign key when recurring_patterns table is created
        // references: {
        //   model: 'recurring_patterns',
        //   key: 'id'
        // },
        // onUpdate: 'CASCADE',
        // onDelete: 'SET NULL'
      },
      is_override: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false
      },
      status: {
        type: Sequelize.ENUM('confirmed', 'cancelled', 'pending'),
        defaultValue: 'confirmed',
        allowNull: false
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      created_by: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    // Unique constraint: one entertainer per area per day
    await queryInterface.addConstraint('bookings', {
      fields: ['area_id', 'booking_date'],
      type: 'unique',
      name: 'unique_area_booking_per_day'
    });

    // Index for performance
    await queryInterface.addIndex('bookings', ['entertainer_id', 'booking_date'], {
      name: 'idx_bookings_entertainer_date'
    });

    await queryInterface.addIndex('bookings', ['area_id', 'booking_date'], {
      name: 'idx_bookings_area_date'
    });

    await queryInterface.addIndex('bookings', ['booking_date'], {
      name: 'idx_bookings_date'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeIndex('bookings', 'idx_bookings_date');
    await queryInterface.removeIndex('bookings', 'idx_bookings_area_date');
    await queryInterface.removeIndex('bookings', 'idx_bookings_entertainer_date');
    await queryInterface.removeConstraint('bookings', 'unique_area_booking_per_day');
    await queryInterface.dropTable('bookings');
  }
};
