'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('bookings', 'emoji', {
      type: Sequelize.STRING(10),
      allowNull: true,
      defaultValue: null
    });

    await queryInterface.addColumn('bookings', 'display_note', {
      type: Sequelize.STRING(255),
      allowNull: true,
      defaultValue: null
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('bookings', 'display_note');
    await queryInterface.removeColumn('bookings', 'emoji');
  }
};
