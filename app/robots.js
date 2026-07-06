


export default function robots() {
  const baseUrl = "https://bahaarchitectureportfolio.vercel.app";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/login"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}