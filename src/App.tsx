import { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";

// AWS Amplify関連は一旦コメントアウト（バックエンドデプロイ待ち）
// import { Amplify } from 'aws-amplify';
// import config from '../amplify_outputs.json';
// import { generateClient } from 'aws-amplify/data';
// import type { Schema } from '../amplify/data/resource';

// Amplify.configure(config);
// const client = generateClient<Schema>();

interface Reservation {
  id: string;
  date: string | null;
  room: string | null;
  time: string | null;
  name: string | null;
  subject: string | null;
}

export default function App() {
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [room, setRoom] = useState("");
  const [name, setName] = useState("");
  const [subject, setSubject] = useState("");
  const [reservations, setReservations] = useState<Reservation[]>([]);
  
  // エラーハンドリング用の状態
  const [notification, setNotification] = useState<{
    message: string;
    type: 'success' | 'error';
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const sortedReservations = [...reservations].sort((a, b) => {
    if (!a.date && !b.date) return 0;
    if (!a.date) return 1;
    if (!b.date) return -1;
    
    const dateComparison = a.date.localeCompare(b.date);
    if (dateComparison !== 0) return dateComparison;
    
    if (!a.time && !b.time) return 0;
    if (!a.time) return 1;
    if (!b.time) return -1;
    
    return a.time.localeCompare(b.time);
  });

  // 一旦ローカルストレージを使用
  useEffect(() => {
    const saved = localStorage.getItem('reservations');
    if (saved) {
      try {
        setReservations(JSON.parse(saved));
      } catch (error) {
        console.error("データの読み込みエラー:", error);
        showNotification("データの読み込みに失敗しました", "error");
      }
    }
  }, []);

  const handleReserve = async () => {
    if (!room || !date || !startTime || !endTime || !name || !subject) {
      showNotification("すべての項目を入力してください", "error");
      return;
    }
    
    // 時間の妥当性チェック
    if (startTime >= endTime) {
      showNotification("終了時間は開始時間より後に設定してください", "error");
      return;
    }
    
    setIsLoading(true);
    try {
      const formattedDate = format(date, "yyyy-MM-dd");
      
      const newReservation: Reservation = {
        id: Date.now().toString(),
        date: formattedDate,
        room,
        time: `${startTime}〜${endTime}`,
        name,
        subject,
      };
      
      const updatedReservations = [...reservations, newReservation];
      setReservations(updatedReservations);
      localStorage.setItem('reservations', JSON.stringify(updatedReservations));
      
      // フォームリセット
      setDate(undefined);
      setRoom('');
      setStartTime('');
      setEndTime('');
      setName('');
      setSubject('');
      
      showNotification("予約が作成されました！", "success");
    } catch (error) {
      console.error("予約作成エラー:", error);
      showNotification("予約の作成に失敗しました", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = async (id: string) => {
    const reservation = reservations.find(r => r.id === id);
    const confirmMessage = `以下の予約を削除しますか？\n\n会議室: ${reservation?.room || '未設定'}\n日付: ${reservation?.date ? new Date(reservation.date + 'T00:00:00').toLocaleDateString('ja-JP') : '未設定'}\n時間: ${reservation?.time || '未設定'}\n予約者: ${reservation?.name || '未設定'}\n件名: ${reservation?.subject || '未設定'}`;
    
    if (!window.confirm(confirmMessage)) {
      return;
    }
    
    try {
      const updatedReservations = reservations.filter(r => r.id !== id);
      setReservations(updatedReservations);
      localStorage.setItem('reservations', JSON.stringify(updatedReservations));
      showNotification("予約をキャンセルしました", "success");
    } catch (error) {
      console.error("削除エラー:", error);
      showNotification("予約のキャンセルに失敗しました", "error");
    }
  };

  return (
    <main 
      className="min-h-screen"
      style={{ 
        background: 'linear-gradient(135deg, #d0e2ff 0%, #a6c8ff 100%)',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}
    >
      {/* 通知バー */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 max-w-md p-4 rounded-2xl shadow-lg backdrop-blur-xl border transition-all duration-300 ${
          notification.type === 'success' 
            ? 'bg-green-500/90 border-green-400/50 text-white' 
            : 'bg-red-500/90 border-red-400/50 text-white'
        }`}>
          <div className="flex items-center">
            {notification.type === 'success' ? (
              <svg className="w-5 h-5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-5 h-5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
            <p className="font-medium">{notification.message}</p>
            <button
              onClick={() => setNotification(null)}
              className="ml-3 p-1 rounded-full hover:bg-white/20 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Apple風ヘッダー */}
      <div className="bg-white/80 backdrop-blur-xl border-b border-white/20 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">
              会議室予約システム
            </h1>
            <div className="bg-blue-500/10 px-3 py-1 rounded-full backdrop-blur-sm">
              <span className="text-blue-700 text-sm font-medium">
                {sortedReservations.length}件の予約
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* 左カラム：予約フォーム */}
          <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20">
            <div className="flex items-center mb-8">
              <div className="w-1 h-8 bg-blue-500 rounded-full mr-4"></div>
              <h2 className="text-xl font-semibold text-gray-900">新規予約</h2>
            </div>

            <div className="space-y-6">

              {/* 日付 */}
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  日付
                </label>
                
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsCalendarOpen(!isCalendarOpen)}
                    className="w-full bg-white border border-gray-300 rounded-2xl px-6 py-4 h-14 text-left text-base hover:bg-gray-50 hover:border-blue-400 transition-all duration-200 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                  >
                    <div className="flex items-center justify-between">
                      <span className={date ? "text-gray-900" : "text-gray-500"}>
                        {date ? format(date, "yyyy年MM月dd日") : "日付を選択してください"}
                      </span>
                      <svg className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${isCalendarOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </button>
                  
                  {isCalendarOpen && (
                    <div className="absolute top-full left-0 mt-2 bg-white border border-gray-300 rounded-2xl shadow-xl z-[9999] w-80">
                      <div className="p-4">
                        <Calendar
                          mode="single"
                          selected={date}
                          onSelect={(selectedDate) => {
                            setDate(selectedDate);
                            setIsCalendarOpen(false);
                          }}
                          disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                          defaultMonth={new Date()}
                          className="rounded-lg"
                          classNames={{
                            day_selected: "bg-blue-500 text-white rounded-full",
                            day_today: "!bg-blue-500 !text-white !font-bold !rounded-full"
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* 時間設定 */}
              <div className="grid grid-cols-1 gap-4">
                {/* 開始時間 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    開始時間
                  </label>
                  <select
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full bg-white border border-gray-300 rounded-2xl px-6 py-4 h-14 text-gray-900 text-base transition-all duration-200 hover:bg-gray-50 hover:border-blue-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 appearance-none"
                    style={{
                      backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6,9 12,15 18,9'%3e%3c/polyline%3e%3c/svg%3e")`,
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'right 24px center',
                      backgroundSize: '1rem'
                    }}
                  >
                    <option value="">開始時間を選択</option>
                    {Array.from({ length: 45 }, (_, i) => {
                      const totalMinutes = 480 + (i * 15);
                      const hour = Math.floor(totalMinutes / 60);
                      const minute = totalMinutes % 60;
                      if (hour >= 23) return null;
                      const timeStr = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
                      return (
                        <option key={timeStr} value={timeStr}>
                          {timeStr}
                        </option>
                      );
                    }).filter(Boolean)}
                  </select>
                </div>

                {/* 終了時間 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    終了時間
                  </label>
                  <select
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full bg-white border border-gray-300 rounded-2xl px-6 py-4 h-14 text-gray-900 text-base transition-all duration-200 hover:bg-gray-50 hover:border-blue-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 appearance-none"
                    style={{
                      backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6,9 12,15 18,9'%3e%3c/polyline%3e%3c/svg%3e")`,
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'right 24px center',
                      backgroundSize: '1rem'
                    }}
                  >
                    <option value="">終了時間を選択</option>
                    {Array.from({ length: 45 }, (_, i) => {
                      const totalMinutes = 540 + (i * 15);
                      const hour = Math.floor(totalMinutes / 60);
                      const minute = totalMinutes % 60;
                      if (hour >= 24) return null;
                      const timeStr = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
                      return (
                        <option key={timeStr} value={timeStr}>
                          {timeStr}
                        </option>
                      );
                    }).filter(Boolean)}
                  </select>
                </div>
              </div>

              {/* 時間バリデーション */}
              {startTime && endTime && startTime >= endTime && (
                <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-red-500 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-red-700 text-sm">終了時間は開始時間より後に設定してください</p>
                  </div>
                </div>
              )}

              {/* 会議室 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  会議室
                </label>
                <select
                  value={room}
                  onChange={(e) => setRoom(e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded-2xl px-6 py-4 h-14 text-gray-900 text-base transition-all duration-200 hover:bg-gray-50 hover:border-blue-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 appearance-none"
                  style={{
                    backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6,9 12,15 18,9'%3e%3c/polyline%3e%3c/svg%3e")`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 24px center',
                    backgroundSize: '1rem'
                  }}
                >
                  <option value="">会議室を選択してください</option>
                  <option value="サヱグサビル 応接室">サヱグサビル 応接室</option>
                  <option value="サヱグサビル 会議スペース">サヱグサビル 会議スペース</option>
                  <option value="並木ビル 応接室">並木ビル 応接室</option>
                  <option value="並木ビル 会議スペース">並木ビル 会議スペース</option>
                </select>
              </div>

              {/* 予約者 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  予約者
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="予約者名を入力してください"
                  className="w-full bg-white border border-gray-300 rounded-2xl px-6 py-4 h-14 text-gray-900 text-base transition-all duration-200 hover:bg-gray-50 hover:border-blue-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                />
              </div>

              {/* 件名 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  件名
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="会議の件名を入力してください"
                  className="w-full bg-white border border-gray-300 rounded-2xl px-6 py-4 h-14 text-gray-900 text-base transition-all duration-200 hover:bg-gray-50 hover:border-blue-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                />
              </div>

              {/* 予約ボタン */}
              <div className="pt-2"></div>
              <Button
                onClick={handleReserve}
                disabled={!room || !date || !startTime || !endTime || !name || !subject || startTime >= endTime || isLoading}
                className="w-full bg-blue-500 hover:bg-blue-600 active:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium py-6 rounded-2xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl disabled:transform-none disabled:shadow-md"
              >
                <span className="flex items-center justify-center">
                  {isLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      予約中...
                    </>
                  ) : !room || !date || !startTime || !endTime || !name || !subject ? (
                    "すべての項目を入力してください"
                  ) : startTime >= endTime ? (
                    "時間設定を確認してください"
                  ) : (
                    "予約を作成"
                  )}
                </span>
              </Button>
            </div>
          </div>
          
          {/* 右カラム：予約一覧 */}
          <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center">
                <div className="w-1 h-8 bg-green-500 rounded-full mr-4"></div>
                <h2 className="text-xl font-semibold text-gray-900">予約一覧</h2>
              </div>
            </div>

            <div className="space-y-4">
              {sortedReservations.map((r, index) => (
                <div
                  key={r.id}
                  className="bg-gradient-to-br from-white/60 to-white/30 backdrop-blur-sm border border-white/30 rounded-2xl p-6 hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02] group"
                  style={{
                    animationDelay: `${index * 100}ms`,
                  }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center">
                      <div className={`w-3 h-3 rounded-full mr-3 ${
                        r.room?.includes('サヱグサビル') ? 'bg-blue-500' : 'bg-green-500'
                      }`}></div>
                      <div>
                        <p className="font-medium text-gray-900">{r.room || '未設定'}</p>
                        <p className="text-xs text-gray-500">
                          {r.date ? new Date(r.date + 'T00:00:00').toLocaleDateString('ja-JP', {
                            month: 'short',
                            day: 'numeric',
                            weekday: 'short'
                          }) : '日付未設定'}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleCancel(r.id)}
                      className="opacity-0 group-hover:opacity-100 p-2 rounded-full hover:bg-red-50/80 text-red-500 hover:text-red-600 transition-all duration-200 backdrop-blur-sm"
                      title="予約を削除"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <span className="text-gray-500 text-sm">時間</span>
                      <p className="font-medium text-gray-900">{r.time || '時間未設定'}</p>
                    </div>
                    <div>
                      <span className="text-gray-500 text-sm">予約者</span>
                      <p className="font-medium text-gray-900">{r.name || '未設定'}</p>
                    </div>
                  </div>

                  <div className="mt-4">
                    <span className="text-gray-500 text-sm">件名</span>
                    <p className="font-medium text-gray-900">{r.subject || '件名未設定'}</p>
                  </div>

                  <div className="mt-4">
                    <span className={`inline-block px-3 py-1 text-xs font-medium rounded-full backdrop-blur-sm ${
                      r.room?.includes('サヱグサビル') 
                        ? 'bg-blue-100/80 text-blue-700' 
                        : r.room?.includes('並木ビル')
                        ? 'bg-green-100/80 text-green-700'
                        : 'bg-gray-100/80 text-gray-700'
                    }`}>
                      {r.room?.includes('サヱグサビル') ? 'サヱグサビル' :
                       r.room?.includes('並木ビル') ? '並木ビル' :
                       '一般'}
                    </span>
                  </div>
                </div>
              ))}

              {sortedReservations.length === 0 && (
                <div className="text-center py-16">
                  <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <p className="text-gray-700 text-lg font-medium mb-2">予約がありません</p>
                  <p className="text-gray-600 text-sm">左のフォームから新しい予約を作成してください</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}