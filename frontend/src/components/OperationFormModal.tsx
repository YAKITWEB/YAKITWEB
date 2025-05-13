import React, { useState } from 'react';
import { FaShip, FaMapMarkerAlt, FaUserTie, FaCalendarAlt, FaTachometerAlt, FaTint, FaBuilding, FaUser, FaTruckMoving, FaTractor, FaUnlock } from 'react-icons/fa';
import './OperationFormModal.css';

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

const initialTanker: TankerFields = { driver: '', trailer: '', tractor: '', litre: '' };
const initialForm: FormFields = {
  shipName: '',
  port: '',
  responsible: '',
  date: '',
  litrePerMinute: '',
  totalLitre: '',
  agency: '',
  tankers: [ { ...initialTanker } ]
};

interface Ikmal {
  form: FormFields;
  locked: boolean;
}

const OperationFormModal: React.FC<{
  onClose: () => void;
  ikmaller?: Ikmal[];
  setIkmaller?: (ikmaller: Ikmal[]) => void;
  initialActive?: number;
}> = ({ onClose, ikmaller = [], setIkmaller, initialActive = 0 }) => {
  const [ikmalList, setIkmalList] = useState<Ikmal[]>(ikmaller.length ? ikmaller : [{ form: { ...initialForm }, locked: false }]);
  const [activeIkmal, setActiveIkmal] = useState(initialActive);
  const [form, setForm] = useState<FormFields>(ikmaller.length ? ikmaller[initialActive]?.form : { ...initialForm });
  const [locked, setLocked] = useState(ikmaller.length ? ikmaller[initialActive]?.locked : false);
  const [error, setError] = useState('');
  const [tankerCount, setTankerCount] = useState(form.tankers.length);

  // ...handleChange, handleTankerCount, validate fonksiyonları aynı kalacak...

  // Aktif ikmali sil
  const handleDeleteIkmal = () => {
    setIkmalList((prev) => {
      const updated = prev.filter((_, idx) => idx !== activeIkmal);
      if (updated.length === 0) {
        if (onClose) onClose();
        return [];
      }
      // Eğer başka ikmal varsa ilkini aktif yap
      setActiveIkmal(0);
      setForm({ ...updated[0].form });
      setLocked(updated[0].locked);
      setTankerCount(updated[0].form.tankers.length);
      setError('');
      return updated;
    });
  };


  // Sekme değiştirince aktif ikmalin formunu yükle
  const handleTab = (idx: number) => {
    setActiveIkmal(idx);
    setForm({ ...ikmalList[idx].form });
    setLocked(ikmalList[idx].locked);
    setTankerCount(ikmalList[idx].form.tankers.length);
    setError('');
  };

  // Yeni ikmal ekle
  const handleAddIkmal = () => {
    const yeni = { form: { ...initialForm }, locked: false };
    setIkmalList((prev) => {
      const updated = [...prev, yeni];
      setActiveIkmal(updated.length - 1);
      setForm({ ...initialForm });
      setLocked(false);
      setTankerCount(1);
      setError('');
      return updated;
    });
  };


  // Kaydet: aktif ikmal güncellenir (sadece formu günceller, kilitlemez)
  const handleSave = () => {
    if (!validate()) {
      setError('Lütfen tüm alanları doldurun.');
      return;
    }
    setError('');
    setIkmalList((prev) => {
      const updated = prev.map((ikmal, i) =>
        i === activeIkmal ? { form: { ...form }, locked: true } : ikmal
      );
      if (setIkmaller) setIkmaller(updated);
      return updated;
    });
    setLocked(true);
  };







  // Düzenle: aktif ikmal açılır
  const handleEdit = () => {
    setLocked(false);
    setIkmalList((prev) => prev.map((ikmal, i) =>
      i === activeIkmal ? { ...ikmal, locked: false } : ikmal
    ));
  };


  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    field?: keyof TankerFields,
    tankerIdx?: number
  ) => {
    const { name, value } = e.target;
    if (typeof tankerIdx === 'number' && field) {
      const tankers = [...form.tankers];
      tankers[tankerIdx][field] = value;
      // Eğer değişen alan litre ise, toplamı otomatik güncelle
      if (field === 'litre') {
        const total = tankers.reduce((sum, t) => sum + (parseFloat(t.litre) || 0), 0);
        setForm({ ...form, tankers, totalLitre: total ? total.toString() : '' });
      } else {
        setForm({ ...form, tankers });
      }
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleTankerCount = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const count = parseInt(e.target.value, 10);
    setTankerCount(count);
    let tankers = [...form.tankers];
    while (tankers.length < count) tankers.push({ ...initialTanker });
    while (tankers.length > count) tankers.pop();
    setForm({ ...form, tankers });
  };

  const validate = () => {
    if (!form.shipName || !form.port || !form.responsible || !form.date || !form.litrePerMinute || !form.totalLitre || !form.agency)
      return false;
    for (const t of form.tankers) {
      if (!t.driver || !t.trailer || !t.tractor || !t.litre) return false;
    }
    return true;
  };


  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <button className="modal-close" onClick={onClose}>×</button>
        <div className="modal-title">Operasyon Formu</div>
        <div className="ikmal-add-row-center">
          <button className="ikmal-add ikmal-add-large" onClick={handleAddIkmal}>+ Yeni İkmal Ekle</button>
        </div>
        
        <div className="ikmal-tabs-row">
          <div className="ikmal-tabs-title">İkmaller:</div>
          
<div className="ikmal-tabs">
  {ikmalList.map((ikmal, idx) => (
    <button
      key={idx}
      className={"ikmal-tab" + (activeIkmal === idx ? " active" : "")}
      onClick={() => handleTab(idx)}
    >
      {ikmal.form.shipName ? ikmal.form.shipName : `İkmal ${idx + 1}`}
    </button>
  ))}
</div>
        </div>
        <div className="form-row">
          <div className="form-field">
            <FaShip className="form-icon" />
            <input className="form-input" name="shipName" placeholder="Gemi veya Yat İsmi" value={form.shipName} onChange={handleChange} disabled={locked} />
          </div>
          <div className="form-field">
            <FaMapMarkerAlt className="form-icon" />
            <select className="form-select" name="port" value={form.port} onChange={handleChange} disabled={locked}>
  <option value="" disabled>Liman Seç</option>
  <option value="ALİAĞA HABAŞ LİMANI">ALİAĞA HABAŞ LİMANI</option>
  <option value="ALİAĞA BATI LİMANI">ALİAĞA BATI LİMANI</option>
  <option value="ALİAĞA IDÇ LİMANI">ALİAĞA IDÇ LİMANI</option>
  <option value="ALİAĞA NEMPORT LİMANI">ALİAĞA NEMPORT LİMANI</option>
  <option value="BODRUM TURGUTREİS">BODRUM TURGUTREİS</option>
  <option value="BODRUM CRUISE PORT">BODRUM CRUISE PORT</option>
  <option value="GÖCEK PORT AZURE">GÖCEK PORT AZURE</option>
  <option value="MARMARIS CRUISE PORT">MARMARIS CRUISE PORT</option>
</select>
          </div>
        </div>
        <div className="form-row">
          <div className="form-field">
            <FaUserTie className="form-icon" />
            <select className="form-select" name="responsible" value={form.responsible} onChange={handleChange} disabled={locked}>
              <option value="" disabled>Operasyon Sorumlusu Seç</option>
              <option value="Caner Çorba">Caner Çorba</option>
              <option value="Duhan Irmak">Duhan Irmak</option>
              <option value="Burak Filiz">Burak Filiz</option>
              <option value="Mehmetcan Kesici">Mehmetcan Kesici</option>
            </select>
          </div>
          <div className="form-field">
            <FaCalendarAlt className="form-icon" />
            <input className="form-input" name="date" placeholder="gg.aa.yyyy" value={form.date} onChange={handleChange} disabled={locked} type="date" />
          </div>
        </div>
        <div className="form-row">
          <div className="form-field">
            <FaTachometerAlt className="form-icon" />
            <input className="form-input" name="litrePerMinute" placeholder="Dakikadaki Litre Hızı" value={form.litrePerMinute} onChange={handleChange} disabled={locked} />
          </div>
          <div className="form-field">
            <FaTint className="form-icon" />
            <input className="form-input" name="totalLitre" placeholder="Toplam Litre" value={form.totalLitre} onChange={handleChange} disabled={locked} />
          </div>
        </div>
        <div className="form-row">
          <div className="form-field wide">
            <FaBuilding className="form-icon" />
            <input className="form-input" name="agency" placeholder="Acente" value={form.agency} onChange={handleChange} disabled={locked} />
          </div>
        </div>
        <div className="form-row tanker-select-row">
          <label htmlFor="tankerCount">Tanker Sayısı</label>
          <select id="tankerCount" value={tankerCount} onChange={handleTankerCount} disabled={locked}>
            {[1,2,3,4,5].map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </div>
        <div className={`tanker-grid-scroll${form.tankers.length <= 2 ? ' noscroll' : ''}`}>
          <div className="tanker-grid">
            {form.tankers.map((tanker, idx) => (
              <div className="tanker-card" key={idx}>
                <div className="tanker-title">Tanker {idx+1}</div>
                <div className="form-row">
                  <div className="form-field">
                    <FaUser className="form-icon" />
                    <input className="form-input" name="driver" placeholder="Şoför" value={tanker.driver} onChange={e => handleChange(e, 'driver', idx)} disabled={locked} />
                  </div>
                  <div className="form-field">
                    <FaTruckMoving className="form-icon" />
                    <input className="form-input" name="trailer" placeholder="Dorse" value={tanker.trailer} onChange={e => handleChange(e, 'trailer', idx)} disabled={locked} />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-field">
                    <FaTractor className="form-icon" />
                    <input className="form-input" name="tractor" placeholder="Çekici" value={tanker.tractor} onChange={e => handleChange(e, 'tractor', idx)} disabled={locked} />
                  </div>
                  <div className="form-field">
                    <FaTint className="form-icon" />
                    <input className="form-input" name="litre" placeholder="Litre" value={tanker.litre} onChange={e => handleChange(e, 'litre', idx)} disabled={locked} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        {error && <div className="form-error">{error}</div>}
        <div className="form-actions">
          {!locked ? (
            <>
              <button className="btn-save" onClick={handleSave}>KAYDET</button>
              <button className="btn-cancel" onClick={handleDeleteIkmal}>SİL</button>
            </>
          ) : (
            <>
              <button className="btn-edit" onClick={handleEdit}><FaUnlock style={{marginRight:4}}/> DÜZENLE</button>
              <button className="btn-cancel" onClick={handleDeleteIkmal}>SİL</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default OperationFormModal;
