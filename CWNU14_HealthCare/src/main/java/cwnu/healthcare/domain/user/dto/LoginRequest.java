package cwnu.healthcare.domain.user.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record LoginRequest(
	@NotBlank(message = "이메일은 필수입니다.")
	@Email(message = "이메일 형식이 올바르지 않습니다.")
	@Pattern(regexp = "^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$", message = "이메일 형식이 올바르지 않습니다.")
	String email,

	@NotBlank(message = "비밀번호는 필수입니다.")
	String password
) {
}
