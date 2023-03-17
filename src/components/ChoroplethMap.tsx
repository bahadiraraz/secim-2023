// @ts-ignore
import React, { useEffect, FC } from 'react';
import { useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import './ChoroplethMap.css';
// @ts-ignore
import RegionInfo from './RegionInfo.tsx';


const ChoroplethMap: FC = () => {
    const [selectedRegion, setSelectedRegion] = useState(null);
    const [selectedDistrict, setSelectedDistrict] = useState(null);
    const [regionData, setRegionData] = useState(null);
    const [regionColors, setRegionColors] = useState({});
    const [districtColors, setDistrictColors] = useState({});
    const generateRegionColors = (provincesFeatures, districtsFeatures, type) => {
        const colors = {};

        if (type === "province") {
            provincesFeatures.forEach((feature) => {
                const provinceId = feature.properties.adm1;
                colors[provinceId] = generateRandomColor();
            });
        } else if (type === "district") {
            districtsFeatures.forEach((feature) => {
                const districtId = feature.properties.OBJECTID;
                colors[districtId] = generateRandomColor();
            });
        }

        return colors;
    };



    const assignProvinceColors = (map, colors) => {
        map.setPaintProperty('provinces', 'fill-color', [
            'match',
            ['get', 'adm1'],
            ...[].concat(
                ...Object.entries(colors).map(([code, color]) => [code, color])
            ),
            '#ccc' // fallback color for unmatched provinces
        ]);
    };

    const assignDistrictColors = (map, colors) => {
        map.setPaintProperty('districts', 'fill-color', [
            'match',
            ['get', 'OBJECTID'],
            ...[].concat(
                ...Object.entries(colors).map(([code, color]) => [code, color])
            ),
            '#ccc' // fallback color for unmatched districts
        ]);
    };



    const generateRandomColor = () => {
        const party = Math.floor(Math.random() * 3);
        if (party === 0) {
            return '#D71920'; // CHP (Red)
        } else if (party === 1) {
            return '#FDC400'; // AKP (Yellow)
        } else {
            return '#00ADEF'; // Millet Partisi (Blue)
        }
    };

    useEffect(() => {
        mapboxgl.accessToken = 'pk.eyJ1IjoiYmFoYWRpcnMiLCJhIjoiY2xmODgweThvMHloejN5cGNzb3YweHEwbCJ9.YETxjRCm89gcEnvasviDcQ';

        const map = new mapboxgl.Map({
            container: 'map',
            style: 'mapbox://styles/bahadirs/clfa0lqa400ja01ml5ho2vg7z',
            center: [35.2433, 38.9637],
            minZoom: 5,
            zoom: 5,
        });


        const zoomThreshold = 2;

        map.on('load', () => {

            // Türkiye'nin illeri için kaynak ekleyin
            map.addSource('turkey_provinces', {
                'type': 'vector',
                'url': 'mapbox://bahadirs.53uqem5d'
            });

            map.addSource('turkey_provinces_center_points', {
                'type': 'vector',
                'url': 'mapbox://bahadirs.arb9as5p'
            });


            map.addSource('turkey_districts', {
                'type': 'vector',
                'url': 'mapbox://bahadirs.7zgco0o0'
            });

            map.addSource('turkey_districts_center_points', {
                'type': 'vector',
                'url': 'mapbox://bahadirs.10m5bvn0'
            });


            map.addLayer({
                'id': 'province-outline',
                'type': 'line',
                'source': 'turkey_provinces',
                'source-layer': 'tur_polbnda_adm1',
                'filter': ['==', 'adm1_tr', ''],
                'paint': {
                    'line-color': '#FF0000',
                    'line-width': 3,
                },
            });
            map.addLayer({
                'id': 'provinces',
                'type': 'fill',
                'source': 'turkey_provinces',
                'source-layer': 'tur_polbnda_adm1',
                'minzoom': zoomThreshold,
                'maxzoom': 7,
                'paint': {
                    'fill-color': ['to-color', ['concat', '#', ['get', 'adm1_tr']]],
                    'fill-opacity': 0.7,
                    'fill-outline-color': '#731',
                },
            });



            map.addLayer({
                'id': 'districts',
                'type': 'fill',
                'source': 'turkey_districts',
                'source-layer': 'tur_polbna_adm2',
                'minzoom': 7,
                'paint': {
                    'fill-color': ['to-color', ['concat', '#', ['get', 'OBJECTID']]],
                    'fill-opacity': 0.7,
                    'fill-outline-color': '#999',
                },
            });

// Add province names layer
            map.addLayer({
                'id': 'province-names',
                'type': 'symbol',
                'source': 'turkey_provinces_center_points',
                'source-layer': 'tur_pntcntr_adm1-99nciq', // Change this to the correct source layer name for province center points
                'minzoom': zoomThreshold,
                'maxzoom': 7,
                'layout': {
                    'text-field': ['get', 'adm1_tr'],
                    'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
                    'text-size': 14
                },
                'paint': {
                    'text-color': '#000',
                    'text-halo-color': '#fff',
                    'text-halo-width': 1.5,
                }
            });

// Add district names layer
            map.addLayer({
                'id': 'district-names',
                'type': 'symbol',
                'source': 'turkey_districts_center_points',
                'source-layer': 'tur_pntcntr_adm2-ck1v5w', // Change this to the correct source layer name for district center points
                'minzoom': 7,
                'layout': {
                    'text-field': ['get', 'adm2_tr'],
                    'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
                    'text-size': 14,
                },
                'paint': {
                    'text-color': '#000',
                    'text-halo-color': '#fff',
                    'text-halo-width': 1.5,
                }
            });
            map.addLayer({
                'id': 'district-outline',
                'type': 'line',
                'source': 'turkey_districts',
                'source-layer': 'tur_polbna_adm2',
                'minzoom': 7,
                'filter': ['==', 'adm2_tr', ''], // Initial filter to not highlight any district
                'paint': {
                    'line-color': '#FF0000',
                    'line-width': 3,
                },
            });
            let provincesAssigned = false;
            let districtsAssigned = false;



            map.on('sourcedata', (e) => {
                if (e.isSourceLoaded) {
                    if (!provincesAssigned && e.sourceId === 'turkey_provinces' && map.isSourceLoaded('turkey_districts')) {
                        const provincesFeatures = map.querySourceFeatures('turkey_provinces', {
                            sourceLayer: 'tur_polbnda_adm1',
                        });

                        const colors = generateRegionColors(provincesFeatures, [], "province");
                        setRegionColors(colors);

                        assignProvinceColors(map, colors);
                        provincesAssigned = true;
                    }

                    if (!districtsAssigned && e.sourceId === 'turkey_districts' && map.isSourceLoaded('turkey_provinces')) {
                        const districtsFeatures = map.querySourceFeatures('turkey_districts', {
                            sourceLayer: 'tur_polbnda_adm2',
                        });

                        const colors = generateRegionColors([], districtsFeatures, "district");
                        setDistrictColors(colors);

                        assignDistrictColors(map, colors);
                        districtsAssigned = true;
                    }
                }
            });




            map.on('mousemove', (e) => {
                // Get the province feature at the mouse cursor
                const [provinceFeature] = map.queryRenderedFeatures(e.point, {
                    layers: ['provinces'],
                });
                if (provinceFeature) {
                    setSelectedRegion(provinceFeature.properties.adm1_tr);

                    // Set the filter for the province-outline layer to match the clicked province
                    map.setFilter('province-outline', [
                        '==',
                        'adm1_tr',
                        provinceFeature.properties.adm1_tr,
                    ]);

                    map.setPaintProperty('province-outline', 'line-color', '#FF0000');
                    map.setPaintProperty('province-outline', 'line-width', 3);

                    map.setFilter('districts', [
                        '==',
                        'adm1_tr',
                        provinceFeature.properties.adm1_tr,
                    ]);
                    map.setFilter('district-names', [
                        '==',
                        'adm1_tr',
                        provinceFeature.properties.adm1_tr,
                    ]);

                } else {
                    // Reset the filter for the province-outline layer if there's no province under the cursor
                    map.setFilter('province-outline', ['==', 'adm1_tr', '']);
                }
            });
            map.on('mouseout', () => {
                // Reset the filter for the province-outline layer
                map.setFilter('province-outline', ['==', 'adm1_tr', '']);
            });

            // Add a click event listener
            map.on('click', (e) => {
                // Get the province feature at the clicked point
                const [provinceFeature] = map.queryRenderedFeatures(e.point, {
                    layers: ['provinces'],
                });

                if (provinceFeature) {
                    // Update the state with the new selected region
                    setSelectedRegion(provinceFeature.properties.adm1_tr);

                    // Set the filter for the province-outline layer to match the clicked province
                    map.setFilter('province-outline', [
                        '==',
                        'adm1_tr',
                        provinceFeature.properties.adm1_tr,
                    ]);

                    // Update the paint properties for the province-outline layer
                    map.setPaintProperty('province-outline', 'line-color', '#FF0000');
                    map.setPaintProperty('province-outline', 'line-width', 3);

                    map.setFilter('districts', [
                        '==',
                        'adm1_tr',
                        provinceFeature.properties.adm1_tr,
                    ]);
                    map.setFilter('district-names', [
                        '==',
                        'adm1_tr',
                        provinceFeature.properties.adm1_tr,
                    ]);
                    // Generate random data for the selected region
                    const randomData = generateRandomData();
                    setRegionData({
                        name: provinceFeature.properties.adm1_tr,
                        data: randomData,
                    });
                }
                else {
                    // Get the district feature at the clicked point
                    const [districtFeature] = map.queryRenderedFeatures(e.point, {
                        layers: ['districts'],
                    });

                    if (districtFeature) {
                        // Update the state with the new selected region
                        setSelectedRegion(districtFeature.properties.adm2_tr);

                        // Set the filter for the district-outline layer to match the clicked district
                        map.setFilter('district-outline', [
                            '==',
                            'adm2_tr',
                            districtFeature.properties.adm2_tr,
                        ]);

                        // Update the paint properties for the district-outline layer
                        map.setPaintProperty('district-outline', 'line-color', '#FF0000');
                        map.setPaintProperty('district-outline', 'line-width', 3);

                        // Generate random data for the selected region
                        const randomData = generateRandomData();
                        setRegionData({
                            name: districtFeature.properties.adm2_tr,
                            data: randomData,
                        });
                    }
                }

            });

        });



        // Function to generate random data for the regions
        const generateRandomData = () => {
            const value1 = Math.floor(Math.random() * 100);
            const value2 = Math.floor(Math.random() * (100 - value1));
            const value3 = 100 - value1 - value2;
            return { red: value1, yellow: value2, blue: value3 };
        };

        const provinceLegendEl = document.getElementById('province-legend');
        const districtLegendEl = document.getElementById('district-legend');


        map.on('zoom', () => {
            const currentZoom = map.getZoom();
            if (currentZoom <= 7) {
                setSelectedDistrict(null);
                map.setFilter('district-outline', ['==', 'adm2_tr', '']);
            }
            if (map.getZoom() > zoomThreshold) {
                provinceLegendEl.style.display = 'none';
                districtLegendEl.style.display = 'block';
            } else {
                provinceLegendEl.style.display = 'block';
                districtLegendEl.style.display = 'none';
            }
        });

    }, []);

    return (
        <div>
            <div id="map" style={{ position: 'absolute', top: 0, bottom: 0, width: '100%' }}></div>

            {/* İller için efsane */}
            <div id="province-legend" className="legend">
                <h4>İl Nüfusu</h4>
                {/* Renkler ve değerlerle eşleşen efsane girdileri ekleyin */}
                <div><span style={{ backgroundColor: '#8B4225' }}></span>Örnek Değer 1</div>
                <div><span style={{ backgroundColor: '#A25626' }}></span>Örnek Değer 2</div>
                {/* ... */}
            </div>

            {/* İlçeler için efsane */}
            <div id="district-legend" className="legend" style={{ display: 'none' }}>
                <h4>İlçe Nüfusu</h4>
                {/* Renkler ve değerlerle eşleşen efsane girdileri ekleyin */}
                <div><span style={{ backgroundColor: '#B86B25' }}></span>Örnek Değer 1</div>
                <div><span style={{ backgroundColor: '#CA8323' }}></span>Örnek Değer 2</div>
                {/* ... */}
            </div>
            <RegionInfo region={selectedRegion} regionData={regionData} />
        </div>
    );
};

export default ChoroplethMap;
