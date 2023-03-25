import React from "react";
import {
  Container,
  Stack,
  Flex,
  Box,
  Heading,
  Text,
  Button,
  Image,
  Badge,
  Center,
  useBreakpointValue,
} from "@chakra-ui/react";
import Link from "next/link";
import { Petrona, Prata, Khand } from "@next/font/google";
const petrona = Petrona({ weight: "500", preload: false });
const prata = Prata({ weight: "400", preload: false });
const khand = Khand({ weight: "400", preload: false });

const styles = {
  img: {
    filter: "grayscale(1) invert(1)",
    webkitFilter: "grayscale(1) invert(1)",
  },
};

export default function ProjectStackSection() {
  return (
    <Container id="technologies" maxW={"4xl"}>
      <Stack flex={1} spacing={{ base: 2, md: 10 }}>
        <Heading
          lineHeight={1.1}
          fontWeight={600}
          fontSize={{ base: "3xl", sm: "4xl", lg: "6xl" }}
        >
          <Center mt={10}>
            <Badge
              mx={4}
              mb={4}
              px={2}
              py={2}
              rounded="lg"
              fontSize="lg"
              bgGradient="linear(to-r, teal.500, green.500)"
              boxShadow={
                "0px 1px 25px -5px rgb(66 153 225 / 48%), 0 10px 10px -5px rgb(66 153 225 / 43%)"
              }
            >
              <Text
                fontSize={useBreakpointValue({ base: "xs", md: "lg" })}
                fontWeight="lg"
                color="white"
                className={petrona.className}
              >
                Project Stack
              </Text>
            </Badge>
          </Center>
          <Text
            className={prata.className}
            textAlign="center"
            color={"white"}
            fontWeight="extrabold"
            //lineHeight={1}
            fontSize={useBreakpointValue({ base: "3xl", md: "4xl" })}
          >
            Hackathon Sponsors
          </Text>
        </Heading>
      </Stack>
      <Stack
        // align={"center"}

        py={{ base: 3, md: 6 }}
        direction={["column", "row"]}
      >
        <Flex
          flex={1}
          justify={"center"}
          align={"center"}
          position={"relative"}
          //w={"full"}
        >
          <Image
            mx={1}
            alt="gnosis chain"
            width={20}
            height={10}
            src={"https://thegraph.com/images/landing/networks/gnosis.svg"}
          />

          <Image
            boxSize="5px"
            mx={1}
            alt="polygon chain"
            width={20}
            height={10}
            src={"https://thegraph.com/images/landing/networks/polygon.svg"}
          />
          <Image
            mx={1}
            alt="optimism chain"
            width={20}
            height={10}
            src={"https://thegraph.com/images/landing/networks/optimism.svg"}
          />

          <Image
            mx={1}
            alt="ethereum chain"
            width={20}
            height={10}
            src={"https://thegraph.com/images/landing/networks/ethereum.svg"}
          />
          <Image
            className="img"
            style={styles.img}
            color="white"
            mx={1}
            src="https://scroll.io/static/media/logo_with_text.7c6cafcac81093d6f83b.png"
            alt="scroll Protocol"
            width={20}
            height={10}
          />
          {/* <Image
            className="img"
            style={styles.img}
            color="white"
            mx={4}
            alt="the Graph Protocol"
            width={200}
            height={70}
            src={
              "https://seeklogo.com/images/T/the-graph-grt-logo-B6802F6411-seeklogo.com.png"
            }
          /> */}
          <Image
            className="img"
            style={styles.img}
            color="white"
            mx={1}
            alt=" Push Protocol"
            width={20}
            height={10}
            src={
              "https://cdn-images-1.medium.com/max/470/1*Q9Sp33ZEP120iVD25eV3OA@2x.png"
            }
          />

          <Image
            className="img"
            style={styles.img}
            color="white"
            mx={1}
            src="https://lever-client-logos.s3.us-west-2.amazonaws.com/c3aed10b-b4d5-4c63-bf10-ab3393157986-1629391519811.png"
            alt="Connext Protocol"
            width={20}
            height={10}
          />

          {/* <Image
            className="img"
            style={styles.img}
            color="white"
            mx={4}
            src="https://strapi-website-assets.s3.eu-west-2.amazonaws.com/logo_f7186351bf.svg"
            alt="instax.fi-3"
            width={200}
            height={70}
          /> */}
        </Flex>
      </Stack>
    </Container>
  );
}
