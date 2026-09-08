# Enterprise IT Support AI

## Installation Guide

## 1. Prerequisites

### Required for Everyone

Install:

* Git
* Python 3.12
* Node.js 20+
* npm
* PostgreSQL 14+
* VS Code

### iOS Requirements

For iOS development, you need:

* macOS
* Xcode
* iOS Simulator
* Xcode Command Line Tools

Verify:

```bash
git --version
python3.12 --version
node --version
npm --version
psql --version
xcodebuild -version
```

---

# 2. Clone the Project

```bash
git clone https://github.com/sachin508508/enterprise-it-support.git
cd enterprise-it-support
```

---

# 3. Backend Installation

Create Python virtual environment:

```bash
python3.12 -m venv .venv
```

Activate it.

### macOS / Linux

```bash
source .venv/bin/activate
```

### Windows

```powershell
.venv\Scripts\activate
```

Install dependencies:

```bash
pip install -r backend/requirements.txt
```

Create environment file:

```bash
cp backend/.env.example backend/.env
```

Configure the required values in:

```text
backend/.env
```

---

# 4. Database Installation

Create the PostgreSQL database:

```bash
createdb it_operations_db
```

Create tables:

```bash
psql -d it_operations_db -f database/schema.sql
```

Load demo data:

```bash
psql -d it_operations_db -f database/seed.sql
```

---

# 5. RAG Setup

From the project root:

```bash
./scripts/setup_rag.sh
```

---

# 6. Start Backend

```bash
cd backend
uvicorn api.main:app --reload --port 8000
```

Backend:

```text
http://localhost:8000
```

---

# 7. Frontend Installation

Open a new terminal:

```bash
cd frontend
npm install
```

---

# 8. iOS Installation & Run

### Prerequisites

* macOS
* Xcode
* iOS Simulator

Start the Simulator:

```bash
open -a Simulator
```

Start Expo:

```bash
npx expo start --ios
```

The application will open in the iOS Simulator.

---

# 9. Android Installation & Run

### Prerequisites

Install:

* Android Studio
* Android SDK
* Android Emulator
* Android SDK Platform Tools

Create and start an Android Emulator from Android Studio.

Then:

```bash
cd frontend
npx expo start --android
```

The application will open in the Android Emulator.

---

# 10. Physical iPhone / Android

The computer and phone must be connected to the **same Wi-Fi network**.

The FastAPI backend must be accessible using the computer's local IP address instead of:

```text
localhost
```

For example:

```text
http://192.168.1.25:8000
```

The frontend API configuration must use the appropriate local IP for physical-device testing.

---

# 11. Demo Login

### Employee

```text
Employee ID: EMP001
Password: DemoPassword@123
```

### Admin

```text
Employee ID: EMP005
Password: DemoPassword@123
```

> These credentials are for local development/demo use only.
