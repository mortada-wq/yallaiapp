# Quick Start: Neon Database + Silicon Flow API Setup

This guide helps you quickly set up your Sahib Yalla backend with Neon PostgreSQL and Silicon Flow API for DeepSeek models.

## Step 1: Get Your Credentials

### Neon Database Connection String
1. Go to [Neon Console](https://console.neon.tech/)
2. Create a new project or select existing one
3. Copy your connection string from the dashboard
4. **Important**: Ensure it includes `?sslmode=require` at the end
   - Example: `postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/dbname?sslmode=require`

### Silicon Flow API Key
1. Go to [Silicon Flow](https://siliconflow.cn/)
2. Sign up or log in
3. Navigate to API Keys section
4. Create a new API key and copy it

## Step 2: Initialize Your Database

1. **Connect to Neon** using the SQL Editor in Neon Console, or use psql:
   ```bash
   psql "your-neon-connection-string"
   ```

2. **Run the schema**:
   ```sql
   -- Copy and paste the contents of backend/schema.sql
   -- Or if using psql locally:
   \i backend/schema.sql
   ```

## Step 3: Configure Environment Variables

1. **Copy the example environment file**:
   ```bash
   cp .env.example .env
   ```

2. **Edit `.env` and add your credentials**:
   ```bash
   # Enable PostgreSQL
   USE_POSTGRES=true
   DATABASE_URL=postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/dbname?sslmode=require

   # Silicon Flow API for DeepSeek models
   SILICON_FLOW_API_KEY=your-silicon-flow-api-key-here
   SILICON_FLOW_BASE_URL=https://api.siliconflow.cn/v1

   # Choose your default model
   DEFAULT_LLM_PROVIDER=anthropic
   DEFAULT_LLM_MODEL=deepseek-ai/deepseek-coder-33b-instruct
   # Or use: deepseek-ai/deepseek-coder-7b-instruct for faster responses

   # Emergent LLM Key (if you want to use Claude/OpenAI/Gemini)
   EMERGENT_LLM_KEY=your-emergent-key-here

   # Admin email(s) - comma separated
   ADMIN_EMAILS=your-email@example.com
   ```

## Step 4: Install Dependencies & Run

1. **Install Python dependencies**:
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

2. **Start the server**:
   ```bash
   uvicorn server:app --reload --host 0.0.0.0 --port 8000
   ```

3. **Test the connection**:
   ```bash
   curl http://localhost:8000/api/health
   ```

   You should see:
   ```json
   {
     "ok": true,
     "service": "sahib-yalla",
     "database": "postgresql",
     "time": "2026-04-21T..."
   }
   ```

## Step 5: Test the Chat Endpoint

Send a test message to verify Silicon Flow integration:

```bash
curl -X POST http://localhost:8000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Hello, write a simple Python function to add two numbers",
    "history": []
  }'
```

## Model Selection

The backend automatically routes requests based on the model name:

- **DeepSeek models** (contains "deepseek") → Silicon Flow API
- **Other models** (Claude, GPT, Gemini) → Emergent Integration

### Switch Models via Admin API

```bash
# Set to DeepSeek 33B (complex logic)
curl -X PUT http://localhost:8000/api/admin/settings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your-session-token>" \
  -d '{
    "provider": "siliconflow",
    "model": "deepseek-ai/deepseek-coder-33b-instruct"
  }'

# Set to DeepSeek 7B (faster)
curl -X PUT http://localhost:8000/api/admin/settings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your-session-token>" \
  -d '{
    "provider": "siliconflow",
    "model": "deepseek-ai/deepseek-coder-7b-instruct"
  }'
```

## Migrating from MongoDB (Optional)

If you have existing data in MongoDB:

1. **Keep MongoDB credentials in .env** temporarily:
   ```bash
   MONGO_URL=mongodb://localhost:27017
   DB_NAME=sahib_yalla
   ```

2. **Run the migration script**:
   ```bash
   cd backend
   python migrate_mongo_to_neon.py
   ```

3. **Update .env** after successful migration:
   ```bash
   USE_POSTGRES=true
   # Remove or comment out MONGO_URL and DB_NAME
   ```

4. **Restart the server**

## Troubleshooting

### Database Connection Failed
- Verify the connection string includes `?sslmode=require`
- Check your IP is allowed in Neon project settings
- Test the connection with psql directly

### API Key Invalid
- Double-check the Silicon Flow API key
- Verify you have credits/quota available
- Check the base URL is correct

### Model Not Found
- Ensure you're using the correct model name:
  - `deepseek-ai/deepseek-coder-33b-instruct`
  - `deepseek-ai/deepseek-coder-7b-instruct`
- Check Silicon Flow documentation for available models

### Rate Limiting
- Silicon Flow may have rate limits
- Consider upgrading your plan or switching models
- Monitor your usage via their dashboard

## What's Next?

✅ Your backend is now configured with:
- Neon PostgreSQL for persistent storage
- Silicon Flow API for DeepSeek models
- Dual provider support (can switch between DeepSeek and Claude)
- Admin dashboard for monitoring

You can now:
1. Test the chat functionality
2. Monitor usage via `/api/admin/overview`
3. Switch models based on your needs
4. Scale with Neon's serverless PostgreSQL

## Support

- **Neon Documentation**: https://neon.tech/docs
- **Silicon Flow Documentation**: https://siliconflow.cn/docs
- **Project Issues**: https://github.com/mortada-wq/yallaiapp/issues
