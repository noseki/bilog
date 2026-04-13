import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardAction,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useNavigate, useParams } from "react-router-dom";
import { Ellipsis, PencilIcon, TrashIcon } from 'lucide-react';
import { useDeleteLog } from "./useLogs";

export const LogDetailPage = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const deleteMutation = useDeleteLog();

    const handleDelete = async (id: string) => {
        if (!window.confirm(`記録を削除しますか？`)) return;
        deleteMutation.mutate(id);
        navigate("/log-timeline");
    };

    return (
        <>
            <Button
                    variant="ghost"
                    onClick={() => navigate(-1)}
                    className="text-sm"
            >
                    ← 戻る
            </Button>
            <Card className="relative mx-auto w-full max-w-sm pt-0">
                <div className="absolute inset-0 z-30 aspect-video bg-black/35" />
                <img
                src="https://avatar.vercel.sh/shadcn1"
                alt="Event cover"
                className="relative z-20 aspect-video w-full object-cover brightness-60 grayscale dark:brightness-40"
                />
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="flex justify-end mr-2"><Ellipsis /></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuGroup>
                            <DropdownMenuItem>
                                <PencilIcon />
                                編集する
                            </DropdownMenuItem>
                            <DropdownMenuItem variant="destructive" onClick={() => handleDelete(String(id))}>
                                <TrashIcon />
                                削除する
                            </DropdownMenuItem>
                        </DropdownMenuGroup>
                    </DropdownMenuContent>
                </DropdownMenu>
                <CardHeader>
                    <CardAction>
                        <Badge variant="secondary">Featured</Badge>
                    </CardAction>
                    <CardTitle>Design systems meetup</CardTitle>
                    <CardDescription>
                    A practical talk on component APIs, accessibility, and shipping
                    faster.
                    </CardDescription>
                </CardHeader>
                <CardFooter>
                    <Button className="w-full">View Event</Button>
                </CardFooter>
            </Card>
        </>
    );
};
