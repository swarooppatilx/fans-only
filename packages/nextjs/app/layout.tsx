import { Providers } from "../components/Providers";
import FansOnlyHeader from "../components/fansonly/layout/Header";
import Sidebar from "../components/fansonly/layout/Sidebar";
import "@rainbow-me/rainbowkit/styles.css";
import "@scaffold-ui/components/styles.css";
import { ThemeProvider } from "~~/components/ThemeProvider";
import "~~/styles/globals.css";
import { getMetadata } from "~~/utils/scaffold-eth/getMetadata";

export const metadata = getMetadata({
  title: "FansOnly | Decentralized Creator Platform",
  description: "Support your favorite creators with cryptocurrency subscriptions on Mantle",
});

const RootLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <html suppressHydrationWarning>
      <body>
        <ThemeProvider enableSystem>
          <Providers>
            <div className="min-h-screen bg-base-200 grid grid-rows-[auto_1fr] grid-cols-1 lg:grid-cols-[15rem_1fr_20rem] xl:grid-cols-[15rem_1fr_20rem]">
              {/* Header (spans all columns) */}
              <div className="row-start-1 row-end-2 col-span-full">
                <FansOnlyHeader />
              </div>
              {/* Sidebar */}
              <aside className="hidden lg:flex row-start-2 row-end-3 col-start-1 col-end-2 h-full bg-base-100 border-r border-base-300 z-20">
                <Sidebar />
              </aside>
              {/* Main content */}
              <main className="row-start-2 row-end-3 col-start-1 lg:col-start-2 col-end-3 px-4 py-6 max-w-full">
                {children}
              </main>
              {/* Right Sidebar */}
              <aside className="hidden xl:flex row-start-2 row-end-3 col-start-3 col-end-4 h-full bg-base-100 border-l border-base-300 z-10">
                {/* Add right sidebar content here if needed */}
              </aside>
            </div>
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  );
};

export default RootLayout;
