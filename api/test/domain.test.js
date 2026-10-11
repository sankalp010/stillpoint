import test from 'node:test';
import assert from 'node:assert/strict';
import { chooseAssignments, scoreSession, serializeInterview } from '../src/domain.js';

test('chooses exactly one problem at each difficulty and can be deterministic', () => {
  const pools = {
    easy: [{ _id: 'e1' }, { _id: 'e2' }],
    medium: [{ _id: 'm1' }, { _id: 'm2' }],
    hard: [{ _id: 'h1' }, { _id: 'h2' }],
  };
  const chosen = chooseAssignments(pools, max => max - 1);
  assert.deepEqual(chosen.map(item => item.difficulty), ['easy', 'medium', 'hard']);
  assert.deepEqual(chosen.map(item => item.problemId), ['e2', 'm2', 'h2']);
  assert.equal(new Set(chosen.map(item => item.problemId)).size, 3);
});

test('selection fails clearly if a difficulty has no eligible problems', () => {
  assert.throws(() => chooseAssignments({ easy: [{ _id: 'e1' }], medium: [], hard: [{ _id: 'h1' }] }), /No eligible medium/);
});

test('score gives equal, deterministic credit for each fully accepted problem', () => {
  const assignments = ['accepted', 'incorrect', 'not_submitted'].map(submissionStatus => ({ submissionStatus }));
  assert.equal(scoreSession(assignments), 33);
  assignments[1].submissionStatus = 'accepted';
  assert.equal(scoreSession(assignments), 67);
  assignments[2].submissionStatus = 'accepted';
  assert.equal(scoreSession(assignments), 100);
});

test('active interview response does not expose hidden tests, answers, or explanations', () => {
  const problem = { _id: 'p1', title: 'Hidden', difficulty: 'easy', topics: [], prompt: 'Do it', constraints: [], examples: [], starterCode: 'function solve() {}', hiddenTests: ['secret'], referenceAnswer: 'secret answer', explanation: 'secret explanation' };
  const session = { _id: 's1', durationMinutes: 45, startedAt: new Date(), deadlineAt: new Date(), finalizedAt: null, status: 'active', assignments: [{ problemId: 'p1', difficulty: 'easy', submissionStatus: 'not_submitted', latestSource: '' }] };
  const serialized = serializeInterview(session, [problem]);
  assert.equal(serialized.problems[0].referenceAnswer, undefined);
  assert.equal(serialized.problems[0].explanation, undefined);
  assert.equal(serialized.problems[0].hiddenTests, undefined);
  assert.equal(serialized.score, null);
});

test('completed review releases reference answer and explanation', () => {
  const problem = { _id: 'p1', title: 'Hidden', difficulty: 'easy', topics: [], prompt: 'Do it', constraints: [], examples: [], starterCode: 'function solve() {}', referenceAnswer: 'reference', explanation: 'reasoning' };
  const session = { _id: 's1', durationMinutes: 45, startedAt: new Date(), deadlineAt: new Date(), finalizedAt: new Date(), status: 'completed', assignments: [{ problemId: 'p1', difficulty: 'easy', submissionStatus: 'accepted', latestSource: '' }] };
  const serialized = serializeInterview(session, [problem], true);
  assert.equal(serialized.problems[0].referenceAnswer, 'reference');
  assert.equal(serialized.problems[0].explanation, 'reasoning');
  assert.equal(serialized.score, 33);
});
