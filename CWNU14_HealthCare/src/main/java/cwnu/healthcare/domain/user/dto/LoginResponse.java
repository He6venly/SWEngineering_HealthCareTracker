package cwnu.healthcare.domain.user.dto;

public record LoginResponse(
	String accessToken,
	String tokenType
) {
}
