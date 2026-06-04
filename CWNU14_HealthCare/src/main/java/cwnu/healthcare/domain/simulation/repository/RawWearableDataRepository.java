package cwnu.healthcare.domain.simulation.repository;

import cwnu.healthcare.domain.simulation.document.RawWearableData;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface RawWearableDataRepository extends MongoRepository<RawWearableData, String> {

    List<RawWearableData> findByUserIdAndRecordDate(String userId, LocalDate recordDate);

    Optional<RawWearableData> findTopByUserIdOrderByCreatedAtDesc(String userId);
}
