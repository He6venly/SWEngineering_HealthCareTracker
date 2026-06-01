package cwnu.healthcare.domain.user.service;

import org.springframework.stereotype.Service;

import cwnu.healthcare.domain.user.document.User;
import cwnu.healthcare.domain.user.dto.UserResponse;
import cwnu.healthcare.domain.user.repository.UserRepository;
import cwnu.healthcare.global.exception.BusinessException;
import cwnu.healthcare.global.exception.ErrorCode;

@Service
public class UserService {

	private final UserRepository userRepository;

	public UserService(UserRepository userRepository) {
		this.userRepository = userRepository;
	}

	public UserResponse getCurrentUser(String userId) {
		User user = userRepository.findById(userId)
			.orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));

		return UserResponse.from(user);
	}
}
