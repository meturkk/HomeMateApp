from models import PersonalityScore, User

# Her bir karakter özelliği için 5 soru soruyoruz.
# İndeks aralıkları:
# 0-4: Dışa Dönüklük (Extraversion)
# 5-9: Uyumluluk (Agreeableness)
# 10-14: Sorumluluk / Düzen (Conscientiousness)
# 15-19: Nevrotiklik / Duygusal Denge (Neuroticism)
# 20-24: Yeniliklere Açıklık (Openness)

# Psikolojik testlerde bazı sorular negatif/ters puanlıdır (Örn: "Dağınık biriyimdir").
# Gerçekçilik için her boyuttaki 2. ve 4. soruların ters puanlandığını varsayıyoruz.
REVERSE_SCORED = {1, 3, 6, 8, 11, 13, 16, 18, 21, 23}

class PersonalityAnalyzer:
    def __init__(self):
        pass

    def calculate_score(self, answers: list[int]) -> PersonalityScore:
        if len(answers) != 25:
            raise ValueError("Exactly 25 answers are required.")

        scored_answers = []
        for i, ans in enumerate(answers):
            if i in REVERSE_SCORED:
                # Ters puanlama: 1 -> 5, 2 -> 4, 3 -> 3, 4 -> 2, 5 -> 1
                scored_answers.append(6 - ans)
            else:
                scored_answers.append(ans)

        # Her boyutun maksimum puanı 25 (5 soru * 5 puan).
        # Sonuçları 0-100 arasına (yüzdelik dilime) normalize ediyoruz.
        e_score = sum(scored_answers[0:5]) / 25 * 100
        a_score = sum(scored_answers[5:10]) / 25 * 100
        c_score = sum(scored_answers[10:15]) / 25 * 100
        n_score = sum(scored_answers[15:20]) / 25 * 100
        o_score = sum(scored_answers[20:25]) / 25 * 100

        return PersonalityScore(
            extraversion=e_score,
            agreeableness=a_score,
            conscientiousness=c_score,
            neuroticism=n_score,
            openness=o_score
        )

    def analyze_user(self, user: User):
        user.score = self.calculate_score(user.answers)
        return user
