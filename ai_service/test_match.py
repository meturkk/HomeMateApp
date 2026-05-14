from models import User
from analyzer import PersonalityAnalyzer
from matcher import RoommateMatcher

def main():
    analyzer = PersonalityAnalyzer()
    matcher = RoommateMatcher()
    
    # 25 soruluk rastgele cevaplar (1-5 arası puanlama)
    
    # Kullanıcı 1: Düzenli, geçimli, biraz içe dönük
    user1_answers = [
        2, 4, 1, 3, 2,  # E (Düşük/Orta Dışa dönük)
        5, 2, 4, 1, 5,  # A (Yüksek Uyumluluk)
        5, 1, 5, 2, 4,  # C (Yüksek Sorumluluk/Düzen)
        3, 3, 3, 3, 3,  # N (Orta)
        3, 3, 3, 3, 3   # O (Orta)
    ]
    
    # Kullanıcı 2: Düzenli, geçimli (Kullanıcı 1 ile benzer karakterde)
    user2_answers = [
        2, 3, 2, 3, 2,  
        4, 2, 4, 2, 4,  
        5, 2, 4, 2, 5,  
        3, 3, 2, 3, 3,  
        4, 3, 3, 3, 4   
    ]

    # Kullanıcı 3: Dağınık, başına buyruk (Kullanıcı 1 ile zıt karakterde)
    user3_answers = [
        5, 1, 4, 2, 5,  
        2, 4, 1, 5, 2,  
        1, 5, 1, 5, 1,  
        4, 2, 5, 1, 4,  
        2, 4, 2, 4, 2   
    ]

    u1 = User(1, "Emin", user1_answers)
    u2 = User(2, "Ahmet (Benzer)", user2_answers)
    u3 = User(3, "Mehmet (Zıt)", user3_answers)

    analyzer.analyze_user(u1)
    analyzer.analyze_user(u2)
    analyzer.analyze_user(u3)

    print("--- Kullanici Skorlari ---")
    print(f"{u1.name} -> Sorumluluk: {u1.score.conscientiousness}%, Uyumluluk: {u1.score.agreeableness}%")
    print(f"{u2.name} -> Sorumluluk: {u2.score.conscientiousness}%, Uyumluluk: {u2.score.agreeableness}%")
    print(f"{u3.name} -> Sorumluluk: {u3.score.conscientiousness}%, Uyumluluk: {u3.score.agreeableness}%")
    print("\n--- Eslesme Sonuclari ---")
    
    comp1_2 = matcher.calculate_compatibility(u1, u2)
    print(f"{u1.name} ile {u2.name} Uyumu: %{comp1_2}")

    comp1_3 = matcher.calculate_compatibility(u1, u3)
    print(f"{u1.name} ile {u3.name} Uyumu: %{comp1_3}")

if __name__ == "__main__":
    main()
