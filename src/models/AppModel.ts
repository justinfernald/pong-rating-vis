import { createContext, useContext } from 'react';
import { DataModel } from './DataModel';
import { DAY_IN_MS, EloCalculator } from './EloCalculator';
import { makeAutoObservable } from 'mobx';

export class AppModel {
  dataModel = new DataModel();
  eloCalculator = new EloCalculator();

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true });

    this.dataModel.fetchData();
  }

  get filteredMatches() {
    // Only take matches within the past 2 years
    const currentTime = Date.now();

    // const cutOff = DAY_IN_MS * 105;
    // const cutOff = DAY_IN_MS * 365 * 3;
    const cutOff = Infinity;

    return this.dataModel.matches?.filter((match) => match.date > currentTime - cutOff);
  }

  get players() {
    if (!this.filteredMatches) {
      return null;
    }

    const players = new Set<string>();

    for (const match of this.filteredMatches) {
      players.add(match.p1);
      players.add(match.p2);
    }

    return new Set(Array.from(players).sort());
  }

  get playersArray() {
    return Array.from(this.players || []);
  }

  indexOfPlayer(player: string) {
    return this.playersArray?.indexOf(player);
  }

  get rankings() {
    if (!this.filteredMatches) {
      return null;
    }

    const ratings = this.eloCalculator.calculateElo(this.filteredMatches);

    return Object.entries(ratings)
      .map(([player, score]) => ({ player, score }))
      .sort((a, b) => b.score - a.score);
  }

  get playerHistory() {
    if (!this.filteredMatches) {
      return null;
    }

    this.eloCalculator.calculateElo(this.filteredMatches);

    const players = this.playersArray;

    if (!players) {
      return null;
    }

    const playerHistory = players.map((player) => ({
      player,
      history: this.eloCalculator
        .getPlayerHistory(player)
        .toSorted((a, b) => a.match.date - b.match.date),
    }));

    return playerHistory;
  }
}

export const AppModelContext = createContext<AppModel | null>(null);

export const useAppModel = () => {
  const appModel = useContext(AppModelContext);
  if (!appModel) {
    throw new Error('AppModel not found');
  }
  return appModel;
};
