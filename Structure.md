PS X:\Project\Bataknese> tree /F
Folder PATH listing for volume 182
Volume serial number is 000001EA 30B6:2486
X:.
│   bataknese-complete.tar.gz
│   Confidential.md
│   package-lock.json
│   PROJECT-OVERVIEW.md
│   Structure.md
│   
├───.sixth
├───bataknese-backend
│   │   .env
│   │   .gitignore
│   │   bataknese-backend.tar.gz
│   │   package-lock.json
│   │   package.json
│   │   README.md
│   │
│   ├───.sixth
│   └───src
│       │   server.js
│       │
│       ├───config
│       │       database.js
│       │
│       ├───controllers
│       │       authController.js
│       │       chatController.js
│       │       communityController.js
│       │       userController.js
│       │
│       ├───database
│       │       schema.sql
│       │
│       ├───middleware
│       │       auth.js
│       │
│       ├───routes
│       │       index.js
│       │
│       └───socket
│               socketHandler.js
│
└───bataknese-frontend
    │   .env
    │   .gitignore
    │   frontend-static.tar.gz
    │   next-env.d.ts
    │   next.config.js
    │   package-lock.json
    │   package.json
    │   README.md
    │   tailwind.config.ts
    │   tsconfig.json
    │
    ├───app
    │   │   globals.css
    │   │   layout.tsx
    │   │   page.tsx
    │   │
    │   ├───(dashboard)
    │   │   │   layout.tsx
    │   │   │
    │   │   ├───chat
    │   │   │       page.tsx
    │   │   │
    │   │   ├───community
    │   │   │   │   page.tsx
    │   │   │   │
    │   │   │   └───[id]
    │   │   │           page.tsx
    │   │   │
    │   │   ├───dashboard
    │   │   │       page.tsx
    │   │   │
    │   │   └───directory
    │   │           page.tsx
    │   │
    │   └───auth
    │       ├───login
    │       │       page.tsx
    │       │
    │       └───register
    │               page.tsx
    │
    ├───components
    │   ├───chat
    │   │       DirectChat.tsx
    │   │
    │   ├───community
    │   │       ChatRoom.tsx
    │   │
    │   ├───id-card
    │   │       BatakIDCard.tsx
    │   │
    │   └───layout
    │           Sidebar.tsx
    │
    └───lib
        │   types.ts
        │   
        ├───api
        │       client.ts
        │
        ├───hooks
        │       useSocket.ts
        │
        └───store
                authStore.ts

PS X:\Project\Bataknese> 