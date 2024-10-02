import { makeAutoObservable } from 'mobx';
import { Match } from '../types';

import { initializeApp } from 'firebase/app';
import { getFunctions, httpsCallable } from 'firebase/functions';

const firebaseConfig = {
  apiKey: 'AIzaSyA8SmR7CrITBqF16VIS79AnZZ4g9oDCpl0',
  authDomain: 'gar-pong.firebaseapp.com',
  projectId: 'gar-pong',
  storageBucket: 'gar-pong.appspot.com',
  messagingSenderId: '456544242737',
  appId: '1:456544242737:web:99ea27c49caf546f335910',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const functions = getFunctions(app);

const fetchSheetData = httpsCallable(functions, 'fetchData');

export class DataModel {
  rawData: string[][] | null = null;

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true });
  }

  async fetchData() {
    const { data } = await fetchSheetData({});
    const dataAsAny = data as any;
    this.rawData = dataAsAny.values;
  }

  get matches(): Match[] | null {
    if (!this.rawData) {
      return null;
    }

    return this.rawData.map(this.rowToMatch).sort((a, b) => a.date - b.date);
  }

  private rowToMatch(row: string[]): Match {
    return {
      p1: row[2],
      p2: row[5],
      winner: row[4] === 'Player 1' ? 'p1' : 'p2',
      date: new Date(row[0]).getTime(),
    };
  }
}
