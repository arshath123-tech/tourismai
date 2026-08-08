import { Request, Response } from "express";
import { getEffectiveUser } from "../middleware/auth";
import { savedDestinations, logActivity } from "../../database/db";
import { SavedDestinationStore } from "../../database/schema";

export function getSavedDestinations(req: Request, res: Response) {
  const user = getEffectiveUser(req);
  const list = savedDestinations.filter(d => d.userId === user.id);
  return res.json(list);
}

export function addSavedDestination(req: Request, res: Response) {
  const user = getEffectiveUser(req);
  const { destination, country, safetyRating = "LOW", notes = "", tags = [] } = req.body;

  if (!destination) {
    return res.status(400).json({ error: "Destination name required." });
  }

  const newDest: SavedDestinationStore = {
    id: `dest-${Date.now()}`,
    userId: user.id,
    destination,
    country: country || destination,
    safetyRating,
    notes,
    savedAt: new Date().toISOString(),
    tags: tags.length ? tags : ["Saved Destination"]
  };

  savedDestinations.push(newDest);

  const ip = (req.headers["x-forwarded-for"] as string) || req.socket.remoteAddress || "127.0.0.1";
  const agent = req.headers["user-agent"] || "Web Application";
  logActivity(user.id, user.username, "SAVE_DESTINATION", `Saved destination: ${destination}`, ip, agent);

  return res.json(newDest);
}

export function deleteSavedDestination(req: Request, res: Response) {
  const user = getEffectiveUser(req);
  const { id } = req.params;
  const index = savedDestinations.findIndex(d => d.id === id && d.userId === user.id);
  
  if (index !== -1) {
    const removed = savedDestinations.splice(index, 1)[0];
    const ip = (req.headers["x-forwarded-for"] as string) || req.socket.remoteAddress || "127.0.0.1";
    const agent = req.headers["user-agent"] || "Web Application";
    logActivity(user.id, user.username, "REMOVE_DESTINATION", `Removed saved destination: ${removed.destination}`, ip, agent);
    return res.json({ message: "Destination removed successfully", removed });
  }
  return res.status(404).json({ error: "Saved destination not found." });
}
