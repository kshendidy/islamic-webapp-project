"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type CategoryId = "morning" | "evening" | "prayer" | "bedtime" | "waking" | "daily";

type Dhikr = {
  id: string;
  category: CategoryId;
  title: string;
  text: string;
  verses?: { number: number; text: string }[];
  transliteration?: string;
  meaning?: string;
  count: number;
  source: string;
};

const categories: { id: CategoryId; title: string; description: string; descriptionEn: string }[] = [
  { id: "morning", title: "أذكار الصباح", description: "أذكار وأدعية الصباح الواردة في السنة، مع أعدادها ومصادرها.", descriptionEn: "Prophetic morning remembrances and supplications, with repetition counts and sources." },
  { id: "evening", title: "أذكار المساء", description: "أذكار وأدعية المساء الواردة في السنة، مع أعدادها ومصادرها.", descriptionEn: "Prophetic evening remembrances and supplications, with repetition counts and sources." },
  { id: "prayer", title: "بعد الصلاة", description: "الأذكار التي تقال بعد الصلوات المفروضة، وأذكار مخصوصة بعد الفجر.", descriptionEn: "Remembrances after the obligatory prayers, including some specific to Fajr." },
  { id: "bedtime", title: "أذكار قبل النوم", description: "الأذكار والأدعية التي تقال عند إرادة النوم.", descriptionEn: "Remembrances and supplications for before going to sleep." },
  { id: "waking", title: "أذكار بعد الاستيقاظ", description: "ما يقال عند الاستيقاظ صباحًا أو من نوم الليل.", descriptionEn: "What to say when waking in the morning or during the night." },
  { id: "daily", title: "أذكار يومية", description: "أذكار المواقف المتكررة في اليوم: الطعام، السفر، المسجد، والشدائد وغيرها.", descriptionEn: "Remembrances for everyday occasions such as eating, travel, the mosque, and hardship." },
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
    category: "bedtime",
    title: "آية الكرسي",
    text: "اللَّهُ لَا إِلَهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ۚ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ ۚ لَهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ ۗ مَنْ ذَا الَّذِي يَشْفَعُ عِنْدَهُ إِلَّا بِإِذْنِهِ ۚ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ ۖ وَلَا يُحِيطُونَ بِشَيْءٍ مِنْ عِلْمِهِ إِلَّا بِمَا شَاءَ ۚ وَسِعَ كُرْسِيُّهُ السَّمَاوَاتِ وَالْأَرْضَ ۖ وَلَا يَئُودُهُ حِفْظُهُمَا ۚ وَهُوَ الْعَلِيُّ الْعَظِيمُ",
    meaning: "Recite Ayat al-Kursi before sleeping. (Quran 2:255)",
    count: 1,
    source: "القرآن الكريم، سورة البقرة: 255؛ صحيح البخاري 2311",
  },
  {
    id: "sleep-last-verses",
    category: "bedtime",
    title: "آخر آيتين من سورة البقرة",
    text: "آمَنَ الرَّسُولُ بِمَا أُنْزِلَ إِلَيْهِ مِنْ رَبِّهِ وَالْمُؤْمِنُونَ ۚ كُلٌّ آمَنَ بِاللَّهِ وَمَلَائِكَتِهِ وَكُتُبِهِ وَرُسُلِهِ لَا نُفَرِّقُ بَيْنَ أَحَدٍ مِنْ رُسُلِهِ ۚ وَقَالُوا سَمِعْنَا وَأَطَعْنَا ۖ غُفْرَانَكَ رَبَّنَا وَإِلَيْكَ الْمَصِيرُ ۝ لَا يُكَلِّفُ اللَّهُ نَفْسًا إِلَّا وُسْعَهَا ۚ لَهَا مَا كَسَبَتْ وَعَلَيْهَا مَا اكْتَسَبَتْ ۗ رَبَّنَا لَا تُؤَاخِذْنَا إِنْ نَسِينَا أَوْ أَخْطَأْنَا ۚ رَبَّنَا وَلَا تَحْمِلْ عَلَيْنَا إِصْرًا كَمَا حَمَلْتَهُ عَلَى الَّذِينَ مِنْ قَبْلِنَا ۚ رَبَّنَا وَلَا تُحَمِّلْنَا مَا لَا طَاقَةَ لَنَا بِهِ ۖ وَاعْفُ عَنَّا وَاغْفِرْ لَنَا وَارْحَمْنَا ۚ أَنْتَ مَوْلَانَا فَانْصُرْنَا عَلَى الْقَوْمِ الْكَافِرِينَ",
    meaning: "The final two verses of Al-Baqarah (2:285–286).",
    count: 1,
    source: "صحيح البخاري 5009، وصحيح مسلم 808",
  },
  {
    id: "sleep-tasbih",
    category: "bedtime",
    title: "تسبيح فاطمة رضي الله عنها",
    text: "سُبْحَانَ اللَّهِ (٣٣)، الْحَمْدُ لِلَّهِ (٣٣)، اللَّهُ أَكْبَرُ (٣٤)",
    meaning: "Say Subhan Allah 33 times, Alhamdulillah 33 times, and Allahu Akbar 34 times before sleeping.",
    count: 1,
    source: "صحيح البخاري 5362، وصحيح مسلم 2727",
  },
  {
    id: "sleep-dua",
    category: "bedtime",
    title: "دعاء النوم",
    text: "بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا",
    transliteration: "Bismika Allahumma amutu wa ahya.",
    meaning: "In Your name, O Allah, I die and I live.",
    count: 1,
    source: "صحيح البخاري 6324",
  },
  {
    id: "wake-dua",
    category: "waking",
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
    category: "bedtime",
    title: "تفويض الأمر إلى الله",
    text: "اللَّهُمَّ أَسْلَمْتُ وَجْهِي إِلَيْكَ، وَفَوَّضْتُ أَمْرِي إِلَيْكَ، وَأَلْجَأْتُ ظَهْرِي إِلَيْكَ، رَغْبَةً وَرَهْبَةً إِلَيْكَ، لَا مَلْجَأَ وَلَا مَنْجَا مِنْكَ إِلَّا إِلَيْكَ، آمَنْتُ بِكِتَابِكَ الَّذِي أَنْزَلْتَ، وَبِنَبِيِّكَ الَّذِي أَرْسَلْتَ",
    meaning: "The Prophet ﷺ instructed saying this after performing wudu and lying on the right side.",
    count: 1,
    source: "صحيح البخاري 6311، وصحيح مسلم 2710",
  },
  {
    id: "sleep-place-side",
    category: "bedtime",
    title: "عند وضع الجنب",
    text: "بِاسْمِكَ رَبِّي وَضَعْتُ جَنْبِي، وَبِكَ أَرْفَعُهُ، فَإِنْ أَمْسَكْتَ نَفْسِي فَارْحَمْهَا، وَإِنْ أَرْسَلْتَهَا فَاحْفَظْهَا بِمَا تَحْفَظُ بِهِ عِبَادَكَ الصَّالِحِينَ",
    count: 1,
    source: "صحيح البخاري 6320، وصحيح مسلم 2714",
  },
  {
    id: "sleep-refuge",
    category: "bedtime",
    title: "الاستعاذة من عذاب يوم البعث",
    text: "اللَّهُمَّ قِنِي عَذَابَكَ يَوْمَ تَبْعَثُ عِبَادَكَ",
    meaning: "Reported as a supplication at bedtime; the grading of the specified repetition count differs.",
    count: 1,
    source: "سنن أبي داود 5045",
  },
  {
    id: "sleep-provision",
    category: "bedtime",
    title: "الحمد على النعم قبل النوم",
    text: "الْحَمْدُ لِلَّهِ الَّذِي أَطْعَمَنَا وَسَقَانَا، وَكَفَانَا وَآوَانَا، فَكَمْ مِمَّنْ لَا كَافِيَ لَهُ وَلَا مُؤْوِيَ",
    count: 1,
    source: "صحيح مسلم 2715",
  },
  {
    id: "sleep-three-surahs",
    category: "bedtime",
    title: "قراءة المعوذات قبل النوم",
    text: "سورة الإخلاص، وسورة الفلق، وسورة الناس",
    meaning: "Cup the hands, recite the three surahs, blow into the hands, and wipe over the body. Repeat this three times.",
    count: 3,
    source: "صحيح البخاري 5017",
  },
  {
    id: "sleep-allah-first-last",
    category: "bedtime",
    title: "دعاء قبل النوم",
    text: "اللَّهُمَّ رَبَّ السَّمَاوَاتِ السَّبْعِ وَرَبَّ الْعَرْشِ الْعَظِيمِ، رَبَّنَا وَرَبَّ كُلِّ شَيْءٍ، فَالِقَ الْحَبِّ وَالنَّوَى، وَمُنْزِلَ التَّوْرَاةِ وَالْإِنْجِيلِ وَالْفُرْقَانِ، أَعُوذُ بِكَ مِنْ شَرِّ كُلِّ شَيْءٍ أَنْتَ آخِذٌ بِنَاصِيَتِهِ. اللَّهُمَّ أَنْتَ الْأَوَّلُ فَلَيْسَ قَبْلَكَ شَيْءٌ، وَأَنْتَ الْآخِرُ فَلَيْسَ بَعْدَكَ شَيْءٌ، وَأَنْتَ الظَّاهِرُ فَلَيْسَ فَوْقَكَ شَيْءٌ، وَأَنْتَ الْبَاطِنُ فَلَيْسَ دُونَكَ شَيْءٌ، اقْضِ عَنَّا الدَّيْنَ وَأَغْنِنَا مِنَ الْفَقْرِ",
    count: 1,
    source: "صحيح مسلم 2713",
  },
  {
    id: "wake-waking-night",
    category: "waking",
    title: "إذا استيقظ من الليل",
    text: "لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ، وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ، وَالْحَمْدُ لِلَّهِ، وَسُبْحَانَ اللَّهِ، وَلَا إِلَهَ إِلَّا اللَّهُ، وَاللَّهُ أَكْبَرُ، وَلَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ",
    meaning: "The narration mentions saying this upon waking in the night, then asking Allah for forgiveness or supplicating.",
    count: 1,
    source: "صحيح البخاري 1154",
  },
  {
    id: "wake-bad-dream",
    category: "waking",
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
  {
    id: "bedtime-kafirun",
    category: "bedtime",
    title: "قراءة سورة الكافرون",
    text: "قُلْ يَا أَيُّهَا الْكَافِرُونَ",
    meaning: "Recite Surah Al-Kafirun before sleeping; it was described as a disavowal of shirk.",
    count: 1,
    source: "سنن أبي داود 5055",
  },
  {
    id: "bedtime-dust-bedding",
    category: "bedtime",
    title: "نفض الفراش قبل النوم",
    text: "بِاسْمِكَ رَبِّ وَضَعْتُ جَنْبِي",
    meaning: "Dust the bed three times before lying down, then say this supplication.",
    count: 3,
    source: "صحيح البخاري 6320، وصحيح مسلم 2714",
  },
  {
    id: "bedtime-sleeping-on-right",
    category: "bedtime",
    title: "النوم على الشق الأيمن",
    text: "اضْطَجِعْ عَلَى شِقِّكَ الْأَيْمَنِ",
    meaning: "The Prophet ﷺ instructed lying on the right side after performing wudu.",
    count: 1,
    source: "صحيح البخاري 6311، وصحيح مسلم 2710",
  },
  {
    id: "bedtime-mulk-sajdah",
    category: "bedtime",
    title: "سورتا السجدة والملك",
    text: "سورة السجدة، وسورة الملك",
    meaning: "A narration reports that the Prophet ﷺ would not sleep until reciting these two surahs; scholars have discussed the report's grading.",
    count: 1,
    source: "جامع الترمذي 3404",
  },
  {
    id: "wake-last-verses-imran",
    category: "waking",
    title: "العشر الآيات الأخيرة من سورة آل عمران",
    text: "",
    verses: [
      { number: 191, text: "ٱلَّذِينَ يَذْكُرُونَ ٱللَّهَ قِيَٰمًۭا وَقُعُودًۭا وَعَلَىٰ جُنُوبِهِمْ وَيَتَفَكَّرُونَ فِى خَلْقِ ٱلسَّمَٰوَٰتِ وَٱلْأَرْضِ رَبَّنَا مَا خَلَقْتَ هَٰذَا بَٰطِلًۭا سُبْحَٰنَكَ فَقِنَا عَذَابَ ٱلنَّارِ" },
      { number: 192, text: "رَبَّنَآ إِنَّكَ مَن تُدْخِلِ ٱلنَّارَ فَقَدْ أَخْزَيْتَهُۥ ۖ وَمَا لِلظَّٰلِمِينَ مِنْ أَنصَارٍۢ" },
      { number: 193, text: "رَّبَّنَآ إِنَّنَا سَمِعْنَا مُنَادِيًۭا يُنَادِى لِلْإِيمَٰنِ أَنْ ءَامِنُوا۟ بِرَبِّكُمْ فَـَٔامَنَّا ۚ رَبَّنَا فَٱغْفِرْ لَنَا ذُنُوبَنَا وَكَفِّرْ عَنَّا سَيِّـَٔاتِنَا وَتَوَفَّنَا مَعَ ٱلْأَبْرَارِ" },
      { number: 194, text: "رَبَّنَا وَءَاتِنَا مَا وَعَدتَّنَا عَلَىٰ رُسُلِكَ وَلَا تُخْزِنَا يَوْمَ ٱلْقِيَٰمَةِ ۗ إِنَّكَ لَا تُخْلِفُ ٱلْمِيعَادَ" },
      { number: 195, text: "فَٱسْتَجَابَ لَهُمْ رَبُّهُمْ أَنِّى لَآ أُضِيعُ عَمَلَ عَٰمِلٍۢ مِّنكُم مِّن ذَكَرٍ أَوْ أُنثَىٰ ۖ بَعْضُكُم مِّنۢ بَعْضٍۢ ۖ فَٱلَّذِينَ هَاجَرُوا۟ وَأُخْرِجُوا۟ مِن دِيَٰرِهِمْ وَأُوذُوا۟ فِى سَبِيلِى وَقَٰتَلُوا۟ وَقُتِلُوا۟ لَأُكَفِّرَنَّ عَنْهُمْ سَيِّـَٔاتِهِمْ وَلَأُدْخِلَنَّهُمْ جَنَّٰتٍۢ تَجْرِى مِن تَحْتِهَا ٱلْأَنْهَٰرُ ثَوَابًۭا مِّنْ عِندِ ٱللَّهِ ۗ وَٱللَّهُ عِندَهُۥ حُسْنُ ٱلثَّوَابِ" },
      { number: 196, text: "لَا يَغُرَّنَّكَ تَقَلُّبُ ٱلَّذِينَ كَفَرُوا۟ فِى ٱلْبِلَٰدِ" },
      { number: 197, text: "مَتَٰعٌۭ قَلِيلٌۭ ثُمَّ مَأْوَىٰهُمْ جَهَنَّمُ ۚ وَبِئْسَ ٱلْمِهَادُ" },
      { number: 198, text: "لَٰكِنِ ٱلَّذِينَ ٱتَّقَوْا۟ رَبَّهُمْ لَهُمْ جَنَّٰتٌۭ تَجْرِى مِن تَحْتِهَا ٱلْأَنْهَٰرُ خَٰلِدِينَ فِيهَا نُزُلًۭا مِّنْ عِندِ ٱللَّهِ ۗ وَمَا عِندَ ٱللَّهِ خَيْرٌۭ لِّلْأَبْرَارِ" },
      { number: 199, text: "وَإِنَّ مِنْ أَهْلِ ٱلْكِتَٰبِ لَمَن يُؤْمِنُ بِٱللَّهِ وَمَآ أُنزِلَ إِلَيْكُمْ وَمَآ أُنزِلَ إِلَيْهِمْ خَٰشِعِينَ لِلَّهِ لَا يَشْتَرُونَ بِـَٔايَٰتِ ٱللَّهِ ثَمَنًۭا قَلِيلًا ۗ أُو۟لَٰٓئِكَ لَهُمْ أَجْرُهُمْ عِندَ رَبِّهِمْ ۗ إِنَّ ٱللَّهَ سَرِيعُ ٱلْحِسَابِ" },
      { number: 200, text: "يَٰٓأَيُّهَا ٱلَّذِينَ ءَامَنُوا۟ ٱصْبِرُوا۟ وَصَابِرُوا۟ وَرَابِطُوا۟ وَٱتَّقُوا۟ ٱللَّهَ لَعَلَّكُمْ تُفْلِحُونَ" },
    ],
    meaning: "These are verses 191–200, the final ten verses of Aal-Imran. The Prophet ﷺ recited them when waking during the night.",
    count: 1,
    source: "القرآن الكريم، سورة آل عمران: ١٩١–٢٠٠؛ صحيح البخاري 183، وصحيح مسلم 763",
  },
  {
    id: "wake-night-prayer",
    category: "waking",
    title: "دعاء من قام من الليل",
    text: "اللَّهُمَّ لَكَ الْحَمْدُ، أَنْتَ قَيِّمُ السَّمَاوَاتِ وَالْأَرْضِ وَمَنْ فِيهِنَّ، وَلَكَ الْحَمْدُ، لَكَ مُلْكُ السَّمَاوَاتِ وَالْأَرْضِ وَمَنْ فِيهِنَّ",
    meaning: "A portion of the long supplication the Prophet ﷺ would say when standing for night prayer.",
    count: 1,
    source: "صحيح البخاري 1120، وصحيح مسلم 769",
  },
  {
    id: "daily-home-enter",
    category: "daily",
    title: "دخول المنزل",
    text: "بِسْمِ اللَّهِ",
    meaning: "Mention Allah when entering and when eating; greet the household with salam.",
    count: 1,
    source: "صحيح مسلم 2018؛ القرآن الكريم، سورة النور: 61",
  },
  {
    id: "daily-home-dua",
    category: "daily",
    title: "دعاء دخول المنزل والخروج منه",
    text: "اللَّهُمَّ إِنِّي أَسْأَلُكَ خَيْرَ الْمَوْلَجِ وَخَيْرَ الْمَخْرَجِ، بِسْمِ اللَّهِ وَلَجْنَا، وَبِسْمِ اللَّهِ خَرَجْنَا، وَعَلَى اللَّهِ رَبِّنَا تَوَكَّلْنَا",
    count: 1,
    source: "سنن أبي داود 5096",
  },
  {
    id: "daily-intimacy",
    category: "daily",
    title: "قبل المعاشرة الزوجية",
    text: "بِسْمِ اللَّهِ، اللَّهُمَّ جَنِّبْنَا الشَّيْطَانَ، وَجَنِّبِ الشَّيْطَانَ مَا رَزَقْتَنَا",
    count: 1,
    source: "صحيح البخاري 6388، وصحيح مسلم 1434",
  },
  {
    id: "daily-wind",
    category: "daily",
    title: "عند هبوب الريح",
    text: "اللَّهُمَّ إِنِّي أَسْأَلُكَ خَيْرَهَا، وَخَيْرَ مَا فِيهَا، وَخَيْرَ مَا أُرْسِلَتْ بِهِ، وَأَعُوذُ بِكَ مِنْ شَرِّهَا، وَشَرِّ مَا فِيهَا، وَشَرِّ مَا أُرْسِلَتْ بِهِ",
    count: 1,
    source: "صحيح مسلم 899",
  },
  {
    id: "daily-thunder",
    category: "daily",
    title: "عند سماع الرعد",
    text: "سُبْحَانَ الَّذِي يُسَبِّحُ الرَّعْدُ بِحَمْدِهِ وَالْمَلَائِكَةُ مِنْ خِيفَتِهِ",
    meaning: "Reported as the saying of Abdullah ibn al-Zubayr رضي الله عنهما when hearing thunder.",
    count: 1,
    source: "الأدب المفرد للبخاري 723؛ وهو أثر عن ابن الزبير",
  },
  {
    id: "daily-travel-return",
    category: "daily",
    title: "الرجوع من السفر",
    text: "آيِبُونَ، تَائِبُونَ، عَابِدُونَ، لِرَبِّنَا حَامِدُونَ",
    meaning: "We return, repent, worship, and praise our Lord.",
    count: 1,
    source: "صحيح مسلم 1342",
  },
  {
    id: "daily-ruqyah",
    category: "daily",
    title: "دعاء الرقية",
    text: "بِسْمِ اللَّهِ أَرْقِيكَ، مِنْ كُلِّ شَيْءٍ يُؤْذِيكَ، مِنْ شَرِّ كُلِّ نَفْسٍ أَوْ عَيْنِ حَاسِدٍ، اللَّهُ يَشْفِيكَ، بِسْمِ اللَّهِ أَرْقِيكَ",
    meaning: "A supplication used by Jibril in ruqyah for the Prophet ﷺ.",
    count: 1,
    source: "صحيح مسلم 2186",
  },
  {
    id: "daily-protection-children",
    category: "daily",
    title: "التعوذ للصغار",
    text: "أُعِيذُكُمَا بِكَلِمَاتِ اللَّهِ التَّامَّةِ، مِنْ كُلِّ شَيْطَانٍ وَهَامَّةٍ، وَمِنْ كُلِّ عَيْنٍ لَامَّةٍ",
    meaning: "The Prophet ﷺ would seek protection for Al-Hasan and Al-Husayn with these words.",
    count: 1,
    source: "صحيح البخاري 3371",
  },
  {
    id: "daily-good-seeing",
    category: "daily",
    title: "عند رؤية ما يعجبه",
    text: "مَا شَاءَ اللَّهُ، لَا قُوَّةَ إِلَّا بِاللَّهِ",
    meaning: "Remember Allah when admiring a blessing. (Quran 18:39)",
    count: 1,
    source: "القرآن الكريم، سورة الكهف: 39",
  },
  {
    id: "daily-affliction",
    category: "daily",
    title: "عند رؤية مبتلى",
    text: "الْحَمْدُ لِلَّهِ الَّذِي عَافَانِي مِمَّا ابْتَلَاكَ بِهِ، وَفَضَّلَنِي عَلَى كَثِيرٍ مِمَّنْ خَلَقَ تَفْضِيلًا",
    meaning: "Say this quietly, not so the afflicted person hears it.",
    count: 1,
    source: "جامع الترمذي 3431",
  },
  {
    id: "daily-debt",
    category: "daily",
    title: "دعاء قضاء الدين",
    text: "اللَّهُمَّ اكْفِنِي بِحَلَالِكَ عَنْ حَرَامِكَ، وَأَغْنِنِي بِفَضْلِكَ عَمَّنْ سِوَاكَ",
    count: 1,
    source: "جامع الترمذي 3563",
  },
  {
    id: "daily-distress-hope",
    category: "daily",
    title: "دعاء عند الكرب",
    text: "يَا حَيُّ يَا قَيُّومُ، بِرَحْمَتِكَ أَسْتَغِيثُ، أَصْلِحْ لِي شَأْنِي كُلَّهُ، وَلَا تَكِلْنِي إِلَى نَفْسِي طَرْفَةَ عَيْنٍ",
    count: 1,
    source: "المستدرك للحاكم 2000؛ حسنه الألباني في صحيح الجامع 4791",
  },
  {
    id: "daily-protection-general",
    category: "daily",
    title: "دعاء جامع للعافية",
    text: "اللَّهُمَّ إِنِّي أَسْأَلُكَ الْعَفْوَ وَالْعَافِيَةَ فِي الدُّنْيَا وَالْآخِرَةِ",
    count: 1,
    source: "سنن أبي داود 5074",
  },
  {
    id: "daily-prayer-upon-prophet",
    category: "daily",
    title: "الصلاة على النبي بعد الأذان",
    text: "اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ",
    meaning: "After repeating the words of the adhan, send blessings upon the Prophet ﷺ, then say the dua for al-Wasilah.",
    count: 1,
    source: "صحيح مسلم 384",
  },
  {
    id: "daily-praise-sneeze",
    category: "daily",
    title: "حمد الله عند العطاس",
    text: "الْحَمْدُ لِلَّهِ",
    meaning: "The sneezer praises Allah; the listener responds with “Yarhamuk Allah,” and the sneezer replies with “Yahdikum Allah wa yuslihu balakum.”",
    count: 1,
    source: "صحيح البخاري 6224",
  },
  {
    id: "daily-after-adhan-response",
    category: "daily",
    title: "متابعة المؤذن",
    text: "يَقُولُ مِثْلَ مَا يَقُولُ الْمُؤَذِّنُ، إِلَّا أَنْ يَقُولَ: حَيَّ عَلَى الصَّلَاةِ، حَيَّ عَلَى الْفَلَاحِ، فَيَقُولُ: لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ",
    meaning: "Repeat the caller's words, saying “La hawla wa la quwwata illa billah” when they say “Hayya 'ala-s-salah” and “Hayya 'ala-l-falah.”",
    count: 1,
    source: "صحيح مسلم 385",
  },
  {
    id: "daily-meeting-greeting",
    category: "daily",
    title: "التحية عند اللقاء",
    text: "السَّلَامُ عَلَيْكُمْ وَرَحْمَةُ اللَّهِ",
    meaning: "Return the greeting with one at least as good. (Quran 4:86)",
    count: 1,
    source: "القرآن الكريم، سورة النساء: 86؛ صحيح البخاري 6236",
  },
  {
    id: "daily-new-moon",
    category: "daily",
    title: "عند رؤية الهلال",
    text: "اللَّهُمَّ أَهِلَّهُ عَلَيْنَا بِالْيُمْنِ وَالْإِيمَانِ، وَالسَّلَامَةِ وَالْإِسْلَامِ، رَبِّي وَرَبُّكَ اللَّهُ",
    count: 1,
    source: "جامع الترمذي 3451؛ حسنه الترمذي",
  },
  {
    id: "daily-clothing",
    category: "daily",
    title: "صيغة عند لبس ثوب جديد",
    text: "الْحَمْدُ لِلَّهِ الَّذِي كَسَانِي هَذَا وَرَزَقَنِيهِ مِنْ غَيْرِ حَوْلٍ مِنِّي وَلَا قُوَّةٍ",
    meaning: "A supplication for clothing; a separate narration is specifically about putting on a new garment.",
    count: 1,
    source: "سنن أبي داود 4023",
  },
  {
    id: "daily-market",
    category: "daily",
    title: "ذكر دخول السوق",
    text: "لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ، يُحْيِي وَيُمِيتُ، وَهُوَ حَيٌّ لَا يَمُوتُ، بِيَدِهِ الْخَيْرُ، وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ",
    meaning: "This report is included in some collections of daily adhkar; scholars differ over its grading.",
    count: 1,
    source: "جامع الترمذي 3428؛ اختلف أهل العلم في تصحيحه",
  },
  {
    id: "daily-guidance",
    category: "daily",
    title: "سؤال الهدى والتقى",
    text: "اللَّهُمَّ إِنِّي أَسْأَلُكَ الْهُدَى، وَالتُّقَى، وَالْعَفَافَ، وَالْغِنَى",
    count: 1,
    source: "صحيح مسلم 2721",
  },
  {
    id: "daily-heartsteadfastness",
    category: "daily",
    title: "الثبات على الدين",
    text: "يَا مُقَلِّبَ الْقُلُوبِ، ثَبِّتْ قَلْبِي عَلَى دِينِكَ",
    meaning: "The Prophet ﷺ frequently made this supplication.",
    count: 1,
    source: "جامع الترمذي 2140",
  },
  {
    id: "daily-world-afterlife-good",
    category: "daily",
    title: "دعاء الخير في الدنيا والآخرة",
    text: "رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً، وَفِي الْآخِرَةِ حَسَنَةً، وَقِنَا عَذَابَ النَّارِ",
    meaning: "A comprehensive supplication frequently made by the Prophet ﷺ.",
    count: 1,
    source: "القرآن الكريم، سورة البقرة: ٢٠١؛ صحيح البخاري 6389، وصحيح مسلم 2690",
  },
  {
    id: "daily-morning-evening-tasbih",
    category: "daily",
    title: "التسبيح صباحًا ومساءً",
    text: "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ",
    meaning: "Say this one hundred times in the morning and one hundred times in the evening.",
    count: 100,
    source: "صحيح مسلم 2692",
  },
  {
    id: "daily-rain-shelter",
    category: "daily",
    title: "الاستمطار النافع",
    text: "اللَّهُمَّ حَوَالَيْنَا وَلَا عَلَيْنَا، اللَّهُمَّ عَلَى الْآكَامِ وَالظِّرَابِ، وَبُطُونِ الْأَوْدِيَةِ، وَمَنَابِتِ الشَّجَرِ",
    meaning: "Said when rain became harmful; ask Allah to send it around, not upon us.",
    count: 1,
    source: "صحيح البخاري 1014، وصحيح مسلم 897",
  },
  {
    id: "daily-talbiyah",
    category: "daily",
    title: "التلبية للمحرم",
    text: "لَبَّيْكَ اللَّهُمَّ لَبَّيْكَ، لَبَّيْكَ لَا شَرِيكَ لَكَ لَبَّيْكَ، إِنَّ الْحَمْدَ وَالنِّعْمَةَ لَكَ وَالْمُلْكَ، لَا شَرِيكَ لَكَ",
    meaning: "The talbiyah said during Hajj or Umrah.",
    count: 1,
    source: "صحيح البخاري 1549، وصحيح مسلم 1184",
  },
];

const descriptionOccasions: Record<CategoryId, { ar: string; en: string }> = {
  morning: { ar: "في الصباح", en: "in the morning" },
  evening: { ar: "في المساء", en: "in the evening" },
  prayer: { ar: "بعد الصلاة", en: "after prayer" },
  bedtime: { ar: "قبل النوم", en: "before sleep" },
  waking: { ar: "بعد الاستيقاظ", en: "after waking" },
  daily: { ar: "في الموقف المذكور في عنوانه", en: "for the occasion named in its title" },
};

export default function AzkarLibrary() {
  const [selectedCategory, setSelectedCategory] = useState<CategoryId | "all">("all");
  const [query, setQuery] = useState("");
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [arabicVoices, setArabicVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceUri, setSelectedVoiceUri] = useState("default");
  const [isSpeechSupported, setIsSpeechSupported] = useState(false);
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const [speechError, setSpeechError] = useState("");
  const [speechNotice, setSpeechNotice] = useState("");

  useEffect(() => {
    if (!("speechSynthesis" in window)) {
      const noticeTimer = globalThis.setTimeout(
        () => setSpeechNotice("القراءة الصوتية غير مدعومة في هذا المتصفح."),
        0,
      );
      return () => globalThis.clearTimeout(noticeTimer);
    }

    const synthesis = window.speechSynthesis;
    const updateArabicVoices = () => {
      const voices = synthesis.getVoices().filter((voice) => voice.lang.toLowerCase().startsWith("ar"));
      setArabicVoices(voices);
      setSpeechNotice(
        voices.length === 0
          ? "لا يتوفر صوت عربي مثبت؛ سيُستخدم صوت الجهاز الافتراضي وقد يختلف نطقه للعربية."
          : "",
      );
      setSelectedVoiceUri((current) =>
        current === "default" || voices.some((voice) => voice.voiceURI === current)
          ? current
          : voices[0]?.voiceURI ?? "default",
      );
    };

    const voicesTimer = window.setTimeout(() => {
      setIsSpeechSupported(true);
      updateArabicVoices();
    }, 0);
    synthesis.addEventListener("voiceschanged", updateArabicVoices);

    return () => {
      window.clearTimeout(voicesTimer);
      synthesis.removeEventListener("voiceschanged", updateArabicVoices);
      synthesis.cancel();
    };
  }, []);

  const playDhikr = (dhikr: Dhikr) => {
    if (!isSpeechSupported) {
      setSpeechError("القراءة الصوتية غير مدعومة في هذا المتصفح.");
      return;
    }

    const voice = selectedVoiceUri === "default"
      ? undefined
      : arabicVoices.find((option) => option.voiceURI === selectedVoiceUri);
    if (selectedVoiceUri !== "default" && !voice) {
      setSpeechError("الصوت المحدد غير متاح الآن. اختر صوتًا آخر.");
      return;
    }

    if (speakingId === dhikr.id) {
      window.speechSynthesis.cancel();
      setSpeakingId(null);
      return;
    }

    window.speechSynthesis.cancel();
    setSpeechError("");
    const text = dhikr.verses?.map((verse) => verse.text).join(" ") ?? dhikr.text;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = voice?.lang ?? "ar";
    if (voice) utterance.voice = voice;
    utterance.onstart = () => setSpeakingId(dhikr.id);
    utterance.onend = () => setSpeakingId((current) => current === dhikr.id ? null : current);
    utterance.onerror = (event) => {
      setSpeakingId((current) => current === dhikr.id ? null : current);
      if (event.error !== "interrupted" && event.error !== "canceled") {
        setSpeechError("تعذرت قراءة الذكر صوتيًا. حاول اختيار صوت آخر.");
      }
    };

    setSpeakingId(dhikr.id);
    window.speechSynthesis.speak(utterance);
  };

  const visibleCategories = selectedCategory === "all"
    ? categories
    : categories.filter((category) => category.id === selectedCategory);

  const visibleAzkar = useMemo(() => {
    const searchTerm = query.trim().toLocaleLowerCase();
    return azkar.filter((dhikr) => {
      const matchesCategory = selectedCategory === "all" || dhikr.category === selectedCategory;
      const verseText = dhikr.verses?.map((verse) => verse.text).join(" ") ?? "";
      const searchableText = `${dhikr.title} ${dhikr.text} ${verseText} ${dhikr.transliteration ?? ""} ${dhikr.meaning ?? ""} ${dhikr.source}`.toLocaleLowerCase();
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
            className="rounded-full border border-amber-200 bg-white/80 px-4 py-2 text-sm font-semibold text-amber-800 transition hover:bg-amber-50"
          >
            ← العودة إلى القرآن
          </Link>
          <span className="text-sm font-medium text-amber-800">مستكشف القرآن</span>
        </nav>

        <header className="mb-8 overflow-hidden rounded-[30px] border border-amber-900/10 bg-gradient-to-br from-amber-950 via-amber-900 to-amber-800 p-7 text-white shadow-xl shadow-amber-950/15 sm:p-10">
          <p className="mb-3 text-sm font-semibold tracking-[0.18em] text-amber-200">أذكار اليوم والليلة</p>
          <h1 className="text-4xl font-black tracking-tight sm:text-5xl">الأذكار</h1>
          <p className="mt-4 max-w-2xl text-base leading-8 text-amber-50 sm:text-lg">
            أكثر من مئة ذكر ودعاء للصباح والمساء وبعد الصلاة، مع قسمين منفصلين لما قبل النوم وما بعد الاستيقاظ، وأذكار لمواقف اليوم ومراجعها.
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
                className="rounded-full border border-white/20 px-4 py-2 text-sm font-medium text-amber-50 transition hover:bg-white/10"
              >
                إعادة العد
              </button>
            )}
          </div>
        </header>

        <section className="mb-7 rounded-[24px] border border-slate-200 bg-white/85 p-4 shadow-sm backdrop-blur sm:p-5">
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700">
              <span>الصوت العربي</span>
              <select
                value={selectedVoiceUri}
                onChange={(event) => setSelectedVoiceUri(event.target.value)}
                disabled={!isSpeechSupported}
                className="max-w-64 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                aria-label="اختر الصوت العربي"
              >
                <option value="default">صوت الجهاز الافتراضي</option>
                {arabicVoices.map((voice) => (
                  <option key={voice.voiceURI} value={voice.voiceURI}>
                    {voice.name} ({voice.lang})
                  </option>
                ))}
              </select>
            </label>
            <p className="text-xs leading-6 text-slate-500">
              قراءة آلية باستخدام أصوات جهازك، وليست تلاوة مسجلة. قد يختلف النطق حسب الصوت المختار.
            </p>
            {speechNotice && (
              <p role="status" className="w-full text-sm text-amber-900">{speechNotice}</p>
            )}
            {speechError && (
              <p role="status" className="w-full text-sm text-red-700">{speechError}</p>
            )}
          </div>
          <label className="mb-4 flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 focus-within:border-amber-400 focus-within:ring-2 focus-within:ring-amber-100">
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
              className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${selectedCategory === "all" ? "border-amber-800 bg-amber-800 text-white" : "border-slate-200 bg-white text-slate-700 hover:border-amber-300"}`}
            >
              الكل
            </button>
            {categories.map((category) => (
              <button
                key={category.id}
                type="button"
                onClick={() => setSelectedCategory(category.id)}
                aria-pressed={selectedCategory === category.id}
                className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${selectedCategory === category.id ? "border-amber-800 bg-amber-800 text-white" : "border-slate-200 bg-white text-slate-700 hover:border-amber-300"}`}
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
                  <p dir="ltr" className="mt-1 text-left text-sm leading-6 text-slate-600">{category.descriptionEn}</p>
                </div>
                <div className="grid gap-4 lg:grid-cols-2">
                  {categoryAzkar.map((dhikr, index) => {
                    const currentCount = counts[dhikr.id] ?? 0;
                    const isComplete = currentCount >= dhikr.count;

                    return (
                      <article
                        key={dhikr.id}
                        className="rounded-[24px] border border-amber-900/10 bg-white/90 p-5 shadow-sm shadow-amber-950/5 sm:p-6"
                      >
                        <div className="mb-4 flex items-start justify-between gap-4">
                          <div>
                            <span className="text-xs font-bold tracking-wider text-amber-700">
                              {String(index + 1).padStart(2, "0")}
                            </span>
                            <h3 className="mt-1 text-lg font-bold text-slate-900">{dhikr.title}</h3>
                          </div>
                          <span className="shrink-0 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800">
                            {dhikr.count === 1 ? "مرة واحدة" : `${dhikr.count} مرات`}
                          </span>
                        </div>
                        {dhikr.verses ? (
                          <div className="space-y-4">
                            {dhikr.verses.map((verse) => (
                              <p
                                key={verse.number}
                                className="text-right text-2xl leading-[2.1] text-amber-950 sm:text-[1.7rem]"
                              >
                                <span className="ml-2 inline-flex h-8 min-w-8 items-center justify-center rounded-full border border-amber-200 bg-amber-50 px-2 text-sm font-bold text-amber-800">
                                  {verse.number.toLocaleString("ar-EG")}
                                </span>
                                {verse.text}
                              </p>
                            ))}
                          </div>
                        ) : (
                          <p className="text-right text-2xl leading-[2.1] text-amber-950 sm:text-[1.7rem]">
                            {dhikr.text}
                          </p>
                        )}
                        <div className="mt-4 rounded-xl bg-amber-50/80 p-4">
                          <p className="text-xs font-bold text-amber-800">الوصف بالعربية</p>
                          <p className="mt-1 text-sm leading-7 text-slate-700">
                            يُقال «{dhikr.title}» {descriptionOccasions[dhikr.category].ar}، وفق الصيغة الواردة في المصدر.
                          </p>
                          <p dir="ltr" className="mt-3 text-left text-xs font-bold text-amber-800">Description in English</p>
                          <p dir="ltr" className="mt-1 text-left text-sm leading-7 text-slate-700">
                            {dhikr.meaning ?? `This remembrance is recited ${descriptionOccasions[dhikr.category].en}; follow the wording and context given in the cited source.`}
                          </p>
                        </div>
                        {dhikr.transliteration && (
                          <p dir="ltr" className="mt-4 text-left text-sm leading-6 text-slate-600">
                            {dhikr.transliteration}
                          </p>
                        )}
                        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
                          <p className="text-xs leading-5 text-slate-500">المصدر: {dhikr.source}</p>
                          <div className="flex flex-wrap items-center gap-2">
                            <button
                              type="button"
                              onClick={() => playDhikr(dhikr)}
                              disabled={!isSpeechSupported}
                              aria-label={speakingId === dhikr.id ? `إيقاف قراءة ${dhikr.title}` : `استمع إلى ${dhikr.title}`}
                              className="rounded-full border border-amber-300 bg-amber-50 px-4 py-2 text-sm font-bold text-amber-900 transition hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              {speakingId === dhikr.id ? "إيقاف الصوت ■" : "استمع ▶"}
                            </button>
                            <button
                              type="button"
                              onClick={() => setCounts((current) => ({
                                ...current,
                                [dhikr.id]: Math.min(dhikr.count, (current[dhikr.id] ?? 0) + 1),
                              }))}
                              disabled={isComplete}
                              aria-label={`${dhikr.title}: ${currentCount} من ${dhikr.count}`}
                              className={`min-w-28 rounded-full px-4 py-2 text-sm font-bold transition ${isComplete ? "bg-amber-100 text-amber-800" : "bg-amber-800 text-white hover:bg-amber-700"}`}
                            >
                              {isComplete ? "تم الورد ✓" : `${currentCount} / ${dhikr.count} · سَبِّح`}
                            </button>
                          </div>
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
