// src/component/games/BalloonGame.jsx
"use client";

import { useEffect, useRef } from "react";

export default function BalloonGame() {
  const containerRef = useRef(null);
  const gameRef = useRef(null);

  useEffect(() => {
    const initPhaser = async () => {
      const Phaser = (await import("phaser")).default;
      const { BalloonScene } = await import("../../scenes/BalloonScene");

      const width = containerRef.current?.offsetWidth || 800;
      const height = Math.round(width * 0.6);

      const config = {
        type: Phaser.AUTO,
        width: width,
        height: height,
        parent: "phaser-balloon-container",
        backgroundColor: "#2d1b00",
        scene: [BalloonScene],
        scale: {
          mode: Phaser.Scale.FIT,
          autoCenter: Phaser.Scale.CENTER_BOTH,
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
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      id="phaser-balloon-container"
      style={{ width: "100%", cursor: "none" }}
    />
  );
}
