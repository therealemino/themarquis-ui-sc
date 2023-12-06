"use client";
import Image from "next/image";
import GameButtons from "../../components/GameButtons/gameButtons";
import Chips, { Color } from "../../components/RouletteChips/Chips/Chips";
import { useEffect, useState } from "react";
import ChosenNumbers from "../../components/ChosenNumbers/ChosenNumbers";
import SlotNumber from "../../components/RouletteNumber/SlotNumber";
import ModalConfirm from "../../components/ModalConfirm/ModalConfirm";
import "../../roulette.css";
import MiniatureChips from "../../components/MiniatureChips/MiniatureChips";
import Options from "../../components/Options/Options";
import { Slot, slots } from "@/app/roulette/internals/Board/domain";
import { useDojo } from "@/app/DojoContext";

function Board() {
  const [slotsData, setSlotsData] = useState<Slot[]>(slots);
  const [valueChip, setValuechip] = useState<number>(0);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [eraseMode, setEraseMode] = useState<boolean>(false);
  const [selectedChip, setSelectedChip] = useState<Color | null>(null);
  const [mousePosition, setMousePosition] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });

  const {
    setup: {
      systemCalls: { bet },
      components,
      entityUpdates,
      network: { contractComponents, graphClient },
    },
    account: { create, list, select, account, isDeploying, clear },
  } = useDojo();


  const handleChipSelection = (chip: Color) => {
    setSelectedChip(chip);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    setMousePosition({ x: e.clientX, y: e.clientY });
  };

  const handleChipClick = (color: Color) => {
    setSelectedChip((prevColor) => (prevColor === color ? null : color));
  };

  const handleBoardClick = () => {
    setSelectedChip(null);
  };

  const handleConfirmClick = async () => {
    setIsModalOpen(true);
    try {
      const totalBetAmount = await bet(account, slotsData);
      console.log('Total:', totalBetAmount);
    } catch (error) {
      console.error('Error', error);
    }
  };


  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleConfirm = () => {
    const resetSlots = slots.map((slot) => ({ ...slot, coins: [] }));
    setSlotsData(resetSlots);
  };

  const handleEraseClick = () => {
    setEraseMode((prevMode) => !prevMode);
  };

  useEffect(() => {
    if (eraseMode) {
      document.body.classList.add("erase-mode");
    } else {
      document.body.classList.remove("erase-mode");
    }
    return () => {
      document.body.classList.remove("erase-mode");
    };
  }, [eraseMode]);

  const calculateTotalBetAmount = () => {
    return slotsData.reduce((total, slot) => {
      return total + slot.coins.reduce((sum, coin) => sum + coin, 0);
    }, 0);
  };

  return (
    <section onMouseMove={handleMouseMove} onClick={handleBoardClick}>
      <div className="flex gap-20 justify-center items-center">
        <div className="flex gap-8">
          <div className="py-4 px-6 border border-solid border-white flex justify-between rounded-2xl w-[400px] bg-[#111]">
            <span>BETS:</span>
            <span>{calculateTotalBetAmount()} USDM</span>
          </div>
          <div className="py-4 px-6 border border-solid border-white flex justify-between rounded-2xl w-[400px] bg-[#111]">
            <span>BALANCE:</span>
            <span>68 USDM</span>
          </div>
          <button>
            <Image
              src="/images-game/help_icon.png"
              alt="icon"
              width={30}
              height={30}
            ></Image>
          </button>
        </div>
        <div className="flex items-center">
          <span>BET CLOSED!</span>
          <div className="timer">
            <span className="text-3xl">00</span>
          </div>
        </div>
      </div>
      <div className="container-game">
        <div className="flex flex-col items-center justify-between">
          <Image
            src="/images/roulette-1.png"
            alt="roulette"
            width={560}
            height={560}
          ></Image>
          <button
            className="btn-degrade w-[400px] rounded-[12px] text-white text-2xl hover:text-gray-200 px-24 py-4"
            onClick={handleConfirmClick}
          >
            CONFIRM
          </button>
        </div>
        {isModalOpen && (
          <ModalConfirm
            setIsModalOpen={handleCloseModal}
            bets={calculateTotalBetAmount()}
            handleConfirm={handleConfirm}
          ></ModalConfirm>
        )}
        <div className="container-boardgame">
          <div className="container-board">
            <div>
              <ChosenNumbers
                setData={setSlotsData}
                slots={slots}
              ></ChosenNumbers>
            </div>
            <div className="flex flex-col">
              <div className="table">
                {slotsData
                  .filter(({ type = "" }) => type === "board")
                  .map((element, index) => {
                    return (
                      <SlotNumber
                        background={element.color}
                        key={index}
                        slot={element}
                        slots={slotsData}
                        setData={setSlotsData}
                        index={index}
                        valueChip={valueChip}
                        eraseMode={eraseMode}
                      >
                        {element.id}
                      </SlotNumber>
                    );
                  })}
              </div>
              <div className="flex">
                <div className="w-[100px] h-[100px]"></div>
                <div className="container-options">
                  {slotsData
                    .filter(({ type = "" }) => type === "options")
                    .map((element, index) => {
                      return (
                        <Options
                          key={index}
                          background={element.color}
                          width={element.width}
                          dataSlot={slotsData}
                          setData={setSlotsData}
                          index={element.name as string}
                          valueChip={valueChip}
                          eraseMode={eraseMode}
                          coins={element.coins}
                        >
                          {element.name}
                        </Options>
                      );
                    })}
                </div>
                <div className="w-[100px] h-[100px]" />
              </div>
            </div>
          </div>
          <div className="flex gap-4 container-chip">
            <Chips
              color={Color.White}
              onClick={function () {
                setValuechip(5);
                handleChipClick(Color.White);
              }}
              mousePosition={mousePosition}
            >
              5
            </Chips>
            <Chips
              color={Color.Blue}
              onClick={function () {
                setValuechip(10);
                handleChipClick(Color.Blue);
              }}
              mousePosition={mousePosition}
            >
              10
            </Chips>

            <Chips
              color={Color.Yellow}
              onClick={function () {
                setValuechip(50);
                handleChipClick(Color.Yellow);
              }}
              mousePosition={mousePosition}
            >
              50
            </Chips>

            <Chips
              color={Color.Green}
              onClick={function () {
                setValuechip(100);
                handleChipClick(Color.Green);
              }}
              mousePosition={mousePosition}
            >
              100
            </Chips>
          </div>
          <GameButtons
            onClear={handleConfirm}
            isEraseMode={eraseMode}
            onEraseClick={handleEraseClick}
          />
          {selectedChip && (
            <MiniatureChips
              mousePosition={mousePosition}
              chipColor={`/images-game/${selectedChip}.png`}
            />
          )}
        </div>
      </div>
    </section>
  );
}

export default Board;
