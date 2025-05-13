import React, { useState } from "react";
import "./IkmalTakipModal.css";
import { FaLock, FaMapMarkerAlt, FaUserTie, FaCalendarAlt, FaTachometerAlt, FaBolt, FaPlayCircle, FaFlagCheckered, FaShip } from 'react-icons/fa';

interface FormFields {
  shipName: string;
  port: string;
  responsible: string;
  date: string;
  litrePerMinute: string;
  totalLitre: string;
  agency: string;
  tankers: any[];
  startTime?: string;
  estimatedEndTime?: string;
  progress?: number;
  status?: string;
  currentLitre?: number;
}

interface Ikmal {
  form: FormFields;
  locked: boolean;
}

interface Evrak {
  shipName: string;
  date: string;
  agency: string;
  fileName: string;
  fileUrl: string;
}

interface IkmalTakipModalProps {
  onClose: () => void;
  ikmaller: Ikmal[];
  onEvrakEkle?: (evrak: Evrak) => void;
  ikmalStates: any[];
  setIkmalStates: React.Dispatch<React.SetStateAction<any[]>>;
}

const IkmalTakipModal: React.FC<IkmalTakipModalProps> = ({ onClose, ikmaller, onEvrakEkle, ikmalStates, setIkmalStates }) => {
  // State artık üst komponentten geliyor, burada local state yok

  const handleStart = (idx: number) => {

    // Başlangıç ve tahmini bitiş saatini hesapla
    const now = new Date();
    const startTimeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const litrePerMinute = Number(ikmaller[idx].form.litrePerMinute) || 0;
    const totalLitre = Number(ikmaller[idx].form.totalLitre) || 0;
    let estimatedEndTimeStr = '-';
    if (litrePerMinute > 0 && totalLitre > 0) {
      const durationMinutes = totalLitre / litrePerMinute;
      const estimatedEnd = new Date(now.getTime() + durationMinutes * 60000);
      estimatedEndTimeStr = estimatedEnd.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    // Formu güncelle
    ikmaller[idx].form.startTime = ikmaller[idx].form.startTime || startTimeStr;
    ikmaller[idx].form.estimatedEndTime = ikmaller[idx].form.estimatedEndTime || estimatedEndTimeStr;

    setIkmalStates(prev => prev.map((s, i) => i === idx ? {
      ...s,
      running: true,
      paused: false,
      status: 'Devam Ediyor',
      intervalId: setInterval(() => {
        setIkmalStates(prev2 => prev2.map((ss, ii) => {
          if (ii !== idx || ss.locked || !ss.running) return ss;
          const litrePerMinute = Number(ikmaller[idx].form.litrePerMinute) || 0;
          const totalLitre = Number(ikmaller[idx].form.totalLitre) || 0;
          const increment = litrePerMinute / 60; // 1 sn'de artış
          let newLitre = (ss.currentLitre || 0) + increment;
          if (newLitre >= totalLitre) {
            newLitre = totalLitre;
          }
          const newProgress = totalLitre > 0 ? Math.round((newLitre / totalLitre) * 100) : 0;
          if (newLitre >= totalLitre) {
            clearInterval(ss.intervalId as any);
            return { ...ss, currentLitre: totalLitre, progress: 100, running: false, status: 'Tamamlandı' };
          }
          return { ...ss, currentLitre: newLitre, progress: newProgress };
        }));
      }, 1000),
    } : s));
  };

  const handlePause = (idx: number) => {

    setIkmalStates(prev => prev.map((s, i) => {
      if (i !== idx) return s;
      if (s.intervalId) clearInterval(s.intervalId as any);
      return { ...s, running: false, paused: true, status: 'Durduruldu', intervalId: null };
    }));
  };

  const handleResume = (idx: number) => {
    handleStart(idx);
  };

  const handleBitir = (idx: number) => {
    setIkmalStates(prev => prev.map((s, i) => {
      if (i !== idx) return s;
      if (s.intervalId) clearInterval(s.intervalId as any);
      return { ...s, running: false, paused: false, locked: true, status: 'Tamamlandı', progress: 100 };
    }));
    // Ayrıca ikmaller prop'una da locked: true yansıtılmalı (opsiyonel olarak parent'a callback ile iletilebilir)
  };

  return (
    <div className="ikmal-modal-overlay">
      <div className="ikmal-modal-card" style={{maxHeight:'90vh', overflowY:'auto'}}>
        <button className="ikmal-modal-close" onClick={onClose}>×</button>
        <div className="ikmal-modal-title">İkmal Takip</div>
        <div className="ikmal-modal-desc">Mevcut operasyonları yönet.</div>
        {ikmaller.length === 0 && (
          <div style={{marginTop:32, textAlign:'center', color:'#888'}}>Henüz eklenmiş ikmal yok.</div>
        )}
        <div
          className="ikmal-cards-container"
          style={ikmaller.length === 1 ? {
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '300px'
          } : {}}
        >
          {ikmaller.map((ikmal, idx) => (
            <div
              className={"ikmal-detail-card" + (ikmalStates[idx]?.locked ? " ikmal-locked" : "")}
              key={idx}
              style={{
                border: ikmalStates[idx]?.locked
                  ? '2px solid #b2bec3'
                  : ikmalStates[idx]?.status === 'Hazır'
                  ? '2px solid #e0e0e0'
                  : ikmalStates[idx]?.status === 'Durduruldu'
                  ? '2px solid #e6c200'
                  : ikmalStates[idx]?.status === 'Devam Ediyor'
                  ? '2px solid #27ae60'
                  : '2px solid #e74c3c',
                background: ikmalStates[idx]?.locked
                  ? '#f4f6f8'
                  : ikmalStates[idx]?.status === 'Hazır'
                  ? '#fff'
                  : ikmalStates[idx]?.status === 'Durduruldu'
                  ? '#fffbe5'
                  : ikmalStates[idx]?.status === 'Devam Ediyor'
                  ? '#f6fef7'
                  : '#fbeeea',
                opacity: ikmalStates[idx]?.locked ? 0.7 : 1,
                pointerEvents: ikmalStates[idx]?.locked ? 'none' : undefined,
              }}
            >
              <div className="ikmal-detail-header-modern">
                <div className="ikmal-detail-icon-title">
                  <FaShip className="ikmal-detail-mainicon" />
                  <span className="ikmal-detail-title-modern">{ikmal.form.shipName}</span>
                </div>
                {ikmalStates[idx]?.locked && (
                  <span className="ikmal-locked-overlay"><FaLock style={{fontSize:24, color:'#b2bec3'}} /></span>
                )}
              </div>
              <hr className="ikmal-detail-divider" />
              <div className="ikmal-detail-info-modern">
                <div className="ikmal-info-row"><div className="ikmal-detail-label"><FaMapMarkerAlt className="ikmal-label-icon" /> Liman:</div> <span className="ikmal-info-value">{ikmal.form.port}</span></div>
                <div className="ikmal-info-row"><div className="ikmal-detail-label"><FaUserTie className="ikmal-label-icon" /> Sorumlu:</div> <span className="ikmal-info-value">{ikmal.form.responsible}</span></div>
                <div className="ikmal-info-row"><div className="ikmal-detail-label"><FaCalendarAlt className="ikmal-label-icon" /> Tarih:</div> <span className="ikmal-info-value">{ikmal.form.date}</span></div>
                <div className="ikmal-info-row"><div className="ikmal-detail-label"><FaTachometerAlt className="ikmal-label-icon" /> Toplam Litre:</div> <span className="ikmal-info-value">{ikmal.form.totalLitre}</span></div>
                <div className="ikmal-info-row"><div className="ikmal-detail-label"><FaBolt className="ikmal-label-icon" /> Hız:</div> <span className="ikmal-info-value">{ikmal.form.litrePerMinute} L/dk</span></div>
                <div className="ikmal-info-row"><div className="ikmal-detail-label"><FaPlayCircle className="ikmal-label-icon" /> Başlangıç:</div> <span className="ikmal-info-value">{ikmal.form.startTime || '-'}</span></div>
                <div className="ikmal-info-row"><div className="ikmal-detail-label"><FaFlagCheckered className="ikmal-label-icon" /> Tahmini Bitiş:</div> <span className="ikmal-info-value">{ikmal.form.estimatedEndTime || '-'}</span></div>
              </div>
              <BDRYukleCard
                idx={idx}
                ikmalState={ikmalStates[idx]}
                totalLitre={ikmal.form.totalLitre}
                handleStart={handleStart}
                handlePause={handlePause}
                handleResume={handleResume}
                handleBitir={handleBitir}
                ikmal={ikmal}
                onEvrakEkle={onEvrakEkle}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const BDRYukleCard: React.FC<{
  idx: number;
  ikmalState: any;
  totalLitre: number | string;
  handleStart: (idx: number) => void;
  handlePause: (idx: number) => void;
  handleResume: (idx: number) => void;
  handleBitir: (idx: number) => void;
  ikmal: Ikmal;
  onEvrakEkle?: (evrak: Evrak) => void;
}> = ({ idx, ikmalState, totalLitre, handleStart, handlePause, handleResume, handleBitir, ikmal, onEvrakEkle }) => {
  const [showBDR, setShowBDR] = useState(false);
  const [kaydedildi, setKaydedildi] = useState(false);
  const [fileName, setFileName] = useState<string|null>(null);
  const [file, setFile] = useState<File|null>(null);

  const handleBDRClick = () => {
    setShowBDR(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFileName(e.target.files[0].name);
      setFile(e.target.files[0]);
    }
  };

  const handleBDRSave = () => {
    setKaydedildi(true);
    // Evrak ekleme
    if (file && fileName && onEvrakEkle) {
      const fileUrl = URL.createObjectURL(file);
      onEvrakEkle({
        shipName: ikmal.form.shipName,
        date: ikmal.form.date,
        agency: ikmal.form.agency,
        fileName,
        fileUrl
      });
    }
    setTimeout(() => {
      setKaydedildi(false);
      setShowBDR(false);
    }, 2000);
  };

  const handleBDRDelete = () => {
    setFileName(null);
    setShowBDR(false);
  };

  return (
    <>
      <div className="ikmal-progress-bar">
        <span className="ikmal-progress-green">{Math.round(ikmalState?.progress || 0)}%</span>
        <span className="ikmal-progress-litre">{Math.round(ikmalState?.currentLitre || 0)} / {totalLitre || 0} L</span>
      </div>
      {/* Dosya ismi sayaç altında, her zaman burada görünür */}
      {fileName && (
        <div style={{margin:'8px 0 8px 0', fontSize:14, color:'#1769aa', wordBreak:'break-all'}}>
          Dosya: <b>{fileName}</b>
        </div>
      )}

      <div className={
        ikmalState?.status === 'Durduruldu'
          ? 'ikmal-status ikmal-status-yellow'
          : ikmalState?.status === 'Tamamlandı'
            ? 'ikmal-status ikmal-status-red'
            : 'ikmal-status ikmal-status-green'
      }>
        {ikmalState?.status === 'Hazır' ? 'Hazır' : ikmalState?.status || 'Devam Ediyor'}
      </div>
      <div className="ikmal-btn-row">
        {!ikmalState?.running && !ikmalState?.paused && (
          <button className="ikmal-btn ikmal-btn-green" onClick={() => handleStart(idx)}>Başlat</button>
        )}
        {ikmalState?.running && (
          <button className="ikmal-btn ikmal-btn-yellow" onClick={() => handlePause(idx)}>Durdur</button>
        )}
        {ikmalState?.paused && (
          <button className="ikmal-btn ikmal-btn-green" onClick={() => handleResume(idx)}>Devam Et</button>
        )}
        <button className="ikmal-btn ikmal-btn-red ikmal-btn-red-strong" onClick={() => handleBitir(idx)}>Bitir</button>
        <button className="ikmal-btn ikmal-btn-blue" onClick={handleBDRClick}>BDR YÜKLE</button>
      </div>
      {showBDR && (
        <div style={{ display: showBDR ? 'block' : 'none', marginTop: 10, background: '#fbeeea', borderRadius: 12, padding: '18px 16px 10px 16px', border: '2px solid #ff9800', boxShadow: '0 2px 12px 0 rgba(255,152,0,0.06)' }}>
          <input
            type="file"
            accept="application/pdf,image/*"
            onChange={handleFileChange}
            style={{marginBottom:8, fontSize:14, border:'none', background:'none'}}
          />
          <div style={{display:'flex', alignItems:'center', gap:12}}>
            <button className="ikmal-btn ikmal-btn-green" onClick={handleBDRSave} disabled={!fileName}>Kaydet</button>
            <button className="ikmal-btn ikmal-btn-red" onClick={handleBDRDelete}>Sil</button>
          </div>
          {kaydedildi && (
            <div style={{color:'#27ae60', fontWeight:700, fontSize:15, marginTop:8}}>
              Kaydedildi
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default IkmalTakipModal;
