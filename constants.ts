
import { SpaceType, Property } from './types';

export const PLAYER_TOKENS = [
    { color: 'bg-red-500', icon: '🚗', hex: '#ef4444' },
    { color: 'bg-blue-500', icon: '🎩', hex: '#3b82f6' },
    { color: 'bg-green-500', icon: '🐕', hex: '#22c55e' },
    { color: 'bg-yellow-500', icon: '🚢', hex: '#eab308' },
];

export const BOARD_DATA: (Property | { type: SpaceType, name: string })[] = [
  { type: SpaceType.GO, name: 'GO' },
  { name: 'Mediterranean Avenue', type: SpaceType.PROPERTY, price: 60, rent: [2, 10, 30, 90, 160, 250], houseCost: 50, color: 'bg-amber-800' },
  { type: SpaceType.COMMUNITY_CHEST, name: 'Community Chest' },
  { name: 'Baltic Avenue', type: SpaceType.PROPERTY, price: 60, rent: [4, 20, 60, 180, 320, 450], houseCost: 50, color: 'bg-amber-800' },
  { type: SpaceType.TAX, name: 'Income Tax', price: 200 },
  { name: 'Reading Railroad', type: SpaceType.RAILROAD, price: 200, rent: [25, 50, 100, 200] },
  { name: 'Oriental Avenue', type: SpaceType.PROPERTY, price: 100, rent: [6, 30, 90, 270, 400, 550], houseCost: 50, color: 'bg-sky-400' },
  { type: SpaceType.CHANCE, name: 'Chance' },
  { name: 'Vermont Avenue', type: SpaceType.PROPERTY, price: 100, rent: [6, 30, 90, 270, 400, 550], houseCost: 50, color: 'bg-sky-400' },
  { name: 'Connecticut Avenue', type: SpaceType.PROPERTY, price: 120, rent: [8, 40, 100, 300, 450, 600], houseCost: 50, color: 'bg-sky-400' },
  { type: SpaceType.JAIL, name: 'Jail / Just Visiting' },
  { name: 'St. Charles Place', type: SpaceType.PROPERTY, price: 140, rent: [10, 50, 150, 450, 625, 750], houseCost: 100, color: 'bg-pink-500' },
  { name: 'Electric Company', type: SpaceType.UTILITY, price: 150, rent: [4, 10] },
  { name: 'States Avenue', type: SpaceType.PROPERTY, price: 140, rent: [10, 50, 150, 450, 625, 750], houseCost: 100, color: 'bg-pink-500' },
  { name: 'Virginia Avenue', type: SpaceType.PROPERTY, price: 160, rent: [12, 60, 180, 500, 700, 900], houseCost: 100, color: 'bg-pink-500' },
  { name: 'Pennsylvania Railroad', type: SpaceType.RAILROAD, price: 200, rent: [25, 50, 100, 200] },
  { name: 'St. James Place', type: SpaceType.PROPERTY, price: 180, rent: [14, 70, 200, 550, 750, 950], houseCost: 100, color: 'bg-orange-500' },
  { type: SpaceType.COMMUNITY_CHEST, name: 'Community Chest' },
  { name: 'Tennessee Avenue', type: SpaceType.PROPERTY, price: 180, rent: [14, 70, 200, 550, 750, 950], houseCost: 100, color: 'bg-orange-500' },
  { name: 'New York Avenue', type: SpaceType.PROPERTY, price: 200, rent: [16, 80, 220, 600, 800, 1000], houseCost: 100, color: 'bg-orange-500' },
  { type: SpaceType.FREE_PARKING, name: 'Free Parking' },
  { name: 'Kentucky Avenue', type: SpaceType.PROPERTY, price: 220, rent: [18, 90, 250, 700, 875, 1050], houseCost: 150, color: 'bg-red-600' },
  { type: SpaceType.CHANCE, name: 'Chance' },
  { name: 'Indiana Avenue', type: SpaceType.PROPERTY, price: 220, rent: [18, 90, 250, 700, 875, 1050], houseCost: 150, color: 'bg-red-600' },
  { name: 'Illinois Avenue', type: SpaceType.PROPERTY, price: 240, rent: [20, 100, 300, 750, 925, 1100], houseCost: 150, color: 'bg-red-600' },
  { name: 'B. & O. Railroad', type: SpaceType.RAILROAD, price: 200, rent: [25, 50, 100, 200] },
  { name: 'Atlantic Avenue', type: SpaceType.PROPERTY, price: 260, rent: [22, 110, 330, 800, 975, 1150], houseCost: 150, color: 'bg-yellow-400' },
  { name: 'Ventnor Avenue', type: SpaceType.PROPERTY, price: 260, rent: [22, 110, 330, 800, 975, 1150], houseCost: 150, color: 'bg-yellow-400' },
  { name: 'Water Works', type: SpaceType.UTILITY, price: 150, rent: [4, 10] },
  { name: 'Marvin Gardens', type: SpaceType.PROPERTY, price: 280, rent: [24, 120, 360, 850, 1025, 1200], houseCost: 150, color: 'bg-yellow-400' },
  { type: SpaceType.GO_TO_JAIL, name: 'Go To Jail' },
  { name: 'Pacific Avenue', type: SpaceType.PROPERTY, price: 300, rent: [26, 130, 390, 900, 1100, 1275], houseCost: 200, color: 'bg-green-600' },
  { name: 'North Carolina Avenue', type: SpaceType.PROPERTY, price: 300, rent: [26, 130, 390, 900, 1100, 1275], houseCost: 200, color: 'bg-green-600' },
  { type: SpaceType.COMMUNITY_CHEST, name: 'Community Chest' },
  { name: 'Pennsylvania Avenue', type: SpaceType.PROPERTY, price: 320, rent: [28, 150, 450, 1000, 1200, 1400], houseCost: 200, color: 'bg-green-600' },
  { name: 'Short Line', type: SpaceType.RAILROAD, price: 200, rent: [25, 50, 100, 200] },
  { type: SpaceType.CHANCE, name: 'Chance' },
  { name: 'Park Place', type: SpaceType.PROPERTY, price: 350, rent: [35, 175, 500, 1100, 1300, 1500], houseCost: 200, color: 'bg-blue-800' },
  { type: SpaceType.TAX, name: 'Luxury Tax', price: 100 },
  { name: 'Boardwalk', type: SpaceType.PROPERTY, price: 400, rent: [50, 200, 600, 1400, 1700, 2000], houseCost: 200, color: 'bg-blue-800' },
];

export const JAIL_POSITION = 10;
export const GO_TO_JAIL_POSITION = 30;
export const INITIAL_MONEY = 1500;
export const GO_SALARY = 200;