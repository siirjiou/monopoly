import React, { useState } from 'react';
import { Player, Property, Space } from '../types';

interface TradeModalProps {
    currentPlayer: Player;
    targetPlayer: Player;
    board: (Space | Property)[];
    onClose: () => void;
    onPropose: (tradeDetails: any) => void;
}

const PropertySelectItem: React.FC<{ property: Property; onSelect: () => void; isSelected: boolean }> = ({ property, onSelect, isSelected }) => (
    <div onClick={onSelect} className={`p-2 rounded border-2 cursor-pointer ${isSelected ? 'border-blue-500 bg-blue-100' : 'border-gray-300'}`}>
        <div className="flex items-center space-x-2">
            <div className={`w-3 h-6 rounded ${property.color}`}></div>
            <span className="font-semibold">{property.name}</span>
        </div>
    </div>
);


export const TradeModal: React.FC<TradeModalProps> = ({ currentPlayer, targetPlayer, board, onClose, onPropose }) => {
    const [offer, setOffer] = useState<{ money: number, properties: number[] }>({ money: 0, properties: [] });
    const [request, setRequest] = useState<{ money: number, properties: number[] }>({ money: 0, properties: [] });

    const currentPlayerProps = currentPlayer.properties.map(id => board[id] as Property).filter(p => !p.mortgaged);
    const targetPlayerProps = targetPlayer.properties.map(id => board[id] as Property).filter(p => !p.mortgaged);

    const handleSelectOfferProperty = (propId: number) => {
        setOffer(prev => ({ ...prev, properties: prev.properties.includes(propId) ? prev.properties.filter(id => id !== propId) : [...prev.properties, propId] }));
    };

    const handleSelectRequestProperty = (propId: number) => {
        setRequest(prev => ({ ...prev, properties: prev.properties.includes(propId) ? prev.properties.filter(id => id !== propId) : [...prev.properties, propId] }));
    };
    
    const handleProposeTrade = () => {
        onPropose({
            fromPlayerId: currentPlayer.id,
            toPlayerId: targetPlayer.id,
            offer,
            request
        });
    }

    return (
        <div className="p-2">
            <div className="grid grid-cols-2 gap-4">
                {/* Current Player's Offer */}
                <div className="border p-3 rounded-lg">
                    <h4 className="font-bold text-lg text-center mb-2">{currentPlayer.name} Offers</h4>
                    <label className="block mb-2">
                        Money:
                        <input type="number" value={offer.money} onChange={e => setOffer(p => ({...p, money: Math.min(currentPlayer.money, parseInt(e.target.value) || 0)}))} 
                        className="w-full p-1 border rounded" max={currentPlayer.money} />
                    </label>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                        {currentPlayerProps.length > 0 ? currentPlayerProps.map(p => <PropertySelectItem key={p.id} property={p} onSelect={() => handleSelectOfferProperty(p.id)} isSelected={offer.properties.includes(p.id)} />) : <p className="text-xs text-gray-400 italic">No properties to trade.</p>}
                    </div>
                </div>

                {/* Target Player's Offer (Request) */}
                 <div className="border p-3 rounded-lg">
                    <h4 className="font-bold text-lg text-center mb-2">{targetPlayer.name} Offers</h4>
                    <label className="block mb-2">
                        Money:
                        <input type="number" value={request.money} onChange={e => setRequest(p => ({...p, money: Math.min(targetPlayer.money, parseInt(e.target.value) || 0)}))} 
                        className="w-full p-1 border rounded" max={targetPlayer.money} />
                    </label>
                     <div className="space-y-2 max-h-48 overflow-y-auto">
                        {targetPlayerProps.length > 0 ? targetPlayerProps.map(p => <PropertySelectItem key={p.id} property={p} onSelect={() => handleSelectRequestProperty(p.id)} isSelected={request.properties.includes(p.id)} />) : <p className="text-xs text-gray-400 italic">No properties to trade.</p>}
                    </div>
                </div>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
                <button onClick={onClose} className="bg-gray-400 text-white px-4 py-2 rounded-lg">Cancel</button>
                <button onClick={handleProposeTrade} className="bg-green-600 text-white px-4 py-2 rounded-lg">Propose Trade</button>
            </div>
        </div>
    )
}