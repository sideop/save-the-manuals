document.addEventListener("DOMContentLoaded", () => {
  const createTimelineChart = () => window.createTimelineChart?.();
  const createComebackChart = () => window.createComebackChart?.();

  createTimelineChart();
  createComebackChart();

  const setupScrollAnimations = () => {
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const target = entry.target;

            if (target.id === "timeline-section") {
              window.animateTimelineChart?.();
            } else if (target.id === "comeback-section") {
              window.animateComebackChart?.();
            }

            const fadeElements = target.querySelectorAll(".fade-in");
            fadeElements.forEach((el, index) => {
              setTimeout(() => {
                el.classList.add("visible");
              }, index * 200);
            });
          }
        });
      },
      { threshold: 0.5 }
    );

    document.querySelectorAll(".scroll-trigger").forEach((el) => {
      observer.observe(el);
    });

    const animatedElements = document.querySelectorAll(
      ".section-title, .section-description, .timeline-points, .subsection-title, .growth-stats, .big-stat, .reasons-grid"
    );
    animatedElements.forEach((el) => {
      el.classList.add("fade-in");
    });
  };

  const setupBackgroundTransitions = () => {
    const sections = document.querySelectorAll('section');
    
    window.addEventListener('scroll', () => {
      const scrolled = window.pageYOffset;
      const windowHeight = window.innerHeight;
      
      sections.forEach((section, index) => {
        const rect = section.getBoundingClientRect();
        const sectionTop = rect.top;
        
        const visibleRatio = Math.max(0, Math.min(1, 
          (windowHeight - sectionTop) / windowHeight
        ));
        
        const beforeElement = section.querySelector('::before');
        if (beforeElement) {
          const translateY = visibleRatio * 20; 
          beforeElement.style.transform = `translateY(${translateY}px)`;
        }
      });
    });
  };

  setupScrollAnimations();
  setupBackgroundTransitions();

  let resizeTimeout;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      createTimelineChart();
      createComebackChart();
    }, 250);
  });
});

document.addEventListener("click", (e) => {
  if (e.target.matches('a[href^="#"]')) {
    e.preventDefault();
    const target = document.querySelector(e.target.getAttribute("href"));
    if (target) {
      target.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }
});