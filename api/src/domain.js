export const difficulties = ['easy', 'medium', 'hard'];

export function chooseAssignments(pools, randomInt = max => Math.floor(Math.random() * max)) {
  return difficulties.map(difficulty => {
    const options = pools[difficulty] || [];
    if (!options.length) throw new Error(`No eligible ${difficulty} problems.`);
    const index = randomInt(options.length);
    return { problemId: options[index]._id, difficulty };
  });
}

export function scoreSession(assignments) {
  return Math.round(assignments.filter(assignment => assignment.submissionStatus === 'accepted').length * 100 / 3);
}

export function publicProblem(problem) {
  return { id: problem._id, title: problem.title, difficulty: problem.difficulty, topics: problem.topics, prompt: problem.prompt, constraints: problem.constraints, examples: problem.examples, starterCode: problem.starterCode, source: problem.source, sourceUrl: problem.sourceUrl, license: problem.license };
}

export function serializeInterview(session, problems, revealAnswers = false) {
  return {
    id: session._id,
    durationMinutes: session.durationMinutes,
    startedAt: session.startedAt,
    deadlineAt: session.deadlineAt,
    finalizedAt: session.finalizedAt,
    status: session.status,
    score: session.status === 'active' ? null : scoreSession(session.assignments),
    problems: session.assignments.map(assignment => {
      const problem = problems.find(item => String(item._id) === String(assignment.problemId));
      if (!problem) return null;
      return {
        ...publicProblem(problem),
        submission: { status: assignment.submissionStatus, passedTests: assignment.passedTests, totalTests: assignment.totalTests, submittedAt: assignment.submittedAt, sourceCode: assignment.latestSource, message: assignment.providerMessage },
        ...(revealAnswers && session.status !== 'active' ? { referenceAnswer: problem.referenceAnswer, explanation: problem.explanation } : {}),
      };
    }).filter(Boolean),
  };
}
