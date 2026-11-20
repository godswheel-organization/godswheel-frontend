// Structured data (schema.org JSON-LD) for search engines. A data block, not a script that runs,
// so the CSP doesn't apply. "<" is escaped so text inside can't close the tag early.
export default function JsonLd({ data }: { data: Record<string, unknown> | Record<string, unknown>[] }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}
