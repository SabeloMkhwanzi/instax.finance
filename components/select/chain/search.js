import { useState } from "react";
import { FiSearch } from "react-icons/fi";

import Chains from "./chains";

export default ({ value, onSelect, source, destination, isPool = false }) => {
  const [inputSearch, setInputSearch] = useState("");

  return (
    <div className="mt-1 navbar-search">
      <div className="relative">
        <input
          value={inputSearch}
          onChange={(e) => setInputSearch(e.target.value)}
          type="search"
          placeholder="Search"
          className="w-full h-10 pl-10 pr-5 text-sm bg-transparent border appearance-none rounded-xl border-slate-200 dark:border-slate-800"
        />
        <div className="absolute top-0 left-0 mt-3 ml-4">
          <FiSearch className="w-4 h-4 stroke-current" />
        </div>
        <div className="w-full pt-4 pb-2 mx-auto">
          <Chains
            value={value}
            inputSearch={inputSearch}
            onSelect={(c) => {
              if (onSelect) {
                onSelect(c);
              }
            }}
            source={source}
            destination={destination}
            isPool={isPool}
          />
        </div>
      </div>
    </div>
  );
};
