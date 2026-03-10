<<<<<<< HEAD
﻿import mongoose, { Schema, Document } from "mongoose";
=======
import mongoose, { Schema, Document } from "mongoose";
>>>>>>> 12a67fb8429a47e75accfb493435e1dde3f30099

export interface IUser extends Document {
  name: string;
  email: string;
  image: string;
  role: string;
}

const schema: Schema<IUser> = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    image: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      default: null,
    },
  },
  { timestamps: true },
);

const User = mongoose.model<IUser>("User", schema);

<<<<<<< HEAD
export default User;
=======
export default User;
>>>>>>> 12a67fb8429a47e75accfb493435e1dde3f30099
