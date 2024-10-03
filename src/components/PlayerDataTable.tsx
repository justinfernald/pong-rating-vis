import {
  MaterialReactTable,
  MRT_ColumnDef,
  MRT_RowSelectionState,
  MRT_Updater,
  useMaterialReactTable,
} from 'material-react-table';
import { observer } from 'mobx-react-lite';
import { useEffect, useMemo, useState } from 'react';
import { fullSize } from '../styles';
import { Link } from '@mui/material';
import { BaseViewModel } from '../utils/mobx/ViewModel';
import { makeSimpleAutoObservable } from '../utils/mobx';
import { AppModel } from '../models/AppModel';
import { toJS } from 'mobx';

export interface Player {
  name: string;
  wins: number;
  losses: number;
  rating: number;
  ranking: number;
  startDate: number;
}

//mock data - strongly typed if you are using TypeScript (optional, but recommended)
const data: Player[] = [
  { name: 'John', wins: 5, losses: 2, rating: 1500, ranking: 1, startDate: Date.now() },
  { name: 'Sara', wins: 3, losses: 4, rating: 1400, ranking: 2, startDate: Date.now() },
  { name: 'Alex', wins: 6, losses: 1, rating: 1550, ranking: 3, startDate: Date.now() },
  { name: 'Emily', wins: 4, losses: 3, rating: 1450, ranking: 4, startDate: Date.now() },
  {
    name: 'Michael',
    wins: 2,
    losses: 5,
    rating: 1350,
    ranking: 5,
    startDate: Date.now(),
  },
  { name: 'Olivia', wins: 7, losses: 0, rating: 1600, ranking: 6, startDate: Date.now() },
  { name: 'David', wins: 5, losses: 2, rating: 1520, ranking: 7, startDate: Date.now() },
  { name: 'Sophia', wins: 3, losses: 4, rating: 1425, ranking: 8, startDate: Date.now() },
  { name: 'James', wins: 6, losses: 1, rating: 1570, ranking: 9, startDate: Date.now() },
  { name: 'Ava', wins: 4, losses: 3, rating: 1470, ranking: 10, startDate: Date.now() },
  {
    name: 'Daniel',
    wins: 2,
    losses: 5,
    rating: 1380,
    ranking: 11,
    startDate: Date.now(),
  },
  {
    name: 'Isabella',
    wins: 7,
    losses: 0,
    rating: 1610,
    ranking: 12,
    startDate: Date.now(),
  },
  {
    name: 'William',
    wins: 5,
    losses: 2,
    rating: 1530,
    ranking: 13,
    startDate: Date.now(),
  },
  { name: 'Mia', wins: 3, losses: 4, rating: 1440, ranking: 14, startDate: Date.now() },
  { name: 'Henry', wins: 6, losses: 1, rating: 1580, ranking: 15, startDate: Date.now() },
  {
    name: 'Amelia',
    wins: 4,
    losses: 3,
    rating: 1480,
    ranking: 16,
    startDate: Date.now(),
  },
  { name: 'Ethan', wins: 2, losses: 5, rating: 1390, ranking: 17, startDate: Date.now() },
  {
    name: 'Charlotte',
    wins: 7,
    losses: 0,
    rating: 1620,
    ranking: 18,
    startDate: Date.now(),
  },
  {
    name: 'Benjamin',
    wins: 5,
    losses: 2,
    rating: 1540,
    ranking: 19,
    startDate: Date.now(),
  },
  {
    name: 'Harper',
    wins: 3,
    losses: 4,
    rating: 1455,
    ranking: 20,
    startDate: Date.now(),
  },
];

export interface PlayerDataTableViewModelProps {
  appModel: AppModel;
}

export class PlayerDataTableViewModel extends BaseViewModel<PlayerDataTableViewModelProps> {
  constructor(props: PlayerDataTableViewModelProps) {
    super(props);
    makeSimpleAutoObservable(this, {}, { autoBind: true });
  }

  get data() {
    return this.props.appModel.playerData;
  }

  selectedPlayers: Set<string> = new Set();

  setSelectedPlayers(players: Set<string>) {
    this.selectedPlayers = players;
  }

  get rowSelection() {
    return Array.from(this.selectedPlayers).reduce(
      (acc, player) => ({ ...acc, [player]: true }),
      {},
    );
  }

  setRowSelection(updater: MRT_Updater<MRT_RowSelectionState>) {
    const values = typeof updater === 'function' ? updater(this.rowSelection) : updater;

    this.selectedPlayers = new Set(Object.keys(values).filter((key) => values[key]));

    console.log(toJS(this.selectedPlayers));
  }
}

export interface PlayerDataTableProps {
  viewModel: PlayerDataTableViewModel;
}

export const PlayerDataTable = observer((props: PlayerDataTableProps) => {
  const { viewModel } = props;

  const columns = useMemo<MRT_ColumnDef<Player>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'Name',
        enableHiding: false,
        size: 240,
        Cell: ({ cell }) => (
          <Link href={`/player/${cell.getValue<string>()}`}>
            {cell.getValue<string>()}
          </Link>
        ),
      },
      {
        accessorKey: 'ranking',
        header: 'Rank',
        filterVariant: 'range',
        filterFn: 'betweenInclusive',
        size: 164,
        muiFilterTextFieldProps: {
          sx: { width: '72px !important', minWidth: '0 !important' },
        },
      },
      {
        accessorKey: 'rating',
        header: 'Rating',
        filterVariant: 'range-slider',
        filterFn: 'betweenInclusive',

        size: 164,
        muiFilterSliderProps: {
          marks: true,
          step: 50,
        },
      },
      {
        accessorKey: 'wins',
        header: 'Wins',
        filterVariant: 'range',
        filterFn: 'betweenInclusive',
        size: 164,
        muiFilterTextFieldProps: {
          sx: { width: '72px !important', minWidth: '0 !important' },
        },
      },
      {
        accessorKey: 'losses',
        header: 'Losses',
        filterVariant: 'range',
        filterFn: 'betweenInclusive',
        size: 164,
        muiFilterTextFieldProps: {
          sx: { width: '72px !important', minWidth: '0 !important' },
        },
      },
      {
        accessorKey: 'startDate',
        header: 'Start Date',
        Cell: ({ cell }) => new Date(cell.getValue<number>()).toLocaleDateString(), //custom cell renderer
        filterVariant: 'date-range',
        filterFn: 'betweenInclusive',
        size: 315,
        muiFilterDatePickerProps: {
          sx: {
            width: '72px !important',
            minWidth: '0 !important',
            backgroundColor: 'red',
          },
          className: 'mui-date-picker',
          format: 'MM/dd/yy',
        },
      },
    ],
    [],
  );

  //pass table options to useMaterialReactTable
  const table = useMaterialReactTable({
    getRowId: (row) => row.name,
    columns,
    data: viewModel.data, //must be memoized or stable (useState, useMemo, defined outside of this component, etc.)
    enableBottomToolbar: false,

    // enableGlobalFilter: false,

    enableColumnResizing: true,
    enableRowSelection: true,
    enableColumnOrdering: true,
    enableRowVirtualization: true,
    enablePagination: false,
    enableFacetedValues: true,

    enableEditing: false,

    enableStickyHeader: true,

    muiTableContainerProps: { sx: { flex: 1 } },
    muiTablePaperProps: {
      sx: { maxHeight: '100%', display: 'flex', flexDirection: 'column' },
    },

    onRowSelectionChange: viewModel.setRowSelection,
    state: {
      rowSelection: viewModel.rowSelection,
    },

    initialState: {
      sorting: [{ id: 'ranking', desc: false }],
      columnVisibility: {
        startDate: false,
      },
    },
  });

  //do something when the row selection changes...
  useEffect(() => {
    console.info(viewModel.rowSelection); //read your managed row selection state
  }, [viewModel.rowSelection]);

  return <MaterialReactTable css={fullSize} table={table} />;
});
