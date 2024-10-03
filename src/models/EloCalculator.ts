import { makeAutoObservable } from 'mobx';
import { Match } from '../types';

export const DAY_IN_MS = 1000 * 60 * 60 * 24;

export class EloCalculator {
  constructor(matches: Match[], private K = 50, private decayFactor = 1) {
    makeAutoObservable(this, {}, { autoBind: true });

    this.calculateElo(matches);
  }

  ratings: Record<string, number> = {};
  private history: Record<string, { match: Match; rating: number }[]> = {};

  getRating(player: string): number {
    if (!this.ratings[player]) {
      this.ratings[player] = 1000; // Default Elo rating
    }
    return this.ratings[player];
  }

  private probability(rating1: number, rating2: number): number {
    return 1 / (1 + Math.pow(10, (rating2 - rating1) / 400));
  }

  private applyDecay(currentTime: number, matchTime: number): number {
    const daysDifference = (currentTime - matchTime) / DAY_IN_MS;
    return Math.pow(this.decayFactor, daysDifference);
  }

  private recordHistory(player: string, match: Match) {
    if (!this.history[player]) {
      this.history[player] = [];
    }
    this.history[player].push({ match, rating: this.ratings[player] });
  }

  private processMatch(match: Match, currentTime: number) {
    const rating1 = this.getRating(match.p1);
    const rating2 = this.getRating(match.p2);

    const decay = this.applyDecay(currentTime, match.date);

    const prob1 = this.probability(rating1, rating2);
    const prob2 = 1 - prob1;

    const outcome1 = match.winner === 'p1' ? 1 : 0;
    const outcome2 = match.winner === 'p2' ? 1 : 0;

    this.ratings[match.p1] = rating1 + decay * this.K * (outcome1 - prob1);
    this.ratings[match.p2] = rating2 + decay * this.K * (outcome2 - prob2);

    this.recordHistory(match.p1, match);
    this.recordHistory(match.p2, match);
  }

  private calculateElo(matches: Match[]) {
    const currentTime = Date.now();

    for (const match of matches) {
      this.processMatch(match, currentTime);
    }
  }

  getPlayerHistory(player: string): { match: Match; rating: number }[] {
    return this.history[player] || [];
  }

  getLosses(player: string): number {
    return this.getPlayerHistory(player).filter(
      (instance) => instance.match[instance.match.winner] !== player,
    ).length;
  }

  getWins(player: string): number {
    return this.getPlayerHistory(player).filter(
      (instance) => instance.match[instance.match.winner] === player,
    ).length;
  }

  getStartDate(player: string): number {
    return Math.min(
      ...this.getPlayerHistory(player).map(
        (historyInstance) => historyInstance.match.date,
      ),
    );
  }
}
