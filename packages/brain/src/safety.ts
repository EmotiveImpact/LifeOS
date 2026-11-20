/**
 * Crisis-language check. Runs on the phone before anything else, in every
 * channel (typed, spoken, lesson tell-back, Talk filing), and never calls a
 * model. A miss costs far more than a false alarm, so the rules lean towards
 * flagging; the case set in tools/evals/crisis/cases.jsonl pins both sides.
 *
 * Support numbers match the board's `support` screen (UK): Samaritans,
 * Shout, NHS 111 and 999, plus the National Domestic Abuse Helpline when
 * someone says they are not safe.
 */
export type CrisisKind = 'suicide' | 'self-harm' | 'overdose' | 'someone-else' | 'unsafe';
export type CrisisLevel = 'concern' | 'urgent';
export type CrisisSignal = { level: CrisisLevel; kinds: CrisisKind[]; matched: string };
export type SupportLine = { id: 'emergency' | 'samaritans' | 'shout' | 'nhs111' | 'domestic-abuse'; name: string; detail: string; action: 'call' | 'text'; href: string };
export type SupportReply = { answer: string; detail: string; lines: SupportLine[]; route: '/states/support'; level: CrisisLevel; kinds: CrisisKind[] };

export const CRISIS_RULES_VERSION = 1;
const MAX_SCAN = 24000;

const LINES: Record<SupportLine['id'], SupportLine> = {
  emergency: { id: 'emergency', name: 'Emergency', detail: 'Call 999 if you are in danger right now', action: 'call', href: 'tel:999' },
  samaritans: { id: 'samaritans', name: 'Samaritans', detail: 'Call 116 123, free, any time', action: 'call', href: 'tel:116123' },
  shout: { id: 'shout', name: 'Shout', detail: 'Text SHOUT to 85258', action: 'text', href: 'sms:85258?body=SHOUT' },
  nhs111: { id: 'nhs111', name: 'NHS 111', detail: 'Choose the mental health option', action: 'call', href: 'tel:111' },
  'domestic-abuse': { id: 'domestic-abuse', name: 'National Domestic Abuse Helpline', detail: 'Call 0808 2000 247, free, any time', action: 'call', href: 'tel:08082000247' },
};

const LEET: Record<string, string> = { '0': 'o', '1': 'i', '3': 'e', '4': 'a', '5': 's', '7': 't', '@': 'a', $: 's', '!': 'i', '*': 'i', '|': 'i' };
/** Lower case, straight apostrophes, symbols-for-letters undone (k*ll,
 * su1cidal), spaced letters joined (s u i c i d e), stretched letters cut to
 * two (dieeee), and apostrophes restored in speech-style text (cant, dont). */
export function normaliseForSafety(text: string): string {
  return text.slice(0, MAX_SCAN).normalize('NFKC').toLowerCase()
    .replace(/[​-‍⁠﻿]/g, '')
    .replace(/[’‘ʼ`´]/g, "'")
    .replace(/(?<=[a-z])[013457@$!*|](?=[a-z])/g, c => LEET[c])
    .replace(/(?<![a-z0-9])[$@](?=[a-z]{3})/g, c => LEET[c])
    .replace(/\b(?:[a-z] ){3,}[a-z]\b/g, m => m.replace(/ /g, ''))
    .replace(/([a-z])\1{2,}/g, '$1$1')
    .replace(/\b(can|don|won|isn|wasn|didn|doesn|couldn|aren|ain)t\b/g, "$1't")
    .replace(/\bim\b/g, "i'm").replace(/\bive\b/g, "i've").replace(/\bits\b/g, "it's")
    .replace(/\s+/g, ' ');
}

/** Everyday phrases that borrow crisis words. Removed before matching. */
const IDIOMS = [
  /\bkilling (?:my ?self|me) (?:laughing|with laughter|working|trying|at (?:work|the gym)|over (?:this|it|work))\b/g,
  /\bdie my hair\b/g,
  /\bsuicide (?:squad|doors?|drills?|sprints?|runs?|bomb(?:er|ers|ing|ings)?|prevention|awareness)\b/g,
  /\boverdos(?:e|ed|ing) on (?:chocolate|sugar|caffeine|coffee|netflix|tv|telly|cake|sweets|carbs|crisps|pizza|biscuits|catnip|mince pies|box ?sets?)\b/g,
  /\bmade my ?self sick (?:eating|from|with (?:worry|laughter))\b/g,
];

type Rule = { re: RegExp; kind: CrisisKind; level: CrisisLevel };
const rule = (kind: CrisisKind, level: CrisisLevel, source: string): Rule => ({ kind, level, re: new RegExp(source, 'g') });
const END = "(?= ?$|[.!?,;:]| any ?more| like this| living| honestly| now| tonight)";
const PILLS = '(?:pills|tablets|meds|medication|medicine|paracetamol|painkillers|sleeping pills|antidepressants|ibuprofen|codeine|insulin)';
const LOTS = '(?:all|a lot|loads|lots|too many|way too many|a (?:whole |full )?(?:bottle|box|pack|packet|strip)|the (?:whole |full )?(?:bottle|box|pack|packet)|handfuls?|a handful|every one|double|triple)';
const OTHER = '(?:friend|brother|sister|mum|mom|dad|son|daughter|partner|wife|husband|boyfriend|girlfriend|flatmate|housemate|colleague|cousin|child|kid|mate|parent|grandad|grandma|nan|uncle|aunt|aunty)';

/** Someone else at risk. Checked first so its wording wins and a self rule
 * inside the same phrase ("my brother is suicidal") is not counted as you. */
const OTHERS: Rule[] = [
  rule('someone-else', 'concern', '\\bkill(?:ing|ed|s)? (?:him|her|them)sel(?:f|ves)\\b'),
  rule('someone-else', 'concern', '\\b(?:end|ending|ended|take|taking|took) (?:his|her|their) (?:own )?life\\b'),
  rule('someone-else', 'concern', '\\b(?:hurting|harming|cutting|starving) (?:him|her|them)sel(?:f|ves)\\b'),
  rule('someone-else', 'concern', `\\b(?:he|she|they|who|${OTHER}) (?:is|are|'s|'re|was|were|has been|have been|seems?|might be|may be|keeps?|is being) (?:\\w+ )?(?:suicidal|self[- ]?harming|talking about (?:suicide|dying|killing))\\b`),
  rule('someone-else', 'concern', '\\b(?:he|she|they) (?:wants?|wanted|is going|are going|was going) to (?:die|end it all)\\b'),
  rule('someone-else', 'concern', '\\b(?:lost|losing) (?:my|a|his|her|their) \\w+ to suicide\\b'),
  rule('someone-else', 'urgent', `\\b(?:he|she|they|${OTHER}) (?:has|have|'s|just) (?:taken|took|swallowed) (?:an overdose|${LOTS} (?:of )?(?:(?:his|her|their|the) )?(?:\\w+ )?${PILLS})\\b`),
];

const SELF: Rule[] = [
  // Urgent: a plan, a method, the means to hand, a time, or harm already done.
  rule('suicide', 'urgent', "\\b(?:going to|gonna|about to|ready to|decided to|plan(?:ning)? to|plan(?:ning)? how to|figur(?:ed|ing) out how to|i'll|i will) (?:kill my ?self|end (?:my life|it all)|take my (?:own )?life|hang my ?self)\\b"),
  rule('suicide', 'urgent', '\\b(?:end|ending|kill|killing) (?:it all|my life|it|my ?self) (?:tonight|today|right now|this weekend|tomorrow)\\b'),
  rule('suicide', 'urgent', '\\b(?:hang|hanging) my ?self\\b'),
  rule('suicide', 'urgent', '\\bjump(?:ing)? (?:off|from) (?:a |the )?(?:bridge|building|roof|cliff|balcony|car park|tower)\\b'),
  rule('suicide', 'urgent', '\\b(?:jump|jumping|step|stepping|throw my ?self|walk) (?:in front of|under) (?:a |the )?(?:train|tube|bus|lorry|car|traffic)\\b'),
  rule('suicide', 'urgent', '\\bslit(?:ting)? my wrists?\\b'),
  rule('suicide', 'urgent', '\\bsuicide (?:note|letter|plan)\\b'),
  rule('suicide', 'urgent', "\\b(?:i have|i've got|got) (?:the |a |my )?(?:rope|knife|blade|gun) (?:ready|here|with me)\\b"),
  rule('overdose', 'urgent', `\\b(?:taken|took|swallowed|necked|downed) ${LOTS} (?:of )?(?:(?:my|the|these|those) )?(?:\\w+ )?${PILLS}\\b`),
  rule('overdose', 'urgent', "\\bi(?:'ve| have)? (?:just |already )?(?:overdosed|od'?d|took an overdose|taken an overdose)\\b"),
  rule('overdose', 'urgent', "\\b(?:going to|gonna|want to|wanna|about to|plan(?:ning)? to|decided to|ready to|i'll|i will) (?:overdose|od)\\b"),
  rule('overdose', 'urgent', `\\b(?:going to|gonna|want to|wanna|about to|plan(?:ning)? to|decided to|ready to|i'll|i will) (?:take|swallow) ${LOTS} (?:of )?(?:(?:my|the) )?(?:\\w+ )?${PILLS}\\b`),
  rule('overdose', 'urgent', `\\b(?:i have|i've got|got) (?:the |my |enough )?${PILLS} (?:ready|here|saved|stashed|lined up)\\b`),
  rule('overdose', 'urgent', `\\b(?:stockpil(?:e|ing|ed)|sav(?:e|ing|ed) up|hoard(?:ing|ed)?) (?:my |the |some )?${PILLS}\\b`),
  rule('self-harm', 'urgent', "\\b(?:cut|cutting|hurt|harmed) my ?self\\b.{0,60}\\b(?:won't stop bleeding|bleeding (?:a lot|badly|heavily)|too deep|need(?:s)? stitches)\\b"),
  // Concern: thoughts of suicide, in plain words and in slang.
  rule('suicide', 'concern', '\\bsuicid(?:e|al|ally)\\b'),
  rule('suicide', 'concern', '\\b(?:kms|sewer ?slide)\\b'),
  rule('suicide', 'concern', '\\b(?:unaliv(?:e|ing) (?:my ?self|me)|want(?:ed|ing)? to unalive)\\b'),
  rule('suicide', 'concern', '\\bkill(?:ing)? my ?self\\b'),
  rule('suicide', 'concern', '\\b(?:end|ending|ended) (?:my (?:own )?life|it all|everything)\\b'),
  rule('suicide', 'concern', '\\btak(?:e|ing) my (?:own )?life\\b'),
  rule('suicide', 'concern', '\\b(?:want|wanna|wanted|wanting|wish|ready|need) (?:to )?die{1,2}\\b'),
  rule('suicide', 'concern', '\\bwant(?:ed|ing)? to be dead\\b'),
  rule('suicide', 'concern', '\\b(?:think|thinking|thought) (?:about|of) (?:dying|ending it|not being here|not existing|not waking up)\\b'),
  rule('suicide', 'concern', "\\bwish (?:i|i'd) (?:was|were|had) (?:dead|never been born)\\b|\\bwish i'd never been born\\b|\\bwish i (?:was|were) never born\\b"),
  rule('suicide', 'concern', "\\bbetter off (?:dead|without me)\\b|\\bbetter off if i (?:was|were|wasn't|weren't) (?:here|around|gone|dead|alive)\\b|\\bbetter off if i (?:died|disappeared)\\b"),
  rule('suicide', 'concern', '\\b(?:no|any) (?:point|reason) (?:in |to |for me to |of )?(?:living|live|being alive|going on|carrying on|keep going|existing|exist)\\b'),
  rule('suicide', 'concern', "\\bwhat's the point (?:of|in) (?:living|being alive|going on|life|carrying on|anything|me)\\b"),
  rule('suicide', 'concern', '\\bnothing (?:left )?to live for\\b'),
  rule('suicide', 'concern', "\\blife(?:'s| is| s)? ?(?:not|isn't|ain't|is not) worth (?:living|it)\\b|\\bnot worth living\\b"),
  rule('suicide', 'concern', "\\bdon't want to (?:be alive|exist|wake up(?! (?:early|at|so|before|for))|go on|carry on|keep going|be here any ?more|be around any ?more)\\b"),
  rule('suicide', 'concern', "\\bdon't want to live(?= ?$|[.!?,;:]| any ?more| like this| without)"),
  rule('suicide', 'concern', "\\bdon't want to be here(?= ?$|[.!?,;:])"),
  rule('suicide', 'concern', '\\bwant (?:it all|everything|my life|life) to (?:end|be over|stop)\\b|\\bwant it all to end\\b'),
  rule('suicide', 'concern', '\\bhate (?:my )?life\\b.{0,80}\\bwant it (?:all )?to (?:end|be over)\\b'),
  rule('suicide', 'concern', `\\b(?:can't|cannot|can not) (?:go on|carry on|keep going|live like this|cope)${END}`),
  rule('suicide', 'concern', "\\b(?:can't|cannot|can not) (?:do|take|handle|stand) (?:it|this) (?:any ?more|much longer)\\b"),
  rule('suicide', 'concern', "\\b(?:i'm|i am) (?:so |really |just |completely )?(?:done with life|done living|over (?:it all|life))\\b"),
  rule('suicide', 'concern', '\\b(?:tired|sick) of (?:living|being alive|existing|life)(?! (?:in|with|at|near|on|out|off|from|abroad|here|there|alone)\\b)'),
  rule('suicide', 'concern', "\\b(?:no ?one|nobody|noone) would (?:even )?(?:miss|notice|care)(?: about)? (?:me|if i)\\b|\\b(?:miss me|care|notice) if i (?:died|was gone|were gone|disappeared|wasn't here|weren't here)\\b"),
  rule('suicide', 'concern', '\\b(?:go to sleep|fall asleep|sleep) and (?:never|not) wake up\\b|\\bnever wake up again\\b'),
  rule('suicide', 'concern', '\\bdisappear (?:forever|for good|permanently)\\b|\\b(?:vanish|disappear) and never come back\\b'),
  // Self-harm, overdose thoughts and hurting yourself through food.
  rule('self-harm', 'concern', '\\bself[- ]?harm(?:ing|ed|s)?\\b|\\bself[- ]?injur(?:y|e|ing|ies)\\b'),
  rule('self-harm', 'concern', '\\b(?:want|wanna|going|gonna|urges?|need|thinking about|think about|thought about|keep|keeps|kept|started|been)(?: to)? (?:hurt|hurting|harm|harming|cut|cutting|burn|burning) my ?self\\b'),
  rule('self-harm', 'concern', '(?<!accidentally )\\b(?:hurt|hurting|harm|harmed|harming|cut|cutting|burn|burnt|burned|burning) my ?self\\b(?! (?:shaving|cooking|chopping|on (?:a|the|my|some|an)|at (?:the|work|home)|playing|running|lifting|training|in the|during|while|doing|by accident|accidentally|falling|when|with (?:the|a) (?:knife|iron|kettle|pan|oven)))'),
  rule('self-harm', 'concern', '\\b(?:started|start|starting|back to|been|keep) cutting(?= ?$|[.!?,;:]| again| my (?:arms?|legs?|wrists?|thighs?|skin))'),
  rule('self-harm', 'concern', '\\bcut(?:ting)? my (?:arms?|legs?|wrists?|thighs?|skin)\\b'),
  rule('self-harm', 'concern', '\\bstarv(?:e|ing|ed) my ?self\\b|\\b(?:make|making|made) my ?self (?:throw up|sick|vomit|puke)\\b'),
  rule('overdose', 'concern', '\\b(?:take|taking|do|doing|thinking about|thought about) an? overdose\\b'),
  // Not safe where you are.
  rule('unsafe', 'urgent', "\\b(?:i'm not|i am not|i do ?n't feel|i don't feel|i no longer feel|i never feel) safe(?= ?$|[.!?,;:]| at home| here| with | in my (?:home|house|flat)| any ?more| right now| around (?:him|her|them))"),
  rule('unsafe', 'urgent', '\\b(?:partner|husband|wife|boyfriend|girlfriend|ex|dad|mum|mom|father|mother|stepdad|stepmum|flatmate|he|she) (?:hits|hit|beats|beat|punches|punched|kicks|kicked|chokes|choked|strangles|strangled|slaps|slapped) me\\b'),
  rule('unsafe', 'urgent', '\\bthreaten(?:s|ed|ing)? to (?:kill|hurt|stab|strangle|hit) me\\b'),
  rule('unsafe', 'urgent', "\\b(?:scared|afraid|frightened|terrified|worried) (?:that )?(?:he|she|they)(?:'s|'ll|'re| is| will| are)? (?:going to |gonna )?(?:kill|hurt|hit) me\\b"),
  rule('unsafe', 'urgent', "\\bsomeone (?:is |'s )?(?:trying to|going to) (?:hurt|kill) me\\b"),
];

const order: CrisisKind[] = ['suicide', 'overdose', 'self-harm', 'someone-else', 'unsafe'];
/** Returns null when nothing in the text suggests a crisis. */
export function detectCrisis(text: string): CrisisSignal | null {
  if (!text || !text.trim()) return null;
  let normal = normaliseForSafety(text);
  for (const idiom of IDIOMS) normal = normal.replace(idiom, ' ');
  const hits: { kind: CrisisKind; level: CrisisLevel; at: number; text: string }[] = [];
  const spans: [number, number][] = [];
  for (const { re, kind, level } of OTHERS) for (const m of normal.matchAll(re)) { hits.push({ kind, level, at: m.index, text: m[0] }); spans.push([m.index, m.index + m[0].length]); }
  for (const { re, kind, level } of SELF) for (const m of normal.matchAll(re)) {
    if (spans.some(([start, end]) => m.index >= start && m.index < end)) continue;
    hits.push({ kind, level, at: m.index, text: m[0] });
  }
  if (!hits.length) return null;
  const level: CrisisLevel = hits.some(hit => hit.level === 'urgent') ? 'urgent' : 'concern';
  const kinds = order.filter(kind => hits.some(hit => hit.kind === kind));
  const first = hits.filter(hit => hit.level === level).sort((a, b) => a.at - b.at)[0];
  return { level, kinds, matched: first.text.trim() };
}

/** The fixed reply. Never written by a model; a model may only add warmth
 * around the support screen later, never replace it. */
export function supportResponse(signal: CrisisSignal): SupportReply {
  const base = { route: '/states/support' as const, level: signal.level, kinds: signal.kinds };
  const self = signal.kinds.some(kind => kind === 'suicide' || kind === 'self-harm' || kind === 'overdose');
  if (signal.kinds.includes('unsafe') && !self) return {
    ...base,
    answer: 'If you are in danger right now, call 999. The National Domestic Abuse Helpline is free and open any time on 0808 2000 247.',
    detail: 'If you call 999 from a mobile and can’t speak, stay on the line and press 55 when asked, so the police know it’s a real emergency. Samaritans are there too on 116 123, any time. You don’t have to sort this alone.',
    lines: [LINES.emergency, LINES['domestic-abuse'], LINES.samaritans, LINES.shout],
  };
  if (!self) return {
    ...base,
    answer: 'If they are in danger right now, call 999. Samaritans are free and open any time on 116 123, for them or for you, and Shout is on text: SHOUT to 85258.',
    detail: 'If it’s safe, stay with them and ask them directly how they are. NHS 111 can advise you on what to do next: choose the mental health option.',
    lines: [LINES.emergency, LINES.samaritans, LINES.shout, LINES.nhs111],
  };
  if (signal.level === 'urgent') return {
    ...base,
    answer: 'Please get help right now. Call 999 or go to A&E if you might act on this or you have already hurt yourself. If you can, tell someone near you and stay with them.',
    detail: 'Samaritans: call 116 123, free, any time. Shout: text SHOUT to 85258. NHS 111: choose the mental health option. You don’t have to sort this alone.',
    lines: [LINES.emergency, LINES.samaritans, LINES.shout, LINES.nhs111],
  };
  return {
    ...base,
    answer: 'I’m really glad you told me. You don’t have to sort this alone. Samaritans are free and open any time on 116 123, or you can text SHOUT to 85258. If you might act on this now, call 999 or go to A&E.',
    detail: 'NHS 111 can help too: choose the mental health option. If you can, tell someone you trust how you’re feeling.',
    lines: [LINES.samaritans, LINES.shout, LINES.nhs111, LINES.emergency],
  };
}
