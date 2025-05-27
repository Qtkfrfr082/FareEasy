// firebaseConfig.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: 'AIzaSyAdVFAh9P_ek9FeNjkHeU3GnU4YgEMI0N4',
  authDomain: 'fareeary-59dd0.firebaseapp.com', // Derived from project_id
  projectId: 'fareeary-59dd0',
  storageBucket: 'fareeary-59dd0.appspot.com', // Correct this to .appspot.com
  messagingSenderId: '54531737499',
  appId: '1:54531737499:android:525d7915a5fa2dc15d033e', // For Android
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
