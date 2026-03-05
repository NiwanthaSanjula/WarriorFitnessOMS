
import { useNavigate, useLocation } from 'react-router-dom';

export const useScrollTo = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const scrollTo = (sectionId: string) => {
        const doScroll = () => {
            const el = document.getElementById(sectionId);
            if (el) {
                el.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        };

        if (location.pathname !== '/') {
            // Navigate to home first, then scroll after page loads
            navigate('/');
            setTimeout(doScroll, 100);
        } else {
            doScroll();
        }
    };

    return scrollTo;
};