// Menu Mobile
const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');

if(hamburger) {
    hamburger.addEventListener('click', () => {
        navLinks.classList.toggle('nav-active');
        hamburger.classList.toggle('toggle');
    });
}

// Fechar menu ao clicar em um link
document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
        if(navLinks.classList.contains('nav-active')) {
            navLinks.classList.remove('nav-active');
            hamburger.classList.remove('toggle');
        }
    });
});

// Animação de Scroll (Intersection Observer)
const observerOptions = {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px"
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('active');
            // Não desativa o observer para permitir reanimação ao rolar
        }
    });
}, observerOptions);

// Selecionar elementos para animar
document.addEventListener("DOMContentLoaded", () => {
    const animatedElements = document.querySelectorAll('.fade-up, .reveal-left, .reveal-right, .reveal-bottom');
    animatedElements.forEach(el => observer.observe(el));
});

// Navbar muda de estilo ao rolar
window.addEventListener('scroll', () => {
    const nav = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        nav.style.boxShadow = "0 4px 20px rgba(0,0,0,0.12)";
        nav.style.padding = "8px 0";
    } else {
        nav.style.boxShadow = "0 2px 15px rgba(0,0,0,0.05)";
        nav.style.padding = "12px 0";
    }
});

// FAQ Accordion
document.addEventListener('DOMContentLoaded', () => {
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        
        question.addEventListener('click', () => {
            // Fecha outros itens
            faqItems.forEach(otherItem => {
                if (otherItem !== item && otherItem.classList.contains('active')) {
                    otherItem.classList.remove('active');
                }
            });
            
            // Toggle item atual
            item.classList.toggle('active');
        });
    });
});

// Smooth scroll com offset para compensar navbar fixa
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        
        if (targetId === '#') return;
        
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
            const navbarHeight = document.querySelector('.navbar').offsetHeight + 44; // navbar + urgency bar
            const targetPosition = targetElement.offsetTop - navbarHeight;
            
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    });
});

// Animação de números (contador)
const animateCounter = (element, target, duration = 2000) => {
    let start = 0;
    const increment = target / (duration / 16);
    
    const timer = setInterval(() => {
        start += increment;
        if (start >= target) {
            element.textContent = target.toLocaleString('pt-BR');
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(start).toLocaleString('pt-BR');
        }
    }, 16);
};

// Observar estatísticas do hero para animar
const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const statNumbers = entry.target.querySelectorAll('.stat-number');
            statNumbers.forEach(stat => {
                const text = stat.textContent;
                const number = parseInt(text.replace(/\D/g, ''));
                if (number && !stat.classList.contains('animated')) {
                    stat.classList.add('animated');
                    // Mantém o formato original (ex: "2.500+")
                    if (text.includes('+')) {
                        animateCounter(stat, number, 2000);
                        setTimeout(() => {
                            stat.textContent = number.toLocaleString('pt-BR') + '+';
                        }, 2000);
                    } else if (text.includes('★')) {
                        // Para avaliação, mantém o formato
                        stat.textContent = text;
                    } else {
                        animateCounter(stat, number, 2000);
                        setTimeout(() => {
                            stat.textContent = number + '+';
                        }, 2000);
                    }
                }
            });
            statsObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.5 });

document.addEventListener('DOMContentLoaded', () => {
    const heroStats = document.querySelector('.hero-stats');
    if (heroStats) {
        statsObserver.observe(heroStats);
    }
});

// Adicionar efeito de paralaxe suave ao hero
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const hero = document.querySelector('.hero');
    if (hero && scrolled < hero.offsetHeight) {
        hero.style.backgroundPositionY = scrolled * 0.5 + 'px';
    }
});

// Mostrar/ocultar botão WhatsApp baseado no scroll
const whatsappFloat = document.querySelector('.whatsapp-float');
let lastScrollTop = 0;

window.addEventListener('scroll', () => {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    
    if (scrollTop > 300) {
        whatsappFloat.style.opacity = '1';
        whatsappFloat.style.visibility = 'visible';
    } else {
        whatsappFloat.style.opacity = '0';
        whatsappFloat.style.visibility = 'hidden';
    }
    
    lastScrollTop = scrollTop;
});

// Inicializar botão WhatsApp oculto
if (whatsappFloat) {
    whatsappFloat.style.transition = 'opacity 0.3s, visibility 0.3s';
    whatsappFloat.style.opacity = '0';
    whatsappFloat.style.visibility = 'hidden';
}

// Adicionar evento de clique para tracking (opcional - analytics)
document.querySelectorAll('a[href*="wa.me"]').forEach(link => {
    link.addEventListener('click', function() {
        // Aqui você pode adicionar código para tracking com Google Analytics
        console.log('WhatsApp clicked:', this.textContent);
    });
});

// Prevenir FOUC (Flash of Unstyled Content)
document.addEventListener('DOMContentLoaded', () => {
    document.body.style.visibility = 'visible';
});
