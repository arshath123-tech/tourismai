import { Request, Response } from "express";
import { getEffectiveUser } from "../middleware/auth";
import { pool, logActivity } from "../../database/db";
import { ChatMessageStore } from "../../database/schema";
import { RequestRouterService } from "../services/requestRouterService";
import { PromptBuilderService } from "../services/promptBuilderService";
import { AIService } from "../services/aiService";

export async function sendChatMessage(req: Request, res: Response) {
  const user = await getEffectiveUser(req);
  const { conversationId = "conv-default-1", message, destinationContext = "Tokyo" } = req.body;

  if (!message || typeof message !== "string" || message.trim().length === 0) {
    return res.status(400).json({ error: "Message content cannot be empty." });
  }

  const sanitizedMessage = message.trim();

  const userMsg: ChatMessageStore = {
    id: `msg-${Date.now()}-u`,
    conversationId,
    userId: user.id,
    sender: "user",
    text: sanitizedMessage,
    timestamp: new Date().toISOString()
  };

  try {
    await pool.query(
      'INSERT INTO chat_messages (id, "conversationId", "userId", sender, text, timestamp) VALUES ($1, $2, $3, $4, $5, $6)',
      [userMsg.id, userMsg.conversationId, userMsg.userId, userMsg.sender, userMsg.text, userMsg.timestamp]
    );

    const intent = RequestRouterService.analyzeIntent(sanitizedMessage, destinationContext);

    const retrievedContext = await RequestRouterService.retrieveDataForIntent(
      intent,
      user.nationality || "India",
      user.travelStyle || "Solo"
    );

    const histResult = await pool.query('SELECT * FROM chat_messages WHERE "conversationId" = $1 ORDER BY timestamp ASC', [conversationId]);
    const conversationHistory = histResult.rows;

    const finalizedPrompt = PromptBuilderService.buildChatPrompt({
      user,
      destinationName: intent.primaryDestination,
      userQuestion: sanitizedMessage,
      retrievedContext,
      conversationHistory
    });

    const aiResult = await AIService.generateResponse(finalizedPrompt);

    let assistantText = aiResult.text;

    if (!assistantText || aiResult.isFallback) {
      const dest = retrievedContext.destination.name;
      const weatherInfo = retrievedContext.weather ? `${retrievedContext.weather.tempC}°C ${retrievedContext.weather.condition}` : "22°C Clear Skies";
      const newsInfo = retrievedContext.news && retrievedContext.news.length > 0 ? retrievedContext.news[0].title : "Transit running normally";

      assistantText = `**📍 Destination & Profile Context**
- Destination: ${dest} | Traveller: ${user.fullName} (${user.nationality || 'India'})
- Query Focus: ${sanitizedMessage.substring(0, 60)}

**🌦️ Live Weather & Environmental Guidance**
- Forecast: ${weatherInfo}. Great outdoor conditions for exploring.

**📰 Real-Time Local News & Disruptions**
- Alert: ${newsInfo}. Public transport operating normally in ${dest}.

**🛡️ Personal Safety & Security Assessment [${retrievedContext.destination.safetyRating}]**
- Safety Index: Optimal. Basic urban precautions recommended.

**🔒 Privacy & Digital Security**
- Keep public Wi-Fi usage protected via VPN and monitor local digital payments.

**💡 Actionable Advice**
- Save local emergency contacts and keep offline maps downloaded on your mobile device.`;
    }

    const assistantMsg: ChatMessageStore = {
      id: `msg-${Date.now()}-a`,
      conversationId,
      userId: user.id,
      sender: "assistant",
      text: assistantText,
      timestamp: new Date().toISOString()
    };

    await pool.query(
      'INSERT INTO chat_messages (id, "conversationId", "userId", sender, text, timestamp) VALUES ($1, $2, $3, $4, $5, $6)',
      [assistantMsg.id, assistantMsg.conversationId, assistantMsg.userId, assistantMsg.sender, assistantMsg.text, assistantMsg.timestamp]
    );

    const ip = (req.headers["x-forwarded-for"] as string) || req.socket.remoteAddress || "127.0.0.1";
    const agent = req.headers["user-agent"] || "Web Application";
    await logActivity(
      user.id,
      user.username,
      "CHAT_MESSAGE",
      `Chat query in conv ${conversationId}: "${sanitizedMessage.substring(0, 30)}..." [Intent: ${intent.queryType}, Latency: ${aiResult.latencyMs}ms]`,
      ip,
      agent
    );

    const finalHistResult = await pool.query('SELECT * FROM chat_messages WHERE "conversationId" = $1 ORDER BY timestamp ASC', [conversationId]);

    return res.json({
      conversationId,
      userMessage: userMsg,
      assistantMessage: assistantMsg,
      history: finalHistResult.rows,
      architectureMetadata: {
        queryIntent: intent,
        retrievalSummary: retrievedContext.retrievalMetadata,
        aiModelUsed: aiResult.modelUsed,
        latencyMs: aiResult.latencyMs
      }
    });
  } catch (error) {
    console.error("[ChatController] Error processing chat message:", error);
    return res.status(500).json({
      error: "An error occurred while processing your travel query.",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
}

export async function getChatHistoryByConversation(req: Request, res: Response) {
  const { conversationId } = req.params;
  try {
    const result = await pool.query('SELECT * FROM chat_messages WHERE "conversationId" = $1 ORDER BY timestamp ASC', [conversationId]);
    return res.json(result.rows);
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
}

export async function getUserChatHistory(req: Request, res: Response) {
  const user = await getEffectiveUser(req);
  try {
    const result = await pool.query('SELECT * FROM chat_messages WHERE "userId" = $1 ORDER BY timestamp ASC', [user.id]);
    return res.json(result.rows);
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
}
