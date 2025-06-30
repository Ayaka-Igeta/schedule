'use client';
import { useState } from 'react';

// 一旦Amplifyを使わないバージョン
export default function App() {
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [room, setRoom] = useState("");
  const [name, setName] = useState("");
  const [reservations, setReservations] = useState<any[]>([]);

  const handleReserve = () => {
    if (!room || !date || !startTime || !endTime || !name) {
      alert("すべての項目を入力してください");
      return;
    }
    
    const newReservation = {
      id: Date.now().toString(),
      date,
      room,
      time: `${startTime}〜${endTime}`,
      name,
    };
    
    setReservations(prev => [...prev, newReservation]);
    
    // フォームリセット
    setDate('');
    setRoom('');
    setStartTime('');
    setEndTime('');
    setName('');
    
    alert("予約が作成されました！（※現在はローカル保存のみ）");
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>会議室予約システム</h1>
      <p style={{ color: 'orange' }}>※現在テスト版：データはページリロードで消えます</p>
      
      <div style={{ marginBottom: '20px', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
        <h2>新規予約</h2>
        
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>日付:</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc', width: '200px' }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>会議室:</label>
          <select
            value={room}
            onChange={(e) => setRoom(e.target.value)}
            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc', width: '250px' }}
          >
            <option value="">選択してください</option>
            <option value="S/応接室">サヱグサビル 応接室</option>
            <option value="S/会議スペース">サヱグサビル 会議スペース</option>
            <option value="N/応接室">並木ビル 応接室</option>
            <option value="N/会議スペース">並木ビル 会議スペース</option>
          </select>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>予約者:</label>
          <select
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc', width: '200px' }}
          >
            <option value="">選択してください</option>
            <option value="井ヶ田">井ヶ田</option>
            <option value="三村">三村</option>
          </select>
        </div>

        <div style={{ display: 'flex', gap: '20px', marginBottom: '15px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>開始時間:</label>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>終了時間:</label>
            <input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
            />
          </div>
        </div>

        <button
          onClick={handleReserve}
          disabled={!room || !date || !startTime || !endTime || !name}
          style={{
            padding: '12px 24px',
            backgroundColor: !room || !date || !startTime || !endTime || !name ? '#ccc' : '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: !room || !date || !startTime || !endTime || !name ? 'not-allowed' : 'pointer',
            fontSize: '16px',
            fontWeight: 'bold'
          }}
        >
          予約を作成
        </button>
      </div>

      <div style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
        <h2>予約一覧 ({reservations.length}件)</h2>
        {reservations.length === 0 ? (
          <p style={{ color: '#666', fontStyle: 'italic' }}>予約がありません</p>
        ) : (
          <div>
            {reservations.map((r) => (
              <div 
                key={r.id} 
                style={{ 
                  marginBottom: '10px', 
                  padding: '15px', 
                  border: '1px solid #eee', 
                  borderRadius: '6px',
                  backgroundColor: '#f9f9f9'
                }}
              >
                <div style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '8px' }}>
                  {r.room}
                </div>
                <div style={{ color: '#666' }}>
                  📅 {r.date} | ⏰ {r.time} | 👤 {r.name}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}