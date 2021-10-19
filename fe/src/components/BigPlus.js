import React from 'react'
import "./BigPlus.css"
export default function BigPlus(props) {
    return (
        <div className="circle" style={{
            "--circle_color": props?.circleColor || 'grey',
            "--circle-radius": props?.circleRadius || '30px',
            "--circle_diameter": props?.circleDiameter || '100px',
            "--cross_length": props?.crossLength || '70%',
            "--cross_height": props?.crossHeight || '10%',
            "--cross_color": props?.crossColor || 'white'
        }}>
            <div className="vertical_bar centered"></div>
            <div className="horizontal_bar centered"></div>
        </div>
    )
}