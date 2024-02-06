import Image from "next/image";
import { ReactNode, useState } from "react";
import { Link, Box, Flex, Text, Stack, Input, Button } from "@chakra-ui/react";
import { GridProps } from "@chakra-ui/styled-system";
import ProfileCard from "./ProfileCard";

const MainHeader = (props: GridProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const toggle = () => setIsOpen(prev => !prev);

    return (
        <NavBarContainer {...props}>
            <div className="flex items-center gap-x-4">
                <Image src={"/Enlighten3D_logo.jpg"} alt="logo" width={70} height={50} />
                <MenuLinks isOpen={isOpen} />
            </div>
            <div className="flex items-center gap-x-10">
                <FileNamgeChanger />
                <FileActionBar />
            </div>
            <div className="flex items-center gap-x-4">
                <ProfileCard />
            </div>
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
            p={2}
            bg={["primary.500", "primary.500", "transparent", "transparent"]}
            color={["white", "white", "primary.700", "primary.700"]}
            height={"80px"}
            {...props}
        >
            {children}
        </Flex>
    );
};

const FileNamgeChanger = () => {
    return (
        <div className="flex items-center">
            {/* <Input className="w-40" /> */}
            <div className="w-40 text-center">
                <p className="text-black">File Name</p>
                <p className="text-black text-sm">Last Save</p>
            </div>
            <Button className="uppercase">rename</Button>
        </div>
    );
}

const FileActionBar = () => {
    return (
        <div className="flex items-center gap-x-4">
            <Button className="uppercase">save</Button>
            <Button className="uppercase">feedback</Button>
        </div>
    );
}

export default MainHeader;
