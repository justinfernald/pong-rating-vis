import { makeAutoObservable } from 'mobx';
import { Match } from '../types';

const SPREADSHEET_ID = '1NMnCR2VFc_QWvdpd8R63JgsaWR6ERixwMBueE56gG6c';
// Please don't steal/misuse this api key that would be annoying
const API_KEY = 'AIzaSyCnFV8zu1teRcrclynGLjgDGRDV33t6bOw';
const RANGE = 'Match History!A2:F9999'; // Adjust the range as needed

const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${RANGE}?key=${API_KEY}`;

export class DataModel {
  rawData: string[][] | null = null;

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true });
  }

  async fetchData() {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error('Failed to fetch data');
    }

    const data = await response.json();

    this.rawData = data.values;
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
