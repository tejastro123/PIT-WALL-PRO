---
colors:
  brand:
    primary: "#E10600"
    primary-bright: "#FF1801"
  neutral:
    black: "#0D0D0D"
    dark: "#15151E"
    darker: "#0A0A0F"
    gray: "#38383F"
    gray-light: "#8E8E93"
    white: "#FFFFFF"
  teams:
    mercedes: "#27F4D2"
    ferrari: "#DC0000"
    redbull: "#0600EF"
    mclaren: "#FF8700"
    aston: "#229971"
    alpine: "#0093CC"
    williams: "#64C4FF"
    haas: "#B6BABD"
    audi: "#00887C"
    racingbulls: "#6692FF"
  accents:
    gold: "#FCD700"
    silver: "#C0C0C0"
    bronze: "#CD7F32"
    success: "#22C55E"
    warning: "#FACC15"
    error: "#EF4444"

typography:
  family:
    heading: "Orbitron, sans-serif"
    body: "Rajdhani, sans-serif"
    mono: "JetBrains Mono, monospace"
  size:
    xs: "10px"
    sm: "12px"
    base: "14px"
    lg: "18px"
    xl: "24px"
    xxl: "36px"
  weight:
    regular: 400
    medium: 500
    bold: 700

spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"

radii:
  none: "0px"
  sm: "4px"
  md: "8px"
  lg: "12px"

effects:
  clip:
    sm: "polygon(6px 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%, 0 6px)"
    md: "polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)"
    lg: "polygon(20px 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%, 0 20px)"
  glow:
    red: "0 0 15px rgba(225, 6, 0, 0.4)"
    red-hover: "0 8px 32px rgba(225, 6, 0, 0.2)"
  background:
    grid: "linear-gradient(90deg, rgba(225,6,0,0.025) 1px, transparent 1px), linear-gradient(0deg, rgba(225,6,0,0.025) 1px, transparent 1px)"
    grid-size: "60px 60px"

motion:
  duration:
    fast: "150ms"
    base: "300ms"
    slow: "600ms"
  easing:
    standard: "cubic-bezier(0.4, 0, 0.2, 1)"
    out: "cubic-bezier(0, 0, 0.2, 1)"
---

# Pit Wall Pro Design System

## Vision
The **Pit Wall Pro** design system is engineered to evoke the high-stakes, data-dense atmosphere of a Formula 1 command center. It prioritizes information density, technical precision, and real-time responsiveness. Every visual element is designed to make the user feel like a Race Engineer monitoring a live Grand Prix.

## Visual Language

### The "Command Center" Aesthetic
The interface uses a **Deep Dark** foundation (`neutral.darker`) to ensure high contrast for technical data. The primary accent is **F1 Red** (`brand.primary`), used sparingly for critical indicators, active states, and branding.

### Technical Textures
- **Tech Grid**: A persistent, subtle 60px background grid provides an underlying structure of technical alignment.
- **CRT Scanlines**: Vertical and horizontal scanline artifacts simulate a high-frequency digital monitor, adding a layer of professional "hardware" feel.
- **Micro-Metadata**: Monospaced labels at tiny scales (10px) provide secondary system status without cluttering the primary analytical view.

### Geometry & Form
The design system avoids the softness of standard rounded corners in favor of **Clipped Geometry**. Angular cut-outs at 6px, 10px, or 20px intervals convey speed and aerodynamic precision. Borders are thin (1.5px) and reactive, glowing when interactive elements are engaged.

## Components

### Analytical Cards
Cards use a subtle gradient background (`neutral.dark` to `neutral.black`) and feature reactive borders. On hover, a card subtly rises and projects a soft red glow, mimicking the activation of a high-performance terminal.

### Live Indicators
Live states are communicated through pulsing animations. A "Live Dot" uses a periodic scale transform to signal active data streaming without being visually distracting.

### Data Visualization
Charts use `JetBrains Mono` for all axis labels and tooltips, emphasizing the "raw data" nature of the telemetry being displayed. Team colors are used as functional identifiers to instantly associate data with drivers.

## Motion
Motion is functional, not decorative. 
- **Scanlines**: Move slowly (10s cycle) to create a sense of persistent refresh.
- **Tickers**: Use linear motion for constant data streams.
- **Transitions**: Use `cubic-bezier` for snappy, high-performance interaction feel.
