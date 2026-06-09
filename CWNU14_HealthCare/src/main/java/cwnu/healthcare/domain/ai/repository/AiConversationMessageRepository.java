package cwnu.healthcare.domain.ai.repository;

import cwnu.healthcare.domain.ai.document.AiConversationMessage;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface AiConversationMessageRepository extends MongoRepository<AiConversationMessage, String> {

    List<AiConversationMessage> findByConversationIdAndUserIdOrderByCreatedAtAsc(String conversationId, String userId);

    void deleteByConversationIdAndUserId(String conversationId, String userId);

    void deleteByUserId(String userId);
}
