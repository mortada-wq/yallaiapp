# Sahib Yalla Backend Setup

## Overview

The backend now supports both **Neon PostgreSQL** (recommended) and **MongoDB** (legacy) databases, with flexible LLM provider configuration including **Silicon Flow API** for DeepSeek models.

## Database Setup

### Option 1: Neon PostgreSQL (Recommended)

1. **Get your Neon connection string** from [Neon Console](https://console.neon.tech/)
   - Ensure it includes `?sslmode=require` parameter
   - Example: `postgresql://user:password@ep-xxx.us-east-2.aws.neon.tech/dbname?sslmode=require`

2. **Run the schema migration**:
   ```bash
   # Connect to your Neon database using psql or Neon SQL Editor
   psql "your-neon-connection-string-here"

   # Then run the schema file
   \i backend/schema.sql
   ```

3. **Configure environment variables**:
   ```bash
   cp .env.example .env
   # Edit .env and set:
   USE_POSTGRES=true
   DATABASE_URL=your-neon-connection-string
   ```

### Option 2: MongoDB (Legacy)

```bash
# Edit .env and set:
USE_POSTGRES=false
MONGO_URL=mongodb://localhost:27017
DB_NAME=sahib_yalla
```

## LLM Configuration

### Silicon Flow API (for DeepSeek models)

1. **Get your API key** from [Silicon Flow](https://siliconflow.cn/)

2. **Configure in .env**:
   ```bash
   SILICON_FLOW_API_KEY=your-api-key-here
   SILICON_FLOW_BASE_URL=https://api.siliconflow.cn/v1
   ```

3. **Set default model** (choose one):
   ```bash
   # For complex logic (larger model)
   DEFAULT_LLM_MODEL=deepseek-ai/deepseek-coder-33b-instruct

   # For faster responses (smaller model)
   DEFAULT_LLM_MODEL=deepseek-ai/deepseek-coder-7b-instruct
   ```

### Emergent Integration (for Claude/OpenAI/Gemini)

```bash
EMERGENT_LLM_KEY=your-emergent-key-here
DEFAULT_LLM_PROVIDER=anthropic
DEFAULT_LLM_MODEL=claude-sonnet-4-5-20250929
```

## Model Switching

The backend automatically detects the model and routes to the appropriate provider:

- **DeepSeek models** → Silicon Flow API
- **Other models** → Emergent Integration

You can toggle models via the admin panel at `/api/admin/settings` or by updating environment variables.

## Installation

1. **Install dependencies**:
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

2. **Run the server**:
   ```bash
   uvicorn server:app --reload --host 0.0.0.0 --port 8000
   ```

## Environment Variables

Full list of required/optional environment variables:

```bash
# Database (choose one)
USE_POSTGRES=true                                    # Use PostgreSQL (Neon)
DATABASE_URL=postgresql://...?sslmode=require        # Neon connection string
# OR
USE_POSTGRES=false                                   # Use MongoDB
MONGO_URL=mongodb://localhost:27017
DB_NAME=sahib_yalla

# LLM Providers
EMERGENT_LLM_KEY=your-emergent-key                   # For Claude/OpenAI/Gemini
SILICON_FLOW_API_KEY=your-silicon-flow-key           # For DeepSeek models
SILICON_FLOW_BASE_URL=https://api.siliconflow.cn/v1

# Default Model Configuration
DEFAULT_LLM_PROVIDER=anthropic                       # anthropic, openai, gemini, siliconflow
DEFAULT_LLM_MODEL=claude-sonnet-4-5-20250929         # or deepseek-ai/deepseek-coder-33b-instruct

# Admin Configuration
ADMIN_EMAILS=admin@example.com,another@example.com   # Comma-separated admin emails
```

## Health Check

Test your setup:

```bash
curl http://localhost:8000/api/health
```

Response should indicate which database is active:
```json
{
  "ok": true,
  "service": "sahib-yalla",
  "database": "postgresql",  // or "mongodb"
  "time": "2026-04-21T17:53:57.465+00:00"
}
```

## Troubleshooting

### Database Connection Issues

**Neon PostgreSQL**:
- Ensure `?sslmode=require` is in the connection string
- Check that your IP is allowed in Neon project settings
- Verify the connection string is correct

**MongoDB**:
- Ensure MongoDB is running
- Check the connection string format

### API Key Issues

**Silicon Flow**:
- Verify API key is valid
- Check rate limits
- Ensure base URL is correct

**Emergent**:
- Verify Emergent LLM key is valid
- Check credit balance

### Model Selection

The system automatically routes based on model name:
- Models containing "deepseek" → Silicon Flow API
- Other models → Emergent Integration

Make sure the appropriate API key is configured for your chosen model.

## Admin Dashboard Features

Access admin endpoints (requires admin email):

- `GET /api/admin/overview` - Database stats and metrics
- `GET /api/admin/shares` - List project shares
- `DELETE /api/admin/shares/{id}` - Delete a share
- `GET /api/admin/chat-log` - View chat history
- `GET /api/admin/llm-usage` - LLM usage statistics
- `GET /api/admin/settings` - Current LLM configuration
- `PUT /api/admin/settings` - Update LLM settings

## Migration from MongoDB to Neon

If you're migrating from MongoDB to Neon:

1. Export your MongoDB data
2. Set up Neon database with schema.sql
3. Import data into Neon (write custom migration script if needed)
4. Update USE_POSTGRES=true and DATABASE_URL in .env
5. Restart the server

## Support

For issues or questions:
- Check the main project README
- Review error logs
- Ensure all environment variables are set correctly
