#!/usr/bin/env python3
"""
Türkiye İl, İlçe ve Mahalle Verilerini MySQL Veritabanına Aktarma Betiği
=========================================================================
GitHub'daki emreuenal/turkiye-il-ilce-sokak-mahalle-veri-tabani deposundan
MySQL dump dosyasını indirip parse eder ve homemate_db veritabanına aktarır.
Sokak verileri tamamen yok sayılır.
"""

import urllib.request
import zipfile
import os
import re
import sys
import tempfile

# Windows konsolunda encoding sorununu coz
sys.stdout.reconfigure(encoding='utf-8', errors='replace')
sys.stderr.reconfigure(encoding='utf-8', errors='replace')

# --- Sabitler ---
DUMP_URL = "https://github.com/emreuenal/turkiye-il-ilce-sokak-mahalle-veri-tabani/raw/master/dumps/tr_adres_mysql_11052020.sql.zip"
DB_CONFIG = {
    "host": "localhost",
    "port": 3306,
    "user": "[USERNAME]",
    "password": "[PASSWORD]",
    "database": "homemate_db",
    "charset": "utf8mb4",
}


def download_and_extract(url, dest_dir):
    """ZIP dosyasını indirir ve çıkarır, SQL dosyasının yolunu döndürür."""
    zip_path = os.path.join(dest_dir, "dump.zip")
    print(f"📥 SQL dump indiriliyor: {url}")
    urllib.request.urlretrieve(url, zip_path)
    print(f"✅ İndirme tamamlandı ({os.path.getsize(zip_path) / 1024 / 1024:.1f} MB)")

    print("📦 ZIP arşivi açılıyor...")
    with zipfile.ZipFile(zip_path, "r") as zf:
        zf.extractall(dest_dir)
        sql_files = [f for f in zf.namelist() if f.endswith(".sql")]
        if not sql_files:
            raise FileNotFoundError("ZIP arşivinde .sql dosyası bulunamadı!")
        sql_path = os.path.join(dest_dir, sql_files[0])
        print(f"✅ SQL dosyası çıkarıldı: {sql_files[0]}")
        return sql_path


def parse_inserts(sql_path):
    """
    SQL dosyasını satır satır okuyarak iller, ilceler ve mahalleler
    INSERT satırlarından verileri ayrıştırır. sokaklar tablosunu tamamen atlar.
    """
    cities = []        # (il_id, il_adi)
    districts = []     # (ilce_id, ilce_adi, il_id)
    neighborhoods = [] # (mahalle_id, mahalle_adi, ilce_id)

    # Regex: INSERT INTO `tablo_adi` VALUES (...);
    # Her VALUES bloğunda parantez içindeki değerleri yakalar
    value_pattern = re.compile(r"\(([^)]+)\)")

    current_table = None
    skip_table = False
    line_count = 0

    print("🔍 SQL dosyası ayrıştırılıyor (sokaklar atlanacak)...")

    with open(sql_path, "r", encoding="utf-8") as f:
        for line in f:
            line_count += 1
            stripped = line.strip()

            # Hangi tabloya ait INSERT olduğunu belirle
            if stripped.upper().startswith("INSERT INTO"):
                lower = stripped.lower()
                if "`sokaklar`" in lower or "sokaklar" in lower.split("insert into")[1].split("(")[0]:
                    skip_table = True
                    continue
                elif "`iller`" in lower:
                    current_table = "iller"
                    skip_table = False
                elif "`ilceler`" in lower:
                    current_table = "ilceler"
                    skip_table = False
                elif "`mahalleler`" in lower:
                    current_table = "mahalleler"
                    skip_table = False
                else:
                    skip_table = True
                    continue
            elif stripped.upper().startswith("CREATE TABLE") or stripped.upper().startswith("DROP TABLE"):
                if "sokaklar" in stripped.lower():
                    skip_table = True
                continue
            else:
                if not stripped.startswith("(") and current_table is None:
                    continue

            if skip_table:
                continue

            # VALUES satırlarını parse et
            matches = value_pattern.findall(stripped)
            for match in matches:
                # Virgülle ayır ama tek tırnak içindeki virgülleri yok say
                parts = []
                in_quote = False
                current = []
                for ch in match:
                    if ch == "'" and (not current or current[-1] != "\\"):
                        in_quote = not in_quote
                        current.append(ch)
                    elif ch == "," and not in_quote:
                        parts.append("".join(current).strip())
                        current = []
                    else:
                        current.append(ch)
                if current:
                    parts.append("".join(current).strip())

                # Tırnak işaretlerini temizle
                clean = []
                for p in parts:
                    p = p.strip()
                    if p.startswith("'") and p.endswith("'"):
                        p = p[1:-1]
                    clean.append(p)

                try:
                    if current_table == "iller" and len(clean) >= 2:
                        # il_id, il_adi
                        cities.append((int(clean[0]), clean[1]))
                    elif current_table == "ilceler" and len(clean) >= 4:
                        # ilce_id, ilce_adi, il_id, il_adi
                        districts.append((int(clean[0]), clean[1], int(clean[2])))
                    elif current_table == "mahalleler" and len(clean) >= 6:
                        # mahalle_id, mahalle_adi, ilce_id, ilce_adi, il_id, il_adi
                        neighborhoods.append((int(clean[0]), clean[1], int(clean[2])))
                except (ValueError, IndexError):
                    continue

    print(f"📊 Ayrıştırma tamamlandı:")
    print(f"   İller:      {len(cities)}")
    print(f"   İlçeler:    {len(districts)}")
    print(f"   Mahalleler: {len(neighborhoods)}")
    return cities, districts, neighborhoods


def import_to_mysql(cities, districts, neighborhoods):
    """Verileri MySQL veritabanına toplu olarak aktarır."""
    try:
        import mysql.connector
    except ImportError:
        print("❌ mysql-connector-python modülü bulunamadı. Yükleniyor...")
        os.system(f"{sys.executable} -m pip install mysql-connector-python")
        import mysql.connector

    print(f"\n🔌 MySQL veritabanına bağlanılıyor ({DB_CONFIG['host']}:{DB_CONFIG['port']}/{DB_CONFIG['database']})...")
    conn = mysql.connector.connect(**DB_CONFIG)
    cursor = conn.cursor()

    # Foreign key kontrollerini geçici olarak devre dışı bırak
    cursor.execute("SET FOREIGN_KEY_CHECKS = 0;")
    cursor.execute("SET NAMES utf8mb4;")

    # --- 1) cities tablosu ---
    print("\n[CITIES] Iller (cities) tablosu temizlenip dolduruluyor...")
    # Önce mevcut verileri sil (tablolar yoksa atla)
    for table in ["neighborhoods", "ad_photos", "favorites", "ads", "districts", "cities"]:
        try:
            cursor.execute(f"DELETE FROM {table}")
            conn.commit()
        except Exception:
            conn.rollback()

    # cities tablosuna ekle
    city_sql = "INSERT INTO cities (id, name) VALUES (%s, %s)"
    cursor.executemany(city_sql, cities)
    conn.commit()
    print(f"   [OK] {len(cities)} il eklendi.")

    # --- 2) districts tablosu ---
    print("🗺️  İlçeler (districts) tablosu dolduruluyor...")
    district_sql = "INSERT INTO districts (id, name, city_id) VALUES (%s, %s, %s)"
    # Batch insert (her 500 kayıtta bir commit)
    batch_size = 500
    for i in range(0, len(districts), batch_size):
        batch = districts[i:i + batch_size]
        cursor.executemany(district_sql, batch)
        conn.commit()
    print(f"   ✅ {len(districts)} ilçe eklendi.")

    # --- 3) neighborhoods tablosu ---
    print("📍 Mahalleler (neighborhoods) tablosu dolduruluyor...")

    # neighborhoods tablosu henüz yoksa oluştur
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS neighborhoods (
            id BIGINT NOT NULL PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            district_id BIGINT NOT NULL,
            CONSTRAINT fk_neighborhood_district FOREIGN KEY (district_id) REFERENCES districts(id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    """)
    conn.commit()

    neighborhood_sql = "INSERT INTO neighborhoods (id, name, district_id) VALUES (%s, %s, %s)"
    total = len(neighborhoods)
    batch_size = 2000
    for i in range(0, total, batch_size):
        batch = neighborhoods[i:i + batch_size]
        cursor.executemany(neighborhood_sql, batch)
        conn.commit()
        progress = min(i + batch_size, total)
        print(f"   ... {progress}/{total} mahalle eklendi ({progress * 100 // total}%)")
    print(f"   ✅ {total} mahalle eklendi.")

    # Foreign key kontrollerini tekrar aç
    cursor.execute("SET FOREIGN_KEY_CHECKS = 1;")
    conn.commit()

    cursor.close()
    conn.close()
    print("\n🎉 Tüm veriler başarıyla MySQL veritabanına aktarıldı!")


def main():
    print("=" * 60)
    print("🇹🇷 Türkiye Adres Veri Tabanı İçe Aktarma")
    print("=" * 60)

    with tempfile.TemporaryDirectory() as tmpdir:
        # 1. İndir ve çıkar
        sql_path = download_and_extract(DUMP_URL, tmpdir)

        # 2. SQL dosyasını parse et
        cities, districts, neighborhoods = parse_inserts(sql_path)

        if not cities:
            print("❌ Hiç il verisi bulunamadı! SQL dosyası formatı beklenenden farklı olabilir.")
            sys.exit(1)

        # 3. MySQL'e aktar
        import_to_mysql(cities, districts, neighborhoods)

    print("\n✨ İşlem tamamlandı!")


if __name__ == "__main__":
    main()
