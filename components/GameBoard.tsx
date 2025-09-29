import React from 'react';
import { Space, Property, SpaceType, Player } from '../types';

interface PlayerTokenProps {
    player: Player;
    index: number;
    playersOnSpace: Player[];
    positionCoords: { top: string; left: string };
}

const PlayerToken: React.FC<PlayerTokenProps> = ({ player, index, playersOnSpace, positionCoords }) => {
    const totalPlayersOnSpace = playersOnSpace.length;
    // Simple positioning logic to avoid complete overlap
    const offset = index * 12 - (totalPlayersOnSpace-1) * 6;

    return (
        <div
            className={`absolute w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white border-2 border-white shadow-lg transition-all duration-1000 ease-in-out ${player.tokenColor}`}
            style={{ 
                left: `calc(${positionCoords.left} + ${offset}px)`, 
                top: positionCoords.top,
                transform: 'translate(-50%, -50%)',
                zIndex: 20 + index,
             }}
            title={player.name}
        >
            {player.tokenIcon}
        </div>
    );
};

const getRotationClass = (index: number): string => {
  if (index > 0 && index < 10) return 'rotate-180';
  if (index > 10 && index < 20) return 'rotate-90';
  if (index > 20 && index < 30) return '-rotate-0';
  if (index > 30 && index < 40) return '-rotate-90';
  return '';
};

const BoardHouseIndicator: React.FC<{ houses: number }> = ({ houses }) => {
    if (houses <= 0) return null;
    if (houses === 5) {
        return (
            <div className="absolute inset-0 flex justify-center items-center" title="Hotel">
                <span className="text-base text-shadow-hard">🏨</span>
            </div>
        );
    }
    return (
        <div className="absolute inset-0 flex justify-center items-center space-x-0.5" title={`${houses} house(s)`}>
            {Array.from({ length: houses }).map((_, i) => (
                <span key={i} className="text-xs text-shadow-hard">🏠</span>
            ))}
        </div>
    );
};

const SpaceComponent: React.FC<{ space: Space | Property, players: Player[] }> = ({ space, players }) => {
    const isProperty = 'price' in space;
    const property = isProperty ? (space as Property) : null;
    const owner = property?.ownerId !== undefined ? players.find(p => p.id === property.ownerId) : null;

    const getGridPosition = (id: number) => {
        if (id >= 0 && id <= 10) return { gridColumn: `${11 - id}`, gridRow: '11' };
        if (id >= 11 && id <= 20) return { gridColumn: '1', gridRow: `${11 - (id - 10)}` };
        if (id >= 21 && id <= 30) return { gridColumn: `${id - 19}`, gridRow: '1' };
        if (id >= 31 && id <= 39) return { gridColumn: '11', gridRow: `${id - 29}` };
        return {};
    };

    return (
        <div className="bg-[#F0E6D3] border border-black/20 relative flex flex-col" style={getGridPosition(space.id)}>
             {owner && (
                <div className="absolute inset-0 opacity-30" style={{ backgroundColor: owner.tokenHex }}></div>
             )}
             {property && (
                <div className={`relative h-1/4 w-full ${property.color} border-b border-black/20 z-10`}>
                    <BoardHouseIndicator houses={property.houses} />
                </div>
            )}
            <div className={`relative flex-grow p-1 text-center flex flex-col justify-center items-center text-[8px] sm:text-[10px] z-10 ${getRotationClass(space.id)}`}>
                <div className="font-bold uppercase leading-tight">{space.name}</div>
                {property && <div className="mt-1">${property.price}</div>}
            </div>
             {property?.mortgaged && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white text-2xl font-bold rotate-45 z-20">
                    M
                </div>
            )}
        </div>
    );
};

export const GameBoard: React.FC<{ board: (Space | Property)[]; players: Player[] }> = ({ board, players }) => {
    const getPositionCoordinates = (position: number) => {
        const boardSize = 11;
        const spaceSize = 100 / boardSize;
        let x, y;

        if (position >= 0 && position <= 10) {
            y = 10.5 * spaceSize;
            x = (10.5 - position) * spaceSize;
        } else if (position >= 11 && position <= 20) {
            y = (10.5 - (position - 10)) * spaceSize;
            x = 0.5 * spaceSize;
        } else if (position >= 21 && position <= 30) {
            y = 0.5 * spaceSize;
            x = (0.5 + (position - 20)) * spaceSize;
        } else { // 31 to 39
            y = (0.5 + (position - 30)) * spaceSize;
            x = 10.5 * spaceSize;
        }
        return { top: `${y}%`, left: `${x}%` };
    };

    return (
        <div className="w-full aspect-square max-w-[90vh] md:max-w-[800px] mx-auto p-2 bg-gray-900 shadow-2xl rounded-lg">
            <style>{`.text-shadow-hard { text-shadow: 0 0 2px black, 0 0 2px black; }`}</style>
            <div className="relative w-full h-full">
                <div className="grid grid-cols-11 grid-rows-11 w-full h-full bg-[#1A202C] border-4 border-black/60">
                    {board.map(space => <SpaceComponent key={space.id} space={space} players={players} />)}
                    <div className="col-start-2 col-span-9 row-start-2 row-span-9 bg-[#2D3748] flex justify-center items-center border border-black/50">
                        <h1 className="text-5xl md:text-6xl font-display font-extrabold text-[#E53E3E] tracking-wider -rotate-45 border-4 border-[#E53E3E] p-4 shadow-lg bg-gray-800">
                           SIIRJIOU'S MONOPOLY
                        </h1>
                    </div>
                </div>
                 <div className="absolute inset-0 pointer-events-none">
                    {players.map((p, index) => {
                        const playersOnThisSpace = players.filter(pl => pl.position === p.position);
                        const playerIndexOnSpace = playersOnThisSpace.findIndex(pl => pl.id === p.id);
                        return (
                            <PlayerToken
                                key={p.id}
                                player={p}
                                index={playerIndexOnSpace}
                                playersOnSpace={playersOnThisSpace}
                                positionCoords={getPositionCoordinates(p.position)}
                            />
                        );
                    })}
                </div>
            </div>
        </div>
    );
};