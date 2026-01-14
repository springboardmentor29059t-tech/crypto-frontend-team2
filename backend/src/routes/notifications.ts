import { Router } from "express";
import { z } from "zod";
import { readDB, writeDB } from "../data/db";
import { Notification } from "../types";
import { AuthedRequest } from "../utils/auth";
import { v4 as uuidv4 } from "uuid";

const router = Router();

const notificationSchema = z.object({
  type: z.enum(["price", "risk", "trade", "system"]),
  title: z.string(),
  message: z.string(),
  metadata: z.record(z.any()).optional(),
});

// Get all notifications for user
router.get("/", async (req: AuthedRequest, res) => {
  try {
    const userId = req.userId!;
    const db = await readDB();
    const notifications = db.notifications
      .filter((n) => n.userId === userId)
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    res.json({ items: notifications });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ error: "Failed to fetch notifications" });
  }
});

// Get unread notifications count
router.get("/unread", async (req: AuthedRequest, res) => {
  try {
    const userId = req.userId!;
    const db = await readDB();
    const count = db.notifications.filter(
      (n) => n.userId === userId && !n.read
    ).length;
    res.json({ count });
  } catch (error) {
    console.error("Error fetching unread count:", error);
    res.status(500).json({ error: "Failed to fetch unread count" });
  }
});

// Create a notification
router.post("/", async (req: AuthedRequest, res) => {
  try {
    const userId = req.userId!;
    const data = notificationSchema.parse(req.body);

    const notification: Notification = {
      id: uuidv4(),
      userId,
      ...data,
      read: false,
      createdAt: new Date().toISOString(),
    };

    const db = await readDB();
    db.notifications.push(notification);
    await writeDB(db);

    res.status(201).json(notification);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error("Error creating notification:", error);
    res.status(500).json({ error: "Failed to create notification" });
  }
});

// Mark notification as read
router.patch("/:id/read", async (req: AuthedRequest, res) => {
  try {
    const userId = req.userId!;
    const { id } = req.params;

    const db = await readDB();
    const notification = db.notifications.find(
      (n) => n.id === id && n.userId === userId
    );

    if (!notification) {
      return res.status(404).json({ error: "Notification not found" });
    }

    notification.read = true;
    await writeDB(db);

    res.json(notification);
  } catch (error) {
    console.error("Error marking notification as read:", error);
    res.status(500).json({ error: "Failed to mark notification as read" });
  }
});

// Mark all notifications as read
router.patch("/read-all", async (req: AuthedRequest, res) => {
  try {
    const userId = req.userId!;
    const db = await readDB();

    db.notifications.forEach((n) => {
      if (n.userId === userId && !n.read) {
        n.read = true;
      }
    });

    await writeDB(db);

    res.json({ success: true });
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    res.status(500).json({ error: "Failed to mark all notifications as read" });
  }
});

// Delete a notification
router.delete("/:id", async (req: AuthedRequest, res) => {
  try {
    const userId = req.userId!;
    const { id } = req.params;

    const db = await readDB();
    const index = db.notifications.findIndex(
      (n) => n.id === id && n.userId === userId
    );

    if (index === -1) {
      return res.status(404).json({ error: "Notification not found" });
    }

    db.notifications.splice(index, 1);
    await writeDB(db);

    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting notification:", error);
    res.status(500).json({ error: "Failed to delete notification" });
  }
});

export default router;

