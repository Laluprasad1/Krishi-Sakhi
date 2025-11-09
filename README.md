# 🌾 Krishi Sahakari Connect - Digital Agricultural Intelligence Platform

[![Deploy to GitHub Pages](https://github.com/Mahesh-ch06/Krishi-Sakhi/workflows/Deploy%20to%20GitHub%20Pages/badge.svg)](https://github.com/Mahesh-ch06/Krishi-Sakhi/actions)
[![Live Demo](https://img.shields.io/badge/Live%20Demo-Available-brightgreen)](https://mahesh-ch06.github.io/Krishi-Sakhi/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3.1-brightgreen)](https://reactjs.org/)
[![Version](https://img.shields.io/badge/Version-1.0.0-success)](package.json)

**Krishi Sahakari Connect** is a comprehensive digital agricultural intelligence platform designed specifically for Indian farmers. It combines cutting-edge AI technology with traditional farming wisdom to provide personalized, actionable agricultural guidance in multiple languages, with a focus on Malayalam for Kerala farmers.

## 🎯 **Live Application**
🌐 **[Experience Krishi Sahakari Connect Live](https://mahesh-ch06.github.io/Krishi-Sakhi/)**

---

## 📋 **Table of Contents**
- [🚀 Overview](#-overview)
- [✨ Key Features](#-key-features)
- [🛠️ Technology Stack](#️-technology-stack)
- [📁 Project Structure](#-project-structure)
- [🚀 Quick Start](#-quick-start)
- [🔧 Installation](#-installation)
- [🤖 AI Integration](#-ai-integration)
- [🌐 Deployment](#-deployment)
- [📊 Features Documentation](#-features-documentation)
- [🔒 Security & Privacy](#-security--privacy)
- [🤝 Contributing](#-contributing)
- [📈 Roadmap](#-roadmap)
- [📞 Support & Contact](#-support--contact)
- [📄 License](#-license)

---

## 🚀 **Overview**

Krishi Sahakari Connect revolutionizes agricultural decision-making by providing:
- **AI-Powered Crop Recommendations** tailored to local conditions
- **Real-Time Weather Integration** with farming-specific alerts
- **Market Intelligence** for optimal selling decisions
- **Financial Planning Tools** for farm profitability
- **Multilingual Support** with Malayalam-first design
- **Expert Agricultural Guidance** powered by Google Gemini AI

### **Target Users**
- 🌾 **Smallholder Farmers** (0.5-5 acres)
- 🏛️ **Agricultural Extension Officers**
- 🏢 **Farming Cooperatives**
- 📊 **Agricultural Consultants**
- 🎓 **Agricultural Students & Researchers**

---

## ✨ **Key Features**

### 🧠 **Intelligent Agricultural Assistant**
- **Google Gemini AI Integration** - Expert agricultural advice with 30+ years simulated experience
- **Multilingual Chat Interface** - Malayalam, English, and Hindi support
- **Image Analysis** - Upload crop photos for instant pest/disease identification
- **Voice Commands** - Speak your questions in local languages
- **Confidence Scoring** - Transparent AI recommendations with safety thresholds

### 📊 **Comprehensive Dashboard System**

#### **1. Overview Dashboard**
- Real-time farm metrics and KPIs
- Recent activities and notifications
- Quick action buttons for common tasks
- Weather summary and alerts

#### **2. Crop Recommendation Engine**
- **8-Factor Analysis**: Soil, Weather, Budget, Experience, Season, Market Access, Organic Preference, Farm Size
- **Kerala-Specific Database**: 15+ local crop varieties with cultivation data
- **Seasonal Optimization**: September planting recommendations with 15-point bonus
- **pH Assessment**: Farmer-friendly soil condition evaluation without equipment
- **Financial Projections**: ROI analysis and investment requirements

#### **3. Crop Twin Technology**
- **Digital Crop Twins** for personalized farm management
- **Growth Stage Tracking** with visual progress indicators
- **Risk Assessment** using multi-factor algorithms
- **Proactive Alerts** for pest, disease, and weather threats
- **Community Learning** through federated intelligence

#### **4. Weather Intelligence**
- **7-Day Detailed Forecasts** with farming recommendations
- **Agricultural Alerts**: Spray timing, harvest warnings, irrigation schedules
- **Microclimate Data** for district-level precision
- **Seasonal Planning** tools for annual crop calendars

#### **5. Financial Management**
- **Income/Expense Tracking** with category-wise breakdown
- **Goal Management**: Equipment purchase, emergency fund, land expansion
- **ROI Calculator** for crop selection decisions
- **Budget Planning** with investment requirement analysis
- **Profit Optimization** suggestions based on market trends

#### **6. Market Intelligence**
- **Real-Time Mandi Prices** from Agmarknet integration
- **Price Trend Analysis** with 7-day and 30-day charts
- **Selling Recommendations**: AI-powered "Sell Now" or "Wait" advice
- **Market Alerts** for favorable price conditions
- **Buyer Network** connections for direct sales

#### **7. Interactive Crop Calendar**
- **Monthly Task Scheduling** with priority levels
- **Seasonal Recommendations** based on Kerala climate
- **Reminder System** for critical farming activities
- **Growth Stage Tracking** with milestone alerts
- **Harvest Planning** with market timing optimization

#### **8. Advanced Analytics**
- **Yield Analysis** with target vs actual comparisons
- **Performance Trends** over 6-month periods
- **Crop Distribution** insights with profitability analysis
- **AI-Powered Insights** for continuous improvement
- **Benchmark Comparisons** with similar farms

---

## 🛠️ **Technology Stack**

### **Frontend Technologies**
```json
{
  "core": {
    "react": "^18.3.1",
    "typescript": "^5.8.3",
    "vite": "^5.4.19"
  },
  "ui": {
    "tailwindcss": "^3.4.17",
    "@radix-ui/react-*": "Latest",
    "lucide-react": "^0.462.0",
    "framer-motion": "^12.23.12"
  },
  "routing": {
    "react-router-dom": "^6.30.1"
  },
  "state": {
    "@tanstack/react-query": "^5.83.0",
    "react-hook-form": "^7.61.1"
  }
}
```

### **AI & External Services**
```json
{
  "ai": {
    "@google/generative-ai": "^0.24.1"
  },
  "backend": {
    "firebase": "^12.2.1"
  },
  "charts": {
    "recharts": "^2.15.4"
  },
  "utilities": {
    "date-fns": "^3.6.0",
    "zod": "^3.25.76"
  }
}
```

---

## 📁 **Project Structure**

```
krishi-sahakari-connect/
├── 📁 src/
│   ├── 📁 components/           # Reusable UI Components
│   │   ├── 📁 ui/              # Radix UI base components
│   │   ├── ChatInterface.tsx    # AI chat component
│   │   ├── HeroSection.tsx     # Landing page hero
│   │   ├── FeaturesSection.tsx # Feature showcase
│   │   └── Navigation.tsx      # App navigation
│   │
│   ├── 📁 contexts/            # React Context Providers
│   │   ├── AuthContext.tsx     # Authentication state
│   │   └── LanguageContext.tsx # Multilingual support
│   │
│   ├── 📁 hooks/               # Custom React Hooks
│   │   ├── use-mobile.tsx      # Mobile detection
│   │   └── use-toast.ts        # Toast notifications
│   │
│   ├── 📁 lib/                 # Utility Libraries
│   │   └── utils.ts            # Helper functions
│   │
│   ├── 📁 pages/               # Main Application Pages
│   │   ├── Index.tsx           # Landing page
│   │   ├── Dashboard.tsx       # Main dashboard (8 tabs)
│   │   ├── CropTwinDashboard.tsx # Crop twin management
│   │   ├── LoginPage.tsx       # User authentication
│   │   ├── SignupPage.tsx      # User registration
│   │   └── NotFound.tsx        # 404 error page
│   │
│   ├── 📁 services/            # Business Logic & API Layer
│   │   ├── geminiService.ts    # Google Gemini AI integration
│   │   ├── cropRecommendationEngine.ts # Smart crop suggestions
│   │   ├── cropTwinEngine.ts   # Digital twin management
│   │   ├── weatherService.ts   # Weather data integration
│   │   ├── marketService.ts    # Market price tracking
│   │   ├── riskAssessment.ts   # Agricultural risk analysis
│   │   ├── alertSystem.ts      # Proactive notification system
│   │   └── federatedLearning.ts # Privacy-preserving ML
│   │
│   └── 📁 assets/             # Static Assets
│       └── hero-farmer.jpg     # Hero section image
│
├── 📁 public/                 # Public Static Files
├── 📄 package.json           # Project dependencies & scripts
├── 📄 vite.config.ts        # Vite build configuration
├── 📄 tailwind.config.ts    # Tailwind CSS configuration
├── 📄 tsconfig.json         # TypeScript configuration
└── 📄 README.md            # This file
```

---

## 🚀 **Quick Start**

### **Prerequisites**
- **Node.js 18+** (LTS recommended)
- **npm 8+** or **yarn 1.22+** or **bun**
- **Git 2.25+**
- **Modern Web Browser** (Chrome 90+, Firefox 88+, Safari 14+)

### **One-Minute Setup**
```bash
# Clone the repository
git clone https://github.com/Mahesh-ch06/Krishi-Sakhi.git

# Navigate to project directory
cd Krishi-Sakhi

# Install dependencies
npm install

# Start development server
npm run dev

# Open your browser to http://localhost:5173
```

### **Environment Configuration**
Create a `.env` file in the root directory:
```env
# Google Gemini AI
VITE_GEMINI_API_KEY=your_gemini_api_key_here

# Firebase Configuration
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id

# Application Configuration
VITE_APP_VERSION=1.0.0
VITE_APP_ENVIRONMENT=development
```

---

## 🔧 **Installation**

### **Available Scripts**
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run build:dev    # Build for development mode
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run predeploy    # Pre-deployment build
npm run deploy       # Deploy to GitHub Pages
```

### **Production Build**
```bash
# Build optimized production bundle
npm run build

# Preview production build locally
npm run preview

# Deploy to GitHub Pages
npm run deploy
```

---

## 🤖 **AI Integration**

### **Google Gemini AI Features**

#### **Agricultural Expert Persona**
```typescript
System Configuration:
- 30+ years agricultural extension officer experience
- Specialized in Kerala farming conditions
- CIB&RC pesticide compliance expertise
- Bilingual Malayalam/English communication
- Safety-first recommendation approach
```

#### **Response Structure**
Every AI response follows this format:
```typescript
interface AIResponse {
  shortAnswer: string;        // Direct solution
  why: string;               // Educational explanation
  immediateSteps: string[];  // Actionable tasks
  preventiveSteps: string[]; // Long-term prevention
  safetyNotes: string[];     // Important warnings
  nextInfoNeeded: string[];  // Follow-up guidance
  confidence: number;        // 0-100 confidence score
  escalationNeeded: boolean; // Human expert required
}
```

---

## 🌐 **Deployment**

### **GitHub Pages Deployment**

```bash
# Build and deploy
npm run build
npm run deploy

# Your application will be available at:
# https://mahesh-ch06.github.io/Krishi-Sakhi/
```

### **Manual Deployment Steps**
1. **Build the project**: `npm run build`
2. **Deploy to GitHub Pages**: `npm run deploy`
3. **Configure repository settings** for GitHub Pages
4. **Access your live application**

---

## 📊 **Features Documentation**

### **1. Crop Recommendation System**

#### **Input Parameters**
```typescript
interface FarmerInput {
  farmSize: number;           // Hectares
  district: string;           // Kerala districts
  soilType: 'clay' | 'loamy' | 'sandy';
  waterAvailability: 'abundant' | 'moderate' | 'limited';
  experience: 'beginner' | 'intermediate' | 'expert';
  budget: number;             // Investment capacity (₹)
  season: 'kharif' | 'rabi' | 'summer';
  marketAccess: 'direct' | 'cooperative' | 'middleman';
  organicPreference: boolean;
}
```

#### **Recommendation Algorithm**
```typescript
Scoring Factors (Total: 100 points):
├── Climate Suitability (20 points)
├── Soil Compatibility (15 points)
├── Water Requirements (15 points)
├── Investment Match (15 points)
├── Market Access (10 points)
├── Experience Level (10 points)
├── Seasonal Bonus (10 points)
└── pH Compatibility (5 points)
```

### **2. Financial Management Dashboard**

#### **Income Tracking Categories**
- **Crop Sales** (Primary & Secondary crops)
- **Livestock Products** (Dairy, meat, breeding)
- **Government Support** (Subsidies, insurance, schemes)
- **Other Sources** (Agri-tourism, equipment rental)

#### **Expense Management**
```typescript
Expense Distribution:
├── Seeds & Planting Material (15-20%)
├── Fertilizers & Nutrients (25-30%)
├── Pesticides & Plant Protection (10-15%)
├── Labor Costs (20-25%)
├── Machinery & Equipment (10-15%)
├── Irrigation & Water (5-10%)
├── Transportation & Marketing (5-8%)
└── Other Operating Expenses (5-10%)
```

---

## 🔒 **Security & Privacy**

### **Data Protection Strategy**
- **Privacy-First Design** with federated learning
- **Local Data Processing** for sensitive information
- **GDPR Compliance** with data portability and deletion rights
- **Secure Authentication** via Firebase and Google OAuth
- **Encrypted Data Storage** with AES-256 encryption

### **Security Measures**
```typescript
Security Implementation:
├── Authentication & Authorization
│   ├── Firebase Authentication
│   ├── Multi-factor authentication support
│   ├── Role-based access control (RBAC)
│   └── OAuth 2.0 integration
│
├── Data Encryption
│   ├── TLS 1.3 for data in transit
│   ├── AES-256 for data at rest
│   ├── End-to-end encryption for sensitive data
│   └── Key rotation policies
│
└── API Security
    ├── Rate limiting per user/IP
    ├── Input validation & sanitization
    ├── SQL injection prevention
    └── Cross-site scripting (XSS) protection
```

---

## 🤝 **Contributing**

We welcome contributions from developers, agricultural experts, and farming communities!

### **How to Contribute**

```bash
# Fork the repository on GitHub
# Clone your forked repository
git clone https://github.com/yourusername/Krishi-Sakhi.git

# Create a feature branch
git checkout -b feature/amazing-feature

# Make your changes and commit
git commit -m 'Add amazing feature'

# Push to your fork
git push origin feature/amazing-feature

# Open a Pull Request on GitHub
```

### **Types of Contributions Welcome**
- 🐛 **Bug Fixes** - UI/UX improvements, performance optimization
- ✨ **New Features** - Additional crop varieties, new algorithms
- 📚 **Documentation** - User guides, API documentation
- 🧪 **Testing** - Unit tests, integration tests, E2E scenarios
- 🌐 **Localization** - Malayalam translations, other regional languages
- 📊 **Data Contributions** - Agricultural datasets, regional crop information

---

## 📈 **Roadmap**

### **Phase 1: Foundation (Completed) ✅**
- ✅ Core React application with TypeScript
- ✅ Google Gemini AI integration
- ✅ Multilingual support (Malayalam/English)
- ✅ Comprehensive 8-tab dashboard system
- ✅ Crop recommendation engine
- ✅ Weather intelligence integration
- ✅ Market price tracking system
- ✅ Financial management dashboard
- ✅ Interactive crop calendar
- ✅ Advanced analytics & insights
- ✅ User authentication & security
- ✅ Responsive design & PWA features
- ✅ GitHub Pages deployment

### **Phase 2: Enhanced Intelligence (Q1 2024) 🚧**
- 🧠 **Advanced AI Features**: Voice interaction, improved image analysis
- 📱 **Mobile Experience**: PWA enhancement, offline functionality
- 🌐 **Platform Integrations**: WhatsApp Business API, SMS gateway
- 📊 **Advanced Analytics**: Performance benchmarking, predictive maintenance

### **Phase 3: Community & Scale (Q2-Q3 2024) 📋**
- 👥 **Community Features**: Farmer forums, expert Q&A platform
- 🏪 **Marketplace Integration**: Input purchasing, direct buyer connections
- 🔧 **IoT Integration**: Soil sensors, weather stations, drone imagery
- 📈 **Business Intelligence**: Regional dashboards, policy insights

---

## 📞 **Support & Contact**

### **Get Help & Support**

#### **📱 Phone Support**
- **Primary**: [+91 7013295712](tel:+917013295712)
- **Hours**: Monday-Friday, 9:00 AM - 6:00 PM IST
- **Languages**: Malayalam, English, Hindi
- **Services**: Technical support, Agricultural consultation, Emergency assistance
- **Talk to our experts directly**: Available for immediate assistance

#### **📧 Email Support**
- **General Support**: [maheshch1094@gmail.com](mailto:maheshch1094@gmail.com)
- **Technical Support**: [maheshch1094@gmail.com](mailto:maheshch1094@gmail.com)
- **Partnership Inquiries**: [maheshch1094@gmail.com](mailto:maheshch1094@gmail.com)
- **Send us your queries anytime**: We're here to help
- **Response Time**: Within 24 hours (business days)

#### **💬 Community Channels**
- **GitHub Issues**: [Report bugs or request features](https://github.com/Mahesh-ch06/Krishi-Sakhi/issues)
- **GitHub Discussions**: [Community Q&A and feedback](https://github.com/Mahesh-ch06/Krishi-Sakhi/discussions)
- **Documentation**: [User guides and tutorials](https://github.com/Mahesh-ch06/Krishi-Sakhi/wiki)

### **Emergency Agricultural Support**
For urgent agricultural issues or pest outbreaks:
- **Hotline**: [+91 7013295712](tel:+917013295712)
- **WhatsApp**: Available for image sharing and quick consultations
- **Expert Network**: Direct connection to agricultural extension officers
- **24/7 AI Assistant**: Available through the application for immediate guidance
- **Talk to our experts directly**: Immediate assistance for critical farm issues

---

## 📊 **Performance Metrics**

### **Technical Performance KPIs**
```typescript
Performance Targets:
├── Application Performance
│   ├── Page Load Time: < 2 seconds
│   ├── Time to Interactive: < 3 seconds
│   └── First Contentful Paint: < 1 second
│
├── AI Performance
│   ├── Response Time: < 2 seconds (text)
│   ├── Image Analysis: < 5 seconds
│   └── Accuracy: > 85% (pest identification)
│
└── System Reliability
    ├── Uptime: 99.9% availability
    ├── Error Rate: < 1% of requests
    └── API Response Time: < 500ms
```

### **Agricultural Impact KPIs**
```typescript
Success Metrics:
├── Productivity Improvements
│   ├── Average Yield Increase: 15%+
│   ├── Cost Reduction: 20%+
│   └── Time to Resolution: 50% faster
│
├── Financial Benefits
│   ├── Profit Margin Improvement: 25%+
│   ├── Investment Efficiency: 30%+ better ROI
│   └── Market Price Optimization: 15%+ better prices
│
└── Digital Adoption
    ├── Daily Active Users: 60%+ of registered
    ├── Feature Utilization: 70%+ use 3+ features
    └── Session Duration: 15+ minutes average
```

---

## 📄 **License**

### **MIT License**
```
MIT License

Copyright (c) 2024 Krishi Sahakari Connect Development Team

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## 🙏 **Acknowledgments**

### **Special Thanks To**
- **🏛️ Kerala Agricultural University (KAU)** - Agricultural expertise and validation
- **🤖 Google** - Gemini AI technology and cloud services
- **🔥 Firebase** - Backend infrastructure and authentication
- **🐙 GitHub** - Code hosting, CI/CD, and deployment platform
- **👨‍🌾 Farming Communities** - Beta testing and valuable feedback
- **👩‍💻 Open Source Community** - Amazing tools and libraries

### **Technology Partners**
- **React Team** - For the excellent frontend framework
- **TypeScript Team** - For type safety and developer experience
- **Tailwind CSS** - For the utility-first CSS framework
- **Radix UI** - For accessible component primitives
- **Vite Team** - For the lightning-fast build tool

---

<div align="center">

## 🌟 **Star History**

[![Star History Chart](https://api.star-history.com/svg?repos=Mahesh-ch06/Krishi-Sakhi&type=Date)](https://star-history.com/#Mahesh-ch06/Krishi-Sakhi&Date)

---

**🌾 Made with ❤️ for Kerala Farmers 🌾**

**Empowering Agriculture Through Technology**

[🌐 Live Application](https://mahesh-ch06.github.io/Krishi-Sakhi/) • [📚 Documentation](https://github.com/Mahesh-ch06/Krishi-Sakhi/wiki) • [🐛 Report Issues](https://github.com/Mahesh-ch06/Krishi-Sakhi/issues) • [💡 Feature Requests](https://github.com/Mahesh-ch06/Krishi-Sakhi/discussions) • [🤝 Contribute](https://github.com/Mahesh-ch06/Krishi-Sakhi/blob/main/CONTRIBUTING.md)

---

### **Connect With Us**

[![GitHub](https://img.shields.io/badge/GitHub-Follow-black?style=for-the-badge&logo=github)](https://github.com/Mahesh-ch06)
[![Email](https://img.shields.io/badge/Email-Contact-red?style=for-the-badge&logo=gmail)](mailto:maheshch1094@gmail.com)
[![Phone](https://img.shields.io/badge/Phone-+91%207013295712-green?style=for-the-badge&logo=phone)](tel:+917013295712)

---

**"Technology should serve humanity, and agriculture feeds humanity. 
Krishi Sahakari Connect bridges this connection for a sustainable future."**

### **Contact Information**
**Reach out to us through any of the following channels. Our team is always ready to assist you.**

#### **📧 Email Support**
- **Primary**: [maheshch1094@gmail.com](mailto:maheshch1094@gmail.com)
- **Send us your queries anytime** - We're here to help with all your agricultural needs

#### **📞 Phone Support**  
- **Primary**: [+91 7013295712](tel:+917013295712)
- **Talk to our experts directly** - Immediate assistance available

🌐 **Website**: [mahesh-ch06.github.io/Krishi-Sakhi](https://mahesh-ch06.github.io/Krishi-Sakhi/)

---

**© 2024 Krishi Sahakari Connect. All rights reserved.**

</div>
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/6688a99d-ff62-491f-8c58-bd5c7e24d92a) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)
#   K r i s h i - S a k h i 
 
 