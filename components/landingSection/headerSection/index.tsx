import React from "react";
import {
  Box,
  Flex,
  HStack,
  Divider,
  useDisclosure,
  Stack,
  IconButton,
  Button,
  Image,
  Text,
  Center,
} from "@chakra-ui/react";
import { HamburgerIcon, CloseIcon } from "@chakra-ui/icons";
import { Petrona, Prata, Khand } from "@next/font/google";
import Link from "next/link";

const petrona = Petrona({ weight: "500", preload: false });
const prata = Prata({ weight: "400", preload: false });
const khand = Khand({ weight: "400", preload: false });

export default function HeaderSection() {
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <>
      <Box
        bg="#0E1E1F"
        sx={{ backdropFilter: "blur(20%)", borderBottom: 0 }}
        width="100wv"
        padding="20px 60px"
      >
        <Flex h={10} alignItems={"center"} justifyContent={"space-between"}>
          <IconButton
            borderColor="#14f094"
            color="#14f094"
            variant="outline"
            _hover={{ bg: "#006600" }}
            size="xs"
            icon={isOpen ? <CloseIcon /> : <HamburgerIcon />}
            aria-label={"Open Menu"}
            display={{ md: "none" }}
            onClick={isOpen ? onClose : onOpen}
          />

          <Link
            style={{ color: "inherit", textDecoration: "inherit" }}
            href="/"
          >
            <Image
              src="/instax.fi-3.png"
              alt="instax.fi-3"
              width="8vw"
              height="calc(9vw*0.3)"
              display={{ base: "none", md: "flex" }}
            />
          </Link>

          <HStack spacing={5} alignItems={"center"}>
            <HStack
              as={"nav"}
              spacing={4}
              display={{ base: "none", md: "flex" }}
            >
              <Stack
                direction={"row"}
                spacing={5}
                justify={"center"}
                align={"center"}
              >
                <Link
                  style={{ color: "inherit", textDecoration: "inherit" }}
                  href="#about"
                >
                  <Text
                    letterSpacing={1}
                    fontWeight="extraBold"
                    className={petrona.className}
                    color={"white"}
                    fontSize={{ base: "md", md: "lg" }}
                  >
                    About
                  </Text>
                </Link>
                <Divider
                  colorScheme="whiteAlpha"
                  variant="solid"
                  orientation="vertical"
                />
                <Link
                  style={{ color: "inherit", textDecoration: "inherit" }}
                  href="#technologies"
                >
                  <Text
                    letterSpacing={1}
                    fontWeight="extraBold"
                    className={petrona.className}
                    color={"white"}
                    fontSize={{ base: "md", md: "lg" }}
                  >
                    Technologies
                  </Text>
                </Link>
                <Divider
                  colorScheme="whiteAlpha"
                  variant="solid"
                  orientation="vertical"
                />
                <Link
                  style={{ color: "inherit", textDecoration: "inherit" }}
                  href="#team"
                >
                  <Text
                    letterSpacing={1}
                    fontWeight="extraBold"
                    className={petrona.className}
                    color={"white"}
                    fontSize={{ base: "md", md: "lg" }}
                  >
                    Team
                  </Text>
                </Link>
                <Divider
                  colorScheme="whiteAlpha"
                  variant="solid"
                  orientation="vertical"
                />
                <Link
                  style={{ color: "inherit", textDecoration: "inherit" }}
                  href="https://github.com/SabeloMkhwanzi/instax.finance"
                  target="_blank"
                >
                  <Text
                    letterSpacing={1}
                    fontWeight="extraBold"
                    className={petrona.className}
                    color={"white"}
                    fontSize={{ base: "md", md: "lg" }}
                  >
                    Docs
                  </Text>
                </Link>
              </Stack>
            </HStack>
          </HStack>

          <Flex alignItems="center" display={{ base: "none", md: "flex" }}>
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
          </Flex>
        </Flex>

        {isOpen ? (
          <Box pb={4} display={{ md: "none" }}>
            <Stack as={"nav"} spacing={7}>
              <Link
                style={{ color: "inherit", textDecoration: "inherit" }}
                href="/"
              >
                <Text
                  letterSpacing={1}
                  fontWeight="extraBold"
                  className={petrona.className}
                  color={"white"}
                  fontSize={{ base: "md", md: "lg" }}
                >
                  About
                </Text>
              </Link>
              <Link
                style={{ color: "inherit", textDecoration: "inherit" }}
                href="/"
              >
                <Text
                  letterSpacing={1}
                  fontWeight="extraBold"
                  className={petrona.className}
                  color={"white"}
                  fontSize={{ base: "md", md: "lg" }}
                >
                  Technologies
                </Text>
              </Link>
              <Link
                style={{ color: "inherit", textDecoration: "inherit" }}
                href="/"
              >
                <Text
                  letterSpacing={1}
                  fontWeight="extraBold"
                  className={petrona.className}
                  color={"white"}
                  fontSize={{ base: "md", md: "lg" }}
                >
                  Team
                </Text>
              </Link>
              <Link
                style={{ color: "inherit", textDecoration: "inherit" }}
                href="/"
              >
                <Text
                  letterSpacing={1}
                  fontWeight="extraBold"
                  className={petrona.className}
                  color={"white"}
                  fontSize={{ base: "md", md: "lg" }}
                >
                  Docs
                </Text>
              </Link>
              <Center>
                <Link
                  style={{ color: "inherit", textDecoration: "inherit" }}
                  href="/"
                >
                  <Button
                    borderColor="#14f094"
                    color="#14f094"
                    variant="outline"
                    size="lg"
                    _hover={{ bg: "#006600" }}
                  >
                    Enter App
                  </Button>
                </Link>
              </Center>
            </Stack>
          </Box>
        ) : null}
      </Box>
    </>
  );
}
