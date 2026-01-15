<a href="./README.EN.md" >English</a> | <a href="./README.md" >简体中文</a>

# Himate Music Player

A modern music player built with React, featuring complete music playback, playlist management, search functionality, and multi-language support.

![Himate Music Player](public/logo.png)

## ✨ Features

### 🎵 Music Playback
- Playlist management
- Multiple playback modes (sequential, shuffle, etc.)
- Playback progress control with synchronized lyrics display

### 🔍 Search Functionality
- Music search

### 🌍 Internationalization Support
- Chinese (Simplified)
- English (US)

### 📱 Modern Interface
- Beautiful interface based on Ant Design
- Responsive design with Tailwind CSS
- Mobile-friendly layout
- Dark/Light theme support

## 🛠️ Tech Stack

### Frontend Framework
- **React 18** - Modern user interface library
- **Vite** - Fast build tool and development server

### UI Component Library
- **Ant Design 5** - Enterprise-class UI design language
- **Tailwind CSS 4** - Utility-first CSS framework

### State Management
- **Zustand** - Lightweight state management

### Routing
- **React Router 7** - Declarative routing

### HTTP Client
- **Axios** - Promise-based HTTP client

### Internationalization
- **i18next** - Powerful internationalization framework
- **react-i18next** - React integration for i18next

## 🚀 Quick Start

### Prerequisites
- Node.js >= 16.0.0
- npm >= 7.0.0 or yarn >= 1.22.0

### Install Dependencies
```bash
# Using npm
npm install

# Or using yarn
yarn
```

### Development Server
```bash
# Using npm
npm run dev

# Or using yarn
yarn dev
```

The development server will start at `http://localhost:8081`

### Build for Production
```bash
# Using npm
npm run build

# Or using yarn
yarn build
```

### Preview Production Build
```bash
# Using npm
npm run preview

# Or using yarn
yarn preview
```

## 📁 Project Structure

```
src/
├── api/                    # API interface layer
│   ├── login.js           # Login related APIs
│   ├── music.js           # Music related APIs
│   └── user.js            # User related APIs
├── assets/                # Static assets
├── components/            # Reusable components
│   └── common/            # Common components
├── constants/             # Constants definition
│   └── locale.js          # Localization constants
├── i18n/                  # Internationalization configuration
│   └── langs/             # Language packages
│       ├── en-US/         # English
│       └── zh-CN/         # Chinese
├── pages/                 # Page components
│   ├── auth/              # Authentication related pages
│   ├── common/            # Common pages
│   └── music/             # Music related pages
├── router/                # Route configuration
├── stores/                # State management
│   ├── musicStore.js      # Music state
│   ├── settingStore.js    # Settings state
│   └── userStore.js       # User state
├── styles/                # Style files
├── utils/                 # Utility functions
│   ├── common/            # Common utilities
│   └── request/           # Request utilities
├── main.jsx               # Application entry point
└── App.jsx                # Root component
```

## 🔧 Configuration

### Environment Variables
The project supports the following environment variable configurations:

- `VITE_ENV` - Runtime environment (development/production)
- `VITE_OUTPUT_DIR` - Output directory
- `VITE_BASE_URL` - API base URL
- `VITE_THUMBNAIL_URL` - Thumbnail URL
- `VITE_STATIC_URL` - Static assets URL
- `VITE_API_PREFIX` - API prefix

## 🎨 Theme Customization

The project uses Tailwind CSS for styling management and supports custom theme configuration. Main color configuration:

- Primary color: Ant Design blue color scheme
- Background color: Support for dark and light themes
- Responsive breakpoints: Mobile-first design

## 📄 License

This project is open-sourced under the [MIT License](LICENSE).

### Related Projects
- **Frontend**: [Himate React Native App](https://gitee.com/zyz1720/himate_app_rn)
- **Backend**: [Himate NestJS Server](https://gitee.com/zyz1720/himate_server_nest)