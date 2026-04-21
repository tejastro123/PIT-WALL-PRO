# 🏁 Pit Wall Pro - F1 Analytics & Strategy Dashboard

Pit Wall Pro is a professional-grade Formula 1 analytics platform that combines real-time telemetry analysis with AI-driven strategy insights. Designed for race engineers and F1 enthusiasts, it provides a high-precision interface for monitoring driver performance, session breakdowns, and predictive modeling.

![Dashboard Preview](https://via.placeholder.com/1200x600?text=Pit+Wall+Pro+Dashboard+Preview)

## 🚀 Features

- **Real-time Telemetry**: High-precision driver telemetry visualization using `Fast-F1`.
- **AI Strategy Engine**: Leveraging Google Generative AI for race scenario analysis and tactical recommendations.
- **Predictive Modeling**: Advanced algorithms for qualifying and race pace projections.
- **Modern UI**: A sleek, high-performance dashboard built with Next.js 15, Framer Motion, and Tailwind CSS.
- **Session Analysis**: Comprehensive breakdowns of practice, qualifying, and race sessions.

## 🛠 Tech Stack

- **Frontend**: Next.js 15 (App Router), TypeScript, Tailwind CSS, Framer Motion, Recharts, Zustand.
- **Backend**: Python (FastAPI), Fast-F1 Library, Pandas.
- **AI**: Google Generative AI (Gemini Pro).

## 📥 Getting Started

### Prerequisites

- Node.js 20+ and npm/pnpm/yarn.
- Python 3.10+
- A Google Gemini API Key.

### 1. Frontend Setup

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env and add your GOOGLE_GENERATIVE_AI_API_KEY

# Run the development server
npm run dev
```

### 2. Backend Setup

```bash
cd python-backend

# Create a virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run the backend server
python main.py
```

## 🏗 Project Structure

- `/src`: Next.js frontend source code.
- `/python-backend`: Python API for F1 telemetry and data processing.
- `/public`: Static assets and icons.

## 📄 License

This project is licensed under the MIT License.

---

*Note: This project is an unofficial tool and is not affiliated with Formula 1 or the FIA.*
