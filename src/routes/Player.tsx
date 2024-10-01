import { useParams } from 'react-router-dom';

export const Player = () => {
  const { id } = useParams();

  return (
    <div>
      <h1>Player {id}</h1>
    </div>
  );
};
