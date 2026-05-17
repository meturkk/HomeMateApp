package com.homemate.api.config;

import com.homemate.api.repository.CityRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DataSeeder implements CommandLineRunner {

    private final CityRepository cityRepository;

    public DataSeeder(CityRepository cityRepository) {
        this.cityRepository = cityRepository;
    }

    @Override
    public void run(String... args) throws Exception {
        long cityCount = cityRepository.count();
        if (cityCount > 0) {
            System.out.println("✅ Konum veritabanı hazır: " + cityCount + " il mevcut.");
        } else {
            System.out.println("⚠️ Konum veritabanı boş! Lütfen import_turkey_address.py betiğini çalıştırın.");
        }
    }
}
