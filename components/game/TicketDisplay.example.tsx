/**
 * TicketDisplay Example - Demo usage of ticket display components
 *
 * This file demonstrates how to use the TicketDisplay component
 * with real Vietnamese Lô Tô cards.
 *
 * USAGE IN YOUR APP:
 *
 * ```tsx
 * import { TicketDisplay } from '@/components/game';
 * import { usePlayerCards, useCalledHistory } from '@/store/useGameStore';
 *
 * export default function GamePage() {
 *   const cards = usePlayerCards();
 *   const calledHistory = useCalledHistory();
 *   const calledNumbers = new Set(calledHistory);
 *
 *   const handleCellClick = (cardIndex: number, row: number, col: number) => {
 *     console.log(`Clicked card ${cardIndex}, row ${row}, col ${col}`);
 *   };
 *
 *   return (
 *     <TicketDisplay
 *       cards={cards}
 *       calledNumbers={calledNumbers}
 *       onCellClick={handleCellClick}
 *     />
 *   );
 * }
 * ```
 */

"use client";

import { useState } from "react";
import { TicketDisplay } from "./TicketDisplay";
import type { Card } from "@/types";

// Sample authentic Vietnamese Lô Tô cards (3×9 format)
const SAMPLE_CARDS: Card[] = [
  // Card 1
  [
    [5, null, null, 32, null, 56, null, 71, null],
    [null, 12, 23, null, 45, null, 67, null, 89],
    [8, null, 28, null, null, 58, null, null, 90],
  ],
  // Card 2
  [
    [null, 11, null, 35, null, null, 63, 75, null],
    [3, null, 27, null, 48, 59, null, null, 84],
    [null, null, 29, 38, null, 52, null, 78, null],
  ],
  // Card 3
  [
    [null, 19, null, null, 44, 54, null, 72, null],
    [7, null, 24, 33, null, null, 66, null, 87],
    [null, null, 26, null, 47, null, 69, 79, null],
  ],
];

// Sample called numbers for demonstration
const INITIAL_CALLED_NUMBERS = [5, 12, 23, 45, 56, 67, 89];

export function TicketDisplayExample() {
  const [calledNumbers, setCalledNumbers] = useState<Set<number>>(
    new Set(INITIAL_CALLED_NUMBERS),
  );
  const [autoCall, setAutoCall] = useState(false);

  // Simulate calling random numbers
  const callRandomNumber = () => {
    const allNumbers = Array.from({ length: 90 }, (_, i) => i + 1);
    const remaining = allNumbers.filter((n) => !calledNumbers.has(n));

    if (remaining.length === 0) {
      alert("All numbers have been called!");
      return;
    }

    const randomIndex = Math.floor(Math.random() * remaining.length);
    const newNumber = remaining[randomIndex];

    setCalledNumbers(new Set([...calledNumbers, newNumber]));
  };

  // Reset demo
  const resetDemo = () => {
    setCalledNumbers(new Set(INITIAL_CALLED_NUMBERS));
    setAutoCall(false);
  };

  // Auto-call every 2 seconds
  useState(() => {
    if (autoCall) {
      const interval = setInterval(callRandomNumber, 2000);
      return () => clearInterval(interval);
    }
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-paper via-paper-dark to-paper p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-loto-green mb-4">
            Lô Tô Việt Nam
          </h1>
          <p className="text-lg text-gray-600 mb-6">
            Demo phiếu dò Lô Tô truyền thống 3×9
          </p>

          {/* Controls */}
          <div className="flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={callRandomNumber}
              className="px-6 py-3 bg-loto-green hover:bg-loto-green-light text-white font-bold rounded-lg shadow-loto-button transition-all hover:scale-105 active:scale-95"
            >
              Gọi số ngẫu nhiên
            </button>

            <button
              onClick={() => setAutoCall(!autoCall)}
              className={`px-6 py-3 font-bold rounded-lg shadow-loto-button transition-all hover:scale-105 active:scale-95 ${
                autoCall
                  ? "bg-loto-red hover:bg-loto-red-light text-white"
                  : "bg-loto-blue hover:bg-loto-blue-light text-white"
              }`}
            >
              {autoCall ? "Dừng tự động" : "Gọi tự động"}
            </button>

            <button
              onClick={resetDemo}
              className="px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white font-bold rounded-lg shadow-loto-button transition-all hover:scale-105 active:scale-95"
            >
              Đặt lại
            </button>
          </div>

          {/* Stats */}
          <div className="mt-4 flex items-center justify-center gap-6 text-sm sm:text-base">
            <div>
              <span className="text-gray-600">Đã gọi:</span>
              <span className="ml-2 font-bold text-loto-gold-dark">
                {calledNumbers.size}
              </span>
              <span className="text-gray-500"> / 90</span>
            </div>
            <div className="w-px h-6 bg-gray-300" />
            <div>
              <span className="text-gray-600">Số cuối:</span>
              <span className="ml-2 font-bold text-loto-green">
                {Array.from(calledNumbers).pop() || "-"}
              </span>
            </div>
          </div>
        </div>

        {/* Ticket Display */}
        <TicketDisplay
          cards={SAMPLE_CARDS}
          calledNumbers={calledNumbers}
          onCellClick={(cardIndex, row, col) => {
            console.log(
              `Clicked: Card ${cardIndex + 1}, Row ${row + 1}, Col ${col + 1}`,
            );
          }}
        />

        {/* Instructions */}
        <div className="mt-8 p-6 bg-white rounded-lg border-2 border-loto-green/20">
          <h2 className="text-xl font-bold text-loto-green mb-4">Hướng dẫn:</h2>
          <ul className="space-y-2 text-gray-700">
            <li className="flex items-start gap-2">
              <span className="text-loto-green font-bold">•</span>
              <span>
                <strong>Gọi số ngẫu nhiên:</strong> Gọi một số ngẫu nhiên từ
                1-90
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-loto-green font-bold">•</span>
              <span>
                <strong>Gọi tự động:</strong> Tự động gọi số mỗi 2 giây
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-loto-green font-bold">•</span>
              <span>
                <strong>Đánh dấu thủ công:</strong> Bấm vào ô số để đánh dấu
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-loto-green font-bold">•</span>
              <span>
                <strong>Thắng:</strong> Hoàn thành một dòng ngang (5 số) để
                thắng
              </span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default TicketDisplayExample;
