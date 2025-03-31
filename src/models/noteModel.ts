import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../utils/database';

export class Note extends Model {
  public id!: number;
  public title!: string;
  public content!: string;
  public userId!: number;
}

Note.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'notes',
    timestamps: true,
  }
);
