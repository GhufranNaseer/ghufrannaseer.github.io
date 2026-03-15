// Application State
let state = {
  currentRole: 0,
  typedText: '',
  mobileMenuOpen: false,
  selectedProject: null,
  isModalOpen: false
};

// Data
const roles = [
  "Full Stack Developer",
  "WordPress Expert", 
  "AI Integration Specialist",
  "BSCS Graduate"
];

const projects = [
  {
    id: 1,
    title: "Enterprise CRM System",
    description: "Full-featured CRM with lead management, B2B meeting scheduler, analytics dashboard, and team collaboration tools.",
    image: "https://images.unsplash.com/photo-1551434678-e076c223a692?fm=webp&fit=crop&w=400&h=250&q=60",
    tech: ["React.js", "Node.js", "PostgreSQL", "Chart.js"],
    category: "Web Application",
    features: ["Lead Management System", "B2B Meeting Scheduler", "Analytics Dashboard", "Team Collaboration Tools", "Real-time Data Sync"]
  },
  {
    id: 2,
    title: "WordPress Business Website",
    description: "Professional WordPress site with Elementor Pro, SEO optimization, custom themes, and mobile-responsive design.",
    image: "https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?fm=webp&fit=crop&w=400&h=250&q=60",
    tech: ["WordPress", "Elementor Pro", "PHP", "MySQL"],
    category: "WordPress",
    features: ["SEO Optimization", "Custom Theme Design", "Mobile Responsive Layout", "Elementor Pro Integration", "Performance Optimization"]
  },
  {
    id: 3,
    title: "AI Q&A Chatbot",
    description: "Intelligent chatbot with OpenRouter DeepSeek AI integration, clean desktop UI using Tkinter, and natural language processing.",
    image: "https://images.unsplash.com/photo-1531482615713-2afd69097998?fm=webp&fit=crop&w=400&h=250&q=60",
    tech: ["Python", "Tkinter", "OpenRouter API", "AI/ML"],
    category: "AI Solution",
    features: ["Natural Language Processing", "Contextual Understanding", "Real-time AI Responses", "Clean Desktop Interface", "OpenRouter Integration"]
  },
  {
    id: 4,
    title: "Employee Management System",
    description: "Comprehensive EMS with attendance tracking, performance analytics, HR management, and administrative hierarchy features.",
    image: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?fm=webp&fit=crop&w=400&h=250&q=60",
    tech: ["React.js", "Node.js", "PostgreSQL", "Redux"],
    category: "Enterprise System",
    features: ["Attendance Tracking", "Performance Analytics", "HR Management", "Administrative Hierarchy", "Employee Dashboard"]
  },
  {
    id: 5,
    title: "Hotel Booking Platform",
    description: "Modern hotel reservation system with room management, booking calendar, payment integration, and guest management features.",
    image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?fm=webp&fit=crop&w=400&h=250&q=60",
    tech: ["React.js", "Express.js", "MongoDB", "Stripe API"],
    category: "Web Application",
    features: ["Room Management System", "Booking Calendar", "Payment Integration", "Guest Management", "Real-time Availability"]
  },
  {
    id: 6,
    title: "E-commerce Web App",
    description: "Full-stack e-commerce platform with product catalog, shopping cart, payment processing, and admin dashboard.",
    image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?fm=webp&fit=crop&w=400&h=250&q=60",
    tech: ["React.js", "Node.js", "PostgreSQL", "PayPal API"],
    category: "E-commerce",
    features: ["Product Catalog Management", "Shopping Cart System", "Payment Processing", "Admin Dashboard", "Order Management"]
  }
];

const services = [
  {
    title: "CRM Development",
    icon: "database",
    desc: "Custom CRM solutions with B2B meetings, analytics dashboards, and team collaboration features.",
    features: ["Lead Management", "B2B Meetings", "Analytics Dashboard", "Team Collaboration"],
    price: "$2,500+",
    timeline: "3-4 weeks"
  },
  {
    title: "WordPress Development",
    icon: "globe",
    desc: "Professional WordPress websites with Elementor Pro, custom themes, and SEO optimization.",
    features: ["Elementor Pro", "SEO Optimization", "Custom Themes", "Mobile Responsive"],
    price: "$800+",
    timeline: "1-2 weeks"
  },
  {
    title: "EMS Solutions",
    icon: "settings",
    desc: "Employee Management Systems with attendance tracking, performance analytics, and HR features.",
    features: ["Attendance Tracking", "Performance Analytics", "HR Management", "Admin Hierarchy"],
    price: "$4,000+",
    timeline: "5-6 weeks"
  },
  {
    title: "Web Applications",
    icon: "code",
    desc: "Modern web applications built with React.js, Node.js, and PostgreSQL for real-time features.",
    features: ["React.js/Node.js", "PostgreSQL Database", "Real-time Features", "API Integration"],
    price: "$2,000+",
    timeline: "2-3 weeks"
  },
  {
    title: "AI Integration",
    icon: "bot",
    desc: "AI-powered solutions including chatbots with OpenRouter DeepSeek AI, OCR, and automation.",
    features: ["ChatBot Development", "OCR Solutions", "AI Automation", "OpenRouter Integration"],
    price: "$1,500+",
    timeline: "2-3 weeks"
  },
  {
    title: "Mobile Development",
    icon: "smartphone",
    desc: "Cross-platform mobile applications using Flutter and React Native for iOS and Android.",
    features: ["Flutter Development", "React Native", "Cross-Platform", "Mobile-First Design"],
    price: "$3,000+",
    timeline: "4-6 weeks"
  }
];

const skills = [
  { name: "React.js", level: 95, color: "bg-blue-500" },
  { name: "JavaScript", level: 92, color: "bg-yellow-500" },
  { name: "WordPress", level: 90, color: "bg-indigo-500" },
  { name: "Node.js", level: 88, color: "bg-emerald-500" },
  { name: "PostgreSQL", level: 85, color: "bg-green-500" },
  { name: "Python", level: 82, color: "bg-red-500" },
  { name: "AI/ML", level: 78, color: "bg-purple-500" },
  { name: "UI/UX", level: 85, color: "bg-pink-500" }
];

const testimonials = [
  {
    name: "Badar Expo",
    role: "Client - EMS/CRM Project",
    text: "Ghufran delivered an exceptional EMS/CRM system with exhibitor dashboard, B2B meetings, and performance analytics. Professional work with timely delivery and excellent client communication.",
    rating: 5,
    company: "Badar Expo"
  },
  {
    name: "SEO Client",
    role: "WordPress Project Manager",
    text: "The WordPress website with Elementor Pro significantly improved our online visibility. Excellent SEO optimization, page speed enhancement, and mobile-first design approach.",
    rating: 5,
    company: "Digital Marketing Agency"
  },
  {
    name: "University Supervisor",
    role: "Academic Project Evaluator",
    text: "Built a fully functional Q/A chatbot with OpenRouter DeepSeek AI integration. Clean desktop UI with Tkinter and seamless user experience. Impressive technical implementation.",
    rating: 5,
    company: "Iqra University"
  }
];

// EmailJS Configuration
const EMAILJS_CONFIG = {
  SERVICE_ID: 'service_53j7hqq',
  TEMPLATE_CONTACT_ID: 'template_x59a079',
  TEMPLATE_AUTOREPLY_ID: 'template_jiuuei9',
  PUBLIC_KEY: 'LWPy0M60E6P9nACN0'
};

// Utility Functions
function createElement(tag, className = '', content = '') {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (content) element.innerHTML = content;
  return element;
}

function createIcon(iconName, size = 24) {
  const icon = document.createElement('i');
  icon.setAttribute('data-lucide', iconName);
  icon.style.width = `${size}px`;
  icon.style.height = `${size}px`;
  return icon;
}

// Theme Management
function initTheme() {
  const savedTheme = localStorage.getItem('theme') || 'light';
  document.body.className = `${savedTheme}-theme`;
  
  const themeToggles = document.querySelectorAll('.theme-toggle');
  themeToggles.forEach(toggle => {
    toggle.addEventListener('click', toggleTheme);
  });
}

function toggleTheme() {
  const currentTheme = document.body.classList.contains('dark-theme') ? 'dark' : 'light';
  const newTheme = currentTheme === 'light' ? 'dark' : 'light';
  
  document.body.className = `${newTheme}-theme`;
  localStorage.setItem('theme', newTheme);
}

// Mobile Menu Management
function initMobileMenu() {
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');
  const mobileNavLinks = document.querySelectorAll('#mobile-menu a');
  
  mobileMenuBtn.addEventListener('click', toggleMobileMenu);
  
  mobileNavLinks.forEach(link => {
    link.addEventListener('click', () => {
      closeMobileMenu();
    });
  });
  
  // Close menu when clicking outside
  document.addEventListener('click', (e) => {
    if (!mobileMenuBtn.contains(e.target) && !mobileMenu.contains(e.target)) {
      closeMobileMenu();
    }
  });
}

function toggleMobileMenu() {
  state.mobileMenuOpen = !state.mobileMenuOpen;
  const mobileMenu = document.getElementById('mobile-menu');
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  
  if (state.mobileMenuOpen) {
    mobileMenu.classList.add('active');
    mobileMenuBtn.classList.add('active');
  } else {
    mobileMenu.classList.remove('active');
    mobileMenuBtn.classList.remove('active');
  }
}

function closeMobileMenu() {
  state.mobileMenuOpen = false;
  const mobileMenu = document.getElementById('mobile-menu');
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  
  mobileMenu.classList.remove('active');
  mobileMenuBtn.classList.remove('active');
}

// Typewriter Effect
function initTypewriter() {
  const typewriterElement = document.getElementById('typewriter-text');
  
  function typewriterEffect() {
    const currentText = roles[state.currentRole];
    
    if (state.typedText.length < currentText.length) {
      state.typedText = currentText.slice(0, state.typedText.length + 1);
      typewriterElement.textContent = state.typedText;
      setTimeout(typewriterEffect, 100);
    } else {
      setTimeout(() => {
        state.typedText = '';
        state.currentRole = (state.currentRole + 1) % roles.length;
        typewriterElement.textContent = '';
        setTimeout(typewriterEffect, 100);
      }, 2000);
    }
  }
  
  typewriterEffect();
}

// Smooth Scrolling
function initSmoothScrolling() {
  const navLinks = document.querySelectorAll('a[href^="#"]');
  
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = link.getAttribute('href');
      const targetElement = document.querySelector(targetId);
      
      if (targetElement) {
        targetElement.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });
}

// Intersection Observer for Animations
function initScrollAnimations() {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
  if (prefersReducedMotion) {
    const sections = document.querySelectorAll('.animate-section');
    sections.forEach(section => {
      section.style.opacity = '1';
      section.style.transform = 'none';
    });
    return;
  }

  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const element = entry.target;
        element.style.opacity = '1';
        element.style.transform = 'translateY(0)';
        element.classList.add('animate-on-scroll');
        
        // Animate skill progress bars
        if (element.id === 'about') {
          animateSkillBars();
        }
      }
    });
  }, observerOptions);

  const sections = document.querySelectorAll('.animate-section');
  sections.forEach(section => observer.observe(section));
}

// Services Section
function renderServices() {
  const servicesGrid = document.querySelector('.services-grid');
  
  services.forEach((service, index) => {
    const serviceCard = createElement('div', 'card service-card');
    serviceCard.setAttribute('data-testid', `service-card-${index}`);
    
    const cardContent = createElement('div', 'card-content');
    
    const serviceHeader = createElement('div', 'service-header');
    const serviceIcon = createElement('div', 'service-icon');
    serviceIcon.appendChild(createIcon(service.icon, 32));
    const serviceTitle = createElement('h3', 'service-title', service.title);
    serviceTitle.setAttribute('data-testid', `service-title-${index}`);
    
    serviceHeader.appendChild(serviceIcon);
    serviceHeader.appendChild(serviceTitle);
    
    const serviceDescription = createElement('p', 'service-description', service.desc);
    serviceDescription.setAttribute('data-testid', `service-description-${index}`);
    
    const serviceFeatures = createElement('ul', 'service-features');
    service.features.forEach((feature, idx) => {
      const li = createElement('li');
      li.setAttribute('data-testid', `service-feature-${index}-${idx}`);
      li.appendChild(createIcon('check-circle', 16));
      li.appendChild(document.createTextNode(feature));
      serviceFeatures.appendChild(li);
    });
    
    const serviceFooter = createElement('div', 'service-footer');
    const servicePrice = createElement('div', 'service-price', service.price);
    servicePrice.setAttribute('data-testid', `service-price-${index}`);
    const serviceTimeline = createElement('div', 'service-timeline', service.timeline);
    serviceTimeline.setAttribute('data-testid', `service-timeline-${index}`);
    
    serviceFooter.appendChild(servicePrice);
    serviceFooter.appendChild(serviceTimeline);
    
    const serviceButton = createElement('button', 'btn-primary', 'Get Started');
    serviceButton.setAttribute('data-testid', `service-button-${index}`);
    serviceButton.addEventListener('click', handleEmailContact);
    
    cardContent.appendChild(serviceHeader);
    cardContent.appendChild(serviceDescription);
    cardContent.appendChild(serviceFeatures);
    cardContent.appendChild(serviceFooter);
    cardContent.appendChild(serviceButton);
    
    serviceCard.appendChild(cardContent);
    servicesGrid.appendChild(serviceCard);
  });
}

// Skills Section
function renderSkills() {
  const skillsGrid = document.querySelector('.skills-grid');
  
  skills.forEach((skill, index) => {
    const skillItem = createElement('div', 'skill-item');
    skillItem.setAttribute('data-testid', `skill-${index}`);
    
    const skillHeader = createElement('div', 'skill-header');
    skillHeader.style.display = 'flex';
    skillHeader.style.justifyContent = 'space-between';
    
    const skillName = createElement('span', 'skill-name', skill.name);
    skillName.setAttribute('data-testid', `skill-name-${index}`);
    const skillLevel = createElement('span', 'skill-level', `${skill.level}%`);
    skillLevel.setAttribute('data-testid', `skill-level-${index}`);
    
    skillHeader.appendChild(skillName);
    skillHeader.appendChild(skillLevel);
    
    const progressBar = createElement('div', 'progress-bar');
    const progressFill = createElement('div', 'progress-fill');
    progressFill.setAttribute('data-level', skill.level);
    progressFill.setAttribute('data-testid', `skill-progress-${index}`);
    
    progressBar.appendChild(progressFill);
    
    skillItem.appendChild(skillHeader);
    skillItem.appendChild(progressBar);
    
    skillsGrid.appendChild(skillItem);
  });
}

function animateSkillBars() {
  const progressBars = document.querySelectorAll('.progress-fill');
  progressBars.forEach((bar, index) => {
    const level = bar.getAttribute('data-level');
    setTimeout(() => {
      bar.style.width = `${level}%`;
    }, index * 100);
  });
}

// Projects Section
function renderProjects() {
  const projectsGrid = document.querySelector('.projects-grid');
  
  projects.forEach(project => {
    const projectCard = createElement('div', 'card project-card');
    projectCard.setAttribute('data-testid', `project-card-${project.id}`);
    projectCard.addEventListener('click', () => openProjectModal(project));
    
    const imageContainer = createElement('div', 'project-image-container');
    const projectImage = createElement('img', 'project-image');
    projectImage.src = project.image;
    projectImage.alt = `${project.title} - ${project.category} featuring ${project.tech.slice(0,2).join(' and ')}`;
    projectImage.loading = project.id <= 2 ? 'eager' : 'lazy';
    projectImage.setAttribute('data-testid', `project-image-${project.id}`);
    
    const projectCategory = createElement('div', 'project-category', project.category);
    projectCategory.setAttribute('data-testid', `project-category-${project.id}`);
    
    imageContainer.appendChild(projectImage);
    imageContainer.appendChild(projectCategory);
    
    const projectContent = createElement('div', 'project-content');
    
    const projectTitle = createElement('h3', 'project-title', project.title);
    projectTitle.setAttribute('data-testid', `project-title-${project.id}`);
    
    const projectDescription = createElement('p', 'project-description', project.description);
    projectDescription.setAttribute('data-testid', `project-description-${project.id}`);
    
    const projectTech = createElement('div', 'project-tech');
    project.tech.forEach((tech, idx) => {
      const techTag = createElement('span', 'tech-tag', tech);
      techTag.setAttribute('data-testid', `project-tech-${project.id}-${idx}`);
      projectTech.appendChild(techTag);
    });
    
    const viewButton = createElement('button', 'project-view-button');
    viewButton.setAttribute('data-testid', `project-view-button-${project.id}`);
    viewButton.appendChild(document.createTextNode('View Details'));
    viewButton.appendChild(createIcon('arrow-right', 16));
    
    projectContent.appendChild(projectTitle);
    projectContent.appendChild(projectDescription);
    projectContent.appendChild(projectTech);
    projectContent.appendChild(viewButton);
    
    projectCard.appendChild(imageContainer);
    projectCard.appendChild(projectContent);
    
    projectsGrid.appendChild(projectCard);
  });
}

// Testimonials Section
function renderTestimonials() {
  const testimonialsGrid = document.querySelector('.testimonials-grid');
  
  testimonials.forEach((testimonial, index) => {
    const testimonialCard = createElement('div', 'card testimonial-card');
    testimonialCard.setAttribute('data-testid', `testimonial-${index}`);
    
    const cardContent = createElement('div', 'card-content');
    
    const rating = createElement('div', 'testimonial-rating');
    for (let i = 0; i < testimonial.rating; i++) {
      const star = createIcon('star', 16);
      star.style.fill = 'currentColor';
      star.setAttribute('data-testid', `testimonial-star-${index}-${i}`);
      rating.appendChild(star);
    }
    
    const testimonialText = createElement('p', 'testimonial-text', `"${testimonial.text}"`);
    testimonialText.setAttribute('data-testid', `testimonial-text-${index}`);
    
    const testimonialAuthor = createElement('div', 'testimonial-author');
    const testimonialName = createElement('h4', 'testimonial-name', testimonial.name);
    testimonialName.setAttribute('data-testid', `testimonial-name-${index}`);
    const testimonialRole = createElement('p', 'testimonial-role', testimonial.role);
    testimonialRole.setAttribute('data-testid', `testimonial-role-${index}`);
    const testimonialCompany = createElement('p', 'testimonial-company', testimonial.company);
    testimonialCompany.setAttribute('data-testid', `testimonial-company-${index}`);
    
    testimonialAuthor.appendChild(testimonialName);
    testimonialAuthor.appendChild(testimonialRole);
    testimonialAuthor.appendChild(testimonialCompany);
    
    cardContent.appendChild(rating);
    cardContent.appendChild(testimonialText);
    cardContent.appendChild(testimonialAuthor);
    
    testimonialCard.appendChild(cardContent);
    testimonialsGrid.appendChild(testimonialCard);
  });
}

// Project Modal
function openProjectModal(project) {
  state.selectedProject = project;
  state.isModalOpen = true;
  
  const modal = document.getElementById('project-modal');
  const modalCategory = document.querySelector('.modal-project-category');
  const modalTitle = document.querySelector('.modal-project-title');
  const modalImage = document.querySelector('.modal-project-image');
  const modalDescription = document.querySelector('.modal-project-description');
  const modalFeaturesList = document.querySelector('.modal-features-list');
  const modalTechList = document.querySelector('.modal-tech-list');
  
  modalCategory.textContent = project.category;
  modalTitle.textContent = project.title;
  modalImage.src = project.image;
  modalImage.alt = `${project.title} project screenshot - ${project.category} built with ${project.tech.slice(0,2).join(' and ')}`;
  modalDescription.textContent = `${project.description} This project demonstrates advanced development skills with real-time features and comprehensive data management.`;
  
  // Clear and populate features
  modalFeaturesList.innerHTML = '';
  project.features.forEach((feature, idx) => {
    const li = createElement('li');
    li.setAttribute('data-testid', `modal-feature-${idx}`);
    li.appendChild(createIcon('check-circle', 16));
    li.appendChild(document.createTextNode(feature));
    modalFeaturesList.appendChild(li);
  });
  
  // Clear and populate tech stack
  modalTechList.innerHTML = '';
  project.tech.forEach((tech, idx) => {
    const techTag = createElement('span', 'modal-tech-tag', tech);
    techTag.setAttribute('data-testid', `modal-tech-${idx}`);
    modalTechList.appendChild(techTag);
  });
  
  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
  
  // Reinitialize icons in modal
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }
}

function closeProjectModal() {
  state.selectedProject = null;
  state.isModalOpen = false;
  
  const modal = document.getElementById('project-modal');
  modal.classList.remove('active');
  document.body.style.overflow = '';
}

function initProjectModal() {
  const modal = document.getElementById('project-modal');
  const closeBtn = document.getElementById('modal-close');
  
  closeBtn.addEventListener('click', closeProjectModal);
  
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeProjectModal();
    }
  });
  
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && state.isModalOpen) {
      closeProjectModal();
    }
  });
}

// Contact Form and EmailJS
function initContactForm() {
  const contactForm = document.getElementById('contact-form');
  const submitBtn = document.getElementById('submit-btn');
  const formStatus = document.getElementById('form-status');
  
  // Initialize EmailJS
  emailjs.init(EMAILJS_CONFIG.PUBLIC_KEY);
  
  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = new FormData(contactForm);
    const templateParams = {
      name: formData.get('name'),
      email: formData.get('email'),
      subject: formData.get('subject'),
      message: formData.get('message')
    };
    
    // Show loading state
    submitBtn.classList.add('loading');
    const btnText = submitBtn.querySelector('.btn-text');
    const loadingSpinner = submitBtn.querySelector('.loading-spinner');
    btnText.style.opacity = '0';
    loadingSpinner.style.display = 'block';
    submitBtn.disabled = true;
    
    try {
      // Try EmailJS first
      await emailjs.sendForm(
        EMAILJS_CONFIG.SERVICE_ID,
        EMAILJS_CONFIG.TEMPLATE_CONTACT_ID,
        contactForm,
        EMAILJS_CONFIG.PUBLIC_KEY
      );
      
      // Show success message
      formStatus.className = 'form-status success';
      formStatus.textContent = 'Message sent successfully! I\'ll get back to you within 24 hours.';
      contactForm.reset();
      
    } catch (error) {
      console.error('EmailJS Error:', error);
      
      // Fallback: Create mailto link with form data
      const name = formData.get('name');
      const email = formData.get('email');
      const subject = formData.get('subject');
      const message = formData.get('message');
      
      const mailtoLink = `mailto:me.ghufrannaseer@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(`From: ${name}\nEmail: ${email}\n\nMessage:\n${message}`)}`;
      
      // Show alternative contact options
      formStatus.className = 'form-status warning';
      formStatus.innerHTML = `
        <div>EmailJS configuration needs to be updated. Please contact me directly:</div>
        <div style="margin-top: 10px;">
          <a href="${mailtoLink}" style="color: #007bff; text-decoration: underline;">📧 Send Email Directly</a>
          <br><br>
          <a href="mailto:me.ghufrannaseer@gmail.com" style="color: #007bff; text-decoration: underline;">me.ghufrannaseer@gmail.com</a>
        </div>
      `;
      
    } finally {
      // Reset button state
      submitBtn.classList.remove('loading');
      btnText.style.opacity = '1';
      loadingSpinner.style.display = 'none';
      submitBtn.disabled = false;
    }
  });
}

// Contact Actions
function handleEmailContact() {
  window.location.href = "mailto:me.ghufrannaseer@gmail.com?subject=Project Inquiry&body=Hello Muhammad, I would like to discuss a project with you.";
}

function handleOpenContactForm() {
  const contactSection = document.getElementById('contact');
  if (contactSection) {
    contactSection.scrollIntoView({ behavior: 'smooth' });
    
    const focusInput = () => {
      const firstInput = contactSection.querySelector('input');
      if (firstInput) {
        requestAnimationFrame(() => {
          firstInput.focus();
          firstInput.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        });
      }
    };
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && entry.intersectionRatio > 0.8) {
          setTimeout(focusInput, 100);
          observer.disconnect();
        }
      });
    }, { threshold: 0.8 });
    
    observer.observe(contactSection);
    
    setTimeout(() => {
      focusInput();
      observer.disconnect();
    }, 1200);
  }
}

function downloadCV() {
  const fileId = '1vNVCFRp8ziqx5NS2RZV5qC5nIcSzqX2L';
  const downloadUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;
  
  const link = document.createElement('a');
  link.href = downloadUrl;
  link.download = 'Muhammad_Ghufran_CV.pdf';
  link.target = '_blank';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Event Listeners
function initEventListeners() {
  // Header actions
  const getQuoteBtn = document.getElementById('get-quote-btn');
  const mobileGetQuoteBtn = document.getElementById('mobile-get-quote-btn');
  const startProjectBtn = document.getElementById('start-project-btn');
  const downloadCVBtn = document.getElementById('download-cv-btn');
  const sendMessageBtn = document.getElementById('send-message-btn');
  
  if (getQuoteBtn) getQuoteBtn.addEventListener('click', handleOpenContactForm);
  if (mobileGetQuoteBtn) mobileGetQuoteBtn.addEventListener('click', handleEmailContact);
  if (startProjectBtn) startProjectBtn.addEventListener('click', handleOpenContactForm);
  if (downloadCVBtn) downloadCVBtn.addEventListener('click', downloadCV);
  if (sendMessageBtn) sendMessageBtn.addEventListener('click', handleEmailContact);
}

// Initialize Application
function initApp() {
  // Wait for DOM to be fully loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
    return;
  }
  
  // Initialize all components
  initTheme();
  initMobileMenu();
  initSmoothScrolling();
  initScrollAnimations();
  initProjectModal();
  initContactForm();
  initEventListeners();
  
  // Render dynamic content
  renderServices();
  renderSkills();
  renderProjects();
  renderTestimonials();
  
  // Start typewriter effect
  initTypewriter();
  
  // Initialize Lucide icons
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }
  
  console.log('Portfolio app initialized successfully!');
}
 document.addEventListener("DOMContentLoaded", function () {
    const projectsGrid = document.querySelector(".projects-grid");

    fetch("https://my-blog-backend-phi.vercel.app/api/posts")
        .then(response => response.json())
        .then(data => {
            if (data.success && data.posts.length > 0) {
                projectsGrid.innerHTML = "";

                data.posts.forEach(post => {
                    projectsGrid.innerHTML += `
                        <div class="project-card">
                            <img src="${post.coverImage}" alt="${post.title}" style="width:100%; border-radius:10px;">
                            <div style="padding:15px;">
                                <h3>${post.title}</h3>
                                <p>${post.excerpt}</p>
                                <small>${post.category}</small>
                            </div>
                        </div>
                    `;
                });
            }
        })
        .catch(error => {
            console.error("Error fetching projects:", error);
        });
});
// Start the application
initApp();