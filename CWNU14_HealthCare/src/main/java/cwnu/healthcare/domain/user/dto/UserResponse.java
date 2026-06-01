package cwnu.healthcare.domain.user.dto;

import cwnu.healthcare.domain.user.document.User;

public record UserResponse(
	String id,
	String email,
	String nickname,
	boolean dataConsentAgreed
) {

	public static UserResponse from(User user) {
		return new UserResponse(
			user.getId(),
			user.getEmail(),
			user.getNickname(),
			user.isDataConsentAgreed()
		);
	}
}
