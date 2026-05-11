import mongoose, { Document, Schema } from 'mongoose';

//document is for access the mongoose methods
export interface IUser extends Document {
  name: string;
  email: string;
  credits: number;
}

const userSchema = new Schema<IUser>({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  credits: {
    type: Number,
    default: 100
  }
}, {
  timestamps: true
});

const User = mongoose.models.User || mongoose.model<IUser>('User', userSchema);

export default User;