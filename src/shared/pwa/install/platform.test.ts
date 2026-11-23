import { describe, expect, it } from "vitest";
import { detectInstallPlatform } from "./platform";

const UA = {
  iphoneSafari: "Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1",
  iphoneChrome: "Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/138.0.0.0 Mobile/15E148 Safari/604.1",
  ipadDesktopMode: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Safari/605.1.15",
  androidChrome: "Mozilla/5.0 (Linux; Android 15; Pixel 9) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Mobile Safari/537.36",
  androidFirefox: "Mozilla/5.0 (Android 15; Mobile; rv:140.0) Gecko/140.0 Firefox/140.0",
  macChrome: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36",
  windowsEdge: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36 Edg/138.0.0.0",
  macSafari: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Safari/605.1.15",
  windowsFirefox: "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:140.0) Gecko/20100101 Firefox/140.0",
};

describe("detectInstallPlatform", () => {
  it("sends every iPhone and iPad browser to Add to Home Screen, including iPads that claim to be Macs", () => {
    expect(detectInstallPlatform(UA.iphoneSafari)).toBe("ios");
    expect(detectInstallPlatform(UA.iphoneChrome)).toBe("ios");
    expect(detectInstallPlatform(UA.ipadDesktopMode, 5)).toBe("ios");
  });

  it("recognises Android, Chromium on a computer, and Safari on a Mac", () => {
    expect(detectInstallPlatform(UA.androidChrome)).toBe("android");
    expect(detectInstallPlatform(UA.androidFirefox)).toBe("android");
    expect(detectInstallPlatform(UA.macChrome)).toBe("desktop-chromium");
    expect(detectInstallPlatform(UA.windowsEdge)).toBe("desktop-chromium");
    expect(detectInstallPlatform(UA.macSafari, 0)).toBe("mac-safari");
  });

  it("offers nothing where web apps can't be installed", () => {
    expect(detectInstallPlatform(UA.windowsFirefox)).toBe("unsupported");
    expect(detectInstallPlatform("curl/8.0")).toBe("unsupported");
  });
});
