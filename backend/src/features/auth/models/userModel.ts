import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../../../utils/database';

// Define interface for attributes
interface UserAttributes {
  id: number;
  username: string;
  email: string;
  password: string;
  isDeleted: boolean;
  resetToken: string | null;
  resetTokenExpires: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

// For creating a new User - make some attributes optional
interface UserCreationAttributes extends Optional<UserAttributes, 'id' | 'isDeleted' | 'resetToken' | 'resetTokenExpires' | 'createdAt' | 'updatedAt'> {}

// Define the model class using `declare` instead of `public` properties
export class User extends Model<UserAttributes, UserCreationAttributes> {
  declare id: number;
  declare username: string;
  declare email: string;
  declare password: string;
  declare isDeleted: boolean;
  declare resetToken: string | null;
  declare resetTokenExpires: Date | null;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    isDeleted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    resetToken: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    resetTokenExpires: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'users',
    timestamps: true,
    modelName: 'User'
  }
);

export default User;