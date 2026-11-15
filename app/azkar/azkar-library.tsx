"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

type CategoryId = "morning" | "evening" | "prayer" | "sleep" | "daily";

type Dhikr = {
  id: string;
  category: CategoryId;
  title: string;
  text: string;
  transliteration?: string;
  meaning?: string;
  count: number;
  source: string;
};

const categories: { id: CategoryId; title: string; description: string }[] = [
  { id: "morning", title: "أذكار الصباح", description: "من بعد صلاة الفجر إلى طلوع الشمس، ويمتد وقتها إلى الضحى." },
  { id: "evening", title: "أذكار المساء", description: "تقال في المساء، والأفضل قبل غروب الشمس." },
  { id: "prayer", title: "بعد الصلاة", description: "أذكار تقال بعد السلام من الصلوات المفروضة." },
  { id: "sleep", title: "النوم والاستيقاظ", description: "أذكار النوم وما يقال عند الاستيقاظ." },
  { id: "daily", title: "أذكار يومية", description: "أذكار في مواقف متكررة خلال اليوم." },
];

const azkar: Dhikr[] = [
  {
    id: "morning-start",
    category: "morning",
    title: "دعاء بداية اليوم",
    text: "اللَّهُمَّ بِكَ أَصْبَحْنَا، وَبِكَ أَمْسَيْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ، وَإِلَيْكَ النُّشُورُ",
    transliteration: "Allahumma bika asbahna, wa bika amsayna, wa bika nahya, wa bika namutu, wa ilaykan-nushur.",
    meaning: "O Allah, by You we enter the morning and by You we enter the evening; by You we live and die, and to You is the resurrection.",
    count: 1,
    source: "سنن أبي داود 5068، وجامع الترمذي 3391",
  },
  {
    id: "morning-praise",
    category: "morning",
    title: "أصبحنا وأصبح الملك لله",
    text: "أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ، وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ. رَبِّ أَسْأَلُكَ خَيْرَ مَا فِي هَذَا الْيَوْمِ وَخَيْرَ مَا بَعْدَهُ، وَأَعُوذُ بِكَ مِنْ شَرِّ مَا فِي هَذَا الْيَوْمِ وَشَرِّ مَا بَعْدَهُ، رَبِّ أَعُوذُ بِكَ مِنَ الْكَسَلِ وَسُوءِ الْكِبَرِ، رَبِّ أَعُوذُ بِكَ مِنْ عَذَابٍ فِي النَّارِ وَعَذَابٍ فِي الْقَبْرِ",
    count: 1,
    source: "صحيح مسلم 2723",
  },
  {
    id: "morning-master-istighfar",
    category: "morning",
    title: "سيد الاستغفار",
    text: "اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ، أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ، أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ، وَأَبُوءُ بِذَنْبِي، فَاغْفِرْ لِي، فَإِنَّهُ لَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ",
    meaning: "O Allah, You are my Lord; there is no god but You. You created me and I am Your servant. I keep my covenant and promise to You as best I can. I seek refuge in You from the evil I have done. I acknowledge Your favor upon me and acknowledge my sin, so forgive me, for none forgives sins but You.",
    count: 1,
    source: "صحيح البخاري 6306",
  },
  {
    id: "morning-contentment",
    category: "morning",
    title: "الرضا بالله ربًّا",
    text: "رَضِيتُ بِاللَّهِ رَبًّا، وَبِالْإِسْلَامِ دِينًا، وَبِمُحَمَّدٍ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ نَبِيًّا",
    meaning: "I am pleased with Allah as my Lord, Islam as my religion, and Muhammad ﷺ as my Prophet.",
    count: 3,
    source: "سنن أبي داود 5072، وجامع الترمذي 3389",
  },
  {
    id: "morning-protection",
    category: "morning",
    title: "دعاء الحفظ",
    text: "بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ",
    meaning: "In the name of Allah, with whose name nothing on earth or in heaven can cause harm; He is the All-Hearing, All-Knowing.",
    count: 3,
    source: "سنن أبي داود 5088، وجامع الترمذي 3388",
  },
  {
    id: "morning-wellbeing",
    category: "morning",
    title: "سؤال العفو والعافية",
    text: "اللَّهُمَّ إِنِّي أَسْأَلُكَ الْعَفْوَ وَالْعَافِيَةَ فِي الدُّنْيَا وَالْآخِرَةِ، اللَّهُمَّ إِنِّي أَسْأَلُكَ الْعَفْوَ وَالْعَافِيَةَ فِي دِينِي وَدُنْيَايَ وَأَهْلِي وَمَالِي",
    count: 1,
    source: "سنن أبي داود 5074",
  },
  {
    id: "morning-three-surahs",
    category: "morning",
    title: "الإخلاص والمعوذتان",
    text: "سورة الإخلاص، وسورة الفلق، وسورة الناس",
    meaning: "Recite each of the three surahs three times.",
    count: 3,
    source: "سنن أبي داود 5082، وجامع الترمذي 3575",
  },
  {
    id: "evening-start",
    category: "evening",
    title: "دعاء بداية المساء",
    text: "اللَّهُمَّ بِكَ أَمْسَيْنَا، وَبِكَ أَصْبَحْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ، وَإِلَيْكَ الْمَصِيرُ",
    transliteration: "Allahumma bika amsayna, wa bika asbahna, wa bika nahya, wa bika namutu, wa ilaykal-masir.",
    meaning: "O Allah, by You we enter the evening and by You we enter the morning; by You we live and die, and to You is the final return.",
    count: 1,
    source: "سنن أبي داود 5068، وجامع الترمذي 3391",
  },
  {
    id: "evening-praise",
    category: "evening",
    title: "أمسينا وأمسى الملك لله",
    text: "أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ، وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ. رَبِّ أَسْأَلُكَ خَيْرَ مَا فِي هَذِهِ اللَّيْلَةِ وَخَيْرَ مَا بَعْدَهَا، وَأَعُوذُ بِكَ مِنْ شَرِّ مَا فِي هَذِهِ اللَّيْلَةِ وَشَرِّ مَا بَعْدَهَا، رَبِّ أَعُوذُ بِكَ مِنَ الْكَسَلِ وَسُوءِ الْكِبَرِ، رَبِّ أَعُوذُ بِكَ مِنْ عَذَابٍ فِي النَّارِ وَعَذَابٍ فِي الْقَبْرِ",
    count: 1,
    source: "صحيح مسلم 2723",
  },
  {
    id: "evening-master-istighfar",
    category: "evening",
    title: "سيد الاستغفار",
    text: "اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ، أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ، أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ، وَأَبُوءُ بِذَنْبِي، فَاغْفِرْ لِي، فَإِنَّهُ لَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ",
    count: 1,
    source: "صحيح البخاري 6306",
  },
  {
    id: "evening-contentment",
    category: "evening",
    title: "الرضا بالله ربًّا",
    text: "رَضِيتُ بِاللَّهِ رَبًّا، وَبِالْإِسْلَامِ دِينًا، وَبِمُحَمَّدٍ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ نَبِيًّا",
    count: 3,
    source: "سنن أبي داود 5072، وجامع الترمذي 3389",
  },
  {
    id: "evening-protection",
    category: "evening",
    title: "دعاء الحفظ",
    text: "بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ",
    count: 3,
    source: "سنن أبي داود 5088، وجامع الترمذي 3388",
  },
  {
    id: "evening-three-surahs",
    category: "evening",
    title: "الإخلاص والمعوذتان",
    text: "سورة الإخلاص، وسورة الفلق، وسورة الناس",
    meaning: "Recite each of the three surahs three times.",
    count: 3,
    source: "سنن أبي داود 5082، وجامع الترمذي 3575",
  },
  {
    id: "evening-wellbeing",
    category: "evening",
    title: "سؤال العفو والعافية",
    text: "اللَّهُمَّ إِنِّي أَسْأَلُكَ الْعَفْوَ وَالْعَافِيَةَ فِي الدُّنْيَا وَالْآخِرَةِ، اللَّهُمَّ إِنِّي أَسْأَلُكَ الْعَفْوَ وَالْعَافِيَةَ فِي دِينِي وَدُنْيَايَ وَأَهْلِي وَمَالِي",
    count: 1,
    source: "سنن أبي داود 5074",
  },
  {
    id: "evening-creation",
    category: "evening",
    title: "الاستعاذة بكلمات الله التامات",
    text: "أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ",
    meaning: "I seek refuge in the perfect words of Allah from the evil of what He has created.",
    count: 3,
    source: "صحيح مسلم 2708",
  },
  {
    id: "prayer-forgiveness",
    category: "prayer",
    title: "الاستغفار بعد السلام",
    text: "أَسْتَغْفِرُ اللَّهَ (ثلاثًا)، اللَّهُمَّ أَنْتَ السَّلَامُ وَمِنْكَ السَّلَامُ، تَبَارَكْتَ يَا ذَا الْجَلَالِ وَالْإِكْرَامِ",
    meaning: "I seek Allah’s forgiveness (three times). O Allah, You are Peace and from You is peace. Blessed are You, O Possessor of majesty and honor.",
    count: 1,
    source: "صحيح مسلم 591",
  },
  {
    id: "prayer-tasbih",
    category: "prayer",
    title: "التسبيح والتحميد والتكبير",
    text: "سُبْحَانَ اللَّهِ (٣٣)، الْحَمْدُ لِلَّهِ (٣٣)، اللَّهُ أَكْبَرُ (٣٣)، ثم يُتِمُّ المِائَةَ: لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ",
    meaning: "Say Subhan Allah 33 times, Alhamdulillah 33 times, and Allahu Akbar 33 times, then complete one hundred with the final phrase.",
    count: 1,
    source: "صحيح مسلم 597",
  },
  {
    id: "prayer-kursi",
    category: "prayer",
    title: "آية الكرسي",
    text: "اللَّهُ لَا إِلَهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ۚ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ ۚ لَهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ ۗ مَنْ ذَا الَّذِي يَشْفَعُ عِنْدَهُ إِلَّا بِإِذْنِهِ ۚ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ ۖ وَلَا يُحِيطُونَ بِشَيْءٍ مِنْ عِلْمِهِ إِلَّا بِمَا شَاءَ ۚ وَسِعَ كُرْسِيُّهُ السَّمَاوَاتِ وَالْأَرْضَ ۖ وَلَا يَئُودُهُ حِفْظُهُمَا ۚ وَهُوَ الْعَلِيُّ الْعَظِيمُ",
    meaning: "Allah — there is no deity except Him, the Ever-Living, the Sustainer of all. (Quran 2:255)",
    count: 1,
    source: "القرآن الكريم، سورة البقرة: 255؛ حديث أبي أمامة، وصححه الألباني",
  },
  {
    id: "prayer-three-surahs",
    category: "prayer",
    title: "الإخلاص والمعوذتان",
    text: "سورة الإخلاص، وسورة الفلق، وسورة الناس",
    meaning: "Recite each surah once after each prescribed prayer.",
    count: 1,
    source: "سنن أبي داود 1523",
  },
  {
    id: "sleep-kursi",
    category: "sleep",
    title: "آية الكرسي",
    text: "اللَّهُ لَا إِلَهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ۚ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ ۚ لَهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ ۗ مَنْ ذَا الَّذِي يَشْفَعُ عِنْدَهُ إِلَّا بِإِذْنِهِ ۚ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ ۖ وَلَا يُحِيطُونَ بِشَيْءٍ مِنْ عِلْمِهِ إِلَّا بِمَا شَاءَ ۚ وَسِعَ كُرْسِيُّهُ السَّمَاوَاتِ وَالْأَرْضَ ۖ وَلَا يَئُودُهُ حِفْظُهُمَا ۚ وَهُوَ الْعَلِيُّ الْعَظِيمُ",
    meaning: "Recite Ayat al-Kursi before sleeping. (Quran 2:255)",
    count: 1,
    source: "القرآن الكريم، سورة البقرة: 255؛ صحيح البخاري 2311",
  },
  {
    id: "sleep-last-verses",
    category: "sleep",
    title: "آخر آيتين من سورة البقرة",
    text: "آمَنَ الرَّسُولُ بِمَا أُنْزِلَ إِلَيْهِ مِنْ رَبِّهِ وَالْمُؤْمِنُونَ ۚ كُلٌّ آمَنَ بِاللَّهِ وَمَلَائِكَتِهِ وَكُتُبِهِ وَرُسُلِهِ لَا نُفَرِّقُ بَيْنَ أَحَدٍ مِنْ رُسُلِهِ ۚ وَقَالُوا سَمِعْنَا وَأَطَعْنَا ۖ غُفْرَانَكَ رَبَّنَا وَإِلَيْكَ الْمَصِيرُ ۝ لَا يُكَلِّفُ اللَّهُ نَفْسًا إِلَّا وُسْعَهَا ۚ لَهَا مَا كَسَبَتْ وَعَلَيْهَا مَا اكْتَسَبَتْ ۗ رَبَّنَا لَا تُؤَاخِذْنَا إِنْ نَسِينَا أَوْ أَخْطَأْنَا ۚ رَبَّنَا وَلَا تَحْمِلْ عَلَيْنَا إِصْرًا كَمَا حَمَلْتَهُ عَلَى الَّذِينَ مِنْ قَبْلِنَا ۚ رَبَّنَا وَلَا تُحَمِّلْنَا مَا لَا طَاقَةَ لَنَا بِهِ ۖ وَاعْفُ عَنَّا وَاغْفِرْ لَنَا وَارْحَمْنَا ۚ أَنْتَ مَوْلَانَا فَانْصُرْنَا عَلَى الْقَوْمِ الْكَافِرِينَ",
    meaning: "The final two verses of Al-Baqarah (2:285–286).",
    count: 1,
    source: "صحيح البخاري 5009، وصحيح مسلم 808",
  },
  {
    id: "sleep-tasbih",
    category: "sleep",
    title: "تسبيح فاطمة رضي الله عنها",
    text: "سُبْحَانَ اللَّهِ (٣٣)، الْحَمْدُ لِلَّهِ (٣٣)، اللَّهُ أَكْبَرُ (٣٤)",
    meaning: "Say Subhan Allah 33 times, Alhamdulillah 33 times, and Allahu Akbar 34 times before sleeping.",
    count: 1,
    source: "صحيح البخاري 5362، وصحيح مسلم 2727",
  },
  {
    id: "sleep-dua",
    category: "sleep",
    title: "دعاء النوم",
    text: "بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا",
    transliteration: "Bismika Allahumma amutu wa ahya.",
    meaning: "In Your name, O Allah, I die and I live.",
    count: 1,
    source: "صحيح البخاري 6324",
  },
  {
    id: "wake-dua",
    category: "sleep",
    title: "دعاء الاستيقاظ",
    text: "الْحَمْدُ لِلَّهِ الَّذِي أَحْيَانَا بَعْدَ مَا أَمَاتَنَا وَإِلَيْهِ النُّشُورُ",
    transliteration: "Alhamdu lillahil-ladhi ahyana ba'da ma amatana wa ilayhin-nushur.",
    meaning: "Praise be to Allah who gave us life after causing us to die, and to Him is the resurrection.",
    count: 1,
    source: "صحيح البخاري 6312",
  },
  {
    id: "daily-leaving-home",
    category: "daily",
    title: "الخروج من المنزل",
    text: "بِسْمِ اللَّهِ، تَوَكَّلْتُ عَلَى اللَّهِ، وَلَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ",
    meaning: "In the name of Allah; I place my trust in Allah. There is no might nor power except through Allah.",
    count: 1,
    source: "سنن أبي داود 5095، وجامع الترمذي 3426",
  },
  {
    id: "daily-mosque-enter",
    category: "daily",
    title: "دخول المسجد",
    text: "اللَّهُمَّ افْتَحْ لِي أَبْوَابَ رَحْمَتِكَ",
    meaning: "O Allah, open for me the gates of Your mercy.",
    count: 1,
    source: "صحيح مسلم 713",
  },
  {
    id: "daily-mosque-leave",
    category: "daily",
    title: "الخروج من المسجد",
    text: "اللَّهُمَّ إِنِّي أَسْأَلُكَ مِنْ فَضْلِكَ",
    meaning: "O Allah, I ask You for Your bounty.",
    count: 1,
    source: "صحيح مسلم 713",
  },
  {
    id: "daily-eating",
    category: "daily",
    title: "قبل الطعام",
    text: "بِسْمِ اللَّهِ",
    transliteration: "Bismillah.",
    meaning: "In the name of Allah.",
    count: 1,
    source: "صحيح البخاري 5376، وصحيح مسلم 2022",
  },
  {
    id: "daily-eating-forgot",
    category: "daily",
    title: "إذا نسي التسمية في أوله",
    text: "بِسْمِ اللَّهِ أَوَّلَهُ وَآخِرَهُ",
    meaning: "In the name of Allah at its beginning and its end.",
    count: 1,
    source: "سنن أبي داود 3767، وجامع الترمذي 1858",
  },
  {
    id: "daily-after-eating",
    category: "daily",
    title: "بعد الطعام",
    text: "الْحَمْدُ لِلَّهِ الَّذِي أَطْعَمَنِي هَذَا وَرَزَقَنِيهِ مِنْ غَيْرِ حَوْلٍ مِنِّي وَلَا قُوَّةٍ",
    meaning: "Praise be to Allah who has fed me this and provided it for me without any power or strength on my part.",
    count: 1,
    source: "سنن أبي داود 4023، وجامع الترمذي 3458",
  },
  {
    id: "daily-praise",
    category: "daily",
    title: "التسبيح خلال اليوم",
    text: "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ",
    transliteration: "Subhan Allah wa bihamdih.",
    meaning: "Glory and praise be to Allah.",
    count: 100,
    source: "صحيح البخاري 6405، وصحيح مسلم 2692",
  },
  {
    id: "daily-tahlil",
    category: "daily",
    title: "كلمة التوحيد",
    text: "لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ، وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ",
    meaning: "There is no god but Allah alone, without partner. His is the dominion and praise, and He is capable of all things.",
    count: 100,
    source: "صحيح البخاري 3293، وصحيح مسلم 2691",
  },
];

export default function AzkarLibrary() {
  const [selectedCategory, setSelectedCategory] = useState<CategoryId | "all">("all");
  const [query, setQuery] = useState("");
  const [counts, setCounts] = useState<Record<string, number>>({});

  const visibleCategories = selectedCategory === "all"
    ? categories
    : categories.filter((category) => category.id === selectedCategory);

  const visibleAzkar = useMemo(() => {
    const searchTerm = query.trim().toLocaleLowerCase();
    return azkar.filter((dhikr) => {
      const matchesCategory = selectedCategory === "all" || dhikr.category === selectedCategory;
      const searchableText = `${dhikr.title} ${dhikr.text} ${dhikr.transliteration ?? ""} ${dhikr.meaning ?? ""} ${dhikr.source}`.toLocaleLowerCase();
      return matchesCategory && (!searchTerm || searchableText.includes(searchTerm));
    });
  }, [query, selectedCategory]);

  const completedCount = visibleAzkar.filter((dhikr) => (counts[dhikr.id] ?? 0) >= dhikr.count).length;

  return (
    <main dir="rtl" className="min-h-screen text-slate-900">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <nav className="mb-6 flex items-center justify-between gap-4">
          <Link
            href="/"
            className="rounded-full border border-emerald-200 bg-white/80 px-4 py-2 text-sm font-semibold text-emerald-800 transition hover:bg-emerald-50"
          >
            ← العودة إلى القرآن
          </Link>
          <span className="text-sm font-medium text-emerald-800">مستكشف القرآن</span>
        </nav>

        <header className="mb-8 overflow-hidden rounded-[30px] border border-emerald-900/10 bg-gradient-to-br from-emerald-950 via-emerald-900 to-teal-800 p-7 text-white shadow-xl shadow-emerald-950/15 sm:p-10">
          <p className="mb-3 text-sm font-semibold tracking-[0.18em] text-emerald-200">وردك اليومي</p>
          <h1 className="text-4xl font-black tracking-tight sm:text-5xl">الأذكار</h1>
          <p className="mt-4 max-w-2xl text-base leading-8 text-emerald-50 sm:text-lg">
            أذكار الصباح والمساء، وبعد الصلاة، وعند النوم والاستيقاظ، وأذكار لمواقف يومية.
          </p>
          <div className="mt-7 flex flex-wrap items-center gap-3">
            <span className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm">
              {visibleAzkar.length} ذكرًا
            </span>
            <span className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm">
              أتممت {completedCount} من {visibleAzkar.length}
            </span>
            {Object.values(counts).some((count) => count > 0) && (
              <button
                type="button"
                onClick={() => setCounts({})}
                className="rounded-full border border-white/20 px-4 py-2 text-sm font-medium text-emerald-50 transition hover:bg-white/10"
              >
                إعادة العد
              </button>
            )}
          </div>
        </header>

        <section className="mb-7 rounded-[24px] border border-slate-200 bg-white/85 p-4 shadow-sm backdrop-blur sm:p-5">
          <label className="mb-4 flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 focus-within:border-emerald-400 focus-within:ring-2 focus-within:ring-emerald-100">
            <span aria-hidden="true">⌕</span>
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="ابحث في الأذكار أو المصادر..."
              className="w-full bg-transparent text-slate-800 outline-none placeholder:text-slate-400"
              aria-label="ابحث في الأذكار"
            />
          </label>
          <div className="flex flex-wrap gap-2" aria-label="تصنيفات الأذكار">
            <button
              type="button"
              onClick={() => setSelectedCategory("all")}
              aria-pressed={selectedCategory === "all"}
              className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${selectedCategory === "all" ? "border-emerald-800 bg-emerald-800 text-white" : "border-slate-200 bg-white text-slate-700 hover:border-emerald-300"}`}
            >
              الكل
            </button>
            {categories.map((category) => (
              <button
                key={category.id}
                type="button"
                onClick={() => setSelectedCategory(category.id)}
                aria-pressed={selectedCategory === category.id}
                className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${selectedCategory === category.id ? "border-emerald-800 bg-emerald-800 text-white" : "border-slate-200 bg-white text-slate-700 hover:border-emerald-300"}`}
              >
                {category.title}
              </button>
            ))}
          </div>
        </section>

        <div className="space-y-10">
          {visibleCategories.map((category) => {
            const categoryAzkar = visibleAzkar.filter((dhikr) => dhikr.category === category.id);
            if (!categoryAzkar.length) return null;

            return (
              <section key={category.id} aria-labelledby={`${category.id}-heading`}>
                <div className="mb-4">
                  <h2 id={`${category.id}-heading`} className="text-2xl font-black text-slate-900 sm:text-3xl">
                    {category.title}
                  </h2>
                  <p className="mt-1 text-sm leading-6 text-slate-600">{category.description}</p>
                </div>
                <div className="grid gap-4 lg:grid-cols-2">
                  {categoryAzkar.map((dhikr, index) => {
                    const currentCount = counts[dhikr.id] ?? 0;
                    const isComplete = currentCount >= dhikr.count;

                    return (
                      <article
                        key={dhikr.id}
                        className="rounded-[24px] border border-emerald-900/10 bg-white/90 p-5 shadow-sm shadow-emerald-950/5 sm:p-6"
                      >
                        <div className="mb-4 flex items-start justify-between gap-4">
                          <div>
                            <span className="text-xs font-bold tracking-wider text-emerald-700">
                              {String(index + 1).padStart(2, "0")}
                            </span>
                            <h3 className="mt-1 text-lg font-bold text-slate-900">{dhikr.title}</h3>
                          </div>
                          <span className="shrink-0 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800">
                            {dhikr.count === 1 ? "مرة واحدة" : `${dhikr.count} مرات`}
                          </span>
                        </div>
                        <p className="text-right text-2xl leading-[2.1] text-emerald-950 sm:text-[1.7rem]">
                          {dhikr.text}
                        </p>
                        {dhikr.transliteration && (
                          <p dir="ltr" className="mt-4 text-left text-sm leading-6 text-slate-600">
                            {dhikr.transliteration}
                          </p>
                        )}
                        {dhikr.meaning && (
                          <p dir="ltr" className="mt-3 text-left text-sm leading-6 text-slate-600">
                            {dhikr.meaning}
                          </p>
                        )}
                        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
                          <p className="text-xs leading-5 text-slate-500">المصدر: {dhikr.source}</p>
                          <button
                            type="button"
                            onClick={() => setCounts((current) => ({
                              ...current,
                              [dhikr.id]: Math.min(dhikr.count, (current[dhikr.id] ?? 0) + 1),
                            }))}
                            disabled={isComplete}
                            aria-label={`${dhikr.title}: ${currentCount} من ${dhikr.count}`}
                            className={`min-w-28 rounded-full px-4 py-2 text-sm font-bold transition ${isComplete ? "bg-emerald-100 text-emerald-800" : "bg-emerald-800 text-white hover:bg-emerald-700"}`}
                          >
                            {isComplete ? "تم الورد ✓" : `${currentCount} / ${dhikr.count} · سَبِّح`}
                          </button>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </section>
            );
          })}
          {visibleAzkar.length === 0 && (
            <p className="rounded-2xl border border-slate-200 bg-white/85 p-8 text-center text-slate-600">
              لا توجد أذكار مطابقة. جرّب كلمة بحث أخرى.
            </p>
          )}
        </div>

        <footer className="mt-10 rounded-2xl border border-amber-200 bg-amber-50/90 p-5 text-sm leading-7 text-amber-950">
          هذه مجموعة مختارة من الأذكار الواردة في القرآن والسنة، مع ذكر مصادرها. قد تختلف أرقام الأحاديث بين الطبعات.
          يُرجى مراجعة المصادر عند الحاجة إلى التحقق من اللفظ أو الحكم.
        </footer>
      </div>
    </main>
  );
}
