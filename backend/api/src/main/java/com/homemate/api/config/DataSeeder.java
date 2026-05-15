package com.homemate.api.config;

import com.homemate.api.domain.City;
import com.homemate.api.domain.District;
import com.homemate.api.repository.CityRepository;
import com.homemate.api.repository.DistrictRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DataSeeder implements CommandLineRunner {

    private final CityRepository cityRepository;
    private final DistrictRepository districtRepository;

    public DataSeeder(CityRepository cityRepository, DistrictRepository districtRepository) {
        this.cityRepository = cityRepository;
        this.districtRepository = districtRepository;
    }

    @Override
    public void run(String... args) throws Exception {
        if (cityRepository.count() == 0) {
            City istanbul = new City();
            istanbul.setName("İstanbul");
            istanbul = cityRepository.save(istanbul);

            City ankara = new City();
            ankara.setName("Ankara");
            ankara = cityRepository.save(ankara);

            District kadikoy = new District();
            kadikoy.setName("Kadıköy");
            kadikoy.setCity(istanbul);
            districtRepository.save(kadikoy);

            District besiktas = new District();
            besiktas.setName("Beşiktaş");
            besiktas.setCity(istanbul);
            districtRepository.save(besiktas);

            District cankaya = new District();
            cankaya.setName("Çankaya");
            cankaya.setCity(ankara);
            districtRepository.save(cankaya);
            
            System.out.println("✅ Örnek Şehir ve İlçeler veritabanına eklendi.");
        }
    }
}
