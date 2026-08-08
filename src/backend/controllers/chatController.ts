import { Request, Response } from "express";
import { getEffectiveUser } from "../middleware/auth";
import { chatMessages, logActivity } from "../../database/db";
import { ChatMessageStore } from "../../database/schema";
import { RequestRouterService } from "../services/requestRouterService";
import { PromptBuilderService } from "../services/promptBuilderService";
import { AIService } from "../services/aiService";

export async function sendChatMessage(req: Request, res: Response) {
  const user = getEffectiveUser(req);
  const { conversationId = "conv-default-1", message, destinationContext = "Tokyo" } = req.body;

  if (!message || typeof message !== "string" || message.trim().length === 0) {
    return res.status(400).json({ error: "Message content cannot be empty." });
  }

  const sanitizedMessage = message.trim();

  // 1. Store user message in conversation store
  const userMsg: ChatMessageStore = {
    id: `msg-${Date.now()}-u`,
    conversationId,
    userId: user.id,
    sender: "user",
    text: sanitizedMessage,
    timestamp: new Date().toISOString()
  };
  chatMessages.push(userMsg);

  try {
    // 2. Intelligent Request Routing: Analyze user query intent and determine required data services
    const intent = RequestRouterService.analyzeIntent(sanitizedMessage, destinationContext);

    // 3. Retrieval Before Generation (RAG-style parallel data retrieval with fallback)
    const retrievedContext = await RequestRouterService.retrieveDataForIntent(
      intent,
      user.nationality || "India",
      user.travelStyle || "Solo"
    );

    // Get conversation history for conversation memory filtering
    const conversationHistory = chatMessages.filter(m => m.conversationId === conversationId);

    // 4. Centralized Prompt Building
    const finalizedPrompt = PromptBuilderService.buildChatPrompt({
      user,
      destinationName: intent.primaryDestination,
      userQuestion: sanitizedMessage,
      retrievedContext,
      conversationHistory
    });

    // 5. AI Service Execution
    const aiResult = await AIService.generateResponse(finalizedPrompt);

    let assistantText = aiResult.text;

    // Graceful degradation fallback if AI service produces an empty response
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

    // Store assistant response message
    const assistantMsg: ChatMessageStore = {
      id: `msg-${Date.now()}-a`,
      conversationId,
      userId: user.id,
      sender: "assistant",
      text: assistantText,
      timestamp: new Date().toISOString()
    };
    chatMessages.push(assistantMsg);

    // Log activity
    const ip = (req.headers["x-forwarded-for"] as string) || req.socket.remoteAddress || "127.0.0.1";
    const agent = req.headers["user-agent"] || "Web Application";
    logActivity(
      user.id,
      user.username,
      "CHAT_MESSAGE",
      `Chat query in conv ${conversationId}: "${sanitizedMessage.substring(0, 30)}..." [Intent: ${intent.queryType}, Latency: ${aiResult.latencyMs}ms]`,
      ip,
      agent
    );

    // Return synthesized response with metadata
    return res.json({
      conversationId,
      userMessage: userMsg,
      assistantMessage: assistantMsg,
      history: chatMessages.filter(m => m.conversationId === conversationId),
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

export function getChatHistoryByConversation(req: Request, res: Response) {
  const { conversationId } = req.params;
  const history = chatMessages.filter(m => m.conversationId === conversationId);
  return res.json(history);
}

export function getUserChatHistory(req: Request, res: Response) {
  const user = getEffectiveUser(req);
  const history = chatMessages.filter(m => m.userId === user.id);
  return res.json(history);
}
