package cwnu.healthcare.domain.user.service;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import cwnu.healthcare.domain.user.document.User;
import cwnu.healthcare.domain.user.dto.EmailAvailabilityResponse;
import cwnu.healthcare.domain.user.dto.LoginRequest;
import cwnu.healthcare.domain.user.dto.LoginResponse;
import cwnu.healthcare.domain.user.dto.SignupRequest;
import cwnu.healthcare.domain.user.dto.UserResponse;
import cwnu.healthcare.domain.user.repository.UserRepository;
import cwnu.healthcare.global.exception.BusinessException;
import cwnu.healthcare.global.exception.ErrorCode;
import cwnu.healthcare.global.security.JwtTokenProvider;

@Service
public class AuthService {

	private static final String TOKEN_TYPE = "Bearer";

	private final UserRepository userRepository;
	private final PasswordEncoder passwordEncoder;
	private final JwtTokenProvider jwtTokenProvider;

	public AuthService(
		UserRepository userRepository,
		PasswordEncoder passwordEncoder,
		JwtTokenProvider jwtTokenProvider
	) {
		this.userRepository = userRepository;
		this.passwordEncoder = passwordEncoder;
		this.jwtTokenProvider = jwtTokenProvider;
	}

	public UserResponse signup(SignupRequest request) {
		if (userRepository.existsByEmail(request.email())) {
			throw new BusinessException(ErrorCode.EMAIL_ALREADY_EXISTS);
		}

		User user = new User(
			request.email(),
			passwordEncoder.encode(request.password()),
			request.nickname(),
			request.dataConsentAgreed()
		);

		return UserResponse.from(userRepository.save(user));
	}

	public EmailAvailabilityResponse checkEmailAvailability(String email) {
		return new EmailAvailabilityResponse(!userRepository.existsByEmail(email));
	}

	public LoginResponse login(LoginRequest request) {
		User user = userRepository.findByEmail(request.email())
			.orElseThrow(() -> new BusinessException(ErrorCode.INVALID_LOGIN));

		if (!passwordEncoder.matches(request.password(), user.getPassword())) {
			throw new BusinessException(ErrorCode.INVALID_LOGIN);
		}

		String accessToken = jwtTokenProvider.createToken(user.getId());
		return new LoginResponse(accessToken, TOKEN_TYPE);
	}
}
