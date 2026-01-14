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
  title: "FansOnly | Decentralized Creator Platform",
  description: "Support your favorite creators with cryptocurrency subscriptions on Mantle",
});

const RootLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <html suppressHydrationWarning data-theme="dark">
      <head>
        <link rel="icon" type="image/png" href="/favicon-96x96.png" sizes="96x96" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <meta name="apple-mobile-web-app-title" content="Fans Only" />
        <link rel="manifest" href="/site.webmanifest" />
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
