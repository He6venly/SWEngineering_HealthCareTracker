package cwnu.healthcare.global.health;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import cwnu.healthcare.global.common.ApiResponse;

@RestController
public class HealthController {

	@GetMapping("/api/v1/health")
	public ApiResponse<String> health() {
		return ApiResponse.success("OK");
	}
}
