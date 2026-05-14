from models import User
from ai_matcher import AIRoommateMatcher

def main():
    print("Yapay Zeka Modeli Yükleniyor...")
    ai_matcher = AIRoommateMatcher()
    
    if not ai_matcher.is_ready:
        return

    # Önceki testimizdeki 3 kullanıcı
    user1_answers = [
        2, 4, 1, 3, 2,  
        5, 2, 4, 1, 5,  
        5, 1, 5, 2, 4,  
        3, 3, 3, 3, 3,  
        3, 3, 3, 3, 3   
    ]
    user2_answers = [
        2, 3, 2, 3, 2,  
        4, 2, 4, 2, 4,  
        5, 2, 4, 2, 5,  
        3, 3, 2, 3, 3,  
        4, 3, 3, 3, 4   
    ]
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

    # 1. Aşama: Yapay Zeka kişileri 1 Milyonluk veri setinden öğrendiği 10 Karakter Tipine (Persona) atıyor.
    p1 = ai_matcher.assign_persona(u1)
    p2 = ai_matcher.assign_persona(u2)
    p3 = ai_matcher.assign_persona(u3)

    print("\n--- AI Persona Atamaları ---")
    print(f"{u1.name} -> Persona Tip-{p1}")
    print(f"{u2.name} -> Persona Tip-{p2}")
    print(f"{u3.name} -> Persona Tip-{p3}")

    # 2. Aşama: İki karakter tipinin (Persona'nın) ne kadar uyumlu olduğunu hesaplama
    print("\n--- AI Ev Arkadaşı Uyum Sonuçları ---")
    comp1_2 = ai_matcher.calculate_compatibility(p1, p2)
    print(f"{u1.name} (Tip-{p1}) ile {u2.name} (Tip-{p2}) Uyumu: %{comp1_2}")

    comp1_3 = ai_matcher.calculate_compatibility(p1, p3)
    print(f"{u1.name} (Tip-{p1}) ile {u3.name} (Tip-{p3}) Uyumu: %{comp1_3}")

if __name__ == "__main__":
    main()
