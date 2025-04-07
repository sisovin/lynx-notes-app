import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../../../utils/database';
import { User } from '../../auth/models/userModel';

// Attributes interface defines all fields in the model
interface NoteAttributes {
  id: number;
  title: string;
  content: string;
  userId: number;
  createdAt?: Date;
  updatedAt?: Date;
}

// CreationAttributes are used when creating a new instance
interface NoteCreationAttributes extends Optional<NoteAttributes, 'id'> {}

// Define the model class correctly
export class Note extends Model<NoteAttributes, NoteCreationAttributes> {
  // Declare the fields that need to be accessed but don't use class properties
  declare id: number;
  declare title: string;
  declare content: string;
  declare userId: number;
  
  // Timestamps
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

// Initialize model with Sequelize
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
      references: {
        model: User,
        key: 'id',
      },
    },
  },
  {
    sequelize,
    tableName: 'notes',
    timestamps: true,
    modelName: 'Note'
  }
);

// Set up associations
Note.belongsTo(User, { foreignKey: 'userId' });
User.hasMany(Note, { foreignKey: 'userId' });

export default Note;