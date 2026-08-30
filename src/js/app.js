/* ============================================
   Simbiosis Cocina — Catálogo de Productos
   app.js — carga YAML, filtra, renderiza secciones
   editoriales, WhatsApp, iFrame auto-size
   ============================================ */

'use strict';

/* ---------------------------------------------------------------
   Estado global
   --------------------------------------------------------------- */

let gProducts = [];          // Productos validados
const gImageCache = new Map(); // Map<string, {main, secondary, tertiary}>

// Debounce timer ID para ResizeObserver
let gResizeTimer = null;

/* ---------------------------------------------------------------
   initCatalog — función principal
   --------------------------------------------------------------- */

/**
 * async initCatalog(): Promise<void>
 * Punto de entrada: fetch → parse → valida → renderiza.
 * Se ejecuta al dispararse DOMContentLoaded.
 */
async function initCatalog() {
  const app = document.getElementById('app');

  try {
    const response = await fetch('productos.yaml');

    if (!response.ok) {
      showAppMessage('Error al cargar el catálogo');
      return;
    }

    const rawText = await response.text();

    let data;
    try {
      data = jsyaml.load(rawText);
    } catch (parseErr) {
      console.error('Error al parsear YAML:', parseErr);
      showAppMessage('Error al leer los datos del catálogo');
      return;
    }

    const validated = validateSchema(data);

    if (validated.length === 0) {
      showAppMessage('No hay productos disponibles');
      return;
    }

    // Datos listos — reemplazar el contenido de #app
    gProducts = validated;
    app.innerHTML = '';

    // Encabezado
    const header = document.createElement('header');
    header.className = 'catalog-header';
    app.appendChild(header);

    // Intro del catálogo (desde YAML, separado por párrafos vacíos)
    if (data.intro && data.intro.trim() !== '') {
      const intro = document.createElement('div');
      intro.className = 'catalog-intro';

      // Two-column grid: image slot on the left, copy on the right.
      const grid = document.createElement('div');
      grid.className = 'catalog-intro-grid';

      // Image slot on the left: show the chosen cover photo, or a placeholder.
      const imageSlot = document.createElement('div');
      imageSlot.className = 'intro-image';

      if (data.intro_imagen && String(data.intro_imagen).trim() !== '') {
        const img = document.createElement('img');
        img.className = 'intro-image-img';
        img.src = data.intro_imagen;
        img.alt = 'Imagen de portada — Simbiosis Cocina';
        img.loading = 'lazy';
        img.onload = function () {
          sendHeight();
        };
        imageSlot.appendChild(img);
      } else {
        const placeholder = document.createElement('div');
        placeholder.className = 'intro-image-placeholder';
        placeholder.textContent = 'Imagen de portada (pendiente)';
        imageSlot.appendChild(placeholder);
      }

      grid.appendChild(imageSlot);

      // Copy column with paragraphs separated by blank lines.
      const copy = document.createElement('div');
      copy.className = 'intro-copy';

      data.intro.split(/\n\n+/).forEach(function (p) {
        const trimmed = p.trim();
        if (!trimmed) return;
        const para = document.createElement('p');
        para.textContent = trimmed;
        copy.appendChild(para);
      });

      grid.appendChild(copy);
      intro.appendChild(grid);
      app.appendChild(intro);
    }

    // Filtros
    const categories = deriveCategories(gProducts);
    renderFilterBar(categories);

    // Secciones editoriales
    renderSections(gProducts);

    // ResizeObserver para el iframe
    initResizeObserver();
  } catch (networkErr) {
    console.error('Error de conexión:', networkErr);
    showAppMessage('Error de conexión. Intente nuevamente.');
  }
}

/* ---------------------------------------------------------------
   showAppMessage — muestra un mensaje de estado
   --------------------------------------------------------------- */

/**
 * Reemplaza el contenido de #app con un mensaje de texto.
 * @param {string} message - Texto a mostrar
 */
function showAppMessage(message) {
  const app = document.getElementById('app');
  app.innerHTML = '<div class="app-message">' + message + '</div>';
}

/* ---------------------------------------------------------------
   validateSchema — valida la estructura del YAML
   --------------------------------------------------------------- */

/**
 * Valida que data tenga un array productos[] y que cada ítem
 * tenga los campos requeridos como strings no vacíos.
 * Los campos requeridos son: nombre, categoria, carpeta_imagenes.
 * recomendacion es OPCIONAL y se preserva si está presente.
 * @param {unknown} data - Objeto parseado del YAML
 * @returns {Array} Array de productos válidos
 */
function validateSchema(data) {
  if (!data || !Array.isArray(data.productos)) {
    return [];
  }

  const gRequiredFields = ['nombre', 'categoria', 'carpeta_imagenes'];

  return data.productos.filter(function (item) {
    var valid = gRequiredFields.every(function (field) {
      return typeof item[field] === 'string' && item[field].trim() !== '';
    });
    if (!valid) {
      console.warn('Producto omitido — faltan campos requeridos:', item);
    }
    return valid;
  });
}

/* ---------------------------------------------------------------
   deriveCategories — obtiene categorías únicas
   --------------------------------------------------------------- */

/**
 * Extrae categorías únicas del array de productos y antepone "Todas".
 * @param {Array} products - Array de productos validados
 * @returns {string[]} Array de nombres de categoría
 */
function deriveCategories(products) {
  var cats = [];
  var seen = {};

  products.forEach(function (p) {
    if (!seen[p.categoria]) {
      seen[p.categoria] = true;
      cats.push(p.categoria);
    }
  });

  return ['Todas'].concat(cats);
}

/* ---------------------------------------------------------------
   renderFilterBar — pinta los botones de filtro
   --------------------------------------------------------------- */

/**
 * Renderiza la barra de filtros dentro de #app.
 * Si solo existe "Todas" (sin productos), no renderiza nada.
 * @param {string[]} categories - Lista de categorías
 */
function renderFilterBar(categories) {
  // Si no hay categorías reales, no mostrar filtros
  if (categories.length <= 1) {
    return;
  }

  var nav = document.createElement('nav');
  nav.id = 'filtros';
  nav.className = 'filter-bar';

  categories.forEach(function (cat) {
    var btn = document.createElement('button');
    btn.textContent = cat;
    btn.dataset.categoria = cat;

    if (cat === 'Todas') {
      btn.classList.add('active');
    }

    btn.addEventListener('click', function () {
      onFilterClick(cat);
    });

    nav.appendChild(btn);
  });

  document.getElementById('app').appendChild(nav);
}

/* ---------------------------------------------------------------
   onFilterClick — maneja el click en un filtro
   --------------------------------------------------------------- */

/**
 * Cambia el estado activo del filtro y muestra/oculta secciones.
 * @param {string} category - Categoría seleccionada
 */
function onFilterClick(category) {
  // Actualizar estado activo de los botones
  var buttons = document.querySelectorAll('.filter-bar button');
  buttons.forEach(function (btn) {
    btn.classList.toggle('active', btn.dataset.categoria === category);
  });

  // Mostrar/ocultar secciones de producto usando clase .hidden
  var sections = document.querySelectorAll('.product-section');
  var visibleCount = 0;

  sections.forEach(function (section) {
    var isVisible = category === 'Todas' || section.dataset.categoria === category;

    section.classList.toggle('hidden', !isVisible);

    if (isVisible) visibleCount++;
  });

  // Limpiar mensaje vacío previo
  var prevMsg = document.querySelector('.empty-message');
  if (prevMsg) {
    prevMsg.remove();
  }

  // Mostrar mensaje si no hay resultados
  if (category !== 'Todas' && visibleCount === 0) {
    var sectionsContainer = document.getElementById('sections');
    if (sectionsContainer) {
      var msg = document.createElement('p');
      msg.className = 'empty-message';
      msg.textContent = 'No hay productos en esta categoría';
      sectionsContainer.appendChild(msg);
    }
  }

  // Notificar cambio de altura al padre
  sendHeight();
}

/* ---------------------------------------------------------------
   renderSections — pinta las secciones editoriales
   --------------------------------------------------------------- */

/**
 * Crea el contenedor de secciones y agrega una por cada producto.
 * @param {Array} products - Array de productos validados
 */
function renderSections(products) {
  var container = document.createElement('div');
  container.id = 'sections';

  products.forEach(function (product, index) {
    var section = createProductSection(product, index);
    container.appendChild(section);
  });

  document.getElementById('app').appendChild(container);
}

/* ---------------------------------------------------------------
   createProductSection — construye una sección editorial
   --------------------------------------------------------------- */

/**
 * Crea el elemento HTML de una sección de producto con diseño
 * editorial de dos columnas (fotos | info) que alternan según
 * el índice. Las imágenes se cargan async.
 * @param {Object} product - Datos del producto
 * @param {number} index - Índice para alternar layout
 * @returns {HTMLElement} section.product-section
 */
function createProductSection(product, index) {
  var section = document.createElement('section');
  section.className = 'product-section';
  section.dataset.categoria = product.categoria;

  /* --- Contenedor de dos columnas con clase alternante --- */
  var layoutClass = index % 2 === 0 ? 'layout-photos-first' : 'layout-info-first';
  var content = document.createElement('div');
  content.className = 'section-content ' + layoutClass;

  /* ============================================================
     Columna de fotos
     ============================================================ */
  var photoCol = document.createElement('div');
  photoCol.className = 'photo-column';

  // Foto principal
  var mainPhoto = document.createElement('div');
  mainPhoto.className = 'main-photo';
  photoCol.appendChild(mainPhoto);

  // Fotos secundarias (dos)
  var secondaryPhotos = document.createElement('div');
  secondaryPhotos.className = 'secondary-photos';
  photoCol.appendChild(secondaryPhotos);

  content.appendChild(photoCol);

  /* ============================================================
     Columna de información
     ============================================================ */
  var infoCol = document.createElement('div');
  infoCol.className = 'info-column';

  /* --- Nombre (h2 editorial) --- */
  var h2 = document.createElement('h2');
  h2.textContent = product.nombre;
  infoCol.appendChild(h2);

  /* --- Subtítulo (categoría) --- */
  var subtitle = document.createElement('p');
  subtitle.className = 'subtitle';
  subtitle.textContent = product.categoria;
  infoCol.appendChild(subtitle);

  /* --- Descripción --- */
  if (product.descripcion && product.descripcion.trim() !== '') {
    var desc = document.createElement('p');
    desc.className = 'description';
    desc.textContent = product.descripcion;
    infoCol.appendChild(desc);
  }

  /* --- Presentaciones (lista de precios) --- */
  if (product.presentaciones && product.presentaciones.length > 0) {
    var ul = document.createElement('ul');
    ul.className = 'presentaciones';

    product.presentaciones.forEach(function (pre) {
      var li = document.createElement('li');

      var parts = [];
      if (pre.tamaño) parts.push(pre.tamaño);
      if (pre.medida) parts.push('(' + pre.medida + ')');
      if (pre.rinde) parts.push('· ' + pre.rinde);
      li.textContent = parts.join(' ') + ' · ';

      var precio = document.createElement('strong');
      precio.textContent = pre.precio;
      li.appendChild(precio);

      ul.appendChild(li);
    });

    infoCol.appendChild(ul);
  }

  /* --- Botón WhatsApp (después de presentaciones, antes de conservación) --- */
  var waLink = document.createElement('a');
  waLink.className = 'whatsapp-link';
  waLink.href = makeWhatsAppUrl(product.nombre);
  waLink.target = '_blank';
  waLink.rel = 'noopener';
  waLink.textContent = 'Consultar';
  infoCol.appendChild(waLink);

  /* --- Conservación --- */
  if (product.conservacion && product.conservacion.trim() !== '') {
    var conserv = document.createElement('p');
    conserv.className = 'conservacion';
    conserv.textContent = product.conservacion;
    infoCol.appendChild(conserv);
  }

  /* --- Recomendación (opcional) --- */
  if (product.recomendacion && product.recomendacion.trim() !== '') {
    var rec = document.createElement('p');
    rec.className = 'recomendacion';
    rec.textContent = product.recomendacion;
    infoCol.appendChild(rec);
  }

  /* --- Observaciones --- */
  if (product.observaciones && product.observaciones.trim() !== '') {
    var obs = document.createElement('p');
    obs.className = 'observaciones';
    obs.textContent = product.observaciones;
    infoCol.appendChild(obs);
  }

  content.appendChild(infoCol);
  section.appendChild(content);

  /* ============================================================
     Carga asincrónica de imágenes
     ============================================================ */
  loadImages(product.carpeta_imagenes).then(function (images) {
    /* Foto principal */
    if (images.main) {
      var img = document.createElement('img');
      img.src = images.main;
      img.alt = product.nombre;
      img.loading = 'lazy';
      img.onload = function () {
        sendHeight();
      };
      mainPhoto.innerHTML = '';
      mainPhoto.appendChild(img);
    } else {
      var mainPlaceholder = document.createElement('div');
      mainPlaceholder.className = 'image-placeholder';
      mainPlaceholder.textContent = 'Sin imagen';
      mainPhoto.appendChild(mainPlaceholder);
    }

    /* Fotos secundarias */
    var secondaryUrls = [images.secondary, images.tertiary];
    secondaryUrls.forEach(function (url) {
      var slot = document.createElement('div');
      slot.className = 'secondary-slot';

      if (url) {
        var img = document.createElement('img');
        img.src = url;
        img.alt = product.nombre;
        img.loading = 'lazy';
        img.onload = function () {
          sendHeight();
        };
        slot.appendChild(img);
      } else {
        var placeholder = document.createElement('div');
        placeholder.className = 'image-placeholder';
        placeholder.textContent = 'Sin imagen';
        slot.appendChild(placeholder);
      }

      secondaryPhotos.appendChild(slot);
    });
  });

  return section;
}

/* ---------------------------------------------------------------
   loadImages — carga exactamente 3 imágenes con nombre fijo
   --------------------------------------------------------------- */

/**
 * Carga exactamente 3 imágenes (01, 02, 03) para una carpeta de
 * producto. Prueba extensión .jpg primero, luego .jpeg si falla.
 * Cachea los resultados en gImageCache.
 * @param {string} folder - Nombre de carpeta en img/
 * @returns {Promise<{main: string, secondary: string, tertiary: string}>}
 *   Rutas resueltas o string vacío por slot
 */
async function loadImages(folder) {
  // Cache hit
  if (gImageCache.has(folder)) {
    return gImageCache.get(folder);
  }

  var bases = ['01', '02', '03'];
  var exts = ['.jpg', '.jpeg'];
  var results = await Promise.all(bases.map(function (base) {
    return resolveImage(folder, base, exts);
  }));

  var cacheEntry = {
    main:     results[0] || '',
    secondary: results[1] || '',
    tertiary:  results[2] || ''
  };

  gImageCache.set(folder, cacheEntry);
  return cacheEntry;
}

/**
 * Prueba cada extensión en orden para una imagen y devuelve la
 * primera URL que carga exitosamente, o cadena vacía si ninguna.
 * Formato: img/{folder}-{base}{ext} (ej: img/torta-telma-01.jpeg)
 * @param {string} folder - Prefijo del producto (carpeta_imagenes)
 * @param {string} base - Número de imagen (01, 02, 03)
 * @param {string[]} exts - Extensiones a probar [.jpg, .jpeg]
 * @returns {Promise<string>} URL resuelta o cadena vacía
 */
async function resolveImage(folder, base, exts) {
  for (var i = 0; i < exts.length; i++) {
    var url = 'img/' + folder + '-' + base + exts[i];
    var ok = await imageIsLoadable(url);
    if (ok) return url;
  }
  return '';
}

/**
 * Verifica si una imagen puede cargarse (HTTP 200).
 * @param {string} url - URL de la imagen
 * @returns {Promise<boolean>}
 */
function imageIsLoadable(url) {
  return new Promise(function (resolve) {
    var img = new Image();
    img.onload = function () { resolve(true); };
    img.onerror = function () { resolve(false); };
    img.src = url;
  });
}

/* ---------------------------------------------------------------
   makeWhatsAppUrl — genera URL de wa.me
   --------------------------------------------------------------- */

/**
 * Construye la URL de WhatsApp con el mensaje predefinido.
 * @param {string} productName - Nombre del producto
 * @returns {string} URL completa de wa.me
 */
function makeWhatsAppUrl(productName) {
  var text = 'Hola, quiero consultar por: ' + productName;
  return 'https://wa.me/5491134285333?text=' + encodeURIComponent(text);
}

/* ---------------------------------------------------------------
   initResizeObserver — iFrame auto-sizing
   --------------------------------------------------------------- */

/**
 * Inicializa un ResizeObserver sobre document.body para
 * enviar la altura al padre vía postMessage con debounce de 300ms.
 * Si ResizeObserver no está disponible, usa MutationObserver.
 * Si no hay ventana padre, postMessage falla silenciosamente.
 */
function initResizeObserver() {
  // overflow:hidden evita scroll interno solo dentro del iframe
  if (window.self !== window.top) {
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
  }

  if (typeof ResizeObserver !== 'undefined') {
    var observer = new ResizeObserver(function () {
      clearTimeout(gResizeTimer);
      gResizeTimer = setTimeout(sendHeight, 300);
    });
    observer.observe(document.body);
  } else {
    // Fallback: MutationObserver para cambios en el DOM
    sendHeight();
    var fallbackObserver = new MutationObserver(function () {
      clearTimeout(gResizeTimer);
      gResizeTimer = setTimeout(sendHeight, 300);
    });
    fallbackObserver.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true
    });
  }
}

/* ---------------------------------------------------------------
   sendHeight — envía altura al iframe padre
   --------------------------------------------------------------- */

/**
 * Lee scrollHeight del documento y lo envía al padre
 * mediante postMessage. No arroja error si no hay padre.
 */
function sendHeight() {
  var height = document.documentElement.scrollHeight;
  try {
    window.parent.postMessage({ iframeHeight: height }, '*');
  } catch (_e) {
    // No hay ventana padre → falla silenciosamente (según espec)
  }
}

/* ---------------------------------------------------------------
   Arranque
   --------------------------------------------------------------- */

document.addEventListener('DOMContentLoaded', initCatalog);
