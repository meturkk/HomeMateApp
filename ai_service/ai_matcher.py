import joblib
import numpy as np
import math
import os
import warnings
from models import User

# scikit-learn feature names uyarısını bastır
warnings.filterwarnings("ignore", message=".*X does not have valid feature names.*")

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DEFAULT_MODEL_PATH = os.path.join(BASE_DIR, "ai_model.pkl")

class AIRoommateMatcher:
    def __init__(self, model_path=DEFAULT_MODEL_PATH):
        try:
            self.model = joblib.load(model_path)
            self.centroids = self.model.cluster_centers_
            self.is_ready = True
        except FileNotFoundError:
            self.is_ready = False
            print("HATA: ai_model.pkl bulunamadı. Lütfen önce train_model.py çalıştırın.")

    def assign_persona(self, user: User) -> int:
        if not self.is_ready:
            return -1
        
        # Kullanıcının 25 cevabını modelin beklediği formata (2B dizi) getiriyoruz
        answers_array = np.array(user.answers).reshape(1, -1)
        
        # Kullanıcının ait olduğu kümeyi (0-9 arası Persona ID) tahmin et
        persona_id = self.model.predict(answers_array)[0]
        return persona_id

    def calculate_compatibility(self, persona_id_1: int, persona_id_2: int) -> float:
        """
        İki farklı Persona'nın merkez noktaları (centroid) arasındaki mesafeyi ölçerek
        ne kadar benzer veya zıt karakterler olduklarını bulur.
        """
        if not self.is_ready:
            return 0.0

        centroid_1 = self.centroids[persona_id_1]
        centroid_2 = self.centroids[persona_id_2]
        
        # İki karakter tipi arasındaki matematiksel mesafe
        distance = np.linalg.norm(centroid_1 - centroid_2)
        
        # 25 sorunun her birinden max 4 puan fark çıkabilir (5-1)
        # Maksimum teorik uzaklık (25 boyutlu uzayda) = sqrt(25 * (4^2)) = sqrt(400) = 20
        max_distance = 20.0
        
        # 0 - 100 arası uyum puanına çevir: 
        # (Uzaklık azaldıkça uyum artar. Benzer karakterler yüksek puan alır)
        compatibility = 100 * (1 - (distance / max_distance))
        
        # Uyum puanını 0'ın altına düşmemesi için sınırla
        compatibility = max(0.0, compatibility)
        
        return round(compatibility, 2)
