export enum SpaceType {
  PROPERTY,
  RAILROAD,
  UTILITY,
  CHANCE,
  COMMUNITY_CHEST,
  TAX,
  GO,
  JAIL,
  FREE_PARKING,
  GO_TO_JAIL,
}

export interface Space {
  id: number;
  name: string;
  type: SpaceType;
}

export interface Property extends Space {
  price: number;
  rent: number[];
  houseCost: number;
  color: string;
  ownerId?: number;
  houses: number;
  mortgaged: boolean;
}

export interface Player {
  id: number;
  name: string;
  money: number;
  position: number;
  properties: number[];
  isJailed: boolean;
  jailTurns: number;
  tokenColor: string;
  tokenHex: string;
  tokenIcon: string;
  getOutOfJailFreeCards: number;
  lastTransaction: { amount: number; timestamp: number } | null;
}

export enum GamePhase {
  SETUP,
  PLAYER_TURN,
  GAME_OVER,
}

export interface GameState {
  phase: GamePhase;
  players: Player[];
  board: (Space | Property)[];
  currentPlayerIndex: number;
  dice: [number, number];
  gameLog: string[];
  doublesCount: number;
  hasRolled: boolean;
}

export interface TradeOffer {
  fromPlayerId: number;
  toPlayerId: number;
  offer: {
    money: number;
    properties: number[];
  };
  request: {
    money: number;
    properties: number[];
  };
}

export enum CardType {
  CHANCE = 'Chance',
  COMMUNITY_CHEST = 'Community Chest',
}

export enum CardAction {
  PAY_MONEY = 'PAY_MONEY',
  RECEIVE_MONEY = 'RECEIVE_MONEY',
  MOVE_TO = 'MOVE_TO',
  MOVE_BY = 'MOVE_BY',
  GO_TO_JAIL = 'GO_TO_JAIL',
  GET_OUT_OF_JAIL_FREE = 'GET_OUT_OF_JAIL_FREE',
  PAY_PER_PROPERTY = 'PAY_PER_PROPERTY',
  RECEIVE_FROM_PLAYERS = 'RECEIVE_FROM_PLAYERS',
}

export interface CardEffect {
    action: CardAction;
    amount?: number;
    spaceId?: number;
    text: string;
}