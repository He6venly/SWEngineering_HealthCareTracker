package cwnu.healthcare.global.exception;

public enum ErrorCode {
	INVALID_INPUT(400, "ERR-V001", "입력값이 올바르지 않습니다."),
	UNAUTHORIZED(401, "ERR-A001", "인증이 필요합니다."),
	PROFILE_NOT_FOUND(404, "ERR-P001", "건강 프로필을 찾을 수 없습니다."),
	WEARABLE_PARSE_FAILED(422, "ERR-W001", "웨어러블 원본 데이터 처리에 실패했습니다."),
	LLM_SERVICE_UNAVAILABLE(503, "ERR-L001", "AI 피드백 서비스를 사용할 수 없습니다.");

	private final int status;
	private final String code;
	private final String message;

	ErrorCode(int status, String code, String message) {
		this.status = status;
		this.code = code;
		this.message = message;
	}

	public int getStatus() {
		return status;
	}

	public String getCode() {
		return code;
	}

	public String getMessage() {
		return message;
	}
}
