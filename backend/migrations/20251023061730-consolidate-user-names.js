'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Add new name column
    await queryInterface.addColumn('users', 'name', {
      type: Sequelize.STRING(200),
      allowNull: true // Temporarily allow null during migration
    });

    // Migrate existing data: concatenate first_name and last_name
    await queryInterface.sequelize.query(
      `UPDATE users SET name = CONCAT(first_name, ' ', last_name)`
    );

    // Make name column required
    await queryInterface.changeColumn('users', 'name', {
      type: Sequelize.STRING(200),
      allowNull: false
    });

    // Remove old columns
    await queryInterface.removeColumn('users', 'first_name');
    await queryInterface.removeColumn('users', 'last_name');
  },

  async down (queryInterface, Sequelize) {
    // Add back first_name and last_name columns
    await queryInterface.addColumn('users', 'first_name', {
      type: Sequelize.STRING(100),
      allowNull: true
    });

    await queryInterface.addColumn('users', 'last_name', {
      type: Sequelize.STRING(100),
      allowNull: true
    });

    // Split name back into first_name and last_name (simple split on first space)
    await queryInterface.sequelize.query(`
      UPDATE users SET
        first_name = SPLIT_PART(name, ' ', 1),
        last_name = CASE
          WHEN POSITION(' ' IN name) > 0 THEN SUBSTRING(name FROM POSITION(' ' IN name) + 1)
          ELSE ''
        END
    `);

    // Make columns required
    await queryInterface.changeColumn('users', 'first_name', {
      type: Sequelize.STRING(100),
      allowNull: false
    });

    await queryInterface.changeColumn('users', 'last_name', {
      type: Sequelize.STRING(100),
      allowNull: false
    });

    // Remove name column
    await queryInterface.removeColumn('users', 'name');
  }
};
