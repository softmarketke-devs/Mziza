/**
 * System-wide interface language.
 *
 * Language is a property of the whole application, not of a single form. A
 * parent who reads Kiswahili reads the navigation, the buttons and the error
 * messages in Kiswahili too, not just the guidance text on one results panel.
 * The choice is made once in the masthead and persists across pages and visits.
 */
export type Language = 'sw' | 'en';

export const LANGUAGES: Language[] = ['sw', 'en'];

/** Kiswahili leads. The audience is Kenyan parents, not an English-first default. */
export const DEFAULT_LANGUAGE: Language = 'sw';

/** localStorage key holding the parent's choice between visits. */
export const LANGUAGE_STORAGE_KEY = 'mzazi.language';

/** BCP-47 tag written to <html lang> so screen readers pick the right voice. */
export const HTML_LANG: Record<Language, string> = {
  sw: 'sw-KE',
  en: 'en-KE'
};

/** Short label for the masthead switch, each shown in its own language. */
export const LANGUAGE_LABEL: Record<Language, string> = {
  sw: 'Kiswahili',
  en: 'English'
};

export function isLanguage(value: unknown): value is Language {
  return value === 'sw' || value === 'en';
}

const sw = {
  chrome: {
    switchLabel: 'Lugha ya mfumo',
    navScanner: 'Piga Picha',
    navTranslate: 'Andika Safu',
    navUssd: 'USSD',
    footerLeft: 'Mwongozo wa CBC, Gredi 4 hadi 9',
    footerRight: 'Hufanya kazi bila intaneti • USSD *384*77#'
  },

  home: {
    eyebrow: 'Mtaala wa CBC, Gredi 4 hadi 9',
    title: 'Tunafafanua madaraja ya ripoti kuwa mwongozo halisi wa nyumbani.',
    lede:
      'Ripoti inasema AE au BE. Mzazi Coach inaeleza kwa Kiswahili na Kiingereza maana ya daraja hilo, pamoja na shughuli za nyumbani zinazotumia vitu vilivyopo nyumbani.',
    asideTitle: 'Imejengwa Kufanya Kazi Bila Intaneti',
    asideBody:
      'Mwongozo hutolewa kutoka hazina iliyoandaliwa mapema pale intaneti haipatikani au inachelewa. Wazazi wasio na simu janja hupata mwongozo uleule kupitia USSD.',
    modesLabel: 'Njia za kufikia Mzazi Coach',
    scannerNumber: '01 / NJIA YA KAMERA',
    scannerTitle: 'Piga Picha ya Ripoti',
    scannerDesc:
      'Piga picha ya ripoti halisi. Mfumo husoma madaraja ya masomo wenyewe, na hupunguza ukubwa wa picha kabla ya kupakia ili kuokoa bando.',
    scannerCta: 'Fungua Kamera',
    translateNumber: '02 / NJIA YA KUANDIKA',
    translateTitle: 'Andika Safu Mwenyewe',
    translateDesc:
      'Inafaa pale ripoti imekunjika au mwanga ni hafifu. Andika somo na daraja mstari kwa mstari upate jibu papo hapo.',
    translateCta: 'Andika Safu',
    ussdNumber: '03 / SIMU YA KAWAIDA (USSD)',
    ussdTitle: 'Mfumo wa USSD kwa Simu ya Kawaida (*384*77#)',
    ussdDesc:
      'Menyu ya simu ya kawaida isiyohitaji bando lolote. Jaribu mfumo wa menyu hapa kwenye simu ya mfano.',
    ussdCta: 'Fungua Kiigizo cha USSD'
  },

  scanner: {
    eyebrow: '01 — Kamera',
    title: 'Piga picha ya ripoti',
    lede:
      'Weka ripoti ionekane vizuri ndani ya fremu ya picha. Mfumo husoma madaraja ya masomo na kuyageuza kuwa mwongozo wa vitendo.',
    fileLabel: 'Picha ya Ripoti',
    fileHint: 'JPEG au PNG. Hupunguzwa hapa kwenye simu yako ili kuokoa bando.',
    previewAlt: 'Picha ya ripoti uliyochagua',
    submit: 'Soma Ripoti',
    submitting: 'Inasoma Ripoti...',
    clear: 'Ondoa Picha',
    readError: 'Faili hilo halikuweza kusomwa.',
    imageError: 'Faili hilo si picha inayosomeka.',
    prepareError: 'Picha hiyo haikuweza kuandaliwa.',
    networkError:
      'Ombi halikufika kwa seva. Angalia intaneti ujaribu tena, au andika safu mwenyewe.'
  },

  translate: {
    eyebrow: '02 — Kuandika Mwenyewe',
    title: 'Andika safu za ripoti',
    ledePrefix: 'Andika masomo na madaraja mstari kwa mstari. Herufi fupi (mfano ',
    ledeMiddle: ') na maneno kamili (mfano ',
    ledeSuffix: ') yote hueleweka.',
    contentLabel: 'Maudhui ya Ripoti',
    contentHint:
      'Masomo yanayotambulika: Hisabati, Kiingereza, Kiswahili, Sayansi na Teknolojia, Masomo ya Jamii, Sanaa.',
    gradeLabel: 'Gredi ya Mwanafunzi',
    gradeHint: 'Huchagua shughuli ya KICD ya wiki inayolingana.',
    gradePlaceholder: 'Chagua gredi (si lazima)',
    submit: 'Fafanua Madaraja',
    submitting: 'Inachambua...',
    sample: 'Weka Mfano',
    emptyError: 'Andika angalau somo moja na daraja lake, mfano "Hisabati: AE".',
    networkError: 'Ombi halikufika kwa seva. Angalia intaneti ujaribu tena.'
  },

  ussd: {
    eyebrow: '03 — Simu ya Kawaida',
    title: 'Kiigizo cha USSD',
    lede:
      'Wazazi wasio na simu janja hufikia Mzazi Coach kwa kupiga *384*77#. Ukurasa huu huendesha mfumo uleule wa uzalishaji kwenye simu ya mfano.',
    initialScreen: 'Piga *384*77# kuanza.',
    statusLoading: 'Inawasiliana na Mtandao...',
    statusEnded: 'Kipindi Kimeisha',
    statusOpen: 'Inasubiri Jibu Lako',
    statusReady: 'Tayari',
    send: 'Tuma',
    clear: 'Futa',
    restart: 'Piga Tena',
    buffer: 'Umeandika',
    bufferEmpty: '(hakuna)',
    path: 'Njia Kamili',
    pathRoot: '(mwanzo)',
    gatewayError: 'Mtandao wa USSD haukupatikana.',
    parseError: 'Mtandao wa USSD ulirudisha jibu lisiloeleweka.',
    specTitle: 'Jinsi USSD Inavyofanya Kazi',
    specBodyPrefix:
      'Mitandao ya USSD haihifadhi kumbukumbu. Kila ombi hubeba historia yote ya vitufe ulivyobonyeza (mfano ',
    specBodySuffix:
      '), hivyo seva hujibu kwa usahihi bila kuhifadhi kipindi kwenye hifadhidata.',
    menuMapLabel: 'Ramani ya Menyu',
    menu1: '— Mwongozo wa daraja la somo (Somo → Daraja → Shughuli).',
    menu2: '— Shughuli ya mtaala wa KICD ya leo.',
    menu3: '— Badilisha lugha (Kiswahili / Kiingereza).',
    charNote:
      'Majibu hutoshea ndani ya kikomo cha herufi cha USSD bila kukata neno katikati.'
  },

  results: {
    fallbackNotice:
      'Hakuna safu ya somo iliyotambuliwa, hivyo madaraja ya mfano yanaonyeshwa hapa chini. Unaweza kuandika safu kamili kwenye ukurasa wa Andika Safu.',
    offlineNotice:
      'Imetolewa kutoka hazina ya nje ya mtandao iliyothibitishwa. Mwongozo umekamilika na uko tayari kutumika nyumbani.',
    failure: 'Uchakataji haukufanikiwa. Angalia muundo wa maandishi uliyoweka.',
    metaMode: 'Njia',
    metaSubjects: 'Masomo',
    metaSource: 'Chanzo',
    sourceOnline: 'Mtandaoni',
    sourceOffline: 'Hazina ya Ndani',
    speak: 'Sikiliza somo la kwanza',
    stopSpeaking: 'Simamisha sauti',
    noVoice: 'Hakuna sauti ya Kiswahili kwenye kifaa hiki. Sauti chaguo-msingi itatumika.',
    bandMeaning: 'Maana ya Daraja',
    homeActivity: 'Shughuli ya Nyumbani',
    materials: 'Vifaa Vinavyohitajika',
    rawMatch: 'Maneno Yaliyosomwa Kwenye Ripoti',
    kicdLabel: 'Shughuli ya KICD',
    kicdTerm: 'Muhula',
    kicdWeek: 'Wiki',
    kicdOutcome: 'Lengo Mahususi la Kujifunza',
    kicdActivity: 'Shughuli ya Mtaala'
  },

  grades: {
    grade_4: 'Gredi ya 4',
    grade_5: 'Gredi ya 5',
    grade_6: 'Gredi ya 6',
    grade_7: 'Gredi ya 7',
    grade_8: 'Gredi ya 8',
    grade_9: 'Gredi ya 9'
  }
};

/** `UiStrings` is derived from the Kiswahili copy, so a missing English key fails typecheck. */
export type UiStrings = typeof sw;

const en: UiStrings = {
  chrome: {
    switchLabel: 'System language',
    navScanner: 'Scan Report',
    navTranslate: 'Type Rows',
    navUssd: 'USSD',
    footerLeft: 'CBC Grades 4 to 9 Guidance',
    footerRight: 'Works offline • USSD *384*77#'
  },

  home: {
    eyebrow: 'CBC Curriculum, Grades 4 to 9',
    title: 'Translating performance bands into real home guidance.',
    lede:
      'A report card states AE or BE. Mzazi Coach explains what that band means in plain Kiswahili and English, with home activities built from things already in the house.',
    asideTitle: 'Built for Offline Reliability',
    asideBody:
      'Guidance is served from a pre-compiled offline bank when the connection is unavailable or slow. Parents without smartphones reach the same guidance over USSD.',
    modesLabel: 'Ways to reach Mzazi Coach',
    scannerNumber: '01 / CAMERA OPTION',
    scannerTitle: 'Scan Report Card Photo',
    scannerDesc:
      'Photograph the physical document. Text recognition reads the subject bands for you, downscaling the image first to save data.',
    scannerCta: 'Open Scanner',
    translateNumber: '02 / MANUAL OPTION',
    translateTitle: 'Type Rows Directly',
    translateDesc:
      'Best for a creased card or poor lighting. Type each subject and band code line by line for an immediate answer.',
    translateCta: 'Enter Rows',
    ussdNumber: '03 / FEATURE PHONE (USSD)',
    ussdTitle: 'Feature Phone USSD Gateway (*384*77#)',
    ussdDesc:
      'A feature phone menu that needs no data bundle at all. Try the menu here on a simulated handset.',
    ussdCta: 'Open USSD Simulator'
  },

  scanner: {
    eyebrow: '01 — Camera',
    title: 'Photograph the report card',
    lede:
      'Position the report card clearly within the frame. Text recognition extracts the subject bands and turns them into practical guidance.',
    fileLabel: 'Report Card Image',
    fileHint: 'JPEG or PNG. Downscaled on your own phone first to save data.',
    previewAlt: 'Preview of the report card you selected',
    submit: 'Read Report Card',
    submitting: 'Reading Report Card...',
    clear: 'Clear Selection',
    readError: 'Could not read that file.',
    imageError: 'That file is not a readable image.',
    prepareError: 'Could not prepare that image.',
    networkError:
      'The request did not reach the server. Check your connection and try again, or type the rows manually.'
  },

  translate: {
    eyebrow: '02 — Manual Entry',
    title: 'Enter report card rows',
    ledePrefix: 'Type subjects and band codes line by line. Short codes (e.g. ',
    ledeMiddle: ') and full words (e.g. ',
    ledeSuffix: ') are both understood.',
    contentLabel: 'Report Card Content',
    contentHint:
      'Supported subjects: Mathematics, English, Kiswahili, Science & Technology, Social Studies, Creative Arts.',
    gradeLabel: 'Student Grade Level',
    gradeHint: 'Selects the matching KICD weekly home activity.',
    gradePlaceholder: 'Select grade level (optional)',
    submit: 'Explain Performance Bands',
    submitting: 'Analysing...',
    sample: 'Insert Sample Rows',
    emptyError: 'Enter at least one subject and band, such as "Mathematics: AE".',
    networkError: 'The request did not reach the server. Check your connection and try again.'
  },

  ussd: {
    eyebrow: '03 — Feature Phone',
    title: 'Feature phone USSD simulator',
    lede:
      'Parents without smartphones reach Mzazi Coach by dialling *384*77#. This page runs the identical production handler against a simulated handset.',
    initialScreen: 'Dial *384*77# to start.',
    statusLoading: 'Contacting Gateway...',
    statusEnded: 'Session Ended',
    statusOpen: 'Awaiting Your Reply',
    statusReady: 'Ready',
    send: 'Send',
    clear: 'Clear',
    restart: 'Redial',
    buffer: 'Typed',
    bufferEmpty: '(empty)',
    path: 'Full Path',
    pathRoot: '(root)',
    gatewayError: 'The simulated USSD gateway could not be reached.',
    parseError: 'The USSD gateway returned an unreadable response.',
    specTitle: 'How USSD Works',
    specBodyPrefix:
      'USSD gateways keep no state. Every request carries the full history of the keys pressed (e.g. ',
    specBodySuffix:
      '), so the server answers deterministically without storing a session in a database.',
    menuMapLabel: 'Menu Map',
    menu1: '— Subject band guidance (Subject → Band → Activity).',
    menu2: "— Today's KICD curriculum activity.",
    menu3: '— Switch language (Kiswahili / English).',
    charNote:
      'Replies fit inside the USSD character limit, wrapped on a word boundary.'
  },

  results: {
    fallbackNotice:
      'No subject rows were recognised, so sample bands are shown below. You can type the exact rows on the Type Rows page.',
    offlineNotice:
      'Served from the verified offline bank. The guidance is complete and ready to use at home.',
    failure: 'Processing failed. Check the format of what you entered.',
    metaMode: 'Mode',
    metaSubjects: 'Subjects',
    metaSource: 'Source',
    sourceOnline: 'Live Model',
    sourceOffline: 'Offline Bank',
    speak: 'Read first subject aloud',
    stopSpeaking: 'Stop audio',
    noVoice: 'No English voice is installed on this device. The default voice will be used.',
    bandMeaning: 'Band Meaning',
    homeActivity: 'Home Activity',
    materials: 'Household Materials',
    rawMatch: 'Card Recognition Match',
    kicdLabel: 'KICD Standard Activity',
    kicdTerm: 'Term',
    kicdWeek: 'Week',
    kicdOutcome: 'Specific Learning Outcome',
    kicdActivity: 'Curriculum Activity'
  },

  grades: {
    grade_4: 'Grade 4',
    grade_5: 'Grade 5',
    grade_6: 'Grade 6',
    grade_7: 'Grade 7',
    grade_8: 'Grade 8',
    grade_9: 'Grade 9'
  }
};

export const DICTIONARY: Record<Language, UiStrings> = { sw, en };

export function strings(language: Language): UiStrings {
  return DICTIONARY[language];
}
