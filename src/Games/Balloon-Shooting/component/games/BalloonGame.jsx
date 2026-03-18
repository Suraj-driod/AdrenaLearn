// src/component/games/BalloonGame.jsx
"use client";

import { useEffect, useRef } from "react";

export default function BalloonGame({ topic }) {
  const containerRef = useRef(null);
  const gameRef = useRef(null);

  useEffect(() => {
    let isMounted = true;
    // Set topic for BalloonScene to read
    if (typeof window !== 'undefined') {
      window.__GAME_TOPIC__ = topic || 'variables';
    }

    const initPhaser = async () => {
      const PhaserModule = await import("phaser");
      const Phaser = PhaserModule.default || PhaserModule;
      const { createBalloonScene } = await import("../../scenes/BalloonScene");

      if (!isMounted) return;
      const BalloonScene = createBalloonScene(Phaser);

      const config = {
        type: Phaser.AUTO,
        width: 1000,
        height: 600,
        parent: containerRef.current,
        backgroundColor: "#2d1b00",
        scene: [BalloonScene],
        scale: {
          mode: Phaser.Scale.FIT,
        },
        physics: {
          default: "arcade",
          arcade: { gravity: { y: 0 }, debug: false },
        },
      };

      gameRef.current = new Phaser.Game(config);
    };

    initPhaser();

    return () => {
      isMounted = false;
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
  }, [topic]);

  return (
    <div
      ref={containerRef}
      id="phaser-balloon-container"
      className="w-full h-full flex items-center justify-center [&>canvas]:rounded-2xl [&>canvas]:border-2 [&>canvas]:border-[#eae5d9]"
      style={{ width: "100%", cursor: "none" }}
    />
  );
}
