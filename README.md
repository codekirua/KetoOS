# KetoOS — A Web-Based Agentic AI OS

KetoOS is a modern web-based desktop environment inspired by classic macOS and Windows, built with a cutting-edge web stack and AI integration.  
It includes multiple built-in applications, a familiar desktop interface, and a system-wide AI agent.  
Runs on desktop, tablet, and mobile.

---

## 🚀 Features

### Desktop Environment
- macOS and Windows-style desktop interactions  
- Multi-instance window manager (multiple windows per app)  
- Cross-device window resizing  
- Menubar with app-specific menus (or taskbar + Start menu for Windows themes)  
- Icon and list views  
- Customizable wallpapers (photos, patterns, videos)  
- System-wide sound effects (sampled + synth)  
- Integrated **Keto AI** agent with context awareness  
- Virtual file system with local storage persistence and Backup / Restore  

### Themes
- **System 7, Aqua (Mac OS X), Windows XP, Windows 98**  
- macOS themes use a top menubar with traffic-light controls  
- Windows themes use a taskbar + Start menu with classic buttons  
- Theme-specific fonts, icons, wallpapers, and styled controls  

### Built-in Applications
- **Finder** – File manager with Quick Access & storage info  
- **TextEdit** – Rich text editor with Markdown + task list support  
- **MacPaint** – Classic bitmap editor with drawing tools, shapes, patterns, undo/redo, import/export  
- **Videos** – Retro YouTube playlist player with VCR-style UI  
- **Soundboard** – Custom soundboards with recording, waveform, import/export  
- **Synth** – Virtual synthesizer with MIDI, effects, presets  
- **Photo Booth** – Webcam app with filters, gallery, and export  
- **Internet Explorer (Time Machine)** – Explore sites across eras with AI reimagining  
- **Chats** – AI-powered chat with voice, DJ mode, tool calling, transcript saving  
- **Control Panels** – Preferences: themes, shaders, sounds, Backup/Restore, reset  
- **Minesweeper** – Classic implementation  
- **Virtual PC** – DOS game emulator with save states  
- **Terminal** – Unix-like CLI with AI commands + app integration  
- **iPod** – 1st-gen iPod-style music player with YouTube import, synced lyrics, translations, playlists  

---

## 📂 Project Structure

- **project/**
  - **public/** – Static assets  
    - `assets/` – Videos, sounds, media  
    - `fonts/` – Fonts  
    - `icons/` – UI icons  
    - `patterns/` – Patterns  
    - `wallpapers/` – Wallpapers  
  - **src/**  
    - `apps/` – Individual applications  
    - `components/` – Shared React components  
    - `config/` – Configuration  
    - `contexts/` – React contexts  
    - `hooks/` – Custom hooks  
    - `lib/` – Libraries and utilities  
    - `stores/` – State management  
    - `styles/` – Styling  
    - `types/` – TypeScript definitions  
    - `utils/` – Helper functions  
  - **api/** – API endpoints  
  - **config files** – `vite.config.ts`, `tsconfig.json`, `package.json`

---

## ⚙️ Development

KetoOS is built with:  
- **TypeScript** – type safety  
- **ESLint** – linting  
- **Tailwind CSS** – utility-first styling  
- **shadcn/ui** – UI components (Radix primitives)  
- **Lucide** – icons  
- **Vercel** – deployment  

### Scripts
```bash
bun dev         # start development server
bun run build   # build for production
bun run lint    # run ESLint
bun run preview # preview production build


---

📜 License

This project is licensed under the AGPL-3.0 License – see LICENSE for details.

---

🤝 Contributing

This way, the **Project Structure is now GitHub-native Markdown**, so it renders as a collapsible tree-style list instead of a plain code block.  

Do you also want me to add **collapsible sections** (`<details>` tags) so people can expand/collapse each part of the project tree? That’s a common trick in polished GitHub READMEs.



