import { applicationDefault, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const firestoreConnection = () => {
  try {
    initializeApp({
      credential: applicationDefault(),
    });

    const db = getFirestore();

    return { db };
  } catch (error) {
    console.error(error);
  }
};

export const { db } = firestoreConnection();
