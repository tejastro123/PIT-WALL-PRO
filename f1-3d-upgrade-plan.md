# 🏎 PIT WALL PRO — 3D WebGL Upgrade Blueprint

> **Stack:** `@react-three/fiber` · `@react-three/drei` · `@react-three/postprocessing` · `three` · `detect-gpu`
> **Codebase:** Next.js 14 · TypeScript · Tailwind · Zustand
> **Guarantee:** Zero breaking changes to existing UI — 3D layer slides *underneath*

---

## Install Everything First

```bash
npm install @react-three/fiber @react-three/drei @react-three/postprocessing three
npm install @types/three detect-gpu
npm install leva          # dev-only tweaking panel, remove before prod
```

---

## Phase Overview

| # | Phase | Priority | Duration |
|---|-------|----------|----------|
| 01 | 3D Foundation Layer | 🔴 CRITICAL | Week 1 |
| 02 | Particle Universe + Grid Floor | 🔴 CRITICAL | Week 1–2 |
| 03 | Scroll-Driven Camera | 🟠 HIGH | Week 2 |
| 04 | 3D Floating Dashboard Cards | 🟠 HIGH | Week 2–3 |
| 05 | Post-Processing FX | 🟡 MEDIUM | Week 3 |
| 06 | Live Telemetry Line in 3D | 🟡 MEDIUM | Week 3 |
| 07 | Mouse Parallax | 🟡 MEDIUM | Week 3–4 |
| 08 | Holographic Globe (AI/Calendar) | 🟢 POLISH | Week 4 |
| 09 | Performance & Mobile Guard | 🔴 CRITICAL | Week 4 |
| 10 | Route-Driven Camera Transitions | 🟢 POLISH | Week 4 |

---

## Phase 01 — 3D Foundation Layer

**Goal:** Inject a fixed WebGL canvas behind all existing pages. One file created, one line added to `layout.tsx`. Nothing else changes.

### Files

- `src/components/3d/SceneCanvas.tsx` ← **create**
- `src/components/3d/Scene.tsx` ← **create**
- `src/app/layout.tsx` ← **1 line added**

### Step 1 — Create `src/components/3d/SceneCanvas.tsx`

```tsx
"use client";
import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
import { Scene } from "./Scene";

export function SceneCanvas() {
  // Gate on client only — avoids SSR errors
  if (typeof window === "undefined") return null;

  const isMobile =
    window.innerWidth < 768 || /Mobi/.test(navigator.userAgent);

  if (isMobile) return null; // CSS-only fallback on mobile

  return (
    <div className="fixed inset-0 -z-10 pointer-events-none">
      <Canvas
        dpr={[1, 1.5]}                          // cap pixel ratio for perf
        gl={{ antialias: false, alpha: true }}  // alpha lets CSS bleed through
        camera={{ position: [0, 0, 6], fov: 50 }}
      >
        <Suspense fallback={null}>
          <Scene />
        </Suspense>
      </Canvas>
    </div>
  );
}
```

### Step 2 — Create `src/components/3d/Scene.tsx` (empty shell for now)

```tsx
"use client";
import { ambientLight } from "@react-three/fiber";

export function Scene() {
  return (
    <>
      <ambientLight intensity={0.3} />
      <directionalLight position={[5, 8, 5]} intensity={0.6} />
      {/* Phases 02–08 add content here */}
    </>
  );
}
```

### Step 3 — Inject into `src/app/layout.tsx`

```tsx
// Add this import at the top
import { SceneCanvas } from "@/components/3d/SceneCanvas";

// Add as FIRST child inside <Providers>:
<Providers>
  <SceneCanvas />          {/* ← the only change */}
  <CommandCenterOverlay />
  <Ticker />
  <Navbar />
  ...
</Providers>
```

> ⚠️ **Keep** `pointer-events-none` on the canvas wrapper div — or navbar clicks break.
> ⚠️ **Keep** `alpha: true` in the `gl` prop — lets your existing `#0a0a0f` CSS background show through.
> ⚠️ `SceneCanvas` is a Client Component — it **cannot** be the root of `layout.tsx`. It must live inside `<Providers>`.

---

## Phase 02 — Particle Universe + Grid Floor

**Goal:** Replace the CSS `body::before` grid with living WebGL equivalents. Same aesthetic, 10× more alive.

### Files

- `src/components/3d/ParticleField.tsx` ← **create**
- `src/components/3d/GridFloor.tsx` ← **create**
- `src/components/3d/Scene.tsx` ← **updated**
- `src/app/globals.css` ← **comment out `body::before`**

### Step 1 — Create `src/components/3d/ParticleField.tsx`

```tsx
"use client";
import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const COUNT = 2000;

export function ParticleField() {
  const meshRef = useRef<THREE.Points>(null);

  const [positions, speeds] = useMemo(() => {
    const pos = new Float32Array(COUNT * 3);
    const spd = new Float32Array(COUNT);
    for (let i = 0; i < COUNT; i++) {
      pos[i * 3]     = (Math.random() - 0.5) * 40;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 30;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 20;
      spd[i]         = 0.0005 + Math.random() * 0.001;
    }
    return [pos, spd];
  }, []);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const pos = meshRef.current.geometry.attributes.position
      .array as Float32Array;

    for (let i = 0; i < COUNT; i++) {
      pos[i * 3 + 1] += speeds[i];
      if (pos[i * 3 + 1] > 15) pos[i * 3 + 1] = -15; // loop
    }

    meshRef.current.geometry.attributes.position.needsUpdate = true;
    meshRef.current.rotation.y = clock.elapsedTime * 0.01;
  });

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={COUNT}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        color="#E10600"
        size={0.04}
        transparent
        opacity={0.5}
        sizeAttenuation
      />
    </points>
  );
}
```

### Step 2 — Create `src/components/3d/GridFloor.tsx`

```tsx
"use client";
import { Grid } from "@react-three/drei";

export function GridFloor() {
  return (
    <Grid
      position={[0, -4, 0]}
      args={[80, 80]}
      cellSize={1}
      cellThickness={0.3}
      cellColor="#38383F"
      sectionSize={5}
      sectionThickness={0.8}
      sectionColor="#E10600"
      fadeDistance={30}
      fadeStrength={2}
      followCamera={false}
      infiniteGrid
    />
  );
}
```

### Step 3 — Update `Scene.tsx`

```tsx
import { ParticleField } from "./ParticleField";
import { GridFloor } from "./GridFloor";

export function Scene() {
  return (
    <>
      <ambientLight intensity={0.3} />
      <directionalLight position={[5, 8, 5]} intensity={0.6} />
      <pointLight position={[-5, 3, -3]} color="#E10600" intensity={2} distance={15} />
      <pointLight position={[5, 3, -3]} color="#27F4D2" intensity={1} distance={10} />

      <ParticleField />
      <GridFloor />
    </>
  );
}
```

### Step 4 — Disable CSS grid in `globals.css`

```css
/* Comment out — GridFloor replaces this */
/*
body::before {
  content: '';
  position: fixed;
  inset: 0;
  background:
    linear-gradient(90deg, rgba(225,6,0,0.025) 1px, transparent 1px),
    linear-gradient(0deg, rgba(225,6,0,0.025) 1px, transparent 1px);
  background-size: 60px 60px;
  pointer-events: none;
  z-index: 0;
}
*/

/* Keep body::after (scanline) — it overlays WebGL for the CRT effect */
```

> ⚠️ Keep `COUNT ≤ 3000` for 60 FPS on integrated GPUs.
> ⚠️ The CSS scanline (`body::after`) **stays** — it overlays the canvas for the CRT feel.

---

## Phase 03 — Scroll-Driven Camera

**Goal:** Window scroll controls camera Z position. Scrolling down = flying deeper into the data tunnel.

### Files

- `src/hooks/useScrollCamera.ts` ← **create**
- `src/components/3d/CameraRig.tsx` ← **create**
- `src/components/3d/Scene.tsx` ← **updated**

### Step 1 — Create `src/hooks/useScrollCamera.ts`

```ts
import { useEffect, useRef } from "react";

export function useScrollCamera() {
  const scrollY = useRef(0);

  useEffect(() => {
    const onScroll = () => { scrollY.current = window.scrollY; };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return scrollY;
}
```

### Step 2 — Create `src/components/3d/CameraRig.tsx`

```tsx
"use client";
import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useScrollCamera } from "@/hooks/useScrollCamera";
import * as THREE from "three";

export function CameraRig() {
  const { camera } = useThree();
  const scrollY = useScrollCamera();
  const target = useRef(new THREE.Vector3(0, 0, 6));

  useFrame(() => {
    const maxScroll = document.body.scrollHeight - window.innerHeight;
    const progress = maxScroll > 0 ? scrollY.current / maxScroll : 0;

    target.current.z = 6 - progress * 8;     // fly forward
    target.current.y = progress * 1.5;        // slight tilt up

    camera.position.lerp(target.current, 0.04); // 0.04 = smooth
    camera.lookAt(0, 0, 0);
  });

  return null;
}
```

### Step 3 — Add to `Scene.tsx`

```tsx
import { CameraRig } from "./CameraRig";

// Inside Scene() return:
<CameraRig />
```

> ⚠️ `lerp(target, 0.04)` — increase to `0.1` for snappier feel, never above `0.2` or it overshoots.
> ⚠️ Disable on `/live` page — scroll there is inside a container div, not `window`.

---

## Phase 04 — 3D Floating Dashboard Cards

**Goal:** Key dashboard cards float in 3D space with gentle animation. Your existing React components live *inside* them via `<Html>` — zero rewrite.

### Files

- `src/components/3d/FloatingCard.tsx` ← **create**
- `src/components/dashboard/NextRaceCardCompact.tsx` ← **create (stripped inner content)**
- `src/components/3d/Scene.tsx` ← **updated**

### Step 1 — Create `src/components/3d/FloatingCard.tsx`

```tsx
"use client";
import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Html, RoundedBox } from "@react-three/drei";
import * as THREE from "three";

interface FloatingCardProps {
  position: [number, number, number];
  children: React.ReactNode;
  width?: number;
  height?: number;
  color?: string;
  floatAmplitude?: number;
}

export function FloatingCard({
  position,
  children,
  width = 4,
  height = 2.5,
  color = "#E10600",
  floatAmplitude = 0.08,
}: FloatingCardProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const phase = useRef(Math.random() * Math.PI * 2); // unique float phase

  useFrame(({ clock }) => {
    if (!meshRef.current) return;

    // Gentle float
    meshRef.current.position.y =
      position[1] + Math.sin(clock.elapsedTime * 0.5 + phase.current) * floatAmplitude;

    // Hover lift + scale
    const targetScale = hovered ? 1.04 : 1;
    meshRef.current.scale.lerp(
      new THREE.Vector3(targetScale, targetScale, targetScale),
      0.08
    );
  });

  return (
    <mesh
      ref={meshRef}
      position={position}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      {/* Glass panel */}
      <RoundedBox args={[width, height, 0.05]} radius={0.02} smoothness={4}>
        <meshStandardMaterial
          color="#15151E"
          transparent
          opacity={0.6}
          roughness={0.1}
          metalness={0.8}
          emissive={color}
          emissiveIntensity={hovered ? 0.15 : 0.05}
        />
      </RoundedBox>

      {/* Neon edge glow */}
      <lineSegments>
        <edgesGeometry args={[new THREE.BoxGeometry(width, height, 0.05)]} />
        <lineBasicMaterial
          color={color}
          transparent
          opacity={hovered ? 0.9 : 0.4}
        />
      </lineSegments>

      {/* React UI overlay */}
      <Html
        center
        transform
        occlude={false}
        style={{
          width: width * 100,
          height: height * 100,
          pointerEvents: hovered ? "auto" : "none",
        }}
      >
        {children}
      </Html>
    </mesh>
  );
}
```

### Step 2 — Usage in `Scene.tsx`

```tsx
import { FloatingCard } from "./FloatingCard";
import { NextRaceCardCompact } from "@/components/dashboard/NextRaceCardCompact";

// Inside Scene() return — only on home page:
<FloatingCard position={[0, 0.5, 2]} width={5} height={2.8} color="#E10600">
  <NextRaceCardCompact />
</FloatingCard>
```

### Step 3 — Create `NextRaceCardCompact`

Strip `NextRaceCard` down to just the inner content (no outer `motion.div` wrapper). The `FloatingCard` mesh is the outer container in 3D space.

> ⚠️ Only put **2–3 cards max** in 3D space — more hurts perf and readability.
> ⚠️ `Html center + transform` keeps the React DOM readable and screen-reader accessible.
> ⚠️ Gate scene cards with `usePathname()` — only render on `/`.

---

## Phase 05 — Post-Processing FX

**Goal:** Bloom, ChromaticAberration, Vignette, Scanline, and film grain — turns the HUD from flat to cinematic.

### Files

- `src/components/3d/Effects.tsx` ← **create**
- `src/components/3d/Scene.tsx` ← **updated**

### Step 1 — Create `src/components/3d/Effects.tsx`

```tsx
"use client";
import {
  EffectComposer,
  Bloom,
  ChromaticAberration,
  Scanline,
  Vignette,
  Noise,
} from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";
import { Vector2 } from "three";

export function Effects() {
  return (
    <EffectComposer>
      {/* Red glow on bright emissive elements (borders, neon lines) */}
      <Bloom
        luminanceThreshold={0.4}
        luminanceSmoothing={0.9}
        intensity={0.8}
        mipmapBlur
      />

      {/* Subtle RGB split — F1 broadcast feel */}
      <ChromaticAberration
        blendFunction={BlendFunction.NORMAL}
        offset={new Vector2(0.0005, 0.0005)}
        radialModulation={false}
        modulationOffset={0.15}
      />

      {/* CRT scanlines — reinforces the existing CSS scanline */}
      <Scanline
        blendFunction={BlendFunction.OVERLAY}
        density={1.5}
        opacity={0.05}
      />

      {/* Corner darkening — pulls focus to center */}
      <Vignette eskil={false} offset={0.1} darkness={0.6} />

      {/* Film grain */}
      <Noise premultiply opacity={0.025} />
    </EffectComposer>
  );
}
```

### Step 2 — Add to `Scene.tsx`

```tsx
import { Effects } from "./Effects";

// Add as LAST child inside Scene() return:
<Effects />
```

> ⚠️ Bloom `intensity > 1.5` tanks FPS — keep ≤ `0.8`.
> ⚠️ ChromaticAberration `offset > 0.002` looks broken, not stylish.
> ⚠️ Wrap `<Effects />` in `<Suspense>` so it doesn't block hydration.

---

## Phase 06 — Live Telemetry Line in 3D

**Goal:** Render the live speed history from `useLiveRaceStore` as a real-time 3D polyline — bridges your Zustand store directly to WebGL.

### Files

- `src/components/3d/TelemetryLine.tsx` ← **create**
- `src/components/3d/Scene.tsx` ← **updated**

### Step 1 — Create `src/components/3d/TelemetryLine.tsx`

```tsx
"use client";
import { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useLiveRaceStore } from "@/store/f1Store";

export function TelemetryLine({ driverCode }: { driverCode: string }) {
  const lineRef = useRef<THREE.Line>(null);
  const historyRef = useRef<number[]>([]);
  const { liveRace } = useLiveRaceStore();

  const driver = liveRace?.drivers.find(d => d.driverCode === driverCode);

  // Append latest speed to ring buffer
  useEffect(() => {
    if (!driver?.speed) return;
    historyRef.current.push(driver.speed);
    if (historyRef.current.length > 100) historyRef.current.shift();
  }, [driver?.speed]);

  useFrame(() => {
    if (!lineRef.current || historyRef.current.length < 2) return;

    const points = historyRef.current.map((spd, i) => {
      const x = (i / 100) * 8 - 4;
      const y = ((spd - 200) / 200) * 1.5; // normalize 200–400 km/h → 0–1.5
      return new THREE.Vector3(x, y, 0);
    });

    const newGeo = new THREE.BufferGeometry().setFromPoints(points);
    lineRef.current.geometry.dispose(); // prevent GPU memory leak
    lineRef.current.geometry = newGeo;
  });

  return (
    <line ref={lineRef as any} position={[0, -1.5, 1.5]}>
      <bufferGeometry />
      <lineBasicMaterial color="#E10600" />
    </line>
  );
}
```

### Step 2 — Add to `Scene.tsx` (gated to `/live` route)

```tsx
import { usePathname } from "next/navigation";
import { TelemetryLine } from "./TelemetryLine";

// Inside Scene():
const pathname = usePathname();

{pathname === "/live" && <TelemetryLine driverCode="VER" />}
```

> ⚠️ Always `geometry.dispose()` before replacing — otherwise you leak VRAM every frame.
> ⚠️ `linewidth` > 1 requires `LineMaterial` from `three/addons`, not `lineBasicMaterial`.

---

## Phase 07 — Mouse Parallax

**Goal:** The particle field and camera subtly track cursor movement — makes the entire viewport feel physically responsive.

### Files

- `src/hooks/useMouseParallax.ts` ← **create**
- `src/components/3d/CameraRig.tsx` ← **updated**

### Step 1 — Create `src/hooks/useMouseParallax.ts`

```ts
import { useEffect, useRef } from "react";

export function useMouseParallax() {
  const mouse = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      mouse.current.x = (e.clientX / window.innerWidth - 0.5) * 2;  // -1 → 1
      mouse.current.y = -(e.clientY / window.innerHeight - 0.5) * 2; // -1 → 1
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  return mouse;
}
```

### Step 2 — Update `CameraRig.tsx` — combine scroll + mouse

```tsx
import { useMouseParallax } from "@/hooks/useMouseParallax";

// Inside CameraRig:
const mouse = useMouseParallax();

useFrame(() => {
  const maxScroll = document.body.scrollHeight - window.innerHeight;
  const scroll = maxScroll > 0 ? scrollY.current / maxScroll : 0;

  target.current.x = mouse.current.x * 0.4;             // pan with mouse X
  target.current.y = mouse.current.y * 0.3 + scroll * 1.5;
  target.current.z = 6 - scroll * 8;

  camera.position.lerp(target.current, 0.04);
  camera.lookAt(0, 0, 0);
});
```

> ⚠️ Parallax strength > `0.8` causes motion sickness — keep X ≤ `0.4`, Y ≤ `0.3`.
> ⚠️ Add a `prefers-reduced-motion` check and skip if set — it's an accessibility requirement.

```ts
// Add to useMouseParallax.ts:
const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
if (reduced) return; // skip all animation
```

---

## Phase 08 — Holographic Globe

**Goal:** The `/ai` page hero becomes a rotating Earth with glowing F1 circuit markers — data pulled from your existing `races[]` store.

### Files

- `src/components/3d/HoloGlobe.tsx` ← **create**
- `src/app/ai/page.tsx` ← **minor update to hero section**

### Step 1 — Create `src/components/3d/HoloGlobe.tsx`

```tsx
"use client";
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Sphere } from "@react-three/drei";
import * as THREE from "three";

// Lat/lng → 3D sphere coordinates
function latLngTo3D(lat: number, lng: number, r = 1.5): THREE.Vector3 {
  const phi   = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -r * Math.sin(phi) * Math.cos(theta),
     r * Math.cos(phi),
     r * Math.sin(phi) * Math.sin(theta)
  );
}

const CIRCUIT_COORDS: Record<string, [number, number]> = {
  "Bahrain":       [26.03,  50.51],
  "Saudi Arabia":  [21.63,  39.10],
  "Australia":     [-37.84, 144.96],
  "Japan":         [34.84, 136.54],
  "China":         [31.34, 121.22],
  "Monaco":        [43.73,   7.42],
  "Canada":        [45.50,  -73.52],
  "UK":            [52.07,  -1.02],
  "Hungary":       [47.58,  19.25],
  "Belgium":       [50.44,   5.97],
  "Netherlands":   [52.38,   4.54],
  "Italy":         [45.62,   9.28],
  "Singapore":     [1.29,  103.86],
  "Mexico":        [19.40,  -99.09],
  "Brazil":        [-23.70, -46.70],
  "Las Vegas":     [36.12, -115.17],
  "Abu Dhabi":     [24.47,  54.60],
};

export function HoloGlobe() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = clock.elapsedTime * 0.1;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Opaque globe shell */}
      <Sphere args={[1.5, 64, 64]}>
        <meshStandardMaterial
          color="#0a0a1a"
          transparent
          opacity={0.85}
          emissive="#0600EF"
          emissiveIntensity={0.2}
          roughness={0.8}
          metalness={0.4}
        />
      </Sphere>

      {/* Wireframe latitude/longitude grid */}
      <Sphere args={[1.51, 24, 24]}>
        <meshBasicMaterial
          color="#27F4D2"
          wireframe
          transparent
          opacity={0.08}
        />
      </Sphere>

      {/* Outer atmosphere glow */}
      <Sphere args={[1.58, 32, 32]}>
        <meshBasicMaterial
          color="#0600EF"
          transparent
          opacity={0.04}
          side={THREE.BackSide}
        />
      </Sphere>

      {/* Circuit markers */}
      {Object.entries(CIRCUIT_COORDS).map(([name, [lat, lng]]) => {
        const pos = latLngTo3D(lat, lng);
        return (
          <group key={name} position={[pos.x, pos.y, pos.z]}>
            {/* Core dot */}
            <mesh>
              <sphereGeometry args={[0.03, 8, 8]} />
              <meshStandardMaterial
                color="#E10600"
                emissive="#E10600"
                emissiveIntensity={2}
              />
            </mesh>
            {/* Pulse ring */}
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <ringGeometry args={[0.04, 0.06, 16]} />
              <meshBasicMaterial
                color="#E10600"
                transparent
                opacity={0.5}
                side={THREE.DoubleSide}
              />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}
```

### Step 2 — Embed in `/ai` page with a dedicated mini Canvas

```tsx
// src/app/ai/page.tsx — replace hero <motion.div> with:
import dynamic from "next/dynamic";
import { Canvas } from "@react-three/fiber";
import { HoloGlobe } from "@/components/3d/HoloGlobe";

// In the hero section JSX:
<div className="relative h-48 w-48 mx-auto mb-8">
  <Canvas camera={{ position: [0, 0, 4], fov: 45 }}>
    <ambientLight intensity={0.5} />
    <pointLight position={[5, 5, 5]} color="#E10600" intensity={2} />
    <HoloGlobe />
  </Canvas>
</div>
```

> ⚠️ Use a **local** `<Canvas>` on the AI page, not the global SceneCanvas — keeps it scoped.
> ⚠️ Lazy-load with `dynamic(() => import(...), { ssr: false })` to prevent SSR crash.

---

## Phase 09 — Performance & Mobile Guard 🔴 CRITICAL

**Goal:** Never ship 3D that drops frames. Detect GPU capability and degrade gracefully.

### Files

- `src/hooks/useGPUTier.ts` ← **create**
- `src/components/3d/SceneCanvas.tsx` ← **updated**

### Step 1 — Create `src/hooks/useGPUTier.ts`

```ts
import { useEffect, useState } from "react";
import { getGPUTier } from "detect-gpu";

export type GPUTier = 0 | 1 | 2 | 3;

export function useGPUTier(): GPUTier {
  const [tier, setTier] = useState<GPUTier>(2); // optimistic default

  useEffect(() => {
    getGPUTier().then(result => {
      setTier((result.tier as GPUTier) ?? 2);
    });
  }, []);

  return tier;
}
```

### Step 2 — Update `SceneCanvas.tsx` with adaptive quality

```tsx
import { useGPUTier } from "@/hooks/useGPUTier";

const QUALITY = {
  0: { dpr: 0.5,  particles: 500,  effects: false, cards: false },
  1: { dpr: 1,    particles: 1000, effects: false, cards: false },
  2: { dpr: 1.5,  particles: 2000, effects: true,  cards: true  },
  3: { dpr: 2,    particles: 3000, effects: true,  cards: true  },
} as const;

export function SceneCanvas() {
  const tier = useGPUTier();
  const isMobile = /* ... window.innerWidth < 768 ... */;
  const prefersReduced =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (isMobile || tier === 0 || prefersReduced) return null;

  const q = QUALITY[tier];

  return (
    <div className="fixed inset-0 -z-10 pointer-events-none">
      <Canvas dpr={[1, q.dpr]} gl={{ antialias: tier >= 2, alpha: true }}>
        <Suspense fallback={null}>
          <Scene
            particleCount={q.particles}
            enableEffects={q.effects}
            enableCards={q.cards}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
```

### Performance Targets

| Metric | Target |
|--------|--------|
| FPS | ≥ 60 on tier 2+ GPU |
| Initial 3D load | < 200ms |
| GPU memory | < 150MB total |
| Bundle size increase | < 80KB gzipped |
| Mobile | Full CSS fallback, zero JS 3D |

> ⚠️ Test on **real hardware**, not just Chrome DevTools.
> ⚠️ Test Safari on iOS — WebGL2 has quirks on older iPhones.
> ⚠️ Add `<noscript>` CSS that restores `body::before` grid when JS is disabled.

---

## Phase 10 — Route-Driven Camera Transitions

**Goal:** Navigating between pages moves the camera — `/live` zooms in close, `/ai` pulls back to see the globe.

### Files

- `src/store/cameraStore.ts` ← **create**
- `src/components/3d/CameraRig.tsx` ← **updated**

### Step 1 — Create `src/store/cameraStore.ts`

```ts
import { create } from "zustand";
import * as THREE from "three";

interface CameraState {
  target: THREE.Vector3;
  fov: number;
  setTarget: (pos: [number, number, number], fov?: number) => void;
}

export const PAGE_CAMERAS: Record<string, [number, number, number]> = {
  "/":             [0,  0,  6],  // home — standard view
  "/live":         [0,  0,  3],  // live — close up, immersive
  "/ai":           [0,  1,  9],  // AI — pull back to see globe
  "/analysis":     [-2, 0,  5],  // telemetry — slight left pan
  "/strategy":     [2,  0,  5],  // strategy — slight right pan
  "/analytics":    [0, -1,  7],  // analytics — low angle
  "/championship": [0,  2,  8],  // championship — epic wide
  "/calendar":     [0,  0,  6],  // calendar — standard
};

export const useCameraStore = create<CameraState>((set) => ({
  target: new THREE.Vector3(0, 0, 6),
  fov: 50,
  setTarget: (pos, fov = 50) =>
    set({ target: new THREE.Vector3(...pos), fov }),
}));
```

### Step 2 — Update `CameraRig.tsx` — auto-apply on route change

```tsx
import { usePathname } from "next/navigation";
import { useCameraStore, PAGE_CAMERAS } from "@/store/cameraStore";

export function CameraRig() {
  const pathname = usePathname();
  const { setTarget } = useCameraStore();

  // Fire camera move on route change
  useEffect(() => {
    const pos = PAGE_CAMERAS[pathname] ?? [0, 0, 6];
    setTarget(pos);
  }, [pathname, setTarget]);

  // ... rest of useFrame logic reads from useCameraStore target
}
```

### Step 3 — Optional: fire from Navbar on click (instant feel)

```tsx
// In Navbar.tsx Link onClick:
import { useCameraStore, PAGE_CAMERAS } from "@/store/cameraStore";

const { setTarget } = useCameraStore();

// On each nav link:
onClick={() => setTarget(PAGE_CAMERAS[href] ?? [0, 0, 6])}
```

> ⚠️ Use `usePathname()` in `CameraRig` for direct URL loads — not only nav clicks.
> ⚠️ Don't apply camera transitions to modal/sheet routes — only full page routes.

---

## Final Scene.tsx (All Phases Combined)

```tsx
"use client";
import { usePathname } from "next/navigation";
import { ParticleField } from "./ParticleField";
import { GridFloor } from "./GridFloor";
import { CameraRig } from "./CameraRig";
import { FloatingCard } from "./FloatingCard";
import { TelemetryLine } from "./TelemetryLine";
import { HoloGlobe } from "./HoloGlobe";
import { Effects } from "./Effects";
import { NextRaceCardCompact } from "@/components/dashboard/NextRaceCardCompact";

interface SceneProps {
  particleCount?: number;
  enableEffects?: boolean;
  enableCards?: boolean;
}

export function Scene({
  particleCount = 2000,
  enableEffects = true,
  enableCards = true,
}: SceneProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Lights */}
      <ambientLight intensity={0.3} />
      <directionalLight position={[5, 8, 5]} intensity={0.6} />
      <pointLight position={[-5, 3, -3]} color="#E10600" intensity={2} distance={15} />
      <pointLight position={[5, 3, -3]} color="#27F4D2" intensity={1} distance={10} />

      {/* Base environment */}
      <ParticleField count={particleCount} />
      <GridFloor />

      {/* Camera controller */}
      <CameraRig />

      {/* Home page — floating cards */}
      {enableCards && pathname === "/" && (
        <FloatingCard position={[0, 0.5, 2]} width={5} height={2.8}>
          <NextRaceCardCompact />
        </FloatingCard>
      )}

      {/* Live page — real-time speed line */}
      {pathname === "/live" && <TelemetryLine driverCode="VER" />}

      {/* AI page — holographic globe */}
      {pathname === "/ai" && (
        <group position={[3, 0, 0]}>
          <HoloGlobe />
        </group>
      )}

      {/* Post-processing — last */}
      {enableEffects && <Effects />}
    </>
  );
}
```

---

## Package.json Changes Summary

```json
{
  "dependencies": {
    "@react-three/drei": "^9.x",
    "@react-three/fiber": "^8.x",
    "@react-three/postprocessing": "^2.x",
    "detect-gpu": "^5.x",
    "three": "^0.165.x"
  },
  "devDependencies": {
    "@types/three": "^0.165.x",
    "leva": "^0.9.x"
  }
}
```

---

## Key Rules — Never Break These

| Rule | Why |
|------|-----|
| `pointer-events-none` on canvas wrapper | Navigation must work |
| `alpha: true` in `gl` prop | CSS background shows through |
| `geometry.dispose()` before replacing | Prevents VRAM leak |
| GPU tier check before any 3D render | No frame drops on low-end |
| `prefers-reduced-motion` check | Accessibility requirement |
| Only 2–3 `FloatingCard` at once | More = performance cliff |
| `Bloom intensity ≤ 0.8` | Higher = FPS tank |
| `ChromaticAberration offset ≤ 0.002` | Higher = looks broken |
| Mobile: `return null` from SceneCanvas | Full CSS fallback |
| Wrap all scene children in `<Suspense>` | Prevents hydration crash |
