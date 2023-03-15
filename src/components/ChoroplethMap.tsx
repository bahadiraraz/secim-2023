// @ts-ignore
import React, { useEffect, FC } from 'react';
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
                'url': 'mapbox://bahadirs.7uvvww63'
            });

            // Türkiye'nin ilçeleri için kaynak ekleyin
            map.addSource('turkey_districts', {
                'type': 'vector',
                'url': 'mapbox://bahadirs.alp6dwmy'
            });
            // İller için isim katmanını ekleyin
            map.addLayer({
                'id': 'province-label',
                'type': 'symbol',
                'source': 'turkey_provinces',
                'source-layer': 'turkey-admin-level-4-4mfg47', // İl katman adınızı yazın
                'minzoom': zoomThreshold,
                'layout': {
                    'text-field': ['get', 'name'],
                    'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
                    'text-size': 12
                },
                'paint': {
                    'text-color': '#000'
                }
            });

// İlçeler için isim katmanını ekleyin
            map.addLayer({
                'id': 'district-label',
                'type': 'symbol',
                'source': 'turkey_districts',
                'source-layer': 'turkey-admin-level-6-555nyr', // İlçe katman adınızı yazın
                'minzoom': zoomThreshold,
                'layout': {
                    'text-field': ['get', 'name'],
                    'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
                    'text-size': 12
                },
                'paint': {
                    'text-color': '#000'
                }
            });

            // İller için katmanı ekleyin
            map.addLayer({
                'id': 'province-fill',
                'source': 'turkey_provinces',
                'source-layer': 'turkey-admin-level-4-4mfg47', // İl katman adınızı yazın
                'minzoom': zoomThreshold,
                'type': 'line',
                'paint': {
                    'line-color': '#555',
                    'line-width': 1,
                }
            });


            // İlçeler için katmanı ekleyin
            map.addLayer({
                'id': 'district-outline',
                'source': 'turkey_districts',
                'source-layer': 'turkey-admin-level-6-555nyr', // İlçe katman adınızı yazın
                'minzoom': zoomThreshold,
                'maxzoom': 12,
                'type': 'line',
                'paint': {
                    'line-color': '#000',
                    'line-width': 1,
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
