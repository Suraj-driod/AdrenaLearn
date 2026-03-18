import { auth } from '../../backend/firebase';
import { updateGameStats } from '../../backend/gameStatsHelper';
import { getQuestionsByTopic } from "../gameQuestions.js";

export default function functionOnFourthScene(Phaser, BaseLevel) {
  return class FourthScene extends BaseLevel {
    constructor() {
      super('FourthScene');
    }

    preload() {
      this.load.image('bridge', '/assets/kat-Mage/bridge.png');
      this.load.image('scene4', '/assets/kat-Mage/scene4.jpg');
    }

    create() {
      this.hasShownNoSurprises = false;
      this.hasShownProblem = false;
      this.isLevelComplete = false;
      this.questionAnswered = false;

      // 1. Bottom Layer: Background Scene (Depth 0)
      const scene4 = this.add.image(450, 450, 'scene4');
      scene4.setDisplaySize(900, 900);
      scene4.setDepth(0); 

      this.add.text(450, 100, 'LEVEL 4', {
        fontSize: '48px', color: '#ffffff', fontStyle: 'bold'
      }).setOrigin(0.5).setDepth(0);

      // 3. Top Layer: The Cat (Depth 2) — walks ON the bridge
      this.setupPlayer(100, 550);
      if (this.cat) {
        this.cat.setDepth(2); 
      }
      this.canMove = true;

      // 2. Middle Layer: The Bridge (Depth 1)
      const bridge = this.add.image(450, 580, 'bridge');
      bridge.setDepth(1);

      this.listenerController = new AbortController();
      const { signal } = this.listenerController;

      this.handleCorrect = () => {
        if (this.questionAnswered) return;
        this.questionAnswered = true;
        this.scene.resume();

        // Properly destroy the group so memory is cleared safely
        if (this.problemGroup) this.problemGroup.destroy(true);
        this.canMove = true;
      };

      this.handleWrong = () => {
        if (this.questionAnswered) return;
        this.questionAnswered = true;
        this.scene.resume();

        if (this.problemGroup) this.problemGroup.destroy(true);
        
        this.cat.setTexture('white-cat-die');
        this.cat.play('die');
        
        // Consistent failure overlay
        const overlay = this.add.rectangle(450, 450, 900, 900, 0x000000, 0.85).setDepth(10);
        this.add.text(450, 400, 'SO NEAR YET SO FAR', { 
          fontSize: '48px', 
          fontFamily: 'Arial, sans-serif',
          color: '#ef4444',
          fontStyle: 'bold'
        }).setOrigin(0.5).setDepth(10);

        // Styled Retry Button matching other scenes
        const retryBg = this.add.rectangle(450, 520, 240, 60, 0x334155).setStrokeStyle(2, 0x64748b).setDepth(10);
        const retryText = this.add.text(450, 520, 'RETRY', { 
          fontSize: '24px', 
          fontFamily: 'Arial, sans-serif',
          color: '#ffffff',
          fontStyle: 'bold',
          letterSpacing: 2
        }).setOrigin(0.5).setDepth(10);

        const retryHitbox = this.add.zone(450, 520, 240, 60).setInteractive({ useHandCursor: true }).setDepth(10);
        
        retryHitbox.on('pointerover', () => { retryBg.setFillStyle(0x475569); });
        retryHitbox.on('pointerout', () => { retryBg.setFillStyle(0x334155); });
        retryHitbox.on('pointerdown', () => this.scene.restart());
      };

      window.addEventListener('correctAnswer', this.handleCorrect, { signal });
      window.addEventListener('wrongAnswer', this.handleWrong, { signal });

      this.events.on("shutdown", () => { this.listenerController.abort(); });
      this.events.on("destroy", () => { this.listenerController.abort(); });
    }

    update() {
      if (this.canMove) this.playerMovement();

      if (this.cat.x >= 450 && !this.hasShownNoSurprises) {
        this.hasShownNoSurprises = true;
        this.showNoSurprises();
      }

      if (this.cat.x >= 650 && !this.hasShownProblem) {
        this.hasShownProblem = true;
        this.showFinalProblem();
      }

      if (this.cat.x >= 850 && !this.isLevelComplete) {
        this.isLevelComplete = true;
        this.winSequence();
      }
    }

    showNoSurprises() {
      this.canMove = false;
      this.cat.play('idle', true);
      this.keys.left.reset();
      this.keys.right.reset();

      const overlay = this.add.rectangle(450, 450, 900, 900, 0x000000, 0.85).setDepth(10);
      const text = this.add.text(450, 400, 'NO SURPRISES HERE', { 
        fontSize: '48px', 
        fontFamily: 'Arial, sans-serif',
        color: '#4ade80',
        fontStyle: 'bold'
      }).setOrigin(0.5).setDepth(10);

      // Styled Continue Button matching other scenes
      const continueBg = this.add.rectangle(450, 520, 240, 60, 0x334155).setStrokeStyle(2, 0x64748b).setDepth(10);
      const continueText = this.add.text(450, 520, 'CONTINUE', { 
        fontSize: '24px', 
        fontFamily: 'Arial, sans-serif',
        color: '#ffffff',
        fontStyle: 'bold',
        letterSpacing: 2
      }).setOrigin(0.5).setDepth(10);

      const continueHitbox = this.add.zone(450, 520, 240, 60).setInteractive({ useHandCursor: true }).setDepth(10);
      
      continueHitbox.on('pointerover', () => { continueBg.setFillStyle(0x475569); });
      continueHitbox.on('pointerout', () => { continueBg.setFillStyle(0x334155); });
      continueHitbox.on('pointerdown', () => {
        overlay.destroy();
        text.destroy();
        continueBg.destroy();
        continueText.destroy();
        continueHitbox.destroy();
        this.canMove = true;
      });
    }

    showFinalProblem() {
      this.canMove = false;
      this.cat.play('idle', true);
      this.keys.left.reset();
      this.keys.right.reset();

      this.problemGroup = this.add.group();
      const overlay = this.add.rectangle(450, 450, 900, 900, 0x000000, 0.85).setDepth(10);
      let qData;
      let missionTitle = 'LOL ONE MORE PROBLEM';

      if (window.__CUSTOM_MISSION_ACTIVE__ && window.__CUSTOM_MISSION_CHALLENGES__) {
          const challenge = window.__CUSTOM_MISSION_CHALLENGES__[3];
          missionTitle = challenge.narrative || 'CUSTOM BOSS';
          qData = (challenge.instruction || '') + "\\n" + (challenge.question || '');
      } else {
          const qList = getQuestionsByTopic(window.currentGameTopic);
          qData = qList[3]; // Fourth question
      }

      const text = this.add.text(450, 350, missionTitle, { 
        fontSize: '28px', 
        fontFamily: 'Arial, sans-serif',
        color: '#ef4444',
        fontStyle: 'bold',
        wordWrap: { width: 800 },
        align: 'center'
      }).setOrigin(0.5).setDepth(10);

      // Terminal Question Box below the title
      const qBoxBg = this.add.rectangle(450, 480, 700, 100, 0x1e293b)
        .setStrokeStyle(2, 0x475569)
        .setDepth(10);

      const questionText = this.add.text(450, 480, 'Question: ' + qData, { 
        fontSize: '24px', 
        fontFamily: 'monospace', 
        color: '#f8fafc',
        align: 'center',
        wordWrap: { width: 660 }
      }).setOrigin(0.5).setDepth(10);

      window.currentAmongQuestion = qData;

      this.problemGroup.addMultiple([overlay, text, qBoxBg, questionText]);

      this.time.delayedCall(2500, () => {
        this.questionAnswered = false;
        this.scene.pause();
        window.dispatchEvent(new Event('openEditor'));
      });
    }

    winSequence() {
      if (auth.currentUser) {
        // Kat-Mage requires completing 4 logic segments to win, flat 500 XP
        updateGameStats(auth.currentUser.uid, 'kat-mage', 500, 4, 4); 
      }

      this.canMove = false;
      this.cat.play('idle', true);
      this.add.rectangle(450, 450, 900, 900, 0x000000, 0.85).setDepth(10);
      this.add.text(450, 300, 'YOU WIN!', { fontSize: '80px', color: '#fbbf24', fontStyle: 'bold' }).setOrigin(0.5).setDepth(10);

      const event = new CustomEvent('gameOver', {
        detail: {
            score: 500,
            accuracy: 100
        }
      });
      window.dispatchEvent(event);

      const restartBtn = this.add.text(450, 500, 'Restart Game', { fontSize: '48px', color: '#ffffff' }).setOrigin(0.5).setDepth(10);
      restartBtn.setInteractive({ useHandCursor: true });
      restartBtn.on('pointerdown', () => { this.scene.start('GameScene'); });
    }
  }
}