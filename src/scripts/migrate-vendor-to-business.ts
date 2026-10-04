import mongoose from 'mongoose';
import { env, logger } from '../config/index.js';

export async function migrateVendorsToBusiness(): Promise<void> {
  logger.info('Starting Data Migration: Splitting Vendor into Vendor + Business entities...');

  if (mongoose.connection.readyState !== 1) {
    await mongoose.connect(env.MONGODB_URI);
    logger.info('Connected to MongoDB database for migration');
  }

  const db = mongoose.connection.db;
  if (!db) {
    throw new Error('Database connection is not initialized');
  }

  const vendorsCollection = db.collection('vendors');
  const businessesCollection = db.collection('businesses');

  const cursor = vendorsCollection.find({ businessName: { $exists: true } });
  const vendorsToMigrate = await cursor.toArray();

  logger.info(`Found ${vendorsToMigrate.length} legacy vendor documents to evaluate`);

  let createdCount = 0;
  let updatedCount = 0;

  for (const vendorDoc of vendorsToMigrate) {
    const existingBusiness = await businessesCollection.findOne({ vendorId: vendorDoc._id });

    if (!existingBusiness) {
      await businessesCollection.insertOne({
        vendorId: vendorDoc._id,
        businessName: vendorDoc.businessName,
        description: vendorDoc.description || '',
        city: vendorDoc.city || null,
        address: vendorDoc.address || null,
        cuisineTypes: vendorDoc.cuisineTypes || [],
        status: vendorDoc.status === 'REJECTED' ? 'REJECTED' : 'APPROVED',
        averageRating: 0,
        totalReviews: 0,
        createdAt: vendorDoc.createdAt || new Date(),
        updatedAt: new Date(),
      });
      createdCount++;
    }

    const rawName = (vendorDoc.ownerName || vendorDoc.firstName || vendorDoc.businessName || 'Vendor Profile').trim();
    const nameParts = rawName.split(' ');
    const firstName = vendorDoc.firstName || nameParts[0];
    const lastName = vendorDoc.lastName || (nameParts.length > 1 ? nameParts.slice(1).join(' ') : undefined);

    await vendorsCollection.updateOne(
      { _id: vendorDoc._id },
      {
        $set: {
          firstName,
          ...(lastName ? { lastName } : {}),
          status: 'ACTIVE',
        },
        $unset: {
          ownerName: '',
          businessName: '',
          city: '',
          address: '',
          cuisineTypes: '',
        },
      },
    );
    updatedCount++;
  }

  logger.info(
    `Migration completed successfully! Created ${createdCount} Business records, updated ${updatedCount} Vendor documents.`,
  );
}

// Allow running standalone via CLI
if (process.argv[1]?.endsWith('migrate-vendor-to-business.ts')) {
  migrateVendorsToBusiness()
    .then(() => {
      logger.info('Migration script execution finished.');
      process.exit(0);
    })
    .catch((err) => {
      logger.error('Migration script failed:', err);
      process.exit(1);
    });
}
