import { useAppModel } from '../models/AppModel';

import 'chartjs-adapter-date-fns';

import { Line } from 'react-chartjs-2';

import { useMemo, useRef } from 'react';
import { absolute, fullSize, padding, relative } from '../styles';
import { ChartJSOrUndefined } from 'react-chartjs-2/dist/types';
import { Panel, PanelGroup } from 'react-resizable-panels';
import { IconButton } from '@mui/material';
import { CropFree, Home } from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { generateColor } from '../utils/colors';
import { ResizeHandle } from './Root';
import { ZoomPluginOptions } from 'chartjs-plugin-zoom/types/options';
import { ChartOptions } from 'chart.js';
import { observer } from 'mobx-react-lite';
import { MatchDataTable } from '../components/MatchDataTable';

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

export const Player = observer(() => {
  const { id } = useParams();
  const appModel = useAppModel();
  const playerHistory = appModel.playerHistory;

  const lineChartRef = useRef<ChartJSOrUndefined<'line'>>(null);

  const data = useMemo(() => {
    return (
      playerHistory && {
        datasets: playerHistory
          .filter((instance) => instance.player === id)
          .map((historyInstance) => {
            const color = generateColor(30);

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
  }, [playerHistory, id]);

  const onResetZoom = () => {
    lineChartRef.current?.resetZoom();
  };

  const navigate = useNavigate();

  if (!data) {
    return <div>Loading...</div>;
  }

  return (
    <div css={[absolute(0, 0, 0, 0)]}>
      <div css={[absolute(0, 0, 0, 0)]}>
        <IconButton
          css={[
            absolute(2, undefined, undefined, 2),
            { position: 'absolute !important' as any, zIndex: 100 },
          ]}
          onClick={() => navigate('/')}
        >
          <Home />
        </IconButton>
      </div>
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
          {appModel.dataModel.matches && id ? (
            <div css={[fullSize, padding('md'), relative(), { overflow: 'hidden' }]}>
              <MatchDataTable matches={appModel.dataModel.matches} playerName={id} />
            </div>
          ) : null}
        </Panel>
      </PanelGroup>
    </div>
  );
});
