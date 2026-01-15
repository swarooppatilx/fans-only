import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center">
        <p className="text-8xl font-bold text-slate-700 mb-2">404</p>
        <h1 className="text-2xl font-semibold text-slate-100 mb-2">Page Not Found</h1>
        <p className="text-slate-400 text-sm mb-6">The page you&apos;re looking for doesn&apos;t exist.</p>
        <Link
          href="/"
          className="inline-block px-6 py-2.5 bg-[#00aff0] hover:bg-[#009bd6] text-white font-medium rounded-full transition-colors text-sm"
        >
          Go Home
        </Link>
      </div>
    </div>
  );
}
