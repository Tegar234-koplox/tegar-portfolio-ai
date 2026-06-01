export function Footer() {
  return (
    <footer className="border-t border-slate-200/70 py-8">
      <div className="container-page flex flex-col gap-2 text-sm text-slate-500 md:flex-row md:items-center md:justify-between">
        <p>© {new Date().getFullYear()} Tegar Sang Putra. All rights reserved.</p>
        <p>Built with Next.js, Supabase, and AI pricing engine.</p>
      </div>
    </footer>
  );
}
