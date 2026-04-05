const {
    Profile,
    User,
    Degree,
    Certification,
    Licence,
    Course,
    Employment,
    Appearance,
  } = require('../models');
  
  exports.getAlumniOfTheDay = async (req, res) => {
    try {
      debugger;
      const profile = await Profile.findOne({
        where: { is_active: true },
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
          {
            model:      User,
            attributes: ['email'],
          },
          {
            model:      Degree,
            attributes: ['title', 'university', 'url', 'completion_date'],
          },
          {
            model:      Certification,
            attributes: ['title', 'issuer', 'url', 'completion_date'],
          },
          {
            model:      Licence,
            attributes: ['title', 'issuing_body', 'url', 'completion_date'],
          },
          {
            model:      Course,
            attributes: ['title', 'provider', 'url', 'completion_date'],
          },
          {
            model:      Employment,
            attributes: ['company', 'role', 'start_date', 'end_date'],
          },
          {
            model:      Appearance,
            attributes: ['appearance_date'],
            limit:      5,
            order:      [['appearance_date', 'DESC']],
          },
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
          id:              profile.id,
          full_name:       profile.full_name,
          bio:             profile.bio,
          linkedin_url:    profile.linkedin_url,
          profile_image:   imageUrl,
          email:           profile.User.email,
          times_featured:  profile.monthly_appearances,
          degrees:         profile.Degrees,
          certifications:  profile.Certifications,
          licences:        profile.Licences,
          courses:         profile.Courses,
          employment:      profile.Employments,
          past_appearances: profile.Appearances,
        },
      });
  
    } catch (err) {
      console.error('[publicController] Error:', err.message);
      res.status(500).json({ success: false, message: err.message });
    }
  };