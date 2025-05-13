import React, { useState } from "react";

interface Evrak {
  shipName: string;
  date: string;
  agency: string;
  fileName: string;
  fileUrl: string;
}

const EvraklarModal: React.FC<{ evraklar: Evrak[], onClose: () => void }> = ({ evraklar, onClose }) => {
  const [filter, setFilter] = useState("");
  const filtered = evraklar.filter(evrak =>
    evrak.shipName.toLowerCase().includes(filter.toLowerCase()) ||
    evrak.agency.toLowerCase().includes(filter.toLowerCase()) ||
    evrak.fileName.toLowerCase().includes(filter.toLowerCase())
  );
  return (
    <div className="modal-overlay" style={{zIndex:1000, overflowX:'hidden'}}>
      <div className="modal-card" style={{width:800, maxWidth:'98vw', padding:40, borderRadius:28, overflowX:'hidden', boxSizing:'border-box'}}>
        <button className="modal-close" onClick={onClose} style={{fontSize:30, top:18, right:24, position:'absolute', background:'none', border:'none', cursor:'pointer'}}>×</button>
        <div className="modal-title" style={{fontSize:32, fontWeight:800, textAlign:'center', marginBottom:8}}>Evraklar</div>
        <div className="modal-desc" style={{fontSize:18, textAlign:'center', marginBottom:24}}>Yüklenen tüm evrakları ve hangi ikmale ait olduklarını görüntüleyin.</div>
        <input
          style={{width:'100%', padding:'12px 16px', borderRadius:8, border:'1px solid #d3e0ea', fontSize:18, marginBottom:18, outline:'none', boxSizing:'border-box'}}
          placeholder="Gemi, Acente veya Evrak adı ile filtrele..."
          value={filter}
          onChange={e => setFilter(e.target.value)}
        />
        <div style={{
          width: '100%',
          maxHeight: filtered.length > 7 ? 440 : 'none',
          overflowY: filtered.length > 7 ? 'auto' : 'visible',
          overflowX: 'hidden',
          marginBottom: 8,
          borderRadius: 12,
          background: '#fff',
          boxSizing: 'border-box'
        }}>
          <table style={{width:"100%", borderRadius:12, fontSize:18, background:'#fff'}}>
            <thead>
              <tr style={{background:"#eaf4fd", fontSize:19}}>
                <th style={{padding:'12px 8px'}}>Gemi</th>
                <th style={{padding:'12px 8px'}}>Tarih</th>
                <th style={{padding:'12px 8px'}}>Acente</th>
                <th style={{padding:'12px 8px'}}>Evrak Adı</th>
                <th style={{padding:'12px 8px'}}>İndir</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{textAlign:'center', padding:32, color:'#888'}}>Sonuç bulunamadı.</td>
                </tr>
              ) : filtered.map((evrak, i) => (
                <tr key={i}>
                  <td style={{padding:'10px 8px'}}>{evrak.shipName}</td>
                  <td style={{padding:'10px 8px'}}>{evrak.date}</td>
                  <td style={{padding:'10px 8px'}}>{evrak.agency}</td>
                  <td style={{padding:'10px 8px', wordBreak:'break-word'}}>{evrak.fileName}</td>
                  <td style={{padding:'10px 8px'}}>
                    <a href={evrak.fileUrl} download style={{color:"#1769aa", fontWeight:600, fontSize:17}}>İndir</a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default EvraklarModal;
