import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button"
import { PlusIcon } from "lucide-react"
import { CategoryPhotoTimeline } from "./CategoryPhotoTimeline";

export const HomePage = () => {
    return (
        <div className="mx-auto w-full max-w-sm">
            <Link to="/add"
                className="text-gray-600 hover:text-indigo-600 font-medium transition-colors"
            ></Link>
            <div className="flex justify-end">
                <Button asChild variant="outline" >
                    <Link to="/add-log">
                        <PlusIcon />
                        記録する
                    </Link>
                </Button>
            </div>
            <CategoryPhotoTimeline />
        </div>
    );
};
