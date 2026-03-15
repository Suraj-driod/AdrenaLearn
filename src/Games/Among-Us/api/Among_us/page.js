'use client'

import { useEffect, useRef, useState } from 'react';
import CodeEditor from "@/Games/Among-Us/editor/monaco.jsx";
import handleCodeSubmit from "@/Games/Among-Us/actualBackend/submitToBackend.js";

export default function Game2() {

    const gameTwo = useRef(null);
    const [showEditor, setShowEditor] = useState(false);
    const [editorKey, setEditorKey] = useState(0);

    async function handleSubmitWrapper(code) {
        // STRICT EMPTY CHECK
        if (!code || typeof code !== 'string' || code.trim() === "") {
            setShowEditor(false);
            window.dispatchEvent(new Event('wrongAnswer'));
            return;
        }

        setShowEditor(false);

        const isCorrect = await handleCodeSubmit(code);

        if (isCorrect === true) {
            window.dispatchEvent(new Event('correctAnswer'));
        } else {
            window.dispatchEvent(new Event('wrongAnswer'));
        }
    }

    useEffect(() => {
        const openEditorHandler = () => {
            window.editorValue = undefined;
            setEditorKey(prev => prev + 1);
            setShowEditor(true);
        };
        window.addEventListener('openEditor', openEditorHandler);
        return () => { window.removeEventListener('openEditor', openEditorHandler); };
    }, []);

    useEffect(() => {
        let gameTwoBegins = null;

        async function init() {

            const Phaser = await import('phaser');

            class AmongSceneFirst extends Phaser.Scene {

                constructor() {
                    super('AmongSceneFirst')
                }

                preload() {
                    this.load.image('sceneOne', '/assets/among-us/room.png')
                    this.load.image('question', '/assets/among-us/question.png')
                    this.load.image('emergency', '/assets/among-us/emergency.png')
                    this.load.image('ejected', '/assets/among-us/ejected.jpg')
                    this.load.image('candle', '/assets/among-us/candle.png')
                    this.load.image('interact', '/assets/among-us/interact.png')
                    this.load.image('towel', '/assets/among-us/towel.png')
                    this.load.image('triviaScreen', '/assets/among-us/triviaScreen.png')
                    this.load.image('paper', '/assets/among-us/paper.png')
                    this.load.image('button', '/assets/among-us/button.png')

                    this.load.spritesheet('dvd', '/assets/among-us/dvd.png', { frameWidth: 128, frameHeight: 230 })
                    this.load.spritesheet('mini', '/assets/among-us/mini.png', { frameWidth: 80, frameHeight: 110 })

                    this.load.spritesheet(
                        'walking',
                        '/assets/among-us/walk.png',
                        { frameWidth: 155, frameHeight: 230 }
                    )
                }

                create() {
                    // --- Global Game State ---
                    this.controlsDisabled = false;
                    this.gameOver = false;
                    this.totalTime = 120; // 2 minutes in seconds
                    this.score = 0;

                    // Track which objects have been answered
                    this.objectCompleted = {
                        candle: false,
                        towel: false,
                        mini: false,
                        dvd: false
                    };

                    // The Python questions for each interactable
                    this.objectQuestions = {
                        candle: "Write a function that returns the square of a number",
                        towel: "Write a function that checks if a number is even (return True/False)",
                        mini: "Write a function that returns the factorial of a number",
                        dvd: "Write a function that reverses a string"
                    };

                    // Track which object is currently being interacted with
                    this.currentInteractObject = null;
                    this.questionAnswered = false;

                    // Background Scene
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

                    // --- Static Props ---
                    this.towel = this.add.image(150, 150, 'towel').setDisplaySize(150, 150)
                    this.candle = this.add.image(450, 800, 'candle')

                    // --- Animations ---
                    this.anims.create({
                        key: 'mini_anim',
                        frames: this.anims.generateFrameNumbers('mini'),
                        frameRate: 10,
                        repeat: -1
                    })
                    this.miniCharacter = this.add.sprite(800, 150, 'mini').play('mini_anim')

                    this.anims.create({
                        key: 'dvd_anim',
                        frames: this.anims.generateFrameNumbers('dvd'),
                        frameRate: 10,
                        repeat: -1
                    })
                    this.dvdLogo = this.add.sprite(450, 80, 'dvd').play('dvd_anim')

                    this.anims.create({
                        key: 'walk',
                        frames: this.anims.generateFrameNumbers('walking', { start: 1, end: 11 }),
                        frameRate: 12,
                        repeat: -1
                    })
                    this.player = this.add.sprite(450, 450, 'walking', 0)
                    this.keys = this.input.keyboard.addKeys('W,A,S,D,L')

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
                        if (this.questionAnswered) return;
                        this.questionAnswered = true;

                        // +5 points
                        this.score += 5;
                        this.scoreText.setText('Score: ' + this.score);

                        // Mark object as completed
                        if (this.currentInteractObject) {
                            this.objectCompleted[this.currentInteractObject] = true;
                        }

                        // Show success feedback
                        const successText = this.add.text(450, 450, '+5 CORRECT!', {
                            fontSize: '64px', color: '#00ff00', fontStyle: 'bold',
                            stroke: '#000000', strokeThickness: 6
                        }).setOrigin(0.5).setDepth(600);

                        this.tweens.add({
                            targets: successText,
                            y: 350, alpha: 0,
                            duration: 1500,
                            onComplete: () => {
                                successText.destroy();
                                this.controlsDisabled = false;
                                this.currentInteractObject = null;
                            }
                        });
                    };

                    this.handleWrong = () => {
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

                        this.tweens.add({
                            targets: failText,
                            y: 350, alpha: 0,
                            duration: 1500,
                            onComplete: () => {
                                failText.destroy();
                                this.controlsDisabled = false;
                                this.currentInteractObject = null;
                            }
                        });
                    };

                    window.addEventListener('correctAnswer', this.handleCorrect, { signal });
                    window.addEventListener('wrongAnswer', this.handleWrong, { signal });

                    this.events.on("shutdown", () => { this.listenerController.abort(); });


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

                    // --- Wall-mounted poster buttons (on the wall spots circled by user) ---
                    // Positions match the 4 red-circled wall spots: left wall, top-left, top-right, right wall
                    const wallPosters = [
                        { x: 60, y: 170, angle: -20, trivia: "Variables are containers for data." },     // left wall, near towel
                        { x: 305, y: 70, angle: 0, trivia: "Const values cannot be changed." },        // top wall, left of center
                        { x: 510, y: 100, angle: -3, trivia: "Variable names should be descriptive." },  // top wall, right of center
                        { x: 840, y: 155, angle: 5, trivia: "Modern JS uses let and const." }           // right wall, upper area
                    ];

                    wallPosters.forEach((poster) => {
                        // Shadow for wall-pinned depth effect
                        const shadow = this.add.image(poster.x + 3, poster.y + 4, 'button')
                            .setDisplaySize(55, 68)
                            .setAngle(poster.angle)
                            .setTint(0x000000)
                            .setAlpha(0.35)
                            .setDepth(9);

                        // The actual poster button
                        const btn = this.add.image(poster.x, poster.y, 'button')
                            .setDisplaySize(55, 68)
                            .setAngle(poster.angle)
                            .setInteractive({ useHandCursor: true })
                            .setDepth(10);

                        // Small red pin/tack at the top of the poster
                        const rad = Phaser.Math.DegToRad(poster.angle);
                        const pin = this.add.circle(
                            poster.x + Math.sin(-rad) * -28,
                            poster.y + Math.cos(-rad) * -28,
                            4, 0xcc3333
                        ).setDepth(11);

                        // Subtle hover effect
                        btn.on('pointerover', () => {
                            btn.setScale(1.15);
                            shadow.setScale(1.15);
                        });
                        btn.on('pointerout', () => {
                            btn.setScale(1);
                            shadow.setScale(1);
                        });

                        btn.on('pointerdown', () => {
                            if (this.controlsDisabled || this.gameOver) return;
                            this.triviaText.setText(poster.trivia);
                            this.triviaUI.setVisible(true);
                            this.controlsDisabled = true;
                            this.player.anims.stop();
                            this.player.setFrame(0);
                        });
                    });

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

                    // --- Improved Options ---
                    const optionsContainer = this.add.container(0, 0).setVisible(false);
                    const names = ["Red", "Blue", "Green"];

                    names.forEach((name, index) => {
                        const xOffset = (index - 1) * 220;

                        // Card Design
                        const optBg = this.add.rectangle(xOffset, 0, 180, 240, 0x222222).setInteractive({ useHandCursor: true }).setStrokeStyle(4, 0x444444);
                        const optSprite = this.add.sprite(xOffset, -20, 'mini', 0).setScale(1.2);
                        const optName = this.add.text(xOffset, 70, name, { fontSize: '28px', color: '#ffffff', fontStyle: 'bold' }).setOrigin(0.5);

                        // Hover Glow
                        optBg.on('pointerover', () => { optBg.setStrokeStyle(6, 0xffff00); });
                        optBg.on('pointerout', () => { optBg.setStrokeStyle(4, 0x444444); });

                        optBg.on('pointerdown', () => {
                            this.tweens.add({
                                targets: optBg,
                                fillAlpha: 0.5,
                                duration: 100,
                                yoyo: true,
                                onStart: () => { optBg.fillColor = 0x00ff00; },
                                onComplete: () => {
                                    this.time.delayedCall(500, () => triggerEjectedPhase());
                                }
                            });
                        });
                        optionsContainer.add([optBg, optSprite, optName]);
                    });

                    this.emergencyUI.add([imgEmergency, imgQuestion, imgEjected, questionText, rightArrow, optionsContainer, ejectedText]);

                    rightArrow.on('pointerdown', () => {
                        questionText.setVisible(false);
                        rightArrow.setVisible(false);
                        optionsContainer.setVisible(true);
                    });

                    const triggerEjectedPhase = () => {
                        optionsContainer.setVisible(false);
                        imgQuestion.setVisible(false);
                        imgEjected.setVisible(true);
                        ejectedText.setVisible(true).setText("");

                        const msg = "You chose the wrong crewmate...";
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
                            this.emergencyUI.setVisible(false);
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
                            this.emergencyUI.setVisible(true);
                            imgEmergency.setVisible(true);
                            imgQuestion.setVisible(false);
                            imgEjected.setVisible(false);

                            this.time.delayedCall(2000, () => {
                                imgEmergency.setVisible(false);
                                imgQuestion.setVisible(true);
                                questionText.setVisible(true);
                                rightArrow.setVisible(true);
                            });
                        }
                    });
                }

                // ==========================================
                // PROXIMITY CHECK HELPER
                // ==========================================
                getNearbyObject() {
                    const interactables = [
                        { key: 'candle', obj: this.candle },
                        { key: 'towel', obj: this.towel },
                        { key: 'mini', obj: this.miniCharacter },
                        { key: 'dvd', obj: this.dvdLogo }
                    ];

                    const INTERACT_DISTANCE = 120;

                    for (const item of interactables) {
                        if (this.objectCompleted[item.key]) continue;
                        const dx = this.player.x - item.obj.x;
                        const dy = this.player.y - item.obj.y;
                        const dist = Math.sqrt(dx * dx + dy * dy);
                        if (dist < INTERACT_DISTANCE) {
                            return item.key;
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
                    this.emergencyUI.setVisible(false);
                    this.questionUI.setVisible(false);
                    this.interactPrompt.setVisible(false);

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
                    if (this.controlsDisabled || this.gameOver) return;

                    const speed = 4
                    let isMoving = false

                    if (this.keys.W.isDown) { this.player.y -= speed; isMoving = true; }
                    if (this.keys.S.isDown) { this.player.y += speed; isMoving = true; }
                    if (this.keys.A.isDown) { this.player.x -= speed; this.player.setFlipX(true); isMoving = true; }
                    if (this.keys.D.isDown) { this.player.x += speed; this.player.setFlipX(false); isMoving = true; }

                    if (isMoving) {
                        if (!this.player.anims.isPlaying) this.player.play('walk');
                    } else {
                        this.player.anims.stop();
                        this.player.setFrame(0);
                    }

                    // ==========================================
                    // PROXIMITY INTERACTION SYSTEM
                    // ==========================================
                    const nearbyKey = this.getNearbyObject();

                    if (nearbyKey) {
                        // Show interact prompt in bottom-left
                        this.interactPrompt.setVisible(true);

                        // L key pressed → open question overlay
                        if (Phaser.Input.Keyboard.JustDown(this.keys.L)) {
                            this.currentInteractObject = nearbyKey;
                            this.questionAnswered = false;
                            this.controlsDisabled = true;
                            this.player.anims.stop();
                            this.player.setFrame(0);
                            this.interactPrompt.setVisible(false);

                            // Show question.png overlay with the Python question
                            this.questionLabel.setText(this.objectQuestions[nearbyKey]);
                            this.questionUI.setVisible(true);
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
                scene: AmongSceneFirst
            }

            // Clear any leftover canvas from previous render (React StrictMode)
            if (gameTwo.current) gameTwo.current.innerHTML = '';

            gameTwoBegins = new Phaser.Game(config)
        }

        init()

        return () => {
            if (gameTwoBegins) gameTwoBegins.destroy(true)
            if (gameTwo.current) gameTwo.current.innerHTML = '';
        }

    }, [])

    return (
        <div className='flex'>
            <div ref={gameTwo} className='h-full w-full'></div>
            {showEditor && <CodeEditor key={editorKey} onSubmit={handleSubmitWrapper} />}
        </div>
    )
}