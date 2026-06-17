function App() {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-between text-slate-100 selection:bg-indigo-500 selection:text-white relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-900/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-violet-900/20 blur-[120px] pointer-events-none" />

      {/* Header */}
      <header className="max-w-7xl mx-auto w-full px-6 py-6 flex justify-between items-center border-b border-slate-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-violet-600 flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-500/25">
            M
          </div>
          <span className="font-semibold text-lg tracking-tight bg-gradient-to-r from-slate-100 to-slate-300 bg-clip-text text-transparent">
            Manthio
          </span>
        </div>
        <div className="flex items-center gap-4 text-sm text-slate-400">
          <span className="px-2.5 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-xs font-medium text-emerald-400 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            Vite + React + Tailwind v4
          </span>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto w-full px-6 py-20 flex-1 flex flex-col items-center justify-center text-center relative z-10">
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight bg-gradient-to-b from-white to-slate-400 bg-clip-text text-transparent">
          Manthio
        </h1>
        <p className="mt-6 text-lg md:text-xl text-slate-400 max-w-xl leading-relaxed">
          Your modern React application is ready. Start building your product with a clean, performant slate.
        </p>

        <div className="mt-10 flex flex-wrap gap-4 justify-center">
          <div className="px-6 py-3 rounded-xl bg-slate-900 border border-slate-800 text-sm font-mono text-slate-300 shadow-xl">
            edit <code className="text-indigo-400">src/App.tsx</code> to begin
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto w-full px-6 py-8 border-t border-slate-900/50 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-500 z-10">
        <p>© 2026 Manthio. All rights reserved.</p>
        <p>Built with Tailwind CSS v4.0</p>
      </footer>
    </div>
  )
}

export default App
