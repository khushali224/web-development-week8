const Application = require('../models/Application');
const Job = require('../models/Job');
const ApiError = require('../utils/ApiError');

async function createApplication(req, res) {
  if (req.user.role !== 'candidate') {
    throw new ApiError(403, 'Only candidates can apply for jobs');
  }
  const job = await Job.findById(req.body.jobId).select('_id deadline');
  if (!job) throw new ApiError(404, 'Job not found');
  if (job.deadline < new Date()) throw new ApiError(400, 'The application deadline has passed');
  const application = await Application.create({
    job: job.id,
    applicant: req.user.id,
    coverLetter: req.body.coverLetter || ''
  });
  res.status(201).json({
    success: true,
    message: 'Application submitted successfully',
    data: { application }
  });
}

async function listMyApplications(req, res) {
  const applications = await Application.find({ applicant: req.user.id })
    .populate('job', 'title company location type deadline')
    .sort({ createdAt: -1 })
    .lean();
  res.json({ success: true, data: { applications } });
}

async function getApplication(req, res) {
  const application = await Application.findById(req.params.id)
    .populate('job', 'title company location type deadline createdBy')
    .populate('applicant', 'name email');
  if (!application) throw new ApiError(404, 'Application not found');
  await assertCanView(req.user, application);
  res.json({ success: true, data: { application } });
}

async function updateApplicationStatus(req, res) {
  const application = await Application.findById(req.params.id).populate('job', 'createdBy');
  if (!application) throw new ApiError(404, 'Application not found');
  if (!canManageJobApplication(req.user, application)) {
    throw new ApiError(403, 'You can only update applications for your own jobs');
  }
  application.status = req.body.status;
  await application.save();
  res.json({
    success: true,
    message: 'Application status updated successfully',
    data: { application }
  });
}

async function deleteApplication(req, res) {
  const application = await Application.findById(req.params.id).populate('job', 'createdBy');
  if (!application) throw new ApiError(404, 'Application not found');
  const owner = application.applicant.toString() === req.user.id;
  if (!owner && !canManageJobApplication(req.user, application)) {
    throw new ApiError(403, 'You cannot delete this application');
  }
  await application.deleteOne();
  res.json({ success: true, message: 'Application deleted successfully' });
}

async function assertCanView(user, application) {
  const ownsApplication = application.applicant.id === user.id;
  if (!ownsApplication && !canManageJobApplication(user, application)) {
    throw new ApiError(403, 'You cannot view this application');
  }
}

function canManageJobApplication(user, application) {
  return user.role === 'admin' ||
    (user.role === 'recruiter' && application.job.createdBy.toString() === user.id);
}

module.exports = {
  createApplication,
  listMyApplications,
  getApplication,
  updateApplicationStatus,
  deleteApplication
};
