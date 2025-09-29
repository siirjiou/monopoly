import React, { useState, useEffect } from 'react';

interface DiceProps {
    die1: number;
    die2: number;
    isRolling: boolean;
}

const Die: React.FC<{ value: number }> = ({ value }) => {
    const getRotation = (val: number) => {
        switch (val) {
            case 1: return 'rotateX(0deg) rotateY(0deg)';
            case 2: return 'rotateX(-90deg) rotateY(0deg)';
            case 3: return 'rotateX(0deg) rotateY(90deg)';
            case 4: return 'rotateX(0deg) rotateY(-90deg)';
            case 5: return 'rotateX(90deg) rotateY(0deg)';
            case 6: return 'rotateX(180deg) rotateY(0deg)';
            default: return 'rotateX(0deg) rotateY(0deg)';
        }
    };

    return (
        <div className="die-container">
            <div className="die" style={{ transform: getRotation(value) }}>
                <div className="face front"></div>
                <div className="face back"></div>
                <div className="face right"></div>
                <div className="face left"></div>
                <div className="face top"></div>
                <div className="face bottom"></div>
            </div>
        </div>
    );
};


export const Dice: React.FC<DiceProps> = ({ die1, die2, isRolling }) => {
    const [displayDie1, setDisplayDie1] = useState(die1 || 1);
    const [displayDie2, setDisplayDie2] = useState(die2 || 1);

    useEffect(() => {
        if (isRolling) {
            const interval = setInterval(() => {
                setDisplayDie1(Math.floor(Math.random() * 6) + 1);
                setDisplayDie2(Math.floor(Math.random() * 6) + 1);
            }, 100);
            return () => clearInterval(interval);
        } else {
            setDisplayDie1(die1 || 1);
            setDisplayDie2(die2 || 1);
        }
    }, [isRolling, die1, die2]);

    return (
        <>
            <div className="flex justify-center items-center gap-4 my-4 p-4 bg-gray-200 rounded-lg h-24 perspective">
                <Die value={displayDie1} />
                <Die value={displayDie2} />
            </div>
            <style>{`
                .perspective {
                    perspective: 1000px;
                }
                .die-container {
                    width: 50px;
                    height: 50px;
                    position: relative;
                    transform-style: preserve-3d;
                    transform: rotateX(-30deg) rotateY(-30deg);
                }
                .die {
                    width: 100%;
                    height: 100%;
                    position: absolute;
                    transform-style: preserve-3d;
                    transition: transform 0.5s;
                }
                .face {
                    position: absolute;
                    width: 50px;
                    height: 50px;
                    background: white;
                    border: 1px solid #ccc;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 24px;
                    font-weight: bold;
                    background-size: 40px 40px;
                    background-repeat: no-repeat;
                    background-position: center;
                }
                .front  { transform: rotateY(  0deg) translateZ(25px); background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40"><circle cx="20" cy="20" r="5" fill="black"/></svg>'); }
                .back   { transform: rotateX(180deg) translateZ(25px); background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40"><circle cx="10" cy="10" r="3" fill="black"/><circle cx="30" cy="10" r="3" fill="black"/><circle cx="10" cy="20" r="3" fill="black"/><circle cx="30" cy="20" r="3" fill="black"/><circle cx="10" cy="30" r="3" fill="black"/><circle cx="30" cy="30" r="3" fill="black"/></svg>'); }
                .right  { transform: rotateY( 90deg) translateZ(25px); background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40"><circle cx="10" cy="10" r="3" fill="black"/><circle cx="20" cy="20" r="3" fill="black"/><circle cx="30" cy="30" r="3" fill="black"/></svg>'); }
                .left   { transform: rotateY(-90deg) translateZ(25px); background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40"><circle cx="10" cy="10" r="3" fill="black"/><circle cx="30" cy="10" r="3" fill="black"/><circle cx="10" cy="30" r="3" fill="black"/><circle cx="30" cy="30" r="3" fill="black"/></svg>'); }
                .top    { transform: rotateX( 90deg) translateZ(25px); background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40"><circle cx="10" cy="10" r="3" fill="black"/><circle cx="30" cy="30" r="3" fill="black"/></svg>'); }
                .bottom { transform: rotateX(-90deg) translateZ(25px); background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40"><circle cx="10" cy="10" r="3" fill="black"/><circle cx="30" cy="10" r="3" fill="black"/><circle cx="10" cy="20" r="3" fill="black"/><circle cx="20" cy="20" r="3" fill="black"/><circle cx="30" cy="20" r="3" fill="black"/><circle cx="10" cy="30" r="3" fill="black"/><circle cx="30" cy="30" r="3" fill="black"/></svg>'); }
            `}</style>
        </>
    );
};