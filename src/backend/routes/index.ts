import { Router } from "express";
import { loginUser, registerUser, getMe, getProfile, updateProfile } from "../controllers/authController";
import { getWeather, getNews, researchTravel, assessSafety } from "../controllers/travelController";
import { sendChatMessage, getChatHistoryByConversation, getUserChatHistory } from "../controllers/chatController";
import { getSavedDestinations, addSavedDestination, deleteSavedDestination } from "../controllers/savedDestinationsController";
import {
  getAdminDashboard,
  getTravellers,
  createTraveller,
  deleteTraveller,
  getActivities,
  getApiMonitor,
  runSyntheticHealthTest,
  updateUserRole
} from "../controllers/adminController";
import { requireAdmin } from "../middleware/auth";

const router = Router();

// 1. Auth routes
router.post("/auth/login", loginUser);
router.post("/auth/register", registerUser);
router.get("/auth/me", getMe);

// 2. Profile routes
router.get("/traveller/profile", getProfile);
router.put("/traveller/profile", updateProfile);

// 3. Travel & Utility routes
router.get("/weather", getWeather);
router.get("/news", getNews);
router.post("/travel/research", researchTravel);
router.post("/travel/assessment", assessSafety);

// 4. Chat routes
router.post("/chat", sendChatMessage);
router.get("/chat/history", getUserChatHistory);
router.get("/chat/:conversationId", getChatHistoryByConversation);

// 5. Saved Destinations routes
router.get("/saved-destinations", getSavedDestinations);
router.post("/saved-destinations", addSavedDestination);
router.delete("/saved-destinations/:id", deleteSavedDestination);

// 6. Admin Control Plane routes (ROLE_ADMIN strictly required)
router.get("/admin/dashboard", requireAdmin, getAdminDashboard);
router.get("/admin/travellers", requireAdmin, getTravellers);
router.post("/admin/travellers", requireAdmin, createTraveller);
router.delete("/admin/travellers/:id", requireAdmin, deleteTraveller);
router.get("/admin/activities", requireAdmin, getActivities);
router.get("/admin/api-monitor", requireAdmin, getApiMonitor);
router.post("/admin/api-monitor/test", requireAdmin, runSyntheticHealthTest);
router.put("/admin/users/:userId/role", requireAdmin, updateUserRole);

export default router;
