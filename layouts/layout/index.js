import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { useSelector, useDispatch, shallowEqual } from "react-redux";
import PageVisibility from "react-page-visibility";
import PillPity from "pill-pity";
import { useColorModeValue } from "@chakra-ui/react";

import Navbar from "../../components/navbar";
import Footer from "../../components/footer";
import meta from "../../lib/meta";
import { equalsIgnoreCase } from "../../lib/utils";
import { THEME, PAGE_VISIBLE } from "../../reducers/types";

export default ({ children }) => {
  const patterFill = useColorModeValue("#00A4BD", "#BDE1E5");
  const dispatch = useDispatch();
  const { preferences, chains, assets } = useSelector(
    (state) => ({
      preferences: state.preferences,
      chains: state.chains,
      assets: state.assets,
    }),
    shallowEqual
  );
  const { theme } = { ...preferences };
  const { chains_data } = { ...chains };
  const { assets_data } = { ...assets };

  const router = useRouter();
  const { asPath } = { ...router };

  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      localStorage.getItem(THEME) &&
      localStorage.getItem(THEME) !== theme
    ) {
      dispatch({
        type: THEME,
        value: localStorage.getItem(THEME),
      });
    }
  }, [theme]);

  const headMeta = meta(asPath, null, chains_data, assets_data);

  const { title, description, image, url } = { ...headMeta };

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="og:site_name" property="og:site_name" content={title} />
        <meta name="og:title" property="og:title" content={title} />
        <meta itemProp="name" content={title} />
        <meta itemProp="headline" content={title} />
        <meta itemProp="publisher" content={title} />
        <meta name="twitter:title" content={title} />

        <meta name="description" content={description} />
        <meta
          name="og:description"
          property="og:description"
          content={description}
        />
        <meta itemProp="description" content={description} />
        <meta name="twitter:description" content={description} />

        <meta name="og:image" property="og:image" content={image} />
        <meta itemProp="thumbnailUrl" content={image} />
        <meta itemProp="image" content={image} />
        <meta name="twitter:image" content={image} />
        <link rel="image_src" href={image} />

        <meta name="og:url" property="og:url" content={url} />
        <meta itemProp="url" content={url} />
        <meta name="twitter:url" content={url} />
        <link rel="canonical" href={url} />
      </Head>
      <PageVisibility
        onChange={(v) =>
          dispatch({
            type: PAGE_VISIBLE,
            value: v,
          })
        }
      >
        <div
          data-layout="layout"
          data-background={theme}
          data-navbar={theme}
          className={`antialiased ${"disable-scrollbars"} text-sm ${theme}`}
        >
          <div className="wrapper">
            <PillPity
              borderTopWidth={0.5}
              borderTopColor="#012604"
              pattern="topography"
              patternFill={patterFill}
              patternOpacity={0.1}
              className="w-full bg-white main dark:hover:bg-[#112727]"
              style={{
                minHeight: "calc(100vh - 64px)",
                backgroundColor: theme === "light" ? "#ececec" : "#0E151B",
              }}
            >
              <Navbar />
              <div className="w-full px-2 sm:px-4">{children}</div>
            </PillPity>
          </div>

          <Footer />
        </div>
      </PageVisibility>
    </>
  );
};
