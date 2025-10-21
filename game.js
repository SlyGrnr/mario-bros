// === Mini Mario Bros - Etapa 1 Corregida ===

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

let player, cursors, platforms, camera, bg1, bg2;
let scrollSpeed = 2;

const game = new Phaser.Game(config);

function preload() {
  // No se cargan imágenes externas: las generamos aquí
}

function create() {
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
  g.fillRect(0, 0, 200, 32);
  g.generateTexture('ground', 200, 32);
  g.clear();

  // Jugador rojo
  g.fillStyle(0xff0000, 1);
  g.fillRect(0, 0, 28, 36);
  g.fillStyle(0xffffff, 1);
  g.fillRect(6, 8, 4, 4);
  g.fillRect(18, 8, 4, 4);
  g.generateTexture('player', 28, 36);
  g.clear();

  // Fondo en pantalla
  bg1 = this.add.image(0, 0, 'sky').setOrigin(0);
  bg2 = this.add.image(0, 400, 'ground-deco').setOrigin(0);

  // Crear plataformas
  platforms = this.physics.add.staticGroup();
  for (let i = 0; i < 20; i++) {
    const x = i * 200;
    const y = 430;
    const ground = platforms.create(x, y, 'ground').setOrigin(0);
    ground.refreshBody();
  }

  // Crear jugador
  player = this.physics.add.sprite(100, 350, 'player');
  player.setCollideWorldBounds(false);
  player.setBounce(0.1);

  this.physics.add.collider(player, platforms);

  cursors = this.input.keyboard.createCursorKeys();

  camera = this.cameras.main;
  camera.startFollow(player, true, 0.05, 0.05);
  camera.setBounds(0, 0, 100000, 450);
}

function update() {
  if (!player.body) return; // seguridad

  // Movimiento automático
  player.setVelocityX(160);

  // Saltar
  if (cursors.up.isDown && player.body.blocked.down) {
    player.setVelocityY(-450);
  }

  // Desplazar fondo
  bg1.x -= scrollSpeed * 0.5;
  bg2.x -= scrollSpeed;
  if (bg1.x <= -800) bg1.x = 0;
  if (bg2.x <= -800) bg2.x = 0;

  // Reciclado de plataformas
  platforms.children.iterate((p) => {
    if (!p.body) return;
    p.x -= scrollSpeed;
    if (p.x + p.width < camera.scrollX - 200) {
      p.x += 4000; // reaparece adelante
      p.refreshBody();
    }
  });

  // Reinicio si cae
  if (player.y > 480) {
    this.scene.restart();
  }
}

  // Verificar si el jugador cayó (muere)
  if (player.y > 500) {
    this.scene.restart(); // reinicia juego
  }
}
