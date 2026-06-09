package cwnu.healthcare.domain.user.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import cwnu.healthcare.domain.user.dto.EmailAvailabilityResponse;
import cwnu.healthcare.domain.user.dto.LoginRequest;
import cwnu.healthcare.domain.user.dto.LoginResponse;
import cwnu.healthcare.domain.user.dto.SignupRequest;
import cwnu.healthcare.domain.user.dto.UserResponse;
import cwnu.healthcare.domain.user.service.AuthService;
import cwnu.healthcare.global.common.ApiResponse;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

@RestController
@Validated
@RequestMapping("/api/v1/auth")
public class AuthController {

	private final AuthService authService;

	public AuthController(AuthService authService) {
		this.authService = authService;
	}

	@PostMapping("/signup")
	public ResponseEntity<ApiResponse<UserResponse>> signup(@Valid @RequestBody SignupRequest request) {
		UserResponse response = authService.signup(request);
		return ResponseEntity
			.status(HttpStatus.CREATED)
			.body(new ApiResponse<>(HttpStatus.CREATED.value(), "회원가입이 완료되었습니다.", null, response));
	}

	@PostMapping("/login")
	public ApiResponse<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
		return ApiResponse.success(authService.login(request));
	}

	@GetMapping("/email-availability")
	public ApiResponse<EmailAvailabilityResponse> checkEmailAvailability(
		@RequestParam
		@NotBlank(message = "이메일은 필수입니다.")
		@Email(message = "이메일 형식이 올바르지 않습니다.")
		@Pattern(regexp = "^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$", message = "이메일 형식이 올바르지 않습니다.")
		String email
	) {
		return ApiResponse.success(authService.checkEmailAvailability(email));
	}
}
