import { TranslationResult, CBCBand } from './types';

/**
 * Pre-translated guidance served when the Claude API is unreachable, unkeyed, or slow.
 *
 * Mziza is used by parents in places where a data bundle is a real cost and
 * signal drops for hours at a time. Offline is the normal path, not the failure path,
 * so every subject the OCR extractor can detect has a full four-band entry here.
 * Activities use materials a household in Kitui, Kisumu, or Kibera already owns.
 */
export const OFFLINE_TRANSLATION_BANK: Record<
  string,
  Record<CBCBand, Omit<TranslationResult, 'subject' | 'band'>>
> = {
  Mathematics: {
    BE: {
      band_name_sw: 'Chini ya Matarajio (BE)',
      band_name_en: 'Below Expectation (BE)',
      explanation_sw:
        'Mtoto wako bado anahitaji msaada zaidi kuelewa dhana za hisabati. Usimvunje moyo; anahitaji mazoezi ya vitendo kwa kutumia vitu anavyoviona kila siku.',
      explanation_en:
        'Your child needs extra guidance to grasp maths concepts. Do not discourage them; they learn fastest by handling real objects they already know.',
      activity_sw:
        'Tumia vifuniko vya chupa au mawe madogo kuhesabu na kujumlisha wakati wa kupika. Muulize akuhesabie vitu kumi, kisha aondoe vitatu.',
      activity_en:
        'Use bottle caps or small stones to count and add while cooking. Ask them to count out ten items, then take three away.',
      diy_materials: [
        'Vifuniko vya chupa (Bottle caps)',
        'Mawe madogo (Small stones)',
        'Vijiti vya kuni (Firewood sticks)'
      ]
    },
    AE: {
      band_name_sw: 'Kukaribia Matarajio (AE)',
      band_name_en: 'Approaching Expectation (AE)',
      explanation_sw:
        'Mtoto anaelewa misingi lakini anahitaji mazoezi kidogo zaidi kufikia lengo kamili. Anakosea anapofanya haraka.',
      explanation_en:
        'The child understands the basics but needs more practice to reach full proficiency. Mistakes appear when they rush.',
      activity_sw:
        'Mpe fursa ya kupima maji au unga wakati wa kuandaa chakula. Muulize akadirie kwanza, kisha mpimeni pamoja.',
      activity_en:
        'Let them measure water or flour during meal preparation. Ask for an estimate first, then measure together.',
      diy_materials: [
        'Kikombe cha kipimo (Measuring cup)',
        'Maji au mchele (Water or rice)',
        'Mzani wa jikoni ikiwa upo (Kitchen scale if available)'
      ]
    },
    ME: {
      band_name_sw: 'Kufikia Matarajio (ME)',
      band_name_en: 'Meeting Expectation (ME)',
      explanation_sw:
        'Mtoto wako anafanya vizuri kulingana na mtaala wa CBC. Endelea kumpa changamoto za kila siku ili asisimame hapo.',
      explanation_en:
        'Your child is performing well against the CBC curriculum. Keep offering daily challenges so the progress continues.',
      activity_sw:
        'Mpe mafumbo mepesi ya hesabu ya kila siku, kwa mfano kuhesabu chenji ya dukani au bei ya matatu kwa wiki nzima.',
      activity_en:
        'Give simple daily maths puzzles, such as working out shop change or the weekly matatu fare.',
      diy_materials: [
        'Sarafu na noti (Coins and notes)',
        'Daftari la mazoezi (Exercise book)',
        'Risiti za dukani (Shop receipts)'
      ]
    },
    EE: {
      band_name_sw: 'Kupita Matarajio (EE)',
      band_name_en: 'Exceeding Expectation (EE)',
      explanation_sw:
        'Mtoto wako anaonyesha uwezo wa juu na ubunifu katika hisabati. Mpe kazi ya kufundisha wengine ili aimarishe zaidi.',
      explanation_en:
        'Your child shows strong skill and creativity in mathematics. Let them teach others to deepen the understanding.',
      activity_sw:
        'Msaidie kubuni mchezo wa hesabu kwa ajili ya ndugu zake wadogo, kisha aucheze nao na aeleze sheria.',
      activity_en:
        'Help them design a maths game for younger siblings, then have them run it and explain the rules.',
      diy_materials: [
        'Karatasi na kadibodi (Paper and cardboard)',
        'Rula na penseli (Ruler and pencil)',
        'Kete au vifuniko (Dice or bottle caps)'
      ]
    }
  },

  English: {
    BE: {
      band_name_sw: 'Chini ya Matarajio (BE)',
      band_name_en: 'Below Expectation (BE)',
      explanation_sw:
        'Mtoto anahitaji msaada wa kusoma kwa sauti na kujenga msamiati. Kusikia lugha mara kwa mara ndio njia ya haraka zaidi.',
      explanation_en:
        'Your child needs support with reading aloud and building vocabulary. Frequent exposure to spoken English is the fastest route.',
      activity_sw:
        'Soma naye kwa sauti dakika kumi kila jioni. Mwambie aeleze kwa maneno yake mwenyewe kile mlichosoma.',
      activity_en:
        'Read aloud with them for ten minutes each evening. Ask them to retell what you read in their own words.',
      diy_materials: [
        'Kitabu chochote cha hadithi (Any storybook)',
        'Gazeti la zamani (Old newspaper)',
        'Vibandiko vya majina ya vitu nyumbani (Labels for household objects)'
      ]
    },
    AE: {
      band_name_sw: 'Kukaribia Matarajio (AE)',
      band_name_en: 'Approaching Expectation (AE)',
      explanation_sw:
        'Anasoma vizuri lakini anachanganya sarufi anapoandika. Anahitaji kuandika mara kwa mara na kusahihishwa kwa upole.',
      explanation_en:
        'They read reasonably well but mix up grammar when writing. Regular writing with gentle correction is what is missing.',
      activity_sw:
        'Mwambie aandike sentensi tatu kila siku kuhusu alichofanya, kisha msomeeni pamoja na mrekebishe moja tu.',
      activity_en:
        'Have them write three sentences daily about their day, then read it together and correct just one thing.',
      diy_materials: [
        'Daftari (Exercise book)',
        'Kalamu (Pen)',
        'Kalenda ya ukutani (Wall calendar)'
      ]
    },
    ME: {
      band_name_sw: 'Kufikia Matarajio (ME)',
      band_name_en: 'Meeting Expectation (ME)',
      explanation_sw:
        'Mtoto anasoma na kuandika kwa kiwango kinachotarajiwa. Sasa mpe vitabu virefu kidogo ili apanue msamiati.',
      explanation_en:
        'Your child reads and writes at the expected level. Move them to slightly longer texts to widen vocabulary.',
      activity_sw:
        'Mpe habari moja kutoka gazetini kila wiki, kisha aeleze mbele ya familia kwa dakika mbili.',
      activity_en:
        'Give them one newspaper story each week and have them present it to the family for two minutes.',
      diy_materials: [
        'Gazeti la wiki (Weekly newspaper)',
        'Redio kwa habari (Radio for news)',
        'Daftari la maneno mapya (New-words notebook)'
      ]
    },
    EE: {
      band_name_sw: 'Kupita Matarajio (EE)',
      band_name_en: 'Exceeding Expectation (EE)',
      explanation_sw:
        'Ana uwezo mkubwa wa lugha na maelezo. Mpe nafasi ya kuandika hadithi zake mwenyewe na kuzihariri.',
      explanation_en:
        'They have strong command of language and explanation. Give them room to write and edit their own stories.',
      activity_sw:
        'Mwambie aandike hadithi fupi kuhusu mtaa wenu, kisha aisome tena baada ya siku mbili na aiboreshe.',
      activity_en:
        'Ask them to write a short story about your neighbourhood, then revisit and improve it two days later.',
      diy_materials: [
        'Daftari kubwa (Large notebook)',
        'Kalamu za rangi (Coloured pens)'
      ]
    }
  },

  Kiswahili: {
    BE: {
      band_name_sw: 'Chini ya Matarajio (BE)',
      band_name_en: 'Below Expectation (BE)',
      explanation_sw:
        'Mtoto anahitaji kuzungumza Kiswahili sanifu zaidi nyumbani. Sheng inamchanganya anapoandika mtihani.',
      explanation_en:
        'Your child needs more standard Kiswahili at home. Sheng is confusing them when they sit written papers.',
      activity_sw:
        'Wekeni saa moja kila jioni ya kuzungumza Kiswahili sanifu pekee, bila Sheng wala Kiingereza.',
      activity_en:
        'Set aside one hour each evening for standard Kiswahili only, with no Sheng and no English.',
      diy_materials: [
        'Redio ya habari za Kiswahili (Kiswahili radio news)',
        'Kamusi ikiwa ipo (Dictionary if available)'
      ]
    },
    AE: {
      band_name_sw: 'Kukaribia Matarajio (AE)',
      band_name_en: 'Approaching Expectation (AE)',
      explanation_sw:
        'Anazungumza vizuri lakini anakosea katika ngeli na methali. Anahitaji mazoezi ya kuandika.',
      explanation_en:
        'They speak well but slip on noun classes and proverbs. Written practice is what will close the gap.',
      activity_sw:
        'Mfundishe methali moja kila wiki na muulize aitumie katika sentensi mbili tofauti.',
      activity_en:
        'Teach one proverb each week and ask them to use it in two different sentences.',
      diy_materials: [
        'Daftari la methali (Proverbs notebook)',
        'Redio au runinga (Radio or television)'
      ]
    },
    ME: {
      band_name_sw: 'Kufikia Matarajio (ME)',
      band_name_en: 'Meeting Expectation (ME)',
      explanation_sw:
        'Mtoto ana msingi imara wa Kiswahili. Mpe insha fupi za kuandika ili aendelee kunoa uwezo wake.',
      explanation_en:
        'Your child has a firm grounding in Kiswahili. Short compositions will keep sharpening the skill.',
      activity_sw:
        'Mpe kichwa cha insha kila wiki, kwa mfano "Siku ya soko", aandike aya tatu.',
      activity_en:
        'Give one composition title each week, for example "Market day", and ask for three paragraphs.',
      diy_materials: [
        'Daftari la insha (Composition book)',
        'Kalamu (Pen)'
      ]
    },
    EE: {
      band_name_sw: 'Kupita Matarajio (EE)',
      band_name_en: 'Exceeding Expectation (EE)',
      explanation_sw:
        'Ana ufasaha wa hali ya juu. Mpe nafasi ya kutunga mashairi au kusimulia hadithi za jadi.',
      explanation_en:
        'They are highly fluent. Give them space to compose poems or retell traditional stories.',
      activity_sw:
        'Mwambie atunge shairi la beti nne kuhusu jambo lililotokea nyumbani, kisha aliwasomee familia.',
      activity_en:
        'Ask them to compose a four-stanza poem about something that happened at home, then perform it for the family.',
      diy_materials: [
        'Daftari (Notebook)',
        'Hadithi za wazee wa familia (Family elders as story sources)'
      ]
    }
  },

  'Science & Technology': {
    BE: {
      band_name_sw: 'Chini ya Matarajio (BE)',
      band_name_en: 'Below Expectation (BE)',
      explanation_sw:
        'Mtoto anahitaji kuona sayansi ikitendeka kwa vitendo karibu naye badala ya kukariri maandishi.',
      explanation_en:
        'Your child needs to see science happening around them rather than memorising notes.',
      activity_sw:
        'Chunguzeni mimea na wadudu nje ya nyumba, kisha mjadili wanavyoishi na wanachokula.',
      activity_en:
        'Observe plants and insects outside together, then discuss how they live and what they eat.',
      diy_materials: [
        'Mimea ya nyumbani (Plants around the home)',
        'Kioo cha kukuza ikiwa kipo (Magnifying glass if available)',
        'Daftari la kuchora (Drawing book)'
      ]
    },
    AE: {
      band_name_sw: 'Kukaribia Matarajio (AE)',
      band_name_en: 'Approaching Expectation (AE)',
      explanation_sw:
        'Mtoto anatambua mambo ya sayansi lakini anashindwa kueleza sababu. Anahitaji majaribio ya mikono.',
      explanation_en:
        'The child recognises science concepts but struggles to explain why. Hands-on experiments will fix that.',
      activity_sw:
        'Fanyeni jaribio la kutenganisha mchanga na maji kwa kutumia kitambaa safi, kisha aeleze kilichotokea.',
      activity_en:
        'Run an experiment separating sand from water using a clean cloth, then have them explain what happened.',
      diy_materials: [
        'Chupa ya plastiki (Plastic bottle)',
        'Mchanga na maji (Sand and water)',
        'Kitambaa safi (Clean cloth)'
      ]
    },
    ME: {
      band_name_sw: 'Kufikia Matarajio (ME)',
      band_name_en: 'Meeting Expectation (ME)',
      explanation_sw:
        'Mtoto wako anaelewa vyema mada za sayansi na teknolojia. Endelea kumuuliza maswali ya "kwa nini".',
      explanation_en:
        'Your child has a solid grasp of science and technology topics. Keep asking them "why" questions.',
      activity_sw:
        'Muulize aeleze jinsi jua linavyosaidia mimea kutengeneza chakula, na kwa nini majani ni ya kijani.',
      activity_en:
        'Ask them to explain how sunlight helps plants make food, and why leaves are green.',
      diy_materials: [
        'Mmea kwenye chungu (Potted plant)',
        'Daftari la uchunguzi (Observation notebook)'
      ]
    },
    EE: {
      band_name_sw: 'Kupita Matarajio (EE)',
      band_name_en: 'Exceeding Expectation (EE)',
      explanation_sw:
        'Ana uwezo wa juu wa uchunguzi na uvumbuzi. Mpe miradi ya kutengeneza vitu vinavyofanya kazi.',
      explanation_en:
        'Strong observation and invention skills. Give them build projects that actually work.',
      activity_sw:
        'Msaidie kuunda kichujio rahisi cha maji kwa kutumia chupa, mkaa, mchanga na kokoto.',
      activity_en:
        'Help them build a simple water filter using a bottle, charcoal, sand and gravel.',
      diy_materials: [
        'Chupa za plastiki (Plastic bottles)',
        'Mkaa na kokoto (Charcoal and gravel)',
        'Mchanga safi (Clean sand)'
      ]
    }
  },

  'Social Studies': {
    BE: {
      band_name_sw: 'Chini ya Matarajio (BE)',
      band_name_en: 'Below Expectation (BE)',
      explanation_sw:
        'Mtoto anahitaji kuunganisha masomo na maisha halisi ya jamii yenu ili yaeleweke.',
      explanation_en:
        'Your child needs the subject connected to real community life before it makes sense.',
      activity_sw:
        'Tembeeni sokoni pamoja, kisha mwulize aeleze kazi tofauti anazoziona na jinsi zinavyosaidiana.',
      activity_en:
        'Walk to the market together, then ask them to name the different jobs they see and how each depends on the others.',
      diy_materials: [
        'Soko la karibu (Nearby market)',
        'Daftari la kumbukumbu (Notebook)'
      ]
    },
    AE: {
      band_name_sw: 'Kukaribia Matarajio (AE)',
      band_name_en: 'Approaching Expectation (AE)',
      explanation_sw:
        'Anakumbuka majina na tarehe lakini hachambui sababu. Anahitaji kujadili, si kukariri.',
      explanation_en:
        'They recall names and dates but do not analyse causes. Discussion, not memorisation, is what is needed.',
      activity_sw:
        'Kila jioni jadilini habari moja ya kaunti yenu na muulize ni nani anaathirika na kwa nini.',
      activity_en:
        'Each evening discuss one county news item and ask who is affected and why.',
      diy_materials: [
        'Redio au gazeti (Radio or newspaper)',
        'Ramani ya Kenya ikiwa ipo (Map of Kenya if available)'
      ]
    },
    ME: {
      band_name_sw: 'Kufikia Matarajio (ME)',
      band_name_en: 'Meeting Expectation (ME)',
      explanation_sw:
        'Anaelewa muundo wa jamii na uongozi. Mpe kazi za kuchunguza historia ya familia na mtaa.',
      explanation_en:
        'They understand community structure and governance. Give them family and neighbourhood history to investigate.',
      activity_sw:
        'Mwambie ahoji babu au bibi kuhusu maisha ya zamani, kisha aandike aya tano.',
      activity_en:
        'Have them interview a grandparent about life in the past, then write five paragraphs.',
      diy_materials: [
        'Wazee wa familia (Family elders)',
        'Daftari (Notebook)'
      ]
    },
    EE: {
      band_name_sw: 'Kupita Matarajio (EE)',
      band_name_en: 'Exceeding Expectation (EE)',
      explanation_sw:
        'Ana uchambuzi wa kina wa masuala ya jamii. Mpe miradi ya kutatua tatizo halisi la mtaa.',
      explanation_en:
        'Deep analysis of community issues. Give them projects that tackle a real local problem.',
      activity_sw:
        'Mwambie apendekeze suluhisho la tatizo moja la mtaa, kwa mfano taka au maji, na aeleze hatua tatu.',
      activity_en:
        'Ask them to propose a solution to one neighbourhood problem, such as waste or water, and outline three steps.',
      diy_materials: [
        'Daftari la mpango (Planning notebook)',
        'Mahojiano na majirani (Interviews with neighbours)'
      ]
    }
  },

  'Creative Arts': {
    BE: {
      band_name_sw: 'Chini ya Matarajio (BE)',
      band_name_en: 'Below Expectation (BE)',
      explanation_sw:
        'Mtoto anahitaji uhuru wa kujaribu bila kuogopa kukosea. Sanaa haihitaji vifaa vya gharama.',
      explanation_en:
        'Your child needs freedom to try without fear of getting it wrong. Art does not need expensive materials.',
      activity_sw:
        'Mpe mkaa au udongo achore au atengeneze umbo lolote analotaka, bila kumsahihisha.',
      activity_en:
        'Give them charcoal or clay to draw or mould anything they choose, without correction.',
      diy_materials: [
        'Mkaa (Charcoal)',
        'Udongo (Clay soil)',
        'Karatasi za zamani (Used paper)'
      ]
    },
    AE: {
      band_name_sw: 'Kukaribia Matarajio (AE)',
      band_name_en: 'Approaching Expectation (AE)',
      explanation_sw:
        'Ana mawazo mazuri lakini hamalizi kazi. Anahitaji miradi midogo inayokamilika siku moja.',
      explanation_en:
        'Good ideas but unfinished work. Small projects that finish in one sitting will build the habit.',
      activity_sw:
        'Mpe kazi moja ndogo kila wiki, kwa mfano kuchora chombo cha nyumbani, na aimalize siku hiyo hiyo.',
      activity_en:
        'Give one small task each week, such as drawing a household object, to be finished the same day.',
      diy_materials: [
        'Penseli na karatasi (Pencil and paper)',
        'Rangi za maji ikiwa zipo (Watercolours if available)'
      ]
    },
    ME: {
      band_name_sw: 'Kufikia Matarajio (ME)',
      band_name_en: 'Meeting Expectation (ME)',
      explanation_sw:
        'Kazi zake zina ubora unaotarajiwa. Mpe changamoto ya kutumia vifaa vipya na mbinu tofauti.',
      explanation_en:
        'Their work meets the expected standard. Challenge them with new materials and different techniques.',
      activity_sw:
        'Mwambie atengeneze kitu kimoja cha mapambo kwa kutumia vifaa vilivyotupwa nyumbani.',
      activity_en:
        'Ask them to make one decorative item entirely from discarded materials at home.',
      diy_materials: [
        'Chupa na makopo (Bottles and tins)',
        'Vitambaa vya zamani (Old fabric)',
        'Gundi ya nyumbani (Homemade paste)'
      ]
    },
    EE: {
      band_name_sw: 'Kupita Matarajio (EE)',
      band_name_en: 'Exceeding Expectation (EE)',
      explanation_sw:
        'Ana kipaji cha wazi. Msaidie kujenga mkusanyiko wa kazi zake ili aonyeshe uwezo wake.',
      explanation_en:
        'Clear talent. Help them build a portfolio of their work so the ability is visible to others.',
      activity_sw:
        'Kusanyeni kazi zake kumi bora katika folda moja, na kila moja aandike sentensi mbili kuielezea.',
      activity_en:
        'Collect their ten best pieces into one folder, with two sentences from them describing each.',
      diy_materials: [
        'Folda au bahasha kubwa (Folder or large envelope)',
        'Kalamu (Pen)'
      ]
    }
  }
};

/** Subject used when a detected subject has no entry in the bank. */
export const DEFAULT_BANK_SUBJECT = 'Mathematics';

/** Band used when a subject entry exists but the specific band is missing. */
export const DEFAULT_BANK_BAND: CBCBand = 'ME';
