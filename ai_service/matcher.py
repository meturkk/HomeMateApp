import math
from models import User

class RoommateMatcher:
    def __init__(self):
        # Ev arkadaşı için bazı özelliklerin uyumu diğerlerinden daha önemli olabilir.
        # Ağırlıkları (weights) burada belirliyoruz.
        self.weights = {
            'conscientiousness': 2.0,  # Temizlik/Düzen uyumu en kritik
            'agreeableness': 1.5,      # Geçimlilik önemli
            'openness': 1.0,           # Yeniliklere açıklık normal düzey
            'extraversion': 1.0,       # Dışa dönüklük normal düzey
            'neuroticism': 0.5         # Nevrotiklikte zıtlık çok sorun yaratmayabilir
        }
        
    def calculate_compatibility(self, user1: User, user2: User) -> float:
        if not user1.score or not user2.score:
            raise ValueError("Kullanıcılar eşleştirilmeden önce analiz edilmelidir.")
            
        s1 = user1.score
        s2 = user2.score
        
        # Ağırlıklı Öklid Uzaklığı (Weighted Euclidean Distance) hesaplaması
        diffs = [
            (s1.conscientiousness - s2.conscientiousness) ** 2 * self.weights['conscientiousness'],
            (s1.agreeableness - s2.agreeableness) ** 2 * self.weights['agreeableness'],
            (s1.openness - s2.openness) ** 2 * self.weights['openness'],
            (s1.extraversion - s2.extraversion) ** 2 * self.weights['extraversion'],
            (s1.neuroticism - s2.neuroticism) ** 2 * self.weights['neuroticism']
        ]
        
        distance = math.sqrt(sum(diffs))
        
        # Teorik olarak alınabilecek maksimum mesafe (iki kişi 0 ve 100 alıp ağırlıklarla çarpılırsa)
        max_dist_squared = sum([(100 ** 2) * w for w in self.weights.values()])
        max_distance = math.sqrt(max_dist_squared)
        
        # Uzaklığı (0-100) arası yüzdelik bir uyum skoruna çeviriyoruz
        compatibility = 100 * (1 - (distance / max_distance))
        return round(compatibility, 2)
