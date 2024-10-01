import { MenuItem } from '@blueprintjs/core';
import { ItemRendererProps, MultiSelect } from '@blueprintjs/select';
import { ClassNames } from '@emotion/react';
import { observer } from 'mobx-react-lite';

export interface MultiPlayerSelectorProps {
  players: string[];
  selectedPlayers: string[];
  setSelectedPlayers: (players: string[]) => void;
}

export const MultiPlayerSelector = observer((props: MultiPlayerSelectorProps) => {
  const { players, selectedPlayers, setSelectedPlayers } = props;

  return (
    <ClassNames>
      {({ css }) => (
        <MultiSelect
          css={[{ width: 500 }]}
          items={players}
          selectedItems={selectedPlayers}
          itemRenderer={itemRenderer}
          onItemSelect={(player) => setSelectedPlayers([...selectedPlayers, player])}
          tagRenderer={(player) => player}
          tagInputProps={{
            onRemove: (player, index) => {
              setSelectedPlayers(selectedPlayers.filter((p) => p !== player));
            },
          }}
          itemsEqual={(a, b) => a === b}
          itemPredicate={(query, player) =>
            player.toLowerCase().includes(query.toLowerCase())
          }
          placeholder="Select players..."
          onClear={() => setSelectedPlayers([])}
          resetOnSelect={true}
          popoverProps={{ minimal: true }}
          menuProps={{
            className: css({
              maxHeight: 500,
              overflowY: 'auto',
            }),
          }}
        />
      )}
    </ClassNames>
  );
});

const itemRenderer = (player: string, { handleClick, modifiers }: ItemRendererProps) => {
  return (
    <MenuItem
      key={player}
      text={player}
      onClick={handleClick}
      active={modifiers.active}
    />
  );
};
