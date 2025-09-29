import React from 'react';
import { Player, Property, Space } from '../types';

interface PlayerInfoProps {
  player: Player;
  isCurrentPlayer: boolean;
  board: (Space | Property)[];
  onViewProperties: (player: Player) => void;
  onProposeTrade: (player: Player) => void;
}

const MiniPropertyCard: React.FC<{ property: Property }> = ({ property }) => (
    <div className={`flex items-center space-x-2 p-1 rounded text-xs ${property.mortgaged ? 'bg-gray-300' : 'bg-white'}`} title={`${property.name} - ${property.houses} houses`}>
        <div className={`w-2 h-full rounded-l ${property.color}`}></div>
        <span className={`truncate ${property.mortgaged ? 'line-through' : ''}`}>{property.name}</span>
    </div>
);

export const PlayerInfo: React.FC<PlayerInfoProps> = ({ player, isCurrentPlayer, board, onViewProperties, onProposeTrade }) => {
  const ownedProperties = player.properties
    .map(propId => board.find(s => s.id === propId))
    .filter(p => p && 'price' in p) as Property[];

  return (
    <div className={`p-4 rounded-lg shadow-md transition-all duration-300 ${isCurrentPlayer ? 'bg-blue-100 scale-105 shadow-2xl' : 'bg-gray-100'}`}>
      <div className="flex items-center justify-between pb-2 border-b">
        <div className="flex items-center space-x-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-lg ${player.tokenColor} text-white shadow-inner`}>
                {player.tokenIcon}
            </div>
            <h3 className="text-xl font-bold font-display text-gray-800">{player.name}</h3>
        </div>
        {player.isJailed && <span className="text-red-500 font-bold text-sm">IN JAIL</span>}
      </div>
      
      <div className="mt-3">
        <div className="flex items-baseline space-x-2 h-8">
            <p className="text-2xl font-semibold text-blue-700">${player.money.toLocaleString()}</p>
             {player.lastTransaction && player.lastTransaction.amount !== 0 && (
                <span 
                    className={`font-bold text-lg ${player.lastTransaction.amount > 0 ? 'text-green-500' : 'text-red-500'}`}
                >
                    {player.lastTransaction.amount > 0 ? '+' : ''}{player.lastTransaction.amount.toLocaleString()}
                </span>
            )}
        </div>
        
        <div className="mt-4">
            <h4 className="text-sm font-semibold text-gray-600 mb-2">Properties ({ownedProperties.length}):</h4>
            {ownedProperties.length > 0 ? (
                 <div className="grid grid-cols-2 gap-1 max-h-24 overflow-y-auto pr-2">
                    {ownedProperties.map(prop => <MiniPropertyCard key={prop.id} property={prop} />)}
                </div>
            ) : (
                <p className="text-xs text-gray-400 italic">No properties owned.</p>
            )}
        </div>

         <div className="mt-3 flex space-x-2">
            <button onClick={() => onViewProperties(player)} className="text-xs bg-gray-500 text-white px-2 py-1 rounded hover:bg-gray-600 transition-colors w-full">
                Manage Properties
            </button>
            {!isCurrentPlayer && (
                 <button onClick={() => onProposeTrade(player)} className="text-xs bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600 transition-colors w-full">
                    Trade
                </button>
            )}
        </div>

        {player.getOutOfJailFreeCards > 0 && 
            <p className="text-xs text-blue-600 mt-2 font-semibold">
                Has {player.getOutOfJailFreeCards} 'Get Out of Jail Free' card(s).
            </p>
        }
      </div>
    </div>
  );
};