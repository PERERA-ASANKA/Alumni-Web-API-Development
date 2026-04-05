const sequelize = require('../config/db');

const User        = require('./User');
const Profile     = require('./Profile');
const Bid         = require('./Bid');
const ApiKey      = require('./ApiKey');
const EmailToken  = require('./EmailToken');
const Degree      = require('./Degree');
const Certification = require('./Certification');
const Licence     = require('./Licence');
const Course      = require('./Course');
const Employment  = require('./Employment');
const Appearance  = require('./Appearance');
const ApiKeyLog = require('./ApiKeyLog');


User.hasOne(Profile,        { foreignKey: 'user_id', onDelete: 'CASCADE' });
Profile.belongsTo(User,     { foreignKey: 'user_id' });

User.hasMany(Bid,           { foreignKey: 'user_id', onDelete: 'CASCADE' });
Bid.belongsTo(User,         { foreignKey: 'user_id' });

User.hasMany(ApiKey,        { foreignKey: 'user_id', onDelete: 'CASCADE' });
ApiKey.belongsTo(User,      { foreignKey: 'user_id' });

User.hasMany(EmailToken,    { foreignKey: 'user_id', onDelete: 'CASCADE' });
EmailToken.belongsTo(User,  { foreignKey: 'user_id' });

Profile.hasMany(Degree,       { foreignKey: 'profile_id', onDelete: 'CASCADE' });
Degree.belongsTo(Profile,     { foreignKey: 'profile_id' });

Profile.hasMany(Certification,    { foreignKey: 'profile_id', onDelete: 'CASCADE' });
Certification.belongsTo(Profile,  { foreignKey: 'profile_id' });

Profile.hasMany(Licence,      { foreignKey: 'profile_id', onDelete: 'CASCADE' });
Licence.belongsTo(Profile,    { foreignKey: 'profile_id' });

Profile.hasMany(Course,       { foreignKey: 'profile_id', onDelete: 'CASCADE' });
Course.belongsTo(Profile,     { foreignKey: 'profile_id' });

Profile.hasMany(Employment,   { foreignKey: 'profile_id', onDelete: 'CASCADE' });
Employment.belongsTo(Profile, { foreignKey: 'profile_id' });

Profile.hasMany(Appearance,   { foreignKey: 'profile_id' });
Appearance.belongsTo(Profile, { foreignKey: 'profile_id' });

Bid.hasOne(Appearance,        { foreignKey: 'bid_id' });
Appearance.belongsTo(Bid,     { foreignKey: 'bid_id' });

ApiKey.hasMany(ApiKeyLog,  { foreignKey: 'api_key_id', onDelete: 'CASCADE' });
ApiKeyLog.belongsTo(ApiKey, { foreignKey: 'api_key_id' });

module.exports = {
  sequelize,
  User, Profile, Bid, ApiKey, EmailToken,
  Degree, Certification, Licence, Course, Employment, Appearance,
};