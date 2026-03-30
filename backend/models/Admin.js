import mongoose from 'mongoose';

const adminSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['admin', 'super-admin'],
    default: 'admin',
    index: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Admin = mongoose.models.Admin || mongoose.model('Admin', adminSchema);

if (typeof module !== 'undefined') {
  module.exports = mongoose.model("Admin", adminSchema);
}

export default Admin;
