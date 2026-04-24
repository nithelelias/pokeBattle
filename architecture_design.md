# Technical Architecture: monoPokeBattle

## Overview
**monoPokeBattle** is a real-time multiplayer tactical arena game built with a modern hybrid stack. It leverages the UI management of **React 19**, the high-performance rendering of **Phaser 4**, and the real-time synchronization of **Socket.io**.

## Tech Stack
- **Frontend**: React 19 (Vite 6), Tailwind CSS 4, Lucide Icons.
- **Game Engine**: Phaser 4 (Canvas/WebGL) for the Battle Arena.
- **Backend**: Node.js, Express, Socket.io.
- **Language**: TypeScript (Strict Mode).
- **Architecture**: Monorepo managed via `pnpm` workspaces.

## System Architecture Diagram

```mermaid
graph TD
    subgraph Client (Frontend)
        A[React App] --> B[Setup/Lobby DOM]
        A --> C[Battle Scene Bridge]
        C --> D[Phaser Game Engine]
    end

    subgraph Memory (State)
        B --> E[LocalStorage]
        D --> E
    end

    subgraph Server (Backend)
        F[Socket.io Server]
        G[Matchmaking Queue]
        H[Active Matches Rooms]
        F --> G
        G --> H
    end

    A <-->|Events| F
    D <-->|Movement/Input| F
```

## Key Architectural Decisions

### 1. The Hybrid Rendering Engine (React + Phaser)
The most sensitive part of the project is the **Battle Arena**. Instead of using raw DOM elements or a standard Canvas, we use a hybrid approach:
- **Phaser 4** handles the "Stage": player sprites, physics, background grids, and trajectory lines. It provides a fixed virtual resolution (**1280x720**) using `Phaser.Scale.FIT` to ensure every player sees the exact same battlefield regardless of device.
- **React 19** handles the "HUD": Health bars, player stats, and Game Over banners are rendered as HTML overlays over the Phaser canvas for maximum visual fidelity and ease of styling.

### 2. Communication Bridge
We avoid coupling Phaser directly to Sockets. Instead, the `BattleScene.tsx` (React) acts as a high-level controller:
- It listens to Socket events and pushes data into Phaser via a `GameManager` reference.
- It listens to Phaser internal events (local events) and emits them to the socket.

### 3. Constant Linear Velocity Physics
To ensure tactical fairness, movement is not eased (no Lerping). We implemented **Constant Linear Velocity**:
- The speed is calculated as a factor of the `Speed` stat.
- The movement vector is normalized, ensuring that moving diagonally is not faster than moving straight.
- This logic is mirrored in the Phaser `update()` loop for the local player and the opponent's interpolation.

### 4. Data Serialization
- **Avatars**: Users can upload or capture photos. To avoid external hosting, we process these as **Base64 strings**.
- **Preprocessing**: Before transmission, images are compressed and pre-baked into **circular PNGs** using a hidden canvas in the Setup phase. This removes the need for real-time masking in the game engine, significantly improving performance on mobile.

## Project Structure
```text
monoPokeBattle/
├── apps/
│   ├── backend/       # Node.js + Socket.io (Matchmaking logic)
│   └── frontend/      # React + Phaser 3 (UI & Engine)
├── packages/
│   └── shared/        # Shared Interfaces, Constants & Events
└── package.json       # Monorepo Orchestration
```
