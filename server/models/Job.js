const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 150 },
    company: { type: String, required: true, trim: true, maxlength: 150 },
    description: { type: String, required: true, trim: true, maxlength: 10000 },
    location: { type: String, required: true, trim: true, maxlength: 150 },
    type: {
      type: String,
      required: true,
      enum: ['internship', 'full-time', 'part-time', 'contract']
    },
    skills: { type: [String], default: [] },
    deadline: { type: Date, required: true },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    }
  },
  { timestamps: true }
);

jobSchema.index({
  title: 'text',
  company: 'text',
  skills: 'text',
  location: 'text',
  description: 'text'
});
jobSchema.index({ type: 1, location: 1, createdAt: -1 });
jobSchema.index({ deadline: 1 });
jobSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Job', jobSchema);
