package cwnu.healthcare.domain.ai.repository;

import cwnu.healthcare.domain.ai.document.AiFeedbackRecord;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface AiFeedbackRecordRepository extends MongoRepository<AiFeedbackRecord, String> {

    List<AiFeedbackRecord> findTop10ByUserIdOrderByTargetDateDesc(String userId);

    void deleteByUserId(String userId);
}
