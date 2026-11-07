import Loader from "@/shared/ui/loaders/Loader";

export default function Loading() {
  return (
    <div className="flex flex-1 items-center justify-center py-24">
      <Loader label="Loading page" />
    </div>
  );
}
