const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Booking extends Model {
    static associate(models) {
      Booking.belongsTo(models.User, {
        foreignKey: 'entertainer_id',
        as: 'entertainer'
      });

      Booking.belongsTo(models.Area, {
        foreignKey: 'area_id',
        as: 'area'
      });

      Booking.belongsTo(models.User, {
        foreignKey: 'created_by',
        as: 'creator'
      });

      // Future: recurring patterns
      // Booking.belongsTo(models.RecurringPattern, {
      //   foreignKey: 'recurring_pattern_id',
      //   as: 'recurringPattern'
      // });
    }

    toJSON() {
      const values = { ...this.get() };
      return values;
    }
  }

  Booking.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      entertainer_id: {
        type: DataTypes.UUID,
        allowNull: false
      },
      area_id: {
        type: DataTypes.UUID,
        allowNull: false
      },
      booking_date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        validate: {
          isNotPastDate(value) {
            const bookingDate = new Date(value);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            if (bookingDate < today) {
              throw new Error('Cannot create bookings for past dates');
            }
          }
        }
      },
      recurring_pattern_id: {
        type: DataTypes.UUID,
        allowNull: true
      },
      is_override: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false
      },
      status: {
        type: DataTypes.ENUM('confirmed', 'cancelled', 'pending'),
        defaultValue: 'confirmed',
        allowNull: false
      },
      notes: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      created_by: {
        type: DataTypes.UUID,
        allowNull: false
      }
    },
    {
      sequelize,
      modelName: 'Booking',
      tableName: 'bookings',
      underscored: true,
      timestamps: true
    }
  );

  return Booking;
};
