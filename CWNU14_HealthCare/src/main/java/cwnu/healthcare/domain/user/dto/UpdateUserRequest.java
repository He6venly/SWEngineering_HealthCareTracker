package cwnu.healthcare.domain.user.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UpdateUserRequest(
	@NotBlank(message = "닉네임은 필수입니다.")
	@Size(max = 30, message = "닉네임은 30자 이하로 입력해주세요.")
	String nickname
) {
}
