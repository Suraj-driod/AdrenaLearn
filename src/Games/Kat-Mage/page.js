"use client";

import { useEffect, useRef, useState } from "react";
import CodeEditor from "@/Games/Among-Us/editor/monaco.jsx";
import handleCodeSubmit from "@/Games/Among-Us/actualBackend/submitToBackend.js";
import functionForSecondClass from "./scene2.js";
import functionForThirdScene from "./scene3.js";
import functionOnFourthScene from "./scene4.js";

// Topic-based questions for the pause screen
const topicQuestions = {
  variables: {
    narrative:
      "You take a jump but the bottom contains spikes.\nSuch is the state of undergraduate life.",
    instruction: "Answer the question to desummon the spikes.",
    question:
      'Question: Create a variable called "name" and assign it the value "Python"',
  },
  "data-types": {
    narrative:
      "The spikes below are made of different data types.\nOnly understanding them will save you.",
    instruction: "Answer the question to desummon the spikes.",
    question: "Question: Write code to check the data type of the value 3.14",
  },
  "type-casting": {
    narrative:
      "The spikes need a type conversion to disappear.\nCast them away with your knowledge!",
    instruction: "Answer the question to desummon the spikes.",
    question:
      'Question: Convert the string "42" to an integer and store it in a variable',
  },
  "user-input": {
    narrative:
      "The spikes want user input to vanish.\nTake input and set yourself free!",
    instruction: "Answer the question to desummon the spikes.",
    question:
      "Question: Write code to take a number input from user and print its square",
  },
};

export default function Game({ topic }) {
  const gameRef = useRef(null);
  const [showEditor, setShowEditor] = useState(false);
  const [editorKey, setEditorKey] = useState(0);

  async function handleSubmitWrapper(code) {
    if (!code || typeof code !== "string" || code.trim() === "") {
      setShowEditor(false);
      window.dispatchEvent(new Event("wrongAnswer"));
      return;
    }

    setShowEditor(false);
    const isCorrect = await handleCodeSubmit(code);

    if (isCorrect === true) {
      window.dispatchEvent(new Event("correctAnswer"));
    } else {
      window.dispatchEvent(new Event("wrongAnswer"));
    }
  }

  useEffect(() => {
    const trueSetter = () => {
      window.editorValue = undefined;
      setEditorKey((prev) => prev + 1);
      setShowEditor(true);
    };
    window.addEventListener("openEditor", trueSetter);
    return () => {
      window.removeEventListener("openEditor", trueSetter);
    };
  }, []);

  useEffect(() => {
    let game;
    let isMounted = true;

    async function initGame() {
      const Phaser = await import("phaser");

      // ==========================================
      // 1. THE GLOBAL PRELOADER
      // ==========================================
      class PreloadScene extends Phaser.Scene {
        constructor() {
          super("PreloadScene");
        }

        preload() {
          this.load.image("spikes", "/assets/kat-Mage/spikes.png");
          this.load.image("platform1", "/assets/kat-Mage/platform1.png");
          this.load.image("title", "/assets/kat-Mage/title.png");
          this.load.image("start", "/assets/kat-Mage/start.png");
          this.load.image("quit", "/assets/kat-Mage/quit.png");
          this.load.image("scene1", "/assets/kat-Mage/scene1.png");
          this.load.image("scene2", "/assets/kat-Mage/scene2.jpg");

          this.load.spritesheet(
            "white-cat-die",
            "/assets/kat-Mage/Meow-Knight_Death.png",
            { frameWidth: 16, frameHeight: 24, endFrame: 11 },
          );
          this.load.spritesheet(
            "white-cat",
            "/assets/kat-Mage/Meow-Knight_Idle.png",
            {
              frameWidth: 16,
              frameHeight: 24,
              endFrame: 5,
            },
          );
          this.load.spritesheet(
            "white-cat-jump",
            "/assets/kat-Mage/Meow-Knight_Jump.png",
            { frameWidth: 16, frameHeight: 24, endFrame: 14 },
          );
        }

        create() {
          this.anims.create({
            key: "die",
            frames: this.anims.generateFrameNumbers("white-cat-die", {
              start: 0,
              end: 5,
            }),
            frameRate: 8,
          });
          this.anims.create({
            key: "idle",
            frames: this.anims.generateFrameNumbers("white-cat", {
              start: 0,
              end: 5,
            }),
            frameRate: 8,
            repeat: -1,
          });
          this.anims.create({
            key: "jump",
            frames: this.anims.generateFrameNumbers("white-cat-jump", {
              start: 0,
              end: 5,
            }),
            frameRate: 8,
          });
          this.scene.start("GameScene");
        }
      }

      // ==========================================
      // 2. THE BASE LEVEL
      // ==========================================
      class BaseLevel extends Phaser.Scene {
        constructor(key) {
          super(key);
        }

        setupPlayer(startX, startY) {
          this.isTransitioning = false;
          this.canMove = false;

          this.cat = this.add.sprite(startX, startY, "white-cat");
          this.cat.setScale(2.5);
          this.cat.play("idle");

          this.keys = this.input.keyboard.addKeys({
            left: Phaser.Input.Keyboard.KeyCodes.A,
            right: Phaser.Input.Keyboard.KeyCodes.D,
          });
        }

        playerMovement() {
          if (!this.canMove) return;

          const speed = 5;
          if (this.keys.left.isDown) {
            this.cat.x -= speed;
            this.cat.setFlipX(true);
          } else if (this.keys.right.isDown) {
            this.cat.x += speed;
            this.cat.setFlipX(false);
          } else {
            this.cat.play("idle", true);
          }
        }

        levelCompleteSequence(nextSceneKey) {
          this.canMove = false;
          this.cat.play("idle", true);

          this.add.rectangle(450, 450, 900, 900, 0x000000, 0.8);

          const successText = this.add
            .text(450, 450, "MISSION COMPLETE", {
              fontSize: "56px",
              fontFamily: "Arial, sans-serif",
              color: "#4ade80", // Soft green
              fontStyle: "bold",
            })
            .setOrigin(0.5);

          this.tweens.add({
            targets: successText,
            alpha: 0,
            duration: 300,
            ease: "Linear",
            yoyo: true,
            repeat: 3,
            onComplete: () => {
              this.scene.start(nextSceneKey);
            },
          });
        }
      }

      // ==========================================
      // 3. LEVEL 1 (GameScene)
      // ==========================================
      class GameScene extends BaseLevel {
        constructor() {
          super("GameScene");
        }

        create() {
          this.questionAnswered = false;

          this.add.image(450, 400, "scene1").setDisplaySize(900, 800);
          this.add.image(211, 360, "platform1").setDisplaySize(150, 220);
          this.title = this.add
            .image(430, 490, "title")
            .setDisplaySize(600, 400);
          this.quit = this.add.image(400, 700, "quit").setDisplaySize(140, 50);

          this.setupPlayer(210, 325);

          this.handleCorrect = () => {
            if (this.questionAnswered) return;
            this.questionAnswered = true;
            this.scene.resume();

            if (this.pauseScreenGroup) {
              this.pauseScreenGroup.destroy(true);
            }

            this.spikeGroup.clear(true, true);
            this.landSafely();
          };

          this.handleWrong = () => {
            if (this.questionAnswered) return;
            this.questionAnswered = true;
            this.scene.resume();

            if (this.pauseScreenGroup) {
              this.pauseScreenGroup.destroy(true);
            }

            this.fallMotion();
          };

          window.addEventListener("correctAnswer", this.handleCorrect);
          window.addEventListener("wrongAnswer", this.handleWrong);

          this.events.on("shutdown", () => {
            window.removeEventListener("correctAnswer", this.handleCorrect);
            window.removeEventListener("wrongAnswer", this.handleWrong);
          });

          this.start = this.add.image(400, 600, "start");
          this.start.setInteractive({ useHandCursor: true });
          this.start.setDisplaySize(150, 50);

          this.start.on("pointerdown", () => {
            this.cat.anims.stop();
            this.cat.setFrame(5);

            this.spikeGroup = this.add.group();
            for (let i = 0; i < 12; i++) {
              let spike = this.add.image(90 + i * 60, 650, "spikes");
              spike.setDisplaySize(50, 50);
              this.spikeGroup.add(spike);
            }

            this.title.setVisible(false);
            this.start.setVisible(false);
            this.quit.setVisible(false);

            this.cat.setTexture("white-cat-jump");
            this.cat.play("jump");
            this.jumpMotion();
          });
        }

        jumpMotion() {
          // Phase 1: Rise — natural deceleration going up
          this.tweens.add({
            targets: this.cat,
            x: 300,
            y: 200,
            duration: 500,
            ease: "Quad.easeOut",
            onComplete: () => {
              // Phase 2: Fall — accelerate downward to mid-air landing
              this.tweens.add({
                targets: this.cat,
                x: 400,
                y: 350,
                duration: 400,
                ease: "Quad.easeIn",
                onComplete: () => {
                  // Breathing delay so the jump animation settles
                  this.time.delayedCall(600, () => {
                    this.pauseScreenGroup = this.add.group();

                    // Get topic-specific question
                    const currentTopic = topic || "variables";
                    const qData =
                      topicQuestions[currentTopic] ||
                      topicQuestions["variables"];

                    // Smooth dark overlay
                    const overlay = this.add
                      .rectangle(450, 450, 900, 900, 0x000000, 0.85)
                      .setDepth(100);

                    // Narrative Text
                    const narrativeText = this.add
                      .text(450, 320, qData.narrative, {
                        fontSize: "28px",
                        fontFamily: "Arial, sans-serif",
                        color: "#e2e8f0",
                        align: "center",
                        lineSpacing: 10,
                      })
                      .setOrigin(0.5)
                      .setDepth(100);

                    // Instruction Text
                    const instructionText = this.add
                      .text(450, 430, qData.instruction, {
                        fontSize: "22px",
                        fontFamily: "Arial, sans-serif",
                        color: "#fbbf24",
                        align: "center",
                        fontStyle: "bold",
                        letterSpacing: 1,
                      })
                      .setOrigin(0.5)
                      .setDepth(100);

                    // Terminal Question Box
                    const qBoxBg = this.add
                      .rectangle(450, 560, 700, 100, 0x1e293b)
                      .setStrokeStyle(2, 0x475569)
                      .setDepth(100);

                    const questionText = this.add
                      .text(450, 560, qData.question, {
                        fontSize: "24px",
                        fontFamily: "monospace",
                        color: "#f8fafc",
                        align: "center",
                        wordWrap: { width: 660 },
                      })
                      .setOrigin(0.5)
                      .setDepth(100);

                    this.pauseScreenGroup.addMultiple([
                      overlay,
                      narrativeText,
                      instructionText,
                      qBoxBg,
                      questionText,
                    ]);

                    // Set the question for the code checker API
                    window.currentAmongQuestion = qData.question;

                    // Reading delay before opening editor
                    this.time.delayedCall(2500, () => {
                      this.questionAnswered = false;
                      this.scene.pause();
                      window.dispatchEvent(new Event("openEditor"));
                    });
                  });
                },
              });
            },
          });
        }

        fallMotion() {
          this.tweens.add({
            targets: this.cat,
            x: 600,
            y: 600,
            duration: 2000,
            ease: "Power4",
            onComplete: () => {
              this.cat.setTexture("white-cat-die");
              this.cat.play("die");

              this.add.rectangle(450, 450, 900, 900, 0x000000, 0.85);

              // Clean Game Over text
              this.add
                .text(450, 400, "YOU FAILED", {
                  fontSize: "56px",
                  fontFamily: "Arial, sans-serif",
                  color: "#ef4444", // Tailwind Red 500
                  fontStyle: "bold",
                })
                .setOrigin(0.5);

              // Clean Retry Button
              const retryBg = this.add
                .rectangle(450, 520, 240, 60, 0x334155)
                .setStrokeStyle(2, 0x64748b);
              const retryText = this.add
                .text(450, 520, "RETRY", {
                  fontSize: "24px",
                  fontFamily: "Arial, sans-serif",
                  color: "#ffffff",
                  fontStyle: "bold",
                  letterSpacing: 2,
                })
                .setOrigin(0.5);

              const retryHitbox = this.add
                .zone(450, 520, 240, 60)
                .setInteractive({ useHandCursor: true });

              retryHitbox.on("pointerover", () => {
                retryBg.setFillStyle(0x475569);
              });
              retryHitbox.on("pointerout", () => {
                retryBg.setFillStyle(0x334155);
              });
              retryHitbox.on("pointerdown", () => this.scene.restart());
            },
          });
        }

        landSafely() {
          // Phase 1: Arc down with forward motion
          this.tweens.add({
            targets: this.cat,
            x: 550,
            y: 500,
            duration: 400,
            ease: "Sine.easeIn",
            onComplete: () => {
              // Phase 2: Gentle settle to ground with a soft bounce
              this.tweens.add({
                targets: this.cat,
                x: 700,
                y: 587,
                duration: 500,
                ease: "Bounce.easeOut",
                onComplete: () => {
                  this.cat.setTexture("white-cat");
                  this.cat.play("idle");
                  this.canMove = true;
                },
              });
            },
          });
        }

        update() {
          this.playerMovement();
          if (this.cat.x >= 850 && !this.isTransitioning) {
            this.isTransitioning = true;
            this.levelCompleteSequence("SecondScene");
          }
        }
      }

      const SecondScene = functionForSecondClass(Phaser, BaseLevel);
      const ThirdScene = functionForThirdScene(Phaser, BaseLevel);
      const FourthScene = functionOnFourthScene(Phaser, BaseLevel);

      const config = {
        type: Phaser.AUTO,
        width: 900,
        height: 900,
        parent: gameRef.current,
        pixelArt: true,
        scene: [PreloadScene, GameScene, SecondScene, ThirdScene, FourthScene],
      };

      if (!isMounted) return;
      game = new Phaser.Game(config);
    }

    initGame();

    return () => {
      isMounted = false;
      if (game) game.destroy(true);
    };
  }, []);

  return (
    <div className="flex w-full h-screen items-center justify-center bg-[#f7f5f0] p-6">
      <div
        ref={gameRef}
        className="shadow-xl rounded-xl overflow-hidden bg-black"
        style={{ width: "900px", height: "900px", flexShrink: 0 }}
      ></div>
      {showEditor && (
        <CodeEditor key={editorKey} onSubmit={handleSubmitWrapper} />
      )}
    </div>
  );
}
