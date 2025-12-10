import React, { useState, useEffect } from 'react';
import PageLoader from '../components/PageLoader';
import ExperienceComponent from '../components/Experience';

const Experience = () => {
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Simulate loading for smooth transition or actual data fetch time
        const timer = setTimeout(() => {
            setLoading(false);
        }, 500);
        return () => clearTimeout(timer);
    }, []);

    if (loading) {
        return <PageLoader />;
    }

    return (
        <div className="page-container">
            <ExperienceComponent />
        </div>
    );
};

export default Experience;
