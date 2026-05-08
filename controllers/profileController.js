const fs = require('fs');
const path = require('path');
const { Profile, Degree, Certification, Licence, Course, Employment } = require('../models');

exports.createProfile = async (req, res) => {
  try {
    const existing = await Profile.findOne({ where: { user_id: req.user.id } });
    if (existing) return res.status(409).json({ message: 'Profile already exists. Use PUT to update.' });

    const { full_name, bio, linkedin_url } = req.body;

    const profile = await Profile.create({
      user_id: req.user.id,
      full_name,
      bio,
      linkedin_url,
    });

    res.status(201).json({ message: 'Profile created', profile });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getMyProfile = async (req, res) => {
  try {
    const profile = await Profile.findOne({
      where: { user_id: req.user.id },
      include: [Degree, Certification, Licence, Course, Employment],
    });

    if (!profile) return res.status(404).json({ message: 'Profile not found. Please create one first.' });

    const data = profile.toJSON();
    if (data.profile_image) {
      data.profile_image = `${process.env.BASE_URL}/uploads/${data.profile_image}`;
    }

    data.completion = calcCompletion(profile);

    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const profile = await Profile.findOne({ where: { user_id: req.user.id } });
    if (!profile) return res.status(404).json({ message: 'Profile not found' });

    const { full_name, bio, linkedin_url } = req.body;
    await profile.update({ full_name, bio, linkedin_url });

    res.json({ message: 'Profile updated', profile });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.uploadImage = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No image file provided' });

    const profile = await Profile.findOne({ where: { user_id: req.user.id } });
    if (!profile) return res.status(404).json({ message: 'Profile not found' });

    if (profile.profile_image) {
      const oldPath = path.join(__dirname, '..', 'uploads', profile.profile_image);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }

    await profile.update({ profile_image: req.file.filename });

    res.json({
      message: 'Profile image uploaded',
      image_url: `${process.env.BASE_URL}/uploads/${req.file.filename}`,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

function calcCompletion(profile) {
  let score = 0;
  if (profile.full_name)    score += 20;
  if (profile.bio)          score += 20;
  if (profile.linkedin_url) score += 20;
  if (profile.profile_image) score += 20;
  if (profile.Degrees?.length > 0) score += 20;
  return `${score}%`;
}

exports.addDegree = async (req, res) => {
  try {
    const profile = await getProfile(req.user.id);
    if (!profile) return res.status(404).json({ message: 'Profile not found' });

    const { title, university, url, completion_date } = req.body;
    const degree = await Degree.create({ profile_id: profile.id, title, university, url, completion_date });
    res.status(201).json({ message: 'Degree added', degree });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateDegree = async (req, res) => {
  try {
    const degree = await getOwnedRecord(Degree, req.params.id, req.user.id);
    if (!degree) return res.status(404).json({ message: 'Degree not found' });
    await degree.update(req.body);
    res.json({ message: 'Degree updated', degree });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteDegree = async (req, res) => {
  try {
    const degree = await getOwnedRecord(Degree, req.params.id, req.user.id);
    if (!degree) return res.status(404).json({ message: 'Degree not found' });
    await degree.destroy();
    res.json({ message: 'Degree deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.addCertification = async (req, res) => {
  try {
    const profile = await getProfile(req.user.id);
    if (!profile) return res.status(404).json({ message: 'Profile not found' });

    const { title, issuer, url, completion_date } = req.body;
    const cert = await Certification.create({ profile_id: profile.id, title, issuer, url, completion_date });
    res.status(201).json({ message: 'Certification added', cert });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateCertification = async (req, res) => {
  try {
    const cert = await getOwnedRecord(Certification, req.params.id, req.user.id);
    if (!cert) return res.status(404).json({ message: 'Certification not found' });
    await cert.update(req.body);
    res.json({ message: 'Certification updated', cert });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteCertification = async (req, res) => {
  try {
    const cert = await getOwnedRecord(Certification, req.params.id, req.user.id);
    if (!cert) return res.status(404).json({ message: 'Certification not found' });
    await cert.destroy();
    res.json({ message: 'Certification deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.addLicence = async (req, res) => {
  try {
    const profile = await getProfile(req.user.id);
    if (!profile) return res.status(404).json({ message: 'Profile not found' });

    const { title, issuing_body, url, completion_date } = req.body;
    const licence = await Licence.create({ profile_id: profile.id, title, issuing_body, url, completion_date });
    res.status(201).json({ message: 'Licence added', licence });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateLicence = async (req, res) => {
  try {
    const licence = await getOwnedRecord(Licence, req.params.id, req.user.id);
    if (!licence) return res.status(404).json({ message: 'Licence not found' });
    await licence.update(req.body);
    res.json({ message: 'Licence updated', licence });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteLicence = async (req, res) => {
  try {
    const licence = await getOwnedRecord(Licence, req.params.id, req.user.id);
    if (!licence) return res.status(404).json({ message: 'Licence not found' });
    await licence.destroy();
    res.json({ message: 'Licence deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


exports.addCourse = async (req, res) => {
  try {
    const profile = await getProfile(req.user.id);
    if (!profile) return res.status(404).json({ message: 'Profile not found' });

    const { title, provider, url, completion_date } = req.body;
    const course = await Course.create({ profile_id: profile.id, title, provider, url, completion_date });
    res.status(201).json({ message: 'Course added', course });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateCourse = async (req, res) => {
  try {
    const course = await getOwnedRecord(Course, req.params.id, req.user.id);
    if (!course) return res.status(404).json({ message: 'Course not found' });
    await course.update(req.body);
    res.json({ message: 'Course updated', course });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteCourse = async (req, res) => {
  try {
    const course = await getOwnedRecord(Course, req.params.id, req.user.id);
    if (!course) return res.status(404).json({ message: 'Course not found' });
    await course.destroy();
    res.json({ message: 'Course deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.addEmployment = async (req, res) => {
  try {
    const profile = await getProfile(req.user.id);
    if (!profile) return res.status(404).json({ message: 'Profile not found' });

    const { company, role, industry, location, start_date, end_date } = req.body;
    const emp = await Employment.create({
      profile_id: profile.id,
      company,
      role,
      industry,
      location,
      start_date,
      end_date,
    });
    res.status(201).json({ message: 'Employment added', emp });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateEmployment = async (req, res) => {
  try {
    const emp = await getOwnedRecord(Employment, req.params.id, req.user.id);
    if (!emp) return res.status(404).json({ message: 'Employment record not found' });
    await emp.update(req.body);
    res.json({ message: 'Employment updated', emp });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteEmployment = async (req, res) => {
  try {
    const emp = await getOwnedRecord(Employment, req.params.id, req.user.id);
    if (!emp) return res.status(404).json({ message: 'Employment record not found' });
    await emp.destroy();
    res.json({ message: 'Employment deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

async function getProfile(userId) {
  return Profile.findOne({ where: { user_id: userId } });
}

async function getOwnedRecord(model, id, userId) {
  return model.findOne({
    where: { id },
    include: [{ model: Profile, where: { user_id: userId }, attributes: [] }],
  });
}