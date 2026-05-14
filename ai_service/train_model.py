import pandas as pd
from sklearn.cluster import KMeans
import joblib
import os
import time

def train():
    print("Eğitim başlatılıyor...")
    start_time = time.time()
    
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))
    csv_path = os.path.join(BASE_DIR, "archive", "IPIP-FFM-data-8Nov2018", "data-final.csv")
    if not os.path.exists(csv_path):
        raise FileNotFoundError(f"Veri seti bulunamadı: {csv_path}")

    # Bellek tasarrufu ve sadece ihtiyacımız olan 25 soruyu okumak için sütunları seçiyoruz.
    # Kullanıcıdan da bu 25 soru (1-5 arası) istenecek.
    columns_to_use = [
        'EXT1', 'EXT2', 'EXT3', 'EXT4', 'EXT5',  # Dışa Dönüklük
        'AGR1', 'AGR2', 'AGR3', 'AGR4', 'AGR5',  # Uyumluluk
        'CSN1', 'CSN2', 'CSN3', 'CSN4', 'CSN5',  # Sorumluluk
        'EST1', 'EST2', 'EST3', 'EST4', 'EST5',  # Nevrotiklik (Emotional Stability)
        'OPN1', 'OPN2', 'OPN3', 'OPN4', 'OPN5'   # Açıklık
    ]
    
    print("Veri seti yükleniyor... (Bu işlem biraz sürebilir, tahmini 10-20 saniye)")
    df = pd.read_csv(csv_path, usecols=columns_to_use, sep='\t')
    print(f"Toplam okunan satır sayısı: {len(df)}")
    
    # Eksik verileri veya 0 olan hatalı cevapları temizliyoruz.
    df = df.dropna()
    # Veri setinde bazen 0 değeri olabiliyor, oysa test 1-5 arası. 0 olanları atıyoruz.
    df = df[(df > 0).all(axis=1) & (df <= 5).all(axis=1)]
    print(f"Hatalı/Eksik cevaplar temizlendikten sonra kalan satır sayısı: {len(df)}")

    # Önerdiğimiz gibi 10 Farklı Karakter Tipine (Cluster) böleceğiz.
    n_clusters = 10
    print(f"\nK-Means algoritması {n_clusters} farklı karakter tipini (Persona) öğreniyor...")
    
    kmeans = KMeans(n_clusters=n_clusters, random_state=42, n_init=10)
    kmeans.fit(df)
    
    print("Eğitim başarıyla tamamlandı!")
    
    # Eğitilen modeli dosyaya kaydediyoruz
    model_path = os.path.join(BASE_DIR, "ai_model.pkl")
    joblib.dump(kmeans, model_path)
    print(f"Model '{model_path}' olarak kaydedildi.")
    
    end_time = time.time()
    print(f"Toplam geçen süre: {round(end_time - start_time, 2)} saniye")

if __name__ == '__main__':
    train()
