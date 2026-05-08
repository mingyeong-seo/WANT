import { useCallback, useEffect, useRef, useState } from "react";

const DEFAULT_WELCOME = {
  role: "assistant",
  content:
    "안녕하세요. WANT AI 비서입니다. 수수료, 차량 정보 수정 위치, 화물 등록 방법, 결제수단 변경, 배차 보드, 채팅과 알림 사용법까지 빠르게 안내해 드릴 수 있습니다. 필요한 경우 바로 이동 버튼도 함께 보여드립니다.",
  quickActions: [
    "수수료 알려줘",
    "차량등록 어디서 수정해?",
    "화물 등록은 어떻게 해?",
    "결제수단 어디서 바꿔?",
  ],
  navigationActions: [],
};

const WINDOW_WIDTH = 420;
const WINDOW_HEIGHT = 720;
const WINDOW_GAP = 24;

const getWindowSize = () => ({
  width: window.innerWidth,
  height: window.innerHeight,
});

const getDefaultPosition = () => {
  const { width, height } = getWindowSize();
  return {
    x: Math.max(WINDOW_GAP, width - WINDOW_WIDTH - WINDOW_GAP),
    y: Math.max(WINDOW_GAP, height - WINDOW_HEIGHT - WINDOW_GAP),
  };
};

const clampPosition = (position) => {
  const { width, height } = getWindowSize();
  const maxX = Math.max(WINDOW_GAP, width - WINDOW_WIDTH - WINDOW_GAP);
  const maxY = Math.max(WINDOW_GAP, height - WINDOW_HEIGHT - WINDOW_GAP);

  return {
    x: Math.min(Math.max(position.x, WINDOW_GAP), maxX),
    y: Math.min(Math.max(position.y, WINDOW_GAP), maxY),
  };
};

export default function AssistantWindowModal({
  open,
  messages,
  draft,
  setDraft,
  onSend,
  onClose,
  isSending,
  quickActions = [],
  onQuickAction,
  onNavigate,
}) {
  const scrollRef = useRef(null);
  const textareaRef = useRef(null);
  const dragOffsetRef = useRef({ x: 0, y: 0 });
  const [position, setPosition] = useState(() =>
    typeof window === "undefined"
      ? { x: WINDOW_GAP, y: WINDOW_GAP }
      : getDefaultPosition(),
  );
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (!open) return;
    const node = scrollRef.current;
    if (!node) return;
    node.scrollTop = node.scrollHeight;
  }, [open, messages, isSending]);

  useEffect(() => {
    if (!open) return;
    const timer = window.setTimeout(() => textareaRef.current?.focus(), 40);
    return () => window.clearTimeout(timer);
  }, [open]);

  useEffect(() => {
    if (!open || typeof window === "undefined") return;
    setPosition((prev) => clampPosition(prev));
  }, [open]);

  useEffect(() => {
    if (!open || typeof window === "undefined") return;

    const handleResize = () => {
      setPosition((prev) => clampPosition(prev));
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [open]);

  useEffect(() => {
    if (!open || !isDragging || typeof window === "undefined") return;

    const handlePointerMove = (event) => {
      setPosition(
        clampPosition({
          x: event.clientX - dragOffsetRef.current.x,
          y: event.clientY - dragOffsetRef.current.y,
        }),
      );
    };

    const handlePointerUp = () => {
      setIsDragging(false);
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [open, isDragging]);

  useEffect(() => {
    if (!open || typeof window === "undefined") return;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose?.();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  const handleSubmit = () => {
    if (isSending) return;
    onSend?.();
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSubmit();
    }
  };

  const handleDragStart = useCallback(
    (event) => {
      if (event.button !== 0) return;
      dragOffsetRef.current = {
        x: event.clientX - position.x,
        y: event.clientY - position.y,
      };
      setIsDragging(true);
    },
    [position.x, position.y],
  );

  if (!open) return null;

  const visibleMessages = messages?.length ? messages : [DEFAULT_WELCOME];

  return (
    <div className="assistant-floating-layer" aria-live="polite">
      <aside
        className={`assistant-modal ${isDragging ? "is-dragging" : ""}`}
        style={{ left: `${position.x}px`, top: `${position.y}px` }}
      >
        <div
          className="assistant-modal__head assistant-modal__dragHandle"
          onPointerDown={handleDragStart}
        >
          <div>
            <strong>AI 비서</strong>
            <p>서비스 이용 방법을 빠르고 정중하게 안내해 드립니다.</p>
          </div>
          <div className="assistant-modal__headActions">
            <button
              type="button"
              className="assistant-reset-button"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={() => onQuickAction?.("처음")}
            >
              처음으로
            </button>

            <button
              type="button"
              className="modal-close"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={onClose}
            >
              ✕
            </button>
          </div>
        </div>

        <div className="assistant-modal__messages" ref={scrollRef}>
          {visibleMessages.map((message, index) => (
            <div
              key={`${message.role}-${index}-${message.content?.slice(0, 20) || ""}`}
              className={
                message.role === "user"
                  ? "assistant-bubble assistant-bubble--user"
                  : "assistant-bubble assistant-bubble--assistant"
              }
            >
              <div className="assistant-bubble__role">
                {message.role === "user" ? "나" : "AI 비서"}
              </div>
              <p>{message.content}</p>

              {message.role !== "user" &&
                Array.isArray(message.navigationActions) &&
                message.navigationActions.length > 0 && (
                  <div className="assistant-bubble__actions">
                    {message.navigationActions.map((action, actionIndex) => (
                      <button
                        key={`${action.targetKey || action.label}-${actionIndex}`}
                        type="button"
                        className="assistant-action-button"
                        onClick={() => onNavigate?.(action)}
                      >
                        {action.label}
                      </button>
                    ))}
                  </div>
                )}

              {message.role !== "user" &&
                Array.isArray(message.quickActions) &&
                message.quickActions.length > 0 && (
                  <div className="assistant-bubble__chips">
                    {message.quickActions.map((item) => (
                      <button
                        key={item}
                        type="button"
                        className="assistant-chip assistant-chip--inline"
                        onClick={() => onQuickAction?.(item)}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                )}
            </div>
          ))}
          {isSending && (
            <div className="assistant-bubble assistant-bubble--assistant assistant-bubble--loading">
              <div className="assistant-bubble__role">AI 비서</div>
              <p>답변을 준비하고 있습니다.</p>
            </div>
          )}
        </div>

        <div className="assistant-modal__composer">
          <textarea
            ref={textareaRef}
            value={draft}
            onChange={(e) => setDraft?.(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="메세지를 입력해 주세요."
          />
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleSubmit}
            disabled={isSending || !draft.trim()}
          >
            보내기
          </button>
        </div>
      </aside>
    </div>
  );
}
