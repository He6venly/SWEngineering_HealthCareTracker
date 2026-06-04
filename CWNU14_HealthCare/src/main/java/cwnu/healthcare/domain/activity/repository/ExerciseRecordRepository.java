package cwnu.healthcare.domain.activity.repository;

import cwnu.healthcare.domain.activity.document.ExerciseRecord;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.time.LocalDate;
import java.util.List;

public interface ExerciseRecordRepository extends MongoRepository<ExerciseRecord, String> {

    List<ExerciseRecord> findByUserIdAndRecordDate(String userId, LocalDate recordDate);

    List<ExerciseRecord> findByUserIdAndRecordDateBetween(String userId, LocalDate startDate, LocalDate endDate);
}
