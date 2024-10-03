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
import { BaseViewModel, useViewModelConstructor } from '../utils/mobx/ViewModel';
import { makeSimpleAutoObservable } from '../utils/mobx';
import { absolute, flexCenter, fullSize, padding, relative } from '../styles';
import { ZoomPluginOptions } from 'chartjs-plugin-zoom/types/options';
import { ChartJSOrUndefined } from 'react-chartjs-2/dist/types';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { IconButton } from '@mui/material';
import { CropFree, DragIndicator } from '@mui/icons-material';
import { PlayerDataTable, PlayerDataTableViewModel } from '../components/PlayerDataTable';

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
  },
  zoom: {
    wheel: {
      enabled: true,
    },
    pinch: {
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
        unit: 'month',
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

export interface RootViewModelProps {
  dataTableVm: PlayerDataTableViewModel;
}

export class RootViewModel extends BaseViewModel<RootViewModelProps> {
  get selectedPlayers() {
    return this.props.dataTableVm.selectedPlayers;
  }

  constructor(props: RootViewModelProps) {
    super(props);
    makeSimpleAutoObservable(this, {}, { autoBind: true });
  }
}

export const Root = observer(() => {
  const appModel = useAppModel();
  const dataTableVm = useViewModelConstructor(PlayerDataTableViewModel, {
    appModel,
  });
  const vm = useViewModelConstructor(RootViewModel, {
    dataTableVm,
  });
  const playerHistory = appModel.playerHistory;

  const lineChartRef = useRef<ChartJSOrUndefined<'line'>>(null);

  const data = useMemo(() => {
    return (
      playerHistory && {
        datasets: playerHistory
          .filter(
            (instance) =>
              vm.selectedPlayers.has(instance.player) || vm.selectedPlayers.size === 0,
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
      <PanelGroup css={[fullSize]} direction="vertical">
        <Panel collapsible defaultSize={50} minSize={20}>
          <div css={[fullSize, relative()]}>
            <div css={[absolute(0, 0, 0, 0), { overflow: 'hidden' }]}>
              <IconButton
                css={[absolute(2, 2), { position: 'absolute !important' as any }]}
                onClick={onResetZoom}
              >
                <CropFree />
              </IconButton>

              <Line ref={lineChartRef} data={data} options={options} />
            </div>
          </div>
        </Panel>
        <ResizeHandle />
        <Panel collapsible defaultSize={50} minSize={20}>
          <div css={[fullSize, padding('md'), relative(), { overflow: 'hidden' }]}>
            {/* {appModel.players && (
              <MultiPlayerSelector
              players={appModel.players}
              selectedPlayers={vm.selectedPlayers}
              setSelectedPlayers={vm.setSelectedPlayers}
              />
              )} */}
            <PlayerDataTable viewModel={dataTableVm} />
          </div>
        </Panel>
      </PanelGroup>
    </div>
  );
});

export const playerToColor = (player: string) => {
  const index = globalAppModel.indexOfPlayer(player) ?? 0;

  return generateColor(index * 11);
};

export function ResizeHandle({
  className = '',
  collapsed = false,
  id,
}: {
  className?: string;
  collapsed?: boolean;
  id?: string;
}) {
  return (
    <PanelResizeHandle
      className={className}
      css={{
        margin: 4,
        borderRadius: 4,
        height: 14,
        backgroundColor: '#f1f1f1',
        transition: '0.3s ease-in-out',
        '&:hover': {
          backgroundColor: '#e4e4e4',
        },
        '&:active': {
          backgroundColor: '#c5c5c5',
        },
      }}
      id={id}
    >
      <div
        css={[
          flexCenter,
          fullSize,
          { transform: 'perspective(1px) scale(0.8) rotate(90deg)' },
        ]}
        data-collapsed={collapsed || undefined}
      >
        <DragIndicator css={{ color: '#979797' }} />
      </div>
    </PanelResizeHandle>
  );
}
