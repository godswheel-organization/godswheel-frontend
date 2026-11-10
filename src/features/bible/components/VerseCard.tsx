// The sidebar's verse. King James Version wording (public domain), like the rest of the app's scripture.
const VERSE = {
  text: "For I know the thoughts that I think toward you… thoughts of peace, and not of evil.",
  reference: "Jeremiah 29:11",
};

export default function VerseCard() {
  return (
    <figure className="rounded-2xl bg-linear-to-br from-brand-500 to-brand-400 p-5 text-on-brand shadow-[0_12px_32px_-12px_var(--color-brand-500)]">
      <blockquote className="font-serif text-base font-medium italic leading-snug">&ldquo;{VERSE.text}&rdquo;</blockquote>
      <figcaption className="mt-3 text-sm font-medium opacity-80">{VERSE.reference} (KJV)</figcaption>
    </figure>
  );
}
