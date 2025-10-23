'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('areas', 'abbreviation', {
      type: Sequelize.STRING(3),
      allowNull: true,
      validate: {
        len: [1, 3]
      }
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('areas', 'abbreviation');
  }
};
