package cwnu.healthcare.domain.user.dto;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

public record SignupRequest(
	@NotBlank(message = "이메일은 필수입니다.")
	@Email(message = "이메일 형식이 올바르지 않습니다.")
	@Pattern(regexp = "^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$", message = "이메일 형식이 올바르지 않습니다.")
	String email,

	@NotBlank(message = "비밀번호는 필수입니다.")
	String password,

	@NotBlank(message = "닉네임은 필수입니다.")
	String nickname,

	@NotNull(message = "개인정보 수집 및 이용 동의 여부는 필수입니다.")
	@AssertTrue(message = "개인정보 수집 및 이용에 동의해야 합니다.")
	Boolean dataConsentAgreed
) {
}
