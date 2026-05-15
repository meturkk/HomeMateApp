package com.homemate.api.service;

import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import java.util.Map;

@Service
public class AiIntegrationService {

    private final RestTemplate restTemplate;
    // Python servisimizin adresi
    private final String AI_SERVICE_URL = "http://localhost:5000/predict";

    public AiIntegrationService() {
        this.restTemplate = new RestTemplate();
    }

    // Next.js'ten gelen 25 soruluk cevap listesini alır, Python'a gönderip PersonaID döndürür
    public Integer getPersonaId(Map<String, Integer> answers) {
        try {
            // Python API'ye POST isteği at
            Map<String, Object> response = restTemplate.postForObject(AI_SERVICE_URL, answers, Map.class);
            if (response != null && response.containsKey("persona_id")) {
                return (Integer) response.get("persona_id");
            }
        } catch (Exception e) {
            System.err.println("Yapay zeka servisiyle bağlantı kurulamadı: " + e.getMessage());
        }
        return null; // Başarısız olursa null döner
    }
}
