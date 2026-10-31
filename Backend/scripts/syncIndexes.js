// Brings MongoDB indexes in line with the Mongoose schemas (creates new ones and
// drops ones no longer declared, e.g. the old Booking slot index that also blocked
// cancelled bookings). Run once after deploying schema changes: npm run db:sync-indexes
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '../.env') });

const run = async () => {
    await mongoose.connect(process.env.MONGO_URI);
    const modelsDir = path.join(__dirname, '../models');
    fs.readdirSync(modelsDir).filter(f => f.endsWith('.js')).forEach(f => require(path.join(modelsDir, f)));

    for (const name of mongoose.modelNames()) {
        const dropped = await mongoose.model(name).syncIndexes();
        console.log(`${name}: synced${dropped.length ? `, dropped ${dropped.join(', ')}` : ''}`);
    }
    await mongoose.disconnect();
};

run().catch((error) => {
    console.error(error);
    process.exit(1);
});
