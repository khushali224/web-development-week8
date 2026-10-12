const { publicUser } = require('./authController');

function getProfile(req, res) {
  res.json({ success: true, data: { user: publicUser(req.user) } });
}

async function updateProfile(req, res) {
  const fields = ['name', 'bio', 'skills'];
  for (const field of fields) {
    if (req.body[field] !== undefined) req.user[field] = req.body[field];
  }
  await req.user.save();
  res.json({
    success: true,
    message: 'Profile updated successfully',
    data: { user: publicUser(req.user) }
  });
}

async function deleteProfile(req, res) {
  req.user.isActive = false;
  req.user.tokenVersion += 1;
  await req.user.save();
  res.json({ success: true, message: 'Profile deactivated successfully' });
}

module.exports = { getProfile, updateProfile, deleteProfile };
