import { Request, Response } from "express";
import admin from "../../../config/firebase";
import axios from "axios";


export const registerUser = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  try {
    const user = await admin.auth().createUser({ email, password });
    res.status(201).json({ uid: user.uid, email: user.email });
  } catch (error) {
    res.status(500).json({ message: "Registration failed", error });
  }
};

export const loginUser = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const result = await axios.post(
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${process.env.FIREBASE_API_KEY}`,
      { email, password, returnSecureToken: true }
    );
    res.json(result.data);
  } catch (error) {
    res.status(401).json({ message: "Invalid credentials" });
  }
};