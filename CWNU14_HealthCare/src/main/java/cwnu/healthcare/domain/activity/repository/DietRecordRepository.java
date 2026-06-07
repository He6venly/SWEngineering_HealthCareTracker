package cwnu.healthcare.domain.activity.repository;

import cwnu.healthcare.domain.activity.document.DietRecord;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

import java.time.LocalDate;
import java.util.List;

public interface DietRecordRepository extends MongoRepository<DietRecord, String> {

    List<DietRecord> findByUserIdAndRecordDate(String userId, LocalDate recordDate);

    @Query("{ 'userId': ?0, 'recordDate': { $gte: ?1, $lte: ?2 } }")
    List<DietRecord> findByUserIdAndRecordDateRange(
            String userId,
            LocalDate startDate,
            LocalDate endDate
    );
}
