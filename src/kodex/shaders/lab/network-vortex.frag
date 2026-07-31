#version 330 core

/*
 * KODEX-∞ · NETWORK VORTEX
 *
 * La red viva. Es el unico shader de la carpeta que no viene del lab: se
 * escribio contra la referencia que Ocin mando -- el vortice de Motherboard --
 * porque ningun preset hacia lo que esa referencia muestra.
 *
 * Lo que la referencia tiene y un campo de ruido no:
 *
 *  · ESPIRAL. No es un remolino de manchas sino una malla en espiral
 *    logaritmica: brazos que giran y anillos que caen hacia el centro. La
 *    coordenada polar log(r) es lo que hace que la malla se apriete hacia
 *    adentro en vez de repetirse igual, que es como se lee la profundidad.
 *
 *  · TRAZAS, no volumen. Lineas finas siguiendo la malla, como un circuito
 *    visto de lejos. El grosor no depende de la distancia sino de la derivada,
 *    asi la traza mide lo mismo en el centro que en el borde -- sin eso el
 *    centro se empasta en un bulto blanco.
 *
 *  · NODOS. Puntos en los cruces, no en todos: cada celda decide con su propio
 *    hash si tiene nodo, y cada nodo late a su ritmo. Una red donde prenden
 *    todos los cruces es una grilla; una donde prenden algunos es una red.
 *
 *  · POLICROMIA. El color varia por brazo y por radio. La referencia chispea
 *    cian, ambar y blanco sobre azul: si fuera de un tono seria un filtro.
 *    La etapa de grado del runtime despues lo lleva al acento de la lamina,
 *    pero la variacion interna es la que sobrevive y da el chispeo.
 *
 * El campo sale en luminancia util para esa etapa: negro de fondo, la
 * estructura en la parte alta del rango.
 */

in vec2 v_uv;
out vec4 fragColor;

uniform float     u_time;
uniform vec2      u_resolution;
uniform vec2      u_pointer;
uniform float     u_seed;
uniform float     u_feedback;
uniform sampler2D u_previousFrame;

const float TAU = 6.28318530718;

/** Brazos de la espiral. Impar: una malla par se lee simetrica y muerta. */
const float ARMS = 13.0;
/** Anillos por vuelta de log(r). Sube la densidad hacia el centro. */
const float RINGS = 8.0;

float hash21(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

vec3 hash23(vec2 p) {
  return vec3(hash21(p), hash21(p + 17.3), hash21(p + 91.7));
}

/**
 * Distancia a la linea de rejilla mas cercana, normalizada por la derivada.
 * Sin dividir por fwidth la traza se engorda donde la malla se aprieta y el
 * centro del vortice queda tapado.
 */
float trace(float coord, float grosor) {
  float d = abs(fract(coord) - 0.5);
  return 1.0 - smoothstep(0.0, grosor * fwidth(coord) + 1e-5, d);
}

void main() {
  // La escala importa. Una espiral logaritmica amontona toda su densidad en
  // el nucleo y deja el resto casi vacio: a escala 1 la red salia como una
  // galaxia chica en medio de una pantalla negra. Acercando la coordenada se
  // encuadra la parte densa y la malla llena el cuadro, que es como se ve en
  // la referencia.
  vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution) / max(u_resolution.y, 1.0) * 0.40;

  // El puntero desplaza el eje del vortice, no lo sigue: la red reacciona a
  // que hay alguien sin convertirse en un cursor.
  vec2 eje = (u_pointer - 0.5) * 0.22;
  uv -= eje;

  float r = length(uv);
  float a = atan(uv.y, uv.x);

  // Espiral logaritmica. El tiempo entra en el radio, no en el angulo: asi la
  // malla CAE hacia el centro en vez de solo girar, que es el movimiento de la
  // referencia.
  float lr = log(max(r, 0.0015));
  float giro = u_time * 0.07;
  float caida = u_time * 0.16;

  float brazo  = (a / TAU) * ARMS + lr * 1.35 + giro * ARMS;
  float anillo = lr * RINGS - caida + u_seed * 0.37;

  // --- TRAZAS ------------------------------------------------------------
  float tBrazo  = trace(brazo,  1.35);
  float tAnillo = trace(anillo, 1.15);
  // Los brazos pesan mas que los anillos: la referencia se lee radial, con los
  // anillos como escalones que la cruzan.
  float malla = tBrazo * 0.72 + tAnillo * 0.46;

  // Segunda malla mas fina y girando al reves. Es lo que da la sensacion de
  // tejido en vez de rejilla: dos capas que nunca coinciden.
  float finoB = trace(brazo * 2.0 - giro * 3.1, 2.2) * 0.3;
  float finoA = trace(anillo * 2.0 + caida * 0.7, 2.0) * 0.24;
  malla += finoB + finoA;

  // BRAZOS QUE SE ENCIENDEN Y SE APAGAN. En la referencia la red no esta toda
  // prendida al mismo tiempo: hay ramas activas y ramas en sombra, y eso es lo
  // que la hace parecer que esta pasando algo por ella. Cada brazo tiene su
  // propio ciclo, lento y desfasado, y ninguno se apaga del todo -- una rama
  // que desaparece se lee como un error de dibujo, no como una rama en reposo.
  float idBrazo = floor(brazo);
  float hb = hash21(vec2(idBrazo, 3.7) + u_seed);
  float encendido = 0.34 + 0.66 * smoothstep(0.15, 0.85,
    0.5 + 0.5 * sin(u_time * (0.18 + hb * 0.5) + hb * TAU));
  malla *= encendido;

  // --- NODOS -------------------------------------------------------------
  vec2 celda = vec2(brazo, anillo);
  vec2 id = floor(celda);
  vec2 f = fract(celda) - 0.5;
  vec3 h = hash23(id + u_seed * 13.0);

  // Solo una parte de los cruces tiene nodo.
  float existe = step(0.52, h.x);
  // El nodo no vive en el centro exacto de la celda: corrido, la red deja de
  // verse alineada.
  vec2 centro = (h.yz - 0.5) * 0.42;
  float d = length((f - centro) * vec2(1.0, 1.15));

  float latido = 0.55 + 0.45 * sin(u_time * (0.5 + h.y * 2.6) + h.z * TAU);
  // El nodo se dimensiona en celdas, no en pixeles: con la malla densa un
  // radio fijo lo dejaba por debajo de un pixel y la red perdia sus puntos,
  // que son la mitad de lo que la hace leer como red.
  float nodo = existe * exp(-d * 11.0) * latido;
  // Halo corto alrededor del nodo: sin el, los puntos se ven pegados encima.
  float halo = existe * exp(-d * 3.4) * 0.2 * latido;

  // --- PULSOS QUE VIAJAN ---------------------------------------------------
  // Paquetes de luz recorriendo las lineas hacia el centro. Es lo que separa
  // una red dibujada de una red POR LA QUE PASA ALGO: sin esto la malla se
  // mueve entera, y lo que tiene que moverse es lo que circula por ella.
  //
  // Cada brazo lanza el suyo con su propia fase, asi que nunca llegan todos
  // juntos. El paquete vive sobre la traza del brazo -- fuera de la linea no
  // se dibuja, porque un pulso que viaja por el vacio no viaja por nada.
  float faseP = fract(anillo * 0.5 - u_time * 0.34 + hb);
  float paquete = exp(-faseP * 9.0) + exp(-(1.0 - faseP) * 22.0);
  float pulsoViajero = paquete * tBrazo * encendido;

  // --- FONDO GRANULAR ------------------------------------------------------
  // La capa de atras: puntos finos y ruido, muy tenue. En la referencia hay
  // profundidad por capas -- filamentos brillantes al frente, polvo al fondo --
  // y sin esa capa el negro se ve plano, como papel en vez de espacio.
  vec2 grano = floor(gl_FragCoord.xy / 3.0);
  float polvo = hash21(grano + floor(u_time * 3.0) * 0.13);
  polvo = step(0.9955, polvo) * 0.5 + hash21(grano) * 0.035;

  // --- CUERPO ------------------------------------------------------------
  // Nucleo: la red se enciende hacia el centro y se apaga en el borde, que es
  // lo que la hace un vortice y no un papel mural.
  float nucleo = exp(-r * 5.2);
  float borde = 1.0 - smoothstep(0.16, 0.42, r);
  // El centro exacto de una espiral logaritmica es una singularidad: la malla
  // se aprieta hasta el infinito y sale un bulto blanco. Se apaga el ojo del
  // vortice, que ademas es lo que le da el hueco de la referencia.
  float ojo = smoothstep(0.008, 0.055, r);
  float energia = (malla * 0.72 + nodo * 1.5 + halo + pulsoViajero * 1.1) * mix(0.42, 1.0, nucleo) * borde * ojo;
  // El polvo no pasa por el ojo ni por el nucleo: es fondo, ocupa todo el
  // cuadro y no pertenece a la estructura de la espiral.
  energia += polvo * borde * 0.5;

  // Pulso lento que recorre la espiral hacia afuera: la red respira.
  float pulso = 0.5 + 0.5 * sin(lr * 3.4 - u_time * 1.1);
  energia *= 0.78 + pulso * 0.42;

  // --- COLOR -------------------------------------------------------------
  // Varia por brazo y radio. La etapa de grado del runtime lo lleva despues al
  // acento de la lamina; lo que sobrevive de aca es la VARIACION, que es la
  // que hace el chispeo.
  float tono = fract(id.x * 0.11 + h.x * 0.5 + lr * 0.08);
  vec3 frio  = vec3(0.30, 0.72, 1.00);
  vec3 calido = vec3(1.00, 0.74, 0.38);
  vec3 color = mix(frio, calido, tono);
  // Los nodos y los pulsos tiran a blanco: son los puntos mas calientes.
  color = mix(color, vec3(1.0), clamp(nodo * 0.8 + pulsoViajero * 0.55, 0.0, 0.9));

  // Se entrega con la traza cerca del tope del rango. La etapa de grado del
  // runtime recorta por piso y afina con una curva de potencia: un campo que
  // sale a media luz atraviesa esas dos etapas y llega apagado. Los presets
  // del lab ya salen fuertes; este tenia que igualarlos.
  vec3 salida = color * min(energia * 2.6, 1.35);

  // Rastro temporal. Poco: mucho convierte la red en una nube y se pierde la
  // hebra, que es justo lo que la referencia tiene.
  vec3 previo = texture(u_previousFrame, gl_FragCoord.xy / u_resolution).rgb;
  salida = max(salida, previo * clamp(u_feedback, 0.0, 0.72) * 0.82);

  fragColor = vec4(salida, 1.0);
}
