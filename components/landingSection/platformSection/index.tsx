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

export default function PlatformSection() {
  return (
    <Container id="About" maxW={"4xl"}>
      <Stack
        align={"center"}
        spacing={{ base: 8, md: 10 }}
        py={{ base: 10, md: 12 }}
        direction={{ base: "column", md: "row" }}
      >
        <Stack flex={1} spacing={{ base: 2, md: 10 }}>
          <Heading
            lineHeight={1.1}
            fontWeight={600}
            fontSize={{ base: "3xl", sm: "4xl", lg: "6xl" }}
          >
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
                Instax App
              </Text>
            </Badge>

            <Text
              className={prata.className}
              textAlign="center"
              color={"white"}
              fontWeight="extrabold"
              //lineHeight={1}
              fontSize={useBreakpointValue({ base: "3xl", md: "4xl" })}
            >
              Fast, Efficient, Stable Liquidity.
            </Text>

            <Text
              className={prata.className}
              textAlign="center"
              fontWeight="extrabold"
              //lineHeight={1}
              fontSize={useBreakpointValue({ base: "3xl", md: "4xl" })}
              as={"span"}
              color="#14f094"
            >
              Provide, earn yield, Bridge, Swaps.
            </Text>
          </Heading>
          <Text
            className={khand.className}
            textAlign="center"
            fontWeight="xs"
            fontSize={useBreakpointValue({ base: "xs", md: "xl" })}
            letterSpacing={2}
            color={"gray.400"}
          >
            Capitalize your assets to earn interests, Move tokens and data using
            xCall, access Liquidity and data anyway
          </Text>

          <Center>
            <Link
              style={{ color: "inherit", textDecoration: "inherit" }}
              href="/swap"
            >
              <Button
                borderColor="#14f094"
                color="#14f094"
                variant="outline"
                size="lg"
                _hover={{ bg: "#0E1E1F" }}
              >
                <Text
                  letterSpacing={2}
                  fontSize="xl"
                  fontWeight="extrabold"
                  className={khand.className}
                >
                  Enter App
                </Text>
              </Button>
            </Link>
          </Center>
        </Stack>
        <Flex
          flex={1}
          justify={"center"}
          align={"center"}
          position={"relative"}
          w={"full"}
        >
          <Box
            position={"relative"}
            height={"350px"}
            rounded={"2xl"}
            width={"full"}
            overflow={"hidden"}
            //borderWidth={2}
            //borderColor="#14f094"
            // boxShadow={
            //   "0px 1px 25px -5px rgb(66 153 225 / 48%), 0 10px 10px -5px rgb(66 153 225 / 43%)"
            // }
          >
            <Image
              //borderWidth={5}
              //borderColor="gray.500"
              alt={"Hero Image"}
              fit={"cover"}
              align={"center"}
              w={"100%"}
              h={"100%"}
              src="/TenderApp.png"
            />
          </Box>
        </Flex>
      </Stack>
    </Container>
  );
}
