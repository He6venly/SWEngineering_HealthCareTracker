package cwnu.healthcare.domain.user.controller;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import cwnu.healthcare.domain.user.dto.UserResponse;
import cwnu.healthcare.domain.user.service.UserService;
import cwnu.healthcare.global.common.ApiResponse;

@RestController
@RequestMapping("/api/v1/users")
public class UserController {

	private final UserService userService;

	public UserController(UserService userService) {
		this.userService = userService;
	}

	@GetMapping("/me")
	public ApiResponse<UserResponse> getCurrentUser(@AuthenticationPrincipal String userId) {
		return ApiResponse.success(userService.getCurrentUser(userId));
	}
}
