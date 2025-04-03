import { Request, Response } from "express";
import admin from "../../../config/firebase";

export const registerUser = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  try {
    const user = await admin.auth().createUser({ email, password });
    res.status(201).json({ uid: user.uid, email: user.email });
  } catch (error) {
    res.status(500).json({ message: "Registration failed", error });
  }
};