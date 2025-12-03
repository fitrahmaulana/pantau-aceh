-- ============================================
-- TABEL CROWDSOURCE INFO
-- Jalankan di Supabase SQL Editor
-- ============================================

-- 1. TABEL INFO LISTRIK
CREATE TABLE IF NOT EXISTS info_listrik (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kota TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('hidup', 'padam')),
  keterangan TEXT,
  reporter_name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index untuk query cepat
CREATE INDEX idx_info_listrik_kota ON info_listrik(kota);
CREATE INDEX idx_info_listrik_created ON info_listrik(created_at DESC);

-- Enable RLS
ALTER TABLE info_listrik ENABLE ROW LEVEL SECURITY;

-- Policy: Semua orang bisa read
CREATE POLICY "Public read info_listrik" ON info_listrik
  FOR SELECT USING (true);

-- Policy: Semua orang bisa insert (anonymous)
CREATE POLICY "Public insert info_listrik" ON info_listrik
  FOR INSERT WITH CHECK (true);

-- 2. TABEL INFO ELPIJI
CREATE TABLE IF NOT EXISTS info_elpiji (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kota TEXT NOT NULL,
  lokasi TEXT NOT NULL,
  jenis TEXT NOT NULL CHECK (jenis IN ('3kg', '5.5kg', '12kg')),
  status TEXT NOT NULL CHECK (status IN ('tersedia', 'langka', 'kosong')),
  harga INTEGER,
  reporter_name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index untuk query cepat
CREATE INDEX idx_info_elpiji_kota ON info_elpiji(kota);
CREATE INDEX idx_info_elpiji_created ON info_elpiji(created_at DESC);

-- Enable RLS
ALTER TABLE info_elpiji ENABLE ROW LEVEL SECURITY;

-- Policy: Semua orang bisa read
CREATE POLICY "Public read info_elpiji" ON info_elpiji
  FOR SELECT USING (true);

-- Policy: Semua orang bisa insert
CREATE POLICY "Public insert info_elpiji" ON info_elpiji
  FOR INSERT WITH CHECK (true);

-- 3. TABEL INFO SPBU (stok BBM, harga eceran, dll)
CREATE TABLE IF NOT EXISTS info_spbu (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  spbu_nama TEXT NOT NULL,
  spbu_kota TEXT NOT NULL,
  jenis_bbm TEXT NOT NULL CHECK (jenis_bbm IN ('pertalite', 'pertamax', 'solar', 'dexlite')),
  status TEXT NOT NULL CHECK (status IN ('tersedia', 'menipis', 'habis')),
  harga_eceran INTEGER,
  keterangan TEXT,
  reporter_name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index untuk query cepat
CREATE INDEX idx_info_spbu_kota ON info_spbu(spbu_kota);
CREATE INDEX idx_info_spbu_created ON info_spbu(created_at DESC);

-- Enable RLS
ALTER TABLE info_spbu ENABLE ROW LEVEL SECURITY;

-- Policy: Semua orang bisa read
CREATE POLICY "Public read info_spbu" ON info_spbu
  FOR SELECT USING (true);

-- Policy: Semua orang bisa insert
CREATE POLICY "Public insert info_spbu" ON info_spbu
  FOR INSERT WITH CHECK (true);

-- ============================================
-- ENABLE REALTIME untuk semua tabel
-- ============================================
ALTER PUBLICATION supabase_realtime ADD TABLE info_listrik;
ALTER PUBLICATION supabase_realtime ADD TABLE info_elpiji;
ALTER PUBLICATION supabase_realtime ADD TABLE info_spbu;

-- ============================================
-- VIEW: Ringkasan status terbaru per kota (opsional)
-- ============================================
CREATE OR REPLACE VIEW v_listrik_terbaru AS
SELECT DISTINCT ON (kota) *
FROM info_listrik
ORDER BY kota, created_at DESC;

CREATE OR REPLACE VIEW v_elpiji_terbaru AS
SELECT DISTINCT ON (kota, jenis) *
FROM info_elpiji
ORDER BY kota, jenis, created_at DESC;
