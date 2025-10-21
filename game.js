// game.js - Versión sin recursos externos (texturas generadas en runtime)
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 450,
  parent: 'game',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 700 },
      debug: false
    }
  },
  scene: { preload, create, update }
};

const game = new Phaser.Game(config);

let player;
let cursors;
let platforms;
let score = 0;
let scoreText;

function preload() {
  // Nada que cargar desde la red — generamos texturas en create()
}

function create() {
  // --- Fondo simple ---
  this.cameras.main.setBackgroundColor('#87CEEB'); // azul cielo

  // --- Generar texturas con Graphics (no dependen de la web) ---
  // Ground texture
  const g = this.add.graphics();
  g.fillStyle(0x8b5a2b, 1); // color marrón para suelo
  g.fillRect(0, 0, 200, 32);
  g.generateTexture('ground', 200, 32);
  g.clear();

  // Platform (otra tonalidad)
  g.fillStyle(0x9b6b3a, 1);
  g.fillRect(0, 0, 140, 20);
  g.generateTexture('platform', 140, 20);
  g.clear();

  // Player texture (un bloque con "cara")
  g.fillStyle(0xff0000, 1); // rojo cuerpo
  g.fillRect(0, 0, 28, 36);
  g.fillStyle(0xffffff, 1); // ojos
  g.fillRect(6, 8, 4, 4);
  g.fillRect(18, 8, 4, 4);
  g.generateTexture('player', 28, 36);
  g.clear();

  // --- Plataformas físicas ---
  platforms = this.physics.add.staticGroup();

  // Suelo ancho (centrado abajo)
  const suelo = platforms.create(400, 440, 'ground');
  suelo.setScale(4, 1).refreshBody(); // 200*4 = 800 ancho total

  // Plataformas flotantes
  platforms.create(600, 320, 'platform');
  platforms.create(50, 260, 'platform');
  platforms.create(750, 180, 'platform');
  platforms.create(350, 220, 'platform');

  // --- Jugador ---
  player = this.physics.add.sprite(100, 350, 'player');
  player.setBounce(0.1);
  player.setCollideWorldBounds(true);
  player.body.setSize(28, 36, false); // tamaño hitbox ajustado

  // Ajustes de control y físicas finas
  player.setDragX(600); // frena suavemente al soltar
  player.setMaxVelocity(300, 800);

  // Animaciones: como tenemos una sola textura, simulamos "frames" moviendo el sprite
  // (a futuro puedes reemplazar por spritesheet)
  // Por ahora no son necesarias las animaciones complejas.

  // Colisiones entre jugador y plataformas
  this.physics.add.collider(player, platforms);

  // --- Controles ---
  cursors = this.input.keyboard.createCursorKeys();

  // --- UI: puntaje (ejemplo) ---
  scoreText = this.add.text(16, 16, 'Puntos: 0', { fontSize: '20px', fill: '#000' }).setDepth(5);
}

function update() {
  // Movimiento horizontal
  if (cursors.left.isDown) {
    player.setAccelerationX(-1200);
    player.flipX = true;
  } else if (cursors.right.isDown) {
    player.setAccelerationX(1200);
    player.flipX = false;
  } else {
    player.setAccelerationX(0);
  }

  // Salto — solo si está apoyado
  const canJump = player.body.blocked.down || player.body.touching.down;
  if (cursors.up.isDown && canJump) {
    player.setVelocityY(-430);
  }

  // Ejemplo: sumar puntos si se mantiene en el aire (solo demo)
  // (esto es opcional y se puede remover)
  if (!canJump) {
    score += 0; // deja en 0 por ahora
  }
  scoreText.setText('Puntos: ' + score);
}

  if (cursors.up.isDown && player.body.touching.down) {
    player.setVelocityY(-400);
  }
}
