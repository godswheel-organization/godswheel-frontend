import type { Sermon } from "../types";

// Placeholder catalogue until the sermons API exists. Preachers are fictional on purpose:
// never attribute invented sermons to real ministers.
export const sermons: Sermon[] = [
  {
    id: "arise-and-shine",
    title: "Arise and Shine",
    preacher: "Prophet Grace Mensah",
    scripture: "Isaiah 60:1",
    durationMinutes: 38,
    language: "English",
    topic: "purpose",
    relatedTopics: ["calling", "faith"],
    description:
      "A call to step out of discouragement and into the purpose God has prepared, drawn from Isaiah's promise of light after darkness.",
    scriptureRefs: ["Isaiah 60:2", "John 8:12"],
    source: { name: "Dayspring Fellowship", rights: "Shared with permission. All rights remain with Dayspring Fellowship." },
    publishedAt: "2026-10-26",
  },
  {
    id: "living-by-faith",
    title: "Living by Faith",
    preacher: "Pastor Daniel Okafor",
    scripture: "Hebrews 11:1",
    durationMinutes: 42,
    language: "English",
    topic: "faith",
    relatedTopics: ["purpose"],
    description:
      "What it means to trust God for what you cannot yet see, walking through the heroes of faith in Hebrews 11.",
    scriptureRefs: ["Hebrews 11:6", "Romans 10:17"],
    source: { name: "New Covenant Chapel", rights: "Shared with permission. All rights remain with New Covenant Chapel." },
    publishedAt: "2026-10-19",
  },
  {
    id: "the-power-of-prayer",
    title: "The Power of Prayer",
    preacher: "Evangelist Esther Nwosu",
    scripture: "James 5:16",
    durationMinutes: 45,
    language: "English",
    topic: "prayer",
    relatedTopics: ["faith"],
    description:
      "Why the prayers of ordinary believers carry real weight, and how to pray with persistence and expectation.",
    scriptureRefs: ["Philippians 4:6", "Luke 18:1"],
    source: { name: "Living Waters Church", rights: "Shared with permission. All rights remain with Living Waters Church." },
    publishedAt: "2026-10-12",
  },
  {
    id: "a-house-built-on-the-rock",
    title: "A House Built on the Rock",
    preacher: "Pastor Daniel Okafor",
    scripture: "Matthew 7:24",
    durationMinutes: 47,
    language: "English",
    topic: "family",
    relatedTopics: ["faith"],
    description:
      "Building a home that stands when storms come: hearing God's word together and putting it into practice.",
    scriptureRefs: ["Matthew 7:25", "Psalm 127:1"],
    source: { name: "New Covenant Chapel", rights: "Shared with permission. All rights remain with New Covenant Chapel." },
    publishedAt: "2026-10-05",
  },
  {
    id: "midnight-prayers-morning-answers",
    title: "Midnight Prayers, Morning Answers",
    preacher: "Evangelist Esther Nwosu",
    scripture: "Psalm 30:5",
    durationMinutes: 39,
    language: "English",
    topic: "prayer",
    relatedTopics: ["faith", "worship"],
    description:
      "Encouragement for the long night: holding on in prayer when answers are slow, and trusting that joy comes in the morning.",
    scriptureRefs: ["Luke 18:1"],
    source: { name: "Living Waters Church", rights: "Shared with permission. All rights remain with Living Waters Church." },
    publishedAt: "2026-09-28",
  },
  {
    id: "the-voice-that-calls-you-out",
    title: "The Voice That Calls You Out",
    preacher: "Prophet Grace Mensah",
    scripture: "1 Samuel 3:10",
    durationMinutes: 56,
    language: "English",
    topic: "calling",
    relatedTopics: ["purpose", "prayer"],
    description:
      "Learning to recognise God's voice the way young Samuel did, and finding the courage to answer.",
    scriptureRefs: ["Jeremiah 1:5"],
    source: { name: "Dayspring Fellowship", rights: "Shared with permission. All rights remain with Dayspring Fellowship." },
    publishedAt: "2026-09-21",
  },
  {
    id: "faith-that-moves-mountains",
    title: "Faith That Moves Mountains",
    preacher: "Apostle Joseph Etim",
    scripture: "Mark 11:23",
    durationMinutes: 51,
    language: "English",
    topic: "faith",
    relatedTopics: ["prayer"],
    description:
      "Faith that speaks to obstacles instead of about them, from Jesus' teaching on the mountain that moves.",
    scriptureRefs: ["Matthew 17:20"],
    source: { name: "Harvest Field Mission", rights: "Shared with permission. All rights remain with Harvest Field Mission." },
    publishedAt: "2026-09-14",
  },
  {
    id: "created-on-purpose",
    title: "Created on Purpose",
    preacher: "Pastor Ruth Bamidele",
    scripture: "Jeremiah 29:11",
    durationMinutes: 34,
    language: "English",
    topic: "purpose",
    relatedTopics: ["calling"],
    description:
      "You are not an accident: God's plans for you are for hope and a future, even in seasons of waiting.",
    scriptureRefs: ["Ephesians 2:10", "Jeremiah 1:5"],
    source: { name: "House of Grace Ministries", rights: "Shared with permission. All rights remain with House of Grace Ministries." },
    publishedAt: "2026-09-07",
  },
  {
    id: "here-i-am-send-me",
    title: "Here I Am, Send Me",
    preacher: "Apostle Joseph Etim",
    scripture: "Isaiah 6:8",
    durationMinutes: 44,
    language: "English",
    topic: "calling",
    relatedTopics: ["purpose", "worship"],
    description:
      "Isaiah's answer to God's question, and what it looks like to make yourself available today.",
    scriptureRefs: ["Matthew 9:37"],
    source: { name: "Harvest Field Mission", rights: "Shared with permission. All rights remain with Harvest Field Mission." },
    publishedAt: "2026-08-31",
  },
  {
    id: "a-heart-of-worship",
    title: "A Heart of Worship",
    preacher: "Pastor Ruth Bamidele",
    scripture: "John 4:24",
    durationMinutes: 36,
    language: "English",
    topic: "worship",
    relatedTopics: ["prayer"],
    description:
      "Worship as a way of life, in spirit and in truth, not only a song on Sunday morning.",
    scriptureRefs: ["John 4:23", "Psalm 95:6"],
    source: { name: "House of Grace Ministries", rights: "Shared with permission. All rights remain with House of Grace Ministries." },
    publishedAt: "2026-08-24",
  },
  {
    id: "the-anchor-of-hope",
    title: "The Anchor of Hope",
    preacher: "Prophet Grace Mensah",
    scripture: "Hebrews 6:19",
    durationMinutes: 41,
    language: "English",
    topic: "faith",
    relatedTopics: ["purpose"],
    description:
      "Hope as an anchor for the soul: steady footing when circumstances shift around you.",
    scriptureRefs: ["Romans 5:5"],
    source: { name: "Dayspring Fellowship", rights: "Shared with permission. All rights remain with Dayspring Fellowship." },
    publishedAt: "2026-08-17",
  },
  {
    id: "raising-children-in-the-way",
    title: "Raising Children in the Way",
    preacher: "Pastor Daniel Okafor",
    scripture: "Proverbs 22:6",
    durationMinutes: 48,
    language: "English",
    topic: "family",
    relatedTopics: ["prayer"],
    description:
      "Practical, prayerful wisdom for parents shaping children who walk with God for life.",
    scriptureRefs: ["Deuteronomy 6:7"],
    source: { name: "New Covenant Chapel", rights: "Shared with permission. All rights remain with New Covenant Chapel." },
    publishedAt: "2026-08-10",
  },
];

const byId = (id: string) => {
  const sermon = sermons.find((candidate) => candidate.id === id);
  if (!sermon) throw new Error(`Unknown mock sermon: ${id}`);
  return sermon;
};

// The landing page's hero and featured grid.
export const featuredSermons: Sermon[] = [
  "arise-and-shine",
  "a-house-built-on-the-rock",
  "midnight-prayers-morning-answers",
  "the-voice-that-calls-you-out",
].map(byId);

// The app home's "For your listening" list.
export const recommendedSermons: Sermon[] = ["arise-and-shine", "living-by-faith", "the-power-of-prayer", "created-on-purpose"].map(byId);
