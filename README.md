# 🕹️ monoPokeBattle

**monoPokeBattle** es un experimento táctico de combate multijugador en tiempo real. Este proyecto nació como un hobby personal para explorar la integración de motores de juegos (**Phaser 4**) con frameworks modernos de UI (**React**) bajo una arquitectura de microservicios sincronizada por Sockets.

---

## ✨ Características Principales

- **🎮 Arena de Combate Híbrida**: Renderizado de alto rendimiento con **Phaser 4** para el gameplay y **React 19** para una HUD elegante.
- **👫 Multijugador Real-Time**: Sistema de emparejamiento (Matchmaking) y salas de batalla sincronizadas mediante **Socket.io**.
- **📸 Avatares Dinámicos**: Sube tu propia foto o captúrala con tu webcam. Las imágenes se procesan localmente, se recortan circularmente y se optimizan para una carga instantánea.
- **⚖️ Físicas Equitativas**: Sistema de velocidad lineal constante que garantiza que el combate sea justo independientemente de los FPS o el dispositivo.
- **📱 Responsivo Total**: Gracias al sistema `FIT` de Phaser, el campo de batalla mantiene su proporción (16:9) tanto en PC como en móviles.

---

## 🛠️ Stack Tecnológico

| Área | Tecnologías |
|---|---|
| **Frontend** | React 19, Vite 6, Tailwind CSS 4, Lucide Icons |
| **Game Engine** | Phaser 4 (Canvas / WebGL) |
| **Backend** | Node.js, Express, Socket.io |
| **Compartido** | TypeScript (Shared Interfaces & Events) |
| **Gestión** | PNPM Workspaces (Monorepo) |

---

## 🏗️ Estructura del Proyecto

```text
monoPokeBattle/
├── apps/
│   ├── backend/       # Servidor Node.js ( Matchmaking y Lógica de salas)
│   └── frontend/      # Aplicación React + Escenas de Phaser
├── packages/
│   └── shared/        # Tipos de TypeScript y constantes compartidas
└── README.md
```

---

## 🚀 Instalación y Ejecución

Este proyecto utiliza un monorepo gestionado por `pnpm`. Sigue estos pasos para correrlo localmente:

### Pre-requisitos
- [Node.js](https://nodejs.org/) (v16+)
- [pnpm](https://pnpm.io/installation)

### Pasos
1. **Clonar el repositorio**:
   ```bash
   git clone https://github.com/tu-usuario/monoPokeBattle.git
   cd monoPokeBattle
   ```

2. **Instalar dependencias**:
   ```bash
   pnpm install
   ```

3. **Iniciar el entorno de desarrollo**:
   ```bash
   pnpm --filter shared run build
   pnpm dev
   ```
   *Esto iniciará tanto el backend (puerto 3001) como el frontend (puerto 5173).*

---

## 🎨 Filosofía de Diseño
El proyecto busca una estética **Premium Dark Mode**, utilizando degradados vibrantes, efectos de difuminado (glassmorphism) y feedback visual intenso (Camera shakes, Flashes rojos, Traectorias animadas) para que cada clic se sienta con peso y propósito.

---

## 📄 Licencia
Este proyecto es un experimento personal de hobby y está bajo la licencia MIT. ¡Siéntete libre de explorarlo y dar feedback!

---

**Hecho X Nithel**
