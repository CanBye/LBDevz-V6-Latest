import type { MetadataRoute } from "next"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/dashboard/magaza/", "/sozlesmeler/"],
        disallow: ["/dashboard/", "/admin/", "/api/", "/auth/"],
      },
    ],
    sitemap: "https://lbdevz.com/sitemap.xml",
    host:    "https://lbdevz.com",
  }
}