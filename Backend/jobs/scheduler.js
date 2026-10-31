const Listing = require('../models/Listing');
const ScrapingSource = require('../models/ScrapingSource');
const ScrapeJob = require('../models/ScrapeJob');
const { createNotification } = require('../controllers/notificationController');

const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;
const EXPIRY_WARNING_DAYS = 3;
// Minimum gap between scheduled runs per schedule type ("custom" cron expressions run daily)
const SCHEDULE_INTERVAL_MS = { daily: DAY_MS, weekly: 7 * DAY_MS, custom: DAY_MS };

// Mark approved listings past their expiry date as expired and tell the owner
const expireListings = async () => {
    const expired = await Listing.find({ status: 'approved', expiresAt: { $lt: new Date() } })
        .select('_id owner title').lean();
    if (!expired.length) return 0;

    await Listing.updateMany({ _id: { $in: expired.map(l => l._id) } }, { $set: { status: 'expired' } });
    await Promise.all(expired.map(listing => createNotification({
        userId: listing.owner,
        type: 'listing_expiring',
        title: 'Listing expired',
        message: `"${listing.title}" has expired and is no longer visible. Renew it from My Listings.`,
        link: '/my-listings',
    })));
    return expired.length;
};

// Warn owners a few days before expiry (once per listing per renewal period)
const warnExpiringListings = async () => {
    const soon = new Date(Date.now() + EXPIRY_WARNING_DAYS * DAY_MS);
    const listings = await Listing.find({
        status: 'approved',
        expiresAt: { $gte: new Date(), $lt: soon },
        expiryWarnedAt: { $exists: false },
    }).select('_id owner title expiresAt').lean();
    if (!listings.length) return 0;

    await Promise.all(listings.map(listing => createNotification({
        userId: listing.owner,
        type: 'listing_expiring',
        title: 'Listing expiring soon',
        message: `"${listing.title}" expires on ${new Date(listing.expiresAt).toDateString()}. Renew it to keep it visible.`,
        link: '/my-listings',
    })));
    await Listing.updateMany({ _id: { $in: listings.map(l => l._id) } }, { $set: { expiryWarnedAt: new Date() } });
    return listings.length;
};

// Start scrape jobs for sources whose schedule is due
const runScheduledScrapes = async () => {
    // Avoid overlapping runs
    if (await ScrapeJob.exists({ status: 'running' })) return 0;

    const sources = await ScrapingSource.find({ isEnabled: true, 'schedule.enabled': true });
    const now = Date.now();
    const due = sources.filter(source => {
        const interval = SCHEDULE_INTERVAL_MS[source.schedule?.type] || DAY_MS;
        const last = source.health?.lastScrapeAt ? new Date(source.health.lastScrapeAt).getTime() : 0;
        return now - last >= interval;
    });
    if (!due.length) return 0;

    // Lazy require: scrapingController pulls in the AI service and is heavier to load
    const { startScrapeJob } = require('../controllers/scrapingController');
    await startScrapeJob({ sources: due, type: 'incremental', isScheduled: true });
    return due.length;
};

const runTask = async (name, task) => {
    try {
        const count = await task();
        if (count) console.log(`[Scheduler] ${name}: ${count}`);
    } catch (error) {
        console.error(`[Scheduler] ${name} failed:`, error.message);
    }
};

const tick = async () => {
    await runTask('expired listings', expireListings);
    await runTask('expiry warnings', warnExpiringListings);
    await runTask('scheduled scrape sources', runScheduledScrapes);
};

let timer = null;

// Runs hourly in-process. With several API instances, set ENABLE_SCHEDULER=true on one only.
const startScheduler = () => {
    if (timer || process.env.ENABLE_SCHEDULER === 'false') return;
    setTimeout(tick, 60 * 1000).unref(); // first run shortly after boot
    timer = setInterval(tick, HOUR_MS);
    timer.unref();
};

const stopScheduler = () => {
    if (timer) clearInterval(timer);
    timer = null;
};

module.exports = { startScheduler, stopScheduler, expireListings, warnExpiringListings, runScheduledScrapes };
