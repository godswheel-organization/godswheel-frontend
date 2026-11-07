import Image from "next/image";
import Link from "next/link";

// TODO(design): swap the placeholder mark for the real GodsWheel logo once the brand assets are available.
export default function MinimalHeader() {
  return (
    <header className="flex items-center border-b border-border bg-background px-6 py-4">
      <Link href="/" className="flex items-center gap-3 text-2xl font-bold text-foreground">
        <Image src="/icons/pwa/icon-192x192.png" alt="" width={36} height={36} className="rounded-lg" priority />
        <span>
          Gods<span className="text-brand-gradient">Wheel</span>
        </span>
      </Link>
    </header>
  );
}
