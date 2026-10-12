const mongoose = require('mongoose');
const Job = require('../models/Job');
const Application = require('../models/Application');
const ApiError = require('../utils/ApiError');
const { escapeRegex, parsePagination } = require('../utils/helpers');

async function listJobs(req, res) {
  let pagination;
  try {
    pagination = parsePagination(req.query);
  } catch (error) {
    throw new ApiError(400, error.message);
  }
  const { page, limit, skip } = pagination;
  const search = readQueryString(req.query.search, 'search', 100);
  const type = readQueryString(req.query.type, 'type', 30);
  const location = readQueryString(req.query.location, 'location', 100);
  const skill = readQueryString(req.query.skill, 'skill', 60);
  const sortValue = readQueryString(req.query.sort, 'sort', 20);
  const filter = {};

  if (search) filter.$text = { $search: search };
  if (type) {
    if (!['internship', 'full-time', 'part-time', 'contract'].includes(type)) {
      throw new ApiError(400, 'Invalid job type');
    }
    filter.type = type;
  }
  if (location) {
    filter.location = { $regex: escapeRegex(location), $options: 'i' };
  }
  if (skill) {
    filter.skills = { $regex: escapeRegex(skill), $options: 'i' };
  }

  const sorts = {
    newest: { createdAt: -1 },
    oldest: { createdAt: 1 },
    deadline: { deadline: 1 }
  };
  if (sortValue && !sorts[sortValue]) {
    throw new ApiError(400, 'Sort must be newest, oldest, or deadline');
  }
  const sort = sorts[sortValue] || sorts.newest;

  const [data, total] = await Promise.all([
    Job.find(filter)
      .select(search ? { score: { $meta: 'textScore' } } : {})
      .sort(search ? { score: { $meta: 'textScore' }, ...sort } : sort)
      .skip(skip)
      .limit(limit)
      .populate('createdBy', 'name')
      .lean(),
    Job.countDocuments(filter)
  ]);
  res.json({
    success: true,
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
    data
  });
}

function readQueryString(value, name, maxLength) {
  if (value === undefined) return '';
  if (typeof value !== 'string') throw new ApiError(400, `${name} must be a single string value`);
  return value.trim().slice(0, maxLength);
}

async function getJob(req, res) {
  const job = await Job.findById(req.params.id).populate('createdBy', 'name').lean();
  if (!job) throw new ApiError(404, 'Job not found');
  res.json({ success: true, data: { job } });
}

async function createJob(req, res) {
  const job = await Job.create({ ...jobFields(req.body), createdBy: req.user.id });
  res.status(201).json({ success: true, message: 'Job created successfully', data: { job } });
}

async function updateJob(req, res) {
  if (!mongoose.isValidObjectId(req.params.id)) throw new ApiError(400, 'Invalid job ID');
  const job = await Job.findById(req.params.id);
  if (!job) throw new ApiError(404, 'Job not found');
  ensureJobOwner(req, job);
  Object.assign(job, jobFields(req.body, true));
  await job.save();
  res.json({ success: true, message: 'Job updated successfully', data: { job } });
}

async function deleteJob(req, res) {
  const job = await Job.findById(req.params.id);
  if (!job) throw new ApiError(404, 'Job not found');
  ensureJobOwner(req, job);
  await Application.deleteMany({ job: job.id });
  await job.deleteOne();
  res.json({ success: true, message: 'Job deleted successfully' });
}

function jobFields(body, partial = false) {
  const allowed = ['title', 'company', 'description', 'location', 'type', 'skills', 'deadline'];
  const fields = {};
  for (const field of allowed) {
    if (!partial || body[field] !== undefined) fields[field] = body[field];
  }
  return fields;
}

function ensureJobOwner(req, job) {
  if (req.user.role !== 'admin' && job.createdBy.toString() !== req.user.id) {
    throw new ApiError(403, 'You can only manage your own jobs');
  }
}

module.exports = { listJobs, getJob, createJob, updateJob, deleteJob };
