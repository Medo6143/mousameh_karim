import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { db } from "./firebase";

/* ============================================
   TYPES
============================================ */

export interface UserProfile {
  uid: string;
  username: string;
  displayName: string;
  bio: string;
  photoURL?: string;
  whatsapp?: string;
  messageCount: number;
  createdAt: Timestamp;
}

export interface Message {
  id?: string;
  recipientUid: string;
  recipientUsername: string;
  senderUid?: string; // null if anonymous
  senderName?: string;
  senderWhatsapp?: string;
  emotion: "upset" | "reconcile" | "miss" | "grateful" | "saraha";
  originalText: string;
  rewrittenText: string;
  isAnonymous: boolean;
  isRead: boolean;
  matchStatus: "none" | "pending" | "revealed";
  senderConsent: boolean;
  recipientConsent: boolean;
  createdAt: Timestamp | ReturnType<typeof serverTimestamp>;
}

/* ============================================
   USER PROFILES
============================================ */

const usersCol = collection(db, "users");

/** Create or update a user profile (on sign-in) */
export async function upsertUser(data: {
  uid: string;
  displayName: string;
  photoURL?: string;
}) {
  const ref = doc(usersCol, data.uid);
  const snap = await getDoc(ref);

  if (snap.exists()) {
    const existingData = snap.data() as UserProfile;
    // Only update photo if it's currently empty, to avoid overwriting custom uploads
    const updates: any = {
      displayName: data.displayName,
    };
    if (!existingData.photoURL && data.photoURL) {
      updates.photoURL = data.photoURL;
    }

    await updateDoc(ref, updates);
    return { ...existingData, ...updates } as UserProfile;
  }

  // New user — generate username from UID
  const username = data.displayName
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/[^a-z0-9_]/g, "")
    .slice(0, 15) + "_" + data.uid.slice(0, 4);

  const profile: UserProfile = {
    uid: data.uid,
    username,
    displayName: data.displayName,
    bio: "بحب الناس وبكره الخناقات 💛",
    photoURL: data.photoURL || "",
    messageCount: 0,
    createdAt: Timestamp.now(),
  };

  await setDoc(ref, profile);
  return profile;
}

/** Get user profile by UID */
export async function getUserByUid(uid: string) {
  const snap = await getDoc(doc(usersCol, uid));
  return snap.exists() ? (snap.data() as UserProfile) : null;
}

/** Get user profile by username */
export async function getUserByUsername(username: string) {
  const q = query(usersCol, where("username", "==", username), limit(1));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  return snap.docs[0].data() as UserProfile;
}

/** Update user profile data */
export async function updateUserProfileData(uid: string, data: Partial<Pick<UserProfile, "bio" | "photoURL" | "displayName" | "whatsapp">>) {
  await updateDoc(doc(usersCol, uid), data);
}

/** Update username */
export async function updateUsername(uid: string, username: string) {
  // Check uniqueness
  const existing = await getUserByUsername(username);
  if (existing && existing.uid !== uid) {
    throw new Error("اليوزرنيم ده مستخدم خلاص!");
  }
  await updateDoc(doc(usersCol, uid), { username });
}

/* ============================================
   MESSAGES
============================================ */

const messagesCol = collection(db, "messages");

/** Send a new message */
export async function sendMessage(data: {
  recipientUid: string;
  recipientUsername: string;
  senderUid?: string;
  senderName?: string;
  senderWhatsapp?: string;
  emotion: Message["emotion"];
  originalText: string;
  rewrittenText: string;
  isAnonymous: boolean;
}) {
  const msg: Omit<Message, "id"> = {
    recipientUid: data.recipientUid,
    recipientUsername: data.recipientUsername,
    senderUid: data.senderUid || "",
    senderName: data.senderName || "",
    senderWhatsapp: data.senderWhatsapp || "",
    emotion: data.emotion,
    originalText: data.originalText,
    rewrittenText: data.rewrittenText,
    isAnonymous: data.isAnonymous,
    isRead: false,
    matchStatus: "none",
    senderConsent: false,
    recipientConsent: false,
    createdAt: serverTimestamp(),
  };

  const docRef = await addDoc(messagesCol, msg);

  // Increment message count safely
  try {
    const userRef = doc(usersCol, data.recipientUid);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      const current = userSnap.data().messageCount || 0;
      await updateDoc(userRef, { messageCount: current + 1 });
    }
  } catch (err) {
    console.warn("Failed to increment user message count (non-critical):", err);
  }

  return docRef.id;
}

/** Get inbox messages for a user */
export async function getInboxMessages(uid: string) {
  const q = query(
    messagesCol,
    where("recipientUid", "==", uid),
    orderBy("createdAt", "desc"),
    limit(50)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Message));
}

/** Get sent messages for a user */
export async function getSentMessages(uid: string) {
  const q = query(
    messagesCol,
    where("senderUid", "==", uid),
    limit(50)
  );
  const snap = await getDocs(q);
  const msgs = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Message));
  msgs.sort((a, b) => {
    const aTime = a.createdAt && typeof (a.createdAt as any).toMillis === 'function' ? (a.createdAt as any).toMillis() : 0;
    const bTime = b.createdAt && typeof (b.createdAt as any).toMillis === 'function' ? (b.createdAt as any).toMillis() : 0;
    return bTime - aTime;
  });
  return msgs;
}

/** Mark message as read */
export async function markAsRead(messageId: string) {
  await updateDoc(doc(messagesCol, messageId), { isRead: true });
}

/** Delete a message */
export async function deleteMessage(messageId: string) {
  const { deleteDoc } = await import("firebase/firestore");
  await deleteDoc(doc(messagesCol, messageId));
}

/** Request identity reveal (recipient side) */
export async function requestReveal(messageId: string) {
  await updateDoc(doc(messagesCol, messageId), {
    recipientConsent: true,
    matchStatus: "pending",
  });
}

/** Accept reveal (sender side) */
export async function acceptReveal(messageId: string) {
  await updateDoc(doc(messagesCol, messageId), {
    senderConsent: true,
    matchStatus: "revealed",
  });
}
