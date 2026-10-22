module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define(
    'User',
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true
      },
      username: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
        validate: {
          notEmpty: { msg: '账号不能为空' }
        }
      },
      password: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
          notEmpty: { msg: '密码不能为空' }
        }
      },
      fullName: {
        type: DataTypes.STRING(50),
        allowNull: false,
        field: 'full_name',
        validate: {
          notEmpty: { msg: '姓名不能为空' }
        }
      },
      phone: {
        type: DataTypes.STRING(20),
        allowNull: false,
        unique: true,
        validate: {
          notEmpty: { msg: '手机号不能为空' }
        }
      },
      city: {
        type: DataTypes.STRING(50),
        allowNull: false,
        validate: {
          notEmpty: { msg: '所在城市不能为空' }
        }
      }
    },
    {
      tableName: 'users',
      underscored: true,
      timestamps: true
    }
  );

  return User;
};
