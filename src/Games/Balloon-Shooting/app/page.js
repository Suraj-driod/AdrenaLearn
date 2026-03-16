// src/app/page.js
import dynamic from "next/dynamic";

const BalloonGame = dynamic(() => import("../component/games/BalloonGame"), {
  loading: () => (
    <div className="w-full h-96 flex items-center justify-center text-yellow-400">
      Loading game...
    </div>
  ),
});

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-6">
      <div className="mb-4 text-center">
        <h1 className="text-3xl font-black text-yellow-400 tracking-wide">
          🎯 Balloon Shooter
        </h1>
        <p className="text-gray-400 text-sm mt-1">
          Shoot the balloon with the correct answer!
        </p>
      </div>

      <div className="w-3/4 max-w-4xl rounded-xl overflow-hidden border-2 border-yellow-600 shadow-2xl">
        <BalloonGame />
      </div>

      <p className="mt-4 text-gray-500 text-xs">
        Use your mouse to aim · Click to shoot
      </p>
    </div>
  );
}
