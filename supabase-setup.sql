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
-- WILAYAH SYIAH KUALA & KUTA ALAM (TIMUR/PUSAT)
('14.239.405', 'SPBU Lingke', 'Jl. Teuku Nyak Arief, Gp. Jeulingke, Kec. Syiah Kuala', 'Banda Aceh', 5.5723779, 95.3438157, FALSE),
('14.201.102', 'SPBU Lamnyong', 'Jl. Teuku Nyak Arief, Gp. Lamgugob, Kec. Syiah Kuala', 'Banda Aceh', 5.5765714, 95.3550906, FALSE),
('14.231.482', 'SPBU Kuta Alam', 'Jl. T. Panglima Polem, Gp. Bandar Baru, Kec. Kuta Alam', 'Banda Aceh', 5.5560478, 95.3284999, TRUE), -- Buka 24 Jam
('14.239.482', 'SPBU Kampong Mulia', 'Jl. Twk. Hasyim Banta Muda, Gp. Mulia, Kec. Kuta Alam', 'Banda Aceh', 5.5634748, 95.3235100, FALSE),
('14.231.457', 'SPBU Lambhuk', 'Jl. Teuku Iskandar, Gp. Lambhuk, Kec. Ulee Kareng', 'Banda Aceh', 5.5536559, 95.3371862, FALSE),

-- WILAYAH BAITURRAHMAN & LUENG BATA (SELATAN/PUSAT)
('14.239.420', 'SPBU Simpang Jam', 'Jl. Teuku Umar, Gp. Sukaramai, Kec. Baiturrahman', 'Banda Aceh', 5.5473308, 95.3160474, FALSE),
('14.231.484', 'SPBU Batoh', 'Jl. Dr. Mr. Mohd Hasan, Gp. Batoh, Kec. Lueng Bata', 'Banda Aceh', 5.5350583, 95.3307815, FALSE),
('14.232.485', 'SPBU Lueng Bata', 'Jl. Banda Aceh - Medan, Gp. Lueng Bata, Kec. Lueng Bata', 'Banda Aceh', 5.5353961, 95.3427806, FALSE),

-- WILAYAH BARAT (MEURAXA & KUTA RAJA)
('13.231.408', 'SPBU Lampaseh', 'Jl. Rama Setia, Gp. Lampaseh Kota, Kec. Kuta Raja', 'Banda Aceh', 5.5583180, 95.2390100, FALSE), -- Koordinat dikoreksi ke Barat
('14.232.448', 'SPBU Ulee Lheue', 'Jl. Sultan Iskandar Muda, Gp. Ulee Lheue, Kec. Meuraxa', 'Banda Aceh', 5.5289200, 95.2234891, FALSE),

-- WILAYAH ACEH BESAR & PERBATASAN
('14.233.463', 'SPBU Cot Iri', 'Jl. Teuku Iskandar, Gp. Meunasah Intan, Kec. Krueng Barona Jaya', 'Aceh Besar', 5.5422064, 95.3676585, FALSE),
('15.233.023', 'SPBU Lamnga', 'Jl. Laksamana Malahayati, Gp. Lamnga, Kec. Mesjid Raya', 'Aceh Besar', 5.6221476, 95.3989092, FALSE), -- Jauh di Timur
('14.239.410', 'SPBU Lampeuneurot', 'Jl. Soekarno Hatta, Gp. Lampeuneurot, Kec. Darul Imarah', 'Aceh Besar', 5.5182400, 95.3155277, FALSE),
('14.231.462', 'SPBU Mibo', 'Jl. Soekarno Hatta, Gp. Mibo, Kec. Banda Raya', 'Banda Aceh', 5.5181011, 95.3154456, FALSE), -- Berdekatan dengan Lampeuneurot
('13.233.404', 'SPBU Lamsayeun', 'Jl. Soekarno - Hatta, Gp. Meunasah Manyet, Kec. Ingin Jaya', 'Aceh Besar', 5.5100093, 95.3476736, FALSE),
('14.233.458', 'SPBU Pagar Air', 'Jl. Banda Aceh - Medan, Gp. Santan, Kec. Ingin Jaya', 'Aceh Besar', 5.5271335, 95.3625273, FALSE),
('14.233.401', 'SPBU Aneuk Galong', 'Jl. Banda Aceh - Medan KM 14, Gp. Aneuk Galong Titi, Kec. Sukamakmur', 'Aceh Besar', 5.4744073, 95.3901776, FALSE)
ON CONFLICT (kode) DO NOTHING;




-- 8. Enable realtime untuk laporan_antrian
-- (Ini akan membuat data update secara realtime)
ALTER PUBLICATION supabase_realtime ADD TABLE laporan_antrian;
