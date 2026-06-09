package cwnu.healthcare.domain.user.document;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import cwnu.healthcare.global.common.BaseDocument;

@Document(collection = "users")
public class User extends BaseDocument {

	@Id
	private String id;

	@Indexed(unique = true)
	private String email;

	private String password;

	private String nickname;

	private boolean dataConsentAgreed;

	protected User() {
	}

	public User(String email, String password, String nickname, boolean dataConsentAgreed) {
		this.email = email;
		this.password = password;
		this.nickname = nickname;
		this.dataConsentAgreed = dataConsentAgreed;
	}

	public String getId() {
		return id;
	}

	public String getEmail() {
		return email;
	}

	public String getPassword() {
		return password;
	}

	public String getNickname() {
		return nickname;
	}

	public void updateNickname(String nickname) {
		this.nickname = nickname;
	}

	public boolean isDataConsentAgreed() {
		return dataConsentAgreed;
	}
}
