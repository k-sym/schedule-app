const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class AreaRule extends Model {
    static associate(models) {
      AreaRule.belongsTo(models.Area, {
        foreignKey: 'area_id',
        as: 'area'
      });
    }

    toJSON() {
      const values = { ...this.get() };
      return values;
    }
  }

  AreaRule.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      area_id: {
        type: DataTypes.UUID,
        allowNull: false
      },
      day_of_week: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          min: 0,
          max: 6
        },
        comment: '0=Sunday, 1=Monday, ..., 6=Saturday'
      },
      default_emoji: {
        type: DataTypes.STRING(10),
        allowNull: false
      }
    },
    {
      sequelize,
      modelName: 'AreaRule',
      tableName: 'area_rules',
      underscored: true,
      timestamps: true,
      indexes: [
        {
          unique: true,
          fields: ['area_id', 'day_of_week'],
          name: 'area_rules_area_day_unique'
        }
      ]
    }
  );

  return AreaRule;
};
