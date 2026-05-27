package cwnu.healthcare.global.common;

public record ApiResponse<T>(
	int status,
	String message,
	String errorCode,
	T data
) {

	public static <T> ApiResponse<T> success(T data) {
		return new ApiResponse<>(200, "요청이 성공적으로 처리되었습니다.", null, data);
	}

	public static ApiResponse<Void> success() {
		return new ApiResponse<>(200, "요청이 성공적으로 처리되었습니다.", null, null);
	}

	public static ApiResponse<Void> error(int status, String message, String errorCode) {
		return new ApiResponse<>(status, message, errorCode, null);
	}
}
