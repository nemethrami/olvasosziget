import * as admin from "firebase-admin";
import { DocumentData } from "firebase-admin/firestore";
import * as functions from "firebase-functions";

admin.initializeApp();
const db = admin.firestore();

export const deleteOldDocuments = functions.pubsub.schedule("every 24 hours").onRun(async () => {
  const collectionName = "banned";
  const now = admin.firestore.Timestamp.now();
  const sevenDaysAgo = admin.firestore.Timestamp.fromMillis(now.toMillis() - 7 * 24 * 60 * 60 * 1000); // Subtract 7 days in milliseconds

  try {
    const querySnapshot = await db.collection(collectionName).where("banned_at", "<", sevenDaysAgo).get();
    const deletePromises = querySnapshot.docs.map((doc: DocumentData) => doc.ref.delete());
    await Promise.all(deletePromises);

    return null;
  } catch (error) {
    throw new functions.https.HttpsError("internal", "Failed to delete old documents");
  }
});
