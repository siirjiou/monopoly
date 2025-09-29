import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { GameBoard } from './components/GameBoard';
import { PlayerInfo } from './components/PlayerInfo';
import { Modal } from './components/Modal';
import { Dice } from './components/Dice';
import { PropertyCard } from './components/PropertyCard';
import { TradeModal } from './components/TradeModal';
import {
  GameState,
  GamePhase,
  Player,
  Property,
  Space,
  SpaceType,
  CardType,
  CardEffect,
  CardAction,
  TradeOffer,
} from './types';
import {
  BOARD_DATA,
  JAIL_POSITION,
  GO_TO_JAIL_POSITION,
  INITIAL_MONEY,
  GO_SALARY,
  PLAYER_TOKENS,
} from './constants';
import { generateCardEvent } from './services/geminiService';

const initialBoard = BOARD_DATA.map((space, index) => ({
  id: index,
  ...space,
  ...('price' in space ? { ownerId: undefined, houses: 0, mortgaged: false } : {}),
})) as (Space | Property)[];

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>({
    phase: GamePhase.SETUP,
    players: [],
    board: initialBoard,
    currentPlayerIndex: 0,
    dice: [0, 0],
    gameLog: ['Welcome to Siirjiou\'s Monopoly!'],
    doublesCount: 0,
    hasRolled: false,
  });

  const [modal, setModal] = useState<{
    isOpen: boolean;
    title: string;
    content: React.ReactNode;
    onClose?: () => void;
  }>({ isOpen: false, title: '', content: null });
  
  const [isRolling, setIsRolling] = useState(false);
  const [pendingTrade, setPendingTrade] = useState<TradeOffer | null>(null);

  const log = useCallback((message: string) => {
    setGameState(prev => ({ ...prev, gameLog: [`[${new Date().toLocaleTimeString()}] ${message}`, ...prev.gameLog.slice(0, 49)] }));
  }, []);

  const currentPlayer = useMemo(() => {
    if (gameState.phase !== GamePhase.PLAYER_TURN) return null;
    return gameState.players[gameState.currentPlayerIndex];
  }, [gameState.players, gameState.currentPlayerIndex, gameState.phase]);

  const closeModal = () => setModal(prev => ({ ...prev, isOpen: false, onClose: undefined }));

  const showAlert = (title: string, message: string | React.ReactNode, onOk?: () => void) => {
    setModal({
      isOpen: true,
      title,
      onClose: () => { closeModal(); if (onOk) onOk(); },
      content: (
        <>
          <div className="text-gray-700">{message}</div>
          <div className="text-right mt-6">
            <button
              className="bg-blue-600 text-white px-5 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              onClick={() => { closeModal(); if (onOk) onOk(); }}
            >
              OK
            </button>
          </div>
        </>
      ),
    });
  };

  const startGame = (playerCount: number) => {
    const newPlayers: Player[] = Array.from({ length: playerCount }, (_, i) => ({
      id: i, name: `Player ${i + 1}`, money: INITIAL_MONEY, position: 0, properties: [],
      isJailed: false, jailTurns: 0, getOutOfJailFreeCards: 0,
      tokenColor: PLAYER_TOKENS[i].color, tokenIcon: PLAYER_TOKENS[i].icon, tokenHex: PLAYER_TOKENS[i].hex,
      lastTransaction: null,
    }));
    setGameState(prev => ({ ...prev, phase: GamePhase.PLAYER_TURN, players: newPlayers, board: initialBoard, currentPlayerIndex: 0, gameLog: ['Game started! It is Player 1\'s turn.'] }));
    log(`Game started with ${playerCount} players.`);
  };
  
  const endTurn = useCallback(() => {
    if (!currentPlayer || pendingTrade) return;

    if (gameState.dice[0] === gameState.dice[1] && gameState.doublesCount < 3) {
      log(`${currentPlayer.name} rolled doubles and gets another turn!`);
      setGameState(prev => ({ ...prev, hasRolled: false }));
      return;
    }

    const nextPlayerIndex = (gameState.currentPlayerIndex + 1) % gameState.players.length;
    const nextPlayer = gameState.players[nextPlayerIndex];

    if (nextPlayer) {
      log(`It is now ${nextPlayer.name}'s turn.`);
    }

    setGameState(prev => ({ ...prev, currentPlayerIndex: nextPlayerIndex, hasRolled: false, doublesCount: 0 }));
  }, [gameState, currentPlayer, log, pendingTrade]);

  const handlePlayerPayment = (payerId: number, amount: number, recipientId?: number) => {
    setGameState(prev => {
        const players = [...prev.players];
        const payer = { ...players[payerId] };
        
        const paymentAmount = Math.min(amount, payer.money);
        if (amount > payer.money) {
             log(`${payer.name} doesn't have enough money, paying all they have.`);
        }

        payer.money -= paymentAmount;
        payer.lastTransaction = { amount: -paymentAmount, timestamp: Date.now() };
        players[payerId] = payer;

        if (recipientId !== undefined && recipientId !== -1) { // -1 for the bank
            const recipient = {...players[recipientId]};
            recipient.money += paymentAmount;
            recipient.lastTransaction = { amount: paymentAmount, timestamp: Date.now() };
            players[recipientId] = recipient;
        }
        return {...prev, players};
    });
  };

  const handlePlayerGain = (playerId: number, amount: number) => {
    setGameState(prev => {
        const players = [...prev.players];
        const player = { ...players[playerId] };
        player.money += amount;
        player.lastTransaction = { amount, timestamp: Date.now() };
        players[playerId] = player;
        return { ...prev, players };
    });
  };


  const movePlayerTo = useCallback((player: Player, newPosition: number, passGoCheck: boolean) => {
      let movedPlayer: Player;
      setGameState(prev => {
          const players = [...prev.players];
          const playerToMove = { ...players[player.id] };
          const oldPosition = playerToMove.position;

          if (passGoCheck && newPosition < oldPosition && !playerToMove.isJailed) {
              playerToMove.money += GO_SALARY;
              playerToMove.lastTransaction = { amount: GO_SALARY, timestamp: Date.now() };
              log(`${playerToMove.name} passed GO and collected $${GO_SALARY}.`);
          }
          playerToMove.position = newPosition;
          players[player.id] = playerToMove;
          movedPlayer = playerToMove;
          return { ...prev, players };
      });
      setTimeout(() => {
        const space = gameState.board[newPosition];
        handleSpaceLanding(movedPlayer, space);
    }, 1200);
  }, [gameState.board, log]);

  const handleSpaceLanding = useCallback((player: Player, space: Space | Property) => {
    log(`${player.name} landed on ${space.name}.`);
    switch(space.type) {
        case SpaceType.PROPERTY:
        case SpaceType.RAILROAD:
        case SpaceType.UTILITY:
            const prop = space as Property;
            if (prop.ownerId === undefined) {
                 if(player.money >= prop.price) {
                    setModal({
                        isOpen: true, title: `Buy ${prop.name}?`,
                        onClose: endTurn,
                        content: (
                            <div>
                                <PropertyCard property={prop} />
                                <p className="text-xl my-4 text-center">Would you like to buy it for ${prop.price}?</p>
                                <div className="flex justify-around">
                                    <button className="bg-green-500 text-white px-6 py-2 rounded-lg font-bold" onClick={() => buyProperty(prop.id)}>Buy</button>
                                    <button className="bg-gray-400 text-white px-6 py-2 rounded-lg font-bold" onClick={() => {closeModal(); endTurn(); }}>Decline</button>
                                </div>
                            </div>
                        )
                    })
                 } else {
                     log(`${player.name} cannot afford to buy ${prop.name}.`);
                     endTurn();
                 }
            } else if (prop.ownerId !== player.id && !prop.mortgaged) {
                const owner = gameState.players[prop.ownerId];
                const rent = (prop.rent as number[])[prop.houses] || (prop.rent as number[])[0];
                showAlert("Pay Rent", `This property is owned by ${owner.name}. You owe $${rent} in rent.`, () => {
                     handlePlayerPayment(player.id, rent, prop.ownerId);
                     endTurn();
                });
            } else {
                endTurn();
            }
            break;
        case SpaceType.CHANCE:
        case SpaceType.COMMUNITY_CHEST:
            drawCard(space.type === SpaceType.CHANCE ? CardType.CHANCE : CardType.COMMUNITY_CHEST);
            break;
        case SpaceType.TAX:
            const taxAmount = (space as any).price;
            showAlert("Tax Due", `You landed on ${space.name}. You must pay $${taxAmount}.`, () => {
                handlePlayerPayment(player.id, taxAmount, -1);
                endTurn();
            });
            break;
        case SpaceType.GO_TO_JAIL:
            goToJail(player.id);
            break;
        default:
            endTurn();
    }
  }, [gameState.players, log, endTurn]);

  const movePlayerBy = useCallback((totalDice: number) => {
    let movedPlayer: Player;
    let newPosition: number;
    setGameState(prev => {
      const players = [...prev.players];
      const player = { ...players[prev.currentPlayerIndex] };
      newPosition = (player.position + totalDice) % 40;
      if (newPosition < player.position && !player.isJailed) {
        player.money += GO_SALARY;
        player.lastTransaction = { amount: GO_SALARY, timestamp: Date.now() };
        log(`${player.name} passed GO and collected $${GO_SALARY}.`);
      }
      player.position = newPosition;
      players[prev.currentPlayerIndex] = player;
      movedPlayer = player;
      return { ...prev, players };
    });
    
    setTimeout(() => {
        const space = gameState.board[newPosition];
        handleSpaceLanding(movedPlayer, space);
    }, 1200);

  }, [log, handleSpaceLanding, gameState.board]);
  
  const rollDice = useCallback(() => {
    if (!currentPlayer || gameState.hasRolled || isRolling) return;
    setIsRolling(true);

    const die1 = Math.floor(Math.random() * 6) + 1;
    const die2 = Math.floor(Math.random() * 6) + 1;
    
    setTimeout(() => {
        log(`${currentPlayer.name} rolled a ${die1} and a ${die2}.`);
        const isDouble = die1 === die2;
        const newDoublesCount = isDouble ? gameState.doublesCount + 1 : 0;
        
        setGameState(prev => ({ ...prev, dice: [die1, die2], hasRolled: true, doublesCount: newDoublesCount }));
        setIsRolling(false);
        
        if (newDoublesCount === 3) {
            log(`${currentPlayer.name} rolled doubles three times! Go to jail.`);
            goToJail(currentPlayer.id);
        } else {
            movePlayerBy(die1 + die2);
        }
    }, 1500);
  }, [gameState, currentPlayer, log, movePlayerBy, isRolling]);

  const buyProperty = (spaceId: number) => {
    if (!currentPlayer) return;
    const prop = gameState.board[spaceId] as Property;
    handlePlayerPayment(currentPlayer.id, prop.price, -1);
    
    setGameState(prev => {
        const board = [...prev.board];
        const players = [...prev.players];
        const player = {...players[prev.currentPlayerIndex]};
        const propToUpdate = {...board[spaceId]} as Property;

        player.properties.push(propToUpdate.id);
        propToUpdate.ownerId = player.id;

        players[prev.currentPlayerIndex] = player;
        board[spaceId] = propToUpdate;
        
        log(`${player.name} bought ${propToUpdate.name} for $${propToUpdate.price}.`);
        return {...prev, players, board};
    });
    closeModal();
    endTurn();
  };

  const goToJail = (playerId: number) => {
    showAlert("Go to Jail!", "You are being sent directly to jail. Do not pass GO, do not collect $200.", () => {
        setGameState(prev => {
            const players = [...prev.players];
            const player = {...players[playerId]};
            player.position = JAIL_POSITION;
            player.isJailed = true;
            player.jailTurns = 0;
            players[playerId] = player;
            return {...prev, players}
        });
        endTurn();
    });
  };

  const applyCardEffect = (effect: CardEffect) => {
    if(!currentPlayer) return;

    switch (effect.action) {
      case CardAction.RECEIVE_MONEY:
        log(`Card: ${effect.text}`);
        handlePlayerGain(currentPlayer.id, effect.amount!);
        endTurn();
        break;
      case CardAction.PAY_MONEY:
        log(`Card: ${effect.text}`);
        handlePlayerPayment(currentPlayer.id, effect.amount!, -1);
        endTurn();
        break;
      case CardAction.MOVE_TO:
        movePlayerTo(currentPlayer, effect.spaceId!, true);
        break;
      case CardAction.MOVE_BY:
         const newPos = (currentPlayer.position + effect.amount!) % 40;
         movePlayerTo(currentPlayer, newPos, true);
         break;
      case CardAction.GO_TO_JAIL:
        goToJail(currentPlayer.id);
        break;
      case CardAction.GET_OUT_OF_JAIL_FREE:
         setGameState(prev => {
            const players = [...prev.players];
            players[currentPlayer.id].getOutOfJailFreeCards += 1;
            return { ...prev, players };
        });
        endTurn();
        break;
      default:
        log(`Unhandled card action: ${effect.action}`);
        endTurn();
    }
  };

  const drawCard = async (cardType: CardType) => {
    if(!currentPlayer) return;
    log(`${currentPlayer.name} is drawing a ${cardType} card.`);
    showAlert(`Drawing Card`, `The AI is generating a unique ${cardType} event...`);

    const effect = await generateCardEvent(cardType);
    
    showAlert(cardType, effect.text, () => {
      applyCardEffect(effect);
    });
  };

  const hasMonopoly = useCallback((playerId: number, color: string): boolean => {
    const propertiesInGroup = gameState.board.filter(s => 'color' in s && s.color === color) as Property[];
    if(propertiesInGroup.length === 0) return false;
    const playerOwned = propertiesInGroup.filter(p => p.ownerId === playerId);
    return propertiesInGroup.length === playerOwned.length;
  }, [gameState.board]);

  const handleBuildHouse = (propertyId: number) => {
      if (!currentPlayer) return;
      const propToBuildOn = gameState.board[propertyId] as Property;

      if (currentPlayer.money < propToBuildOn.houseCost) {
          log("Not enough money to build a house.");
          return;
      }
      if (propToBuildOn.houses >= 5) {
          log("Cannot build more than a hotel.");
          return;
      }
      
      handlePlayerPayment(currentPlayer.id, propToBuildOn.houseCost, -1);
      
      setGameState(prev => {
          const board = [...prev.board];
          const prop = { ...board[propertyId] } as Property;
          prop.houses += 1;
          board[propertyId] = prop;
          log(`${currentPlayer.name} built a ${prop.houses === 5 ? 'hotel' : 'house'} on ${prop.name}.`);
          return { ...prev, board };
      });
      handleViewProperties(gameState.players[currentPlayer.id]); // Refresh modal
  };

  const handleViewProperties = (player: Player) => {
      const ownedProperties = player.properties
        .map(propId => gameState.board.find(s => s.id === propId))
        .filter(p => p) as Property[];
      
      setModal({
          isOpen: true,
          title: `${player.name}'s Properties`,
          onClose: closeModal,
          content: (
              <div className="max-h-[60vh] overflow-y-auto p-1">
                  {ownedProperties.length > 0 ? ownedProperties.map(prop => {
                      const isOwnProperty = 'price' in prop && player.id === currentPlayer?.id;
                      const canBuild = isOwnProperty && prop.type === SpaceType.PROPERTY && !prop.mortgaged && hasMonopoly(player.id, prop.color);

                      return (
                        <div key={prop.id} className="mb-4">
                          <PropertyCard property={prop as Property} ownerName={player.name}>
                               {isOwnProperty && (
                                <div className="flex flex-col space-y-2">
                                  <button
                                      onClick={() => handleMortgage(prop.id, !(prop as Property).mortgaged)}
                                      disabled={(prop as Property).houses > 0}
                                      className={`w-full mt-2 py-1 text-white font-bold rounded ${ (prop as Property).mortgaged ? 'bg-green-500' : 'bg-red-500'} disabled:bg-gray-400 disabled:cursor-not-allowed`}
                                  >
                                      {(prop as Property).mortgaged ? `Unmortgage for $${Math.round((prop as Property).price * 0.55)}` : `Mortgage for $${(prop as Property).price / 2}`}
                                  </button>
                                  {canBuild && (prop as Property).houses < 5 && (
                                      <button onClick={() => handleBuildHouse(prop.id)} className="w-full py-1 bg-blue-500 text-white font-bold rounded">
                                        Build House (${(prop as Property).houseCost})
                                      </button>
                                  )}
                                </div>
                              )}
                          </PropertyCard>
                        </div>
                      )
                  }) : <p>No properties owned.</p>}
              </div>
          )
      })
  }

  const openTradeModal = (targetPlayer: Player) => {
       setModal({
           isOpen: true,
           title: `Trade with ${targetPlayer.name}`,
           onClose: closeModal,
           content: <TradeModal
                        currentPlayer={currentPlayer!}
                        targetPlayer={targetPlayer}
                        board={gameState.board}
                        onPropose={handleProposeTrade}
                        onClose={closeModal}
                    />
       })
  }

  const handleProposeTrade = (tradeOffer: TradeOffer) => {
      setPendingTrade(tradeOffer);
      closeModal();
  };
  
  const handleAcceptTrade = () => {
    if (!pendingTrade) return;
    log(`Trade accepted between ${gameState.players[pendingTrade.fromPlayerId].name} and ${gameState.players[pendingTrade.toPlayerId].name}.`);
    
    setGameState(prev => {
        const players = [...prev.players];
        const board = [...prev.board];
        const fromPlayer = { ...players[pendingTrade.fromPlayerId] };
        const toPlayer = { ...players[pendingTrade.toPlayerId] };

        // Handle money exchange
        const fromPlayerMoneyChange = pendingTrade.request.money - pendingTrade.offer.money;
        fromPlayer.money += fromPlayerMoneyChange;
        fromPlayer.lastTransaction = { amount: fromPlayerMoneyChange, timestamp: Date.now() };

        const toPlayerMoneyChange = pendingTrade.offer.money - pendingTrade.request.money;
        toPlayer.money += toPlayerMoneyChange;
        toPlayer.lastTransaction = { amount: toPlayerMoneyChange, timestamp: Date.now() };

        // Handle property exchange
        fromPlayer.properties = fromPlayer.properties.filter(p => !pendingTrade.offer.properties.includes(p));
        toPlayer.properties.push(...pendingTrade.offer.properties);
        toPlayer.properties = toPlayer.properties.filter(p => !pendingTrade.request.properties.includes(p));
        fromPlayer.properties.push(...pendingTrade.request.properties);
        
        pendingTrade.offer.properties.forEach(propId => { (board[propId] as Property).ownerId = toPlayer.id; });
        pendingTrade.request.properties.forEach(propId => { (board[propId] as Property).ownerId = fromPlayer.id; });

        players[fromPlayer.id] = fromPlayer;
        players[toPlayer.id] = toPlayer;
        return { ...prev, players, board };
    });

    setPendingTrade(null);
    closeModal();
  };

  const handleDeclineTrade = () => {
      if (!pendingTrade) return;
      log(`${gameState.players[pendingTrade.toPlayerId].name} declined the trade offer.`);
      setPendingTrade(null);
      closeModal();
  };

  const handleCounterTrade = () => {
      if (!pendingTrade) return;
      const counterOffer: TradeOffer = {
          fromPlayerId: pendingTrade.toPlayerId,
          toPlayerId: pendingTrade.fromPlayerId,
          offer: pendingTrade.request,
          request: pendingTrade.offer,
      };
      setPendingTrade(null);
      closeModal();
      setTimeout(() => openTradeModal(gameState.players[counterOffer.toPlayerId]), 100);
  };

  useEffect(() => {
    if (pendingTrade) {
      const fromPlayer = gameState.players[pendingTrade.fromPlayerId];
      const toPlayer = gameState.players[pendingTrade.toPlayerId];
      const renderTradeItems = (money: number, propIds: number[]) => (
          <div className="text-left min-h-[50px]">
              {money > 0 && <p className="font-bold text-green-600">${money.toLocaleString()}</p>}
              {propIds.map(id => {
                  const prop = gameState.board[id] as Property;
                  return <div key={id} className="flex items-center space-x-2 my-1 text-sm"><div className={`w-2 h-4 ${prop.color} rounded-sm`}></div><span>{prop.name}</span></div>
              })}
          </div>
      );
      setModal({
        isOpen: true,
        title: `Trade Offer from ${fromPlayer.name}`,
        onClose: handleDeclineTrade,
        content: (
          <div>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <h4 className="font-bold border-b pb-1 mb-2">{fromPlayer.name} Offers:</h4>
                {renderTradeItems(pendingTrade.offer.money, pendingTrade.offer.properties)}
              </div>
              <div>
                <h4 className="font-bold border-b pb-1 mb-2">You Give:</h4>
                {renderTradeItems(pendingTrade.request.money, pendingTrade.request.properties)}
              </div>
            </div>
            <div className="mt-6 flex justify-around">
              <button onClick={handleAcceptTrade} className="bg-green-500 text-white px-4 py-2 rounded-lg font-bold">Accept</button>
              <button onClick={handleCounterTrade} className="bg-blue-500 text-white px-4 py-2 rounded-lg font-bold">Counter</button>
              <button onClick={handleDeclineTrade} className="bg-red-500 text-white px-4 py-2 rounded-lg font-bold">Decline</button>
            </div>
          </div>
        )
      })
    }
  }, [pendingTrade, gameState.players, gameState.board]);


  const handleMortgage = (propertyId: number, isMortgaging: boolean) => {
    if (!currentPlayer) return;
    const prop = gameState.board[propertyId] as Property;

    if (isMortgaging && !prop.mortgaged) {
        const mortgageValue = prop.price / 2;
        handlePlayerGain(currentPlayer.id, mortgageValue);
        setGameState(prev => {
            const board = [...prev.board];
            const propToUpdate = {...board[propertyId]} as Property;
            propToUpdate.mortgaged = true;
            board[propertyId] = propToUpdate;
            log(`${currentPlayer.name} mortgaged ${propToUpdate.name} for $${mortgageValue}.`);
            return {...prev, board};
        });
    } else if (!isMortgaging && prop.mortgaged) {
        const unmortgageCost = Math.round(prop.price * 0.55);
        if (currentPlayer.money >= unmortgageCost) {
            handlePlayerPayment(currentPlayer.id, unmortgageCost, -1);
            setGameState(prev => {
                const board = [...prev.board];
                const propToUpdate = {...board[propertyId]} as Property;
                propToUpdate.mortgaged = false;
                board[propertyId] = propToUpdate;
                log(`${currentPlayer.name} unmortgaged ${propToUpdate.name} for $${unmortgageCost}.`);
                return {...prev, board};
            });
        } else {
            log(`${currentPlayer.name} cannot afford to unmortgage ${prop.name}.`);
        }
    }
    handleViewProperties(gameState.players[currentPlayer.id]);
  }


  if (gameState.phase === GamePhase.SETUP) {
    return (
      <div className="min-h-screen bg-gray-800 flex flex-col justify-center items-center p-4">
        <div className="text-center bg-white p-10 rounded-xl shadow-2xl">
          <h1 className="text-6xl font-display font-extrabold text-red-600 mb-2">Siirjiou's Monopoly</h1>
          <p className="text-xl text-gray-600 mb-8">Select the number of players to begin.</p>
          <div className="flex justify-center space-x-4">
            {[2, 3, 4].map(num => (
              <button key={num} onClick={() => startGame(num)} className="w-24 h-24 text-3xl font-bold bg-blue-500 text-white rounded-lg shadow-lg hover:bg-blue-600 transform hover:scale-110 transition-all">
                {num}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-800 flex flex-col md:flex-row p-2 md:p-4 gap-4">
      <Modal isOpen={modal.isOpen} title={modal.title} onClose={modal.onClose}>
        {modal.content}
      </Modal>

      <div className="w-full md:w-1/4 lg:w-1/5 flex flex-col gap-4">
        {gameState.players.map(p => (
          <PlayerInfo 
            key={p.id} 
            player={p} 
            isCurrentPlayer={p.id === currentPlayer?.id} 
            board={gameState.board}
            onViewProperties={handleViewProperties}
            onProposeTrade={openTradeModal}
            />
        ))}
      </div>

      <main className="flex-grow flex justify-center items-center">
        <GameBoard board={gameState.board} players={gameState.players} />
      </main>

      <aside className="w-full md:w-1/4 lg:w-1/5 bg-gray-100 p-4 rounded-lg shadow-lg flex flex-col">
        <h2 className="text-2xl font-display font-bold border-b pb-2 mb-4">Controls</h2>
        {currentPlayer && (
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2">{currentPlayer.name}'s Turn</h3>
            <Dice die1={gameState.dice[0]} die2={gameState.dice[1]} isRolling={isRolling} />
            <button
              onClick={rollDice}
              disabled={gameState.hasRolled || modal.isOpen || isRolling || !!pendingTrade}
              className="w-full bg-red-600 text-white font-bold py-3 rounded-lg shadow-md hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {isRolling ? 'Rolling...' : 'Roll Dice'}
            </button>
          </div>
        )}
        <div className="flex-grow mt-4 pt-4 border-t overflow-hidden">
             <h3 className="text-lg font-bold mb-2">Game Log</h3>
             <div className="text-xs text-gray-600 space-y-1 overflow-y-auto h-48 pr-2">
                {gameState.gameLog.map((msg, i) => <p key={i}>{msg}</p>)}
             </div>
        </div>
      </aside>
    </div>
  );
};

export default App;