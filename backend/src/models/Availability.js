const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Availability = sequelize.define('Availability', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false
    },
    entertainer_id: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'entertainer_id',
      references: {
        model: 'users',
        key: 'id'
      }
    },
    available_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      field: 'available_date',
      validate: {
        isDate: true,
        isNotPastDate(value) {
          if (new Date(value) < new Date(new Date().setHours(0, 0, 0, 0))) {
            throw new Error('Cannot set availability for past dates');
          }
        }
      }
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    tableName: 'availability',
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        unique: true,
        fields: ['entertainer_id', 'available_date'],
        name: 'availability_entertainer_date_unique'
      },
      {
        fields: ['available_date'],
        name: 'availability_date_index'
      }
    ]
  });

  // Define associations
  Availability.associate = (models) => {
    Availability.belongsTo(models.User, {
      foreignKey: 'entertainer_id',
      as: 'entertainer'
    });
  };

  return Availability;
};
