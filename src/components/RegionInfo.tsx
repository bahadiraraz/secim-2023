// @ts-ignore
import React, { FC } from 'react';
import './RegionInfo.css';

interface RegionInfoProps {
    region: string | null;
    regionData: {
        name: string;
        data: {
            red: number;
            yellow: number;
            blue: number;
        };
    };
}

const RegionInfo: FC<RegionInfoProps> = ({ region, regionData }) => {
    if (!region || !regionData) {
        return null;
    }

    const iconMap = {
        red: 'icons/kilictar.png',
        yellow: 'icons/tayyip.png',
        blue: 'icons/muharrem.jpg',
    };

    const sortedData = Object.entries(regionData.data)
        .map(([key, value]) => ({ key, value }))
        .sort((a, b) => a.value - b.value);

    const barStyles = sortedData.map(({ key, value }) => {
        return {
            className: `chart-bar-inner ${key}`,
            style: { width: `${value}%` },
            percentage: value,
            icon: iconMap[key],
        };
    });

    return (
        <div className="region-info">
            <h4>{region}</h4>
            <div className="chart">
                {barStyles.map(({ className, style, percentage, icon }) => (
                    <div className="chart-bar">
                        <span className="chart-bar-icon">
                            <img src={`${process.env.PUBLIC_URL}/${icon}`} alt="" width="24" height="24" />
                        </span>
                        <div className={className} style={style}>
                            {percentage}%
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default RegionInfo;
