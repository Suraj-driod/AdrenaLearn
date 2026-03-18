import { auth } from "../../../backend/firebase";
import { updateGameStats } from "../../../backend/gameStatsHelper";
import { getQuestionsByTopic } from "../../gameQuestions";

// ─── Inject Outfit font once ──────────────────────────────────────────────────
if (typeof document !== "undefined") {
  const fontId = "__outfit_font__";
  if (!document.getElementById(fontId)) {
    const link = document.createElement("link");
    link.id = fontId;
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Outfit:wght@400;700;900&display=swap";
    document.head.appendChild(link);
  }
}

const FONT = "'Outfit', 'Arial Black', Impact, sans-serif";

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

      if (bg.postFX) {
        bg.postFX.addBlur(4);
      }

      // Dark overlay for contrast
      const overlay = this.add.graphics();
      overlay.fillStyle(0x000000, 0.55);
      overlay.fillRect(0, 0, W, H);

      // Floating decorative balloons in background
      const decoColors = ["balloon_red", "balloon_blue", "balloon_yellow", "balloon_white"];
      for (let i = 0; i < 6; i++) {
        const bx = Phaser.Math.Between(60, W - 60);
        const by = Phaser.Math.Between(80, H - 120);
        const colorKey = decoColors[i % 4];
        const balloon = this.add.image(bx, by, colorKey);

        let scale;
        const rand = 0.6 + Math.random() * 0.4;
        // ~75% of game balloon sizes for subtle background decoration
        if (colorKey === "balloon_white") {
          scale = 0.096 * rand; // Golden  (3328x4864)
        } else if (colorKey === "balloon_yellow") {
          scale = 0.115 * rand; // Purple  (2800x4096)
        } else {
          scale = 0.94 * rand;  // Red/Blue (500x500)
        }

        balloon.setScale(scale);
        balloon.setAlpha(0.2 + Math.random() * 0.15);
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

      // Bow decoration (bottom center, subtle)
      const bow = this.add.image(W / 2, H - 50, "bow");
      bow.setScale(0.18);
      bow.setAlpha(0.3);

      // ─── TITLE ───────────────────────────────────────────────
      const titleText = this.add
        .text(W / 2, H * 0.28, "BALLOON\nSHOOTER", {
          fontSize: "64px",
          fontFamily: FONT,
          color: "#FFEA00",
          stroke: "#5C2E00",
          strokeThickness: 12,
          align: "center",
          lineSpacing: 10,
        })
        .setOrigin(0.5)
        .setShadow(4, 6, "#000000", 6, true, true);

      this.tweens.add({
        targets: titleText,
        y: "-=12",
        duration: 2200,
        ease: "Sine.easeInOut",
        yoyo: true,
        repeat: -1,
      });

      // ─── START BUTTON ────────────────────────────────────────
      const startBtnBg = this.add.graphics();
      const startBtnX = W / 2;
      const startBtnY = H * 0.55;
      const btnW = 240;
      const btnH = 65;

      startBtnBg.fillStyle(0x2ecc71, 1);
      startBtnBg.fillRoundedRect(startBtnX - btnW / 2, startBtnY - btnH / 2, btnW, btnH, 16);
      startBtnBg.lineStyle(4, 0x000000, 1);
      startBtnBg.strokeRoundedRect(startBtnX - btnW / 2, startBtnY - btnH / 2, btnW, btnH, 16);

      const startShadow = this.add.graphics();
      startShadow.fillStyle(0x000000, 0.4);
      startShadow.fillRoundedRect(startBtnX - btnW / 2 + 6, startBtnY - btnH / 2 + 6, btnW, btnH, 16);
      startShadow.setDepth(0);
      startBtnBg.setDepth(1);

      const startText = this.add
        .text(startBtnX, startBtnY, "START", {
          fontSize: "32px",
          fontFamily: FONT,
          color: "#FFFFFF",
          stroke: "#004D00",
          strokeThickness: 6,
        })
        .setOrigin(0.5)
        .setDepth(2)
        .setShadow(2, 3, "#000000", 3, true, true);

      const startHitbox = this.add
        .zone(startBtnX, startBtnY, btnW, btnH)
        .setInteractive({ useHandCursor: true })
        .setDepth(3);

      startHitbox.on("pointerover", () => {
        startBtnBg.clear();
        startBtnBg.fillStyle(0x27ae60, 1);
        startBtnBg.fillRoundedRect(startBtnX - btnW / 2, startBtnY - btnH / 2, btnW, btnH, 16);
        startBtnBg.lineStyle(4, 0x000000, 1);
        startBtnBg.strokeRoundedRect(startBtnX - btnW / 2, startBtnY - btnH / 2, btnW, btnH, 16);
        startText.setScale(1.1);
      });

      startHitbox.on("pointerout", () => {
        startBtnBg.clear();
        startBtnBg.fillStyle(0x2ecc71, 1);
        startBtnBg.fillRoundedRect(startBtnX - btnW / 2, startBtnY - btnH / 2, btnW, btnH, 16);
        startBtnBg.lineStyle(4, 0x000000, 1);
        startBtnBg.strokeRoundedRect(startBtnX - btnW / 2, startBtnY - btnH / 2, btnW, btnH, 16);
        startText.setScale(1);
      });

      startHitbox.on("pointerdown", () => {
        this.cameras.main.fadeOut(400, 0, 0, 0);
        this.time.delayedCall(400, () => {
          this.scene.start("BalloonScene");
        });
      });

      // ─── QUIT BUTTON ─────────────────────────────────────────
      const quitBtnBg = this.add.graphics();
      const quitBtnY = H * 0.70;

      quitBtnBg.fillStyle(0xe74c3c, 1);
      quitBtnBg.fillRoundedRect(startBtnX - btnW / 2, quitBtnY - btnH / 2, btnW, btnH, 16);
      quitBtnBg.lineStyle(4, 0x000000, 1);
      quitBtnBg.strokeRoundedRect(startBtnX - btnW / 2, quitBtnY - btnH / 2, btnW, btnH, 16);

      const quitShadow = this.add.graphics();
      quitShadow.fillStyle(0x000000, 0.4);
      quitShadow.fillRoundedRect(startBtnX - btnW / 2 + 6, quitBtnY - btnH / 2 + 6, btnW, btnH, 16);
      quitShadow.setDepth(0);
      quitBtnBg.setDepth(1);

      const quitText = this.add
        .text(startBtnX, quitBtnY, "QUIT", {
          fontSize: "32px",
          fontFamily: FONT,
          color: "#FFFFFF",
          stroke: "#600000",
          strokeThickness: 6,
        })
        .setOrigin(0.5)
        .setDepth(2)
        .setShadow(2, 3, "#000000", 3, true, true);

      const quitHitbox = this.add
        .zone(startBtnX, quitBtnY, btnW, btnH)
        .setInteractive({ useHandCursor: true })
        .setDepth(3);

      quitHitbox.on("pointerover", () => {
        quitBtnBg.clear();
        quitBtnBg.fillStyle(0xc0392b, 1);
        quitBtnBg.fillRoundedRect(startBtnX - btnW / 2, quitBtnY - btnH / 2, btnW, btnH, 16);
        quitBtnBg.lineStyle(4, 0x000000, 1);
        quitBtnBg.strokeRoundedRect(startBtnX - btnW / 2, quitBtnY - btnH / 2, btnW, btnH, 16);
        quitText.setScale(1.1);
      });

      quitHitbox.on("pointerout", () => {
        quitBtnBg.clear();
        quitBtnBg.fillStyle(0xe74c3c, 1);
        quitBtnBg.fillRoundedRect(startBtnX - btnW / 2, quitBtnY - btnH / 2, btnW, btnH, 16);
        quitBtnBg.lineStyle(4, 0x000000, 1);
        quitBtnBg.strokeRoundedRect(startBtnX - btnW / 2, quitBtnY - btnH / 2, btnW, btnH, 16);
        quitText.setScale(1);
      });

      quitHitbox.on("pointerdown", () => {
        if (typeof window !== "undefined") {
          const cId = window.__GAME_COURSE_ID__;
          const lId = window.__GAME_LESSON_ID__;
          /* disabled by React */
        }
      });

      // ─── SUBTITLE ────────────────────────────────────────────
      this.add
        .text(W / 2, H * 0.85, "Aim · Shoot · Learn", {
          fontSize: "20px",
          fontFamily: FONT,
          color: "#FFFFFF",
          fontStyle: "italic",
          stroke: "#000000",
          strokeThickness: 3,
        })
        .setOrigin(0.5)
        .setAlpha(0.8)
        .setShadow(1, 1, "#000000", 2, true, true);

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

      if (customQuestions) {
        this.questions = customQuestions;
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

      this.load.on("loaderror", (file) => {
        console.error("Failed to load:", file.src);
      });
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
        if (this.isDrawing) {
          this.aimBow(pointer);
        }
      });

      this.input.on("pointerdown", (pointer) => {
        if (!this.canShoot || this.arrows <= 0) return;
        this.startAim(pointer);
      });

      this.input.on("pointerup", (pointer) => {
        if (this.isDrawing) {
          this.releaseArrow(pointer);
        }
      });
    }

    createBackground(W, H) {
      const bg = this.add.image(W / 2, H / 2, "bg");
      bg.setDisplaySize(W, H);

      if (bg.postFX) {
        bg.postFX.addBlur(4);
      }
    }

    createHUD(W, H) {
      const hudBg = this.add.graphics();
      hudBg.fillStyle(0x000000, 0.65);
      hudBg.fillRect(0, 0, W, 80);
      hudBg.setDepth(50);

      const baseHudStyle = {
        fontFamily: FONT,
        stroke: "#000000",
        strokeThickness: 5,
      };

      this.scoreText = this.add.text(16, 12, "SCORE: 0", {
        ...baseHudStyle,
        fontSize: "22px",
        color: "#FFD700",
      }).setDepth(51).setShadow(2, 2, "#000", 2, true, true);

      this.levelText = this.add.text(16, 42, "LEVEL: 1", {
        ...baseHudStyle,
        fontSize: "16px",
        color: "#00FFFF",
      }).setDepth(51).setShadow(1, 1, "#000", 2, true, true);

      this.questionText = this.add.text(W / 2, 10, "", {
        ...baseHudStyle,
        fontSize: "20px",
        color: "#FFFFFF",
        align: "center",
        wordWrap: { width: W * 0.6 },
        lineSpacing: 4,
      }).setOrigin(0.5, 0).setDepth(51).setShadow(2, 2, "#000", 2, true, true);

      this.arrowsText = this.add
        .text(W - 16, 10, "", { ...baseHudStyle, fontSize: "0px" })
        .setOrigin(1, 0)
        .setDepth(51)
        .setVisible(false);

      this.timerText = this.add.text(W - 16, 42, "TIME: 01:00", {
        ...baseHudStyle,
        fontSize: "18px",
        color: "#FFFFFF",
      }).setOrigin(1, 0).setDepth(51).setShadow(1, 1, "#000", 2, true, true);
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

      this.quiverText = this.add.text(W - 50, H - 30, `${this.arrows}`, {
        fontSize: "28px",
        fontFamily: FONT,
        color: "#FFEA00",
        stroke: "#000000",
        strokeThickness: 6,
      }).setOrigin(0.5, 0.5).setDepth(13).setShadow(2, 2, "#000", 3, true, true);
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
        onComplete: () => {
          this.checkArrowHit(targetX, targetY, arrowProjectile);
        },
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
        if (dist < balloon.radius + 10) {
          hitBalloon = balloon;
          break;
        }
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
      g.lineStyle(2, 0xffffff, 0.8);
      g.strokeCircle(0, 0, 16);
      g.fillStyle(0xffffff, 0.9);
      g.fillCircle(0, 0, 2);
      g.lineStyle(1.5, 0xffffff, 0.8);
      g.lineBetween(-24, 0, -18, 0);
      g.lineBetween(18, 0, 24, 0);
      g.lineBetween(0, -24, 0, -18);
      g.lineBetween(0, 18, 0, 24);
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
      this.levelText.setText(`LEVEL: ${this.questionLevel}`);
      this.questionText.setText("QUESTION:\n" + q.question);
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
      // topPad = 200 — clears the HUD + question text area at the top
      // usableH * 0.5 — centres balloons in the open play space
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
      // ── Balloon sizes (all render at ~470px) ──────────────────────────────
      // Red/Blue:  500px  × 0.94  ≈ 470px  (square image — no offset needed)
      // Golden:   4864px  × 0.097 ≈ 472px  (tall: string occupies bottom ~30%)
      // Purple:   4096px  × 0.115 ≈ 471px  (tall: string occupies bottom ~30%)
      //
      // Golden & Purple images are portrait PNGs where the balloon body sits in
      // the top ~70% and a string dangles through the bottom ~30%. Their
      // geometric center (origin 0.5, 0.5) therefore falls inside the string
      // area, not the balloon body. We shift the text UP by ~20% of the
      // rendered height to realign it with the visual center of the balloon body.
      const radius = 90;
      const container = this.add.container(x, y);

      const body = this.add.image(0, 0, colorKey);
      body.setOrigin(0.5, 0.5);

      // textOffsetY: shift text UP so it sits in the visual balloon body,
      // not the geometric centre of the full image (which includes knot/string).
      //
      // All 4 PNGs have the balloon body filling roughly the top 65% and a
      // knot + string in the bottom 35%. The visual body centre is therefore
      // at ~32.5% from the top, while the geometric centre is at 50%.
      // Offset (in world px) = (0.325 - 0.5) × nativeHeight × scale
      //                      = -0.175 × nativeHeight × scale
      //
      // Red/Blue  500 × 500  @0.94  → -0.175 × 500  × 0.94  ≈ -82px
      // Golden   3328 ×4864  @0.097 → -0.175 × 4864 × 0.097 ≈ -83px
      // Purple   2800 ×4096  @0.115 → -0.175 × 4096 × 0.115 ≈ -82px
      let scale;
      let textOffsetY;
      if (colorKey === "balloon_white") {
        scale = 0.097;
        textOffsetY = -(4864 * 0.097 * 0.175);  // ≈ -83px
      } else if (colorKey === "balloon_yellow") {
        scale = 0.115;
        textOffsetY = -(4096 * 0.115 * 0.175);  // ≈ -82px
      } else {
        scale = 0.94;
        textOffsetY = -(500 * 0.94 * 0.175);  // ≈ -82px
      }
      body.setScale(scale);

      const text = this.add
        .text(0, textOffsetY, label.toUpperCase(), {
          fontSize: "18px",
          fontFamily: FONT,
          color: "#FFFFFF",
          stroke: "#000000",
          strokeThickness: 5,
          align: "center",
          wordWrap: { width: radius * 1.4 },
          lineSpacing: 2,
        })
        .setOrigin(0.5, 0.5)
        .setShadow(2, 2, "#000000", 3, true, true);

      container.add([body, text]);
      body.setInteractive();

      return {
        container,
        body,
        text,
        isCorrect,
        label,
        x,
        y,
        radius,
        destroy: () => container.destroy(),
      };
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
        this.scoreText.setText(`SCORE: ${this.score}`);
        this.arrowsText.setText(`ARROWS: ${this.arrows}`);
        this.quiverText.setText(`${this.arrows}`);
        this.showFeedback("CORRECT!\n+100", "#2ECC71", W / 2, 180);

        this.time.delayedCall(800, () => {
          this.canShoot = true;
          this.arrowOnBow.setVisible(true);
          this.loadNewQuestion();
        });
      } else {
        this.score = Math.max(0, this.score - 50);
        this.scoreText.setText(`SCORE: ${this.score}`);
        this.showFeedback("WRONG!\n-50", "#E74C3C", W / 2, 180);
        this.cameras.main.flash(300, 180, 0, 0, false);

        this.time.delayedCall(400, () => {
          this.canShoot = true;
          this.arrowOnBow.setVisible(true);
        });
      }
    }

    showFeedback(message, color, x, y) {
      const text = this.add
        .text(x, y, message, {
          fontSize: "44px",
          fontFamily: FONT,
          color: color,
          stroke: "#FFFFFF",
          strokeThickness: 8,
          align: "center",
        })
        .setOrigin(0.5)
        .setDepth(60)
        .setShadow(4, 4, "#000000", 5, true, true);

      this.tweens.add({
        targets: text,
        y: y - 80,
        alpha: 0,
        duration: 1000,
        ease: "Power2",
        onComplete: () => text.destroy(),
      });
    }

    startTimer() {
      this.timerEvent = this.time.addEvent({
        delay: 1000,
        callback: () => {
          this.timeLeft--;
          const mins = Math.floor(this.timeLeft / 60)
            .toString()
            .padStart(2, "0");
          const secs = (this.timeLeft % 60).toString().padStart(2, "0");
          this.timerText.setText(`TIME: ${mins}:${secs}`);

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

      const overlay = this.add.graphics();
      overlay.fillStyle(0x000000, 0.85);
      overlay.fillRect(0, 0, W, H);
      overlay.setDepth(90);

      const titleMsg = allQuestionsComplete ? "ALL QUESTIONS COMPLETE!" : "ROUND COMPLETE!";
      const titleColor = allQuestionsComplete ? "#2ECC71" : "#FFEA00";

      this.add
        .text(W / 2, H / 2 - 100, titleMsg, {
          fontSize: "40px",
          fontFamily: FONT,
          color: titleColor,
          stroke: "#000000",
          strokeThickness: 8,
          align: "center",
          wordWrap: { width: W * 0.9 },
        })
        .setOrigin(0.5)
        .setDepth(91)
        .setShadow(3, 4, "#000", 4, true, true);

      this.add
        .text(W / 2, H / 2 - 30, `FINAL SCORE: ${this.score}`, {
          fontSize: "32px",
          fontFamily: FONT,
          color: "#FFFFFF",
          stroke: "#000000",
          strokeThickness: 6,
        })
        .setOrigin(0.5)
        .setDepth(91)
        .setShadow(2, 3, "#000", 3, true, true);

      if (allQuestionsComplete) {
        this.add
          .text(W / 2, H / 2 + 15, `Questions Answered: ${this.questionLevel}`, {
            fontSize: "22px",
            fontFamily: FONT,
            color: "#FFD700",
          })
          .setOrigin(0.5)
          .setDepth(91);
      }

      const accuracy =
        this.score === 0
          ? 0
          : Math.min(100, Math.round((this.score / (this.score + (12 - this.arrows) * 50)) * 100));

      const event = new CustomEvent("gameOver", {
        detail: {
          score: this.score,
          accuracy: accuracy || 10,
        },
      });
      window.dispatchEvent(event);

      // ─── End-screen buttons ───────────────────────────────────
      const createMenuButton = (y, textStr, baseColor, hoverColor, onClick) => {
        const btn = this.add
          .text(W / 2, y, textStr, {
            fontSize: "28px",
            fontFamily: FONT,
            color: baseColor,
            stroke: "#000000",
            strokeThickness: 6,
          })
          .setOrigin(0.5)
          .setInteractive({ useHandCursor: true })
          .setDepth(91)
          .setShadow(2, 2, "#000", 2, true, true);

        btn.on("pointerover", () => {
          btn.setColor(hoverColor);
          btn.setScale(1.1);
        });
        btn.on("pointerout", () => {
          btn.setColor(baseColor);
          btn.setScale(1);
        });
        btn.on("pointerdown", onClick);
      };

      createMenuButton(H / 2 + 90, "[ PLAY AGAIN ]", "#2ECC71", "#27AE60", () => {
        this.score = 0;
        this.arrows = 12;
        this.timeLeft = 60;
        this.canShoot = true;
        this.scene.start("MenuScene");
      });

      createMenuButton(H / 2 + 150, "[ QUIT ]", "#E74C3C", "#C0392B", () => {
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