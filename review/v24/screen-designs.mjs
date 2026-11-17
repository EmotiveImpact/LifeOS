// The V24 compositions cover the complete board. Screen keys follow SCREENS.md.
export const compositions = {
  entry: 'welcome',
  flow: 'question where measuresetup aimnew newgoal habitnew testq',
  permission: 'signin healthprimer notifprimer micprimer camprimer calprimer devicesetup connectbank devices addperson',
  progress: 'building loadingtoday',
  moment: 'firstmove nudge morningbrief evening focus recap vantage levelup yourbirthday glimpse gotit plussuccess birthdaynudge',
  diary: 'pulse checkin mood experiment journal insights calendar routines',
  case: 'mission draft ttk doitforme gambit renewal protect healthstack decisions growth bedrooms buffer rentbuy',
  scene: 'areahome areahealth areawork household person profile aim emptytoday emptyplan emptybody',
  records: 'inbox search history missions knows memory shared children chathistory editfiled tools dates savedmeals people vault learned sources',
  conversation: 'tell ask chat coach lensask tellback sayit describeexercise fixwords',
  paper: 'understood scan docdetail txn bill',
  ledger: 'cashplan taxcheck income money subs area budget networth',
  reading: 'library lens idea recall learning teach hill drawkit teachoffer lessonready bite predict puzzle lessonrecap gaps bitedrawn teachplay',
  settings: 'customise plus settings notifs ondevice yourai appearance services privacy deleteacct subscription help legal aimodels unlock tests',
  signal: 'levels body readiness sleep load trends hrv signals stress detected sleepplan math forecast cycle fitnessage cgm basics sleepnight workoutdetail weight bmi strain zones illness breathlib provenance regularity loadtrend healthdigest blood strength habits bigfive chronotype values measures',
  fuel: 'confirm fuel mealresult cook mealplan foodday foodsearch fuelhome fuelgoal fuelprogress exerciseadd fuelplan weighin menuscan nutrients weekbudget mealtiming foodquality alcohol quicklog importfood',
  recovery: 'offline permdenied syncissue aidown forceupdate signedout connectfail support why',
  capture: 'attach snap barcode labelscan workout breathe',
  ambient: 'widgets sharecard watch lockpush androidwidget siri orb topbars orbnext',
};

// Where the source provides a distinct lead object, promote that object intact.
// Existing dates, amounts, illustrations and interactive controls remain attached.
export const spotlights = {
  question: '.v21-shell-question-title',
  building: '.t-statement',
  mission: '.v21-m-case-intro',
  draft: '.t-title2',
  cashplan: '.v21-m-cash-answer',
  scan: '.v21-shell-letter-source',
  chat: '.v21-shell-chat-thread',
  library: '.v21p-library > button',
  idea: '.t-title1',
  aim: '.v21p-aim > .t-statement',
  body: '.v21b-brief',
  sleep: '.v21b-brief',
  readiness: '.v21b-score',
  confirm: '.v21b-meal-estimate',
  privacy: '.v21-shell-privacy-promise',
  person: '.v21p-person-identity',
  vault: '.v21-m-document-action',
  docdetail: '.v21-m-document-summary',
};

export const photography = {
  welcome: 'people',
  areahome: 'terrace',
  areawork: 'work',
  household: 'people',
  aim: 'terrace',
  glimpse: 'home',
  signedout: 'work',
  birthdaynudge: 'people',
};

// The meaning of the primary object informs how it is framed and labelled.
export const paper = {
  understood: 'doc',
  scan: 'doc',
  docdetail: 'folder',
  txn: 'cash',
  bill: 'calendar',
};

export function matchCompositions(keys) {
  const found = new Map();
  for (const [layout, group] of Object.entries(compositions)) {
    for (const key of group.split(' ')) {
      if (!keys.has(key) || found.has(key)) throw new Error('Invalid V24 screen assignment: ' + key);
      found.set(key, layout);
    }
  }
  for (const key of keys) {
    if (!found.has(key) && !['today', 'plan', 'you', 'talk'].includes(key)) {
      throw new Error('Missing V24 composition: ' + key);
    }
  }
  return found;
}
