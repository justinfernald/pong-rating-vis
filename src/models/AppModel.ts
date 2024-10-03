import { createContext, useContext } from 'react';
import { DataModel } from './DataModel';
import { DAY_IN_MS, EloCalculator } from './EloCalculator';
import { autorun, makeAutoObservable } from 'mobx';
import { Player } from '../components/PlayerDataTable';

export class AppModel {
  dataModel = new DataModel();
  eloCalculator = new EloCalculator(this.filteredMatches ?? []);

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true });

    this.setup();
  }

  setup() {
    this.dataModel.fetchData();

    autorun(() => {
      this.eloCalculator = new EloCalculator(this.filteredMatches ?? []);
    });
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

  playerInfo(playerName: string): Player {
    return {
      name: playerName,
      ranking:
        this.rankings?.find((ranking) => ranking.player === playerName)?.score ??
        Infinity,
      losses: this.eloCalculator.getLosses(playerName),
      wins: this.eloCalculator.getWins(playerName),
      rating: this.eloCalculator.getRating(playerName),
      startDate: this.eloCalculator.getStartDate(playerName),
    };
  }

  indexOfPlayer(playerName: string) {
    return this.playersArray?.indexOf(playerName);
  }

  get rankings() {
    if (!this.filteredMatches) {
      return null;
    }

    const ratings = this.eloCalculator.ratings;

    return Object.entries(ratings)
      .map(([player, score]) => ({ player, score }))
      .sort((a, b) => b.score - a.score);
  }

  get playerHistory() {
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

  get playerData(): Player[] {
    const players = this.playersArray;
    const rankings = this.rankings;

    if (!players || !rankings) {
      return [];
    }

    return players.map((player) => {
      return {
        name: player,
        ranking:
          (rankings.findIndex((ranking) => ranking.player === player) ?? Infinity) + 1,
        losses: this.eloCalculator.getLosses(player),
        wins: this.eloCalculator.getWins(player),
        rating: Math.round(this.eloCalculator.getRating(player)),
        startDate: this.eloCalculator.getStartDate(player),
      };
    });
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
