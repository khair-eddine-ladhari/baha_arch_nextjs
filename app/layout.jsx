import "./globals.css";
import GlobalState from "./components/GlobalContext";

export const metadata = {
  title: {
    default: "Baha Architecture",
    template: "%s | Baha Architecture",
  },
  description: "Architecture and design portfolio by Baha Architecture.",
  keywords: [
    "Baha Architecture",
    "architecture firm",
    "architectural design",
    "residential architecture",
    "commercial architecture",
  ],
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    type: "website",
    siteName: "Baha Architecture",
    title: "Baha Architecture",
    description: "Architecture and design portfolio by Baha Architecture.",
    images: ["/images/og-image.jpg"],
  },
  other: {
    "google-site-verification": "_8-s7JMgtw91TTPCtSR3NG0j74FwyjsmG5Du5jrJHP4",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <GlobalState>{children}</GlobalState>
      </body>
    </html>
  );
}