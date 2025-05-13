import React, { useState } from 'react';
import { FaShip, FaUserTie, FaMapMarkerAlt, FaClock, FaChevronRight, FaDownload, FaFilter } from 'react-icons/fa';
// XLSX ve file-saver importları için en uyumlu ve önerilen yöntem kullanılmıştır.
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

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
  startTime?: string;
  estimatedEndTime?: string;
}

interface Ikmal {
  form: FormFields;
  locked: boolean;
}

interface GecmisIkmallerProps {
  ikmaller: Ikmal[];
  onClose: () => void;
}

const GecmisIkmaller: React.FC<GecmisIkmallerProps> = ({ ikmaller, onClose }) => {
  const [selected, setSelected] = useState<number | null>(null);
  const [filterText, setFilterText] = useState('');
  // Sadece manuel olarak bitirilen (locked:true) ikmaller geçmişte gösterilir. Otomatik tamamlananlar asla burada görünmez.
  const bitmisIkmaller = ikmaller.filter(i => i.locked);
  const filteredIkmaller = bitmisIkmaller.filter(ikmal => {
    const val = filterText.trim().toLowerCase();
    if (!val) return true;
    return (
      ikmal.form.shipName.toLowerCase().includes(val) ||
      ikmal.form.port.toLowerCase().includes(val) ||
      ikmal.form.responsible.toLowerCase().includes(val) ||
      ikmal.form.totalLitre.toLowerCase?.().includes(val) ||
      (ikmal.form.startTime?.toLowerCase().includes(val) || false) ||
      (ikmal.form.estimatedEndTime?.toLowerCase().includes(val) || false)
    );
  });

  const handleExcelExport = () => {
    const rows = filteredIkmaller.map(ikmal => ({
      'Gemi İsmi': ikmal.form.shipName,
      'Toplam Litre': ikmal.form.totalLitre,
      'Başlangıç Saati': ikmal.form.startTime,
      'Bitiş Saati': ikmal.form.estimatedEndTime,
      'Operasyon Sorumlusu': ikmal.form.responsible,
      'Liman': ikmal.form.port
    }));
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(rows);
    XLSX.utils.book_append_sheet(wb, ws, 'İkmaller');
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(blob, `gecmis_ikmaller_${new Date().toISOString().slice(0,10)}.xlsx`);
  };

  return (
    <div className="ikmal-modal-overlay">
      <div className="ikmal-modal-card" style={{maxHeight:'90vh', overflowY:'auto', minWidth: 900, minHeight: 600}}>
        <button className="ikmal-modal-close" onClick={onClose}>×</button>
        <h2 style={{marginTop:0, marginBottom:12, color:'#1769aa', fontSize:28}}>Geçmiş İkmaller</h2>
        {selected === null ? (
          <>
            <div style={{display:'flex', alignItems:'center', gap:16, marginBottom:18}}>
              <div style={{flex:1, display:'flex', alignItems:'center', gap:8}}>
                <FaFilter style={{color:'#888'}}/>
                <input
                  type="text"
                  placeholder="Filtrele (gemi, liman, sorumlu, litre, saat)"
                  value={filterText}
                  onChange={e => setFilterText(e.target.value)}
                  style={{padding:'7px 12px', border:'1px solid #d0d0d0', borderRadius:8, fontSize:15, width:280}}
                />
              </div>
              <button className="ikmal-btn ikmal-btn-green" style={{display:'flex', alignItems:'center', gap:7}} onClick={handleExcelExport}>
                <FaDownload/> Excel'e Aktar
              </button>
            </div>
            <table style={{width:'100%', background:'#fff', borderRadius:12, boxShadow:'0 1px 12px #e0e0e0', fontSize:17}}>
              <thead>
                <tr style={{background:'#f7fafc'}}>
                  <th style={{padding:'10px'}}>Gemi İsmi</th>
                  <th>Toplam Litre</th>
                  <th>Saat Aralığı</th>
                  <th>Operasyon Sorumlusu</th>
                  <th>Liman</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filteredIkmaller.length === 0 && (
                  <tr><td colSpan={6} style={{padding:24, textAlign:'center', color:'#aaa'}}>Sonuç bulunamadı.</td></tr>
                )}
                {filteredIkmaller.map((ikmal, idx) => (
                  <tr key={idx} style={{borderBottom:'1px solid #eee', cursor:'pointer', fontSize:17}} onClick={() => setSelected(bitmisIkmaller.indexOf(ikmal))}>
                    <td style={{fontWeight:600}}>{ikmal.form.shipName}</td>
                    <td>{ikmal.form.totalLitre} L</td>
                    <td>
                      <FaClock style={{marginRight:4, color:'#1b7e4b'}}/>
                      {ikmal.form.startTime} - {ikmal.form.estimatedEndTime}
                    </td>
                    <td><FaUserTie style={{marginRight:4, color:'#1769aa'}}/>{ikmal.form.responsible}</td>
                    <td><FaMapMarkerAlt style={{marginRight:4, color:'#f7971e'}}/>{ikmal.form.port}</td>
                    <td><FaChevronRight style={{color:'#aaa'}}/></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        ) : (
          <div style={{padding:28, background:'#f8fafd', borderRadius:14, boxShadow:'0 1px 12px #e0e0e0', fontSize:18}}>
            <button className="ikmal-btn ikmal-btn-blue" onClick={() => setSelected(null)} style={{marginBottom:18, fontSize:16}}>← Geri</button>
            <h3 style={{marginTop:0, color:'#1769aa', fontSize:24}}>
              <FaShip style={{marginRight:10, color:'#43b96e'}}/>{bitmisIkmaller[selected].form.shipName}
            </h3>
            <div style={{marginBottom:16, fontSize:17}}>
              <b>Operasyon Sorumlusu:</b> {bitmisIkmaller[selected].form.responsible}<br/>
              <b>Liman:</b> {bitmisIkmaller[selected].form.port}<br/>
              <b>Saat Aralığı:</b> {bitmisIkmaller[selected].form.startTime} - {bitmisIkmaller[selected].form.estimatedEndTime}<br/>
              <b>Toplam Litre:</b> {bitmisIkmaller[selected].form.totalLitre} L
            </div>
            <h4 style={{margin:'18px 0 10px 0', color:'#1b7e4b', fontSize:18}}>Araç Listesi</h4>
            <table style={{width:'100%', background:'#fff', borderRadius:10, fontSize:16}}>
              <thead>
                <tr style={{background:'#f7fafc'}}>
                  <th>Şoför</th>
                  <th>Çekici</th>
                  <th>Dorse</th>
                  <th>Litre</th>
                </tr>
              </thead>
              <tbody>
                {bitmisIkmaller[selected].form.tankers.map((t, i) => (
                  <tr key={i}>
                    <td>{t.driver}</td>
                    <td>{t.tractor}</td>
                    <td>{t.trailer}</td>
                    <td>{t.litre} L</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default GecmisIkmaller;
