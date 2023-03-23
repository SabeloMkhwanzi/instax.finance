import { useState, useEffect, useRef } from "react";
import { useSelector, shallowEqual } from "react-redux";
import { Puff } from "react-loader-spinner";
import { RiRefreshFill } from "react-icons/ri";
import { Button } from "@chakra-ui/react";

import Image from "../../image";
import Items from "./items";
import { getChain } from "../../../lib/object/chain";
import { loaderColor } from "../../../lib/utils";

export default ({ chain_id }) => {
  const { preferences, chains } = useSelector(
    (state) => ({
      preferences: state.preferences,
      chains: state.chains,
    }),
    shallowEqual
  );
  const { theme } = { ...preferences };
  const { chains_data } = { ...chains };

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

  const chain_data = getChain(chain_id, chains_data);

  const { short_name, image } = { ...chain_data };

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={onClick}
        className="flex items-center justify-center w-10 h-16 sm:w-12"
      >
        {chain_data ? (
          image ? (
            <Image
              src={image}
              width={30}
              height={30}
              className="rounded-full"
            />
          ) : (
            <span className="font-semibold">{short_name}</span>
          )
        ) : chains_data ? (
          <RiRefreshFill
            size={20}
            className="transition duration-300 ease-in-out transform hover:-rotate-180 hover:animate-spin-one-time"
          />
        ) : (
          <Puff width="24" height="24" color={loaderColor(theme)} />
        )}
      </button>
      <div
        ref={dropdownRef}
        className={`dropdown ${
          hidden ? "" : "open"
        } absolute top-0 left-3 mt-12`}
      >
        <div className="dropdown-content w-36 bottom-start">
          <Items onClick={onClick} />
        </div>
      </div>
    </div>
  );
};
