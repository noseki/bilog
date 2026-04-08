import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export const useIsLocationState = (path: string) => {
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        if (!location.state) {
            navigate(path);
        }
    }, [location.state, navigate, path]);
};
