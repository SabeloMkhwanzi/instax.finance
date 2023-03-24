import React from "react";
import {
  Heading,
  Avatar,
  Box,
  Center,
  Text,
  Stack,
  Badge,
  useBreakpointValue,
  Flex,
} from "@chakra-ui/react";
import { Petrona, Prata, Khand } from "@next/font/google";
const petrona = Petrona({ weight: "500", preload: false });
const prata = Prata({ weight: "400", preload: false });
const khand = Khand({ weight: "400", preload: false });

export default function TeamSection() {
  return (
    <Center id="team" py={6}>
      <Stack mb={16} flex={1} spacing={{ base: 2, md: 10 }}>
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
                who we are
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
            Our Team
          </Text>
        </Heading>

        <Flex
          flex={1}
          justify={"center"}
          align={"center"}
          position={"relative"}
          //w={"full"}
        >
          <Box
            maxW={"320px"}
            height="450px"
            w={"full"}
            bg="#0E1E1F"
            borderWidth={2}
            borderColor="#14f094"
            boxShadow={
              "0px 1px 25px -5px rgb(66 153 225 / 48%), 0 10px 10px -5px rgb(66 153 225 / 43%)"
            }
            rounded={"lg"}
            p={6}
            textAlign={"center"}
          >
            <Avatar
              borderWidth={10}
              borderColor="gray.500"
              size={"4xl"}
              src={"https://avatars.githubusercontent.com/u/67804592?v=4"}
              mb={4}
              pos={"relative"}
              name="Sabelo Mkhwanazi"
            />
            <Heading fontSize={"2xl"} fontFamily={"body"}>
              Sabelo Mkhwanazi
            </Heading>
            <Text fontWeight={600} color={"gray.400"} mb={4}>
              Software Developer
            </Text>
          </Box>
        </Flex>
      </Stack>
    </Center>
  );
}
