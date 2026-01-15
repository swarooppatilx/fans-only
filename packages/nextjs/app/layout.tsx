import "@rainbow-me/rainbowkit/styles.css";
import "@scaffold-ui/components/styles.css";
import { Providers } from "~~/components/Providers";
import { ThemeProvider } from "~~/components/ThemeProvider";
import ConditionalMain from "~~/components/fansonly/layout/ConditionalMain";
import ConditionalRightSidebar from "~~/components/fansonly/layout/ConditionalRightSidebar";
import MobileBottomNav from "~~/components/fansonly/layout/MobileBottomNav";
import Sidebar from "~~/components/fansonly/layout/Sidebar";
import "~~/styles/globals.css";
import { getMetadata } from "~~/utils/scaffold-eth/getMetadata";

export const metadata = getMetadata({
  title: "FansOnly",
  description:
    "Support your favorite creators with cryptocurrency subscriptions on Mantle. Join the decentralized creator economy with exclusive content, direct payments, and community engagement.",
  keywords: [
    "FansOnly",
    "decentralized creator platform",
    "cryptocurrency subscriptions",
    "Mantle blockchain",
    "web3",
    "creator economy",
    "exclusive content",
    "crypto payments",
  ],
});

const RootLayout = ({ children }: { children: React.ReactNode }) => {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "FansOnly",
    description: "Decentralized creator platform for cryptocurrency subscriptions on Mantle",
    url: process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : `http://localhost:${process.env.PORT || 3000}`,
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web Browser",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    creator: {
      "@type": "Organization",
      name: "Sieg Project",
      url: "https://siegproject.com/",
      sameAs: ["https://x.com/siegproject", "https://siegproject.com/"],
    },
    author: [
      {
        "@type": "Person",
        name: "Swaroop Patil",
        url: "https://x.com/swarooppatilx",
      },
      {
        "@type": "Person",
        name: "Renarin",
        url: "https://x.com/0xrenarin",
      },
    ],
    potentialAction: {
      "@type": "UseAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: "{url}",
      },
      expectsAcceptanceOf: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
      },
    },
  };

  return (
    <html suppressHydrationWarning data-theme="dark">
      <head>
        <link rel="icon" type="image/png" href="/favicon-96x96.png" sizes="96x96" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <meta name="apple-mobile-web-app-title" content="Fans Only" />
        <link rel="manifest" href="/site.webmanifest" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData),
          }}
        />
      </head>
      <body className="bg-slate-900 text-slate-100">
        <ThemeProvider enableSystem>
          <Providers>
            <div className="min-h-screen bg-slate-900 text-slate-100 font-sans relative">
              <div className="flex justify-center">
                {/* Left Sidebar - Fixed position on desktop */}
                <aside className="hidden xl:block w-[280px] shrink-0">
                  <div className="fixed top-0 w-[280px] h-screen bg-slate-900 z-30">
                    <Sidebar />
                  </div>
                </aside>

                {/* Main Content Area */}
                <ConditionalMain>{children}</ConditionalMain>

                {/* Right Sidebar - Hidden on smaller screens and messages page */}
                <ConditionalRightSidebar />
              </div>

              {/* Mobile Bottom Nav */}
              <MobileBottomNav />
              <div className="h-16 xl:hidden"></div>
            </div>
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  );
};

export default RootLayout;
