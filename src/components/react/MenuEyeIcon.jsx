export default function MenuEyeIcon({ isMenuOpen, color = "black" }) {
  return isMenuOpen ? (
    // Closed eye icon
    <svg
      width="32"
      height="32"
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-8 h-8"
    >
      <path
        d="M29.3366 9.65934C29.3366 9.65934 23.3659 17.6593 16.0033 17.6593C8.64059 17.6593 2.66992 9.65934 2.66992 9.65934M3.66992 19.1593L7.66992 15.1593M11.6699 22.1593L12.6699 17.1593M21.1699 22.1593L19.6699 17.1593M28.6699 18.6593L24.6699 14.6593"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ) : (
    // Open eye icon
    <svg
      width="32"
      height="32"
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-8 h-8"
    >
      <path
        d="M29.3337 16C29.3337 16 23.363 24 16.0003 24C8.63766 24 2.66699 16 2.66699 16"
        stroke={color}
        strokeWidth="2"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M16 20C17.0609 20 18.0783 19.5786 18.8284 18.8284C19.5786 18.0783 20 17.0609 20 16C20 14.9391 19.5786 13.9217 18.8284 13.1716C18.0783 12.4214 17.0609 12 16 12C14.9391 12 13.9217 12.4214 13.1716 13.1716C12.4214 13.9217 12 14.9391 12 16C12 17.0609 12.4214 18.0783 13.1716 18.8284C13.9217 19.5786 14.9391 20 16 20Z"
        stroke={color}
        strokeWidth="2"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M29.6667 15.5C29.6667 15.5 23.696 7.5 16.3333 7.5C8.97067 7.5 3 15.5 3 15.5M4 6L8 10M12 3L13 8M21.5 3L20 8M29 6.5L25 10.5"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
