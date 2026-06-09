package cwnu.healthcare.domain.profile.repository;

import cwnu.healthcare.domain.profile.document.HealthProfile;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface HealthProfileRepository extends MongoRepository<HealthProfile, String> {
    Optional<HealthProfile> findByUserId(String userId);

    void deleteByUserId(String userId);
}
