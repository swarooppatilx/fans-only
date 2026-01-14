import "@rainbow-me/rainbowkit/styles.css";
import "@scaffold-ui/components/styles.css";
import { Providers } from "~~/components/Providers";
import { ThemeProvider } from "~~/components/ThemeProvider";
import MobileBottomNav from "~~/components/fansonly/layout/MobileBottomNav";
import RightSidebar from "~~/components/fansonly/layout/RightSidebar";
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
                <main className="flex-1 min-h-screen max-w-[600px] w-full border-x border-slate-800 bg-slate-900">
                  {children}
                </main>

                {/* Right Sidebar - Hidden on smaller screens */}
                <aside className="hidden lg:block w-[350px] shrink-0">
                  <div className="fixed top-0 w-[350px] h-screen bg-slate-900 z-20">
                    <RightSidebar />
                  </div>
                </aside>
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
