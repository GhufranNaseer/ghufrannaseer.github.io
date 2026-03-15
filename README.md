# Muhammad Ghufran - Full Stack Developer Portfolio

A modern, responsive personal portfolio website showcasing professional services, featured projects, technical expertise, and client testimonials. Built with vanilla HTML, CSS, and JavaScript for optimal performance and user experience.

## 🌐 Live Demo

The portfolio is deployed and accessible at: **[(https://ghufrannaseer.github.io/ghufran-dev/)]** *(deployment URL to be configured)*

*Current local deployment via Replit using Python HTTP Server on port 5000*

## 🛠️ Tech Stack

**Frontend:**
- HTML5 (Semantic markup with test IDs for accessibility)
- CSS3 (Custom properties for theming, responsive design)
- Vanilla JavaScript (ES6+, no frameworks for minimal bloat)

**Libraries & Services:**
- [Lucide Icons](https://lucide.dev/) - Comprehensive icon library via CDN
- [Google Fonts](https://fonts.google.com/) - Inter font family for typography
- [EmailJS](https://www.emailjs.com/) - Client-side email service for contact forms
- [Unsplash](https://unsplash.com/) - External image hosting for project screenshots
- [Tawk.to](https://www.tawk.to/) - Live chat widget for customer support

**Design System:**
- Light/Dark theme support with CSS custom properties
- Mobile-first responsive design
- Hardware-accelerated CSS animations

## ✨ Features

### 1. **Interactive Hero Section**
   - Dynamic typewriter effect cycling through professional roles
   - Professional statistics display (Projects, Clients, Success Rate, Experience)
   - Prominent calls-to-action (Start Project, Download CV)

### 2. **Professional Services**
   - 6 service offerings with detailed descriptions
   - Service features and pricing information
   - Project timeline estimates
   - Service icons and call-to-action buttons

### 3. **Technical Skills Showcase**
   - 8 key technical skills with proficiency levels (0-100%)
   - Animated progress bars on scroll
   - Color-coded skill categories

### 4. **Featured Projects Portfolio**
   - 6 completed projects with detailed information
   - Project categories and tech stack display
   - Lazy-loaded project images for performance
   - Interactive modal system for project details
   - Features and technical implementation highlights

### 5. **Client Testimonials**
   - 5-star rating system
   - Actual client feedback and testimonials
   - Client names, roles, and company information

### 6. **Contact & Communication**
   - Full-featured contact form with EmailJS integration
   - Fallback email functionality for robust form submission
   - Email contact buttons throughout the site
   - Live chat widget via Tawk.to

### 7. **Theme System**
   - Light/Dark theme toggle
   - Persistent theme preference (localStorage)
   - Smooth theme transitions
   - Accessible theme controls

### 8. **Mobile Optimization**
   - Responsive mobile navigation menu
   - Touch-friendly interface
   - Optimized for all device sizes

### 9. **Performance Features**
   - Smooth scrolling navigation
   - Intersection Observer for scroll animations
   - Lazy loading for project images
   - Reduced motion support for accessibility
### 10. **Dynamic Blog System**
   - Integration with external REST API (`my-blog-backend-phi.vercel.app`)
   - Responsive carousel display with touch swipe support for mobile
   - Skeleton loaders (shimmer effect) for both list and detail views
   - Dedicated blog post page (`blog.html`) for full article reading
   - Automated date formatting and content styling
   - Category-based layouts with text clamping for clean UI

## 📁 Folder Structure

```
ghufran-dev/
├── index.html              # Main HTML document with all page structure
├── blog.html               # Single blog post detail page
├── styles.css              # Complete styling with theme system and skeletons
├── script.js               # Main application logic and home page blog fetch
├── blog.js                 # Dedicated logic for fetching and rendering single posts
├── README.md               # This file
├── replit.md               # Project documentation (Replit-specific)
├── .replit                 # Replit deployment configuration
├── attached_assets/        # Project assets directory
│   └── screenshot-*.png    # Project screenshots
└── .git/                   # Git version control
```

## 🚀 Installation & Setup

### Prerequisites
- Web browser (modern browser with ES6+ support)
- Python 3.7+ (for local development server)
- Git (optional, for version control)

### Local Development

1. **Clone the repository** (if applicable):
   ```bash
   git clone https://github.com/GhufranNaseer/ghufran-dev.git
   cd ghufran-dev
   ```

2. **Start a local web server**:

   **Option A: Using Python**
   ```bash
   python -m http.server 5000
   ```
   Then open: `http://localhost:5000`

   **Option B: Using Python 3**
   ```bash
   python3 -m http.server 8000
   ```
   Then open: `http://localhost:8000`

   **Option C: Using Live Server** (VS Code extension)
   - Install the Live Server extension
   - Right-click on `index.html` → "Open with Live Server"

3. **Open in browser**:
   - Navigate to the local server URL in your web browser
   - The site loads automatically with all interactive features

### Alternative: Replit Deployment

This project is configured for **Replit** deployment:

1. Open in Replit workspace
2. Click "Run" button or execute Replit workflow
3. The Python HTTP server starts on port 5000 automatically

## 📝 Available Scripts / Commands

### Local Development
```bash
# Start Python HTTP server (Port 5000)
python -m http.server 5000

# Start Python HTTP server (Port 8000)
python3 -m http.server 8000
```

### Replit Workflows
The `.replit` configuration file includes:
- **"Project" workflow**: Runs the Portfolio Server
- **"Portfolio Server" task**: Executes `python -m http.server 5000` on port 5000

### Browser DevTools
- Inspect element for development
- Console logs available for debugging
- Application tab for theme persistence (localStorage)

## 🔐 Environment Variables

### EmailJS Configuration
The contact form uses **EmailJS** for email delivery. The configuration is embedded in `script.js` with the following structure:

```javascript
const EMAILJS_CONFIG = {
  SERVICE_ID: 'your_service_id',
  TEMPLATE_CONTACT_ID: 'your_template_id',
  TEMPLATE_AUTOREPLY_ID: 'your_autoreply_template_id',
  PUBLIC_KEY: 'your_public_key'
};
```

**To configure for your own use:**
1. Create an account at [EmailJS](https://www.emailjs.com/)
2. Set up your email service and templates
3. Replace the placeholder values in `script.js` with your actual EmailJS credentials
4. Test the contact form to ensure emails are being delivered

**Note**: The public key is intentionally hidden in this documentation for security purposes. It's configured directly in the application code.

### Theme Persistence
- **localStorage key**: `theme`
- **Values**: `'light'` or `'dark'`
- **Default**: `'light'`

### Contact Information
- **Primary Email**: `me.ghufrannaseer@gmail.com`
- **LinkedIn**: https://www.linkedin.com/in/ghufran-naseer/
- **GitHub**: https://github.com/GhufranNaseer

## 🌍 Deployment

### Replit Deployment (Current)
The project is configured for **Replit** with the following setup:

**Port Configuration:**
- Local Port 5000 → External Port 80 (HTTP)
- Local Port 45681 → External Port 3000 (Alternative)

**Deployment Steps:**
1. Push code to Replit
2. Click "Run" or trigger workflow
3. Access via Replit's public URL

### Traditional Hosting Deployment

For other hosting platforms (GitHub Pages, Netlify, Vercel, etc.):

1. **Ensure EmailJS configuration is updated** in `script.js` with your own EmailJS service
2. **Static site deployment** (no backend required):
   - Upload all files to hosting provider
   - Point domain to hosting service
   - Enable HTTPS

3. **GitHub Pages**:
   ```bash
   git add .
   git commit -m "Deploy portfolio"
   git push origin main
   ```
   Then enable GitHub Pages in repository settings

### Production Recommendations
- Update EmailJS service credentials if hosting independently
- Test contact form functionality before going live
- Verify theme persistence works in target browser
- Test responsive design on multiple devices
- Enable HTTPS on production domain

## 📸 Screenshots

| Section | Description |
|---------|-------------|
| Hero Section | Profile introduction with typewriter effect and CTAs |
| Services | 6 professional service offerings with pricing |
| Skills | Technical expertise with progress indicators |
| Projects | 6 featured projects with interactive modals |
| Testimonials | Client feedback and ratings |
| Contact | Email form with live chat support |

*Screenshot assets located in `attached_assets/` folder*

## 🔮 Future Improvements

- [x] Backend API integration for blog data
- [x] Blog section for technical articles and tutorials
- [ ] Project filtering by technology/category
- [ ] Search functionality for projects and services
- [ ] Client case studies with detailed metrics
- [ ] Booking system for consultations
- [ ] Newsletter subscription feature
- [ ] Analytics dashboard (Google Analytics integration)
- [ ] Multi-language support (i18n)
- [ ] Dynamic content management system (CMS)
- [ ] API endpoint for portfolio data
- [ ] Automated project showcase from GitHub repositories

## 👨‍💻 Author / Contact Information

**Muhammad Ghufran**
- Full Stack Developer | WordPress Expert | AI Integration Specialist
- BSCS Graduate from Iqra University with ACCP Pro Diploma
- 3+ Years of Professional Development Experience

**Contact & Social:**
- 📧 **Email**: [me.ghufrannaseer@gmail.com](mailto:me.ghufrannaseer@gmail.com)
- 🔗 **LinkedIn**: [linkedin.com/in/ghufran-naseer](https://www.linkedin.com/in/ghufran-naseer/)
- 🐙 **GitHub**: [github.com/GhufranNaseer](https://github.com/GhufranNaseer)
- 💬 **Live Chat**: Available via Tawk.to widget on the website

**Expertise:**
- React.js (95%), Node.js (88%), PostgreSQL (85%)
- WordPress & Elementor Pro (90%)
- Python (82%), AI/ML Integration (78%)
- UI/UX Design (85%)

## 📄 License

This portfolio website is created for personal use. All content, including project descriptions, testimonials, and design, belongs to Muhammad Ghufran.

**Usage Rights:**
- ✅ You may fork and adapt this project as a portfolio template for your own use
- ✅ You may reference the code structure and design patterns
- ❌ You may not claim credit for the original work
- ❌ You may not use the testimonials, project images, or personal information without permission.

For licensing inquiries or permission requests, contact: **me.ghufrannaseer@gmail.com**

---

## 📚 Additional Resources

- [Lucide Icons Documentation](https://lucide.dev/)
- [EmailJS Documentation](https://www.emailjs.com/docs/)
- [MDN Web Docs](https://developer.mozilla.org/) - HTML, CSS, JavaScript references
- [Google Fonts](https://fonts.google.com/)

## 🤝 Support & Feedback

Have questions or feedback about the portfolio? 
- Open an issue on GitHub
- Send an email to me.ghufrannaseer@gmail.com
- Use the live chat widget available on the website

---

**Last Updated**: March 2026  
**Status**: Actively Maintained  
**Version**: 1.1.0
