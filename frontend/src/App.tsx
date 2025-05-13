import { useState, useEffect } from 'react';
import { MdAssignment } from 'react-icons/md';
import { TbGasStation } from 'react-icons/tb';
import { BsFolder2Open } from 'react-icons/bs';
import { MdHistory, MdDashboard } from 'react-icons/md';
import { WiDaySunny } from 'react-icons/wi';
import OperationFormModal from './components/OperationFormModal';
import './App.css';

import IkmalTakipModal from './components/IkmalTakipModal';
import EvraklarModal from './components/EvraklarModal';
import GecmisIkmaller from './components/GecmisIkmaller';

// Ikmal tipi tanımı
interface TankerFields {
  driver: string;
  trailer: string;
  tractor: string;
  litre: string;
}
interface FormFields {
  shipName: string;
  port: string;
  responsible: string;
  date: string;
  litrePerMinute: string;
  totalLitre: string;
  agency: string;
  tankers: TankerFields[];
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


function App() {
  const [showModal, setShowModal] = useState(false);
  const [showIkmalModal, setShowIkmalModal] = useState(false);
  const [ikmalList, setIkmalList] = useState<Ikmal[]>(() => {
    const stored = localStorage.getItem('ikmalList');
    return stored ? JSON.parse(stored) : [];
  });

  // Her ikmal için ayrı sayaç ve state (modal kapanınca kaybolmasın diye burada tutuluyor)
  const [ikmalStates, setIkmalStates] = useState(() => ikmalList.map(() => ({
    running: false,
    paused: false,
    currentLitre: 0,
    progress: 0,
    status: 'Hazır', // 'Hazır', 'Devam Ediyor', 'Durduruldu', 'Tamamlandı'
    intervalId: null as null | number,
    locked: false
  })));

  // Eğer ikmalList değişirse, ikmalStates'i de güncelle (eklenen/silinen ikmal olursa)
  useEffect(() => {
    setIkmalStates(prev => {
      if (ikmalList.length === prev.length) return prev;
      if (ikmalList.length > prev.length) {
        // Yeni ikmal eklendi
        return [...prev, ...Array(ikmalList.length - prev.length).fill({
          running: false,
          paused: false,
          currentLitre: 0,
          progress: 0,
          status: 'Hazır',
          intervalId: null,
          locked: false
        })];
      } else {
        // İkmal silindi
        return prev.slice(0, ikmalList.length);
      }
    });
  }, [ikmalList]);

  // ikmalList değişince localStorage'a kaydet
  useEffect(() => {
    localStorage.setItem('ikmalList', JSON.stringify(ikmalList));
  }, [ikmalList]);
  const [evraklar, setEvraklar] = useState<Evrak[]>([]);
  const [showEvraklar, setShowEvraklar] = useState(false);
  const [showGecmisIkmaller, setShowGecmisIkmaller] = useState(false);
  return (
    <div className="main-bg">
      <div className="main-cards">
        <div className="main-card" onClick={() => setShowModal(true)} style={{ cursor: 'pointer' }}>
          <div className="main-card-icon">
            <MdAssignment size={54} color="#3498db" style={{filter:'drop-shadow(0 2px 8px #3498db33)'}} />
          </div>
          <div className="main-card-title">Operasyon Formu</div>
          <div className="main-card-desc">Yeni operasyon ekle.</div>
        </div>
        <div className="main-card" onClick={() => setShowIkmalModal(true)} style={{ cursor: 'pointer' }}>
          <div className="main-card-icon">
            <TbGasStation size={54} color="#27ae60" style={{filter:'drop-shadow(0 2px 8px #27ae6033)'}} />
          </div>
          <div className="main-card-title">İkmal Takip</div>
          <div className="main-card-desc">Mevcut operasyonları yönet.</div>
        </div>
        <div className="main-card" onClick={() => setShowEvraklar(true)} style={{ cursor: 'pointer' }}>
          <div className="main-card-icon" style={{marginTop: '16px'}}>
            <BsFolder2Open size={54} color="#f4b400" style={{filter:'drop-shadow(0 2px 8px #f4b40033)'}} />
          </div>
          <div className="main-card-title">Evraklar</div>
          <div className="main-card-desc" style={{marginTop: '8px'}}>Yüklenen tüm evrakları görüntüle.</div>
        </div>
      </div>
      <div className="main-buttons">
        <div className="main-btn history" onClick={() => setShowGecmisIkmaller(true)} style={{cursor:'pointer'}}>
          <span className="main-btn-icon-bg" style={{background: 'linear-gradient(135deg,#6dd5ed 0%,#2193b0 100%)', boxShadow: '0 2px 8px #2193b033', borderRadius: '50%', padding: '7px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '10px'}}>
            <MdHistory size={26} color="#fff" style={{filter: 'drop-shadow(0 2px 6px #2193b088)'}} />
          </span>
          <span>Geçmiş İkmaller için</span>
          <span className="main-btn-highlight">hemen incele!</span>
        </div>
        <div className="main-btn weather">
          <span className="main-btn-icon-bg" style={{background: 'linear-gradient(135deg,#f7971e 0%,#ffd200 100%)', boxShadow: '0 2px 8px #ffd20044', borderRadius: '50%', padding: '7px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '10px'}}>
            <WiDaySunny size={30} color="#fff" style={{filter: 'drop-shadow(0 2px 6px #ffd20088)'}} />
          </span>
          <span>Liman Hava Durumu ve Deniz Bilgileri</span>
        </div>
        <div className="main-btn dashboard">
          <span className="main-btn-icon-bg" style={{background: 'linear-gradient(135deg,#43cea2 0%,#185a9d 100%)', boxShadow: '0 2px 8px #185a9d44', borderRadius: '50%', padding: '7px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '10px'}}>
            <MdDashboard size={24} color="#fff" style={{filter: 'drop-shadow(0 2px 6px #185a9d88)'}} />
          </span>
          <span>Dashboard özetlerini</span>
          <span className="main-btn-highlight">görüntüle</span>
        </div>
      </div>
      {showModal && (
        <OperationFormModal
          onClose={() => setShowModal(false)}
          ikmaller={ikmalList}
          setIkmaller={setIkmalList}
        />
      )}
      {showIkmalModal && (
        <IkmalTakipModal
          onClose={() => setShowIkmalModal(false)}
          ikmaller={ikmalList}
          onEvrakEkle={(evrak: Evrak) => setEvraklar(prev => [...prev, evrak])}
          ikmalStates={ikmalStates}
          setIkmalStates={setIkmalStates}
        />
      )}
      {showEvraklar && (
        <EvraklarModal evraklar={evraklar} onClose={() => setShowEvraklar(false)} />
      )}
      {showGecmisIkmaller && (
        <GecmisIkmaller ikmaller={ikmalList} onClose={() => setShowGecmisIkmaller(false)} />
      )}
    </div>
  );
}

export default App;
