import MinimalHeader from "@/shared/layouts/MinimalHeader";
import ErrorState from "@/shared/ui/error-state/ErrorState";
import GoBackButton from "@/shared/ui/error-state/GoBackButton";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col">
      <MinimalHeader />
      <ErrorState
        title="404"
        message="We can't seem to find the page you are looking for!"
        action={<GoBackButton />}
      />
    </div>
  );
}
