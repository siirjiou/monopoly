import React from 'react';
import { Property, SpaceType } from '../types';

interface PropertyCardProps {
  property: Property;
  ownerName?: string;
  children?: React.ReactNode;
}

const HouseDisplay: React.FC<{ count: number }> = ({ count }) => {
    if (count === 0) return null;
    if (count === 5) {
        return <div className="absolute top-0 right-1 text-2xl" title="Hotel">🏨</div>;
    }
    return (
        <div className="absolute top-0 right-1 flex space-x-0.5">
            {Array.from({ length: count }).map((_, i) => (
                <div key={i} className="text-base" title="House">🏠</div>
            ))}
        </div>
    );
};

const getRentTierText = (rent: number[], houses: number, type: SpaceType, currentTier: number) => {
    if (type === SpaceType.RAILROAD) {
        return `Rent: $${rent[0]}`;
    }
    if (type === SpaceType.UTILITY) {
        return `Rent is 4x Dice Roll if 1 utility is owned. 10x if both are owned.`;
    }
    const rentAmount = rent[currentTier];
    let text = '';
    if (currentTier === 0) text = "Rent";
    else if (currentTier === 5) text = "With HOTEL";
    else text = `With ${currentTier} House${currentTier > 1 ? 's' : ''}`;
    
    return (
        <div className={`flex justify-between p-1 rounded ${currentTier === houses ? 'bg-blue-200 font-bold' : ''}`}>
            <span>{text}</span>
            <span className="font-semibold">${rentAmount}</span>
        </div>
    )
}

export const PropertyCard: React.FC<PropertyCardProps> = ({ property, ownerName, children }) => {
  return (
    <div className={`relative w-full max-w-sm mx-auto bg-gray-50 rounded-lg border-2 border-black/50 shadow-lg ${property.mortgaged ? 'opacity-70' : ''}`}>
      <HouseDisplay count={property.houses} />
      <div className={`p-2 ${property.color} border-b-2 border-black/50`}>
        <h3 className="text-xl text-center font-bold text-white uppercase tracking-wider">{property.name}</h3>
      </div>
      <div className="p-3 text-sm">
        {property.type !== SpaceType.UTILITY && property.rent && (
            <div className="space-y-1">
                {getRentTierText(property.rent, property.houses, property.type, 0)}
                {property.type === SpaceType.PROPERTY && (
                    <>
                        {getRentTierText(property.rent, property.houses, property.type, 1)}
                        {getRentTierText(property.rent, property.houses, property.type, 2)}
                        {getRentTierText(property.rent, property.houses, property.type, 3)}
                        {getRentTierText(property.rent, property.houses, property.type, 4)}
                        {getRentTierText(property.rent, property.houses, property.type, 5)}
                    </>
                )}
                 {property.type === SpaceType.RAILROAD && (
                    <div className="text-center text-xs mt-2">
                        <p>Rent doubles with each additional railroad owned.</p>
                        <p>2 RRs: $50, 3 RRs: $100, 4 RRs: $200</p>
                    </div>
                )}
            </div>
        )}
        <hr className="my-2" />
        <div className="space-y-1">
            {property.houseCost && (
                 <div className="flex justify-between">
                    <span>House Cost</span>
                    <span>${property.houseCost}</span>
                </div>
            )}
             <div className="flex justify-between">
                <span>Mortgage Value</span>
                <span className="text-green-600">${property.price / 2}</span>
            </div>
        </div>
        {ownerName && <p className="text-center mt-2 text-xs">Owned by: <span className="font-bold">{ownerName}</span></p>}
        {property.mortgaged && <p className="text-center text-red-500 font-bold mt-2">MORTGAGED</p>}
        {children && <div className="mt-3">{children}</div>}
      </div>
    </div>
  );
};