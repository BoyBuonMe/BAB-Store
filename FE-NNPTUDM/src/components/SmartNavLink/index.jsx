import { NavLink, useLocation, useNavigate } from "react-router";

const FORWARD_FROM_KEY = "app_forward_from";
const FORWARD_TO_KEY = "app_forward_to";

function buildPath(to) {
  if (typeof to === "string") return to;
  return `${to.pathname || ""}${to.search || ""}`;
}

export default function SmartNavLink({ to, onClick, children, ...props }) {
  const location = useLocation();
  const navigate = useNavigate();

  const currentPath = location.pathname + location.search;
  const targetPath = buildPath(to);

  const handleClick = (e) => {
    onClick?.(e);
    if (e.defaultPrevented) return;

    const isMainClick = e.button === 0;
    const isModifiedClick = e.metaKey || e.altKey || e.ctrlKey || e.shiftKey;

    if (!isMainClick || isModifiedClick) return;

    const forwardFrom = sessionStorage.getItem(FORWARD_FROM_KEY);
    const forwardTo = sessionStorage.getItem(FORWARD_TO_KEY);

    const shouldGoForward =
      forwardFrom === currentPath && forwardTo === targetPath;

    if (shouldGoForward) {
      e.preventDefault();
      navigate(1);
    }
  };

  return (
    <NavLink to={to} onClick={handleClick} {...props}>
      {children}
    </NavLink>
  );
}
