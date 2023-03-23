import React from "react";
import {
  Box,
  chakra,
  Container,
  Stack,
  Text,
  useColorModeValue,
  VisuallyHidden,
  useBreakpointValue,
} from "@chakra-ui/react";
import { FaGithub, FaTwitter, FaDiscord } from "react-icons/fa";
import { Petrona, Prata, Khand } from "@next/font/google";
import Link from "next/link";

const khand = Khand({ weight: "400", preload: false });

const SocialButton = ({ children, label, href }) => {
  return (
    <chakra.button
      bg={useColorModeValue("blackAlpha.100", "whiteAlpha.100")}
      rounded={"full"}
      w={8}
      h={8}
      cursor={"pointer"}
      as={"a"}
      href={href}
      display={"inline-flex"}
      alignItems={"center"}
      justifyContent={"center"}
      transition={"background 0.3s ease"}
      _hover={{
        bg: useColorModeValue("blackAlpha.200", "whiteAlpha.200"),
      }}
    >
      <VisuallyHidden>{label}</VisuallyHidden>
      {children}
    </chakra.button>
  );
};

export default function Footersection() {
  return (
    <Box
      position="relative"
      bg="#0E1E1F"
      borderColor="#14f094"
      color="gray.500"
    >
      <Container
        as={Stack}
        maxW={"6xl"}
        py={4}
        direction={{ base: "column", md: "row" }}
        spacing={4}
        justify={{ base: "center", md: "space-between" }}
        align={{ base: "center", md: "center" }}
      >
        <Link style={{ color: "inherit", textDecoration: "inherit" }} href="/">
          <Text
            className={khand.className}
            textAlign="center"
            fontWeight="xs"
            fontSize={useBreakpointValue({ base: "xs", md: "xl" })}
            letterSpacing={2}
            color={"gray.400"}
          >
            {" "}
            © {new Date().getFullYear()} Instax.fi
          </Text>
        </Link>

        <Stack direction={"row"} spacing={6}>
          <SocialButton label={"Twitter"} href={"#"}>
            <FaTwitter />
          </SocialButton>
          <SocialButton
            label={"github"}
            href={"https://github.com/SabeloMkhwanzi/instax.finance"}
          >
            <FaGithub />
          </SocialButton>
          <SocialButton label={"discord"} href={"#"}>
            <FaDiscord />
          </SocialButton>
        </Stack>
      </Container>
    </Box>
  );
}
