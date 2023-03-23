import { Box } from "@chakra-ui/react";
import { Tooltip } from "@material-tailwind/react";
import Link from "next/link";
import { BsArrowLeft } from "react-icons/bs";

import Image from "../../image";

export default () => {
  return (
    <Box className="logo flex flex-col items-start ml-3 mr-0.5 sm:mr-3">
      <Link
        title="Instax.fi"
        href="/"
        rel="noopener noreferrer"
        className="flex flex-col items-start w-full"
      >
        <div className="flex items-center space-x-1 min-w-max sm:mr-3">
          <div className="flex items-center dark:hidden">
            <div className="flex sm:hidden">
              <Image src="/logos/logo.png" width={32} height={32} />
            </div>
            <div className="hidden sm:flex">
              <Image src="/logos/logo_with_name.png" width={128} height={32} />
            </div>
          </div>
          <div className="items-center hidden dark:flex">
            <div className="flex sm:hidden">
              <Image src="/logos/logo_white.png" width={32} height={32} />
            </div>
            <div className="hidden sm:flex">
              <Image
                src="/logos/logo_with_name_white.png"
                width={128}
                height={32}
              />
            </div>
          </div>
          <div className="px-2 py-1 rounded-lg text-xs font-semibold uppercase max-w-min bg-slate-200 dark:bg-[#112727] whitespace-nowrap text-slate-600 dark:text-white">
            Beta
          </div>
        </div>
      </Link>
      <div className="flex items-center ml-0 space-x-2 sm:ml-11">
        <div className="hidden sm:block">
          {process.env.NEXT_PUBLIC_NETWORK === "testnet" && (
            <div className="text-xs lowercase max-w-min whitespace-nowrap text-slate-400 dark:text-slate-500">
              {process.env.NEXT_PUBLIC_NETWORK}
            </div>
          )}
        </div>
      </div>
    </Box>
  );
};
