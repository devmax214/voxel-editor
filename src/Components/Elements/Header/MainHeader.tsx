import { ReactNode, useState } from "react";
import { Link, Box, Flex, Text, Button, Stack } from "@chakra-ui/react";
import { GridProps } from "@chakra-ui/styled-system";
import ProfileCard from "./ProfileCard";


const MainHeader = (props: GridProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const toggle = () => setIsOpen(prev => !prev);

    return (
        <NavBarContainer {...props}>
            <Text fontSize='lg'>Logo</Text>
            <MenuLinks isOpen={isOpen} />
        </NavBarContainer>
    );
};


const MenuItem = ({ children, isLast, to = "/", ...rest }: { children: ReactNode, isLast?: boolean, to: string }) => {
    return (
        <Link href={to}>
            <Text display="block" {...rest}>
                {children}
            </Text>
        </Link>
    );
};

const MenuLinks = ({ isOpen }: { isOpen: boolean }) => {
    return (
        <Box
            display={{ base: isOpen ? "block" : "none", md: "block" }}
            flexBasis={{ base: "100%", md: "auto" }}
        >
            <Stack
                spacing={8}
                align="center"
                justify={["center", "space-between", "flex-end", "flex-end"]}
                direction={["column", "row", "row", "row"]}
                pt={[4, 4, 0, 0]}
            >
                <MenuItem to="/">Home</MenuItem>
                <MenuItem to="/editor"> Editor </MenuItem>
                <ProfileCard />
            </Stack>
        </Box>
    );
};

const NavBarContainer = ({ children, ...props }: { children: ReactNode }) => {
    return (
        <Flex
            as="nav"
            align="center"
            justify="space-between"
            wrap="wrap"
            w="100%"
            p={8}
            bg={["primary.500", "primary.500", "transparent", "transparent"]}
            color={["white", "white", "primary.700", "primary.700"]}
            {...props}
        >
            {children}
        </Flex>
    );
};

export default MainHeader;
