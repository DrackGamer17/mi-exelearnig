/* ==========================================================
   script.js - Animación en Canvas de una red informática
   ----------------------------------------------------------
   PARTE 1: CONFIG  -> aquí se edita casi todo (textos, colores,
                       dispositivos, conexiones, botones, velocidad).
   PARTE 2: LÓGICA  -> dibuja el lienzo y mueve los paquetes.
   ========================================================== */

/* ---------------------- PARTE 1: CONFIGURACIÓN ---------------------- */
const CONFIG = {

  // Velocidad del paquete: 0.005 = lento, 0.012 = normal, 0.03 = rápido
  velocidad: 0.012,

  // Cada cuántos milisegundos se envía un paquete en modo automático
  intervaloAutomatico: 2500,

  // Colores del dibujo (formato #RRGGBB)
  colores: {
    enlace: "#475569",          // cables
    enlaceInternet: "#64748b",  // enlace punteado hacia Internet
    contorno: "#38bdf8",        // borde de los dispositivos
    relleno: "#1e293b",         // relleno de los dispositivos
    pantalla: "#0ea5e9",        // pantalla de las PC
    luzEncendida: "#22c55e",    // luces del switch y del servidor
    antena: "#f97316",          // antenas del router
    nube: "#1e3a5f",            // nube de Internet
    paquete: "#facc15",         // color del paquete que viaja
    texto: "#e2e8f0",           // nombre de cada dispositivo
    textoSecundario: "#94a3b8"  // direcciones IP
  },

  // Dispositivos: id, nombre, tipo (pc, switch, router, servidor, internet),
  // posición (x, y) dentro del lienzo de 900 x 460 y dirección IP opcional.
  dispositivos: [
    { id: "pc1",  nombre: "PC 1",           tipo: "pc",       x: 90,  y: 90,  ip: "192.168.1.10" },
    { id: "pc2",  nombre: "PC 2",           tipo: "pc",       x: 90,  y: 370, ip: "192.168.1.11" },
    { id: "sw",   nombre: "Switch",         tipo: "switch",   x: 310, y: 230, ip: "" },
    { id: "rt",   nombre: "Router",         tipo: "router",   x: 540, y: 230, ip: "192.168.1.1" },
    { id: "srv",  nombre: "Servidor local", tipo: "servidor", x: 540, y: 70,  ip: "192.168.1.50" },
    { id: "web",  nombre: "Internet",       tipo: "internet", x: 810, y: 230, ip: "" }
  ],

  // Conexiones (cables) entre dispositivos: [origen, destino]
  conexiones: [
    ["pc1", "sw"], ["pc2", "sw"], ["sw", "rt"], ["sw", "srv"], ["rt", "web"]
  ],

  // Botones: [origen, destino, texto del botón]
  envios: [
    ["pc1", "srv", "PC 1 → Servidor"],
    ["pc2", "web", "PC 2 → Internet"],
    ["srv", "pc1", "Servidor → PC 1"]
  ],

  // Textos que se muestran en la página
  textos: {
    inicio: "Pulsa un botón para enviar un paquete.",
    botonAutomatico: "Modo automático",
    botonPausar: "Pausar automático",
    etiquetaPaquete: "PKT"
  }
};

/* ---------------------- PARTE 2: LÓGICA ---------------------- */
const lienzo = document.getElementById("lienzo");
const ctx = lienzo.getContext("2d");          // herramienta para dibujar
const mensaje = document.getElementById("mensaje");
const contenedorBotones = document.getElementById("botones");

// Diccionario id -> dispositivo, para encontrarlos rápido
const nodos = {};
CONFIG.dispositivos.forEach(d => nodos[d.id] = d);

// Lista de vecinos de cada dispositivo (a partir de las conexiones)
const vecinos = {};
CONFIG.conexiones.forEach(([a, b]) => {
  (vecinos[a] = vecinos[a] || []).push(b);
  (vecinos[b] = vecinos[b] || []).push(a);
});

// Busca el camino más corto entre dos dispositivos (búsqueda en anchura)
function buscarRuta(origen, destino) {
  const cola = [[origen]], visitados = new Set([origen]);
  while (cola.length) {
    const camino = cola.shift();
    const ultimo = camino[camino.length - 1];
    if (ultimo === destino) return camino;
    for (const v of vecinos[ultimo] || []) {
      if (!visitados.has(v)) { visitados.add(v); cola.push([...camino, v]); }
    }
  }
  return [origen];
}

let paquetes = [];        // paquetes que están viajando en este momento
let automatico = false;   // modo automático activado o no
let ultimoEnvio = 0;

// Crea un paquete nuevo y lo pone en movimiento
function enviar(origen, destino) {
  const ruta = buscarRuta(origen, destino);
  paquetes.push({ ruta: ruta, tramo: 0, avance: 0 });
  const intermedios = ruta.slice(1, -1).map(id => nodos[id].nombre);
  mensaje.textContent = "Paquete de " + nodos[origen].nombre + " hacia " +
    nodos[destino].nombre + (intermedios.length
      ? ": pasa por " + intermedios.join(" → ") + "."
      : ": llega directo.");
}

/* ---- Funciones de dibujo de cada tipo de dispositivo ---- */
const dibujar = {
  pc() {
    ctx.fillRect(-30, -24, 60, 40); ctx.strokeRect(-30, -24, 60, 40);
    ctx.fillStyle = CONFIG.colores.pantalla; ctx.fillRect(-25, -19, 50, 30);
    ctx.fillStyle = "#334155"; ctx.fillRect(-12, 16, 24, 6); ctx.fillRect(-20, 22, 40, 4);
  },
  switch() {
    ctx.fillRect(-45, -14, 90, 28); ctx.strokeRect(-45, -14, 90, 28);
    ctx.fillStyle = CONFIG.colores.luzEncendida;
    for (let i = 0; i < 6; i++) { ctx.beginPath(); ctx.arc(-32 + i * 13, 0, 4, 0, 7); ctx.fill(); }
  },
  router() {
    ctx.fillRect(-38, -12, 76, 26); ctx.strokeRect(-38, -12, 76, 26);
    ctx.strokeStyle = CONFIG.colores.antena;
    ctx.beginPath(); ctx.moveTo(-20, -12); ctx.lineTo(-28, -34);
    ctx.moveTo(20, -12); ctx.lineTo(28, -34); ctx.stroke();
    ctx.fillStyle = CONFIG.colores.antena; ctx.beginPath(); ctx.arc(0, 1, 5, 0, 7); ctx.fill();
  },
  servidor() {
    for (let i = 0; i < 3; i++) {
      ctx.fillStyle = CONFIG.colores.relleno;
      ctx.fillRect(-30, -30 + i * 20, 60, 17); ctx.strokeRect(-30, -30 + i * 20, 60, 17);
      ctx.fillStyle = CONFIG.colores.luzEncendida;
      ctx.beginPath(); ctx.arc(-20, -21 + i * 20, 3, 0, 7); ctx.fill();
    }
  },
  internet() {
    ctx.fillStyle = CONFIG.colores.nube;
    ctx.beginPath(); ctx.arc(-18, 4, 20, 0, 7); ctx.arc(10, -6, 26, 0, 7); ctx.arc(30, 8, 18, 0, 7);
    ctx.fill(); ctx.stroke();
  }
};

function dibujarDispositivo(d) {
  ctx.save();
  ctx.translate(d.x, d.y);
  ctx.fillStyle = CONFIG.colores.relleno;
  ctx.strokeStyle = CONFIG.colores.contorno;
  ctx.lineWidth = 2;
  (dibujar[d.tipo] || dibujar.pc)();
  ctx.restore();

  // Nombre y dirección IP debajo del dispositivo
  const bajo = d.tipo === "servidor" ? 48 : 50;
  ctx.textAlign = "center";
  ctx.fillStyle = CONFIG.colores.texto;
  ctx.font = "bold 14px Arial";
  ctx.fillText(d.nombre, d.x, d.y + bajo);
  if (d.ip) {
    ctx.fillStyle = CONFIG.colores.textoSecundario;
    ctx.font = "12px Arial";
    ctx.fillText(d.ip, d.x, d.y + bajo + 16);
  }
}

// Bucle principal: se ejecuta unas 60 veces por segundo
function animar(tiempo) {
  ctx.clearRect(0, 0, lienzo.width, lienzo.height);   // 1. borrar todo

  // 2. dibujar los cables
  ctx.lineWidth = 3;
  CONFIG.conexiones.forEach(([a, b]) => {
    const hacia = nodos[b].tipo === "internet" || nodos[a].tipo === "internet";
    ctx.strokeStyle = hacia ? CONFIG.colores.enlaceInternet : CONFIG.colores.enlace;
    ctx.setLineDash(hacia ? [6, 6] : []);
    ctx.beginPath(); ctx.moveTo(nodos[a].x, nodos[a].y); ctx.lineTo(nodos[b].x, nodos[b].y); ctx.stroke();
  });
  ctx.setLineDash([]);

  // 3. dibujar los dispositivos
  CONFIG.dispositivos.forEach(dibujarDispositivo);

  // 4. mover y dibujar los paquetes (este es el objeto en movimiento)
  paquetes.forEach(p => {
    const desde = nodos[p.ruta[p.tramo]], hasta = nodos[p.ruta[p.tramo + 1]];
    if (!hasta) return;
    p.avance += CONFIG.velocidad;
    if (p.avance >= 1) { p.avance = 0; p.tramo++; }
    const px = desde.x + (hasta.x - desde.x) * p.avance;
    const py = desde.y + (hasta.y - desde.y) * p.avance;
    ctx.fillStyle = CONFIG.colores.paquete;
    ctx.shadowColor = CONFIG.colores.paquete; ctx.shadowBlur = 12;
    ctx.fillRect(px - 9, py - 7, 18, 14);
    ctx.shadowBlur = 0;
    ctx.fillStyle = "#0f172a"; ctx.font = "bold 9px Arial"; ctx.textAlign = "center";
    ctx.fillText(CONFIG.textos.etiquetaPaquete, px, py + 3);
  });
  paquetes = paquetes.filter(p => p.tramo < p.ruta.length - 1);   // quitar los que llegaron

  // 5. modo automático
  if (automatico && tiempo - ultimoEnvio > CONFIG.intervaloAutomatico) {
    ultimoEnvio = tiempo;
    const e = CONFIG.envios[Math.floor(Math.random() * CONFIG.envios.length)];
    enviar(e[0], e[1]);
  }
  requestAnimationFrame(animar);
}

// Crear los botones a partir de CONFIG.envios
CONFIG.envios.forEach(([origen, destino, texto]) => {
  const b = document.createElement("button");
  b.textContent = texto;
  b.onclick = () => enviar(origen, destino);
  contenedorBotones.appendChild(b);
});
const botonAuto = document.createElement("button");
botonAuto.textContent = CONFIG.textos.botonAutomatico;
botonAuto.onclick = () => {
  automatico = !automatico;
  botonAuto.textContent = automatico ? CONFIG.textos.botonPausar : CONFIG.textos.botonAutomatico;
};
contenedorBotones.appendChild(botonAuto);

mensaje.textContent = CONFIG.textos.inicio;
requestAnimationFrame(animar);
