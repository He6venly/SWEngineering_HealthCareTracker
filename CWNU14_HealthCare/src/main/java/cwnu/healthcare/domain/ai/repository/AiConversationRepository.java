package cwnu.healthcare.domain.ai.repository;

import cwnu.healthcare.domain.ai.document.AiConversation;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface AiConversationRepository extends MongoRepository<AiConversation, String> {

    List<AiConversation> findTop20ByUserIdOrderByUpdatedAtDesc(String userId);

    Optional<AiConversation> findByIdAndUserId(String id, String userId);

    void deleteByUserId(String userId);
}
