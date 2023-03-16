// @ts-ignore
import React, { useEffect, FC } from 'react';
import { useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import './ChoroplethMap.css';

function getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

const ChoroplethMap: FC = () => {
    const [selectedRegion, setSelectedRegion] = useState(null);
    const [selectedDistrict, setSelectedDistrict] = useState(null);
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
// Add the provinces layer with province names and colors
            map.addLayer({
                'id': 'provinces',
                'type': 'fill',
                'source': 'turkey_provinces',
                'source-layer': 'tur_polbnda_adm1',
                'minzoom': zoomThreshold,
                'maxzoom': 7,
                'paint': {
                    'fill-color': '#731',
                    'fill-opacity': 0.7,
                    'fill-outline-color': '#731',
                }
            });

// Add the district layer with district names and colors
            map.addLayer({
                'id': 'districts',
                'type': 'fill',
                'source': 'turkey_districts',
                'source-layer': 'tur_polbna_adm2',
                'minzoom': 7,
                'paint': {
                    'fill-color': ['get', 'color'],
                    'fill-opacity': 0.7,
                    'fill-outline-color': '#999',
                }
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

            map.on('mousemove', (e) => {
                // Get the province feature at the mouse cursor
                const [provinceFeature] = map.queryRenderedFeatures(e.point, {
                    layers: ['provinces'],
                });

                if (provinceFeature) {
                    // Set the filter for the province-outline layer to match the province under the cursor
                    // Update the state with the new selected region
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
                    }
                }

            });

        });




        const provinceLegendEl = document.getElementById('province-legend');
        const districtLegendEl = document.getElementById('district-legend');

        map.on('sourcedata', (e) => {
            if (e.sourceId === 'turkey_provinces' && e.isSourceLoaded) {
                const features = map.querySourceFeatures('turkey_provinces');
                features.forEach((feature) => {
                    feature.properties.color = getRandomColor();
                });
            } else if (e.sourceId === 'turkey_districts' && e.isSourceLoaded) {
                const features = map.querySourceFeatures('turkey_districts');
                features.forEach((feature) => {
                    feature.properties.color = getRandomColor();
                });
            }
        });

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

        </div>
    );
};

export default ChoroplethMap;
