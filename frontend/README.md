# 🩸 HOPEDROP - Blood Bank Management System (Frontend)
![Vercel](https://img.shields.io/badge/Deployed_on-Vercel-black?logo=vercel)
![React](https://img.shields.io/badge/React-18.x-blue?logo=react)
![Vite](https://img.shields.io/badge/Vite-5.x-purple?logo=vite)
![Status](https://img.shields.io/badge/Status-Active_Development-brightgreen)
Welcome to the **HOPEDROP Frontend Repository**. This project is a modern, responsive, and highly interactive Blood Bank Management System designed to connect donors, hospitals, and centralized administration seamlessly.
> **🎉 Live Deployment:** This frontend is successfully hosted and continuously deployed via **Vercel**.
---
## ✨ What We Have Built So Far
### 1. 🎨 Stunning UI/UX & Glassmorphism Design
- **Theme Engine**: Built a robust implementation of Dark/Light themes using Context API and CSS variables. The app smoothly transitions between themes.
- **Glassmorphism Aesthetics**: Replaced flat colors with modern frosted-glass effects (translucent backgrounds, ackdrop-filter: blur, dynamic shadows) across the app, making it look incredibly polished.
### 2. 🧭 Advanced Navigation System
- **Desktop Navigation**: A floating pill-shaped header that detects scroll positions. It transitions from fully transparent (to blend with hero images) to a frosted glass state as you scroll down. Active states use beautiful bouncing pill buttons.
- **Mobile Sidebar Experience**: Replaced standard mobile menus with a sleek, left-sliding glassmorphic sidebar complete with backdrop blur, smooth entry/exit animations, and an intuitive triple-line hamburger toggle.
### 3. 🏠 Modern Landing Page
- Fully redesigned the public-facing homepage to capture attention immediately.
- Included an engaging **Hero Image Slideshow**.
- Features a **Live Blood Stock** visualizer mock panel with pulsing critical-status indicators.
- Seamlessly styled text elements with smart text-shadows to ensure high readability over complex background images.
### 4. 🔐 Role-Based Access Control (RBAC)
- Implemented frontend security via AuthContext.
- Private routing logic (RoleRoute) restricts access to specific dashboards based on the logged-in user's role:
    - 🩸 **Donor** (/donor)
    - 🩺 **Doctor** (/doctor)
    - 🧪 **Staff/Lab** (/staff)
    - ⚙️ **Admin** (/admin)
    - 🤒 **Patient** (/patient)
- Centralized configuration (oleConfig.js) to dynamically render navigation items and allowed paths depending on the active user type.
### 5. ⚡ Performance & State Management
- Bootstrapped with **Vite** for lightning-fast HMR and optimized production builds.
- Context APIs used for global state (ThemeContext, AuthContext) avoiding prop-drilling.
- Utilized lucide-react for beautiful, scalable SVG icons across all dashboards and menus.
---
## 🛠️ Tech Stack
- **Framework**: React.js
- **Build Tool**: Vite
- **Routing**: React Router DOM (eact-router-dom)
- **Styling**: Pure Modern CSS3 (Variables, Keyframes, Backdrop-filters, Flexbox/Grid)
- **Icons**: Lucide React
- **Hosting**: Vercel
---
## 🚀 Getting Started (Local Development)
If you need to run this Vercel-hosted frontend locally:
1. **Install Dependencies:**
   \\\ash
   npm install
   \\\
2. **Start the Development Server:**
   \\\ash
   npm run dev
   \\\
   *The app will be available at \http://localhost:5173\.*
3. **Build for Production:**
   \\\ash
   npm run build
   \\\
---
## 🎯 Next Steps / Roadmap
- Connect frontend Axios services directly to the live Django Backend REST APIs.
- Populate live location data (Overpass API integration for maps).
- Finalize the Admin Analytics tracking graphs.
<div align="center">
  <i>Built with ❤️ for better healthcare and faster blood donations.</i>
</div>
