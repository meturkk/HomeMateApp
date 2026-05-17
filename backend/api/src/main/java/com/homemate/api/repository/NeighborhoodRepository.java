package com.homemate.api.repository;

import com.homemate.api.domain.Neighborhood;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface NeighborhoodRepository extends JpaRepository<Neighborhood, Long> {
    List<Neighborhood> findByDistrictIdOrderByNameAsc(Long districtId);
}
