import { db } from '../firebase';
import { collection, onSnapshot, doc, setDoc, getDocs } from 'firebase/firestore';

export const subscribeToData = (
  callback: (calendar: any[], drivers: any[], teams: any[], notifications: any[]) => void
) => {
  let calendar: any[] = [];
  let drivers: any[] = [];
  let teams: any[] = [];
  let notifications: any[] = [];

  const checkAndCallback = () => {
    callback([...calendar], [...drivers], [...teams], [...notifications]);
  };

  const unsubCalendar = onSnapshot(collection(db, "races"), (snap) => {
    calendar = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    checkAndCallback();
  });

  const unsubDrivers = onSnapshot(collection(db, "drivers"), (snap) => {
    drivers = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    checkAndCallback();
  });

  const unsubTeams = onSnapshot(collection(db, "teams"), (snap) => {
    teams = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    checkAndCallback();
  });

  const unsubNotifications = onSnapshot(collection(db, "notifications"), (snap) => {
    notifications = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    checkAndCallback();
  });

  return () => {
    unsubCalendar();
    unsubDrivers();
    unsubTeams();
    unsubNotifications();
  };
};

export const updateDocument = async (collectionName: string, id: string, data: any) => {
  try {
    await setDoc(doc(db, collectionName, id), data, { merge: true });
  } catch (error) {
    console.error(`Error updating ${collectionName}:`, error);
    throw error;
  }
};
