'use client'

import Image from "next/image";
import { usePathname, useParams } from "next/navigation";
import { ReactNode, useState, useEffect } from "react";
import { Input } from "@chakra-ui/react";
import { Link, Box, Flex, Text, Stack, Button } from "@chakra-ui/react";
import { GridProps } from "@chakra-ui/styled-system";
import ProfileCard from "./ProfileCard";
import { useBasicStore, useThreeStore } from "@/store";
import { changeProjectName } from "utils/api";
import { useProjectContext } from "@/contexts/projectContext";
import { useAuthContext } from "@/contexts/authContext";
import { voxelCreated, updateVoxel } from "utils/api";

const MainHeader = (props: GridProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const toggle = () => setIsOpen(prev => !prev);
    const pathName = usePathname();

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
    const params = useParams();
    const projectId = params?.projectId as string;
    const [editing, setEditing] = useState<boolean>(false);
    const [name, setName] = useState<string>("");
    const { setLoading } = useBasicStore();
    const { projectName, setProjectName } = useThreeStore();
    const { updateProject } = useProjectContext();
    
    useEffect(() => {
        setName(projectName);
    }, [projectName]);

    const handleProjectName = async () => {
        if (editing) {
            setLoading(true);
            const res = await changeProjectName(projectId, name);
            setProjectName(res.name);
            updateProject(projectId, { name: res.name });
            setLoading(false);
        } else {
            setName(projectName);
        }
        setEditing(val => !val);
    }

    return (
        <div className="flex items-center">
            {
                editing ?
                <Input className="w-40 text-black" value={name} onChange={e => setName(e.target.value)} />
                :
                <>
                    <div className="w-40 text-center">
                        <p className="text-black">{name || "undefined"}</p>
                        <p className="text-black text-sm">Last Save</p>
                    </div>
                </>
            }
            <Button className="ml-2 uppercase" onClick={handleProjectName}>{editing ? 'save' : 'rename'}</Button>
        </div>
    );
}

const FileActionBar = () => {
    const params = useParams();
    const projectId = params?.projectId as string;
    const { user } = useAuthContext();
    const { projects, updateProject } = useProjectContext();
    const { setLoading } = useBasicStore();
    const { voxels } = useThreeStore();

    const handleSave = async () => {
        if (user) {
            setLoading(true);
            const current = projects.filter(project => project.id === projectId)[0];
            const voxelData = voxels.map(voxel => ({x: voxel.x, y: voxel.y, z: voxel.z}));
            if (current.voxelData.length === 0) {
                const res = await voxelCreated(user.uid, projectId, 10, voxelData);
                updateProject(projectId, { status: res.project.status, voxelData: voxelData });
            } else {
                const res = await updateVoxel(projectId, voxelData);
                updateProject(projectId, { voxelData: voxelData });
            }
            setLoading(false);
        }
    }

    return (
        <div className="flex items-center gap-x-4">
            <Button className="uppercase" onClick={handleSave}>save</Button>
            <Button className="uppercase">feedback</Button>
        </div>
    );
}

export default MainHeader;
