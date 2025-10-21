// === Mini Mario Bros - Etapa 1 Corregida y optimizada ===

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 450,
  parent: 'game',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 800 },
      debug: false
    }
  },
  scene: { preload, create, update }
};

let player, cursors, platforms, camera;
let bgSky1, bgSky2, bgGround1, bgGround2;
let scrollSpeed = 2;
let platformWidth = 200;

const game = new Phaser.Game(config);

function preload() {
  // Generar gráficos en textura
  const g = this.add.graphics();

  // Fondo cielo
  g.fillStyle(0x6ec6ff, 1);
  g.fillRect(0, 0, 800, 450);
  g.generateTexture('sky', 800, 450);
  g.clear();

  // Piso decorativo
  g.fillStyle(0x228b22, 1);
  g.fillRect(0, 0, 800, 50);
  g.generateTexture('ground-deco', 800, 50);
  g.clear();

  // Plataforma marrón
  g.fillStyle(0x8b5a2b, 1);
  g.fillRect(0, 0, platformWidth, 32);
  g.generateTexture('ground', platformWidth, 32);
  g.clear();

  // Jugador rojo
  g.fillStyle(0xff0000, 1);
  g.fillRect(0, 0, 28, 36);
  g.fillStyle(0xffffff, 1);
  g.fillRect(6, 8, 4, 4);
  g.fillRect(18, 8, 4, 4);
  g.generateTexture('player', 28, 36);
  g.clear();
}

function create() {
  // Fondos infinitos
  bgSky1 = this.add.image(0, 0, 'sky').setOrigin(0);
  bgSky2 = this.add.image(800, 0, 'sky').setOrigin(0);
  bgGround1 = this.add.image(0, 400, 'ground-deco').setOrigin(0);
  bgGround2 = this.add.image(800, 400, 'ground-deco').setOrigin(0);

  // Crear plataformas
  platforms = this.physics.add.staticGroup();
  for (let i = 0; i < 20; i++) {
    let x = i * platformWidth;
    let y = 430;
    let ground = platforms.create(x, y, 'ground').setOrigin(0);
    ground.refreshBody();
  }

  // Crear jugador
  player = this.physics.add.sprite(100, 350, 'player');
  player.setCollideWorldBounds(true);
  player.setBounce(0.1);

  this.physics.add.collider(player, platforms);

  cursors = this.input.keyboard.createCursorKeys();

  camera = this.cameras.main;
  camera.startFollow(player, true, 0.05, 0.05);
  camera.setBounds(0, 0, 100000, 450);
}

function update() {
  if (!player.body) return;

  // Movimiento automático
  player.setVelocityX(160);

  // Saltar
  if (cursors.up.isDown && player.body.blocked.down) {
    player.setVelocityY(-450);
  }

  // Fondo infinito
  [bgSky1, bgSky2].forEach(bg => {
    bg.x -= scrollSpeed * 0.5;
    if (bg.x <= -800) bg.x += 1600;
  });
  [bgGround1, bgGround2].forEach(bg => {
    bg.x -= scrollSpeed;
    if (bg.x <= -800) bg.x += 1600;
  });

  // Reciclado de plataformas
  platforms.children.iterate((p) => {
    if (!p.body) return;
    p.x -= scrollSpeed;
    if (p.x + platformWidth < camera.scrollX - 200) {
      p.x += platformWidth * 20; // 20 plataformas adelante
      p.refreshBody();
    }
  });

  // Reinicio si cae
  if (player.y > 480) {
    this.scene.restart();
  }
}
