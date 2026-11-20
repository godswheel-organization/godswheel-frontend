import type { MetadataRoute } from "next";
import { ROUTES } from "@/lib/routes";
import { absoluteUrl, IS_INDEXABLE_DEPLOYMENT, SITE_URL } from "@/lib/seo/site";

// /robots.txt. Preview deployments and local servers turn crawlers away entirely, so test copies of the site
// never compete with the real one in search.
export default function robots(): MetadataRoute.Robots {
  if (!IS_INDEXABLE_DEPLOYMENT) return { rules: { userAgent: "*", disallow: "/" } };

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Signed-in pages have nothing to index. (Search results and sign-in stay crawlable but carry noindex,
      // which crawlers can only see if they're allowed to fetch the page.)
      disallow: [ROUTES.library, ROUTES.settings, "/offline"],
    },
    sitemap: absoluteUrl("/sitemap.xml"),
    host: SITE_URL,
  };
}
