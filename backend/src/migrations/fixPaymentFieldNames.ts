/**
 * Migration Script: Fix Payment field name typos
 * 
 * Renames:
 *   invoinceNo  →  invoiceNo
 *   recoredBy   →  recordedBy
 * 
 * Run once: npx tsx src/migrations/fixPaymentFieldNames.ts
 */

import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
dotenv.config();

const MONGO_URI = process.env.MONGO_URI || process.env.DATABASE_URL;

if (!MONGO_URI) {
    console.error('❌ No MONGO_URI found in environment variables');
    process.exit(1);
}

async function runMigration() {
    await mongoose.connect(MONGO_URI!);
    console.log('✅ Connected to MongoDB');

    const db = mongoose.connection.db!;
    const payments = db.collection('payments');

    // Count documents that still use the old field names
    const toMigrate = await payments.countDocuments({
        $or: [
            { invoinceNo: { $exists: true } },
            { recoredBy:  { $exists: true } },
        ]
    });

    if (toMigrate === 0) {
        console.log('✅ No documents need migrating — already up to date.');
        await mongoose.disconnect();
        return;
    }

    console.log(`📦 Found ${toMigrate} payment documents to migrate...`);

    // Rename both fields atomically using $rename
    const result = await payments.updateMany(
        {
            $or: [
                { invoinceNo: { $exists: true } },
                { recoredBy:  { $exists: true } },
            ]
        },
        {
            $rename: {
                invoinceNo: 'invoiceNo',
                recoredBy:  'recordedBy',
            }
        }
    );

    console.log(`✅ Migration complete: ${result.modifiedCount} documents updated.`);
    await mongoose.disconnect();
}

runMigration().catch(err => {
    console.error('❌ Migration failed:', err);
    process.exit(1);
});
