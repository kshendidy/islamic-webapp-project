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
  { id: "morning", title: "أذكار الصباح", description: "أذكار وأدعية الصباح الواردة في السنة، مع أعدادها ومصادرها." },
  { id: "evening", title: "أذكار المساء", description: "أذكار وأدعية المساء الواردة في السنة، مع أعدادها ومصادرها." },
  { id: "prayer", title: "بعد الصلاة", description: "الأذكار التي تقال بعد الصلوات المفروضة، وأذكار مخصوصة بعد الفجر." },
  { id: "sleep", title: "النوم والاستيقاظ", description: "ما يقال ويفعل عند النوم وعند الاستيقاظ." },
  { id: "daily", title: "أذكار يومية", description: "أذكار المواقف المتكررة في اليوم: الطعام، السفر، المسجد، والشدائد وغيرها." },
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
    text: "اللَّهُمَّ إِنِّي أَسْأَلُكَ الْعَفْوَ وَالْعَافِيَةَ فِي الدُّنْيَا وَالْآخِرَةِ، اللَّهُمَّ إِنِّي أَسْأَلُكَ الْعَفْوَ وَالْعَافِيَةَ فِي دِينِي وَدُنْيَايَ وَأَهْلِي وَمَالِي، اللَّهُمَّ اسْتُرْ عَوْرَاتِي، وَآمِنْ رَوْعَاتِي، وَاحْفَظْنِي مِنْ بَيْنِ يَدَيَّ وَمِنْ خَلْفِي، وَعَنْ يَمِينِي وَعَنْ شِمَالِي، وَمِنْ فَوْقِي، وَأَعُوذُ بِعَظَمَتِكَ أَنْ أُغْتَالَ مِنْ تَحْتِي",
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
    text: "اللَّهُمَّ إِنِّي أَسْأَلُكَ الْعَفْوَ وَالْعَافِيَةَ فِي الدُّنْيَا وَالْآخِرَةِ، اللَّهُمَّ إِنِّي أَسْأَلُكَ الْعَفْوَ وَالْعَافِيَةَ فِي دِينِي وَدُنْيَايَ وَأَهْلِي وَمَالِي، اللَّهُمَّ اسْتُرْ عَوْرَاتِي، وَآمِنْ رَوْعَاتِي، وَاحْفَظْنِي مِنْ بَيْنِ يَدَيَّ وَمِنْ خَلْفِي، وَعَنْ يَمِينِي وَعَنْ شِمَالِي، وَمِنْ فَوْقِي، وَأَعُوذُ بِعَظَمَتِكَ أَنْ أُغْتَالَ مِنْ تَحْتِي",
    count: 1,
    source: "سنن أبي داود 5074",
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
    id: "daily-new-clothes",
    category: "daily",
    title: "عند لبس ثوب جديد",
    text: "الْحَمْدُ لِلَّهِ الَّذِي كَسَانِي هَذَا الثَّوْبَ وَرَزَقَنِيهِ مِنْ غَيْرِ حَوْلٍ مِنِّي وَلَا قُوَّةٍ",
    count: 1,
    source: "سنن أبي داود 4023، وجامع الترمذي 3458",
  },
  {
    id: "daily-adhan",
    category: "daily",
    title: "بعد الأذان",
    text: "اللَّهُمَّ رَبَّ هَذِهِ الدَّعْوَةِ التَّامَّةِ، وَالصَّلَاةِ الْقَائِمَةِ، آتِ مُحَمَّدًا الْوَسِيلَةَ وَالْفَضِيلَةَ، وَابْعَثْهُ مَقَامًا مَحْمُودًا الَّذِي وَعَدْتَهُ",
    count: 1,
    source: "صحيح البخاري 614",
  },
  {
    id: "daily-host",
    category: "daily",
    title: "الدعاء لمن أطعمك",
    text: "اللَّهُمَّ بَارِكْ لَهُمْ فِيمَا رَزَقْتَهُمْ، وَاغْفِرْ لَهُمْ وَارْحَمْهُمْ",
    count: 1,
    source: "صحيح مسلم 2042",
  },
  {
    id: "daily-sick-healing",
    category: "daily",
    title: "دعاء للمريض بالشفاء",
    text: "أَسْأَلُ اللَّهَ الْعَظِيمَ، رَبَّ الْعَرْشِ الْعَظِيمِ، أَنْ يَشْفِيَكَ",
    meaning: "The narration recommends repeating this supplication seven times when visiting a sick person.",
    count: 7,
    source: "جامع الترمذي 2083، وسنن أبي داود 3106",
  },
  {
    id: "daily-gathering",
    category: "daily",
    title: "كفارة المجلس",
    text: "سُبْحَانَكَ اللَّهُمَّ وَبِحَمْدِكَ، أَشْهَدُ أَنْ لَا إِلَهَ إِلَّا أَنْتَ، أَسْتَغْفِرُكَ وَأَتُوبُ إِلَيْكَ",
    count: 1,
    source: "سنن أبي داود 4859، وجامع الترمذي 3433",
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
  {
    id: "morning-witness",
    category: "morning",
    title: "الشهادة لله بالتوحيد",
    text: "اللَّهُمَّ إِنِّي أَصْبَحْتُ أُشْهِدُكَ، وَأُشْهِدُ حَمَلَةَ عَرْشِكَ، وَمَلَائِكَتَكَ، وَجَمِيعَ خَلْقِكَ، أَنَّكَ أَنْتَ اللَّهُ لَا إِلَهَ إِلَّا أَنْتَ وَحْدَكَ لَا شَرِيكَ لَكَ، وَأَنَّ مُحَمَّدًا عَبْدُكَ وَرَسُولُكَ",
    count: 4,
    source: "سنن أبي داود 5069",
  },
  {
    id: "morning-gratitude",
    category: "morning",
    title: "شكر نعمة الصباح",
    text: "اللَّهُمَّ مَا أَصْبَحَ بِي مِنْ نِعْمَةٍ أَوْ بِأَحَدٍ مِنْ خَلْقِكَ، فَمِنْكَ وَحْدَكَ لَا شَرِيكَ لَكَ، فَلَكَ الْحَمْدُ وَلَكَ الشُّكْرُ",
    count: 1,
    source: "سنن أبي داود 5073",
  },
  {
    id: "morning-health",
    category: "morning",
    title: "سؤال العافية",
    text: "اللَّهُمَّ عَافِنِي فِي بَدَنِي، اللَّهُمَّ عَافِنِي فِي سَمْعِي، اللَّهُمَّ عَافِنِي فِي بَصَرِي، لَا إِلَهَ إِلَّا أَنْتَ. اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْكُفْرِ وَالْفَقْرِ، وَأَعُوذُ بِكَ مِنْ عَذَابِ الْقَبْرِ، لَا إِلَهَ إِلَّا أَنْتَ",
    count: 3,
    source: "سنن أبي داود 5090",
  },
  {
    id: "morning-protection-from-evil",
    category: "morning",
    title: "الاستعاذة من شر النفس والشيطان",
    text: "اللَّهُمَّ فَاطِرَ السَّمَاوَاتِ وَالْأَرْضِ، عَالِمَ الْغَيْبِ وَالشَّهَادَةِ، رَبَّ كُلِّ شَيْءٍ وَمَلِيكَهُ، أَشْهَدُ أَنْ لَا إِلَهَ إِلَّا أَنْتَ، أَعُوذُ بِكَ مِنْ شَرِّ نَفْسِي، وَمِنْ شَرِّ الشَّيْطَانِ وَشِرْكِهِ",
    count: 1,
    source: "سنن أبي داود 5067، وجامع الترمذي 3529",
  },
  {
    id: "morning-tasbih",
    category: "morning",
    title: "تسبيح جامع",
    text: "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ، عَدَدَ خَلْقِهِ، وَرِضَا نَفْسِهِ، وَزِنَةَ عَرْشِهِ، وَمِدَادَ كَلِمَاتِهِ",
    meaning: "The Prophet ﷺ taught this remembrance to be said three times in the morning.",
    count: 3,
    source: "صحيح مسلم 2726",
  },
  {
    id: "evening-witness",
    category: "evening",
    title: "الشهادة لله بالتوحيد",
    text: "اللَّهُمَّ إِنِّي أَمْسَيْتُ أُشْهِدُكَ، وَأُشْهِدُ حَمَلَةَ عَرْشِكَ، وَمَلَائِكَتَكَ، وَجَمِيعَ خَلْقِكَ، أَنَّكَ أَنْتَ اللَّهُ لَا إِلَهَ إِلَّا أَنْتَ وَحْدَكَ لَا شَرِيكَ لَكَ، وَأَنَّ مُحَمَّدًا عَبْدُكَ وَرَسُولُكَ",
    count: 4,
    source: "سنن أبي داود 5069",
  },
  {
    id: "evening-gratitude",
    category: "evening",
    title: "شكر نعمة المساء",
    text: "اللَّهُمَّ مَا أَمْسَى بِي مِنْ نِعْمَةٍ أَوْ بِأَحَدٍ مِنْ خَلْقِكَ، فَمِنْكَ وَحْدَكَ لَا شَرِيكَ لَكَ، فَلَكَ الْحَمْدُ وَلَكَ الشُّكْرُ",
    count: 1,
    source: "سنن أبي داود 5073",
  },
  {
    id: "evening-health",
    category: "evening",
    title: "سؤال العافية",
    text: "اللَّهُمَّ عَافِنِي فِي بَدَنِي، اللَّهُمَّ عَافِنِي فِي سَمْعِي، اللَّهُمَّ عَافِنِي فِي بَصَرِي، لَا إِلَهَ إِلَّا أَنْتَ. اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْكُفْرِ وَالْفَقْرِ، وَأَعُوذُ بِكَ مِنْ عَذَابِ الْقَبْرِ، لَا إِلَهَ إِلَّا أَنْتَ",
    count: 3,
    source: "سنن أبي داود 5090",
  },
  {
    id: "evening-protection-from-evil",
    category: "evening",
    title: "الاستعاذة من شر النفس والشيطان",
    text: "اللَّهُمَّ فَاطِرَ السَّمَاوَاتِ وَالْأَرْضِ، عَالِمَ الْغَيْبِ وَالشَّهَادَةِ، رَبَّ كُلِّ شَيْءٍ وَمَلِيكَهُ، أَشْهَدُ أَنْ لَا إِلَهَ إِلَّا أَنْتَ، أَعُوذُ بِكَ مِنْ شَرِّ نَفْسِي، وَمِنْ شَرِّ الشَّيْطَانِ وَشِرْكِهِ",
    count: 1,
    source: "سنن أبي داود 5067، وجامع الترمذي 3529",
  },
  {
    id: "daily-creation-refuge",
    category: "daily",
    title: "الاستعاذة من شر المخلوقات",
    text: "أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ",
    meaning: "I seek refuge in the perfect words of Allah from the evil of what He has created.",
    count: 1,
    source: "صحيح مسلم 2708",
  },
  {
    id: "prayer-tahlil",
    category: "prayer",
    title: "التهليل بعد الصلاة",
    text: "لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ، وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ. اللَّهُمَّ لَا مَانِعَ لِمَا أَعْطَيْتَ، وَلَا مُعْطِيَ لِمَا مَنَعْتَ، وَلَا يَنْفَعُ ذَا الْجَدِّ مِنْكَ الْجَدُّ",
    count: 1,
    source: "صحيح البخاري 844، وصحيح مسلم 593",
  },
  {
    id: "prayer-aid",
    category: "prayer",
    title: "الاستعانة على الذكر",
    text: "اللَّهُمَّ أَعِنِّي عَلَى ذِكْرِكَ، وَشُكْرِكَ، وَحُسْنِ عِبَادَتِكَ",
    meaning: "The Prophet ﷺ advised Mu'adh to say this after every prayer.",
    count: 1,
    source: "سنن أبي داود 1522، وسنن النسائي 1303",
  },
  {
    id: "prayer-fajr-sustenance",
    category: "prayer",
    title: "دعاء بعد صلاة الفجر",
    text: "اللَّهُمَّ إِنِّي أَسْأَلُكَ عِلْمًا نَافِعًا، وَرِزْقًا طَيِّبًا، وَعَمَلًا مُتَقَبَّلًا",
    meaning: "The Prophet ﷺ would say this after the Fajr prayer.",
    count: 1,
    source: "سنن ابن ماجه 925",
  },
  {
    id: "prayer-fajr-tahlil",
    category: "prayer",
    title: "ذكر بعد صلاة الفجر",
    text: "لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ، يُحْيِي وَيُمِيتُ، وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ",
    meaning: "The narration specifies saying this ten times after Fajr, before speaking.",
    count: 10,
    source: "جامع الترمذي 3474",
  },
  {
    id: "prayer-tasbih-variant",
    category: "prayer",
    title: "صيغة أخرى للتسبيح بعد الصلاة",
    text: "سُبْحَانَ اللَّهِ (٣٣)، الْحَمْدُ لِلَّهِ (٣٣)، اللَّهُ أَكْبَرُ (٣٤)",
    meaning: "A narrated alternative: Subhan Allah 33 times, Alhamdulillah 33 times, and Allahu Akbar 34 times.",
    count: 1,
    source: "صحيح البخاري 843، وصحيح مسلم 595",
  },
  {
    id: "sleep-surrender",
    category: "sleep",
    title: "تفويض الأمر إلى الله",
    text: "اللَّهُمَّ أَسْلَمْتُ وَجْهِي إِلَيْكَ، وَفَوَّضْتُ أَمْرِي إِلَيْكَ، وَأَلْجَأْتُ ظَهْرِي إِلَيْكَ، رَغْبَةً وَرَهْبَةً إِلَيْكَ، لَا مَلْجَأَ وَلَا مَنْجَا مِنْكَ إِلَّا إِلَيْكَ، آمَنْتُ بِكِتَابِكَ الَّذِي أَنْزَلْتَ، وَبِنَبِيِّكَ الَّذِي أَرْسَلْتَ",
    meaning: "The Prophet ﷺ instructed saying this after performing wudu and lying on the right side.",
    count: 1,
    source: "صحيح البخاري 6311، وصحيح مسلم 2710",
  },
  {
    id: "sleep-place-side",
    category: "sleep",
    title: "عند وضع الجنب",
    text: "بِاسْمِكَ رَبِّي وَضَعْتُ جَنْبِي، وَبِكَ أَرْفَعُهُ، فَإِنْ أَمْسَكْتَ نَفْسِي فَارْحَمْهَا، وَإِنْ أَرْسَلْتَهَا فَاحْفَظْهَا بِمَا تَحْفَظُ بِهِ عِبَادَكَ الصَّالِحِينَ",
    count: 1,
    source: "صحيح البخاري 6320، وصحيح مسلم 2714",
  },
  {
    id: "sleep-refuge",
    category: "sleep",
    title: "الاستعاذة من عذاب يوم البعث",
    text: "اللَّهُمَّ قِنِي عَذَابَكَ يَوْمَ تَبْعَثُ عِبَادَكَ",
    meaning: "Reported as a supplication at bedtime; the grading of the specified repetition count differs.",
    count: 1,
    source: "سنن أبي داود 5045",
  },
  {
    id: "sleep-provision",
    category: "sleep",
    title: "الحمد على النعم قبل النوم",
    text: "الْحَمْدُ لِلَّهِ الَّذِي أَطْعَمَنَا وَسَقَانَا، وَكَفَانَا وَآوَانَا، فَكَمْ مِمَّنْ لَا كَافِيَ لَهُ وَلَا مُؤْوِيَ",
    count: 1,
    source: "صحيح مسلم 2715",
  },
  {
    id: "sleep-three-surahs",
    category: "sleep",
    title: "قراءة المعوذات قبل النوم",
    text: "سورة الإخلاص، وسورة الفلق، وسورة الناس",
    meaning: "Cup the hands, recite the three surahs, blow into the hands, and wipe over the body. Repeat this three times.",
    count: 3,
    source: "صحيح البخاري 5017",
  },
  {
    id: "sleep-allah-first-last",
    category: "sleep",
    title: "دعاء قبل النوم",
    text: "اللَّهُمَّ رَبَّ السَّمَاوَاتِ السَّبْعِ وَرَبَّ الْعَرْشِ الْعَظِيمِ، رَبَّنَا وَرَبَّ كُلِّ شَيْءٍ، فَالِقَ الْحَبِّ وَالنَّوَى، وَمُنْزِلَ التَّوْرَاةِ وَالْإِنْجِيلِ وَالْفُرْقَانِ، أَعُوذُ بِكَ مِنْ شَرِّ كُلِّ شَيْءٍ أَنْتَ آخِذٌ بِنَاصِيَتِهِ. اللَّهُمَّ أَنْتَ الْأَوَّلُ فَلَيْسَ قَبْلَكَ شَيْءٌ، وَأَنْتَ الْآخِرُ فَلَيْسَ بَعْدَكَ شَيْءٌ، وَأَنْتَ الظَّاهِرُ فَلَيْسَ فَوْقَكَ شَيْءٌ، وَأَنْتَ الْبَاطِنُ فَلَيْسَ دُونَكَ شَيْءٌ، اقْضِ عَنَّا الدَّيْنَ وَأَغْنِنَا مِنَ الْفَقْرِ",
    count: 1,
    source: "صحيح مسلم 2713",
  },
  {
    id: "sleep-waking-night",
    category: "sleep",
    title: "إذا استيقظ من الليل",
    text: "لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ، وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ، وَالْحَمْدُ لِلَّهِ، وَسُبْحَانَ اللَّهِ، وَلَا إِلَهَ إِلَّا اللَّهُ، وَاللَّهُ أَكْبَرُ، وَلَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ",
    meaning: "The narration mentions saying this upon waking in the night, then asking Allah for forgiveness or supplicating.",
    count: 1,
    source: "صحيح البخاري 1154",
  },
  {
    id: "sleep-bad-dream",
    category: "sleep",
    title: "إذا رأى ما يكره في المنام",
    text: "يَتَعَوَّذُ بِاللَّهِ مِنَ الشَّيْطَانِ وَمِنْ شَرِّ مَا رَأَى",
    meaning: "Seek refuge in Allah from Satan and from the evil of the dream, spit lightly to the left three times, and do not relate it.",
    count: 3,
    source: "صحيح البخاري 6986، وصحيح مسلم 2261",
  },
  {
    id: "daily-bathroom-enter",
    category: "daily",
    title: "دخول الخلاء",
    text: "اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْخُبُثِ وَالْخَبَائِثِ",
    count: 1,
    source: "صحيح البخاري 142، وصحيح مسلم 375",
  },
  {
    id: "daily-bathroom-leave",
    category: "daily",
    title: "الخروج من الخلاء",
    text: "غُفْرَانَكَ",
    transliteration: "Ghufranak.",
    meaning: "I ask Your forgiveness.",
    count: 1,
    source: "سنن أبي داود 30، وجامع الترمذي 7",
  },
  {
    id: "daily-after-wudu",
    category: "daily",
    title: "بعد الوضوء",
    text: "أَشْهَدُ أَنْ لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، وَأَشْهَدُ أَنَّ مُحَمَّدًا عَبْدُهُ وَرَسُولُهُ. اللَّهُمَّ اجْعَلْنِي مِنَ التَّوَّابِينَ، وَاجْعَلْنِي مِنَ الْمُتَطَهِّرِينَ",
    count: 1,
    source: "صحيح مسلم 234، وجامع الترمذي 55",
  },
  {
    id: "daily-sneeze",
    category: "daily",
    title: "التشميت عند العطاس",
    text: "إذا عطس المسلم فحمد الله، قيل له: يَرْحَمُكَ اللَّهُ، فيقول: يَهْدِيكُمُ اللَّهُ وَيُصْلِحُ بَالَكُمْ",
    meaning: "When someone sneezes and praises Allah, say “Yarhamuk Allah.” They reply “Yahdikum Allah wa yuslihu balakum.”",
    count: 1,
    source: "صحيح البخاري 6224",
  },
  {
    id: "daily-anger",
    category: "daily",
    title: "عند الغضب",
    text: "أَعُوذُ بِاللَّهِ مِنَ الشَّيْطَانِ الرَّجِيمِ",
    meaning: "The Prophet ﷺ instructed seeking refuge in Allah from Satan when anger arises.",
    count: 1,
    source: "صحيح البخاري 3282، وصحيح مسلم 2610",
  },
  {
    id: "daily-distress",
    category: "daily",
    title: "دعاء الكرب",
    text: "لَا إِلَهَ إِلَّا اللَّهُ الْعَظِيمُ الْحَلِيمُ، لَا إِلَهَ إِلَّا اللَّهُ رَبُّ السَّمَاوَاتِ وَالْأَرْضِ وَرَبُّ الْعَرْشِ الْعَظِيمِ",
    count: 1,
    source: "صحيح البخاري 6345، وصحيح مسلم 2730",
  },
  {
    id: "daily-worry",
    category: "daily",
    title: "الاستعاذة من الهم والحزن",
    text: "اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْهَمِّ وَالْحَزَنِ، وَالْعَجْزِ وَالْكَسَلِ، وَالْجُبْنِ وَالْبُخْلِ، وَضَلَعِ الدَّيْنِ، وَغَلَبَةِ الرِّجَالِ",
    count: 1,
    source: "صحيح البخاري 6369",
  },
  {
    id: "daily-calamity",
    category: "daily",
    title: "عند المصيبة",
    text: "إِنَّا لِلَّهِ وَإِنَّا إِلَيْهِ رَاجِعُونَ، اللَّهُمَّ أْجُرْنِي فِي مُصِيبَتِي، وَأَخْلِفْ لِي خَيْرًا مِنْهَا",
    count: 1,
    source: "صحيح مسلم 918",
  },
  {
    id: "daily-rain",
    category: "daily",
    title: "عند نزول المطر",
    text: "اللَّهُمَّ صَيِّبًا نَافِعًا",
    transliteration: "Allahumma sayyiban nafi'an.",
    meaning: "O Allah, make it a beneficial rain.",
    count: 1,
    source: "صحيح البخاري 1032",
  },
  {
    id: "daily-after-rain",
    category: "daily",
    title: "بعد نزول المطر",
    text: "مُطِرْنَا بِفَضْلِ اللَّهِ وَرَحْمَتِهِ",
    count: 1,
    source: "صحيح البخاري 846، وصحيح مسلم 71",
  },
  {
    id: "daily-travel",
    category: "daily",
    title: "دعاء السفر",
    text: "اللَّهُ أَكْبَرُ، اللَّهُ أَكْبَرُ، اللَّهُ أَكْبَرُ، سُبْحَانَ الَّذِي سَخَّرَ لَنَا هَذَا وَمَا كُنَّا لَهُ مُقْرِنِينَ، وَإِنَّا إِلَى رَبِّنَا لَمُنْقَلِبُونَ. اللَّهُمَّ إِنَّا نَسْأَلُكَ فِي سَفَرِنَا هَذَا الْبِرَّ وَالتَّقْوَى، وَمِنَ الْعَمَلِ مَا تَرْضَى، اللَّهُمَّ هَوِّنْ عَلَيْنَا سَفَرَنَا هَذَا، وَاطْوِ عَنَّا بُعْدَهُ، اللَّهُمَّ أَنْتَ الصَّاحِبُ فِي السَّفَرِ، وَالْخَلِيفَةُ فِي الْأَهْلِ، اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنْ وَعْثَاءِ السَّفَرِ، وَكَآبَةِ الْمَنْظَرِ، وَسُوءِ الْمُنْقَلَبِ فِي الْمَالِ وَالْأَهْلِ",
    meaning: "On returning, the Prophet ﷺ would say the same supplication and add: آيِبُونَ تَائِبُونَ عَابِدُونَ لِرَبِّنَا حَامِدُونَ.",
    count: 1,
    source: "صحيح مسلم 1342",
  },
  {
    id: "daily-iftar",
    category: "daily",
    title: "عند الإفطار",
    text: "ذَهَبَ الظَّمَأُ، وَابْتَلَّتِ الْعُرُوقُ، وَثَبَتَ الْأَجْرُ إِنْ شَاءَ اللَّهُ",
    count: 1,
    source: "سنن أبي داود 2357",
  },
  {
    id: "daily-visiting-sick",
    category: "daily",
    title: "ما يقال للمريض",
    text: "لَا بَأْسَ، طَهُورٌ إِنْ شَاءَ اللَّهُ",
    meaning: "No harm; may it be a purification, if Allah wills.",
    count: 1,
    source: "صحيح البخاري 5656",
  },
  {
    id: "daily-visiting-graves",
    category: "daily",
    title: "زيارة القبور",
    text: "السَّلَامُ عَلَيْكُمْ أَهْلَ الدِّيَارِ مِنَ الْمُؤْمِنِينَ وَالْمُسْلِمِينَ، وَإِنَّا إِنْ شَاءَ اللَّهُ بِكُمْ لَاحِقُونَ، أَسْأَلُ اللَّهَ لَنَا وَلَكُمُ الْعَافِيَةَ",
    count: 1,
    source: "صحيح مسلم 975",
  },
  {
    id: "daily-riding",
    category: "daily",
    title: "ركوب وسيلة السفر",
    text: "سُبْحَانَ الَّذِي سَخَّرَ لَنَا هَذَا وَمَا كُنَّا لَهُ مُقْرِنِينَ، وَإِنَّا إِلَى رَبِّنَا لَمُنْقَلِبُونَ",
    meaning: "Glory be to Him who has subjected this to us, and we could not have done so ourselves; and to our Lord we will return. (Quran 43:13–14)",
    count: 1,
    source: "القرآن الكريم، سورة الزخرف: 13–14",
  },
  {
    id: "daily-istighfar",
    category: "daily",
    title: "الإكثار من الاستغفار",
    text: "أَسْتَغْفِرُ اللَّهَ وَأَتُوبُ إِلَيْهِ",
    meaning: "The Prophet ﷺ said he sought Allah's forgiveness and repented to Him more than seventy times a day.",
    count: 100,
    source: "صحيح مسلم 2702، وصحيح البخاري 6307",
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
          <p className="mb-3 text-sm font-semibold tracking-[0.18em] text-emerald-200">          أذكار اليوم والليلة</p>
          <h1 className="text-4xl font-black tracking-tight sm:text-5xl">الأذكار</h1>
          <p className="mt-4 max-w-2xl text-base leading-8 text-emerald-50 sm:text-lg">
            مجموعة موسعة من أذكار الصباح والمساء وبعد الصلاة والنوم والاستيقاظ، وأدعية المواقف اليومية، مع أعداد التكرار ومراجع الأحاديث.
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
          تضم هذه الصفحة أشهر الأذكار اليومية الواردة في القرآن والسنة، وليست حصرًا لكل دعاء أو رواية. قد تختلف ألفاظ الروايات وأرقام الأحاديث وأحكامها بين المصادر والطبعات؛ راجع المصدر للتحقق من اللفظ والدرجة.
        </footer>
      </div>
    </main>
  );
}
