// === FASE 1: Movimiento automático y fondo animado ===
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

let player, cursors, platforms, camera, score = 0, scoreText, bg1, bg2;
let scrollSpeed = 2; // velocidad del scroll del escenario

function preload() {
  // Nada externo: generamos todo en código
}

function create() {
  // Fondo (dos capas para simular scroll infinito)
  bg1 = this.add.rectangle(0, 0, 800, 450, 0x6ec6ff).setOrigin(0); // cielo
  bg2 = this.add.rectangle(0, 400, 800, 50, 0x228b22).setOrigin(0); // piso verde decorativo

  // Plataformas
  const g = this.add.graphics();
  g.fillStyle(0x8b5a2b, 1);
  g.fillRect(0, 0, 200, 32);
  g.generateTexture('ground', 200, 32);
  g.clear();

  g.fillStyle(0x9b6b3a, 1);
  g.fillRect(0, 0, 140, 20);
  g.generateTexture('platform', 140, 20);
  g.clear();

  g.fillStyle(0xff0000, 1);
  g.fillRect(0, 0, 28, 36);
  g.fillStyle(0xffffff, 1);
  g.fillRect(6, 8, 4, 4);
  g.fillRect(18, 8, 4, 4);
  g.generateTexture('player', 28, 36);
  g.clear();

  platforms = this.physics.add.staticGroup();
  for (let i = 0; i < 20; i++) {
    const x = i * 200;
    const y = 440;
    const ground = platforms.create(x, y, 'ground');
    ground.setOrigin(0);
  }

  player = this.physics.add.sprite(100, 350, 'player');
  player.setBounce(0.1);
  player.setCollideWorldBounds(false); // no colisiona con bordes
  player.setDepth(10);

  this.physics.add.collider(player, platforms);

  cursors = this.input.keyboard.createCursorKeys();
  scoreText = this.add.text(16, 16, 'Puntos: 0', { fontSize: '20px', fill: '#000' });

  // Cámara para seguir al jugador
  camera = this.cameras.main;
  camera.startFollow(player, true, 0.05, 0.05);
  camera.setBounds(0, 0, 999999, 450);
}

function update() {
  // Mover el jugador automáticamente hacia adelante
  player.setVelocityX(160);

  // Control manual solo para saltar
  const canJump = player.body.blocked.down;
  if (cursors.up.isDown && canJump) {
    player.setVelocityY(-450);
  }

  // Scroll infinito del fondo y plataformas
  bg1.x -= scrollSpeed * 0.5;
  bg2.x -= scrollSpeed;

  if (bg1.x <= -800) bg1.x = 0;
  if (bg2.x <= -800) bg2.x = 0;

  platforms.children.iterate((p) => {
    p.x -= scrollSpeed;
    if (p.x + p.width < camera.scrollX - 100) {
      // reciclar plataforma delante
      p.x += 4000;
    }
  });

  // Verificar si el jugador cayó (muere)
  if (player.y > 500) {
    this.scene.restart(); // reinicia juego
  }
}
