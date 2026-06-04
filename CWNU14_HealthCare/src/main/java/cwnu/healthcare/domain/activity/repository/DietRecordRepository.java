package cwnu.healthcare.domain.activity.repository;

import cwnu.healthcare.domain.activity.document.DietRecord;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.time.LocalDate;
import java.util.List;

public interface DietRecordRepository extends MongoRepository<DietRecord, String> {

    List<DietRecord> findByUserIdAndRecordDate(String userId, LocalDate recordDate);

    List<DietRecord> findByUserIdAndRecordDateBetween(String userId, LocalDate startDate, LocalDate endDate);
}
