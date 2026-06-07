package cwnu.healthcare.domain.activity.repository;

import cwnu.healthcare.domain.activity.document.ExerciseRecord;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

import java.time.LocalDate;
import java.util.List;

public interface ExerciseRecordRepository extends MongoRepository<ExerciseRecord, String> {

    List<ExerciseRecord> findByUserIdAndRecordDate(String userId, LocalDate recordDate);

    @Query("{ 'userId': ?0, 'recordDate': { $gte: ?1, $lte: ?2 } }")
    List<ExerciseRecord> findByUserIdAndRecordDateRange(
            String userId,
            LocalDate startDate,
            LocalDate endDate
    );
}
