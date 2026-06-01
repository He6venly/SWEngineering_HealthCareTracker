package cwnu.healthcare.domain.user.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import cwnu.healthcare.domain.user.dto.LoginRequest;
import cwnu.healthcare.domain.user.dto.LoginResponse;
import cwnu.healthcare.domain.user.dto.SignupRequest;
import cwnu.healthcare.domain.user.dto.UserResponse;
import cwnu.healthcare.domain.user.service.AuthService;
import cwnu.healthcare.global.common.ApiResponse;
import jakarta.validation.Valid;

@RestController
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
}
