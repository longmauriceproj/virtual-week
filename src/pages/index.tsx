// import { signIn, signOut, useSession } from "next-auth/react";
import { useState, useEffect, use } from "react";
import Head from "next/head";
import Link from "next/link";
import Image, { type StaticImageData } from "next/image";

import clsx from "clsx";
// import { api } from "~/utils/api";
import diceOne from "~/images/dice-1.png";
import diceTwo from "~/images/dice-2.png";
import diceThree from "~/images/dice-3.png";
import diceFour from "~/images/dice-4.png";
import diceFive from "~/images/dice-5.png";
import diceSix from "~/images/dice-6.png";

function Dice({ value }: { value: number }) {
  if (value < 1 || value > 6) {
    throw new Error("Invalid dice value");
  }

  const dice: { [key: number]: StaticImageData } = {
    1: diceOne,
    2: diceTwo,
    3: diceThree,
    4: diceFour,
    5: diceFive,
    6: diceSix,
  };

  return (
    <Image
      src={dice[value] ?? diceOne}
      height={120}
      width={120}
      alt="dice"
      className="rounded-md drop-shadow-lg"
    />
  );
}

function rollDice() {
  return Math.floor(Math.random() * 6) + 1;
}

function Space({
  className,
  isEvent = false,
  isCurrentPosition = false,
  position,
}: {
  className: string;
  isEvent?: boolean;
  isCurrentPosition?: boolean;
  position?: number;
}) {
  const eventStyle = isEvent
    ? "bg-emerald-400/70 hover:bg-emerald-400/90"
    : "bg-zinc-100/40 hover:bg-zinc-100/60";
  return (
    <button className={clsx("relative h-8 w-8 rounded", eventStyle, className)}>
      {isEvent && <p className="font-semibold">E</p>}
      {isCurrentPosition && (
        <div className="absolute left-1 top-1 z-10 h-6 w-6 rounded-full bg-blue-800"></div>
      )}
    </button>
  );
}

function Start({
  className,
  isCurrentPosition = false,
}: {
  className: string;
  isCurrentPosition?: boolean;
}) {
  return (
    <button
      className={clsx(
        "relative h-full w-full rounded bg-sky-400/40 hover:bg-sky-400/60",
        className
      )}
    >
      <p className="font-semibold">Start</p>
      {isCurrentPosition && (
        <div className="absolute left-[21px] top-[21px] z-10 h-6 w-6 rounded-full bg-blue-800"></div>
      )}
    </button>
  );
}

function Action({ className, action }: { className: string; action: string }) {
  const actionStyles: { [key: string]: string } = {
    "Start Card": "bg-sky-400/40 hover:bg-sky-400/60",
    "Perform Task": "bg-violet-400/70 hover:bg-violet-400/90",
    "Event Card": "bg-emerald-400/70 hover:bg-emerald-400/90",
    "Pause or Quit": "bg-amber-400/60 hover:bg-amber-400/80",
  };
  return (
    <button
      className={clsx(
        "mx-2 h-full w-full max-w-[118px] rounded bg-sky-400/40 drop-shadow-md hover:bg-sky-400/60",
        actionStyles[action],
        className
      )}
    >
      <p className="text-sm font-semibold">{action}</p>
    </button>
  );
}

function GameBoard() {
  const validPositions = [];
  return (
    <div className="grid grid-cols-20 grid-rows-20 gap-[2px]">
      <Action
        className={`col-span-4 col-start-2 row-span-2 row-start-3`}
        action="Start Card"
      />
      <Action
        className={`col-span-4 col-start-16 row-span-2 row-start-3`}
        action="Perform Task"
      />
      <Action
        className={`col-span-4 col-start-2 row-span-2 row-start-17`}
        action="Event Card"
      />

      <Action
        className={`col-span-4 col-start-16 row-span-2 row-start-17`}
        action="Pause or Quit"
      />
      <Start className={`col-span-2 col-start-19 row-span-2 row-start-19`} />
      <Space className={`col-start-20 row-start-18`} position={121} />
      <Space className={`col-start-20 row-start-17`} position={120} />
      <Space className={`col-start-20 row-start-16`} position={119} />
      <Space className={`col-start-20 row-start-15`} position={118} />
      <Space className={`col-start-19 row-start-15`} position={117} />
      <Space className={`col-start-18 row-start-15`} position={116} />
      <Space className={`col-start-17 row-start-15`} position={115} isEvent />
      <Space className={`col-start-17 row-start-14`} position={114} />
      <Space className={`col-start-17 row-start-13`} position={113} />
      <Space className={`col-start-17 row-start-12`} position={112} />
      <Space className={`col-start-18 row-start-12`} position={111} />
      <Space className={`col-start-19 row-start-12`} position={110} />
      <Space className={`col-start-20 row-start-12`} position={109} />
      <Space className={`col-start-20 row-start-11`} position={108} />
      <Space className={`col-start-20 row-start-10`} position={107} />
      <Space className={`col-start-20 row-start-9`} position={106} />
      <Space className={`col-start-19 row-start-9`} position={105} />
      <Space className={`col-start-18 row-start-9`} position={104} />
      <Space className={`col-start-17 row-start-9`} position={103} isEvent />
      <Space className={`col-start-17 row-start-8`} position={102} />
      <Space className={`col-start-17 row-start-7`} position={101} />
      <Space className={`col-start-17 row-start-6`} position={100} />
      <Space className={`col-start-18 row-start-6`} position={99} />
      <Space className={`col-start-19 row-start-6`} position={98} />
      <Space className={`col-start-20 row-start-6`} position={97} />
      <Space className={`col-start-20 row-start-5`} position={96} />
      <Space className={`col-start-20 row-start-4`} position={95} />
      <Space className={`col-start-20 row-start-3`} position={94} />
      <Space className={`col-start-20 row-start-2`} position={93} />
      <Space className={`col-start-20 row-start-1`} position={92} />
      <Space className={`col-start-19 row-start-1`} position={91} isEvent />
      <Space className={`col-start-18 row-start-1`} position={90} />
      <Space className={`col-start-17 row-start-1`} position={89} />
      <Space className={`col-start-16 row-start-1`} position={88} />
      <Space className={`col-start-15 row-start-1`} position={87} />
      <Space className={`col-start-15 row-start-2`} position={86} />
      <Space className={`col-start-15 row-start-3`} position={85} />
      <Space className={`col-start-15 row-start-4`} position={84} />
      <Space className={`col-start-14 row-start-4`} position={83} />
      <Space className={`col-start-13 row-start-4`} position={82} />
      <Space className={`col-start-12 row-start-4`} position={81} />
      <Space className={`col-start-12 row-start-3`} position={80} />
      <Space className={`col-start-12 row-start-2`} position={79} isEvent />
      <Space className={`col-start-12 row-start-1`} position={78} />
      <Space className={`col-start-11 row-start-1`} position={77} />
      <Space className={`col-start-10 row-start-1`} position={76} />
      <Space className={`col-start-9 row-start-1`} position={75} />
      <Space className={`col-start-9 row-start-2`} position={74} />
      <Space className={`col-start-9 row-start-3`} position={73} />
      <Space className={`col-start-9 row-start-4`} position={72} />
      <Space className={`col-start-8 row-start-4`} position={71} />
      <Space className={`col-start-7 row-start-4`} position={70} />
      <Space className={`col-start-6 row-start-4`} position={69} />
      <Space className={`col-start-6 row-start-3`} position={68} />
      <Space className={`col-start-6 row-start-2`} position={67} isEvent />
      <Space className={`col-start-6 row-start-1`} position={66} />
      <Space className={`col-start-5 row-start-1`} position={65} />
      <Space className={`col-start-4 row-start-1`} position={64} />
      <Space className={`col-start-3 row-start-1`} position={63} />
      <Space className={`col-start-2 row-start-1`} position={62} />
      <Space className={`col-start-1 row-start-1`} position={61} />
      <Space className={`col-start-1 row-start-2`} position={60} />
      <Space className={`col-start-1 row-start-3`} position={59} />
      <Space className={`col-start-1 row-start-4`} position={58} />
      <Space className={`col-start-1 row-start-5`} position={57} />
      <Space className={`col-start-1 row-start-6`} position={56} />
      <Space className={`col-start-2 row-start-6`} position={55} isEvent />
      <Space className={`col-start-3 row-start-6`} position={54} />
      <Space className={`col-start-4 row-start-6`} position={53} />
      <Space className={`col-start-4 row-start-7`} position={52} />
      <Space className={`col-start-4 row-start-8`} position={51} />
      <Space className={`col-start-4 row-start-9`} position={50} />
      <Space className={`col-start-3 row-start-9`} position={49} />
      <Space className={`col-start-2 row-start-9`} position={48} />
      <Space className={`col-start-1 row-start-9`} position={47} />
      <Space className={`col-start-1 row-start-10`} position={46} />
      <Space className={`col-start-1 row-start-11`} position={45} />
      <Space className={`col-start-1 row-start-12`} position={44} />
      <Space className={`col-start-2 row-start-12`} position={43} isEvent />
      <Space className={`col-start-3 row-start-12`} position={42} />
      <Space className={`col-start-4 row-start-12`} position={41} />
      <Space className={`col-start-4 row-start-13`} position={40} />
      <Space className={`col-start-4 row-start-14`} position={39} />
      <Space className={`col-start-4 row-start-15`} position={38} />
      <Space className={`col-start-3 row-start-15`} position={37} />
      <Space className={`col-start-2 row-start-15`} position={36} />
      <Space className={`col-start-1 row-start-15`} position={35} />
      <Space className={`col-start-1 row-start-16`} position={34} />
      <Space className={`col-start-1 row-start-17`} position={33} />
      <Space className={`col-start-1 row-start-18`} position={32} />
      <Space className={`col-start-1 row-start-19`} position={31} isEvent />
      <Space className={`col-start-1 row-start-20`} position={30} />
      <Space className={`col-start-2 row-start-20`} position={29} />
      <Space className={`col-start-3 row-start-20`} position={28} />
      <Space className={`col-start-4 row-start-20`} position={27} />
      <Space className={`col-start-5 row-start-20`} position={26} />
      <Space className={`col-start-6 row-start-20`} position={25} />
      <Space className={`col-start-6 row-start-19`} position={24} />
      <Space className={`col-start-6 row-start-18`} position={23} />
      <Space className={`col-start-6 row-start-17`} position={22} />
      <Space className={`col-start-7 row-start-17`} position={21} />
      <Space className={`col-start-8 row-start-17`} position={20} />
      <Space className={`col-start-9 row-start-17`} position={19} isEvent />
      <Space className={`col-start-9 row-start-18`} position={18} />
      <Space className={`col-start-9 row-start-19`} position={17} />
      <Space className={`col-start-9 row-start-20`} position={16} />
      <Space className={`col-start-10 row-start-20`} position={15} />
      <Space className={`col-start-11 row-start-20`} position={14} />
      <Space className={`col-start-12 row-start-20`} position={13} />
      <Space className={`col-start-12 row-start-19`} position={12} />
      <Space className={`col-start-12 row-start-18`} position={11} />
      <Space className={`col-start-12 row-start-17`} position={10} />
      <Space className={`col-start-13 row-start-17`} position={9} />
      <Space
        className={`col-start-14 row-start-17`}
        position={8}
        isCurrentPosition
      />
      <Space className={`col-start-15 row-start-17`} position={7} isEvent />
      <Space className={`col-start-15 row-start-18`} position={6} />
      <Space className={`col-start-15 row-start-19`} position={5} />
      <Space className={`col-start-15 row-start-20`} position={4} />
      <Space className={`col-start-16 row-start-20`} position={3} />
      <Space className={`col-start-17 row-start-20`} position={2} />
      <Space className={`col-start-18 row-start-20`} position={1} />
    </div>
  );
}

export default function Home() {
  const [diceValue, setDiceValue] = useState(1);

  function handleDiceRoll() {
    setDiceValue(rollDice());
  }

  useEffect(() => {
    setDiceValue(rollDice());
  }, []);

  return (
    <>
      <Head>
        <title>Virtual Week</title>
        <meta
          name="description"
          content="A board game for training prospective memory"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="grid grid-cols-3">
        <section className="flex flex-col items-center text-center">
          <div className="mt-4">
            <button onClick={handleDiceRoll}>
              <Dice value={diceValue} />
            </button>
            <div className="mt-8 min-w-[424px] rounded-md bg-zinc-100/40 px-8 py-4">
              <p className="text-xl font-semibold text-black">
                Move your token <span>{diceValue}</span>{" "}
                {diceValue === 1 ? "square" : "squares"} forward
              </p>
              <p className="mt-2 text-4xl font-semibold leading-9 text-black">
                8:00 AM
              </p>
              <p className="mt-2 text-base font-semibold text-black">
                Trial: Monday, Week 1
              </p>
            </div>
          </div>
        </section>
        <section className="col-span-2 flex items-center justify-center">
          <GameBoard />
        </section>
      </div>
    </>
  );
}

// function AuthShowcase() {
//   const { data: sessionData } = useSession();

//   const { data: secretMessage } = api.example.getSecretMessage.useQuery(
//     undefined, // no input
//     { enabled: sessionData?.user !== undefined }
//   );

//   return (
//     <div className="flex flex-col items-center justify-center gap-4">
//       <p className="text-center text-2xl text-white">
//         {sessionData && <span>Logged in as {sessionData.user?.name}</span>}
//         {secretMessage && <span> - {secretMessage}</span>}
//       </p>
//       <button
//         className="rounded-full bg-white/10 px-10 py-3 font-semibold text-white no-underline transition hover:bg-white/20"
//         onClick={sessionData ? () => void signOut() : () => void signIn()}
//       >
//         {sessionData ? "Sign out" : "Sign in"}
//       </button>
//     </div>
//   );
// }
