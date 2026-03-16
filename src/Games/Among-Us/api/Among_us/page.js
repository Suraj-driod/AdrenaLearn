'use client'

import { useEffect, useRef, useState } from 'react';

export default function Game2({ topic }) {

    const gameTwo = useRef(null);
    const gameInstanceRef = useRef(null);

    // Topic-based question sets for interactable objects
    const topicQuestionSets = {
        'variables': {
            candle: "Write a function that creates a variable 'x' with value 10 and returns it",
            towel: "Write a function that swaps two variables a and b and returns them as a tuple"
        },
        'data-types': {
            candle: "Write a function that returns the data type of the value 3.14 as a string",
            towel: "Write a function that checks if a value is a string (return True/False)"
        },
        'type-casting': {
            candle: "Write a function that converts the string '42' to an integer and returns it",
            towel: "Write a function that converts an integer to a float and returns it"
        },
        'user-input': {
            candle: "Write a function that returns the square of a number",
            towel: "Write a function that checks if a number is even (return True/False)"
        }
    };

    const currentTopic = topic || 'variables';
    const gameQuestions = topicQuestionSets[currentTopic] || topicQuestionSets['variables'];

    useEffect(() => {
        const openEditorHandler = () => {
            // Disable Phaser keyboard capture so Monaco can receive W,A,S,D,L
            if (gameInstanceRef.current?.input?.keyboard) {
                gameInstanceRef.current.input.keyboard.enabled = false;
            }
        };
        window.addEventListener('openEditor', openEditorHandler);
        return () => { window.removeEventListener('openEditor', openEditorHandler); };
    }, []);

    useEffect(() => {
        const editorClosedHandler = () => {
            // Re-enable Phaser keyboard when editor closes/submits
            if (gameInstanceRef.current?.input?.keyboard) {
                gameInstanceRef.current.input.keyboard.enabled = true;
            }
        };
        window.addEventListener('editorClosed', editorClosedHandler);
        return () => window.removeEventListener('editorClosed', editorClosedHandler);
    }, []);

    useEffect(() => {
        let gameTwoBegins = null;

        async function init() {

            const Phaser = await import('phaser');

            // ==========================================
            // START SCREEN SCENE
            // ==========================================
            class StartScene extends Phaser.Scene {
                constructor() {
                    super('StartScene');
                }

                preload() {
                    this.load.image('sceneOne', '/assets/among-us/room.png');
                    this.load.image('red_char', '/assets/among-us/red_char.png');
                }

                create() {
                    // Dark background
                    this.cameras.main.setBackgroundColor('#111118');

                    // Dim room image as backdrop
                    const bg = this.add.image(450, 450, 'sceneOne')
                        .setDisplaySize(900, 900)
                        .setAlpha(0.15);

                    // Title
                    const title = this.add.text(450, 140, 'AMONG US', {
                        fontSize: '80px',
                        color: '#ff3333',
                        fontFamily: 'Impact, sans-serif',
                        fontStyle: 'bold',
                        stroke: '#000000',
                        strokeThickness: 10,
                        shadow: { offsetX: 4, offsetY: 4, color: '#000', blur: 8, fill: true }
                    }).setOrigin(0.5);

                    // Subtitle
                    const subtitle = this.add.text(450, 220, 'CODE EDITION', {
                        fontSize: '32px',
                        color: '#ffcc00',
                        fontFamily: 'Arial, sans-serif',
                        fontStyle: 'bold',
                        stroke: '#000000',
                        strokeThickness: 4
                    }).setOrigin(0.5);

                    // Character display
                    const charImg = this.add.image(450, 440, 'red_char')
                        .setDisplaySize(200, 300);

                    // Floating animation on character
                    this.tweens.add({
                        targets: charImg,
                        y: 420,
                        duration: 1500,
                        yoyo: true,
                        repeat: -1,
                        ease: 'Sine.easeInOut'
                    });

                    // Instructions
                    this.add.text(450, 640, 'WASD to move  •  L to interact', {
                        fontSize: '20px',
                        color: '#aaaaaa',
                        fontFamily: 'Arial, sans-serif',
                        fontStyle: 'bold',
                        stroke: '#000000',
                        strokeThickness: 2
                    }).setOrigin(0.5);

                    this.add.text(450, 670, 'Find objects → Solve code challenges → Score points!', {
                        fontSize: '16px',
                        color: '#888888',
                        fontFamily: 'Arial, sans-serif',
                        stroke: '#000000',
                        strokeThickness: 2
                    }).setOrigin(0.5);

                    // Play button
                    const btnBg = this.add.rectangle(450, 760, 280, 70, 0xcc0000)
                        .setStrokeStyle(4, 0xff4444)
                        .setInteractive({ useHandCursor: true });

                    const btnText = this.add.text(450, 760, '▶  START GAME', {
                        fontSize: '32px',
                        color: '#ffffff',
                        fontFamily: 'Arial, sans-serif',
                        fontStyle: 'bold'
                    }).setOrigin(0.5);

                    // Button hover effects
                    btnBg.on('pointerover', () => {
                        btnBg.setFillStyle(0xff2222);
                        btnBg.setScale(1.05);
                        btnText.setScale(1.05);
                    });
                    btnBg.on('pointerout', () => {
                        btnBg.setFillStyle(0xcc0000);
                        btnBg.setScale(1);
                        btnText.setScale(1);
                    });
                    btnBg.on('pointerdown', () => {
                        this.cameras.main.fadeOut(500, 0, 0, 0);
                        this.time.delayedCall(500, () => {
                            this.scene.start('AmongSceneFirst');
                        });
                    });

                    // Pulsing "PLAY" button glow
                    this.tweens.add({
                        targets: btnBg,
                        alpha: 0.8,
                        duration: 800,
                        yoyo: true,
                        repeat: -1,
                        ease: 'Sine.easeInOut'
                    });

                    // Title float
                    this.tweens.add({
                        targets: title,
                        y: 145,
                        duration: 2000,
                        yoyo: true,
                        repeat: -1,
                        ease: 'Sine.easeInOut'
                    });

                    // Fade in
                    this.cameras.main.fadeIn(800, 0, 0, 0);
                }
            }

            // ==========================================
            // MAIN GAME SCENE
            // ==========================================
            class AmongSceneFirst extends Phaser.Scene {

                constructor() {
                    super('AmongSceneFirst')
                }

                preload() {
                    this.load.image('sceneOne', '/assets/among-us/room.png')
                    this.load.image('question', '/assets/among-us/question.png')


                    this.load.image('candle', '/assets/among-us/candle.png')
                    this.load.image('interact', '/assets/among-us/interact.png')
                    this.load.image('towel', '/assets/among-us/towel.png')
                    this.load.image('triviaScreen', '/assets/among-us/triviaScreen.png')
                    this.load.image('paper', '/assets/among-us/paper.png')
                    this.load.image('button', '/assets/among-us/button.png')
                    this.load.image('idle', '/assets/among-us/idle.png');
                    this.load.image('emergency', '/assets/among-us/emergency.png');
                    this.load.image('ejected', '/assets/among-us/ejected.jpg');

                    this.load.spritesheet(
                        'walking',
                        '/assets/among-us/walk.png',
                        { frameWidth: 178, frameHeight: 240 }
                    )
                }

                create() {
                    // Fade in from start screen
                    this.cameras.main.fadeIn(500, 0, 0, 0);

                    // --- Global Game State ---
                    this.controlsDisabled = false;
                    this.gameOver = false;
                    this.totalTime = 120; // 2 minutes in seconds
                    this.score = 0;
                    this.activeFloatingTexts = []; // Track floating texts for cleanup

                    // Track which objects have been answered
                    this.objectCompleted = {
                        candle: false,
                        towel: false

                    };

                    // Use topic-based questions
                    this.objectQuestions = gameQuestions;

                    // Track which object is currently being interacted with
                    this.currentInteractObject = null;
                    this.questionAnswered = false;


                    // Background Scene (room is 1024x1024, display at 900x900)
                    const sceneOne = this.add.image(450, 450, 'sceneOne')
                    sceneOne.setDisplaySize(900, 900)

                    // --- Timer Display ---
                    this.timerText = this.add.text(450, 40, '02:00', {
                        fontSize: '42px',
                        color: '#ffffff',
                        fontStyle: 'bold',
                        stroke: '#000000',
                        strokeThickness: 6
                    }).setOrigin(0.5).setDepth(500);

                    // Timer Event
                    this.time.addEvent({
                        delay: 1000,
                        repeat: 119,
                        callback: () => {
                            if (this.gameOver) return;
                            this.totalTime--;
                            let mins = Math.floor(this.totalTime / 60);
                            let secs = this.totalTime % 60;
                            this.timerText.setText(`${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`);

                            if (this.totalTime <= 0) this.triggerGameOver();
                        }
                    });

                    // --- Score Display (top-right) ---
                    this.scoreText = this.add.text(850, 40, 'Score: 0', {
                        fontSize: '32px',
                        color: '#fbbf24',
                        fontStyle: 'bold',
                        stroke: '#000000',
                        strokeThickness: 4
                    }).setOrigin(1, 0.5).setDepth(500);

                    // --- Static Props (positioned properly on the room) ---
                    // Towel on the upper-left wall below the red trim
                    this.towel = this.add.image(150, 115, 'towel').setDisplaySize(60, 80).setDepth(5);
                    // Candle near bottom center
                    this.candle = this.add.image(250, 600, 'candle').setDisplaySize(60, 80).setDepth(5);

                    // --- Animations ---


                    // Walk animation with correct frame range (13 frames: 0-12)
                    this.anims.create({
                        key: 'walk',
                        frames: this.anims.generateFrameNumbers('walking', { start: 0, end: 12 }),
                        frameRate: 12,
                        repeat: -1
                    })
                    // Player starts at center of room
                    this.player = this.add.sprite(450, 550, 'walking', 0)
                        .setDisplaySize(80, 108)
                        .setDepth(50);
                    this.keys = this.input.keyboard.addKeys('W,A,S,D,L')

                    // ==========================================
                    // NPC CREWMATES (walking around the room)
                    // ==========================================
                    this.npcs = [];
                    const npcConfigs = [
                        { x: 250, y: 400, tint: 0x3366ff, name: 'Blue', patrolMinX: 150, patrolMaxX: 400, patrolY: 400 },
                        { x: 650, y: 600, tint: 0x33cc33, name: 'Green', patrolMinX: 500, patrolMaxX: 780, patrolY: 600 },
                        { x: 350, y: 300, tint: 0xff66ff, name: 'Pink', patrolMinX: 200, patrolMaxX: 500, patrolY: 300 },
                    ];

                    npcConfigs.forEach((cfg) => {
                        const npc = this.add.sprite(cfg.x, cfg.y, 'walking', 0)
                            .setDisplaySize(70, 95)
                            .setDepth(45)
                            .setTint(cfg.tint);
                        npc.play('walk');
                        npc.npcConfig = cfg;
                        npc.patrolDir = 1; // 1 = right, -1 = left

                        this.npcs.push(npc);
                    });

                    // ==========================================
                    // INTERACT PROMPT (bottom-left, hidden by default)
                    // ==========================================
                    this.interactPrompt = this.add.image(80, 850, 'interact')
                        .setDisplaySize(120, 60)
                        .setDepth(400)
                        .setVisible(false);

                    // ==========================================
                    // QUESTION OVERLAY (question.png + python question + right arrow)
                    // ==========================================
                    this.questionUI = this.add.container(450, 450).setDepth(300).setVisible(false);

                    const questionBg = this.add.image(0, 0, 'question').setDisplaySize(900, 900);

                    this.questionLabel = this.add.text(0, -50, '', {
                        fontSize: '28px',
                        color: '#ffffff',
                        fontStyle: 'bold',
                        align: 'center',
                        wordWrap: { width: 600 },
                        stroke: '#000000',
                        strokeThickness: 4
                    }).setOrigin(0.5);

                    const rightArrowBtn = this.add.text(0, 100, '▶ OPEN EDITOR', {
                        fontSize: '36px',
                        color: '#00ff00',
                        backgroundColor: '#222222',
                        padding: { x: 20, y: 12 },
                        fontStyle: 'bold'
                    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

                    rightArrowBtn.on('pointerdown', () => {
                        this.questionUI.setVisible(false);
                        // Store the current question for the editor
                        window.currentAmongQuestion = this.objectQuestions[this.currentInteractObject];
                        window.dispatchEvent(new Event('openEditor'));
                    });

                    const closeQuestionBtn = this.add.text(380, -380, 'X', {
                        fontSize: '28px',
                        color: '#ffffff',
                        backgroundColor: '#cc0000',
                        padding: { x: 12, y: 8 }
                    }).setInteractive({ useHandCursor: true }).setOrigin(0.5);

                    closeQuestionBtn.on('pointerdown', () => {
                        this.questionUI.setVisible(false);
                        this.controlsDisabled = false;
                        this.currentInteractObject = null;
                    });

                    this.questionUI.add([questionBg, this.questionLabel, rightArrowBtn, closeQuestionBtn]);

                    // ==========================================
                    // ANSWER EVENT LISTENERS
                    // ==========================================
                    this.listenerController = new AbortController();
                    const { signal } = this.listenerController;

                    this.handleCorrect = () => {
                        if (!this.sys || !this.sys.isActive()) return;
                        if (this.questionAnswered) return;
                        this.questionAnswered = true;

                        // +5 points
                        this.score += 5;
                        this.scoreText.setText('Score: ' + this.score);

                        // Mark object as completed
                        if (this.currentInteractObject) {
                            this.objectCompleted[this.currentInteractObject] = true;
                        }

                        // Show success feedback — destroy properly
                        const successText = this.add.text(450, 450, '+5 CORRECT!', {
                            fontSize: '64px', color: '#00ff00', fontStyle: 'bold',
                            stroke: '#000000', strokeThickness: 6
                        }).setOrigin(0.5).setDepth(600);
                        this.activeFloatingTexts.push(successText);

                        this.tweens.add({
                            targets: successText,
                            y: 350, alpha: 0,
                            duration: 1500,
                            onComplete: () => {
                                successText.destroy();
                                this.activeFloatingTexts = this.activeFloatingTexts.filter(t => t !== successText);
                                this.controlsDisabled = false;
                                this.currentInteractObject = null;
                                this.questionAnswered = false;
                            }
                        });
                    };

                    this.handleWrong = () => {
                        if (!this.sys || !this.sys.isActive()) return;
                        if (this.questionAnswered) return;
                        this.questionAnswered = true;

                        // 0 points (no change)
                        // Mark object as completed so they can't retry
                        if (this.currentInteractObject) {
                            this.objectCompleted[this.currentInteractObject] = true;
                        }

                        const failText = this.add.text(450, 450, '+0 WRONG!', {
                            fontSize: '64px', color: '#ff4444', fontStyle: 'bold',
                            stroke: '#000000', strokeThickness: 6
                        }).setOrigin(0.5).setDepth(600);
                        this.activeFloatingTexts.push(failText);

                        this.tweens.add({
                            targets: failText,
                            y: 350, alpha: 0,
                            duration: 1500,
                            onComplete: () => {
                                failText.destroy();
                                this.activeFloatingTexts = this.activeFloatingTexts.filter(t => t !== failText);
                                this.controlsDisabled = false;
                                this.currentInteractObject = null;
                                this.questionAnswered = false;
                            }
                        });
                    };

                    window.addEventListener('correctAnswer', this.handleCorrect, { signal });
                    window.addEventListener('wrongAnswer', this.handleWrong, { signal });

                    const cleanupListeners = () => {
                        this.listenerController.abort();
                        // Clean up any remaining floating texts
                        this.activeFloatingTexts.forEach(t => { if (t && t.active) t.destroy(); });
                        this.activeFloatingTexts = [];
                    };

                    this.events.on("shutdown", cleanupListeners);
                    this.events.on("destroy", cleanupListeners);

                    // ==========================================
                    // EMERGENCY & IMPROVED VOTING
                    // ==========================================
                    this.emergencyUI = this.add.container(450, 450).setDepth(200).setVisible(false);

                    const imgEmergency = this.add.image(0, 0, 'emergency').setDisplaySize(900, 900).setVisible(false);
                    const imgQuestion = this.add.image(0, 0, 'question').setDisplaySize(900, 900).setVisible(false);
                    const imgEjected = this.add.image(0, 0, 'ejected').setDisplaySize(900, 900).setVisible(false);

                    const questionText = this.add.text(0, -150, 'Who is the Impostor?', { fontSize: '48px', color: '#ffffff', fontStyle: 'bold' }).setOrigin(0.5).setVisible(false);
                    const rightArrow = this.add.text(0, 180, '▶ PROCEED TO VOTE', { fontSize: '32px', color: '#00ff00', backgroundColor: '#222222', padding: { x: 20, y: 10 } })
                        .setOrigin(0.5).setInteractive({ useHandCursor: true }).setVisible(false);

                    const ejectedText = this.add.text(0, 0, '', { fontSize: '36px', color: '#ffffff' }).setOrigin(0.5).setVisible(false);
                    // --- Improved Vote Options with proper selection/deselection ---
                    const optionsContainer = this.add.container(0, 0).setVisible(false);
                    const names = ["Red", "Blue", "Green"];
                    const optionCards = []; // store references for deselection

                    names.forEach((name, index) => {
                        const xOffset = (index - 1) * 220;

                        const optBg = this.add.rectangle(xOffset, 0, 180, 240, 0x222222)
                            .setInteractive({ useHandCursor: true })
                            .setStrokeStyle(4, 0x444444);
                        const optSprite = this.add.sprite(xOffset, -20, 'walking', 0)
                            .setDisplaySize(60, 81);
                        // Tint each option differently
                        if (name === 'Blue') optSprite.setTint(0x3366ff);
                        if (name === 'Green') optSprite.setTint(0x33cc33);
                        const optName = this.add.text(xOffset, 70, name, { fontSize: '28px', color: '#ffffff', fontStyle: 'bold' }).setOrigin(0.5);

                        const card = { bg: optBg, sprite: optSprite, label: optName, name: name };
                        optionCards.push(card);

                        // Hover Glow
                        optBg.on('pointerover', () => {
                            if (this.selectedVoteOption !== name) {
                                optBg.setStrokeStyle(6, 0xffff00);
                            }
                        });
                        optBg.on('pointerout', () => {
                            if (this.selectedVoteOption !== name) {
                                optBg.setStrokeStyle(4, 0x444444);
                            }
                        });

                        optBg.on('pointerdown', () => {
                            // Deselect all first
                            optionCards.forEach(c => {
                                c.bg.setStrokeStyle(4, 0x444444);
                                c.bg.setFillStyle(0x222222);
                            });

                            // Select this one
                            this.selectedVoteOption = name;
                            optBg.setStrokeStyle(6, 0x00ff00);
                            optBg.setFillStyle(0x004400);

                            // Confirm after a short delay
                            this.time.delayedCall(800, () => {
                                if (this.selectedVoteOption === name) {
                                    triggerEjectedPhase(name);
                                }
                            });
                        });

                        optionsContainer.add([optBg, optSprite, optName]);
                    });

                    this.emergencyUI.add([imgEmergency, imgQuestion, imgEjected, questionText, rightArrow, optionsContainer, ejectedText]);

                    rightArrow.on('pointerdown', () => {
                        questionText.setVisible(false);
                        rightArrow.setVisible(false);
                        this.selectedVoteOption = null;
                        // Reset all card visuals
                        optionCards.forEach(c => {
                            c.bg.setStrokeStyle(4, 0x444444);
                            c.bg.setFillStyle(0x222222);
                        });
                        optionsContainer.setVisible(true);
                    });

                    const triggerEjectedPhase = (chosenName) => {
                        optionsContainer.setVisible(false);
                        imgQuestion.setVisible(false);
                        imgEjected.setVisible(true);
                        ejectedText.setVisible(true).setText("");
                        this.selectedVoteOption = null;

                        const msg = `${chosenName || 'Someone'} was not the impostor...`;
                        let charIndex = 0;
                        this.time.addEvent({
                            delay: 100,
                            repeat: msg.length - 1,
                            callback: () => {
                                ejectedText.setText(ejectedText.text + msg[charIndex]);
                                charIndex++;
                            }
                        });

                        this.time.delayedCall((msg.length * 100) + 2000, () => {
                            // Clean up: hide everything and reset text
                            this.emergencyUI.setVisible(false);
                            imgEmergency.setVisible(false);
                            imgQuestion.setVisible(false);
                            imgEjected.setVisible(false);
                            questionText.setVisible(false);
                            rightArrow.setVisible(false);
                            optionsContainer.setVisible(false);
                            ejectedText.setVisible(false).setText('');
                            this.controlsDisabled = false;
                        });
                    };

                    // Timer Loop for Emergency
                    this.time.addEvent({
                        delay: 30000,
                        repeat: 3,
                        callback: () => {
                            if (this.gameOver) return;
                            this.triviaUI.setVisible(false);
                            this.questionUI.setVisible(false);
                            this.controlsDisabled = true;
                            this.player.anims.stop();
                            this.selectedVoteOption = null;

                            // Reset all sub-elements before showing
                            imgEmergency.setVisible(false);
                            imgQuestion.setVisible(false);
                            imgEjected.setVisible(false);
                            questionText.setVisible(false);
                            rightArrow.setVisible(false);
                            optionsContainer.setVisible(false);
                            ejectedText.setVisible(false).setText('');
                            optionCards.forEach(c => {
                                c.bg.setStrokeStyle(4, 0x444444);
                                c.bg.setFillStyle(0x222222);
                            });

                            this.emergencyUI.setVisible(true);
                            imgEmergency.setVisible(true);

                            this.time.delayedCall(2000, () => {
                                imgEmergency.setVisible(false);
                                imgQuestion.setVisible(true);
                                questionText.setVisible(true);
                                rightArrow.setVisible(true);
                            });
                        }
                    });

                    // ==========================================
                    // TRIVIA UI (kept from original)
                    // ==========================================
                    this.triviaUI = this.add.container(450, 450).setDepth(100).setVisible(false);
                    const triviaBg = this.add.image(0, 0, 'triviaScreen').setDisplaySize(800, 600);
                    const paper = this.add.image(0, 40, 'paper').setDisplaySize(380, 350);
                    this.triviaText = this.add.text(0, 40, '', {
                        fontSize: '22px', color: '#000000', align: 'center', fontStyle: 'bold', wordWrap: { width: 300 }
                    }).setOrigin(0.5);

                    const closeBtn = this.add.text(350, -250, 'X', {
                        fontSize: '28px', color: '#ffffff', backgroundColor: '#cc0000', padding: { x: 12, y: 8 }
                    }).setInteractive({ useHandCursor: true }).setOrigin(0.5);

                    closeBtn.on('pointerdown', () => {
                        this.triviaUI.setVisible(false);
                        this.controlsDisabled = false;
                    });

                    this.triviaUI.add([triviaBg, paper, this.triviaText, closeBtn]);

                    // --- Wall-mounted posters (proximity-based, L key to interact) ---
                    const wallPosters = [
                        { x: 60, y: 170, angle: -20, trivia: "Variables are containers for data." },
                        { x: 305, y: 60, angle: 0, trivia: "Const values cannot be changed." },
                        { x: 600, y: 60, angle: 0, trivia: "Variable names should be descriptive." },
                        { x: 800, y: 155, angle: 45, trivia: "Modern JS uses let and const." }
                    ];

                    // Store poster game objects for proximity detection
                    this.posterObjects = [];

                    wallPosters.forEach((poster, index) => {
                        const shadow = this.add.image(poster.x + 3, poster.y + 4, 'button')
                            .setDisplaySize(55, 68)
                            .setAngle(poster.angle)
                            .setTint(0x000000)
                            .setAlpha(0.35)
                            .setDepth(9);

                        const btn = this.add.image(poster.x, poster.y, 'button')
                            .setDisplaySize(55, 68)
                            .setAngle(poster.angle)
                            .setDepth(10);

                        const rad = Phaser.Math.DegToRad(poster.angle);
                        const pin = this.add.circle(
                            poster.x + Math.sin(-rad) * -28,
                            poster.y + Math.cos(-rad) * -28,
                            4, 0xcc3333
                        ).setDepth(11);

                        // Store reference for proximity checks
                        this.posterObjects.push({
                            key: 'poster_' + index,
                            obj: btn,
                            trivia: poster.trivia
                        });
                    });
                }

                // ==========================================
                // PROXIMITY CHECK HELPER
                // ==========================================
                getNearbyObject() {
                    const interactables = [
                        { key: 'candle', obj: this.candle, type: 'question' },
                        { key: 'towel', obj: this.towel, type: 'question' }
                    ];

                    // Add wall posters as interactables
                    if (this.posterObjects) {
                        this.posterObjects.forEach(p => {
                            interactables.push({ key: p.key, obj: p.obj, type: 'poster', trivia: p.trivia });
                        });
                    }

                    const INTERACT_DISTANCE = 120;

                    for (const item of interactables) {
                        if (this.objectCompleted[item.key]) continue;
                        const dx = this.player.x - item.obj.x;
                        const dy = this.player.y - item.obj.y;
                        const dist = Math.sqrt(dx * dx + dy * dy);
                        if (dist < INTERACT_DISTANCE) {
                            return item;
                        }
                    }
                    return null;
                }

                triggerGameOver() {
                    this.gameOver = true;
                    this.controlsDisabled = true;
                    this.player.anims.stop();
                    this.player.setFrame(0);
                    this.triviaUI.setVisible(false);

                    this.questionUI.setVisible(false);
                    this.interactPrompt.setVisible(false);

                    // Destroy any floating texts
                    this.activeFloatingTexts.forEach(t => { if (t && t.active) t.destroy(); });
                    this.activeFloatingTexts = [];

                    // Stop NPC animations
                    this.npcs.forEach(npc => npc.anims.stop());

                    // Flash Game Over Text
                    const gameOverText = this.add.text(450, 350, 'GAME OVER', {
                        fontSize: '100px',
                        color: '#ff0000',
                        fontStyle: 'bold',
                        stroke: '#ffffff',
                        strokeThickness: 10
                    }).setOrigin(0.5).setDepth(1000);

                    const finalScoreText = this.add.text(450, 500, 'Final Score: ' + this.score, {
                        fontSize: '48px',
                        color: '#fbbf24',
                        fontStyle: 'bold',
                        stroke: '#000000',
                        strokeThickness: 6
                    }).setOrigin(0.5).setDepth(1000);

                    this.time.addEvent({
                        delay: 500,
                        repeat: -1,
                        callback: () => {
                            gameOverText.setVisible(!gameOverText.visible);
                        }
                    });
                }

                update() {
                    // ==========================================
                    // NPC PATROL (always runs even when controls disabled)
                    // ==========================================
                    if (!this.gameOver && this.npcs) {
                        this.npcs.forEach(npc => {
                            const cfg = npc.npcConfig;
                            const npcSpeed = 1.5;

                            npc.x += npcSpeed * npc.patrolDir;

                            // Reverse direction at patrol bounds
                            if (npc.x >= cfg.patrolMaxX) {
                                npc.patrolDir = -1;
                                npc.setFlipX(true);
                            } else if (npc.x <= cfg.patrolMinX) {
                                npc.patrolDir = 1;
                                npc.setFlipX(false);
                            }
                        });
                    }

                    if (this.controlsDisabled || this.gameOver) return;

                    const speed = 4
                    let isMoving = false

                    // Movement with boundary clamping (keep player inside the room)
                    if (this.keys.W.isDown) { this.player.y -= speed; isMoving = true; }
                    if (this.keys.S.isDown) { this.player.y += speed; isMoving = true; }
                    if (this.keys.A.isDown) { this.player.x -= speed; this.player.setFlipX(true); isMoving = true; }
                    if (this.keys.D.isDown) { this.player.x += speed; this.player.setFlipX(false); isMoving = true; }

                    // Clamp player to room boundaries
                    this.player.x = Phaser.Math.Clamp(this.player.x, 50, 850);
                    this.player.y = Phaser.Math.Clamp(this.player.y, 120, 860);

                    if (isMoving) {
                        if (!this.player.anims.isPlaying) this.player.play('walk');
                    } else {
                        this.player.anims.stop();
                        this.player.setFrame(0);
                    }

                    // ==========================================
                    // PROXIMITY INTERACTION SYSTEM
                    // ==========================================
                    const nearbyItem = this.getNearbyObject();

                    if (nearbyItem) {
                        // Show interact prompt in bottom-left
                        this.interactPrompt.setVisible(true);

                        // L key pressed → interact
                        if (Phaser.Input.Keyboard.JustDown(this.keys.L)) {
                            this.controlsDisabled = true;
                            this.player.anims.stop();
                            this.player.setFrame(0);
                            this.interactPrompt.setVisible(false);

                            if (nearbyItem.type === 'poster') {
                                // Wall poster → show trivia UI
                                this.triviaText.setText(nearbyItem.trivia);
                                this.triviaUI.setVisible(true);
                            } else {
                                // Code challenge object → show question overlay
                                this.currentInteractObject = nearbyItem.key;
                                this.questionAnswered = false;
                                this.questionLabel.setText(this.objectQuestions[nearbyItem.key]);
                                this.questionUI.setVisible(true);
                            }
                        }
                    } else {
                        this.interactPrompt.setVisible(false);
                    }
                }
            }

            const config = {
        type: Phaser.AUTO,
        width: 900,
        height: 900,
        parent: gameTwo.current,
        scene: [StartScene, AmongSceneFirst],
        backgroundColor: '#111118',
        scale: {
            mode: Phaser.Scale.FIT,
            autoCenter: Phaser.Scale.CENTER_BOTH,
        }
    }

    // Clear any leftover canvas from previous render (React StrictMode)
    if (gameTwo.current) gameTwo.current.innerHTML = '';

    gameTwoBegins = new Phaser.Game(config)
    gameInstanceRef.current = gameTwoBegins;
}

init()

return () => {
    if (gameTwoBegins) gameTwoBegins.destroy(true)
    if (gameTwo.current) gameTwo.current.innerHTML = '';
    gameInstanceRef.current = null;
}

    }, [])

return (
    <div ref={gameTwo} className='h-full w-full'></div>
)
}