'use client';

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export default function App() {
  // const timeSlots = [
  //   "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  //   "12:00", "12:30", "13:00", "13:30", "14:00", "14:30",
  //   "15:00", "15:30", "16:00", "16:30", "17:00", "17:30",
  //   "18:00", "18:30", "19:00", "19:30", "20:00"
  // ];

  const [date, setDate] = useState<Date | undefined>(undefined);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [room, setRoom] = useState("");
  const [name, setName] = useState('');
  const [reservations, setReservations] = useState<{ date: string; room: string; time: string; name: string }[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('reservations');
    if (saved) setReservations(JSON.parse(saved));
  }, []);

  // const timeToMinutes = (t: string) => {
  //   const [h, m] = t.split(":").map(Number);
  //   return h * 60 + m;
  // };

  // const isOverlap = (startA: string, endA: string, startB: string, endB: string) => {
  //   const sA = timeToMinutes(startA);
  //   const eA = timeToMinutes(endA);
  //   const sB = timeToMinutes(startB);
  //   const eB = timeToMinutes(endB);
  //   return Math.max(sA, sB) < Math.min(eA, eB);
  // };

  // const isStartTimeDisabled = (slot: string) => {
  //   return reservations.some((r) => {
  //     if (!date || r.date !== format(date, "yyyy-MM-dd") || r.room !== room) return false;
  //     const [rStart, rEnd] = r.time.split("-");
  //     const currentIndex = timeSlots.indexOf(slot);
  //     const slotEnd = timeSlots[currentIndex + 1];
  //     if (!slotEnd) return true;
  //     return isOverlap(slot, slotEnd, rStart, rEnd);
  //   });
  // };

  // const isEndTimeDisabled = (slot: string) => {
  //   return reservations.some((r) => {
  //     if (!date || r.date !== format(date, "yyyy-MM-dd") || r.room !== room || !startTime) return false;
  //     const [rStart, rEnd] = r.time.split("-");
  //     return isOverlap(startTime, slot, rStart, rEnd);
  //   });
  // };

  const handleReserve = () => {
    if (!date || !room || !startTime || !endTime || !name) return;
    const time = `${startTime}-${endTime}`;
    const newData = [...reservations, {
      date: format(date, "yyyy-MM-dd"),
      room,
      time,
      name
    }];
    setReservations(newData);
    localStorage.setItem('reservations', JSON.stringify(newData));
    setRoom('');
    setStartTime('');
    setEndTime('');
    setName('');
  };

  const handleCancel = (index: number) => {
    const updated = [...reservations];
    updated.splice(index, 1);
    setReservations(updated);
    localStorage.setItem('reservations', JSON.stringify(updated));
  };

  return (
    <main className="min-h-screen bg-gray-100 px-4 py-10 text-gray-800 font-sans">
      <h1 className="text-2xl font-bold text-center mb-10">会議室予約システム</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-xl mx-auto">
        {/* 左カラム */}
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
          <h2 className="text-lg font-semibold mb-4">新規予約</h2>

          {/* カレンダー */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}
              >
                {date ? format(date, "yyyy-MM-dd") : "日付を選んでください"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>

          {/* 会議室選択 */}
          <select
            value={room}
            onChange={(e) => setRoom(e.target.value)}
            className="mt-4 border rounded-md px-4 py-3 w-full"
          >
            <option value="">会議室を選んでください</option>
            <option value="S/応接室">サヱグサビル 応接室</option>
            <option value="S/会議スペース">サヱグサビル 会議スペース</option>
            <option value="N/応接室">並木ビル 応接室</option>
            <option value="N/会議スペース">並木ビル 会議スペース</option>
          </select>

          <Input
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            placeholder="開始時間"
            className="mt-4"
          />

          <Input
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            placeholder="終了時間"
            className="mt-2"
          />

          <Input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="予約者の名前"
            className="mt-2"
          />

          <Button onClick={handleReserve} className="mt-4 w-full">
            予約する
          </Button>
        </div>

        {/* 右カラム */}
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
          <h2 className="text-lg font-semibold mb-4">予約一覧</h2>

          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-4 py-2 text-center">日付</th>
                <th className="px-4 py-2 text-center">会議室</th>
                <th className="px-4 py-2 text-center">時間</th>
                <th className="px-4 py-2 text-center">予約者</th>
                <th className="px-4 py-2 text-center">削除</th>
              </tr>
            </thead>
            <tbody>
              {reservations.map((r, i) => (
                <tr key={i}>
                  <td className="px-4 py-2 text-center">{r.date}</td>
                  <td className="px-4 py-2 text-center">{r.room}</td>
                  <td className="px-4 py-2 text-center">{r.time}</td>
                  <td className="px-4 py-2 text-center">{r.name}</td>
                  <td className="px-4 py-2 text-center">
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
      </div>
    </main>
  );
}
