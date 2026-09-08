# Enterprise IT Support AI

An AI-powered Enterprise IT Operations & Incident Resolution Platform that allows employees to submit IT requests through a natural-language interface.

The AI can retrieve company knowledge, investigate live employee/system information, perform authorized Jira operations, and escalate failed or denied requests to human administrators when necessary.

> **Ask the AI. Let it investigate and resolve the issue. Involve a human only when necessary.**

---

## Architecture

```text
React Native / Expo
        ↓
     FastAPI
        ↓
    LangGraph
        ↓
 ┌──────┼────────┐
 ↓      ↓        ↓
RAG     DB       MCP
 ↓      ↓        ↓
Docs PostgreSQL Jira
```

The frontend does not directly access PostgreSQL, RAG, MCP, Jira, or the AI system.

---

## Tech Stack

### Frontend

* React Native
* Expo SDK 57
* TypeScript
* Expo Router
* React Native Safe Area Context

### Backend

* Python 3.12
* FastAPI
* LangGraph
* LangChain
* DeepSeek
* Gemini
* ChromaDB
* PostgreSQL
* MCP
* Jira Cloud

### Authentication

* JWT
* bcrypt
* Role-based access control

---

# Project Structure

```text
.
├── backend/
│   ├── api/
│   ├── ai/
│   ├── core/
│   ├── data/
│   ├── .env.example
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   ├── components/
│   │   ├── services/
│   │   ├── types/
│   │   ├── constants/
│   │   ├── context/
│   │   └── utils/
│   └── package.json
│
├── data/
│   ├── company_documents/
│   ├── mcp_instruction/
│   └── chroma/
│
├── database/
│   ├── schema.sql
│   └── seed.sql
│
├── scripts/
│   └── setup_rag.sh
│
├── .gitignore
└── README.md
```

---

# Prerequisites

Install the following before starting:

* Git
* Python 3.12
* Node.js and npm
* PostgreSQL
* Xcode for iOS development on macOS
* Expo-compatible development environment

For iOS development, the project targets **Expo SDK 57**.

---

# 1. Clone the Repository

```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd <YOUR_REPOSITORY_NAME>
```

---

# 2. Backend Setup

Create and activate a Python virtual environment.

```bash
python3.12 -m venv .venv
source .venv/bin/activate
```

Install backend dependencies:

```bash
pip install -r backend/requirements.txt
```

---

# 3. Backend Environment Variables

Create the environment file:

```bash
cp backend/.env.example backend/.env
```

Open it:

```bash
code backend/.env
```

Replace the placeholder values with your actual configuration.

Required configuration includes:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=it_operations_db
DB_USER=your_postgres_user
DB_PASSWORD=your_postgres_password

JWT_SECRET_KEY=replace_with_a_long_random_secret
JWT_ALGORITHM=HS256
JWT_EXPIRE_MINUTES=60

FRONTEND_ORIGIN=http://localhost:8081
MAX_QUERY_LENGTH=5000

DEEPSEEK_API_KEY=your_deepseek_api_key
GEMINI_API_KEY=your_gemini_api_key

JIRA_BASE_URL=your_jira_base_url
JIRA_EMAIL=your_jira_email
JIRA_API_TOKEN=your_jira_api_token
```

**Never commit `backend/.env` or API keys to Git.**

---

# 4. PostgreSQL Setup

Create the database:

```bash
createdb it_operations_db
```

If your PostgreSQL setup requires a specific user:

```bash
createdb -U <your_postgres_user> it_operations_db
```

Run the database schema:

```bash
psql -d it_operations_db -f database/schema.sql
```

Run the demo seed data:

```bash
psql -d it_operations_db -f database/seed.sql
```

Verify that the database is available:

```bash
psql -d it_operations_db
```

Then:

```sql
\dt
```

You should see tables including:

```text
employees
employee_credentials
employee_configurations
projects
project_members
system_access
jira_accounts
conversations
hitl_requests
```

Exit PostgreSQL:

```sql
\q
```

---

# 5. Setup RAG

The repository contains:

```text
data/company_documents/
data/mcp_instruction/
```

Run the RAG setup script:

```bash
./scripts/setup_rag.sh
```

This performs:

```text
Company Documents
        ↓
Chunking
        ↓
Embeddings
        ↓
ChromaDB

MCP Instructions
        ↓
Chunking
        ↓
Embeddings
        ↓
ChromaDB
```

The generated ChromaDB files are ignored by Git.

You only need to run this when setting up a fresh environment or when the source documents change.

---

# 6. Start the FastAPI Backend

Activate the virtual environment:

```bash
source .venv/bin/activate
```

Start FastAPI:

```bash
cd backend
uvicorn api.main:app --reload --port 8000
```

The backend will run at:

```text
http://localhost:8000
```

Health check:

```text
GET /health
```

Expected response:

```json
{
  "status": "healthy"
}
```

---

# 7. Frontend Setup

Open another terminal.

Go to the frontend:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Start Expo:

```bash
npx expo start
```

For iOS Simulator:

```bash
npx expo start --ios
```

The application is designed for Expo SDK 57.

---

# 8. iOS Development

On macOS, make sure Xcode is installed and the iOS Simulator is available.

Start the simulator:

```bash
open -a Simulator
```

Then:

```bash
cd frontend
npx expo start --ios
```

For the iOS Simulator, the frontend can communicate with the backend using:

```text
http://localhost:8000
```

---

# 9. Demo Login

The seed database contains demo credentials.

### Employee

```text
Employee ID:
EMP001

Password:
DemoPassword@123
```

### Admin

```text
Employee ID:
EMP005

Password:
DemoPassword@123
```

The admin account can access the Human-in-the-Loop administration screens.

---

# 10. Application Flow

## Employee

```text
Login
  ↓
Dashboard
  ↓
New Request
  ↓
AI Processing
  ↓
AI Response
  ↓
Successful / Failed / Denied
```

If a request fails or is denied:

```text
Failed / Denied
      ↓
Submit for Human Review
      ↓
Requester provides reason
      ↓
HITL Request
      ↓
Admin Review
```

---

# 11. AI Routing

The AI router determines which capability is required.

### RAG

Used for static company information.

Example:

```text
"What are the standard working hours?"
```

Flow:

```text
User Query
    ↓
LLM Router
    ↓
RAG
    ↓
Company Documents
    ↓
AI Response
```

### Database

Used for live employee/system information.

Example:

```text
"What is my department?"
```

Flow:

```text
User Query
    ↓
LLM Router
    ↓
Database Tool Calling
    ↓
PostgreSQL
    ↓
AI Response
```

### MCP

Used for direct Jira operations.

Example:

```text
"Create a Jira project."
```

Flow:

```text
User Query
    ↓
LLM Router
    ↓
MCP
    ↓
Jira
    ↓
AI Response
```

---

# 12. Human-in-the-Loop

Failed or denied requests can be submitted for human review.

The requester must provide a reason.

```text
AI Request
    ↓
Failed / Denied
    ↓
Requester submits review request
    ↓
Admin HITL Queue
    ↓
Admin reviews
    ↓
Approve / Reject
    ↓
If approved
    ↓
Execute request
    ↓
Execution Result
```

HITL access is restricted to administrators.

---

# 13. Single-Turn Conversation Model

The system intentionally uses a single-turn conversation model.

Each conversation contains exactly:

```text
1 User Query
+
1 AI Response
```

Example:

```text
Conversation

User:
"I need Jira access for project KAN."

AI:
"Your request was denied because..."
```

A new request creates a new conversation.

The application does not maintain multi-turn conversations.

---

# 14. API Endpoints

### Authentication

```text
POST /api/auth/login
GET  /api/auth/me
```

### Chat

```text
POST /api/chat
```

### Conversations

```text
GET /api/conversations
GET /api/conversations/{id}
```

### Dashboard

```text
GET /api/dashboard
```

### HITL

```text
POST /api/hitl
GET  /api/hitl/my
GET  /api/hitl/{id}

GET   /api/hitl/admin/queue
GET   /api/hitl/admin/{id}
PATCH /api/hitl/admin/{id}

POST /api/hitl/admin/{id}/execute
```

---

# 15. Frontend Navigation

Employees have access to:

```text
Dashboard
New Request
History
Instructions
Profile
Settings
```

Administrators additionally have:

```text
HITL
```

---

# 16. Security

The application includes:

* JWT authentication
* Password hashing with bcrypt
* Role-based access control
* Admin-only HITL access
* Authentication-protected API endpoints
* Login rate limiting
* CORS configuration
* Security response headers
* Query length validation
* Environment-based secrets
* No frontend access to database credentials
* No API keys in frontend code

Never commit:

```text
.env
API keys
Jira tokens
JWT secrets
production credentials
```

---

# 17. Development Notes

### Backend

From the project root:

```bash
source .venv/bin/activate
cd backend
uvicorn api.main:app --reload --port 8000
```

### Frontend

In another terminal:

```bash
cd frontend
npm install
npx expo start
```

### RAG

From the project root:

```bash
./scripts/setup_rag.sh
```

---

# 18. Important Constraints

The frontend does not implement:

* LangGraph
* RAG
* PostgreSQL
* MCP
* Jira integration
* AI model logic
* Tool calling

These capabilities are implemented in the backend.

The frontend communicates with the backend through HTTP APIs.

---

# 19. Project Goal

The platform is designed around the following principle:

> **Ask the AI. Let it investigate and resolve the issue. Involve a human only when necessary.**
