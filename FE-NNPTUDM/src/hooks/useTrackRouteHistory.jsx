import { useEffect } from "react";
import { useLocation, useNavigationType } from "react-router";

const CURRENT_ROUTE_KEY = "app_current_route";
const CURRENT_IDX_KEY = "app_current_idx";
const FORWARD_FROM_KEY = "app_forward_from";
const FORWARD_TO_KEY = "app_forward_to";

export default function useTrackRouteHistory() {
  const location = useLocation();
  const navigationType = useNavigationType();

  useEffect(() => {
    const currentPath = location.pathname + location.search;
    const currentIdx = window.history.state?.idx ?? 0;

    const prevPath = sessionStorage.getItem(CURRENT_ROUTE_KEY);
    const prevIdx = Number(sessionStorage.getItem(CURRENT_IDX_KEY) ?? currentIdx);

    if (navigationType === "POP") {
      if (currentIdx < prevIdx && prevPath && prevPath !== currentPath) {
        // User vừa bấm Back: ví dụ từ C về B
        // => lưu lại rằng từ B có thể forward tới C
        sessionStorage.setItem(FORWARD_FROM_KEY, currentPath);
        sessionStorage.setItem(FORWARD_TO_KEY, prevPath);
      } else if (currentIdx > prevIdx) {
        // User vừa bấm Forward
        // => không giữ candidate cũ nữa
        sessionStorage.removeItem(FORWARD_FROM_KEY);
        sessionStorage.removeItem(FORWARD_TO_KEY);
      }
    } else {
      // PUSH / REPLACE => coi như bỏ trạng thái forward cũ
      sessionStorage.removeItem(FORWARD_FROM_KEY);
      sessionStorage.removeItem(FORWARD_TO_KEY);
    }

    sessionStorage.setItem(CURRENT_ROUTE_KEY, currentPath);
    sessionStorage.setItem(CURRENT_IDX_KEY, String(currentIdx));
  }, [location, navigationType]);
}