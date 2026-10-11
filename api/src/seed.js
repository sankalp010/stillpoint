import 'dotenv/config';
import mongoose from 'mongoose';
import { Problem } from './models.js';
import { starterProblems } from './problemSeed.js';

if (!process.env.MONGODB_URI) throw new Error('Set MONGODB_URI before seeding.');
await mongoose.connect(process.env.MONGODB_URI);
let inserted = 0;
for (const problem of starterProblems) {
  const result = await Problem.updateOne({ slug: problem.slug }, { $setOnInsert: problem }, { upsert: true });
  inserted += result.upsertedCount || 0;
}
console.log(`Seed complete: ${inserted} new original starter problems; existing records were preserved.`);
await mongoose.disconnect();
