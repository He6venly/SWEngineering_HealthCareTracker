package cwnu.healthcare.domain.user.repository;

import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;

import cwnu.healthcare.domain.user.document.User;

public interface UserRepository extends MongoRepository<User, String> {

	Optional<User> findByEmail(String email);

	boolean existsByEmail(String email);
}
