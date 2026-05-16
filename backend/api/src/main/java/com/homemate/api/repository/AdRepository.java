package com.homemate.api.repository;

import com.homemate.api.domain.Ad;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface AdRepository extends JpaRepository<Ad, Long> {
    List<Ad> findByCityId(Long cityId);
    List<Ad> findByDistrictId(Long districtId);
    List<Ad> findByOwnerEmail(String email);
}
