"use client";

export default function MatchesPage() {
  return (
    <div className="w-full">
      <div className="mb-6">
        <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
          Matches
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Danh sách matches, filter (Today / All / By Tournament) và quick actions sẽ được implement sau.
        </p>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-8 text-center">
        <span className="material-symbols-outlined text-6xl text-slate-400 mb-4 block">
          sports_tennis
        </span>
        <p className="text-slate-500 dark:text-slate-400">Matches page coming soon...</p>
      </div>
    </div>
  );
}
