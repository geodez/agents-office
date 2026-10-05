// Agents Office — the department lead interviews the owner (Beta).
// In the chat with a department lead, say "set up". The lead asks five questions, one at a time,
// about how that department works here, then writes it down for the team:
//   · a brief for each agent in the department   → <brain>/Agents Office/agents.json
//   · one skill for the job the owner described  → <brain>/Agents Office/skills/<name>/
// Nothing is written until the last answer. "skip" skips a question, "done" finishes early,
// "cancel" throws the answers away. State lives in data/interviews.json while an interview runs.
import fs from 'node:fs';
import path from 'node:path';

const START = /^\s*(set\s?-?up|onboard(ing)?|interview\s+me|teach\s+(you|the\s+team)|let'?s\s+(set\s?up|start)|start\s+the\s+interview|настроить|настройка|начать\s+настройку)\b/i;
const CANCEL = /^\s*(cancel|stop|never\s?mind|forget\s+it|отмена|отмени|стоп)\s*[.!]?\s*$/i;
const SKIP = /^\s*(skip|pass|next|пропустить|дальше)\s*[.!]?\s*$/i;
const DONE = /^\s*(done|finish|that'?s\s+(it|all|enough)|enough|готово|закончить|достаточно)\s*[.!]?\s*$/i;

export const QUESTIONS = [
  { k: 'what', q: d => `Сначала: чем именно занимается отдел «${d}»? Что поступает на вход, что получается на выходе и для кого?` },
  { k: 'job', q: d => `Опишите от начала до конца самую частую задачу отдела «${d}»: с чего она начинается, что вы проверяете и как выглядит готовый результат?` },
  { k: 'good', q: () => `Как выглядит хороший результат? Вставьте удачный пример или опишите его. Если есть шаблон, перечислите его разделы.` },
  { k: 'never', q: () => `Чего нельзя допускать? Назовите красные линии, действия, которые всегда ждут вашего одобрения, и ошибки, которые не должны повториться.` },
  { k: 'tools', q: () => `Какие инструменты и системы вы используете и какие люди участвуют в процессе? Напишите «пропустить», если добавить нечего.` },
];

export const stateFile = dataDir => path.join(dataDir, 'interviews.json');
const load = dataDir => { try { return JSON.parse(fs.readFileSync(stateFile(dataDir), 'utf8')); } catch { return {}; } };
const save = (dataDir, s) => { fs.mkdirSync(dataDir, { recursive: true }); fs.writeFileSync(stateFile(dataDir), JSON.stringify(s, null, 2)); };
export const active = (dataDir, dept) => !!load(dataDir)[dept];

/** Is this department set up yet? True when any of its agents has a brief or a skill of the owner's. */
export function isSetUp(agents, skills, dept) {
  return agents.some(a => a.department === dept && (a.brief || skills.forAgent(a).some(s => s.source === 'brain')));
}

const progress = (i, d) => `**Вопрос ${i + 1} из ${QUESTIONS.length}.** ${QUESTIONS[i].q(d)}`;

/**
 * One chat turn. Returns { reply, wrote? } when the interview handles it, or null to let the normal chat answer.
 * ctx: { dept, deptName, lead, agents (this dept), connected (names), brainPath, dataDir, ask, afterWrite }
 */
export async function handle(text, ctx) {
  const { dept, deptName: d, lead, dataDir } = ctx;
  const st = load(dataDir); const cur = st[dept];
  if (!cur) {
    if (!START.test(text)) return null;
    st[dept] = { step: 0, answers: [], startedAt: Date.now() }; save(dataDir, st);
    return { reply: `Хорошо. Я задам пять вопросов о работе отдела «${d}», по одному за раз. Отвечайте своими словами. «Пропустить» — перейти дальше, «готово» — закончить раньше, «отмена» — удалить ответы. До завершения ничего не сохраняется.\n\n${progress(0, d)}` };
  }
  if (CANCEL.test(text)) { delete st[dept]; save(dataDir, st); return { reply: `Отменено. Ничего не сохранено. Напишите «настроить», когда захотите начать снова.` }; }
  let finish = false;
  if (DONE.test(text)) { if (!cur.answers.some(Boolean)) { delete st[dept]; save(dataDir, st); return { reply: `Сохранять пока нечего. Напишите «настроить», когда будете готовы.` }; } finish = true; }
  else { cur.answers.push(SKIP.test(text) ? '' : String(text).trim()); cur.step = cur.answers.length; if (cur.step >= QUESTIONS.length) finish = true; }
  if (!finish) { save(dataDir, st); return { reply: `Записал.\n\n${progress(cur.step, d)}` }; }
  delete st[dept]; save(dataDir, st); // whatever happens next, the interview is over
  const answers = QUESTIONS.map((q, i) => ({ k: q.k, q: q.q(d), a: cur.answers[i] || '' })).filter(x => x.a);
  const wrote = await writeUp(answers, ctx);
  const briefs = wrote.briefs.map(b => `${ctx.agents.find(a => a.id === b.id)?.name || b.id}`).join(', ');
  const lines = [`Готово. Для отдела «${d}» сохранено:`];
  if (wrote.briefs.length) lines.push(`- Бриф для ${briefs} в \`${wrote.agentsFile}\`.`);
  if (wrote.skill) lines.push(`- Навык **${wrote.skill.name}**${wrote.skill.description ? ' (' + wrote.skill.description + ')' : ''} для ${wrote.skill.agents.map(id => ctx.agents.find(a => a.id === id)?.name || id).join(', ')} в \`${wrote.skill.dir}\`${wrote.skill.template ? ' с шаблоном' : ''}.`);
  if (!wrote.briefs.length && !wrote.skill) lines.push(`- В ответах не хватило данных, поэтому ничего не сохранено. Напишите «настроить», чтобы попробовать снова.`);
  if (wrote.problems.length) lines.push(`- Пропущено: ${wrote.problems.join('; ')}.`);
  lines.push(`Настройки применятся со следующей задачи. Выберите «${d}» на панели и введите: «${wrote.tryTask || 'описанная задача для реального клиента'}». Если результат нужно исправить, напишите «доработай: …».`);
  return { reply: lines.join('\n'), wrote };
}

/** Claude turns the answers into briefs + one skill, and they are written into the brain. */
export async function writeUp(answers, ctx) {
  const { dept, deptName: d, lead, agents, connected = [], brainPath, ask, business = '' } = ctx;
  const roster = agents.map(a => `- ${a.id} · ${a.name}${a.lead ? ' (lead)' : ''} · ${a.role} · ${a.does}`).join('\n');
  const system = `You turn an owner's interview answers into working instructions for the AI agents of the ${d} department of ${business || 'their business'}. Write every user-facing field in natural Russian, preserving product names and identifiers. The skill name must remain short kebab-case Latin. Return ONLY a JSON object, no prose, no code fences.`;
  const user = `Agents in ${d} (id · name · role · what they do):\n${roster}\n\nConnected tools: ${connected.join(', ') || 'none'}\n\nThe owner's answers:\n` +
    answers.map(x => `Q: ${x.q}\nA: ${x.a}`).join('\n\n') + '\n\n' +
    'Write:\n' +
    '1. "briefs": for each agent whose work the answers touch (the lead always), a brief — the owner\'s standing instructions to that agent in 2–6 short sentences, second person, concrete, in the owner\'s terms. Tone, red lines, who to escalate to, which tool to use. Only what the owner actually said or clearly implied; never invent a process. Skip agents the answers say nothing about.\n' +
    '2. "skill": ONE skill for the job the owner described most (question 2), or null if they did not describe a job. name = short kebab-case; description = one line; agents = the ids that do this job (1–3); body = Markdown: a heading, then the first line saying when this skill applies, then "## Steps" (numbered, what to read or check first, by note name if the owner named one), "## The shape" (the sections of the finished thing), "## Rules" (short, absolute, from the red lines). Under 3000 characters. template = the finished thing\'s skeleton in Markdown with the owner\'s sections and placeholders in {braces}, or "" if the owner gave no shape.\n' +
    '3. "try": one task, under 90 characters, the owner could type to test this, in their terms.\n' +
    'Return: {"briefs":[{"id":"<agent id>","brief":"<text>"}],"skill":{"name":"","description":"","agents":[],"body":"","template":""}|null,"try":""}';
  let j = null; try { const t = await ask(system, user, { maxTokens: 3000, timeout: 180000 }); const s = t.replace(/```json|```/g, ''); j = JSON.parse(s.slice(s.indexOf('{'), s.lastIndexOf('}') + 1)); } catch (e) { j = { briefs: [], skill: null, try: '', error: e.message }; }
  const ids = new Set(agents.map(a => a.id)); const problems = [];
  if (j.error) problems.push('Claude не вернул пригодные инструкции (' + j.error.split('\n')[0] + ')');
  // briefs → <brain>/Agents Office/agents.json (merged: other agents and other fields untouched)
  const briefs = (Array.isArray(j.briefs) ? j.briefs : []).filter(b => b && ids.has(b.id) && String(b.brief || '').trim()).map(b => ({ id: b.id, brief: String(b.brief).trim().slice(0, 2000) }));
  for (const b of (Array.isArray(j.briefs) ? j.briefs : [])) if (b && b.id && !ids.has(b.id)) problems.push(`агента «${b.id}» нет в отделе «${d}»`);
  const agentsFile = path.join(brainPath, 'Agents Office', 'agents.json');
  if (briefs.length) {
    fs.mkdirSync(path.dirname(agentsFile), { recursive: true });
    let doc = { agents: [] }; try { const x = JSON.parse(fs.readFileSync(agentsFile, 'utf8')); if (Array.isArray(x?.agents)) doc = x; } catch {}
    for (const b of briefs) { const e = doc.agents.find(x => x && x.id === b.id); if (e) e.brief = b.brief; else doc.agents.push({ id: b.id, brief: b.brief }); }
    fs.writeFileSync(agentsFile, JSON.stringify(doc, null, 2) + '\n');
  }
  // the skill → <brain>/Agents Office/skills/<name>/SKILL.md (+ template.md)
  let skill = null;
  if (j.skill && typeof j.skill === 'object' && String(j.skill.body || '').trim()) {
    const name = String(j.skill.name || `${dept}-job`).toLowerCase().replace(/[^a-z0-9._-]+/g, '-').replace(/^-|-$/g, '') || `${dept}-job`;
    let bound = (Array.isArray(j.skill.agents) ? j.skill.agents : []).filter(id => ids.has(id));
    if (!bound.length) bound = [lead.id];
    const dir = path.join(brainPath, 'Agents Office', 'skills', name);
    if (fs.existsSync(path.join(dir, 'SKILL.md'))) { const bak = path.join(dir, `SKILL.md.backup-${Date.now()}`); fs.copyFileSync(path.join(dir, 'SKILL.md'), bak); problems.push(`навык ${name} уже существовал — прежний SKILL.md сохранён рядом как ${path.basename(bak)}`); }
    fs.mkdirSync(dir, { recursive: true });
    const description = String(j.skill.description || '').replace(/\n/g, ' ').trim().slice(0, 160);
    const body = String(j.skill.body).trim().slice(0, 6000);
    fs.writeFileSync(path.join(dir, 'SKILL.md'), `---\nname: ${name}\ndescription: ${description}\nagents: [${bound.join(', ')}]\n---\n${body}\n`);
    const template = String(j.skill.template || '').trim();
    if (template) fs.writeFileSync(path.join(dir, 'template.md'), template.slice(0, 4000) + '\n');
    skill = { name, description, agents: bound, dir: path.relative(process.cwd(), dir), template: !!template };
  }
  if (ctx.afterWrite) ctx.afterWrite();
  return { briefs, skill, agentsFile: path.relative(process.cwd(), agentsFile), problems, tryTask: String(j.try || '').trim().slice(0, 90) };
}
