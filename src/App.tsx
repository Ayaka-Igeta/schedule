'use client';

import { useState, useEffect } from 'react';

export default function Home() {
  const timeSlots = [
    "09:00", "09:30",
    "10:00", "10:30",
    "11:00", "11:30",
    "12:00", "12:30",
    "13:00", "13:30",
    "14:00", "14:30",
    "15:00", "15:30",
    "16:00", "16:30",
    "17:00", "17:30",
    "18:00", "18:30",
    "19:00", "19:30",
    "20:00"
  ];  
  
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [date, setDate] = useState('');
  const [room, setRoom] = useState("");
  const [name, setName] = useState('');
  const [reservations, setReservations] = useState<{ date: string; room: string; time: string; name: string }[]>([]);

// 時間を "09:00" → 分に変換
  const timeToMinutes = (t: string) => {
    const [h, m] = t.split(":").map(Number);
    return h * 60 + m;
  };

// 範囲がかぶっているかどうかを判定
  const isOverlap = (startA: string, endA: string, startB: string, endB: string) => {
    const sA = timeToMinutes(startA);
    const eA = timeToMinutes(endA);
    const sB = timeToMinutes(startB);
    const eB = timeToMinutes(endB);
    return Math.max(sA, sB) < Math.min(eA, eB);
  };

  const isStartTimeDisabled = (slot: string) => {
    // 現在の選択日付と部屋に対して、 
      return reservations.some((r) => {
        if (r.date !== date || r.room !== room) return false;
    // 予約された時間帯を分解して
      const [rStart, rEnd] = r.time.split("-");
      const currentIndex = timeSlots.indexOf(slot);
      const slotEnd = timeSlots[currentIndex + 1];
      if (!slotEnd) return true; 
    // 現在表示中のslot（開始候補時間）が、予約の中に含まれているならtrue
      return isOverlap(slot, slotEnd , rStart, rEnd);
    });
  };

  const isEndTimeDisabled = (slot: string) => {
    return reservations.some((r) => {
      if (r.date !== date || r.room !== room || !startTime) return false;
      const [rStart, rEnd] = r.time.split("-");
      return isOverlap(startTime, slot, rStart, rEnd);
    });
  };
  

 useEffect(() => {
  const saved = localStorage.getItem('reservations');
    if (saved) setReservations(JSON.parse(saved));
  }, []);

//  1. handleCancel をこの位置に書く（handleReserve の外！）
const handleCancel = (index: number) => {
  const updated = [...reservations];
  updated.splice(index, 1);
  setReservations(updated);
  localStorage.setItem('reservations', JSON.stringify(updated));
};

//  2. その後に handleReserve を定義
const handleReserve = () => {
  if (!date || !room || !startTime || !endTime || !name) return;

  const time = `${startTime}-${endTime}`;
  const newData = [...reservations, { date, room, time, name }];
  setReservations(newData);
  localStorage.setItem('reservations', JSON.stringify(newData));

  setDate('');
  setRoom('');
  setStartTime('');
  setEndTime('');
  setName('');
};


  return (
    <main className="min-h-screen px-4 py-20 bg-white text-gray-600 font-sans">
  <div className="max-w-xl mx-auto">
    <h1 className="text-3xl font-semibold tracking-tight mb-10 text-center">
      会議室予約システム
    </h1>
  </div>

  {/* <div className="flex flex-col gap-4 max-w-md mx-auto mb-8 bg-white rounded-xl shadow-md px-6 py-6 border border-gray-200"> */}
      <div className="flex flex-col gap-4 max-w-md mx-auto mb-20 px-8 py-8 bg-white rounded-xl shadow-md border border-gray-200">

      
      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm text-gray-600 shadow-sm focus:ring-2 focus:ring-blue-500 outline-none"
      />
      <select
        value={room}
        onChange={(e) => setRoom(e.target.value)}
        className="w-full border border-gray-300 rounded-lg pl-4 py-2 text-sm text-gray-600 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="">会議室を選んでください</option>
        <option value="S/応接室">サヱグサビル 応接室</option>
        <option value="S/会議スペース">サヱグサビル 会議スペース</option>
        <option value="N/応接室">並木ビル 応接室</option>
        <option value="N/会議スペース">並木ビル 会議スペース</option>
      </select>
        
      <select
        value={startTime}
        onChange={(e) => setStartTime(e.target.value)}
        className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm text-gray-600 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"

      >  
      <option value="">開始時間を選んでください</option>
      {timeSlots.map((slot) => (
        <option key={slot} value={slot} disabled={isStartTimeDisabled(slot)}>{slot}</option>
      ))}
     </select>

      <select
        value={endTime}
        onChange={(e) => setEndTime(e.target.value)}
        className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm text-gray-600 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"

      >
        <option value="">終了時間を選んでください</option>
        {timeSlots
          .filter((slot) => startTime && slot > startTime)  // ← ここがポイント
          .map((slot) => (
            <option key={slot} value={slot} disabled={isEndTimeDisabled(slot)}>{slot}</option>
          ))}
        </select>
        
        <select
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm text-gray-600 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"

        >
          <option value="">名前を選んでください</option>
          <option value="井ヶ田">井ヶ田</option>
          <option value="井ヶ田">井ヶ田</option>
          <option value="〇〇">〇〇</option>
          <option value="〇〇">〇〇</option>
        </select>

        <button
          onClick={handleReserve}
          className="w-full bg-blue-500 text-white font-medium tracking-wide py-2 rounded-lg shadow-sm hover:bg-gray-800 transition"
        >
          予約する
        </button>
      </div>

<div className="overflow-x-auto mt-10 max-w-2xl mx-auto rounded-lg shadow-sm border border-gray-200 bg-white">
  <table className="w-full text-sm text-left border-collapse">
    <thead>
      <tr>
        <th className="px-4 py-3 border-b border-gray-200 text-center bg-gray-50 text-gray-600 font-medium text-sm">日付</th>
        <th className="px-4 py-3 border-b border-gray-200 text-center bg-gray-50 text-gray-600 font-medium text-sm">会議室</th>
        <th className="px-4 py-3 border-b border-gray-200 text-center bg-gray-50 text-gray-600 font-medium text-sm">時間</th>
        <th className="px-4 py-3 border-b border-gray-200 text-center bg-gray-50 text-gray-600 font-medium text-sm">名前</th>
        <th className="px-4 py-3 border-b border-gray-200 text-center bg-gray-50 text-gray-600 font-medium text-sm">操作</th>
      </tr>
    </thead>
    <tbody>
      {reservations.map((r, i) => (
        <tr key={i}>
          <td className="px-4 py-3 border-b border-gray-100 text-center text-gray-700">{r.date}</td>
          <td className="px-4 py-3 border-b border-gray-100 text-center text-gray-700">{r.room}</td>
          <td className="px-4 py-3 border-b border-gray-100 text-center text-gray-700">{r.time}</td>
          <td className="px-4 py-3 border-b border-gray-100 text-center text-gray-700">{r.name}</td>
          <td className="px-4 py-3 border-b border-gray-100 text-center">
            <button
              onClick={() => handleCancel(i)}
              className="text-red-500 hover:text-red-700 text-lg"
              title="削除"
            >
              🗑
            </button>
          </td>
        </tr>
      ))}
    </tbody>
  </table>
</div>

    </main>
  );
}
