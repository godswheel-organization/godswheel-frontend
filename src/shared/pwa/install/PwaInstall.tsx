import InstallGuide from "./InstallGuide";
import InstallToast from "./InstallToast";

// The install toast and the guide it opens. Mounted by the public and app layouts.
export default function PwaInstall() {
  return (
    <>
      <InstallToast />
      <InstallGuide />
    </>
  );
}
