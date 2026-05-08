const {
  sequelize,
  Profile,
  User,
  Degree,
  Certification,
  Licence,
  Course,
  Employment,
  Appearance,
  Bid,
} = require('../models');
const { Op } = require('sequelize');

exports.getAlumniOfTheDay = async (req, res) => {
  try {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    const tomorrow = d.toISOString().split('T')[0];

    const winningBid = await Bid.findOne({
      where: { target_date: tomorrow, status: 'won' },
      include: [{ model: User, include: [Profile] }],
    });

    if (!winningBid) {
      return res.status(404).json({ message: 'No featured alumni today' });
    }

    const profile = await Profile.findOne({
      where: { user_id: winningBid.user_id },
      attributes: [
        'id',
        'full_name',
        'bio',
        'linkedin_url',
        'profile_image',
        'monthly_appearances',
        'createdAt',
      ],
      include: [
        { model: User, attributes: ['email'] },
        { model: Degree, attributes: ['title', 'university', 'completion_date'] },
        { model: Certification, attributes: ['title', 'issuer', 'completion_date'] },
        { model: Licence, attributes: ['title', 'issuing_body', 'completion_date'] },
        { model: Course, attributes: ['title', 'provider', 'completion_date'] },
        { model: Employment, attributes: ['company', 'role', 'start_date', 'end_date'] },
        { model: Appearance, attributes: ['appearance_date'] },
      ],
    });

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'No featured alumnus for today yet. Check back after 6pm.',
      });
    }

    const imageUrl = profile.profile_image
      ? `${process.env.BASE_URL}/uploads/${profile.profile_image}`
      : null;

    res.json({
      success: true,
      data: {
        id: profile.id,
        full_name: profile.full_name,
        bio: profile.bio,
        linkedin_url: profile.linkedin_url,
        profile_image: imageUrl,
        email: profile.User.email,
        times_featured: profile.monthly_appearances,
        degrees: profile.Degrees,
        certifications: profile.Certifications,
        licences: profile.Licences,
        courses: profile.Courses,
        employment: profile.Employments,
        past_appearances: profile.Appearances,
      },
    });
  } catch (err) {
    console.error('[publicController] Error:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getAlumni = async (req, res) => {
  try {
    const { program, graduationYear, industrySector, searchTerm, limit = 50, offset = 0 } = req.query;
    const graduationYearValue = graduationYear ? Number.parseInt(String(graduationYear).trim(), 10) : null;

    const degreeWhere = {};
    if (program) degreeWhere.title = program;
    if (graduationYearValue) {
      degreeWhere[Op.and] = sequelize.where(sequelize.fn('YEAR', sequelize.col('completion_date')), graduationYearValue);
    }

    const employmentWhere = {};
    if (industrySector) employmentWhere.industry = industrySector;

    const where = searchTerm
      ? {
          [Op.or]: [
            { full_name: { [Op.like]: `%${searchTerm}%` } },
            { '$Employments.company$': { [Op.like]: `%${searchTerm}%` } },
          ],
        }
      : {};

    const include = [
      {
        model: Degree,
        attributes: ['id', 'title', 'university', 'completion_date'],
        required: !!(program || graduationYear),
        ...(Object.keys(degreeWhere).length ? { where: degreeWhere } : {}),
      },
      { model: Certification, attributes: ['title'] },
      {
        model: Employment,
        attributes: ['company', 'role', 'industry', 'location'],
        required: !!industrySector,
        ...(Object.keys(employmentWhere).length ? { where: employmentWhere } : {}),
      },
    ];

    const alumni = await Profile.findAndCountAll({
      where,
      attributes: ['id', 'full_name', 'bio', 'linkedin_url', 'profile_image', 'createdAt'],
      include,
      limit: parseInt(limit, 10),
      offset: parseInt(offset, 10),
      distinct: true,
      subQuery: false,
      order: [['createdAt', 'DESC']],
    });

    const rows = alumni.rows.filter((profile) => profile.Degrees || profile.Employments);

    res.json({
      total: rows.length,
      alumni: rows.map(a => ({
        id: a.id,
        name: a.full_name,
        company: a.Employments?.[0]?.company || '',
        position: a.Employments?.[0]?.role || '',
        industry: a.Employments?.[0]?.industry || '',
        location: a.Employments?.[0]?.location || '',
        image: a.profile_image,
        degree: a.Degrees?.length
          ? a.Degrees.slice().sort((left, right) => new Date(right.completion_date || 0) - new Date(left.completion_date || 0))[0]
          : null,
        graduationYear: a.Degrees?.length
          ? new Date(a.Degrees.slice().sort((left, right) => new Date(right.completion_date || 0) - new Date(left.completion_date || 0))[0].completion_date).getFullYear()
          : '',
        degrees: (a.Degrees || []).map((d) => d.title),
        certifications: (a.Certifications || []).map((c) => c.title),
        employment: (a.Employments || []).map((e) => ({ company: e.company, role: e.role, industry: e.industry, location: e.location })),
      })),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getAnalytics = async (req, res) => {
  try {
    const [skillsGaps, employmentByIndustry, courseCompletion, topCertifications] = await Promise.all([
      buildSkillGapData(),
      buildIndustryData(),
      buildCompletionTrendData(),
      buildTopCertificationData(),
    ]);

    res.json({
      totalAlumni: await Profile.count(),
      skillsGaps,
      employmentByIndustry,
      courseCompletion,
      topCertifications,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getSkillsGaps = async (req, res) => {
  try {
    res.json(await buildSkillGapData());
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getCourseStats = async (req, res) => {
  try {
    res.json(await buildCompletionTrendData());
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getIndustrySectors = async (req, res) => {
  try {
    res.json(await buildIndustryData());
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getPrograms = async (req, res) => {
  try {
    const degrees = await Degree.findAll({ attributes: ['title'], group: ['title'] });
    res.json(degrees.map(d => d.title).filter(Boolean));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getJobTitles = async (req, res) => {
  try {
    const roles = await Employment.findAll({ attributes: ['role'] });
    const jobCount = {};

    roles.forEach((item) => {
      if (item.role) {
        jobCount[item.role] = (jobCount[item.role] || 0) + 1;
      }
    });

    const titles = Object.entries(jobCount)
      .map(([name, count]) => ({
        name,
        count,
        label: `${count}`,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 15);

    res.json(titles);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getTopEmployers = async (req, res) => {
  try {
    const employments = await Employment.findAll({ attributes: ['company'] });
    const companyCount = {};

    employments.forEach((item) => {
      if (item.company) {
        companyCount[item.company] = (companyCount[item.company] || 0) + 1;
      }
    });

    const employers = Object.entries(companyCount)
      .map(([company, alumni]) => ({
        company,
        alumni,
        label: `${alumni}`,
      }))
      .sort((a, b) => b.alumni - a.alumni)
      .slice(0, 10);

    res.json(employers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getGeographicData = async (req, res) => {
  try {
    res.json(await buildLocationData());
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

async function buildSkillGapData() {
  const certifications = await Certification.findAll({ attributes: ['title'] });
  const total = certifications.length || 1;
  const counts = {};

  certifications.forEach((item) => {
    if (item.title) {
      counts[item.title] = (counts[item.title] || 0) + 1;
    }
  });

  return Object.entries(counts)
    .map(([skill, alumni]) => ({
      skill,
      alumni,
      percentage: Math.round((alumni / total) * 100),
      label: `${Math.round((alumni / total) * 100)}%`,
    }))
    .sort((a, b) => b.percentage - a.percentage)
    .slice(0, 10);
}

async function buildIndustryData() {
  const employments = await Employment.findAll({ attributes: ['industry'] });
  const counts = {};

  employments.forEach((item) => {
    if (item.industry) {
      counts[item.industry] = (counts[item.industry] || 0) + 1;
    }
  });

  return Object.entries(counts)
    .map(([name, value]) => ({
      name,
      value,
      label: `${value}`,
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8);
}

async function buildLocationData() {
  const employments = await Employment.findAll({ attributes: ['location'] });
  const counts = {};

  employments.forEach((item) => {
    if (item.location) {
      counts[item.location] = (counts[item.location] || 0) + 1;
    }
  });

  return Object.entries(counts)
    .map(([region, value]) => ({
      region,
      value,
      label: `${value}`,
      percentage: value,
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 10);
}

async function buildCompletionTrendData() {
  const [courses, certifications] = await Promise.all([
    Course.findAll({ attributes: ['completion_date'] }),
    Certification.findAll({ attributes: ['completion_date'] }),
  ]);

  const monthMap = new Map();

  const addMonth = (dateValue, bucket) => {
    if (!dateValue) return;
    const date = new Date(dateValue);
    if (Number.isNaN(date.getTime())) return;

    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const label = date.toLocaleDateString(undefined, { month: 'short', year: 'numeric' });
    if (!monthMap.has(key)) {
      monthMap.set(key, { month: label, courses: 0, certifications: 0, total: 0 });
    }

    const current = monthMap.get(key);
    current[bucket] += 1;
    current.total += 1;
  };

  courses.forEach((item) => addMonth(item.completion_date, 'courses'));
  certifications.forEach((item) => addMonth(item.completion_date, 'certifications'));

  return Array.from(monthMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([, value]) => ({
      ...value,
      label: `${value.total}`,
    }));
}