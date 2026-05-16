from flask import Flask, request, jsonify
from ai_matcher import AIRoommateMatcher
from analyzer import PersonalityAnalyzer
from models import User

app = Flask(__name__)

# Modeli ve analizciyi uygulama başlangıcında yükle
matcher = AIRoommateMatcher()
analyzer = PersonalityAnalyzer()

@app.route('/predict', methods=['POST'])
def predict():
    """
    Frontend'den gelen 25 cevabı alır, K-Means ile Persona ID tahmin eder
    ve Big Five skorlarını hesaplar.
    
    İstek: { "q1": 4, "q2": 3, ..., "q25": 5 }
    Yanıt: { "persona_id": 3, "scores": { "extraversion": 72.0, ... } }
    """
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({"error": "Cevaplar gönderilmedi."}), 400
        
        # q1...q25 formatındaki cevapları sıralı listeye çevir
        answers = []
        for i in range(1, 26):
            key = f"q{i}"
            if key not in data:
                return jsonify({"error": f"Eksik cevap: {key}"}), 400
            answers.append(int(data[key]))
        
        # Kullanıcı nesnesi oluştur
        user = User(user_id=0, name="test", answers=answers)
        
        # Persona ID tahmin et (K-Means)
        persona_id = matcher.assign_persona(user)
        if persona_id == -1:
            return jsonify({"error": "Model yüklenemedi."}), 500
        
        # Big Five skorlarını hesapla
        score = analyzer.calculate_score(answers)
        
        return jsonify({
            "persona_id": int(persona_id),
            "scores": {
                "extraversion": round(score.extraversion, 2),
                "agreeableness": round(score.agreeableness, 2),
                "conscientiousness": round(score.conscientiousness, 2),
                "neuroticism": round(score.neuroticism, 2),
                "openness": round(score.openness, 2)
            }
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/compatibility', methods=['POST'])
def compatibility():
    """
    İki persona ID alır, centroid mesafesi üzerinden uyum yüzdesini hesaplar.
    
    İstek: { "persona_id_1": 3, "persona_id_2": 7 }
    Yanıt: { "compatibility": 78.5 }
    """
    try:
        data = request.get_json()
        
        pid1 = int(data.get("persona_id_1", -1))
        pid2 = int(data.get("persona_id_2", -1))
        
        if pid1 < 0 or pid2 < 0:
            return jsonify({"error": "Geçersiz persona ID'leri."}), 400
        
        compat = matcher.calculate_compatibility(pid1, pid2)
        
        return jsonify({"compatibility": compat})
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500
@app.route('/persona/<int:persona_id>', methods=['GET'])
def get_persona_details(persona_id):
    """
    Belirli bir persona ID'nin (0-9) tipik Big Five skorlarını (küme merkezini) döndürür.
    """
    try:
        if not matcher.is_ready:
            return jsonify({"error": "Model hazır değil."}), 500
        
        if persona_id < 0 or persona_id >= len(matcher.centroids):
            return jsonify({"error": "Geçersiz persona ID."}), 400
        
        # Küme merkezindeki 25 cevabı al (float dizisi)
        centroid = matcher.centroids[persona_id]
        
        # Değerleri 1-5 aralığına sınırla (centroid değerleri bazen küçük taşmalar yapabilir)
        answers = [max(1.0, min(5.0, val)) for val in centroid]
        
        # PersonalityAnalyzer float listeleriyle de çalışabilir (sum/25)
        score = analyzer.calculate_score(answers)
        
        return jsonify({
            "persona_id": persona_id,
            "scores": {
                "extraversion": round(score.extraversion, 2),
                "agreeableness": round(score.agreeableness, 2),
                "conscientiousness": round(score.conscientiousness, 2),
                "neuroticism": round(score.neuroticism, 2),
                "openness": round(score.openness, 2)
            }
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500



@app.route('/health', methods=['GET'])
def health():
    """Servisin ayakta olup olmadığını kontrol eden basit health-check."""
    return jsonify({
        "status": "ok",
        "model_ready": matcher.is_ready
    })


if __name__ == '__main__':
    print("=" * 50)
    print("HomeMate AI Servisi başlatılıyor...")
    print(f"Model durumu: {'Hazır ✓' if matcher.is_ready else 'HATA ✗'}")
    print("Adres: http://localhost:5000")
    print("=" * 50)
    app.run(host='0.0.0.0', port=5000, debug=True)
