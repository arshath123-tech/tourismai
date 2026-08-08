import { Request, Response } from "express";
import { getEffectiveUser } from "../middleware/auth";
import { pool, logActivity } from "../../database/db";
import { SavedDestinationStore } from "../../database/schema";

export async function getSavedDestinations(req: Request, res: Response) {
  const user = await getEffectiveUser(req);
  try {
    const result = await pool.query('SELECT * FROM saved_destinations WHERE "userId" = $1', [user.id]);
    return res.json(result.rows);
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
}

export async function addSavedDestination(req: Request, res: Response) {
  const user = await getEffectiveUser(req);
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

  try {
    await pool.query(
      'INSERT INTO saved_destinations (id, "userId", destination, country, "safetyRating", notes, "savedAt", tags) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
      [newDest.id, newDest.userId, newDest.destination, newDest.country, newDest.safetyRating, newDest.notes, newDest.savedAt, JSON.stringify(newDest.tags)]
    );

    const ip = (req.headers["x-forwarded-for"] as string) || req.socket.remoteAddress || "127.0.0.1";
    const agent = req.headers["user-agent"] || "Web Application";
    await logActivity(user.id, user.username, "SAVE_DESTINATION", `Saved destination: ${destination}`, ip, agent);

    return res.json(newDest);
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
}

export async function deleteSavedDestination(req: Request, res: Response) {
  const user = await getEffectiveUser(req);
  const { id } = req.params;
  
  try {
    const result = await pool.query('SELECT * FROM saved_destinations WHERE id = $1 AND "userId" = $2', [id, user.id]);
    if (result.rows.length !== 0) {
      const removed = result.rows[0];
      await pool.query('DELETE FROM saved_destinations WHERE id = $1', [id]);
      
      const ip = (req.headers["x-forwarded-for"] as string) || req.socket.remoteAddress || "127.0.0.1";
      const agent = req.headers["user-agent"] || "Web Application";
      await logActivity(user.id, user.username, "REMOVE_DESTINATION", `Removed saved destination: ${removed.destination}`, ip, agent);
      
      return res.json({ message: "Destination removed successfully", removed });
    }
    return res.status(404).json({ error: "Saved destination not found." });
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
}
