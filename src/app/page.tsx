import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-japan-dark to-gray-900">
      <div className="text-center space-y-8 px-4">
        <div className="space-y-4">
          <div className="text-6xl">⛩️</div>
          <h1 className="text-5xl font-bold text-white">
            Japan Reis Tracker
          </h1>
          <p className="text-xl text-gray-300">日本旅行プランナー</p>
          <p className="text-gray-400 max-w-md mx-auto">
            Plan je perfecte reis naar Japan. Beheer je itinerary, budget en
            ontdek geweldige plekken.
          </p>
        </div>

        <div className="flex gap-4 justify-center">
          <Link href="/dashboard" className="btn-primary text-lg px-8 py-3">
            Start Planning
          </Link>
          <Link href="/places" className="btn-secondary text-lg px-8 py-3">
            Ontdek Plekken
          </Link>
        </div>

        <div className="grid grid-cols-3 gap-8 max-w-lg mx-auto pt-8">
          <div className="text-center">
            <div className="text-3xl font-bold text-japan-red">🗾</div>
            <p className="text-gray-400 text-sm mt-1">Itinerary</p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-japan-red">💴</div>
            <p className="text-gray-400 text-sm mt-1">Budget</p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-japan-red">📍</div>
            <p className="text-gray-400 text-sm mt-1">Kaart</p>
          </div>
        </div>
      </div>
    </div>
  );
}
