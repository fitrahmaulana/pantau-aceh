-- ============================================
-- SQL UNTUK SUPABASE - KALKULATOR BBM ACEH
-- Jalankan di Supabase Dashboard > SQL Editor
-- ============================================

-- 1. Table untuk data SPBU
CREATE TABLE IF NOT EXISTS spbu (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  kode VARCHAR(20) UNIQUE NOT NULL,
  nama VARCHAR(100) NOT NULL,
  alamat TEXT,
  kota VARCHAR(50),
  lat DECIMAL(10, 6),
  lng DECIMAL(10, 6),
  buka_24_jam BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Table untuk laporan antrian (dari masyarakat)
CREATE TABLE IF NOT EXISTS laporan_antrian (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  spbu_id UUID REFERENCES spbu(id) ON DELETE CASCADE,
  jumlah_motor INT NOT NULL,
  estimasi_menit INT,
  traffic_status VARCHAR(20) DEFAULT 'ramai',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. View untuk ambil data terbaru per SPBU
CREATE OR REPLACE VIEW spbu_realtime AS
SELECT 
  s.id,
  s.kode,
  s.nama,
  s.alamat,
  s.kota,
  s.lat,
  s.lng,
  s.buka_24_jam,
  s.created_at,
  COALESCE(l.jumlah_motor, 0) as antrian_motor,
  COALESCE(l.estimasi_menit, 0) as estimasi_menit,
  COALESCE(l.traffic_status, 'unknown') as traffic_status,
  l.created_at as update_terakhir
FROM spbu s
LEFT JOIN LATERAL (
  SELECT * FROM laporan_antrian 
  WHERE spbu_id = s.id 
  ORDER BY created_at DESC 
  LIMIT 1
) l ON true;

-- 4. Enable Row Level Security
ALTER TABLE spbu ENABLE ROW LEVEL SECURITY;
ALTER TABLE laporan_antrian ENABLE ROW LEVEL SECURITY;

-- 5. Policies: Semua orang bisa baca
CREATE POLICY "Public read spbu" ON spbu 
  FOR SELECT USING (true);

CREATE POLICY "Public read laporan" ON laporan_antrian 
  FOR SELECT USING (true);

-- 6. Policy: Semua orang bisa insert laporan (crowdsource)
CREATE POLICY "Public insert laporan" ON laporan_antrian 
  FOR INSERT WITH CHECK (true);

-- 7. Insert data SPBU Aceh
INSERT INTO spbu (kode, nama, alamat, kota, lat, lng, buka_24_jam) VALUES
  ('14.201.102', 'SPBU 14.201.102', 'Jl. T. Nyak Arief, Darussalam', 'Banda Aceh', 5.5685, 95.3493, true),
  ('14.201.105', 'SPBU 14.201.105', 'Jl. T. Iskandar, Ulee Kareng', 'Banda Aceh', 5.5451, 95.3371, true),
  ('14.201.108', 'SPBU 14.201.108', 'Jl. Soekarno Hatta, Lampeuneurut', 'Aceh Besar', 5.5234, 95.3789, false),
  ('14.201.115', 'SPBU 14.201.115', 'Jl. Banda Aceh - Meulaboh, Lhoknga', 'Aceh Besar', 5.4732, 95.2418, true),
  ('14.201.120', 'SPBU 14.201.120', 'Jl. Medan - Banda Aceh, Lambaro', 'Aceh Besar', 5.5123, 95.4012, true),
  ('14.201.125', 'SPBU 14.201.125', 'Jl. Teuku Umar, Setui', 'Banda Aceh', 5.5567, 95.3234, true)
ON CONFLICT (kode) DO NOTHING;

-- 8. Enable realtime untuk laporan_antrian
-- (Ini akan membuat data update secara realtime)
ALTER PUBLICATION supabase_realtime ADD TABLE laporan_antrian;
