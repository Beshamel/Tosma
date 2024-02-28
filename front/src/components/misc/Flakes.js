import { range } from '../../Util'
import '../../styles/misc/Flakes.css'

import flake from '../../assets/misc/snowflake.svg'
import { useState } from 'react'

function Flakes() {
    var [flakes] = useState(
        range(20).map((v) => {
            return {
                i: v,
                offsetX: Math.floor(Math.random() * 5) + 5 * v,
                delay1: Math.floor(Math.random() * 50) / 10,
                delay2: -Math.floor(Math.random() * 40) / 10,
                delay3: -Math.floor(Math.random() * 100) / 10,
                size: Math.random() * 50 + 10,
            }
        })
    )
    return (
        <div class="snowflakes" aria-hidden="true">
            {flakes.map((f, k) => (
                <div class="snowflake" key={k} style={{ left: f.offsetX + '%', animationDelay: f.delay1 + 's' }}>
                    <div className="inner" style={{ animationDelay: f.delay2 + 's' }}>
                        <img
                            src={flake}
                            alt=""
                            className="alertIcon"
                            style={{ animationDelay: f.delay3 + 's', width: f.size + 'px', height: f.size + 'px' }}
                        ></img>
                    </div>
                </div>
            ))}
        </div>
    )
}

export default Flakes
