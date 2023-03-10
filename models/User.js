import mongoose  from "mongoose";
import validator from "validator";

import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please provide name"],
    minlength: 3,
    maxlength: 20,
    trim: true,
  },

  email: {
    type: String,
    required: [true, "please provide email"],
    validate: {
      validator: validator.isEmail,
      message: "Please provide valid email",
    },
    unique: true,
  },

  password: {
    type: String,
    required: [true, "please provide password"],
    minlength: 6,
    select: false,
  },

  lastName: {
    type: String,
    trim: true,
    maxlength: 20,
    default: "lastName",
  },
  department: {
    type: String,
    required: [true, "please provide Department"],
    enum: ["", "Electrical", "Mechanical", "Software","Electro Mechanical","College"],
    trim: true,
    maxlength: 50,
  },
  roll: {
    type: String,
    enum: ["Department", "College", "HR", "vice president","user"],
    default: "user",
  },
});

UserSchema.pre('save', async function(){
    if(!this.isModified('password')) return 
    
    const salt= await bcrypt.genSalt(10);
    this.password=await bcrypt.hash(this.password,salt)
})
UserSchema.methods.createJWT = function(){
    return jwt.sign({ userId: this._id }, process.env.JWT_SECRET, {expiresIn: process.env.JWT_LIFETIME,});
}

UserSchema.methods.comparePassword = async function (candidatePassword) {
    const isMatch = await bcrypt.compare(candidatePassword, this.password);
    return isMatch;
  };

export default mongoose.model('User', UserSchema)
