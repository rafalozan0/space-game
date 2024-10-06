let nave;
let asteroides = [];
let disparos = [];
let estrellas = [];
let puntaje = 0;
let juegoTerminado = false;
let juegoIniciado = false;

function setup() {
  createCanvas(windowWidth, windowHeight);
  nave = new Nave();
  for (let i = 0; i < 5; i++) {
    asteroides.push(new Asteroide());
  }
  for (let i = 0; i < 100; i++) {
    estrellas.push(new Estrella());
  }
}

function draw() {
  background(0);
  
  for (let estrella of estrellas) {
    estrella.mostrar();
    estrella.mover();
  }
  
  if (!juegoIniciado) {
    mostrarInstrucciones();
    return;
  }
  
  if (!juegoTerminado) {
    nave.mostrar();
    nave.mover();
    
    for (let i = disparos.length - 1; i >= 0; i--) {
      disparos[i].mostrar();
      disparos[i].mover();
      if (disparos[i].fueraDePantalla()) {
        disparos.splice(i, 1);
      } else {
        for (let j = asteroides.length - 1; j >= 0; j--) {
          if (disparos[i] && disparos[i].impacto(asteroides[j])) {
            puntaje += 10;
            crearExplosion(asteroides[j].pos.x, asteroides[j].pos.y);
            asteroides.splice(j, 1);
            disparos.splice(i, 1);
            break;
          }
        }
      }
    }
    
    for (let asteroide of asteroides) {
      asteroide.mostrar();
      asteroide.mover();
      if (nave.colision(asteroide)) {
        juegoTerminado = true;
        crearExplosion(nave.pos.x, nave.pos.y);
      }
    }
    
    if (asteroides.length === 0) {
      juegoTerminado = true;
    }
    
    mostrarPuntaje();
  } else {
    mostrarGameOver();
  }
  
  actualizarParticulas();
  mostrarFooter();
}

function keyPressed() {
  if (keyCode === 32 && !juegoTerminado) { // Barra espaciadora
    disparos.push(new Disparo(nave.pos, nave.dir));
  }
  if (keyCode === ENTER) {
    if (!juegoIniciado) {
      juegoIniciado = true;
    } else if (juegoTerminado) {
      reiniciarJuego();
    }
  }
}

function mostrarInstrucciones() {
  textAlign(CENTER);
  fill(255);
  textSize(32);
  text("Space Game", width/2, height/4);
  textSize(24);
  text("Instrucciones:", width/2, height/3);
  textSize(16);
  text("Usa las flechas para mover la nave", width/2, height/3 + 40);
  text("Presiona la barra espaciadora para disparar", width/2, height/3 + 70);
  text("Destruye todos los asteroides para ganar", width/2, height/3 + 100);
  text("Presiona ENTER para comenzar", width/2, height/3 + 150);
}

function mostrarPuntaje() {
  fill(255);
  textSize(24);
  textAlign(LEFT);
  text(`Puntaje: ${puntaje}`, 10, 30);
}

function mostrarGameOver() {
  textAlign(CENTER);
  fill(255);
  textSize(64);
  if (asteroides.length === 0) {
    text("¡GANASTE!", width/2, height/2);
  } else {
    text("GAME OVER", width/2, height/2);
  }
  textSize(24);
  text("Presiona ENTER para reiniciar", width/2, height/2 + 50);
}

function mostrarFooter() {
  fill(100);
  rect(0, height - 30, width, 30);
  fill(255);
  textSize(14);
  textAlign(CENTER);
  text("Desarrollado por: Tu Equipo - © 2023 Space Game", width/2, height - 10);
}

function reiniciarJuego() {
  nave = new Nave();
  asteroides = [];
  disparos = [];
  for (let i = 0; i < 5; i++) {
    asteroides.push(new Asteroide());
  }
  puntaje = 0;
  juegoTerminado = false;
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

class Nave {
  constructor() {
    this.pos = createVector(width/2, height/2);
    this.r = 20;
    this.dir = 0;
    this.vel = createVector(0, 0);
    this.color = color(255, 0, 0);
  }
  
  mostrar() {
    push();
    translate(this.pos.x, this.pos.y);
    rotate(this.dir + PI/2);
    fill(this.color);
    triangle(-this.r, this.r, this.r, this.r, 0, -this.r);
    pop();
  }
  
  mover() {
    if (keyIsDown(LEFT_ARROW)) {
      this.dir -= 0.1;
    }
    if (keyIsDown(RIGHT_ARROW)) {
      this.dir += 0.1;
    }
    if (keyIsDown(UP_ARROW)) {
      let fuerza = p5.Vector.fromAngle(this.dir);
      fuerza.mult(0.1);
      this.vel.add(fuerza);
      this.mostrarPropulsion();
    }
    this.pos.add(this.vel);
    this.vel.mult(0.99);
    this.pos.x = (this.pos.x + width) % width;
    this.pos.y = (this.pos.y + height) % height;
  }
  
  mostrarPropulsion() {
    push();
    translate(this.pos.x, this.pos.y);
    rotate(this.dir + PI/2);
    fill(255, 165, 0);
    triangle(-this.r/2, this.r, this.r/2, this.r, 0, this.r + random(10, 20));
    pop();
  }
  
  colision(asteroide) {
    let d = dist(this.pos.x, this.pos.y, asteroide.pos.x, asteroide.pos.y);
    return d < this.r + asteroide.r;
  }
}

class Asteroide {
  constructor() {
    this.pos = createVector(random(width), random(height));
    this.vel = p5.Vector.random2D();
    this.r = random(20, 50);
    this.total = floor(random(5, 15));
    this.offset = [];
    for (let i = 0; i < this.total; i++) {
      this.offset[i] = random(-5, 5);
    }
    this.color = color(random(100, 255), random(100, 255), random(100, 255));
  }
  
  mostrar() {
    push();
    translate(this.pos.x, this.pos.y);
    noFill();
    stroke(this.color);
    beginShape();
    for (let i = 0; i < this.total; i++) {
      let angle = map(i, 0, this.total, 0, TWO_PI);
      let r = this.r + this.offset[i];
      let x = r * cos(angle);
      let y = r * sin(angle);
      vertex(x, y);
    }
    endShape(CLOSE);
    pop();
  }
  
  mover() {
    this.pos.add(this.vel);
    this.pos.x = (this.pos.x + width) % width;
    this.pos.y = (this.pos.y + height) % height;
  }
}

class Disparo {
  constructor(pos, angle) {
    this.pos = createVector(pos.x, pos.y);
    this.vel = p5.Vector.fromAngle(angle);
    this.vel.mult(10);
    this.color = color(0, 255, 0);
  }
  
  mostrar() {
    push();
    stroke(this.color);
    strokeWeight(4);
    point(this.pos.x, this.pos.y);
    pop();
  }
  
  mover() {
    this.pos.add(this.vel);
  }
  
  fueraDePantalla() {
    return (this.pos.x < 0 || this.pos.x > width || this.pos.y < 0 || this.pos.y > height);
  }
  
  impacto(asteroide) {
    let d = dist(this.pos.x, this.pos.y, asteroide.pos.x, asteroide.pos.y);
    return d < asteroide.r;
  }
}

class Estrella {
  constructor() {
    this.pos = createVector(random(width), random(height));
    this.vel = createVector(random(-0.5, 0.5), random(-0.5, 0.5));
    this.r = random(1, 3);
  }
  
  mostrar() {
    noStroke();
    fill(255);
    ellipse(this.pos.x, this.pos.y, this.r);
  }
  
  mover() {
    this.pos.add(this.vel);
    if (this.pos.x < 0 || this.pos.x > width) this.vel.x *= -1;
    if (this.pos.y < 0 || this.pos.y > height) this.vel.y *= -1;
  }
}

let particulas = [];

function crearExplosion(x, y) {
  for (let i = 0; i < 20; i++) {
    let particula = new Particula(x, y);
    particulas.push(particula);
  }
}

class Particula {
  constructor(x, y) {
    this.pos = createVector(x, y);
    this.vel = p5.Vector.random2D().mult(random(2, 5));
    this.acc = createVector(0, 0.1);
    this.r = random(2, 5);
    this.lifetime = 255;
  }

  update() {
    this.vel.add(this.acc);
    this.pos.add(this.vel);
    this.lifetime -= 5;
  }

  mostrar() {
    noStroke();
    fill(255, 0, 0, this.lifetime);
    ellipse(this.pos.x, this.pos.y, this.r * 2);
  }

  terminada() {
    return this.lifetime < 0;
  }
}

function actualizarParticulas() {
  for (let i = particulas.length - 1; i >= 0; i--) {
    particulas[i].update();
    particulas[i].mostrar();
    if (particulas[i].terminada()) {
      particulas.splice(i, 1);
    }
  }
}