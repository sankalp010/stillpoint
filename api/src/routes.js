import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { OAuth2Client } from 'google-auth-library';
import { randomInt as cryptoRandomInt, randomUUID } from 'node:crypto';
import { InterviewSession, Problem, User } from './models.js';
import { evaluateJavaScript } from './judge0.js';
import { chooseAssignments, difficulties, scoreSession, serializeInterview } from './domain.js';

const router = Router();
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const fail = (res, status, code, message) => res.status(status).json({ error: { code, message } });

function requireAuth(req, res, next) {
  if (!req.session?.userId) return fail(res, 401, 'AUTH_REQUIRED', 'Please sign in to continue.');
  next();
}

async function getOwnedSession(req, res) {
  const session = await InterviewSession.findOne({ _id: req.params.id, userId: req.session.userId });
  if (!session) { fail(res, 404, 'SESSION_NOT_FOUND', 'Interview session not found.'); return null; }
  return session;
}

async function finalize(session, status) {
  if (session.status !== 'active') return session;
  if (session.assignments.some(assignment => assignment.submissionStatus === 'running')) return session;
  session.status = status;
  session.finalizedAt = new Date();
  await session.save();
  return session;
}

async function resolveExpiry(session) {
  if (session.status === 'active' && Date.now() >= session.deadlineAt.getTime() && !session.assignments.some(assignment => assignment.submissionStatus === 'running')) await finalize(session, 'expired');
  return session;
}

function establishUserSession(req, user) {
  return new Promise((resolve, reject) => req.session.regenerate(error => {
    if (error) return reject(error);
    req.session.userId = String(user._id);
    return req.session.save(saveError => saveError ? reject(saveError) : resolve());
  }));
}

async function sendSession(req, res, session, review = false) {
  await resolveExpiry(session);
  const problems = await Promise.all(session.assignments.map(a => Problem.findById(a.problemId).select('+referenceAnswer +explanation')));
  return res.json({ session: serializeInterview(session, problems.filter(Boolean), review) });
}

router.post('/auth/register', async (req, res) => {
  const name = String(req.body?.name || '').trim();
  const email = String(req.body?.email || '').trim().toLowerCase();
  const password = String(req.body?.password || '');
  if (name.length < 2 || name.length > 80 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || password.length < 8 || password.length > 128) return fail(res, 400, 'INVALID_INPUT', 'Enter a valid name, email, and password of at least 8 characters.');
  if (await User.exists({ email })) return fail(res, 409, 'EMAIL_EXISTS', 'An account with this email already exists.');
  const user = await User.create({ name, email, passwordHash: await bcrypt.hash(password, 12) });
  await establishUserSession(req, user);
  return res.status(201).json({ user: { id: user._id, name: user.name, email: user.email } });
});

router.post('/auth/login', async (req, res) => {
  const email = String(req.body?.email || '').trim().toLowerCase();
  const user = await User.findOne({ email }).select('+passwordHash');
  if (!user?.passwordHash || !(await bcrypt.compare(String(req.body?.password || ''), user.passwordHash))) return fail(res, 401, 'INVALID_CREDENTIALS', 'Email or password is incorrect.');
  await establishUserSession(req, user);
  return res.json({ user: { id: user._id, name: user.name, email: user.email } });
});

router.post('/auth/google', async (req, res) => {
  if (!process.env.GOOGLE_CLIENT_ID) return fail(res, 503, 'GOOGLE_UNAVAILABLE', 'Google sign-in is not configured.');
  try {
    const ticket = await googleClient.verifyIdToken({ idToken: String(req.body?.credential || ''), audience: process.env.GOOGLE_CLIENT_ID });
    const payload = ticket.getPayload();
    if (!payload?.email || payload.email_verified !== true) return fail(res, 401, 'GOOGLE_IDENTITY_INVALID', 'Google did not provide a verified email.');
    const user = await User.findOneAndUpdate(
      { $or: [{ googleSubject: payload.sub }, { email: payload.email.toLowerCase() }] },
      { $set: { googleSubject: payload.sub, name: payload.name || payload.email.split('@')[0], email: payload.email.toLowerCase() } },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );
    await establishUserSession(req, user);
    return res.json({ user: { id: user._id, name: user.name, email: user.email } });
  } catch { return fail(res, 401, 'GOOGLE_IDENTITY_INVALID', 'Google sign-in could not be verified.'); }
});

router.get('/auth/me', requireAuth, async (req, res) => {
  const user = await User.findById(req.session.userId);
  if (!user) return fail(res, 401, 'AUTH_REQUIRED', 'Please sign in to continue.');
  return res.json({ user: { id: user._id, name: user.name, email: user.email } });
});

router.post('/auth/logout', (req, res) => req.session.destroy(() => {
  res.clearCookie('mi.sid');
  res.json({ ok: true });
}));

router.get('/problems/counts', requireAuth, async (_req, res) => {
  const counts = await Problem.aggregate([{ $match: { active: true } }, { $group: { _id: '$difficulty', count: { $sum: 1 } } }]);
  return res.json({ counts: Object.fromEntries(difficulties.map(d => [d, counts.find(x => x._id === d)?.count || 0])) });
});

router.post('/sessions', requireAuth, async (req, res) => {
  const durationMinutes = Number(req.body?.durationMinutes);
  if (![45, 60, 90].includes(durationMinutes)) return fail(res, 400, 'INVALID_DURATION', 'Choose 45, 60, or 90 minutes.');
  const pools = {};
  for (const difficulty of difficulties) {
    const options = await Problem.find({ difficulty, active: true }).select('_id').lean();
    if (!options.length) return fail(res, 503, 'QUESTION_BANK_INCOMPLETE', `The ${difficulty} question bank is not ready.`);
    pools[difficulty] = options;
  }
  const assignments = chooseAssignments(pools, cryptoRandomInt);
  const startedAt = new Date();
  const session = await InterviewSession.create({ userId: req.session.userId, durationMinutes, startedAt, deadlineAt: new Date(startedAt.getTime() + durationMinutes * 60000), assignments });
  return sendSession(req, res, session);
});

router.get('/sessions', requireAuth, async (req, res) => {
  const sessions = await InterviewSession.find({ userId: req.session.userId }).sort({ createdAt: -1 }).limit(50);
  for (const session of sessions) await resolveExpiry(session);
  return res.json({ sessions: sessions.map(session => ({ id: session._id, durationMinutes: session.durationMinutes, startedAt: session.startedAt, deadlineAt: session.deadlineAt, finalizedAt: session.finalizedAt, status: session.status, score: session.status === 'active' ? null : scoreSession(session.assignments), problems: session.assignments.map(a => ({ difficulty: a.difficulty, status: a.submissionStatus })) })) });
});

router.get('/sessions/:id', requireAuth, async (req, res) => {
  const session = await getOwnedSession(req, res);
  if (session) await sendSession(req, res, session);
});

router.get('/sessions/:id/review', requireAuth, async (req, res) => {
  const session = await getOwnedSession(req, res);
  if (!session) return;
  await resolveExpiry(session);
  if (session.status === 'active') return fail(res, 409, 'SESSION_STILL_ACTIVE', 'Finish the interview before viewing answers.');
  await sendSession(req, res, session, true);
});

router.post('/sessions/:id/finish', requireAuth, async (req, res) => {
  const session = await getOwnedSession(req, res);
  if (!session) return;
  await resolveExpiry(session);
  if (session.assignments.some(assignment => assignment.submissionStatus === 'running')) return fail(res, 409, 'SUBMISSION_PENDING', 'Wait for the latest solution check to finish before ending the interview.');
  if (session.status === 'active') await finalize(session, 'completed');
  await sendSession(req, res, session, true);
});

router.post('/sessions/:id/problems/:problemId/submissions', requireAuth, async (req, res) => {
  const session = await getOwnedSession(req, res);
  if (!session) return;
  await resolveExpiry(session);
  if (session.status !== 'active' || Date.now() >= session.deadlineAt.getTime()) return fail(res, 409, 'SESSION_FINISHED', 'This interview has ended.');
  const sourceCode = String(req.body?.sourceCode || '');
  if (!sourceCode.trim() || sourceCode.length > 50000) return fail(res, 400, 'INVALID_SOLUTION', 'Enter a solution under 50,000 characters.');
  const assignment = session.assignments.find(a => String(a.problemId) === req.params.problemId);
  if (!assignment) return fail(res, 404, 'PROBLEM_NOT_ASSIGNED', 'That problem is not part of this interview.');
  const submittedAt = new Date();
  const submissionId = randomUUID();
  assignment.latestSource = sourceCode;
  assignment.latestSubmissionId = submissionId;
  assignment.submittedAt = submittedAt;
  assignment.submissionStatus = 'running';
  assignment.providerMessage = null;
  await session.save();
  try {
    const problem = await Problem.findById(assignment.problemId).select('+hiddenTests');
    const result = await evaluateJavaScript(sourceCode, problem.hiddenTests);
    const latestSession = await InterviewSession.findOne({ _id: session._id, userId: req.session.userId });
    const latestAssignment = latestSession.assignments.find(item => String(item.problemId) === req.params.problemId);
    if (latestAssignment?.latestSubmissionId === submissionId) {
      latestAssignment.passedTests = result.passed;
      latestAssignment.totalTests = result.total;
      latestAssignment.evaluatedAt = new Date();
      latestAssignment.submissionStatus = result.state;
      latestAssignment.providerMessage = result.message;
      await latestSession.save();
      await resolveExpiry(latestSession);
    }
    return res.json({ submission: { status: assignment.submissionStatus, passedTests: result.passed, totalTests: result.total, message: result.message } });
  } catch (error) {
    const latestSession = await InterviewSession.findOne({ _id: session._id, userId: req.session.userId });
    const latestAssignment = latestSession?.assignments.find(item => String(item.problemId) === req.params.problemId);
    const message = error.status === 503 ? error.message : 'Evaluation could not complete. Please try again.';
    if (latestAssignment?.latestSubmissionId === submissionId) {
      latestAssignment.submissionStatus = 'error';
      latestAssignment.evaluatedAt = new Date();
      latestAssignment.providerMessage = message;
      const problem = await Problem.findById(latestAssignment.problemId).select('+hiddenTests');
      latestAssignment.totalTests = problem?.hiddenTests?.length || 0;
      latestAssignment.passedTests = 0;
      await latestSession.save();
      await resolveExpiry(latestSession);
    }
    return fail(res, error.status || 502, error.code || 'EVALUATION_FAILED', message);
  }
});

export { router, requireAuth };
