const { Bid, Profile, Appearance, User } = require('../models');
const { Op } = require('sequelize');

function getTomorrowDate() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split('T')[0]; 
}

exports.placeBid = async (req, res) => {
  try {
    const { amount } = req.body;
    const userId = req.user.id;
    const targetDate = getTomorrowDate();

    const profile = await Profile.findOne({ where: { user_id: userId } });
    if (!profile) return res.status(404).json({ message: 'Please create your profile first' });

    const limit = profile.attended_event ? 4 : 3;
    if (profile.monthly_appearances >= limit) {
      return res.status(403).json({
        message: `You've reached your monthly limit of ${limit} featured appearances.`,
      });
    }

    const existingBid = await Bid.findOne({ where: { user_id: userId, target_date: targetDate } });
    if (existingBid) {
      return res.status(409).json({ message: 'You already have a bid for tomorrow. You can update it instead.' });
    }

    const bid = await Bid.create({ user_id: userId, amount, target_date: targetDate });

    const highestBid = await Bid.findOne({
      where: { target_date: targetDate },
      order: [['amount', 'DESC']],
    });

    const isWinning = highestBid.id === bid.id;

    res.status(201).json({
      bidId: bid.id,
      status: isWinning ? 'winning' : 'losing',
      message: isWinning
        ? 'Your bid is currently the highest! You are winning.'
        : 'You are not currently winning. You can increase your bid.',
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateBid = async (req, res) => {
  try {
    const { amount } = req.body;
    const bid = await Bid.findOne({ where: { id: req.params.id, user_id: req.user.id } });

    if (!bid) return res.status(404).json({ message: 'Bid not found' });
    if (parseFloat(amount) <= parseFloat(bid.amount)) {
      return res.status(400).json({ message: 'New bid must be higher than your current bid' });
    }

    await bid.update({ amount });

    const highestBid = await Bid.findOne({
      where: { target_date: bid.target_date },
      order: [['amount', 'DESC']],
    });
    const isWinning = highestBid.id === bid.id;

    res.json({
      status: isWinning ? 'winning' : 'losing',
      message: isWinning ? 'You are now winning!' : 'Still not winning. Consider bidding higher.',
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.cancelBid = async (req, res) => {
  try {
    const bid = await Bid.findOne({ where: { id: req.params.id, user_id: req.user.id } });
    if (!bid) return res.status(404).json({ message: 'Bid not found' });
    await bid.destroy();
    res.json({ message: 'Bid cancelled successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.selectDailyWinner = async () => {
  const targetDate = getTomorrowDate();

  const winningBid = await Bid.findOne({
    where: { target_date: targetDate },
    order: [['amount', 'DESC']],
    include: [{ model: User }],
  });

  if (!winningBid) return console.log('No bids placed for tomorrow');

  await Profile.update({ is_active: false }, { where: {} });

  const winnerProfile = await Profile.findOne({ where: { user_id: winningBid.user_id } });
  await winnerProfile.update({
    is_active: true,
    monthly_appearances: winnerProfile.monthly_appearances + 1,
  });

  await Bid.update({ status: 'lost' }, {
    where: { target_date: targetDate, id: { [Op.ne]: winningBid.id } },
  });
  await winningBid.update({ status: 'won' });

  await Appearance.create({
    profile_id:      winnerProfile.id,
    bid_id:          winningBid.id,
    appearance_date: targetDate,
  });

  console.log(`Winner selected: ${winningBid.User.email} for ${targetDate}`);
};

exports.getMyBids = async (req, res) => {
  try {
    const bids = await Bid.findAll({
      where: { user_id: req.user.id },
      order: [['createdAt', 'DESC']],
    });
    res.json(bids);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getTomorrowStatus = async (req, res) => {
  try {
    const targetDate = getTomorrowDate();
    const myBid = await Bid.findOne({
      where: { user_id: req.user.id, target_date: targetDate },
    });

    if (!myBid) return res.json({ message: 'You have not placed a bid for tomorrow yet.' });

    const highestBid = await Bid.findOne({
      where: { target_date: targetDate },
      order: [['amount', 'DESC']],
    });

    const isWinning = highestBid.id === myBid.id;
    res.json({
      bid_id:     myBid.id,
      target_date: targetDate,
      status:     isWinning ? 'winning' : 'losing',
      message:    isWinning
        ? 'You are currently winning!'
        : 'You are not winning. Consider increasing your bid.',
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getMonthlyLimit = async (req, res) => {
  try {
    const profile = await Profile.findOne({ where: { user_id: req.user.id } });
    if (!profile) return res.status(404).json({ message: 'Profile not found' });

    const limit = profile.attended_event ? 4 : 3;
    const used  = profile.monthly_appearances;
    const remaining = limit - used;

    res.json({
      limit,
      used,
      remaining,
      attended_event: profile.attended_event,
      message: remaining > 0
        ? `You have ${remaining} featured slot(s) remaining this month.`
        : 'You have reached your monthly limit.',
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};