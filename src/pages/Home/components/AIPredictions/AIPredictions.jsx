import React from 'react';
import './AIPredictions.css';
import locationIcon from '../../assets/location.png';
import clockIcon from '../../assets/clock.png';

const AIPredictions = () => {
    return (
        <div className="ai-container">
            <div className="ai-header">
                <h3>AI Predictions</h3>
                <span>Next 6 hours</span>
            </div>

            {/* CARD 1 */}
            <div className="ai-card">


                <div className="ai-card-left">
                    <div className="ai-title-row">
                        <h4>Potential Power Outage</h4>
                        <span className="severity-badge high">High</span>
                    </div>
                    <p className="ai-description">Multiple transformer issues reported in HSR Layout area</p>
                </div>

                <div className='cards'>

                <div className="ai-meta">
                    <div classname="location">
                        <img src={locationIcon} alt="loc" />
                    </div>
                    <div className="hours">HSR Layout</div>
                </div>



                <div className="ai-card-right">
                    <div className="confidence">70%<span> confidence</span></div>
                </div>
                <div className="time1">
                    <div><img src={clockIcon} alt="clock" className='timeimg' /> </div>
                    <div>2–4 hours</div>
                </div>


            </div>



                <div className="progress-wrapper">
                    <div className="progress-track">
                        <div className="progress-bar" style={{ width: '70%', backgroundColor: '#ff4d4f' }}></div>
                    </div>
                </div>
            </div>

            {/* CARD 2 */}
            <div className="ai-card">
                <div className="ai-card-left">
                    <div className="ai-title-row">
                        <h4>Traffic Congestion Likely</h4>
                        <span className="severity-badge medium">Medium</span>
                    </div>
                    <p className="ai-description">School closure events typically cause evening congestion</p>
                </div>
                    


                     <div className='cards'>

                <div className="ai-meta">
                    <div classname="location">
                        <img src={locationIcon} alt="loc" />
                    </div>
                    <div className="hours">Electronic City</div>
                </div>



                <div className="ai-card-right">
                    <div className="confidence">85%<span> confidence</span></div>
                </div>
                <div className="time2">
                    <div><img src={clockIcon} alt="clock" className='timeimg' /> </div>
                    <div>5-7 PM</div>
                </div>


            </div>




                <div className="progress-wrapper">
                    <div className="progress-track">
                        <div className="progress-bar" style={{ width: '85%', backgroundColor: '#facc15' }}></div>
                    </div>
                </div>
            </div>

            {/* CARD 3 */}
            <div className="ai-card">
                <div className="ai-card-left">
                    <div className="ai-title-row">
                        <h4>Weather Alert</h4>
                        <span className="severity-badge low">Low</span>
                    </div>
                    <p className="ai-description">Cloud formation suggests possible thunderstorm</p>
                </div>


               <div className='cards'>

                <div className="ai-meta">
                    <div classname="location">
                        <img src={locationIcon} alt="loc" />
                    </div>
                    <div className="hours">North Bangalore</div>
                </div>



                <div className="ai-card-right">
                    <div className="confidence">45%<span> confidence</span></div>
                </div>
                <div className="time3">
                    <div><img src={clockIcon} alt="clock" className='timeimg' /> </div>
                    <div>Next 3 hours</div>
                </div>


            </div>



                <div className="progress-wrapper">
                    <div className="progress-track">
                        <div className="progress-bar" style={{ width: '45%', backgroundColor: '#22c55e' }}></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AIPredictions;
