
import { GoogleGenAI, Type } from "@google/genai";
import { CardType, CardEffect, CardAction } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.error("API_KEY environment variable not set.");
  // We'll proceed, but the API calls will fail.
  // The app will have a fallback mechanism.
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });

const generatePrompt = (cardType: CardType) => {
  return `You are a creative game master for a Monopoly-like board game. 
  Generate a single, unique, and family-friendly event for a "${cardType}" card.
  The event should be described in a short, flavorful text.
  It must also include a clear, machine-readable action.
  The possible actions are: 
  - PAY_MONEY: Player pays a specific amount to the bank. Amount should be between 10 and 200.
  - RECEIVE_MONEY: Player receives a specific amount from the bank. Amount should be between 10 and 200.
  - MOVE_TO: Player moves to a specific space on the board (spaceId from 0 to 39).
  - MOVE_BY: Player moves forward or backward a number of spaces. Amount should be between -5 and 5, not zero.
  - GO_TO_JAIL: Player is sent to jail.
  - GET_OUT_OF_JAIL_FREE: Player receives a 'Get Out of Jail Free' card.
  - PAY_PER_PROPERTY: Player pays a fee for each property they own. Amount should be between 10 and 50 per property.
  - RECEIVE_FROM_PLAYERS: Player receives a small amount from every other player. Amount should be between 10 and 50.

  Provide your response as a JSON object that matches the required schema.
  
  Example for a "${cardType}" card: "You win second prize in a beauty contest. Collect $10." would be:
  {
    "text": "You win second prize in a beauty contest. Collect $10.",
    "action": "RECEIVE_MONEY",
    "amount": 10
  }
  
  Another example: "Advance to Go. Collect $200." would be:
  {
    "text": "Advance to Go. Collect $200.",
    "action": "MOVE_TO",
    "spaceId": 0
  }
  `;
};

const cardEffectSchema = {
    type: Type.OBJECT,
    properties: {
        text: { 
            type: Type.STRING,
            description: "The flavorful text to display to the player on the card."
        },
        action: { 
            type: Type.STRING,
            enum: Object.values(CardAction),
            description: "The game action to be performed."
        },
        amount: { 
            type: Type.INTEGER,
            description: "The monetary value or number of spaces, used by PAY_MONEY, RECEIVE_MONEY, MOVE_BY, PAY_PER_PROPERTY, RECEIVE_FROM_PLAYERS.",
            nullable: true,
        },
        spaceId: { 
            type: Type.INTEGER,
            description: "The target board space ID (0-39), used by MOVE_TO.",
            nullable: true,
        },
    },
    required: ["text", "action"],
};

const FALLBACK_CARDS: Record<CardType, CardEffect[]> = {
    [CardType.CHANCE]: [
        { text: 'Advance to Go (Collect $200)', action: CardAction.MOVE_TO, spaceId: 0 },
        { text: 'Bank pays you dividend of $50', action: CardAction.RECEIVE_MONEY, amount: 50 },
        { text: 'Go to Jail. Go directly to Jail. Do not pass Go, do not collect $200.', action: CardAction.GO_TO_JAIL },
        { text: 'You have been elected Chairman of the Board. Pay each player $50.', action: CardAction.PAY_MONEY, amount: 50}, // Simplified for our pass-and-play model
    ],
    [CardType.COMMUNITY_CHEST]: [
        { text: 'Bank error in your favor. Collect $200', action: CardAction.RECEIVE_MONEY, amount: 200 },
        { text: 'Doctor’s fee. Pay $50', action: CardAction.PAY_MONEY, amount: 50 },
        { text: 'From sale of stock you get $50', action: CardAction.RECEIVE_MONEY, amount: 50 },
        { text: 'Get Out of Jail Free. This card may be kept until needed or sold.', action: CardAction.GET_OUT_OF_JAIL_FREE },
    ],
};

export const generateCardEvent = async (cardType: CardType): Promise<CardEffect> => {
    if (!API_KEY) {
        console.warn("Gemini API key not found. Using fallback card.");
        const fallback = FALLBACK_CARDS[cardType];
        return fallback[Math.floor(Math.random() * fallback.length)];
    }

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: generatePrompt(cardType),
            config: {
                responseMimeType: "application/json",
                responseSchema: cardEffectSchema,
                temperature: 0.9,
            },
        });

        const jsonStr = response.text.trim();
        const cardEffect = JSON.parse(jsonStr) as CardEffect;
        
        // Basic validation
        if(cardEffect && cardEffect.action && cardEffect.text) {
          return cardEffect;
        }
        throw new Error("Invalid JSON structure from API");

    } catch (error) {
        console.error("Error generating card event with Gemini API:", error);
        console.warn("Using fallback card due to API error.");
        const fallback = FALLBACK_CARDS[cardType];
        return fallback[Math.floor(Math.random() * fallback.length)];
    }
};
