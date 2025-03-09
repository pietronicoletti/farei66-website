// Variabili globali
let isInSubfolder = false;
let basePath = '';

// Funzione principale all'avvio
document.addEventListener('DOMContentLoaded', function() {
  console.log('Inizializzazione del sito...');

  // Determina il percorso base
  const path = window.location.pathname;
  console.log('Pathname corrente:', path);
  
  isInSubfolder = path.includes('/pages/');
  console.log('Siamo in una sottocartella?', isInSubfolder);
  
  basePath = isInSubfolder ? '../' : './';
  console.log('Percorso base:', basePath);

  // Carica i componenti
  caricaComponenti();
  
  // Carica i dati degli eventi se siamo nella homepage
  if (!isInSubfolder) {
    caricaEventiHome();
  }
  
  // Attiva le animazioni delle statistiche
  inizializzaAnimazioniStats();
  
  // Inizializza altri componenti interattivi
  inizializzaSmoothScroll();
});

// Funzione per caricare componenti comuni (header e footer)
async function caricaComponenti() {
  try {
    // Carica l'header
    const headerContainer = document.getElementById('header-container');
    if (headerContainer) {
      console.log('Caricamento header...');
      const headerResponse = await fetch(`${basePath}components/header.html`);
      
      if (headerResponse.ok) {
        const headerHtml = await headerResponse.text();
        headerContainer.innerHTML = headerHtml;
        
        // Correggi i percorsi nell'header in base alla posizione
        correggiPercorsiNelDOM('#header-container');
        
        // Imposta il link attivo nella navigazione
        impostaLinkAttivo();
        
        // Inizializza il menu mobile
        inizializzaMenuMobile();
      } else {
        console.error('Errore nel caricamento header:', headerResponse.status);
      }
    }
    
    // Carica il footer
    const footerContainer = document.getElementById('footer-container');
    if (footerContainer) {
      console.log('Caricamento footer...');
      const footerResponse = await fetch(`${basePath}components/footer.html`);
      
      if (footerResponse.ok) {
        const footerHtml = await footerResponse.text();
        footerContainer.innerHTML = footerHtml;
        
        // Correggi i percorsi nel footer in base alla posizione
        correggiPercorsiNelDOM('#footer-container');
        
        // Aggiorna l'anno corrente nel copyright
        document.getElementById('current-year').textContent = new Date().getFullYear();
        
        // Carica i dati di contatto
        await caricaContatti();
      } else {
        console.error('Errore nel caricamento footer:', footerResponse.status);
      }
    }
  } catch (error) {
    console.error('Errore nel caricamento componenti:', error);
  }
}

// Corregge i percorsi nel DOM in base alla posizione (root o sottocartella)
function correggiPercorsiNelDOM(selector) {
  if (isInSubfolder) {
    // Se siamo in una sottocartella, aggiungi '../' ai percorsi che non ce l'hanno
    document.querySelectorAll(`${selector} a[href^="pages/"]`).forEach(el => {
      el.href = el.href.replace('pages/', '../pages/');
    });
    
    document.querySelectorAll(`${selector} a[href="index.html"]`).forEach(el => {
      el.href = '../index.html';
    });
    
    document.querySelectorAll(`${selector} img[src^="images/"]`).forEach(el => {
      el.src = el.src.replace('images/', '../images/');
    });
  } else {
    // Se siamo nella root, rimuovi '../' dai percorsi
    document.querySelectorAll(`${selector} a[href^="../"]`).forEach(el => {
      el.href = el.href.replace('../', './');
    });
    
    document.querySelectorAll(`${selector} img[src^="../"]`).forEach(el => {
      el.src = el.src.replace('../', './');
    });
  }
}

// Imposta il link attivo nella navigazione
function impostaLinkAttivo() {
  // Ottieni il nome della pagina corrente
  const path = window.location.pathname;
  let paginaCorrente;
  
  if (isInSubfolder) {
    // Se siamo in una sottocartella
    paginaCorrente = path.split('/').pop().replace('.html', '');
  } else {
    // Se siamo nella root
    paginaCorrente = path.split('/').pop().replace('.html', '') || 'index';
  }
  
  // Imposta la classe 'active' sul link corrispondente
  document.querySelectorAll('.nav-link').forEach(link => {
    link.classList.remove('active');
  });
  
  const linkAttivo = document.querySelector(`.nav-link[data-page="${paginaCorrente}"]`);
  if (linkAttivo) {
    linkAttivo.classList.add('active');
  }
}

// Inizializza il menu mobile
function inizializzaMenuMobile() {
  const mobileMenu = document.querySelector('.mobile-menu');
  const nav = document.querySelector('nav');
  
  if (mobileMenu && nav) {
    // Event listener per il pulsante hamburger
    mobileMenu.addEventListener('click', function(e) {
      e.stopPropagation(); // Previene che l'evento si propaghi al documento
      nav.classList.toggle('active');
    });
    
    // Event listener per chiudere il menu quando si clicca fuori
    document.addEventListener('click', function(e) {
      // Verifica se il menu è aperto e se il clic non è sul menu stesso
      if (nav.classList.contains('active') && !nav.contains(e.target) && e.target !== mobileMenu) {
        nav.classList.remove('active');
      }
    });
    
    // Previene che i clic all'interno del menu lo chiudano
    nav.addEventListener('click', function(e) {
      // Permettiamo che i clic sui link chiudano il menu, ma non altri clic
      if (!e.target.closest('a')) {
        e.stopPropagation();
      }
    });
  }
}

// Carica i dati di contatto dal JSON
async function caricaContatti() {
  try {
    const response = await fetch(`${basePath}data/contatti.json`);
    if (!response.ok) {
      throw new Error(`Errore nel caricamento contatti: ${response.status}`);
    }
    
    const dati = await response.json();
    
    // Aggiorna i contatti nel footer
    document.querySelectorAll('.contact-address').forEach(el => {
      el.textContent = dati.indirizzo;
    });
    
    document.querySelectorAll('.contact-email').forEach(el => {
      el.textContent = dati.email;
      if (el.tagName === 'A') {
        el.href = `mailto:${dati.email}`;
      }
    });
    
    document.querySelectorAll('.contact-phone').forEach(el => {
      el.textContent = dati.telefono;
      if (el.tagName === 'A') {
        el.href = `tel:${dati.telefono.replace(/\s/g, '')}`;
      }
    });
    
    // Aggiorna i link social
    if (dati.social?.facebook) {
      document.querySelectorAll('.social-facebook').forEach(el => {
        el.href = dati.social.facebook;
      });
    }
    
    if (dati.social?.instagram) {
      document.querySelectorAll('.social-instagram').forEach(el => {
        el.href = dati.social.instagram;
      });
    }
    
    if (dati.social?.tiktok) {
      document.querySelectorAll('.social-tiktok').forEach(el => {
        el.href = dati.social.tiktok;
      });
    }
    
  } catch (error) {
    console.error('Errore nel caricamento dei contatti:', error);
  }
}

// Carica gli eventi nella homepage
async function caricaEventiHome() {
  try {
    // Carica eventi futuri
    const eventiContainer = document.querySelector('.events-container');
    if (eventiContainer) {
      const response = await fetch(`${basePath}data/eventi.json`);
      if (!response.ok) {
        throw new Error(`Errore nel caricamento eventi: ${response.status}`);
      }
      
      const dati = await response.json();
      
      // Mostra i primi 3 eventi futuri
      const eventiDaVisualizzare = dati.eventi_futuri.slice(0, 6);
      
      eventiContainer.innerHTML = '';
      
      eventiDaVisualizzare.forEach(evento => {
        const eventoHtml = `
          <div class="event-card">
            <div class="event-image" style="background-image: url('${evento.immagine}');"></div>
            <div class="event-details">
              <span class="event-date">${evento.data}</span>
              <h3 class="event-title">${evento.titolo}</h3>
              <p class="event-description">${evento.descrizione}</p>
              <a href="${evento.link_biglietti}" class="event-link">Acquista Biglietti →</a>
            </div>
          </div>
        `;
        
        eventiContainer.innerHTML += eventoHtml;
      });
    }
    
    // Carica eventi passati per la galleria
    const galleryContainer = document.querySelector('.gallery-container');
    if (galleryContainer) {
      const response = await fetch(`../data/eventi-passati.json`);
      if (!response.ok) {
        throw new Error(`Errore nel caricamento eventi passati: ${response.status}`);
      }
      
      const dati = await response.json();
      
      // Mostra i primi 4 eventi passati
      const eventiDaVisualizzare = dati.eventi_passati.slice(0, 4);
      
      galleryContainer.innerHTML = '';
      
      eventiDaVisualizzare.forEach(evento => {
        const eventoHtml = `
          <div class="gallery-item">
            <img src="${evento.immagine}" alt="${evento.titolo}" class="gallery-image">
            <div class="gallery-overlay">
              <h3 class="gallery-title">${evento.titolo}</h3>
              <p class="gallery-date">${evento.data}</p>
              <a href="${evento.galleria}" class="gallery-link">Vedi Galleria</a>
            </div>
          </div>
        `;
        
        galleryContainer.innerHTML += eventoHtml;
      });
    }
    
  } catch (error) {
    console.error('Errore nel caricamento degli eventi:', error);
  }
}

// Inizializza le animazioni delle statistiche
function inizializzaAnimazioniStats() {
  const statNumbers = document.querySelectorAll('.stat-number');
  
  if (statNumbers.length > 0) {
    // Funzione per animare i numeri
    function animateStats() {
      statNumbers.forEach(stat => {
        const target = parseInt(stat.getAttribute('data-count'));
        const duration = 2000; // 2 secondi
        const step = target / (duration / 16); // 16ms è circa 1 frame a 60fps
        let current = 0;
        
        const counter = setInterval(() => {
          current += step;
          if (current >= target) {
            clearInterval(counter);
            current = target;
          }
          stat.textContent = Math.floor(current);
        }, 16);
      });
    }
    
    // Funzione per verificare se un elemento è visibile nella viewport
    function isInViewport(element) {
      const rect = element.getBoundingClientRect();
      return (
        rect.top >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight)
      );
    }
    
    // Verifica se le statistiche sono visibili e avvia l'animazione
    function checkStatsVisibility() {
      const statsContainer = document.querySelector('.stats-container');
      if (statsContainer && isInViewport(statsContainer)) {
        animateStats();
        window.removeEventListener('scroll', checkStatsVisibility);
      }
    }
    
    window.addEventListener('scroll', checkStatsVisibility);
    // Verifica anche al caricamento della pagina
    setTimeout(checkStatsVisibility, 500);
  }
}

// Aggiorna la funzione di inizializzazione del scroll fluido nel main.js
function inizializzaSmoothScroll() {
  // Seleziona tutti i link interni che puntano a un ID
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      // Previeni il comportamento predefinito del link
      e.preventDefault();
      
      // Ottieni l'ID target dal href
      const targetId = this.getAttribute('href');
      
      // Se l'href è solo "#", scrolliamo all'inizio della pagina
      if (targetId === '#') {
        window.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
        return;
      }
      
      // Trova l'elemento target
      const targetElement = document.querySelector(targetId);
      
      // Se l'elemento esiste, scorri ad esso
      if (targetElement) {
        // Calcola l'offset per tenere conto dell'header fisso
        const headerHeight = document.querySelector('header').offsetHeight;
        const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - headerHeight;
        
        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
        
        // Chiudi il menu mobile se aperto
        const nav = document.querySelector('nav');
        if (nav.classList.contains('active')) {
          nav.classList.remove('active');
        }
      }
    });
  });
}

// Funzione per evidenziare il link di navigazione attivo durante lo scroll
function highlightNavOnScroll() {
  // Ottieni tutte le sezioni
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');
  
  // Aggiungi event listener per lo scroll
  window.addEventListener('scroll', function() {
    // Ottieni la posizione attuale dello scroll
    let currentPos = window.scrollY;
    
    // Ottieni l'altezza dell'header per l'offset
    const headerHeight = document.querySelector('header').offsetHeight;
    
    // Controlla quale sezione è attualmente visibile
    sections.forEach(section => {
      const sectionTop = section.offsetTop - headerHeight - 100; // Un po' di margine
      const sectionHeight = section.offsetHeight;
      const sectionId = section.getAttribute('id');
      
      if(currentPos >= sectionTop && currentPos < sectionTop + sectionHeight) {
        // Rimuovi la classe 'active' da tutti i link
        navLinks.forEach(link => {
          link.classList.remove('active');
        });
        
        // Aggiungi la classe 'active' al link corrispondente
        const activeLink = document.querySelector(`.nav-link[href="#${sectionId}"]`);
        if (activeLink) {
          activeLink.classList.add('active');
        }
      }
    });
    
    // Se siamo all'inizio della pagina, attiva il link Home
    if (currentPos < 100) {
      navLinks.forEach(link => {
        link.classList.remove('active');
      });
      document.querySelector('.nav-link[href="#"]').classList.add('active');
    }
  });
}

// Aggiungi la chiamata alla funzione nel DOMContentLoaded
document.addEventListener('DOMContentLoaded', function() {
  caricaComponenti();
  caricaEventiHome();
  inizializzaAnimazioniStats();
  inizializzaSmoothScroll();
  highlightNavOnScroll();  // Aggiungi questa riga
});