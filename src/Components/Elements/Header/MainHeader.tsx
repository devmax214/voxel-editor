'use client'

import Image from "next/image";
import Link from "next/link";
import { usePathname, useParams } from "next/navigation";
import { ReactNode, useState, useEffect } from "react";
import { Box, Flex, Text, Stack, Button, Input } from "@chakra-ui/react";
import { GridProps } from "@chakra-ui/styled-system";
import ProfileCard from "./ProfileCard";
import { useBasicStore, useCompletedProjects, useThreeStore } from "@/store";
// import { changeProjectName } from "utils/api";
import { changeProjectName } from "@/Firebase/dbactions";
import { useProjectContext } from "@/contexts/projectContext";
import { useAuthContext } from "@/contexts/authContext";

const MainHeader = (props: GridProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const toggle = () => setIsOpen(prev => !prev);
    const pathName = usePathname();
    const { user } = useAuthContext();

    return (
        <NavBarContainer {...props}>
            <div className="flex items-center gap-x-4">
                <Image priority={true} src={"/Enlighten3D_logo.jpg"} alt="logo" width={70} height={70} className="h-auto" />
                <MenuLinks isOpen={isOpen} />
            </div>
            {pathName?.startsWith('/editor') && <div className="flex items-center gap-x-10">
                <FileNamgeChanger />
                <FileActionBar />
            </div>}
            {pathName?.startsWith('/view') && <FileNameViewer />}
            {user && <div className="flex items-center gap-x-4">
                <ProfileCard />
            </div>}
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

const FileNameViewer = () => {
    const params = useParams();
    const projectId = params?.projectId as string;
    const { populars } = useCompletedProjects();
    const current = populars.filter(popular => popular.id === projectId)[0];

    return (
        <div className="flex items-center">
            <div className="w-72 text-center">
                <Text className="text-lg" noOfLines={2}>{current?.name || "undefined"}</Text>
                <p className="text-black text-xs">{new Date(current?.lastModified).toLocaleString()}</p>
            </div>
        </div>
    )
}

const FileNamgeChanger = () => {
    const params = useParams();
    const projectId = params?.projectId as string;
    const [editing, setEditing] = useState<boolean>(false);
    const [name, setName] = useState<string>("");
    const { setLoading } = useBasicStore();
    const { projects, updateProject } = useProjectContext();
    const current = projects.filter(project => project.id === projectId)[0];

    const handleProjectName = async () => {
        if (editing) {
            setLoading(true);
            const res: any = await changeProjectName(projectId, name);
            updateProject(projectId, { name: res.name });
            setLoading(false);
        } else {
            setName(current.name);
        }
        setEditing(val => !val);
    }

    return (
        <div className="flex items-center">
            {
                editing ?
                <Input className="w-48 text-black" value={name} onChange={e => setName(e.target.value)} />
                :
                <>
                    <div className="w-60 text-center">
                        <Text className="text-lg" noOfLines={2}>{current?.name || "undefined"}</Text>
                        <p className="text-black text-xs">{new Date(current?.lastModified).toLocaleString()}</p>
                    </div>
                </>
            }
            <Button className="ml-2 uppercase" onClick={handleProjectName}>{editing ? 'save' : 'rename'}</Button>
        </div>
    );
}

const FileActionBar = () => {
    const { viewMode } = useBasicStore();

    const handleSave = () => {
        const evt = new KeyboardEvent('keyup', {
            bubbles: true,
            cancelable: true,
            code: "Backslash"
        });

        document.dispatchEvent(evt);
    }

    return (
        <div className="flex items-center gap-x-4">
            {viewMode === 'voxel' && <Button className="uppercase" onClick={handleSave}>save</Button>}
            <Button className="uppercase">feedback</Button>
        </div>
    );
}

export default MainHeader;
