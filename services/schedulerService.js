const cron = require('node-cron');
const { Op } = require('sequelize');
const { Bid, Profile, Appearance } = require('../models');

function getTomorrowDate() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split('T')[0];
}

async function selectDailyWinner() {
  const tomorrow = getTomorrowDate();
  console.log(`[CRON] Selecting winner for ${tomorrow}...`);

  const winningBid = await Bid.findOne({
    where: { target_date: tomorrow },
    order: [['amount', 'DESC']],
  });

  if (!winningBid) {
    console.log('[CRON] No bids placed for tomorrow. No winner selected.');
    return;
  }

  await Profile.update({ is_active: false }, { where: {} });

  const winnerProfile = await Profile.findOne({
    where: { user_id: winningBid.user_id },
  });

  if (!winnerProfile) {
    console.log('[CRON] Winner has no profile. Skipping.');
    return;
  }

  await winnerProfile.update({
    is_active:           true,
    monthly_appearances: winnerProfile.monthly_appearances + 1,
  });

  await winningBid.update({ status: 'won' });

  await Bid.update(
    { status: 'lost' },
    {
      where: {
        target_date: tomorrow,
        id: { [Op.ne]: winningBid.id },
      },
    }
  );

  await Appearance.create({
    profile_id:      winnerProfile.id,
    bid_id:          winningBid.id,
    appearance_date: tomorrow,
  });

  console.log(`[CRON] Winner: user id=${winningBid.user_id}, amount=${winningBid.amount}, date=${tomorrow}`);
}

async function resetMonthlyAppearances() {
  await Profile.update(
    { monthly_appearances: 0, attended_event: false },
    { where: {} }
  );
  console.log('[CRON] Monthly appearance counts reset');
}

exports.startScheduler = () => {
  cron.schedule('0 18 * * *', () => {
    console.log('[CRON] 6pm — running daily winner selection');
    selectDailyWinner();
  });

  cron.schedule('0 0 1 * *', () => {
    console.log('[CRON] Month start — resetting appearance counts');
    resetMonthlyAppearances();
  });

  console.log('[CRON] Scheduler started — daily winner at 6pm, monthly reset on 1st');
};

exports.selectDailyWinner = selectDailyWinner;