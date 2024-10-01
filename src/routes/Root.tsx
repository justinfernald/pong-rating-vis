import { useAppModel } from '../models/AppModel';
import { observer } from 'mobx-react-lite';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
  TimeScale,
} from 'chart.js';
import 'chartjs-adapter-date-fns';

import { Line } from 'react-chartjs-2';
import zoomPlugin from 'chartjs-plugin-zoom';

import { generateColor } from '../utils/colors';
import { useMemo, useRef } from 'react';
import { globalAppModel } from '../App';
import { FlexColumn } from '../components/base/Flex';
import { MultiPlayerSelector } from '../components/MultiPlayerSelector';
import { BaseViewModel, useViewModelConstructor } from '../utils/mobx/ViewModel';
import { makeSimpleAutoObservable } from '../utils/mobx';
import { absolute, flex1, fullSize, fullWidth, relative } from '../styles';
import { ZoomPluginOptions } from 'chartjs-plugin-zoom/types/options';
import { ChartJSOrUndefined } from 'react-chartjs-2/dist/types';
import { Button } from '@blueprintjs/core';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
  zoomPlugin,
);

const zoomOptions: ZoomPluginOptions = {
  pan: {
    enabled: true,
    modifierKey: 'shift',
  },
  zoom: {
    drag: {
      enabled: true,
    },
    mode: 'x',
  },
};

const options: ChartOptions<'line'> = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    zoom: zoomOptions,
    legend: {
      display: false,
    },
    title: {
      display: true,
      text: 'Player Rating History',
    },
    tooltip: {
      callbacks: {
        title(tooltipItems) {
          return `${tooltipItems[0].dataset.label}: ${new Date(
            tooltipItems[0].parsed.x,
          ).toLocaleDateString()}`;
        },
        label(tooltipItem) {
          return `Elo: ${Math.round(tooltipItem.parsed.y)}`;
        },
      },
      displayColors: false,
      mode: 'point',
    },
  },
  scales: {
    x: {
      type: 'time',
      time: {
        unit: 'day',
      },
      title: {
        display: true,
        text: 'Date',
      },
    },
    y: {
      title: {
        display: true,
        text: 'Rating',
      },
    },
  },
  interaction: {
    mode: 'dataset',
    intersect: false,
  },
};

export class RootViewModel extends BaseViewModel {
  selectedPlayers: string[] = [];

  setSelectedPlayers(players: string[]) {
    this.selectedPlayers = players;
  }

  constructor() {
    super();
    makeSimpleAutoObservable(this, {}, { autoBind: true });
  }
}

export const Root = observer(() => {
  const vm = useViewModelConstructor(RootViewModel);
  const appModel = useAppModel();
  const playerHistory = appModel.playerHistory;

  const lineChartRef = useRef<ChartJSOrUndefined<'line'>>(null);

  const data = useMemo(() => {
    return (
      playerHistory && {
        datasets: playerHistory
          .filter(
            (instance) =>
              vm.selectedPlayers.includes(instance.player) ||
              vm.selectedPlayers.length === 0,
          )
          .map((historyInstance) => {
            const color = playerToColor(historyInstance.player);

            return {
              label: historyInstance.player,
              data: historyInstance.history.map((historyInstance) => ({
                x: historyInstance.match.date,
                y: historyInstance.rating,
              })),
              fill: false,
              backgroundColor: color,
              borderColor: color,
              borderWidth: 3,
              tension: 0.1,
            };
          }),
      }
    );
  }, [playerHistory, vm.selectedPlayers]);

  const onResetZoom = () => {
    lineChartRef.current?.resetZoom();
  };

  if (!data) {
    return <div>Loading...</div>;
  }

  return (
    <div css={[absolute(0, 0, 0, 0)]}>
      <FlexColumn css={[fullSize]} alignItems="center">
        {appModel.players && (
          <MultiPlayerSelector
            players={appModel.players}
            selectedPlayers={vm.selectedPlayers}
            setSelectedPlayers={vm.setSelectedPlayers}
          />
        )}
        <div css={[flex1, fullWidth, relative()]}>
          <div css={[absolute(0, 0, 0, 0), { overflow: 'hidden' }]}>
            <Button
              css={[absolute(4, 4)]}
              minimal
              icon="zoom-to-fit"
              onClick={onResetZoom}
            />

            <Line ref={lineChartRef} data={data} options={options} />
          </div>
        </div>
      </FlexColumn>
    </div>
  );
});

export const playerToColor = (player: string) => {
  const index = globalAppModel.indexOfPlayer(player) ?? 0;

  return generateColor(index * 11);
};
