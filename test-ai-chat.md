# Troubleshooting AI Chat Error

## Error You're Seeing:

```json
{
  "error": "Failed to process AI chat request",
  "response": "I'm sorry, I encountered an error while processing your request. Please try again later.",
  "references": [],
  "similar_articles": []
}
```

## Possible Causes & Solutions:

### 1. **Groq API Key Not Set** (Most Likely)

**Check:** Is the `GROQ_API_KEY` environment variable set?

**How to check:**

```bash
# In terminal
echo $GROQ_API_KEY
# or for Windows PowerShell
echo $env:GROQ_API_KEY
```

**Solution:**

- Create a `.env.local` file in your project root
- Add: `GROQ_API_KEY=your_actual_api_key_here`
- Get a free API key from: https://console.groq.com/keys
- Restart your dev server

### 2. **Database Connection Issue**

**Check:** Can the app connect to the Neon database?

**How to test:**

- Try visiting `/api/publications` - does it work?
- If publications API works, database is fine

**Solution:**

- If publications API fails too, check your database connection string
- Make sure you're online (Neon requires internet)

### 3. **Groq API Rate Limit**

**Check:** Have you made many requests recently?

**Solution:**

- Wait a minute and try again
- Groq free tier has rate limits

### 4. **Invalid Request Format**

**Check:** Are you sending the request correctly?

**Correct format:**

```json
{
  "message": "Your question here",
  "limit": 10
}
```

## How to Debug:

### Step 1: Check the Console

When you run `pnpm dev`, look for these logs when you send a message:

```
[v0] AI Chat request: { message: '...', limit: 10 }
[v0] Groq API key available: true/false
[v0] Groq instance created: true/false
[v0] Attempting database connection...
[v0] Database connection successful
[v0] Fetched X publications from database
```

### Step 2: Test Publications API First

```bash
# Try this in your browser or with curl
curl http://localhost:3000/api/publications
```

If this works, database is fine. If not, there's a database issue.

### Step 3: Set Up Groq API Key

1. Go to https://console.groq.com/keys
2. Sign up/login
3. Create a new API key
4. Copy it
5. Create `.env.local` in project root:

```env
GROQ_API_KEY=gsk_your_actual_key_here
```

6. Restart dev server: Stop (Ctrl+C) and run `pnpm dev` again

## Quick Test Commands:

```bash
# Test publications API
curl http://localhost:3000/api/publications

# Test AI chat (after fixing API key)
curl -X POST http://localhost:3000/api/ai-chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Tell me about space biology"}'
```

## What to Look For in Logs:

**If you see:**

- `Groq API key available: false` → Set up your API key!
- `Database connection failed` → Check your internet/database URL
- `Error details: API key` → Groq API key is missing or invalid
- `Error details: timeout` → Request took too long, try again
- `Error details: rate limit` → Too many requests, wait a bit

## Need More Help?

Share these logs with me:

1. What you see in the terminal console after sending a message
2. Whether the publications API works
3. Whether you've set the GROQ_API_KEY environment variable

The improved error messages will now tell you exactly what's wrong! 🚀
