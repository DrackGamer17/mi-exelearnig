/* ==========================================================
   script.js - Evaluación de opción múltiple
   ----------------------------------------------------------
   PARTE 1: CONFIG  -> aquí se editan las preguntas, las
                       respuestas correctas, los textos y la
                       nota mínima para aprobar.
   PARTE 2: LÓGICA  -> crea el cuestionario, corrige y calcula
                       la nota. No hace falta modificarla.
   ========================================================== */

/* ---------------------- PARTE 1: CONFIGURACIÓN ---------------------- */
const CONFIG = {
  titulo: "Evaluación: red informática",
  instrucciones: "Elige una opción en cada pregunta y pulsa «Comprobar respuestas».",

  notaMaxima: 10,    // la nota final se calcula sobre este valor
  notaMinima: 7,     // nota mínima para aprobar
  mezclarOpciones: true,   // true = las opciones cambian de orden cada vez

  textos: {
    comprobar: "Comprobar respuestas",
    reintentar: "Intentar de nuevo",
    faltan: "Responde todas las preguntas antes de comprobar. Te faltan: ",
    progreso: "Respondidas: ",
    correcto: "¡Correcto! ",
    incorrecto: "Incorrecto. La respuesta correcta es: ",
    aciertos: "Aciertos: ",
    mensajeAprobado: "¡Muy bien! Comprendes cómo funciona una red informática.",
    mensajeReprobado: "Repasa la sección Desarrollo, observa otra vez la animación y vuelve a intentarlo."
  },

  // Cada pregunta: enunciado, opciones, índice de la correcta (empieza en 0)
  // y una explicación que se muestra al comprobar.
  preguntas: [
    {
      enunciado: "¿Qué dispositivo conecta a los equipos dentro de una misma red local?",
      opciones: ["Router", "Switch", "Monitor", "Módem de fibra"],
      correcta: 1,
      explicacion: "El switch une los equipos de la red local y reenvía los datos solo al equipo de destino."
    },
    {
      enunciado: "¿Cuál es la función principal de un router?",
      opciones: [
        "Guardar los archivos de todos los usuarios",
        "Dibujar gráficos en pantalla",
        "Conectar la red local con otras redes, como Internet",
        "Aumentar la memoria de las computadoras"
      ],
      correcta: 2,
      explicacion: "El router comunica redes distintas y decide por dónde sale cada paquete."
    },
    {
      enunciado: "¿Qué es un paquete de datos?",
      opciones: [
        "Una pequeña porción de información con dirección de origen y de destino",
        "Un programa que se instala en el servidor",
        "Un cable especial de red",
        "Una página web completa"
      ],
      correcta: 0,
      explicacion: "Los datos se dividen en paquetes que llevan las direcciones IP de origen y destino."
    },
    {
      enunciado: "En el modelo cliente-servidor, ¿qué hace el servidor?",
      opciones: [
        "Envía solicitudes sin recibir respuestas",
        "Apaga el switch cuando no se usa",
        "Dibuja la animación en el lienzo",
        "Responde a las solicitudes que le envía el cliente"
      ],
      correcta: 3,
      explicacion: "El cliente solicita y el servidor responde con los datos pedidos."
    },
    {
      enunciado: "¿Qué etiqueta de HTML5 se usa para dibujar animaciones con JavaScript?",
      opciones: ["<table>", "<canvas>", "<form>", "<audio>"],
      correcta: 1,
      explicacion: "La etiqueta <canvas> crea el lienzo sobre el que JavaScript dibuja y anima."
    },
    {
      enunciado: "En la animación, un paquete enviado desde PC 1 hacia el Servidor local, ¿por cuál dispositivo pasa?",
      opciones: ["Por el Router", "Por Internet", "Por el Switch", "Por PC 2"],
      correcta: 2,
      explicacion: "PC 1 y el servidor están en la misma red local, conectados al switch; no necesitan pasar por el router."
    },
    {
      enunciado: "¿Qué sucedería en una red en estrella si el switch dejara de funcionar?",
      opciones: [
        "Las computadoras seguirían comunicándose sin problema",
        "Las computadoras conectadas a él perderían la comunicación entre sí",
        "Solo se apagaría Internet",
        "El servidor se convertiría en switch"
      ],
      correcta: 1,
      explicacion: "En la topología en estrella todos los equipos dependen del switch para comunicarse."
    },
    {
      enunciado: "¿Qué hace que una animación en Canvas se vea en movimiento?",
      opciones: [
        "Dibujar una sola vez y no volver a tocar el lienzo",
        "Borrar y volver a dibujar el lienzo muchas veces por segundo, cambiando un poco la posición",
        "Instalar un programa adicional en el navegador",
        "Usar solo imágenes en formato GIF"
      ],
      correcta: 1,
      explicacion: "La animación se logra redibujando el lienzo en cada cuadro con los objetos en una posición ligeramente distinta."
    }
  ]
};

/* ---------------------- PARTE 2: LÓGICA ---------------------- */
const formulario = document.getElementById("cuestionario");
const btnComprobar = document.getElementById("btnComprobar");
const btnReintentar = document.getElementById("btnReintentar");
const resultado = document.getElementById("resultado");
const progreso = document.getElementById("progreso");
const LETRAS = "abcdefghij";

document.getElementById("titulo").textContent = CONFIG.titulo;
document.getElementById("instrucciones").textContent = CONFIG.instrucciones;
btnComprobar.textContent = CONFIG.textos.comprobar;
btnReintentar.textContent = CONFIG.textos.reintentar;

// Baraja una lista (algoritmo de Fisher-Yates)
function mezclar(lista) {
  const copia = lista.slice();
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}

// Construye todas las preguntas en la página
function construir() {
  formulario.innerHTML = "";
  formulario.classList.remove("bloqueado");
  resultado.hidden = true;
  btnReintentar.hidden = true;
  btnComprobar.hidden = false;
  const aviso = document.getElementById("aviso");
  if (aviso) aviso.remove();

  CONFIG.preguntas.forEach((p, n) => {
    const caja = document.createElement("fieldset");
    caja.className = "pregunta";
    caja.id = "p" + n;

    const leyenda = document.createElement("legend");
    leyenda.textContent = (n + 1) + ". " + p.enunciado;
    caja.appendChild(leyenda);

    // Cada opción recuerda cuál es su número original para saber si es la correcta
    let orden = p.opciones.map((texto, i) => ({ texto, i }));
    if (CONFIG.mezclarOpciones) orden = mezclar(orden);

    orden.forEach((o, k) => {
      const etiqueta = document.createElement("label");
      etiqueta.className = "opcion";
      const radio = document.createElement("input");
      radio.type = "radio";
      radio.name = "q" + n;
      radio.value = o.i;
      radio.addEventListener("change", () => marcar(caja, etiqueta));
      const texto = document.createElement("span");
      texto.textContent = LETRAS[k] + ") " + o.texto;
      etiqueta.append(radio, texto);
      caja.appendChild(etiqueta);
    });
    formulario.appendChild(caja);
  });
  actualizarProgreso();
}

function marcar(caja, etiquetaElegida) {
  caja.querySelectorAll(".opcion").forEach(e => e.classList.remove("marcada"));
  etiquetaElegida.classList.add("marcada");
  actualizarProgreso();
}

function respondidas() {
  return CONFIG.preguntas.filter((_, n) => formulario.querySelector('input[name="q' + n + '"]:checked')).length;
}

function actualizarProgreso() {
  progreso.textContent = CONFIG.textos.progreso + respondidas() + " / " + CONFIG.preguntas.length;
}

// Corrige el cuestionario
function comprobar() {
  const faltan = [];
  CONFIG.preguntas.forEach((_, n) => {
    if (!formulario.querySelector('input[name="q' + n + '"]:checked')) faltan.push(n + 1);
  });
  let aviso = document.getElementById("aviso");
  if (faltan.length) {
    if (!aviso) {
      aviso = document.createElement("p");
      aviso.id = "aviso";
      document.getElementById("acciones").appendChild(aviso);
    }
    aviso.textContent = CONFIG.textos.faltan + faltan.join(", ") + ".";
    document.getElementById("p" + (faltan[0] - 1)).scrollIntoView({ behavior: "smooth", block: "center" });
    return;
  }
  if (aviso) aviso.remove();

  let aciertos = 0;
  CONFIG.preguntas.forEach((p, n) => {
    const caja = document.getElementById("p" + n);
    const elegida = Number(formulario.querySelector('input[name="q' + n + '"]:checked').value);
    const acierto = elegida === p.correcta;
    if (acierto) aciertos++;

    caja.querySelectorAll(".opcion").forEach(et => {
      const valor = Number(et.querySelector("input").value);
      et.classList.remove("marcada");
      if (valor === p.correcta) et.classList.add("correcta");
      else if (valor === elegida) et.classList.add("incorrecta");
      et.querySelector("input").disabled = true;
    });

    const nota = document.createElement("p");
    nota.className = "explicacion " + (acierto ? "ok" : "mal");
    nota.textContent = (acierto ? CONFIG.textos.correcto
      : CONFIG.textos.incorrecto + p.opciones[p.correcta] + ". ") + p.explicacion;
    caja.appendChild(nota);
  });

  formulario.classList.add("bloqueado");
  const total = CONFIG.preguntas.length;
  const nota = Math.round((aciertos / total) * CONFIG.notaMaxima * 10) / 10;
  const aprobado = nota >= CONFIG.notaMinima;

  resultado.className = aprobado ? "aprobado" : "reprobado";
  resultado.innerHTML = "";
  const t1 = document.createElement("p");
  t1.textContent = CONFIG.textos.aciertos + aciertos + " de " + total;
  const t2 = document.createElement("p");
  t2.className = "nota";
  t2.textContent = nota + " / " + CONFIG.notaMaxima;
  const t3 = document.createElement("p");
  t3.textContent = aprobado ? CONFIG.textos.mensajeAprobado : CONFIG.textos.mensajeReprobado;
  resultado.append(t1, t2, t3);
  resultado.hidden = false;
  btnComprobar.hidden = true;
  btnReintentar.hidden = false;
  resultado.scrollIntoView({ behavior: "smooth", block: "center" });
}

btnComprobar.addEventListener("click", comprobar);
btnReintentar.addEventListener("click", () => { construir(); window.scrollTo({ top: 0, behavior: "smooth" }); });
construir();
