// EDITE AQUI: numero do WhatsApp com codigo do Brasil (55) + DDD + numero.
// Exemplo: 5522992164903 significa +55 (22) 99216-4903.
const whatsappNumber = "5522992164903";

const encodeMessage = (text) => encodeURIComponent(text.trim());

// Cria automaticamente os links de WhatsApp nos botoes com data-whatsapp.
// Para mudar a mensagem de um botao, edite o atributo data-intent no index.html.
document.querySelectorAll("[data-whatsapp]").forEach((link) => {
  const message = link.dataset.intent || "Olá, Alessandro! Quero vender mais online com a Néctar Ambitionz.";
  link.href = `https://wa.me/${whatsappNumber}?text=${encodeMessage(message)}`;
  link.target = "_blank";
  link.rel = "noreferrer";
});

const navToggle = document.querySelector("[data-nav-toggle]");
const nav = document.querySelector("[data-nav]");

// Menu mobile: abre e fecha quando o cliente toca no icone de menu.
if (navToggle && nav) {
  navToggle.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("is-open");
    document.body.classList.toggle("menu-open", isOpen);
    navToggle.setAttribute("aria-expanded", String(isOpen));
    navToggle.setAttribute("aria-label", isOpen ? "Fechar menu" : "Abrir menu");
  });

  nav.querySelectorAll("a").forEach((item) => {
    item.addEventListener("click", () => {
      nav.classList.remove("is-open");
      document.body.classList.remove("menu-open");
      navToggle.setAttribute("aria-expanded", "false");
      navToggle.setAttribute("aria-label", "Abrir menu");
    });
  });
}

const revealItems = document.querySelectorAll(".reveal");
const mobileWhatsappCta = document.querySelector(".mobile-whatsapp-cta");

// Animacao simples para os blocos aparecerem quando entram na tela.
if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );

  revealItems.forEach((item) => observer.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add("is-visible"));
}

// Mostra o botao fixo do WhatsApp no mobile depois que a pessoa rola um pouco a pagina.
// Assim ele ajuda na conversao sem duplicar o botao principal logo no topo.
if (mobileWhatsappCta) {
  const toggleMobileCta = () => {
    mobileWhatsappCta.classList.toggle("is-visible", window.scrollY > 520);
  };

  toggleMobileCta();
  window.addEventListener("scroll", toggleMobileCta, { passive: true });
}

const canvas = document.getElementById("constellation");
const ctx = canvas?.getContext("2d");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const pointer = { x: 0, y: 0, active: false };
let stars = [];
let width = 0;
let height = 0;
let animationFrame = null;

function randomBetween(min, max) {
  return Math.random() * (max - min) + min;
}

function resizeCanvas() {
  if (!canvas || !ctx) return;

  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  width = window.innerWidth;
  height = window.innerHeight;
  canvas.width = Math.floor(width * ratio);
  canvas.height = Math.floor(height * ratio);
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);

  // EDITE AQUI: quantidade de estrelas. A conta abaixo adapta para desktop e mobile.
  const starCount = Math.min(110, Math.max(48, Math.floor((width * height) / 16000)));
  stars = Array.from({ length: starCount }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    vx: randomBetween(-0.18, 0.18),
    vy: randomBetween(-0.16, 0.16),
    radius: randomBetween(0.8, 2.1),
    pulse: randomBetween(0, Math.PI * 2),
  }));
}

function drawConstellation() {
  if (!canvas || !ctx) return;

  ctx.clearRect(0, 0, width, height);

  // EDITE AQUI: distancia das linhas entre estrelas e interacao do mouse/dedo.
  const maxDistance = width < 700 ? 92 : 132;
  const pointerDistance = width < 700 ? 118 : 165;

  stars.forEach((star) => {
    if (!reducedMotion) {
      star.x += star.vx;
      star.y += star.vy;
      star.pulse += 0.02;
    }

    if (star.x < -20) star.x = width + 20;
    if (star.x > width + 20) star.x = -20;
    if (star.y < -20) star.y = height + 20;
    if (star.y > height + 20) star.y = -20;

    if (pointer.active) {
      const dx = pointer.x - star.x;
      const dy = pointer.y - star.y;
      const distance = Math.hypot(dx, dy);

      if (distance < pointerDistance && distance > 0) {
        const force = (pointerDistance - distance) / pointerDistance;
        star.x -= (dx / distance) * force * 0.55;
        star.y -= (dy / distance) * force * 0.55;

        ctx.beginPath();
        ctx.moveTo(star.x, star.y);
        ctx.lineTo(pointer.x, pointer.y);
        ctx.strokeStyle = `rgba(104, 240, 216, ${0.22 * force})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    }
  });

  for (let i = 0; i < stars.length; i += 1) {
    for (let j = i + 1; j < stars.length; j += 1) {
      const first = stars[i];
      const second = stars[j];
      const distance = Math.hypot(first.x - second.x, first.y - second.y);

      if (distance < maxDistance) {
        const opacity = 1 - distance / maxDistance;
        ctx.beginPath();
        ctx.moveTo(first.x, first.y);
        ctx.lineTo(second.x, second.y);
        ctx.strokeStyle = `rgba(66, 199, 255, ${0.18 * opacity})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    }
  }

  stars.forEach((star) => {
    const glow = 0.55 + Math.sin(star.pulse) * 0.22;
    ctx.beginPath();
    ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(220, 245, 255, ${glow})`;
    ctx.fill();
  });

  if (!reducedMotion) {
    animationFrame = requestAnimationFrame(drawConstellation);
  }
}

if (canvas && ctx) {
  // Inicia a animacao das constelacoes e atualiza quando a tela muda de tamanho.
  resizeCanvas();
  drawConstellation();

  window.addEventListener("resize", () => {
    cancelAnimationFrame(animationFrame);
    resizeCanvas();
    drawConstellation();
  });

  window.addEventListener("pointermove", (event) => {
    pointer.x = event.clientX;
    pointer.y = event.clientY;
    pointer.active = true;
  });

  window.addEventListener("pointerleave", () => {
    pointer.active = false;
  });

  window.addEventListener(
    "touchmove",
    (event) => {
      const touch = event.touches[0];
      if (!touch) return;
      pointer.x = touch.clientX;
      pointer.y = touch.clientY;
      pointer.active = true;
    },
    { passive: true }
  );
}
