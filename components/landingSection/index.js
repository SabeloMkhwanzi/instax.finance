import React from "react";
import {
  Stack,
  Button,
  Text,
  VStack,
  useBreakpointValue,
  useColorModeValue,
  Box,
  Container,
} from "@chakra-ui/react";
import HeaderSection from "./headerSection";
import { Petrona, Prata, Khand } from "@next/font/google";
import Link from "next/link";
import PlatformSection from "./platformSection";
import PillPity from "pill-pity";
import ProjectStackSection from "./projectStackSection";
import TeamSection from "./teamSection";
import Footersection from "./footersection";

const petrona = Petrona({ weight: "500", preload: false });
const prata = Prata({ weight: "400", preload: false });
const khand = Khand({ weight: "400", preload: false });

const styles = {
  main: {
    width: "100vw",
    height: "100vh",
  },

  video: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },

  overlay: {
    position: "absolute",
    top: "0",
    left: "0",
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0,0,0,.8)",
  },
  header: {
    position: "absolute",
    //position: "fixed",
    width: "100%",
    height: "100%",
  },

  content: {
    position: "absolute",
    width: "100%",
    height: "100%",
    position: "fixed",
    left: "0px",
    top: "0px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    color: "white",
  },

  platforms: {
    position: "relative",
    width: "100vw",
    backgroundColor: "#0E1E1F",
  },

  projectStack: {
    position: "relative",
    width: "100vw",
    backgroundColor: "#0E1E1F",
  },

  teamSection: {
    position: "relative",
    width: "100vw",
    backgroundColor: "#0E1E1F",
  },
  footerSection: {
    position: "relative",
    width: "100vw",
    backgroundColor: "#0E1E1F",
  },
};

export default function landingSection() {
  const patterFill = useColorModeValue("#00A4BD", "#0E1E1F");
  return (
    <>
      <Container mx="-1.75%">
        <Box className="main" style={styles.main}>
          <div className="overlay" style={styles.overlay}></div>
          <video
            className="video"
            style={styles.video}
            autoPlay
            muted
            loop
            playbackRates="0.4"
          >
            <source src="./footage1.mp4" type="video/mp4" />
          </video>

          <Box className="content" style={styles.content}>
            <div className="header" style={styles.header}>
              <HeaderSection />
            </div>
            <VStack
              w={"full"}
              justify={"center"}
              px={useBreakpointValue({ base: 4, md: 8 })}
            >
              <Stack maxW={"2xl"} align="center" spacing={10}>
                <Text
                  className={prata.className}
                  textAlign="center"
                  color={"white"}
                  fontWeight="extrabold"
                  lineHeight={1.2}
                  fontSize={useBreakpointValue({ base: "3xl", md: "4xl" })}
                >
                  Scaling Ethereum, Enhance liquidity
                </Text>
                <Text
                  className={khand.className}
                  textAlign="center"
                  color="gray.400"
                  fontWeight="xs"
                  lineHeight={1.2}
                  fontSize={useBreakpointValue({ base: "xs", md: "xl" })}
                  letterSpacing={2}
                >
                  Building the next best generation zkEVM Borrowing, Bridge,
                  Stableswap experience.
                </Text>

                <Stack direction={"row"}>
                  <Link
                    style={{ color: "inherit", textDecoration: "inherit" }}
                    href="/"
                  >
                    <Button
                      color="#000000"
                      bg="#14f094"
                      size="lg"
                      _hover={{ bg: "#14f094" }}
                      px={10}
                    >
                      <Text
                        letterSpacing={2}
                        fontWeight="extrabold"
                        className={khand.className}
                      >
                        BORROW
                      </Text>
                    </Button>
                  </Link>
                  <Link
                    style={{ color: "inherit", textDecoration: "inherit" }}
                    href="/"
                  >
                    <Button
                      borderColor="#14f094"
                      color="#14f094"
                      variant="outline"
                      size="lg"
                      _hover={{ bg: "#0E1E1F" }}
                      px={12}
                    >
                      <Text
                        letterSpacing={2}
                        fontWeight="extrabold"
                        className={khand.className}
                      >
                        LEND
                      </Text>
                    </Button>
                  </Link>
                </Stack>
              </Stack>
            </VStack>
          </Box>
        </Box>
      </Container>
      <Container mx="-1.7%">
        <PillPity
          borderTopWidth={0.5}
          borderTopColor="#012604"
          className="platforms"
          style={styles.platforms}
          pattern="topography"
          patternFill={patterFill}
          patternOpacity={0.1}
        >
          <PlatformSection />
        </PillPity>
      </Container>
      <Container mx="-1.7%">
        <Box
          borderTopWidth={0.5}
          borderTopColor="#012604"
          className="projectStack"
          style={styles.projectStack}
        >
          <ProjectStackSection />
        </Box>
      </Container>
      <Container mx="-1.7%">
        <PillPity
          borderTopWidth={0.5}
          borderTopColor="#012604"
          className="teamSection"
          style={styles.teamSection}
          pattern="topography"
          patternFill={patterFill}
          patternOpacity={0.1}
        >
          <TeamSection />
        </PillPity>
      </Container>
      {/* <Container mx="-1.7%">
        <Box
          borderTopWidth={0.5}
          borderTopColor="#012604"
          className="footerSection"
          style={styles.footerSection}
        >
          <Footersection />
        </Box>
      </Container> */}
    </>
  );
}
