import { useState, useEffect, useRef } from "react";
import { FiMenu } from "react-icons/fi";

import Items from "./items";

export default () => {
  const [hidden, setHidden] = useState(true);

  const buttonRef = useRef(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        hidden ||
        buttonRef.current.contains(e.target) ||
        dropdownRef.current.contains(e.target)
      ) {
        return false;
      }

      setHidden(!hidden);
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [hidden, buttonRef, dropdownRef]);

  const onClick = () => setHidden(!hidden);

  return (
    <div className="relative block lg:hidden">
      <button
        ref={buttonRef}
        onClick={onClick}
        className="flex items-center justify-center w-10 h-16 sm:w-12"
      >
        <FiMenu size={24} />
      </button>
      <div
        ref={dropdownRef}
        className={`dropdown ${
          hidden ? "" : "open"
        } absolute top-0 left-3 mt-12`}
      >
        <div className="w-40 dropdown-content bottom-start">
          <Items onClick={onClick} />
        </div>
      </div>
    </div>
  );
};
