let javascriptLanguageId;

function baseUrl() {
  return (process.env.JUDGE0_URL || '').replace(/\/$/, '');
}

async function judge0(path, options = {}) {
  const url = baseUrl();
  if (!url) throw Object.assign(new Error('Code evaluation is not configured yet.'), { status: 503, code: 'EVALUATOR_UNAVAILABLE' });
  const headers = { 'Content-Type': 'application/json', ...(process.env.JUDGE0_AUTH_TOKEN ? { 'X-Auth-Token': process.env.JUDGE0_AUTH_TOKEN } : {}) };
  const response = await fetch(`${url}${path}`, { ...options, headers: { ...headers, ...options.headers }, signal: AbortSignal.timeout(12000) });
  if (!response.ok) throw new Error(`Code runner returned HTTP ${response.status}.`);
  return response.json();
}

async function getLanguageId() {
  if (process.env.JUDGE0_LANGUAGE_ID) return Number(process.env.JUDGE0_LANGUAGE_ID);
  if (javascriptLanguageId) return javascriptLanguageId;
  const languages = await judge0('/languages');
  const match = languages.find(item => /javascript|node\.js/i.test(item.name || ''));
  if (!match) throw new Error('Judge0 does not list a JavaScript runtime.');
  javascriptLanguageId = match.id;
  return javascriptLanguageId;
}

const normalize = value => Array.isArray(value) ? value.map(normalize) : value && typeof value === 'object' ? Object.fromEntries(Object.keys(value).sort().map(k => [k, normalize(value[k])])) : value;

export async function evaluateJavaScript(sourceCode, tests) {
  if (!tests.length) throw new Error('This problem has no evaluation tests.');
  const languageId = await getLanguageId();
  const wrapped = `${sourceCode}\nconst __raw=require('fs').readFileSync(0,'utf8');const __args=JSON.parse(__raw||'[]');const __solve=typeof solve==='function'?solve:null;if(!__solve)throw Error('Define function solve(...)');Promise.resolve(__solve(...__args)).then(v=>process.stdout.write(JSON.stringify(v))).catch(e=>{console.error(e&&e.message||String(e));process.exit(1)});`;
  const created = await judge0('/submissions/batch?base64_encoded=false', {
    method: 'POST', body: JSON.stringify({ submissions: tests.map(test => ({
      source_code: wrapped, language_id: languageId, stdin: JSON.stringify(test.input),
      cpu_time_limit: 2, cpu_extra_time: 1, wall_time_limit: 5, memory_limit: 128000,
    })) }),
  });
  const tokens = created.map(item => item.token).filter(Boolean);
  if (tokens.length !== tests.length) throw new Error('The code runner did not accept every test submission.');
  const deadline = Date.now() + 45000;
  let results = [];
  while (Date.now() < deadline) {
    const query = new URLSearchParams({ tokens: tokens.join(','), base64_encoded: 'false', fields: 'token,stdout,stderr,status_id,status,time,memory' });
    results = (await judge0(`/submissions/batch?${query}`)).submissions || [];
    if (results.length === tests.length && results.every(result => result.status_id > 2)) break;
    await new Promise(resolve => setTimeout(resolve, 1200));
  }
  if (results.length !== tests.length || results.some(result => result.status_id <= 2)) return { passed: 0, total: tests.length, state: 'error', message: 'Evaluation timed out. Please try again.' };
  let passed = 0;
  let message = null;
  for (let i = 0; i < results.length; i += 1) {
    const result = results[i];
    if (result.status_id === 3) {
      try {
        if (JSON.stringify(normalize(JSON.parse(result.stdout || 'null'))) === JSON.stringify(normalize(tests[i].expected))) passed += 1;
      } catch { /* malformed output is a failed test */ }
    } else if (!message) message = result.status?.description || result.stderr || 'Execution failed.';
  }
  return { passed, total: tests.length, state: passed === tests.length ? 'accepted' : (message ? 'error' : 'incorrect'), message };
}
