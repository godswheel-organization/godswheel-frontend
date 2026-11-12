import { ROUTES } from "@/lib/routes";

// TODO(legal): DRAFT wording written to describe what the app actually does today. It must be reviewed and
// approved by the GodsWheel team's legal adviser before launch; then set `status` to "final" (hides the draft notice)
// and set `lastUpdated` to the date it takes effect.

export interface LegalSection {
  heading: string;
  paragraphs: string[];
  // An inline way to act on the section (e.g. Contact us).
  link?: { label: string; href: string };
}

export interface LegalDocument {
  title: string;
  status: "draft" | "final";
  // ISO date (YYYY-MM-DD).
  lastUpdated: string;
  sections: LegalSection[];
}

const CONTACT_LINK = { label: "Contact us", href: ROUTES.report };

export const PRIVACY_NOTICE: LegalDocument = {
  title: "Privacy notice",
  status: "draft",
  lastUpdated: "2026-11-10",
  sections: [
    {
      heading: "What we collect",
      paragraphs: [
        "When you create an account: your first and last name, your email address and your password, which we only ever store in a protected (hashed) form.",
        "As you use GodsWheel: the sermons you save, what you have listened to and how far you got, the notes you write, and your settings.",
        "If you report an issue: what you tell us, and your email address if you choose to give it.",
        "On your device: a cookie that keeps you signed in, one that remembers how you like the sidebar, and encrypted copies of unsaved work so it isn't lost offline. Usage analytics are collected only if you turn them on.",
      ],
    },
    {
      heading: "How we use it",
      paragraphs: [
        "To run your account: keeping you signed in, showing your library and letting you pick up a sermon where you stopped.",
        "To look into the issues you report, and to reply if you gave us an email address.",
        "If you allow analytics, to see in aggregate which parts of GodsWheel help people, so we can improve them.",
        "We do not sell your personal information.",
      ],
    },
    {
      heading: "Your rights",
      paragraphs: [
        "You can download a copy of your data at any time from Settings → Request a copy of my data.",
        "You can clear your listening history, remove saved sermons and turn analytics on or off in Settings.",
        "To correct your details or delete your account, contact us and we will help.",
      ],
    },
    {
      heading: "Contact",
      paragraphs: ["Questions about your privacy, or about this notice? Get in touch and we will get back to you."],
      link: CONTACT_LINK,
    },
  ],
};

export const TERMS: LegalDocument = {
  title: "Terms",
  status: "draft",
  lastUpdated: "2026-11-10",
  sections: [
    {
      heading: "Using GodsWheel",
      paragraphs: [
        "GodsWheel helps you find and listen to sermons. You can listen without an account; saving, sharing and notes need one.",
      ],
    },
    {
      heading: "Your account",
      paragraphs: [
        "Give accurate details when you sign up and keep your password to yourself. Tell us straight away if you think someone else has used your account.",
      ],
    },
    {
      heading: "Sermons and rights",
      paragraphs: [
        "Sermons belong to the preachers and ministries that publish them. You may listen and share links to them, but not copy, download or republish them unless their owner allows it.",
        "If you hold the rights to a sermon and want it changed or removed, report it from the sermon's page.",
      ],
    },
    {
      heading: "Acceptable use",
      paragraphs: [
        "Don't misuse GodsWheel: no attempts to break, overload or scrape it, and no using it to harass anyone. Keep reports honest.",
      ],
    },
    {
      heading: "Changes and ending",
      paragraphs: [
        "We may update GodsWheel and these terms. If a change matters to you, we will tell you before it takes effect.",
        "You can stop using GodsWheel at any time, and ask us to close your account.",
      ],
    },
    {
      heading: "Contact",
      paragraphs: ["Questions about these terms? Get in touch."],
      link: CONTACT_LINK,
    },
  ],
};
