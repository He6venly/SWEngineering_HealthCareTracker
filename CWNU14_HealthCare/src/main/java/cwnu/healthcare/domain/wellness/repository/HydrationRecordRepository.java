package cwnu.healthcare.domain.wellness.repository;

import cwnu.healthcare.domain.wellness.document.HydrationRecord;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface HydrationRecordRepository extends MongoRepository<HydrationRecord, String> {
    Optional<HydrationRecord> findByUserIdAndRecordDate(String userId, LocalDate recordDate);

    void deleteByUserId(String userId);

    @Query("{ 'userId': ?0, 'recordDate': { $gte: ?1, $lte: ?2 } }")
    List<HydrationRecord> findByUserIdAndRecordDateRange(String userId, LocalDate startDate, LocalDate endDate);
}
