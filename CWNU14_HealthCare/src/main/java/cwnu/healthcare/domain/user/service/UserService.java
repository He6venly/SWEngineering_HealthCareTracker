package cwnu.healthcare.domain.user.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import cwnu.healthcare.domain.activity.repository.DietRecordRepository;
import cwnu.healthcare.domain.activity.repository.ExerciseRecordRepository;
import cwnu.healthcare.domain.ai.repository.AiConversationMessageRepository;
import cwnu.healthcare.domain.ai.repository.AiConversationRepository;
import cwnu.healthcare.domain.ai.repository.AiFeedbackRecordRepository;
import cwnu.healthcare.domain.profile.repository.HealthProfileRepository;
import cwnu.healthcare.domain.simulation.repository.RawWearableDataRepository;
import cwnu.healthcare.domain.user.document.User;
import cwnu.healthcare.domain.user.dto.UpdateUserRequest;
import cwnu.healthcare.domain.user.dto.UserResponse;
import cwnu.healthcare.domain.user.repository.UserRepository;
import cwnu.healthcare.domain.wellness.repository.HydrationRecordRepository;
import cwnu.healthcare.domain.wellness.repository.SleepRecordRepository;
import cwnu.healthcare.global.exception.BusinessException;
import cwnu.healthcare.global.exception.ErrorCode;

@Service
public class UserService {

	private final UserRepository userRepository;
	private final HealthProfileRepository healthProfileRepository;
	private final DietRecordRepository dietRecordRepository;
	private final ExerciseRecordRepository exerciseRecordRepository;
	private final HydrationRecordRepository hydrationRecordRepository;
	private final SleepRecordRepository sleepRecordRepository;
	private final RawWearableDataRepository rawWearableDataRepository;
	private final AiFeedbackRecordRepository aiFeedbackRecordRepository;
	private final AiConversationRepository aiConversationRepository;
	private final AiConversationMessageRepository aiConversationMessageRepository;

	public UserService(
		UserRepository userRepository,
		HealthProfileRepository healthProfileRepository,
		DietRecordRepository dietRecordRepository,
		ExerciseRecordRepository exerciseRecordRepository,
		HydrationRecordRepository hydrationRecordRepository,
		SleepRecordRepository sleepRecordRepository,
		RawWearableDataRepository rawWearableDataRepository,
		AiFeedbackRecordRepository aiFeedbackRecordRepository,
		AiConversationRepository aiConversationRepository,
		AiConversationMessageRepository aiConversationMessageRepository
	) {
		this.userRepository = userRepository;
		this.healthProfileRepository = healthProfileRepository;
		this.dietRecordRepository = dietRecordRepository;
		this.exerciseRecordRepository = exerciseRecordRepository;
		this.hydrationRecordRepository = hydrationRecordRepository;
		this.sleepRecordRepository = sleepRecordRepository;
		this.rawWearableDataRepository = rawWearableDataRepository;
		this.aiFeedbackRecordRepository = aiFeedbackRecordRepository;
		this.aiConversationRepository = aiConversationRepository;
		this.aiConversationMessageRepository = aiConversationMessageRepository;
	}

	public UserResponse getCurrentUser(String userId) {
		User user = userRepository.findById(userId)
			.orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));

		return UserResponse.from(user);
	}

	public UserResponse updateCurrentUser(String userId, UpdateUserRequest request) {
		User user = userRepository.findById(userId)
			.orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));

		user.updateNickname(request.nickname().strip());

		return UserResponse.from(userRepository.save(user));
	}

	@Transactional
	public void deleteCurrentUser(String userId) {
		User user = userRepository.findById(userId)
			.orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));

		healthProfileRepository.deleteByUserId(userId);
		dietRecordRepository.deleteByUserId(userId);
		exerciseRecordRepository.deleteByUserId(userId);
		hydrationRecordRepository.deleteByUserId(userId);
		sleepRecordRepository.deleteByUserId(userId);
		rawWearableDataRepository.deleteByUserId(userId);
		aiFeedbackRecordRepository.deleteByUserId(userId);
		aiConversationMessageRepository.deleteByUserId(userId);
		aiConversationRepository.deleteByUserId(userId);
		userRepository.delete(user);
	}
}
