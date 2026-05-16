package com.homemate.api.service;

import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import java.util.Map;

@Service
public class AiIntegrationService {

    private final RestTemplate restTemplate;
    // Python servisimizin adresi
    private final String AI_SERVICE_URL = "http://localhost:5000";

    public AiIntegrationService() {
        this.restTemplate = new RestTemplate();
    }

    /**
     * 25 soruluk cevap listesini Python'a gönderip PersonaID ve Big Five skorlarını döndürür.
     * Yanıt: { "persona_id": 3, "scores": { "extraversion": 72.0, ... } }
     */
    @SuppressWarnings("unchecked")
    public Map<String, Object> analyzePersonality(Map<String, Integer> answers) {
        try {
            Map<String, Object> response = restTemplate.postForObject(
                AI_SERVICE_URL + "/predict", answers, Map.class
            );
            return response;
        } catch (Exception e) {
            System.err.println("Yapay zeka servisiyle bağlantı kurulamadı: " + e.getMessage());
            return null;
        }
    }

    /**
     * Geriye uyumluluk için sadece PersonaID döndüren metot.
     */
    public Integer getPersonaId(Map<String, Integer> answers) {
        Map<String, Object> result = analyzePersonality(answers);
        if (result != null && result.containsKey("persona_id")) {
            return (Integer) result.get("persona_id");
        }
        return null;
    }

    /**
     * İki persona arasındaki uyum yüzdesini hesaplar.
     */
    @SuppressWarnings("unchecked")
    public Double getCompatibility(int personaId1, int personaId2) {
        try {
            Map<String, Object> request = Map.of(
                "persona_id_1", personaId1,
                "persona_id_2", personaId2
            );
            Map<String, Object> response = restTemplate.postForObject(
                AI_SERVICE_URL + "/compatibility", request, Map.class
            );
            if (response != null && response.containsKey("compatibility")) {
                return ((Number) response.get("compatibility")).doubleValue();
            }
        } catch (Exception e) {
            System.err.println("Uyum hesaplaması başarısız: " + e.getMessage());
        }
        return null;
    }

    /**
     * Persona ID bazlı tipik Big Five skorlarını Python'dan çeker.
     */
    @SuppressWarnings("unchecked")
    public Map<String, Object> getPersonaDetails(int personaId) {
        try {
            Map<String, Object> response = restTemplate.getForObject(
                AI_SERVICE_URL + "/persona/" + personaId, Map.class
            );
            return response;
        } catch (Exception e) {
            System.err.println("Persona detayları çekilemedi: " + e.getMessage());
            return null;
        }
    }
}
