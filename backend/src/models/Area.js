const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Area extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Define associations here
      // Area.hasMany(models.Booking, { foreignKey: 'area_id', as: 'bookings' });
      Area.hasMany(models.AreaRule, {
        foreignKey: 'area_id',
        as: 'rules'
      });
    }

    /**
     * Override toJSON to exclude sensitive fields and format data
     */
    toJSON() {
      const values = { ...this.get() };
      return values;
    }
  }

  Area.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
        validate: {
          notEmpty: {
            msg: 'Area name cannot be empty'
          },
          len: {
            args: [1, 100],
            msg: 'Area name must be between 1 and 100 characters'
          }
        }
      },
      display_order: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        validate: {
          isInt: {
            msg: 'Display order must be an integer'
          },
          min: {
            args: [0],
            msg: 'Display order must be non-negative'
          }
        }
      },
      operating_hours: {
        type: DataTypes.JSONB,
        allowNull: true,
        validate: {
          isValidJSON(value) {
            if (value !== null && value !== undefined && typeof value !== 'object') {
              throw new Error('Operating hours must be a valid JSON object');
            }
          }
        }
      },
      capacity: {
        type: DataTypes.INTEGER,
        allowNull: true,
        validate: {
          isInt: {
            msg: 'Capacity must be an integer'
          },
          min: {
            args: [1],
            msg: 'Capacity must be at least 1'
          }
        }
      },
      notes: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      abbreviation: {
        type: DataTypes.STRING(3),
        allowNull: true,
        validate: {
          len: {
            args: [1, 3],
            msg: 'Abbreviation must be between 1 and 3 characters'
          }
        }
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
      }
    },
    {
      sequelize,
      modelName: 'Area',
      tableName: 'areas',
      underscored: true,
      timestamps: true,
      indexes: [
        { fields: ['display_order'] },
        { fields: ['is_active'] }
      ]
    }
  );

  return Area;
};
