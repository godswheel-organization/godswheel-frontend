import MinimalHeader from "@/shared/layouts/MinimalHeader";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <MinimalHeader />
      <main className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
        <h1 className="text-title-sm font-semibold text-foreground">Godswheel</h1>
        <p className="max-w-md text-muted">
          Pages are built under <code>src/app</code>; their logic lives in <code>src/features</code>.
        </p>
      </main>
    </div>
  );
}
