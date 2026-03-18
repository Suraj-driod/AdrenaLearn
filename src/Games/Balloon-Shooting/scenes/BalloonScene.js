import { auth } from "../../../backend/firebase";
import { updateGameStats } from "../../../backend/gameStatsHelper";
import { getQuestionsByTopic } from "../../gameQuestions";

// ─── Inject fonts once ────────────────────────────────────────────────────────
if (typeof document !== "undefined") {
  const fontId = "__balloon_fonts__";
  if (!document.getElementById(fontId)) {
    const link = document.createElement("link");
    link.id = fontId;
    link.rel = "stylesheet";
    link.href =
      "https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Rajdhani:wght@500;600;700&family=Orbitron:wght@700;900&display=swap";
    document.head.appendChild(link);
  }
}

// ─── Design tokens ────────────────────────────────────────────────────────────
const FONT_DISPLAY = "'Orbitron', 'Bebas Neue', Impact, sans-serif";   // titles, scores
const FONT_UI = "'Rajdhani', 'Arial Black', sans-serif";           // HUD, labels
const FONT_BODY = "'Rajdhani', Arial, sans-serif";                   // question text, options

// Palette
const CLR = {
  gold: "#FFD84D",
  goldDark: "#B8860B",
  teal: "#00F5D4",
  tealDark: "#007A6A",
  crimson: "#FF2D55",
  crimsonDark: "#7A0020",
  white: "#FFFFFF",
  offWhite: "#E8EAF0",
  dimWhite: "#A0A8C0",
  black: "#000000",
  hudBg: 0x04050F,
  overlayBg: 0x060810,
};

// ─── Shared stroke/shadow helpers ─────────────────────────────────────────────
const STROKE_HEAVY = { stroke: CLR.black, strokeThickness: 10 };
const STROKE_MED = { stroke: CLR.black, strokeThickness: 6 };
const STROKE_LIGHT = { stroke: CLR.black, strokeThickness: 3 };
const SHADOW_GLOW_GOLD = (scene, obj) => obj.setShadow(0, 0, CLR.goldDark, 14, true, true);
const SHADOW_GLOW_TEAL = (scene, obj) => obj.setShadow(0, 0, CLR.tealDark, 14, true, true);
const SHADOW_GLOW_RED = (scene, obj) => obj.setShadow(0, 0, CLR.crimsonDark, 14, true, true);
const SHADOW_SOFT = (scene, obj) => obj.setShadow(3, 4, CLR.black, 6, true, true);

export function createMenuScene(Phaser) {
  class MenuScene extends Phaser.Scene {
    constructor() {
      super({ key: "MenuScene" });
    }

    preload() {
      this.load.image("bg", "/assets/Balloon-shooting/bg.jpg");
      this.load.image("bow", "/assets/Balloon-shooting/bow.png");
      this.load.image("balloon_red", "/assets/Balloon-shooting/red.png");
      this.load.image("balloon_blue", "/assets/Balloon-shooting/blue.png");
      this.load.image("balloon_yellow", "/assets/Balloon-shooting/purple.png");
      this.load.image("balloon_white", "/assets/Balloon-shooting/golden.png");
    }

    create() {
      const W = this.scale.width;
      const H = this.scale.height;

      // Background
      const bg = this.add.image(W / 2, H / 2, "bg");
      bg.setDisplaySize(W, H);
      if (bg.postFX) bg.postFX.addBlur(4);

      // Deep vignette overlay
      const overlay = this.add.graphics();
      overlay.fillStyle(0x000000, 0.68);
      overlay.fillRect(0, 0, W, H);

      // Subtle horizontal scan-line texture
      const lines = this.add.graphics();
      lines.lineStyle(1, 0xffffff, 0.025);
      for (let y = 0; y < H; y += 4) lines.lineBetween(0, y, W, y);

      // Floating decorative balloons
      const decoColors = ["balloon_red", "balloon_blue", "balloon_yellow", "balloon_white"];
      for (let i = 0; i < 6; i++) {
        const bx = Phaser.Math.Between(60, W - 60);
        const by = Phaser.Math.Between(80, H - 120);
        const colorKey = decoColors[i % 4];
        const balloon = this.add.image(bx, by, colorKey);

        let scale;
        const rand = 0.6 + Math.random() * 0.4;
        if (colorKey === "balloon_white") scale = 0.096 * rand;
        else if (colorKey === "balloon_yellow") scale = 0.115 * rand;
        else scale = 0.94 * rand;

        balloon.setScale(scale);
        balloon.setAlpha(0.18 + Math.random() * 0.12);
        balloon.setOrigin(0.5, 0.5);

        this.tweens.add({
          targets: balloon,
          y: by - Phaser.Math.Between(20, 50),
          duration: Phaser.Math.Between(2000, 4000),
          ease: "Sine.easeInOut",
          yoyo: true,
          repeat: -1,
        });
      }

      // Bow decoration
      const bow = this.add.image(W / 2, H - 50, "bow");
      bow.setScale(0.18);
      bow.setAlpha(0.25);

      // ─── Decorative top rule ──────────────────────────────────
      const ruleTop = this.add.graphics();
      ruleTop.lineStyle(1, 0x00F5D4, 0.5);
      ruleTop.lineBetween(W * 0.15, H * 0.18, W * 0.85, H * 0.18);

      // ─── TITLE ───────────────────────────────────────────────
      // Stacked two-tone: shadow word behind, bright word on top
      const titleShadow = this.add
        .text(W / 2 + 4, H * 0.28 + 6, "PRECISION\nPOP", {
          fontSize: "72px",
          fontFamily: FONT_DISPLAY,
          color: "#1A0A00",
          align: "center",
          lineSpacing: 6,
        })
        .setOrigin(0.5)
        .setAlpha(0.9);

      const titleText = this.add
        .text(W / 2, H * 0.28, "PRECISION\nPOP", {
          fontSize: "72px",
          fontFamily: FONT_DISPLAY,
          color: CLR.gold,
          ...STROKE_HEAVY,
          align: "center",
          lineSpacing: 6,
        })
        .setOrigin(0.5);
      SHADOW_GLOW_GOLD(this, titleText);

      this.tweens.add({
        targets: [titleText, titleShadow],
        y: "-=10",
        duration: 2400,
        ease: "Sine.easeInOut",
        yoyo: true,
        repeat: -1,
      });

      // ─── Tagline ──────────────────────────────────────────────
      const tagline = this.add
        .text(W / 2, H * 0.46, "— CODE EDITION —", {
          fontSize: "18px",
          fontFamily: FONT_UI,
          color: CLR.teal,
          ...STROKE_LIGHT,
          letterSpacing: 8,
        })
        .setOrigin(0.5)
        .setAlpha(0.85);
      SHADOW_GLOW_TEAL(this, tagline);

      // ─── START BUTTON ────────────────────────────────────────
      const startBtnX = W / 2;
      const startBtnY = H * 0.58;
      const btnW = 260;
      const btnH = 66;

      const drawStartBtn = (bg, hovered) => {
        bg.clear();
        bg.fillStyle(hovered ? 0x00C4A8 : 0x00A896, 1);
        bg.fillRoundedRect(startBtnX - btnW / 2, startBtnY - btnH / 2, btnW, btnH, 10);
        // Inner highlight strip
        bg.fillStyle(0xffffff, hovered ? 0.12 : 0.07);
        bg.fillRoundedRect(startBtnX - btnW / 2 + 4, startBtnY - btnH / 2 + 4, btnW - 8, 18, 6);
        // Teal border
        bg.lineStyle(2, hovered ? 0x00F5D4 : 0x00C4B0, 1);
        bg.strokeRoundedRect(startBtnX - btnW / 2, startBtnY - btnH / 2, btnW, btnH, 10);
      };

      const startShadow = this.add.graphics();
      startShadow.fillStyle(0x000000, 0.5);
      startShadow.fillRoundedRect(startBtnX - btnW / 2 + 6, startBtnY - btnH / 2 + 7, btnW, btnH, 10);
      startShadow.setDepth(0);

      const startBtnBg = this.add.graphics().setDepth(1);
      drawStartBtn(startBtnBg, false);

      const startText = this.add
        .text(startBtnX, startBtnY, "▶  START", {
          fontSize: "28px",
          fontFamily: FONT_DISPLAY,
          color: CLR.white,
          ...STROKE_MED,
          stroke: CLR.tealDark,
        })
        .setOrigin(0.5)
        .setDepth(2);
      SHADOW_SOFT(this, startText);

      const startHitbox = this.add
        .zone(startBtnX, startBtnY, btnW, btnH)
        .setInteractive({ useHandCursor: true })
        .setDepth(3);

      startHitbox.on("pointerover", () => { drawStartBtn(startBtnBg, true); startText.setScale(1.06); });
      startHitbox.on("pointerout", () => { drawStartBtn(startBtnBg, false); startText.setScale(1); });
      startHitbox.on("pointerdown", () => {
        this.cameras.main.fadeOut(400, 0, 0, 0);
        this.time.delayedCall(400, () => { this.scene.start("BalloonScene"); });
      });

      // ─── QUIT BUTTON ─────────────────────────────────────────
      const quitBtnY = H * 0.72;

      const drawQuitBtn = (bg, hovered) => {
        bg.clear();
        bg.fillStyle(hovered ? 0xCC1A30 : 0xA8112A, 1);
        bg.fillRoundedRect(startBtnX - btnW / 2, quitBtnY - btnH / 2, btnW, btnH, 10);
        bg.fillStyle(0xffffff, hovered ? 0.10 : 0.05);
        bg.fillRoundedRect(startBtnX - btnW / 2 + 4, quitBtnY - btnH / 2 + 4, btnW - 8, 18, 6);
        bg.lineStyle(2, hovered ? 0xFF2D55 : 0xCC1A30, 1);
        bg.strokeRoundedRect(startBtnX - btnW / 2, quitBtnY - btnH / 2, btnW, btnH, 10);
      };

      const quitShadow = this.add.graphics();
      quitShadow.fillStyle(0x000000, 0.5);
      quitShadow.fillRoundedRect(startBtnX - btnW / 2 + 6, quitBtnY - btnH / 2 + 7, btnW, btnH, 10);
      quitShadow.setDepth(0);

      const quitBtnBg = this.add.graphics().setDepth(1);
      drawQuitBtn(quitBtnBg, false);

      const quitText = this.add
        .text(startBtnX, quitBtnY, "✕  QUIT", {
          fontSize: "28px",
          fontFamily: FONT_DISPLAY,
          color: CLR.offWhite,
          ...STROKE_MED,
          stroke: CLR.crimsonDark,
        })
        .setOrigin(0.5)
        .setDepth(2);
      SHADOW_SOFT(this, quitText);

      const quitHitbox = this.add
        .zone(startBtnX, quitBtnY, btnW, btnH)
        .setInteractive({ useHandCursor: true })
        .setDepth(3);

      quitHitbox.on("pointerover", () => { drawQuitBtn(quitBtnBg, true); quitText.setScale(1.06); });
      quitHitbox.on("pointerout", () => { drawQuitBtn(quitBtnBg, false); quitText.setScale(1); });
      quitHitbox.on("pointerdown", () => {
        if (typeof window !== "undefined") {
          const cId = window.__GAME_COURSE_ID__;
          const lId = window.__GAME_LESSON_ID__;
          /* disabled by React */
        }
      });

      // ─── Bottom rule + subtitle ───────────────────────────────
      const ruleBot = this.add.graphics();
      ruleBot.lineStyle(1, 0x00F5D4, 0.35);
      ruleBot.lineBetween(W * 0.25, H * 0.83, W * 0.75, H * 0.83);

      this.add
        .text(W / 2, H * 0.88, "AIM  ·  SHOOT  ·  LEARN", {
          fontSize: "15px",
          fontFamily: FONT_UI,
          color: CLR.dimWhite,
          fontStyle: "italic",
          ...STROKE_LIGHT,
          letterSpacing: 5,
        })
        .setOrigin(0.5)
        .setAlpha(0.75);

      this.cameras.main.fadeIn(500, 0, 0, 0);
    }
  }
  return MenuScene;
}

export function createBalloonScene(Phaser) {
  class BalloonScene extends Phaser.Scene {
    constructor() {
      super({ key: "BalloonScene" });

      // Game state
      this.score = 0;
      this.arrows = 12;
      this.timeLeft = 60;
      this.currentQuestion = null;
      this.balloons = [];
      this.canShoot = true;
      this.isDrawing = false;

      this.questionBanks = {
        "variables": [
          { question: "Which keyword is used to declare a variable in Python?", options: ["var", "let", "No keyword needed", "dim"], correct: "No keyword needed" },
          { question: "Which is a valid variable name?", options: ["1st_name", "first-name", "_first_name", "first name"], correct: "_first_name" },
          { question: "x = 5; y = '5'; x == y?", options: ["True", "False", "Error", "None"], correct: "False" }
        ],
        "control-flow": [
          { question: "Which keyword is used for 'else if' in Python?", options: ["elseif", "elif", "else if", "if else"], correct: "elif" },
          { question: "if True: print('A') else: print('B')", options: ["A", "B", "Error", "Nothing"], correct: "A" },
          { question: "Which statement skips an iteration in a loop?", options: ["break", "skip", "continue", "pass"], correct: "continue" }
        ],
        "loops": [
          { question: "What does 'break' do in a loop?", options: ["Stops loop", "Skips iteration", "Pauses", "Nothing"], correct: "Stops loop" },
          { question: "Which loop runs while a condition is true?", options: ["for", "do-while", "while", "repeat"], correct: "while" },
          { question: "What function generates a sequence of numbers?", options: ["range()", "seq()", "numbers()", "list()"], correct: "range()" }
        ],
        "functions-and-modules": [
          { question: "Which keyword defines a function?", options: ["func", "def", "function", "lambda"], correct: "def" },
          { question: "How do you include an external module?", options: ["include", "require", "import", "using"], correct: "import" },
          { question: "What statement returns a value from a function?", options: ["send", "return", "output", "yield"], correct: "return" }
        ],
        "list-and-dictionaries": [
          { question: "Which symbol creates a list?", options: ["{}", "[]", "()", "<>"], correct: "[]" },
          { question: "Which symbol creates a dictionary?", options: ["{}", "[]", "()", "<>"], correct: "{}" },
          { question: "Which method adds an item to a list?", options: ["add()", "insert()", "append()", "push()"], correct: "append()" }
        ]
      };

      const customQuestions =
        (typeof window !== "undefined" &&
          window.__CUSTOM_MISSION_ACTIVE__ === true &&
          Array.isArray(window.__CUSTOM_MISSION_BALLOON_QUESTIONS__) &&
          window.__CUSTOM_MISSION_BALLOON_QUESTIONS__.length > 0 &&
          window.__CUSTOM_MISSION_BALLOON_QUESTIONS__) ||
        null;

      const dynamicQuestions =
        (typeof window !== "undefined" &&
          Array.isArray(window.__BALLOON_DYNAMIC_QUESTIONS__) &&
          window.__BALLOON_DYNAMIC_QUESTIONS__.length > 0 &&
          window.__BALLOON_DYNAMIC_QUESTIONS__) ||
        null;

      if (customQuestions) {
        this.questions = customQuestions;
      } else if (dynamicQuestions) {
        this.questions = dynamicQuestions;
      } else {
        let topic = (typeof window !== "undefined" && window.__GAME_TOPIC__) || "variables";
        topic = topic.toLowerCase().trim().replace(/\s+/g, '-');
        this.questions = this.questionBanks[topic] || this.questionBanks["variables"];
      }

      this.remainingQuestions = [...this.questions].sort(() => Math.random() - 0.5);
      this.questionLevel = 0;
    }

    preload() {
      this.load.image("bg", "/assets/Balloon-shooting/bg.jpg");
      this.load.image("bow", "/assets/Balloon-shooting/bow.png");
      this.load.image("arrow", "/assets/Balloon-shooting/arrow.png");
      this.load.image("quiver", "/assets/Balloon-shooting/quiver.png");
      this.load.image("balloon_red", "/assets/Balloon-shooting/red.png");
      this.load.image("balloon_white", "/assets/Balloon-shooting/golden.png");
      this.load.image("balloon_blue", "/assets/Balloon-shooting/blue.png");
      this.load.image("balloon_yellow", "/assets/Balloon-shooting/purple.png");

      this.load.on("loaderror", (file) => { console.error("Failed to load:", file.src); });
    }

    create() {
      const W = this.scale.width;
      const H = this.scale.height;

      this.createBackground(W, H);
      this.createHUD(W, H);
      this.createBow(W, H);
      this.createQuiver(W, H);
      this.createCrosshair();
      this.loadNewQuestion();
      this.startTimer();

      this.input.on("pointermove", (pointer) => {
        this.crosshair.setPosition(pointer.x, pointer.y);
        if (this.isDrawing) this.aimBow(pointer);
      });

      this.input.on("pointerdown", (pointer) => {
        if (!this.canShoot || this.arrows <= 0) return;
        this.startAim(pointer);
      });

      this.input.on("pointerup", (pointer) => {
        if (this.isDrawing) this.releaseArrow(pointer);
      });
    }

    createBackground(W, H) {
      const bg = this.add.image(W / 2, H / 2, "bg");
      bg.setDisplaySize(W, H);
      if (bg.postFX) bg.postFX.addBlur(4);
    }

    createHUD(W, H) {
      // ── HUD background: two-tone gradient bar ─────────────────
      const hudBg = this.add.graphics();
      hudBg.fillStyle(CLR.hudBg, 0.88);
      hudBg.fillRect(0, 0, W, 82);
      // Teal accent strip at very bottom of HUD
      hudBg.fillStyle(0x00F5D4, 0.35);
      hudBg.fillRect(0, 80, W, 2);
      hudBg.setDepth(50);

      // ── Score ─────────────────────────────────────────────────
      this.scoreText = this.add
        .text(18, 14, "SCORE  0", {
          fontSize: "22px",
          fontFamily: FONT_DISPLAY,
          color: CLR.gold,
          ...STROKE_MED,
        })
        .setDepth(51);
      SHADOW_GLOW_GOLD(this, this.scoreText);

      // ── Level ─────────────────────────────────────────────────
      this.levelText = this.add
        .text(18, 46, "LEVEL  1", {
          fontSize: "14px",
          fontFamily: FONT_UI,
          color: CLR.teal,
          ...STROKE_LIGHT,
          letterSpacing: 3,
        })
        .setDepth(51);
      SHADOW_GLOW_TEAL(this, this.levelText);

      // ── Question text (centred) ────────────────────────────────
      this.questionText = this.add
        .text(W / 2, 10, "", {
          fontSize: "19px",
          fontFamily: FONT_UI,
          color: CLR.offWhite,
          ...STROKE_MED,
          align: "center",
          wordWrap: { width: W * 0.55 },
          lineSpacing: 5,
        })
        .setOrigin(0.5, 0)
        .setDepth(51);
      SHADOW_SOFT(this, this.questionText);

      // Invisible legacy arrows text (untouched logic)
      this.arrowsText = this.add
        .text(W - 16, 10, "", { fontSize: "0px" })
        .setOrigin(1, 0)
        .setDepth(51)
        .setVisible(false);

      // ── Timer ─────────────────────────────────────────────────
      this.timerText = this.add
        .text(W - 18, 46, "TIME  01:00", {
          fontSize: "15px",
          fontFamily: FONT_UI,
          color: CLR.dimWhite,
          ...STROKE_LIGHT,
          letterSpacing: 3,
        })
        .setOrigin(1, 0)
        .setDepth(51);
      SHADOW_SOFT(this, this.timerText);
    }

    createBow(W, H) {
      this.bowX = W / 2;
      this.bowY = H - 70;
      this.bowContainer = this.add.container(this.bowX, this.bowY);
      this.bowContainer.setDepth(10);

      this.bowImage = this.add.image(0, 0, "bow");
      this.bowImage.setScale(0.22);
      this.bowImage.setOrigin(0.5, 0.5);

      this.arrowOnBow = this.add.image(0, -5, "arrow");
      this.arrowOnBow.setScale(0.14);
      this.arrowOnBow.setOrigin(0.5, 1.0);

      this.bowContainer.add([this.bowImage, this.arrowOnBow]);
      this.bowContainer.setRotation(0);
    }

    createQuiver(W, H) {
      this.quiverImage = this.add.image(W - 50, H - 80, "quiver");
      this.quiverImage.setScale(0.18);
      this.quiverImage.setDepth(12);

      // Badge-style pill background behind arrow count
      const pillBg = this.add.graphics().setDepth(12);
      pillBg.fillStyle(CLR.hudBg, 0.85);
      pillBg.fillRoundedRect(W - 72, H - 46, 44, 32, 8);
      pillBg.lineStyle(2, 0xFFD84D, 0.7);
      pillBg.strokeRoundedRect(W - 72, H - 46, 44, 32, 8);

      this.quiverText = this.add
        .text(W - 50, H - 30, `${this.arrows}`, {
          fontSize: "22px",
          fontFamily: FONT_DISPLAY,
          color: CLR.gold,
          ...STROKE_MED,
        })
        .setOrigin(0.5, 0.5)
        .setDepth(13);
      SHADOW_GLOW_GOLD(this, this.quiverText);
    }

    startAim(pointer) {
      this.isDrawing = true;
      this.arrowOnBow.setVisible(true);
      this.arrowOnBow.setAlpha(1);
      this.aimBow(pointer);
    }

    aimBow(pointer) {
      if (!this.isDrawing) return;
      const aimAngle = Phaser.Math.Angle.Between(this.bowX, this.bowY, pointer.x, pointer.y);
      const containerRotation = aimAngle + Math.PI / 2;
      const clamped = Phaser.Math.Clamp(containerRotation, -1.2, 1.2);
      this.bowContainer.setRotation(clamped);
      this.currentAimAngle = aimAngle;
    }

    releaseArrow(pointer) {
      if (!this.isDrawing) return;
      this.isDrawing = false;
      const aimAngle = this.currentAimAngle;

      this.canShoot = false;
      this.arrows--;
      this.arrowsText.setText(`ARROWS: ${this.arrows}`);
      this.quiverText.setText(`${this.arrows}`);
      this.arrowOnBow.setVisible(false);

      this.tweens.add({
        targets: this.bowContainer,
        rotation: 0,
        duration: 200,
        ease: "Power2",
      });

      const arrowProjectile = this.add.image(this.bowX, this.bowY, "arrow");
      arrowProjectile.setScale(0.14);
      arrowProjectile.setDepth(20);
      arrowProjectile.setRotation(aimAngle - Math.PI / 2);

      const targetX = pointer.x;
      const targetY = pointer.y;
      const flyDist = Phaser.Math.Distance.Between(this.bowX, this.bowY, targetX, targetY);
      const speed = 900;
      const flyDuration = (flyDist / speed) * 1000;

      this.tweens.add({
        targets: arrowProjectile,
        x: targetX,
        y: targetY,
        duration: Math.max(flyDuration, 120),
        ease: "Power1",
        onComplete: () => { this.checkArrowHit(targetX, targetY, arrowProjectile); },
      });

      this.tweens.add({
        targets: this.bowContainer,
        scaleX: 1.06,
        scaleY: 0.94,
        duration: 80,
        yoyo: true,
        ease: "Power2",
      });
    }

    checkArrowHit(hitX, hitY, arrowProjectile) {
      let hitBalloon = null;
      for (const balloon of this.balloons) {
        const dist = Phaser.Math.Distance.Between(hitX, hitY, balloon.container.x, balloon.container.y);
        if (dist < balloon.radius + 10) { hitBalloon = balloon; break; }
      }

      if (hitBalloon) {
        this.tweens.add({
          targets: arrowProjectile,
          alpha: 0,
          duration: 300,
          delay: 100,
          onComplete: () => arrowProjectile.destroy(),
        });
        this.popBalloon(hitBalloon);
      } else {
        this.tweens.add({
          targets: arrowProjectile,
          alpha: 0,
          y: hitY + 30,
          duration: 400,
          ease: "Power2",
          onComplete: () => {
            arrowProjectile.destroy();
            this.canShoot = true;
            this.arrowOnBow.setVisible(true);
          },
        });
      }

      if (this.arrows <= 0) {
        this.time.delayedCall(500, () => this.endGame());
      }
    }

    createCrosshair() {
      const g = this.add.graphics();
      // Outer ring — teal glow
      g.lineStyle(1.5, 0x00F5D4, 0.9);
      g.strokeCircle(0, 0, 18);
      // Inner dot
      g.fillStyle(0x00F5D4, 1);
      g.fillCircle(0, 0, 2.5);
      // Hair lines
      g.lineStyle(1.2, 0xffffff, 0.7);
      g.lineBetween(-28, 0, -20, 0);
      g.lineBetween(20, 0, 28, 0);
      g.lineBetween(0, -28, 0, -20);
      g.lineBetween(0, 20, 0, 28);
      // Diagonal ticks for precision feel
      g.lineStyle(1, 0x00F5D4, 0.45);
      g.lineBetween(-13, -13, -9, -9);
      g.lineBetween(13, -13, 9, -9);
      g.lineBetween(-13, 13, -9, 9);
      g.lineBetween(13, 13, 9, 9);
      this.crosshair = g;
      this.crosshair.setDepth(100);
    }

    loadNewQuestion() {
      this.balloons.forEach((b) => b.destroy());
      this.balloons = [];

      if (this.remainingQuestions.length === 0) {
        this.endGame(true);
        return;
      }

      const q = this.remainingQuestions.pop();
      this.questionLevel++;
      // Orbitron-style spaced label + question
      this.levelText.setText(`LEVEL  ${this.questionLevel}`);
      this.questionText.setText("Q:  " + q.question);
      this.spawnBalloons(q.options, q.correct);
    }

    spawnBalloons(options, correct) {
      const W = this.scale.width;
      const H = this.scale.height;

      const colors = ["balloon_red", "balloon_white", "balloon_blue", "balloon_yellow"];
      Phaser.Utils.Array.Shuffle(colors);

      const positions = this.getBalloonPositions(options.length, W, H);

      options.forEach((option, i) => {
        const { x, y } = positions[i];
        const colorKey = colors[i % colors.length];
        const isCorrect = option === correct;
        const startY = H + 300;

        const balloon = this.createBalloon(x, startY, colorKey, option, isCorrect);
        this.balloons.push(balloon);

        this.tweens.add({
          targets: balloon.container,
          y: y,
          duration: 800 + Phaser.Math.Between(0, 300),
          ease: "Back.easeOut",
          delay: i * 150,
          onComplete: () => {
            this.tweens.add({
              targets: balloon.container,
              y: y - Phaser.Math.Between(15, 30),
              duration: Phaser.Math.Between(1500, 2500),
              ease: "Sine.easeInOut",
              yoyo: true,
              repeat: -1,
            });
          },
        });
      });
    }

    getBalloonPositions(count, W, H) {
      const topPad = 200;
      const bottomPad = 200;
      const sidePad = 80;
      const usableW = W - sidePad * 2;
      const usableH = H - topPad - bottomPad;

      const positions = [];
      for (let i = 0; i < count; i++) {
        positions.push({
          x: sidePad + (usableW / (count - 1)) * i,
          y: topPad + usableH * 0.5 + Phaser.Math.Between(-30, 30),
        });
      }
      return positions;
    }

    createBalloon(x, y, colorKey, label, isCorrect) {
      const radius = 90;
      const container = this.add.container(x, y);

      const body = this.add.image(0, 0, colorKey);
      body.setOrigin(0.5, 0.5);

      let scale, textOffsetY;
      if (colorKey === "balloon_white") {
        scale = 0.097;
        textOffsetY = -(4864 * 0.097 * 0.175);
      } else if (colorKey === "balloon_yellow") {
        scale = 0.115;
        textOffsetY = -(4096 * 0.115 * 0.175);
      } else {
        scale = 0.94;
        textOffsetY = -(500 * 0.94 * 0.175);
      }
      body.setScale(scale);

      // ── Label text: Rajdhani bold, tight tracking, strong stroke ──
      const text = this.add
        .text(0, textOffsetY, label.toUpperCase(), {
          fontSize: "17px",
          fontFamily: FONT_UI,
          color: CLR.white,
          ...STROKE_MED,
          align: "center",
          wordWrap: { width: radius * 1.35 },
          lineSpacing: 2,
          letterSpacing: 1,
        })
        .setOrigin(0.5, 0.5);
      text.setShadow(2, 3, CLR.black, 5, true, true);

      container.add([body, text]);
      body.setInteractive();

      return { container, body, text, isCorrect, label, x, y, radius, destroy: () => container.destroy() };
    }

    popBalloon(balloon) {
      const isCorrect = balloon.isCorrect;
      const W = this.scale.width;

      this.tweens.add({
        targets: balloon.container,
        scaleX: 1.4,
        scaleY: 1.4,
        alpha: 0,
        duration: 200,
        ease: "Power2",
        onComplete: () => {
          balloon.destroy();
          this.balloons = this.balloons.filter((b) => b !== balloon);
        },
      });

      if (isCorrect) {
        this.score += 100;
        this.arrows = Math.min(this.arrows + 1, 20);
        this.scoreText.setText(`SCORE  ${this.score}`);
        this.arrowsText.setText(`ARROWS: ${this.arrows}`);
        this.quiverText.setText(`${this.arrows}`);
        // Bright teal correct feedback
        this.showFeedback("✓  CORRECT!\n+100 PTS", CLR.teal, W / 2, 180);

        this.time.delayedCall(800, () => {
          this.canShoot = true;
          this.arrowOnBow.setVisible(true);
          this.loadNewQuestion();
        });
      } else {
        this.score = Math.max(0, this.score - 50);
        this.scoreText.setText(`SCORE  ${this.score}`);
        // Red wrong feedback
        this.showFeedback("✕  WRONG!\n−50 PTS", CLR.crimson, W / 2, 180);
        this.cameras.main.flash(300, 180, 0, 0, false);

        this.time.delayedCall(400, () => {
          this.canShoot = true;
          this.arrowOnBow.setVisible(true);
        });
      }
    }

    showFeedback(message, color, x, y) {
      // Subtle dark pill behind feedback text
      const pillW = 280, pillH = 70;
      const pill = this.add.graphics().setDepth(59);
      pill.fillStyle(CLR.overlayBg, 0.78);
      pill.fillRoundedRect(x - pillW / 2, y - pillH / 2, pillW, pillH, 12);

      const text = this.add
        .text(x, y, message, {
          fontSize: "30px",
          fontFamily: FONT_DISPLAY,
          color: color,
          ...STROKE_HEAVY,
          align: "center",
          lineSpacing: 4,
        })
        .setOrigin(0.5)
        .setDepth(60);
      text.setShadow(0, 0, color, 18, true, true);

      this.tweens.add({
        targets: [text, pill],
        y: `-=75`,
        alpha: 0,
        duration: 1100,
        ease: "Power2",
        onComplete: () => { text.destroy(); pill.destroy(); },
      });
    }

    startTimer() {
      this.timerEvent = this.time.addEvent({
        delay: 1000,
        callback: () => {
          this.timeLeft--;
          const mins = Math.floor(this.timeLeft / 60).toString().padStart(2, "0");
          const secs = (this.timeLeft % 60).toString().padStart(2, "0");
          // Flash red when under 10 seconds
          const isLow = this.timeLeft <= 10;
          this.timerText.setColor(isLow ? CLR.crimson : CLR.dimWhite);
          this.timerText.setText(`TIME  ${mins}:${secs}`);

          if (this.timeLeft <= 0) this.endGame();
        },
        repeat: -1,
      });
    }

    endGame(allQuestionsComplete = false) {
      if (auth.currentUser) {
        updateGameStats(auth.currentUser.uid, 'balloon', this.score, Math.max(0, this.score / 100), this.questionLevel);
      }

      this.timerEvent?.remove();
      this.canShoot = false;
      this.isDrawing = false;

      const W = this.scale.width;
      const H = this.scale.height;

      // ── End-screen overlay ────────────────────────────────────
      const overlay = this.add.graphics();
      overlay.fillStyle(CLR.overlayBg, 0.92);
      overlay.fillRect(0, 0, W, H);
      overlay.setDepth(90);

      // Decorative side rules
      const rules = this.add.graphics().setDepth(91);
      rules.lineStyle(1, 0x00F5D4, 0.4);
      rules.lineBetween(W * 0.12, H * 0.3, W * 0.12, H * 0.75);
      rules.lineBetween(W * 0.88, H * 0.3, W * 0.88, H * 0.75);
      rules.lineStyle(1, 0x00F5D4, 0.2);
      rules.lineBetween(W * 0.18, H * 0.28, W * 0.82, H * 0.28);
      rules.lineBetween(W * 0.18, H * 0.77, W * 0.82, H * 0.77);

      const titleMsg = allQuestionsComplete ? "ALL DONE!" : "ROUND OVER";
      const titleColor = allQuestionsComplete ? CLR.teal : CLR.gold;

      // Small eyebrow
      this.add
        .text(W / 2, H / 2 - 145, "— RESULTS —", {
          fontSize: "14px",
          fontFamily: FONT_UI,
          color: CLR.dimWhite,
          letterSpacing: 8,
          ...STROKE_LIGHT,
        })
        .setOrigin(0.5)
        .setDepth(91)
        .setAlpha(0.75);

      // Main title
      const endTitle = this.add
        .text(W / 2, H / 2 - 100, titleMsg, {
          fontSize: "58px",
          fontFamily: FONT_DISPLAY,
          color: titleColor,
          ...STROKE_HEAVY,
          align: "center",
          wordWrap: { width: W * 0.85 },
        })
        .setOrigin(0.5)
        .setDepth(91);
      endTitle.setShadow(0, 0, titleColor, 22, true, true);

      // Score line
      this.add
        .text(W / 2, H / 2 - 28, `FINAL SCORE`, {
          fontSize: "14px",
          fontFamily: FONT_UI,
          color: CLR.dimWhite,
          letterSpacing: 6,
          ...STROKE_LIGHT,
        })
        .setOrigin(0.5)
        .setDepth(91)
        .setAlpha(0.7);

      const scoreDisp = this.add
        .text(W / 2, H / 2 + 14, `${this.score}`, {
          fontSize: "52px",
          fontFamily: FONT_DISPLAY,
          color: CLR.gold,
          ...STROKE_HEAVY,
        })
        .setOrigin(0.5)
        .setDepth(91);
      SHADOW_GLOW_GOLD(this, scoreDisp);

      if (allQuestionsComplete) {
        this.add
          .text(W / 2, H / 2 + 72, `${this.questionLevel} QUESTIONS ANSWERED`, {
            fontSize: "16px",
            fontFamily: FONT_UI,
            color: CLR.teal,
            letterSpacing: 4,
            ...STROKE_LIGHT,
          })
          .setOrigin(0.5)
          .setDepth(91);
      }

      const accuracy =
        this.score === 0
          ? 0
          : Math.min(100, Math.round((this.score / (this.score + (12 - this.arrows) * 50)) * 100));

      const event = new CustomEvent("gameOver", {
        detail: { score: this.score, accuracy: accuracy || 10 },
      });
      window.dispatchEvent(event);

      // ─── End-screen buttons ────────────────────────────────────
      const createMenuButton = (y, textStr, baseColor, hoverColor, onClick) => {
        const btn = this.add
          .text(W / 2, y, textStr, {
            fontSize: "22px",
            fontFamily: FONT_DISPLAY,
            color: baseColor,
            ...STROKE_MED,
            letterSpacing: 2,
          })
          .setOrigin(0.5)
          .setInteractive({ useHandCursor: true })
          .setDepth(91);
        btn.setShadow(0, 0, baseColor, 10, true, true);

        btn.on("pointerover", () => { btn.setColor(hoverColor); btn.setScale(1.08); });
        btn.on("pointerout", () => { btn.setColor(baseColor); btn.setScale(1); });
        btn.on("pointerdown", onClick);
      };

      createMenuButton(H / 2 + 130, "[ PLAY AGAIN ]", CLR.teal, "#00F5D4", () => {
        this.score = 0; this.arrows = 12; this.timeLeft = 60; this.canShoot = true;
        this.scene.start("MenuScene");
      });

      createMenuButton(H / 2 + 180, "[    QUIT    ]", CLR.crimson, "#FF2D55", () => {
        if (typeof window !== "undefined") {
          const cId = window.__GAME_COURSE_ID__;
          const lId = window.__GAME_LESSON_ID__;
          window.location.href = cId && lId ? `/courses/${cId}/${lId}/play` : "/dashboard";
        }
      });
    }

    update() {
      this.crosshair.setDepth(100);
    }
  }
  return BalloonScene;
}