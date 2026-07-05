# AI Chatbot Setup Guide - Google Gemini Integration

## ✅ What's Been Done
1. ✅ Installed `@google/generative-ai` package in backend
2. ✅ Created AI route (`/api/ai/chat`) in backend
3. ✅ Updated `ChatbotWidget.jsx` with real API integration
4. ✅ Added `.env` configuration for Google Gemini API key

## 🔑 Next Steps: Add Your API Key

### Step 1: Get Google Gemini API Key (FREE)
1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Sign in with your Google account
3. Click **"Create API Key"** (or **"Get an API Key"**)
4. Copy the generated API key

### Step 2: Update Your Backend .env File
Open `backend/.env` and replace:
```
GOOGLE_GEMINI_API_KEY=your_api_key_here
```

With your actual API key:
```
GOOGLE_GEMINI_API_KEY=AIzaSyD_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### Step 3: Restart Backend
```bash
cd backend
npm run dev
```

### Step 4: Test the AI Chatbot
1. Open your frontend in browser
2. Navigate to the **Chatbot/AI Support** page
3. Ask a question like "What is neural networks?"
4. The AI should respond with real answers!

## 🎯 Features Available

✨ **Real AI Responses** - Using Google Gemini Pro model
💬 **Conversation History** - Context-aware responses within a session
🎓 **Educational Focus** - AI trained to help with course concepts, exams, study strategies
🔒 **Authenticated** - Only logged-in students can access
⚡ **Auto-scroll** - Messages auto-scroll to latest
🧹 **Clear Chat** - Button to start fresh conversation

## 🛠️ Backend API Endpoints

### POST `/api/ai/chat`
Send a question and get AI response
```json
{
  "message": "What is machine learning?",
  "sessionId": "optional-session-id"
}
```

Response:
```json
{
  "success": true,
  "data": {
    "sessionId": "user-123-timestamp",
    "response": "Machine learning is...",
    "timestamp": "2025-04-07T..."
  }
}
```

### POST `/api/ai/clear-chat`
Clear conversation history
```json
{
  "sessionId": "user-123-timestamp"
}
```

## 📝 Customization

### Change AI Model
In `backend/routes/ai.js`, line 39:
```javascript
const model = genAI.getGenerativeModel({ model: "gemini-pro" });
```

Available models:
- `gemini-pro` (fast, good for general use)
- `gemini-pro-vision` (can analyze images)

### Adjust Response Length
In `backend/routes/ai.js`, line 42-46:
```javascript
generationConfig: {
  maxOutputTokens: 500,  // Increase for longer responses
  temperature: 0.7,      // 0-1: lower = factual, higher = creative
}
```

### Change System Context
Edit the `systemPrompt` in `backend/routes/ai.js` to customize AI behavior:
```javascript
const systemPrompt = `You are SmartEvalAI, an educational assistant...`;
```

## 🐛 Troubleshooting

### Error: "Cannot find module '@google/generative-ai'"
```bash
cd backend
npm install @google/generative-ai
```

### Error: "Error connecting to AI service. Please check your API key"
- Verify your API key is correctly set in `backend/.env`
- Make sure there are no extra spaces or quotes around the key

### Error: "403 Permission Denied"
- Your API key might be invalid or expired
- Generate a new one from [Google AI Studio](https://aistudio.google.com/app/apikey)

### Error: "UNAUTHENTICATED"
- Make sure you're logged in before accessing the chatbot
- Check that `authMiddleware` is working on other routes

## 📊 Monitoring

Check backend console for:
```
AI Chat Error: [error message]
```

This will help debug any issues with the AI service.

## 🔐 Security Notes

- Never commit your API key to Git
- Keep `.env` file in `.gitignore` (should already be there)
- API key is only used on the backend (not exposed to frontend)
- Conversation history is stored in memory (resets on server restart)

## 🚀 For Production

For a production environment:
1. Use a database (MongoDB) to store conversation history instead of memory
2. Add rate limiting to prevent API abuse
3. Use environment variables from a secure vault
4. Consider using a paid AI service with better rate limits
5. Add user authentication tokens validation

---

**Questions?** Check the backend console logs and ensure all steps are completed correctly!
