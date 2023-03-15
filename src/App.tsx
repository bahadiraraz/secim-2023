// @ts-ignore
import React, { FC } from 'react';
// @ts-ignore
import logo from './logo.svg'; // Importing logo image from the specified file path in the project.
import './App.css'; // Importing styles for the App component from the specified css file.
// @ts-ignore
import ChoroplethMap from './components/ChoroplethMap.tsx'; // Importing the ChoroplethMap component from the specified file path in the project.
const value = "selamss"; // Creating a variable named value and assigning it the value "selamss".
const x = true; // Creating a variable named x and assigning it the value true.
const App: FC = () => { // A function that returns JSX (JavaScript XML) content which is used to create HTML-like structures in React.
    return (
        <div className="container"> {/* Creating a div with a className of "App" */}
            <h1>Map</h1>
            <ChoroplethMap />
        </div>
    );
}

export default App; // Exporting the App component so it can be used in other parts of the application.
