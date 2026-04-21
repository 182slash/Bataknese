# Bataknese Frontend

Premium, elegant frontend for the exclusive Bataknese social community platform. Built with Next.js 14 (App Router), TypeScript, and real-time Socket.io features.

## 🎨 Design System

### Color Palette
- **Primary Red**: `#B91C1C` / `#991B1B` (Deep crimson for Batak heritage)
- **Gold Accent**: `#D4AF37` (Luxurious gold accents)
- **Dark Theme**: `#0F0F0F` / `#1A1A1A` / `#171717`

### Typography
- **Headings**: Cinzel (royal/ceremonial feel)
- **Body**: Inter (clean, modern readability)

### Design Elements
- Ulos textile-inspired geometric patterns as SVG decorative elements
- Glass-morphism panels with backdrop blur
- Smooth transitions and micro-interactions
- Mobile-first responsive design

## ✨ Features

### 🔐 Authentication
- **Login**: Full-screen split layout with branding
- **Registration**: Multi-step form (Step 1: Account, Step 2: Personal/Marga info)
- JWT token management with Zustand
- Auto-redirect based on auth state

### 🆔 Batak ID Card
- Beautifully styled ID card with Ulos border patterns
- Displays: Photo, Name, Marga, Card Number (BTC-YEAR-XXXXX), City
- **Social Media Sharing** via html2canvas:
  - Instagram Post (1080x1080)
  - Instagram Story (1080x1920)
  - WhatsApp Story (1080x1080)
- One-click download as PNG

### 📁 Member Directory
- Advanced filter sidebar:
  - Search by name
  - Filter by marga (dropdown with 60+ options grouped by sub-ethnic)
  - Age range slider
  - Location (city, province)
  - Gender filter
- Paginated results
- Direct message button for each member

### 🏘️ Communities
- Browse all communities
- Create new community with modal
- Join/leave communities
- Community detail page with:
  - Members list with role badges (Leader, Vice Leader, Secretary, etc.)
  - Embedded real-time group chat
  - Role assignment (leader-only feature)

### 💬 Real-time Chat
- **Community Group Chat**: 
  - Socket.io powered
  - Live typing indicators
  - Online/offline status
  - Message history
- **P2P Direct Messages**:
  - Conversation sidebar with unread counts
  - Real-time messaging
  - Read receipts
  - Typing indicators

### 📊 Dashboard
- Personalized welcome with user info
- Stats widgets (Total Members, My Communities, Unread Messages)
- Batak ID Card widget with social sharing
- Recent communities preview
- Recent messages preview

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **HTTP Client**: Axios with JWT interceptors
- **Real-time**: Socket.io-client
- **Image Export**: html2canvas
- **Date Handling**: date-fns
- **Notifications**: react-hot-toast

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Backend API running (see bataknese-backend)

### Setup

1. **Clone the repository**
```bash
git clone <repository-url>
cd bataknese-frontend
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment variables**
```bash
cp .env.example .env
```

Edit `.env`:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
```

4. **Run development server**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 🏗️ Project Structure

```
bataknese-frontend/
├── app/
│   ├── (dashboard)/              # Dashboard layout group
│   │   ├── dashboard/           # Main dashboard
│   │   ├── directory/           # Member directory
│   │   ├── community/           # Communities
│   │   │   └── [id]/           # Community detail
│   │   └── chat/               # P2P messaging
│   ├── auth/
│   │   ├── login/              # Login page
│   │   └── register/           # Multi-step registration
│   ├── layout.tsx              # Root layout
│   ├── globals.css             # Global styles + design system
│   └── page.tsx                # Landing page
├── components/
│   ├── layout/
│   │   └── Sidebar.tsx         # Navigation sidebar
│   ├── id-card/
│   │   └── BatakIDCard.tsx     # ID card with social sharing
│   ├── community/
│   │   └── ChatRoom.tsx        # Group chat component
│   └── chat/
│       └── DirectChat.tsx      # P2P chat component
├── lib/
│   ├── api/
│   │   └── client.ts           # Axios instance with JWT
│   ├── store/
│   │   └── authStore.ts        # Zustand auth store
│   ├── hooks/
│   │   └── useSocket.ts        # Socket.io hook
│   └── types.ts                # TypeScript interfaces
├── public/                      # Static assets
├── next.config.js
├── tailwind.config.ts
└── tsconfig.json
```

## 🎯 Key Components

### Sidebar Navigation
```tsx
import Sidebar from '@/components/layout/Sidebar';
```
- Auto-highlights active route
- Shows user avatar and info
- Logout functionality

### Batak ID Card
```tsx
import BatakIDCard from '@/components/id-card/BatakIDCard';

<BatakIDCard user={user} showShareButtons={true} />
```
- Ulos border patterns
- Social media export (Instagram Post/Story, WhatsApp)
- html2canvas for image generation

### Community Chat
```tsx
import ChatRoom from '@/components/community/ChatRoom';

<ChatRoom roomId={roomId} communityName={communityName} />
```
- Real-time messaging via Socket.io
- Typing indicators
- Message history
- Auto-scroll

### Direct Chat
```tsx
import DirectChat from '@/components/chat/DirectChat';

<DirectChat room={selectedRoom} onBack={() => {}} />
```
- P2P messaging
- Read receipts
- Typing indicators
- Mobile-responsive

## 🔧 Configuration

### API Client
The Axios client (`lib/api/client.ts`) automatically:
- Injects JWT token from localStorage
- Handles 401 errors (redirects to login)
- Provides helper functions for token management

### Socket.io Hook
The `useSocket` hook (`lib/hooks/useSocket.ts`) provides:
- Auto-connection with JWT auth
- Room join/leave
- Message send/receive
- Typing indicators
- Event listeners

### Auth Store
Zustand store (`lib/store/authStore.ts`) manages:
- User state
- Login/logout
- Registration
- Profile updates
- Token persistence

## 🎨 Styling Guidelines

### Using Design System

**Primary Button**:
```tsx
<button className="btn-primary">Click Me</button>
```

**Gold Button**:
```tsx
<button className="btn-gold">Premium Action</button>
```

**Card with Ulos Border**:
```tsx
<div className="ulos-border-card">
  <div className="ulos-border-card-inner p-8">
    Content here
  </div>
</div>
```

**Glass Panel**:
```tsx
<div className="glass p-6 rounded-xl">
  Content here
</div>
```

**Badge**:
```tsx
<span className="badge badge-primary">Tag</span>
<span className="badge badge-gold">Premium</span>
```

## 📱 Responsive Design

All components are fully responsive:
- Mobile: Single column, collapsible sidebar
- Tablet: Two columns where appropriate
- Desktop: Full multi-column layout

Key breakpoints:
- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px

## 🚀 Production Build

```bash
npm run build
npm start
```

### Environment Variables for Production

Update `.env`:
```env
NEXT_PUBLIC_API_URL=https://api.bataknese.com/api/v1
NEXT_PUBLIC_SOCKET_URL=https://api.bataknese.com
```

## 🧪 Development Tips

### Hot Reload
Next.js 14 supports fast refresh. Save any file to see changes instantly.

### Type Safety
All API responses and state are fully typed. Check `lib/types.ts` for interfaces.

### State Management
Use Zustand for global state (auth). Use local state for component-specific data.

### Socket.io Events
Refer to `lib/hooks/useSocket.ts` for available socket methods and events.

## 📄 License

MIT

## 🤝 Contributing

Please ensure all PRs:
- Follow the design system
- Are fully typed (TypeScript)
- Are mobile-responsive
- Include comments for complex logic

## 📞 Support

For issues and questions, please contact the development team.

---

**Built with ❤️ for the Bataknese community**
