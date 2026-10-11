import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const userSchema = new Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
  name: { type: String, required: true, trim: true },
  passwordHash: { type: String, default: null, select: false },
  googleSubject: { type: String, default: undefined },
}, { timestamps: true });
userSchema.index({ googleSubject: 1 }, { unique: true, partialFilterExpression: { googleSubject: { $type: 'string' } } });

const testSchema = new Schema({ input: { type: [Schema.Types.Mixed], required: true }, expected: { type: Schema.Types.Mixed, required: true } }, { _id: false });
const problemSchema = new Schema({
  slug: { type: String, required: true, unique: true, index: true },
  title: { type: String, required: true },
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], required: true, index: true },
  topics: { type: [String], default: [] },
  prompt: { type: String, required: true },
  constraints: { type: [String], default: [] },
  examples: { type: [Schema.Types.Mixed], default: [] },
  starterCode: { type: String, required: true },
  referenceAnswer: { type: String, required: true, select: false },
  explanation: { type: String, required: true, select: false },
  hiddenTests: { type: [testSchema], required: true, select: false },
  source: { type: String, default: 'Original starter content' },
  sourceUrl: { type: String, default: null },
  license: { type: String, default: 'Original' },
  active: { type: Boolean, default: true, index: true },
}, { timestamps: true });
problemSchema.index({ difficulty: 1, active: 1 });

const assignmentSchema = new Schema({
  problemId: { type: Schema.Types.ObjectId, ref: 'Problem', required: true },
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], required: true },
  latestSource: { type: String, default: '' },
  latestSubmissionId: { type: String, default: null },
  submissionStatus: { type: String, enum: ['not_submitted', 'running', 'accepted', 'incorrect', 'error'], default: 'not_submitted' },
  passedTests: { type: Number, default: 0 },
  totalTests: { type: Number, default: 0 },
  submittedAt: { type: Date, default: null },
  evaluatedAt: { type: Date, default: null },
  providerMessage: { type: String, default: null },
}, { _id: false });
const sessionSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  durationMinutes: { type: Number, enum: [45, 60, 90], required: true },
  startedAt: { type: Date, required: true },
  deadlineAt: { type: Date, required: true },
  finalizedAt: { type: Date, default: null },
  status: { type: String, enum: ['active', 'completed', 'expired'], default: 'active', index: true },
  assignments: { type: [assignmentSchema], validate: v => v.length === 3 },
}, { timestamps: true });
sessionSchema.index({ userId: 1, createdAt: -1 });

export const User = mongoose.models.User || model('User', userSchema);
export const Problem = mongoose.models.Problem || model('Problem', problemSchema);
export const InterviewSession = mongoose.models.InterviewSession || model('InterviewSession', sessionSchema);
