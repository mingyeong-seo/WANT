import React, { useState } from "react";
import "./LoginPage.css";

const LoginPage = ({ controller }) => {
    const { loginForm, setLoginForm } = controller;

    const [kakaoAccessToken, setKakaoAccessToken] = useState("");
    const [showRoleModal, setShowRoleModal] = useState(false);
    const [loginErrorOpen, setLoginErrorOpen] = useState(false);

    const handleClickLogin = async () => {
        const success = await controller.handleLogin();
        if (success) {
            controller.setRoutePage("main");
            return;
        }

        setLoginErrorOpen(true);
    };

    const handleKakaoLogin = () => {
        if (!window.Kakao || !window.Kakao.Auth) {
            controller.setMessage?.(
                "카카오 로그인 기능을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요."
            );
            return;
        }

        window.Kakao.Auth.login({
            scope: "profile_nickname,profile_image",

            success: async (authObj) => {
                try {
                    if (!authObj?.access_token) {
                        controller.setMessage?.("카카오 인증 정보를 받아오지 못했습니다. 다시 시도해 주세요.");
                        return;
                    }

                    const result = await controller.handleKakaoLogin(authObj.access_token);

                    if (result?.isNewUser) {
                        setKakaoAccessToken(authObj.access_token);
                        setShowRoleModal(true);
                        return;
                    }

                    if (result?.success) {
                        controller.setRoutePage("main");
                    }
                } catch (error) {
                    console.error("카카오 로그인 처리 중 오류:", error);
                    controller.setMessage?.("카카오 로그인 처리 중 오류가 발생했습니다.");
                }
            },

            fail: (err) => {
                console.error("카카오 로그인 실패:", err);
                controller.setMessage?.("카카오 로그인에 실패했습니다.");
            },
        });
    };

    const handleSelectKakaoRole = async (role) => {
        if (!kakaoAccessToken) {
            controller.setMessage?.("카카오 로그인 정보가 없습니다. 다시 시도해 주세요.");
            setShowRoleModal(false);
            return;
        }

        const result = await controller.handleKakaoLogin(kakaoAccessToken, role);

        if (result?.success) {
            setShowRoleModal(false);
            setKakaoAccessToken("");
            controller.setRoutePage("main");
        }
    };

    return (
        <div className="login-container">
            <div className="login-box">
                <h2 className="login-title">로그인</h2>

                <label className="login-label">이메일</label>
                <input
                    type="email"
                    placeholder="이메일을 입력하세요"
                    className="login-input"
                    value={loginForm.email}
                    onChange={(e) => {
                        setLoginErrorOpen(false);
                        setLoginForm({ ...loginForm, email: e.target.value });
                    }}
                />

                <label className="login-label">비밀번호</label>
                <input
                    type="password"
                    placeholder="비밀번호를 입력하세요"
                    className="login-input"
                    value={loginForm.password}
                    onChange={(e) => {
                        setLoginErrorOpen(false);
                        setLoginForm({ ...loginForm, password: e.target.value });
                    }}
                />

                <div className="login-options">
                    <label className="checkbox-label">
                        <input type="checkbox" />
                        로그인 유지
                    </label>
                    <div
                        className="find-password"
                        onClick={() => controller.setRoutePage("forgot-password")}
                    >
                        비밀번호 찾기
                    </div>
                </div>

                <button className="login-button" onClick={handleClickLogin}>
                    로그인
                </button>

                <div className="divider">
                    <span>또는 소셜 계정으로 로그인</span>
                </div>

                <button className="kakao-button" onClick={handleKakaoLogin}>
                    카카오 로그인
                </button>

                <div className="signup">
                    계정이 없으신가요?{" "}
                    <span
                        className="signup-link"
                        onClick={() => controller.setRoutePage("signup")}
                    >
                        회원가입
                    </span>
                </div>

                <div
                    className="back-to-main"
                    onClick={() => controller.setRoutePage("main")}
                >
                    메인으로 돌아가기
                </div>
            </div>

            {loginErrorOpen && (
                <div className="login-error-modal-backdrop" onClick={() => setLoginErrorOpen(false)}>
                    <div className="login-error-modal" onClick={(e) => e.stopPropagation()}>
                        <button
                            type="button"
                            className="login-error-close"
                            onClick={() => setLoginErrorOpen(false)}
                            aria-label="닫기"
                        >
                            ×
                        </button>
                        <div className="login-error-icon">!</div>
                        <h3>로그인 실패</h3>
                        <p>잘못된 아이디 / 비밀번호 입니다</p>
                        <button
                            type="button"
                            className="login-error-confirm"
                            onClick={() => setLoginErrorOpen(false)}
                        >
                            확인
                        </button>
                    </div>
                </div>
            )}

            {showRoleModal && (
                <div className="kakao-role-modal-backdrop">
                    <div className="kakao-role-modal">
                        <h3>카카오 계정 유형 선택</h3>
                        <p>
                            처음 카카오 로그인을 진행하는 경우 사용할 계정 유형을 선택해 주세요.
                            이후에는 선택한 역할로 자동 로그인됩니다.
                        </p>

                        <div className="kakao-role-actions">
                            <button
                                type="button"
                                className="kakao-role-button shipper"
                                onClick={() => handleSelectKakaoRole("SHIPPER")}
                            >
                                화주로 시작하기
                            </button>

                            <button
                                type="button"
                                className="kakao-role-button driver"
                                onClick={() => handleSelectKakaoRole("DRIVER")}
                            >
                                차주로 시작하기
                            </button>
                        </div>

                        <button
                            type="button"
                            className="kakao-role-cancel"
                            onClick={() => {
                                setShowRoleModal(false);
                                setKakaoAccessToken("");
                            }}
                        >
                            취소
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LoginPage;